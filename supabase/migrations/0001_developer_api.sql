-- Namu developer API: accounts, API keys and usage.
--
-- Apply in the Supabase SQL editor (or `supabase db push`). Safe to read top to bottom:
--   profiles      one row per signed-up developer, created by trigger; beta approval lives here
--   api_keys      only an HMAC of each key is stored, never the key itself
--   usage_events  seconds, characters and status codes; never audio or text
-- Writes to api_keys and usage_events happen only through the service role (website server
-- routes and the Modal gateway). Signed-in users can READ their own rows, nothing more.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- profiles
create table if not exists public.profiles (
  user_id               uuid primary key references auth.users(id) on delete cascade,
  email                 text,
  beta_status           text not null default 'pending' check (beta_status in ('pending', 'approved', 'denied')),
  role                  text not null default 'user'    check (role in ('user', 'admin')),
  use_case              text check (char_length(use_case) <= 1000),
  monthly_audio_seconds integer not null default 1800 check (monthly_audio_seconds >= 0),  -- 30 min
  created_at            timestamptz not null default now(),
  reviewed_at           timestamptz
);

-- Every new auth user gets a pending profile.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, email) values (new.id, new.email)
  on conflict (user_id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Admin check used by policies. SECURITY DEFINER so it can read profiles under RLS.
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where user_id = auth.uid() and role = 'admin')
$$;

-- ---------------------------------------------------------------- api_keys
create table if not exists public.api_keys (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.profiles(user_id) on delete cascade,
  name               text not null check (char_length(name) between 1 and 60),
  prefix             text not null,                       -- e.g. namu_sk_Ab3x, shown in the dashboard
  key_hash           text not null unique,                -- HMAC-SHA256(pepper, key), hex
  scopes             text[] not null default array['transcribe','speech','translate','converse']
                     check (scopes <@ array['transcribe','speech','translate','converse']),
  is_demo            boolean not null default false,      -- the website's server-held demo key
  rate_limit_per_min integer not null default 60 check (rate_limit_per_min between 1 and 10000),
  created_at         timestamptz not null default now(),
  last_used_at       timestamptz,
  revoked_at         timestamptz
);
create index if not exists api_keys_user_idx on public.api_keys (user_id);

-- ---------------------------------------------------------------- usage_events
create table if not exists public.usage_events (
  id            bigint generated always as identity primary key,
  key_id        uuid references public.api_keys(id) on delete set null,
  user_id       uuid not null references public.profiles(user_id) on delete cascade,
  endpoint      text not null,
  model         text not null,
  audio_seconds numeric(10, 3) not null default 0,
  characters    integer not null default 0,
  status        integer not null,
  latency_ms    integer not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists usage_user_month_idx on public.usage_events (user_id, created_at);

-- ---------------------------------------------------------------- row-level security
alter table public.profiles     enable row level security;
alter table public.api_keys     enable row level security;
alter table public.usage_events enable row level security;

drop policy if exists "own profile"   on public.profiles;
drop policy if exists "admin profiles" on public.profiles;
create policy "own profile"    on public.profiles for select using (user_id = auth.uid());
create policy "admin profiles" on public.profiles for select using (public.is_admin());

drop policy if exists "own keys" on public.api_keys;
create policy "own keys" on public.api_keys for select using (user_id = auth.uid());

drop policy if exists "own usage" on public.usage_events;
create policy "own usage" on public.usage_events for select using (user_id = auth.uid());
-- No insert/update/delete policies: signed-in users cannot write any of these tables directly.

-- Even the owner never needs the stored hash, so hide that column from the browser roles.
-- A column-level REVOKE alone does nothing while the role holds table-level SELECT (which
-- Supabase grants by default), so take the table grant away and give back named columns.
revoke select on public.api_keys from anon, authenticated;
grant select (id, user_id, name, prefix, scopes, is_demo, rate_limit_per_min,
              created_at, last_used_at, revoked_at)
  on public.api_keys to authenticated;
-- Same reasoning: nobody writes these tables from the browser.
revoke insert, update, delete on public.profiles, public.api_keys, public.usage_events
  from anon, authenticated;

-- ---------------------------------------------------------------- gateway functions
-- One round trip per uncached key: the key, its owner's status and this month's usage.
create or replace function public.namu_key_lookup(p_hash text)
returns table (key_id uuid, user_id uuid, scopes text[], revoked boolean, is_demo boolean,
               rate_limit_per_min integer, beta_status text, monthly_audio_seconds integer,
               used_audio_seconds numeric)
language sql stable security definer set search_path = public as $$
  select k.id, k.user_id, k.scopes, k.revoked_at is not null, k.is_demo, k.rate_limit_per_min,
         p.beta_status, p.monthly_audio_seconds,
         coalesce((select sum(u.audio_seconds) from public.usage_events u
                   where u.user_id = k.user_id
                     and u.created_at >= date_trunc('month', now())), 0)
  from public.api_keys k join public.profiles p on p.user_id = k.user_id
  where k.key_hash = p_hash
$$;

create or replace function public.namu_record_usage(
  p_key_id uuid, p_user_id uuid, p_endpoint text, p_model text, p_audio_seconds numeric,
  p_characters integer, p_status integer, p_latency_ms integer)
returns void
language plpgsql security definer set search_path = public as $$
begin
  insert into public.usage_events (key_id, user_id, endpoint, model, audio_seconds, characters, status, latency_ms)
  values (p_key_id, p_user_id, p_endpoint, p_model, p_audio_seconds, p_characters, p_status, p_latency_ms);
  update public.api_keys set last_used_at = now() where id = p_key_id;
end $$;

-- Only the service role (gateway) may call these.
revoke all on function public.namu_key_lookup(text) from public, anon, authenticated;
revoke all on function public.namu_record_usage(uuid, uuid, text, text, numeric, integer, integer, integer)
  from public, anon, authenticated;
grant execute on function public.namu_key_lookup(text) to service_role;
grant execute on function public.namu_record_usage(uuid, uuid, text, text, numeric, integer, integer, integer)
  to service_role;

-- ---------------------------------------------------------------- bootstrap (run once, by hand)
-- After you sign up on the website with your own email, make yourself the first admin:
--   update public.profiles set role = 'admin', beta_status = 'approved', reviewed_at = now()
--   where email = 'you@example.org';
-- Then create a key named "website demo" in the dashboard and mark it as the demo key:
--   update public.api_keys set is_demo = true, scopes = array['transcribe','speech','translate']
--   where name = 'website demo';
