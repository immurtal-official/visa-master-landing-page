-- Upgrade every invite phrase to belong to one person. Existing unlimited or multi-use
-- phrases become consumed as soon as they have at least one redemption.
update public.invite_phrases
set max_redemptions = 1,
    updated_at = now()
where max_redemptions is distinct from 1;

alter table public.invite_phrases
  alter column max_redemptions set default 1,
  alter column max_redemptions set not null;

alter table public.invite_phrases
  drop constraint if exists invite_phrases_max_redemptions;

alter table public.invite_phrases
  add constraint invite_phrases_max_redemptions check (max_redemptions = 1);

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

  -- Lock the phrase row so only one email can claim it, even when two
  -- redemption requests arrive at the same time.
  select * into matched_phrase
  from public.invite_phrases
  where phrase_digest = p_phrase_digest
  for update;

  -- Retrying the same phrase for the email that already claimed it is safe
  -- and idempotent. The phrase remains unavailable to every other email.
  if matched_phrase.id is not null then
    select status into member_status
    from public.early_access_members
    where email = lower(trim(p_email))
      and invite_phrase_id = matched_phrase.id
    for update;

    if found and member_status in ('authorized', 'joined') then
      return jsonb_build_object('status', 'authorized');
    end if;
  end if;

  if matched_phrase.id is null
    or matched_phrase.active is not true
    or matched_phrase.redemption_count >= matched_phrase.max_redemptions then
    insert into public.invite_phrase_failures (ip_digest) values (p_ip_digest);
    return jsonb_build_object(
      'status', 'invalid',
      'attempts_remaining', greatest(0, 4 - failure_count)
    );
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
