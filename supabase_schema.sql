-- ============================================================
-- AutorizAct — Supabase Schema
-- Rulează acest SQL în Supabase → SQL Editor → New query
-- ============================================================

-- PROJECTS
create table if not exists projects (
  id          text primary key,
  name        text not null,
  certificat  text,
  address     text,
  emitent     text,
  data_emitere     date,
  data_expirare    date,
  status      text default 'pending',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- PROCEDURES
create table if not exists procedures (
  id          text primary key,
  project_id  text references projects(id) on delete cascade,
  name        text not null,
  status      text default 'pending',
  deadline    date,
  sort_order  integer default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- DOCUMENTS
create table if not exists documents (
  id           text primary key,
  procedure_id text references procedures(id) on delete cascade,
  project_id   text references projects(id) on delete cascade,
  name         text not null,
  size         bigint,
  storage_path text,
  uploaded_by  text,
  uploaded_at  timestamptz default now()
);

-- COMMENTS
create table if not exists comments (
  id           text primary key,
  procedure_id text references procedures(id) on delete cascade,
  project_id   text references projects(id) on delete cascade,
  text         text not null,
  author       text,
  voice        boolean default false,
  created_at   timestamptz default now()
);

-- TASKS
create table if not exists tasks (
  id           text primary key,
  title        text not null,
  project_id   text references projects(id) on delete cascade,
  proc_id      text references procedures(id) on delete set null,
  assigned_to  text,
  assigned_by  text,
  due_date     date,
  status       text default 'pending',
  priority     text default 'medium',
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Enable Realtime for live sync
alter publication supabase_realtime add table projects;
alter publication supabase_realtime add table procedures;
alter publication supabase_realtime add table documents;
alter publication supabase_realtime add table comments;
alter publication supabase_realtime add table tasks;

-- Storage bucket for documents
-- (Creează manual în Supabase → Storage → New bucket → "documents" → Public: false)

-- Row Level Security — dezactivat pentru uz intern (toți utilizatorii văd tot)
alter table projects disable row level security;
alter table procedures disable row level security;
alter table documents disable row level security;
alter table comments disable row level security;
alter table tasks disable row level security;

-- CHAT MESSAGES
create table if not exists chat_messages (
  id             text primary key,
  text           text not null default '',
  author         text not null,
  type           text default 'text',         -- 'text' | 'task_ref'
  task_id        text,
  task_snapshot  text,                        -- JSON snapshot of task at send time
  reactions      text default '{}',           -- JSON: { "👍": ["dacian","sorin"] }
  created_at     timestamptz default now()
);

alter publication supabase_realtime add table chat_messages;
alter table chat_messages disable row level security;
