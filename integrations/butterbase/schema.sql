-- Apply through Butterbase MCP schema tools. Review the dry run before apply.
create table if not exists learners (
  id text primary key,
  owner_user_id text not null,
  display_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists lab_sessions (
  id text primary key,
  learner_id text not null references learners(id),
  workload_id text not null,
  current_stage integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists optimization_receipts (
  id text primary key,
  session_id text references lab_sessions(id),
  fixture_id text not null,
  evidence_state text not null check (evidence_state in ('configured','fixture_backed','live','blocked')),
  verification_passed boolean,
  payload jsonb not null,
  payload_sha256 text,
  created_at timestamptz not null default now()
);

create table if not exists trace_events (
  id text primary key,
  session_id text not null references lab_sessions(id),
  sequence integer not null,
  event_type text not null,
  measurement_source text not null,
  evidence_state text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  unique(session_id, sequence)
);

-- Required before public deployment: enable row-level security and add owner-scoped
-- policies through Butterbase MCP. Never expose a service key in the static bundle.
