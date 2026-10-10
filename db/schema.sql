-- Planned data model for Reel Tool (PostgreSQL). Not yet applied to any database.
-- Every table that holds customer data carries company_id so one company's records
-- can be walled off from another's.

create table companies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);

-- A person who signs in. Belongs to one company.
create table members (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references companies(id),
  email       text not null unique,
  name        text,
  role        text not null default 'rep',       -- 'owner' | 'rep'
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
