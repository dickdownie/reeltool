-- Reel Tool, migration 001: the first set of tables, for Supabase (PostgreSQL).
-- Run once in the Supabase SQL Editor on a new project.
--
-- Access rule: every table that holds customer data carries company_id, and row
-- level security lets a signed-in person see and change only their own company's
-- rows. Someone who signs up without an invite belongs to no company and sees nothing.

create table companies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);

-- A person who signs in. The id is the same id Supabase sign-in gives them.
create table members (
  id          uuid primary key references auth.users(id) on delete cascade,
  company_id  uuid not null references companies(id),
  email       text not null unique,
  name        text,
  role        text not null default 'rep' check (role in ('owner', 'rep')),
  created_at  timestamptz not null default now()
);

-- An email address that is allowed to join a company the next time it signs up.
create table invites (
  email       text primary key,
  company_id  uuid not null references companies(id),
  role        text not null default 'rep' check (role in ('owner', 'rep')),
  created_at  timestamptz not null default now()
);

create table directors (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references companies(id),
  name        text not null,
  created_at  timestamptz not null default now()
);

-- One commercial. The video itself lives with the video service; video_ref points to it.
create table spots (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references companies(id),
  director_id   uuid not null references directors(id),
  brand         text,
  title         text not null,
  year          int,
  length_secs   int,
  formats       text[] not null default '{}',     -- '16x9', '9x16', ...
  media         text[] not null default '{}',     -- 'TV', 'Social', ...
  video_ref     text,
  thumbnail_ref text,
  created_at    timestamptz not null default now()
);

-- What the AI recorded about a spot. Kept as versions so the method can change
-- and old reads can be compared with new ones.
create table spot_analyses (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references companies(id),
  spot_id     uuid not null references spots(id) on delete cascade,
  method      text not null,                      -- which version of the analysis produced this
  transcript  text,
  summary     text,
  attributes  jsonb not null default '{}',        -- joke type, performance style, pacing, cast, scale, techniques...
  tags        text[] not null default '{}',
  created_at  timestamptz not null default now()
);

-- What only the company knows about a spot.
create table spot_notes (
  spot_id      uuid primary key references spots(id) on delete cascade,
  company_id   uuid not null references companies(id),
  budget_tier  text,
  union_status text,
  notes        text,
  updated_at   timestamptz not null default now()
);

create table agencies (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references companies(id),
  name        text not null,
  notes       text
);

create table briefs (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references companies(id),
  agency_id     uuid references agencies(id),
  client        text,
  title         text not null,
  body          text,                             -- the brief as received
  reading       jsonb not null default '{}',      -- the AI's read: category, tone, deliverables, references
  received_on   date,
  created_at    timestamptz not null default now()
);

-- A reel sent for a brief.
create table submissions (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references companies(id),
  brief_id    uuid not null references briefs(id),
  director_id uuid references directors(id),
  sent_by     uuid references members(id),
  sent_at     timestamptz,
  share_ref   text,
  outcome     text not null default 'pending'     -- 'pending' | 'no_response' | 'shortlisted' | 'awarded' | 'passed'
);

-- The spots in a reel, in order, with the reason each was picked and whether a
-- person swapped it in or out. The swaps are data for the method.
create table submission_spots (
  submission_id uuid not null references submissions(id) on delete cascade,
  spot_id       uuid not null references spots(id),
  company_id    uuid not null references companies(id),
  position      int not null,
  reason        text,
  proposed_by   text not null default 'system',   -- 'system' | 'person'
  swap_note     text,
  primary key (submission_id, spot_id)
);

-- What happened after a reel was sent, one row per event.
create table results (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references companies(id),
  submission_id uuid not null references submissions(id) on delete cascade,
  spot_id       uuid references spots(id),        -- null when the event is about the whole reel
  kind          text not null,                    -- 'opened' | 'watched' | 'rewatched' | 'feedback' | 'shortlisted' | 'awarded'
  seconds       int,
  note          text,
  source        text not null default 'manual',   -- 'manual' | a platform name
  happened_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Sign-up: decide which company a new person belongs to.
--   1. An invite exists for their email: they join that company with that role.
--   2. Nobody has joined yet at all: they become the owner of a new company
--      named "Fox Den". This is how the very first account is created.
--   3. Otherwise: they get no company and can see nothing.
-- ---------------------------------------------------------------------------
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  inv public.invites%rowtype;
  new_company uuid;
begin
  select * into inv from public.invites where lower(email) = lower(new.email);
  if found then
    insert into public.members (id, company_id, email, role)
      values (new.id, inv.company_id, new.email, inv.role);
    delete from public.invites where email = inv.email;
  elsif not exists (select 1 from public.members) then
    insert into public.companies (name) values ('Fox Den') returning id into new_company;
    insert into public.members (id, company_id, email, role)
      values (new.id, new_company, new.email, 'owner');
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- The signed-in person's company. Used by every access rule below.
create function public.my_company_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select company_id from public.members where id = auth.uid()
$$;

create function public.i_am_owner() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.members where id = auth.uid() and role = 'owner')
$$;

-- ---------------------------------------------------------------------------
-- Row level security: on for every table, own company only.
-- ---------------------------------------------------------------------------
alter table companies        enable row level security;
alter table members          enable row level security;
alter table invites          enable row level security;
alter table directors        enable row level security;
alter table spots            enable row level security;
alter table spot_analyses    enable row level security;
alter table spot_notes       enable row level security;
alter table agencies         enable row level security;
alter table briefs           enable row level security;
alter table submissions      enable row level security;
alter table submission_spots enable row level security;
alter table results          enable row level security;

create policy "see own company" on companies for select to authenticated
  using (id = public.my_company_id());

create policy "see own colleagues" on members for select to authenticated
  using (company_id = public.my_company_id());

create policy "owners manage invites" on invites for all to authenticated
  using (company_id = public.my_company_id() and public.i_am_owner())
  with check (company_id = public.my_company_id() and public.i_am_owner());

create policy "own company only" on directors for all to authenticated
  using (company_id = public.my_company_id()) with check (company_id = public.my_company_id());
create policy "own company only" on spots for all to authenticated
  using (company_id = public.my_company_id()) with check (company_id = public.my_company_id());
create policy "own company only" on spot_analyses for all to authenticated
  using (company_id = public.my_company_id()) with check (company_id = public.my_company_id());
create policy "own company only" on spot_notes for all to authenticated
  using (company_id = public.my_company_id()) with check (company_id = public.my_company_id());
create policy "own company only" on agencies for all to authenticated
  using (company_id = public.my_company_id()) with check (company_id = public.my_company_id());
create policy "own company only" on briefs for all to authenticated
  using (company_id = public.my_company_id()) with check (company_id = public.my_company_id());
create policy "own company only" on submissions for all to authenticated
  using (company_id = public.my_company_id()) with check (company_id = public.my_company_id());
create policy "own company only" on submission_spots for all to authenticated
  using (company_id = public.my_company_id()) with check (company_id = public.my_company_id());
create policy "own company only" on results for all to authenticated
  using (company_id = public.my_company_id()) with check (company_id = public.my_company_id());

-- Signed-in people may use the tables (the rules above still apply to every row).
-- People who are not signed in get nothing.
grant select on companies, members to authenticated;
grant select, insert, update, delete on
  invites, directors, spots, spot_analyses, spot_notes, agencies, briefs,
  submissions, submission_spots, results to authenticated;
revoke all on all tables in schema public from anon;
