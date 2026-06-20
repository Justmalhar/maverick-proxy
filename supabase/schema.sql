-- Maverick managed backend — Supabase schema (Phase 1)
-- Run in the Supabase SQL editor (or via `supabase db push`).

-- USERS / PROFILES ---------------------------------------------------------
-- One row per signed-in Apple user. `apple_sub` is the stable Apple subject id.
create table if not exists public.profiles (
    id           uuid primary key default gen_random_uuid(),
    apple_sub    text unique not null,
    email        text,
    display_name text,
    tier         text not null default 'free',     -- 'free' | 'pro'
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now()
);

-- ENTITLEMENTS -------------------------------------------------------------
-- Set by the RevenueCat webhook in Phase 2. One active row per user.
create table if not exists public.entitlements (
    id              uuid primary key default gen_random_uuid(),
    user_id         uuid not null references public.profiles(id) on delete cascade,
    product_id      text,
    is_active       boolean not null default false,
    expires_at      timestamptz,
    daily_message_limit int not null default 50,    -- overrides the env default
    updated_at      timestamptz not null default now(),
    unique (user_id)
);

-- USAGE (rollup) -----------------------------------------------------------
-- Per-user, per-day counters. Detailed per-request events go to Tinybird.
create table if not exists public.usage_daily (
    user_id      uuid not null references public.profiles(id) on delete cascade,
    day          date not null,
    messages     int not null default 0,
    prompt_tokens   bigint not null default 0,
    completion_tokens bigint not null default 0,
    primary key (user_id, day)
);

-- RLS: all access is via the service role from the proxy, so lock down direct
-- access from anon/auth keys.
alter table public.profiles      enable row level security;
alter table public.entitlements  enable row level security;
alter table public.usage_daily   enable row level security;
-- (No permissive policies => only the service role key can read/write.)

create index if not exists idx_usage_daily_day on public.usage_daily(day);
