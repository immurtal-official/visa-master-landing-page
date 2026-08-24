-- Keep a human-readable copy for private-beta administration. This column is
-- intentionally nullable because existing HMAC digests cannot be reversed.
alter table public.invite_phrases
  add column if not exists phrase text;

alter table public.invite_phrases
  drop constraint if exists invite_phrases_phrase_format;

alter table public.invite_phrases
  add constraint invite_phrases_phrase_format check (
    phrase is null
    or (
      char_length(phrase) between 6 and 160
      and phrase = upper(trim(regexp_replace(phrase, '\s+', ' ', 'g')))
    )
  );

comment on column public.invite_phrases.phrase is
  'Plaintext administrative copy of the case-insensitive invite phrase. Never expose to client roles.';

revoke all on table public.invite_phrases from anon, authenticated;
