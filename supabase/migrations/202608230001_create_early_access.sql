-- Initial private-beta schema for waitlist membership and invite redemption.
create table if not exists public.invite_phrases (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  phrase_digest text not null unique,
  active boolean not null default true,
  max_redemptions integer,
  redemption_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invite_phrases_digest_format check (phrase_digest ~ '^[0-9a-f]{64}$'),
  constraint invite_phrases_max_redemptions check (max_redemptions is null or max_redemptions > 0),
  constraint invite_phrases_redemption_count check (redemption_count >= 0)
);

create table if not exists public.early_access_members (
  email text primary key,
  status text not null default 'waitlisted',
  invite_phrase_id uuid references public.invite_phrases (id) on delete set null,
  user_id uuid unique references auth.users (id) on delete set null,
  waitlisted_at timestamptz not null default now(),
  authorized_at timestamptz,
  joined_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint early_access_members_normalized_email check (email = lower(trim(email))),
  constraint early_access_members_status check (status in ('waitlisted', 'authorized', 'joined')),
  constraint early_access_members_authorization check (
    (status = 'waitlisted' and authorized_at is null)
    or (status in ('authorized', 'joined') and authorized_at is not null)
  )
);

create table if not exists public.invite_phrase_failures (
  id bigint generated always as identity primary key,
  ip_digest text not null,
  attempted_at timestamptz not null default now(),
  constraint invite_phrase_failures_digest_format check (ip_digest ~ '^[0-9a-f]{64}$')
);

create index if not exists invite_phrase_failures_ip_time_idx
  on public.invite_phrase_failures (ip_digest, attempted_at desc);

alter table public.invite_phrases enable row level security;
alter table public.early_access_members enable row level security;
alter table public.invite_phrase_failures enable row level security;

revoke all on table public.invite_phrases from anon, authenticated;
revoke all on table public.early_access_members from anon, authenticated;
revoke all on table public.invite_phrase_failures from anon, authenticated;

create or replace function public.redeem_invite_phrase(
  p_email text,
  p_phrase_digest text,
  p_ip_digest text
)
returns jsonb
language plpgsql
security definer set search_path = ''
as $$
declare
  failure_count integer;
  matched_phrase public.invite_phrases%rowtype;
  member_status text;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_ip_digest, 0));
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('email:' || lower(trim(p_email)), 0)
  );

  delete from public.invite_phrase_failures
  where attempted_at < now() - interval '7 days';

  select count(*) into failure_count
  from public.invite_phrase_failures
  where ip_digest = p_ip_digest
    and attempted_at >= now() - interval '24 hours';

  if failure_count >= 5 then
    return jsonb_build_object('status', 'rate_limited');
  end if;

  select * into matched_phrase
  from public.invite_phrases
  where phrase_digest = p_phrase_digest
    and active = true
    and (max_redemptions is null or redemption_count < max_redemptions)
  for update;

  if not found then
    insert into public.invite_phrase_failures (ip_digest) values (p_ip_digest);
    return jsonb_build_object(
      'status', 'invalid',
      'attempts_remaining', greatest(0, 4 - failure_count)
    );
  end if;

  select status into member_status
  from public.early_access_members
  where email = lower(trim(p_email))
  for update;

  if found and member_status in ('authorized', 'joined') then
    return jsonb_build_object('status', 'authorized');
  end if;

  insert into public.early_access_members (
    email,
    status,
    invite_phrase_id,
    authorized_at,
    updated_at
  ) values (
    lower(trim(p_email)),
    'authorized',
    matched_phrase.id,
    now(),
    now()
  )
  on conflict (email) do update set
    status = 'authorized',
    invite_phrase_id = excluded.invite_phrase_id,
    authorized_at = excluded.authorized_at,
    updated_at = excluded.updated_at;

  update public.invite_phrases
  set redemption_count = redemption_count + 1,
      updated_at = now()
  where id = matched_phrase.id;

  return jsonb_build_object('status', 'authorized');
end;
$$;

revoke execute on function public.redeem_invite_phrase(text, text, text) from public, anon, authenticated;
grant execute on function public.redeem_invite_phrase(text, text, text) to service_role;

create or replace function public.hook_require_early_access(event jsonb)
returns jsonb
language plpgsql
security definer set search_path = ''
as $$
declare
  candidate_email text;
begin
  candidate_email := lower(trim(event->'user'->>'email'));

  update public.early_access_members
  set status = 'joined',
      joined_at = coalesce(joined_at, now()),
      updated_at = now()
  where email = candidate_email
    and status = 'authorized'
    and user_id is null;

  if not found then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 403,
        'message', 'An invite phrase is required to create a Visa Master account.'
      )
    );
  end if;

  return '{}'::jsonb;
end;
$$;

grant execute on function public.hook_require_early_access(jsonb) to supabase_auth_admin;
revoke execute on function public.hook_require_early_access(jsonb) from public, anon, authenticated;

create or replace function public.handle_early_access_user_created()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  update public.early_access_members
  set user_id = new.id,
      updated_at = now()
  where email = lower(trim(new.email))
    and status = 'joined'
    and user_id is null;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_early_access on auth.users;
create trigger on_auth_user_created_early_access
  after insert on auth.users
  for each row execute procedure public.handle_early_access_user_created();

revoke execute on function public.handle_early_access_user_created() from public, anon, authenticated;
