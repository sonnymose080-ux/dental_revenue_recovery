create extension if not exists pgcrypto;

create table if not exists clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  timezone text not null default 'Africa/Nairobi',
  currency text not null default 'KES',
  created_at timestamptz not null default now()
);

create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  source text,
  status text not null default 'active' check (status in ('active','inactive','blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid references patients(id) on delete set null,
  name text not null,
  phone text,
  email text,
  source text,
  status text not null default 'new' check (status in ('new','contacted','qualified','appointment','won','lost','no_response')),
  follow_up_at timestamptz,
  estimated_value numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid references patients(id) on delete set null,
  scheduled_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled','completed','cancelled','no_show','rescheduled')),
  appointment_type text,
  source text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists treatment_plans (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid references patients(id) on delete set null,
  treatment_name text not null,
  estimated_value numeric(12,2) not null default 0,
  status text not null default 'pending' check (status in ('pending','accepted','declined','expired')),
  proposed_at timestamptz not null default now(),
  accepted_at timestamptz,
  follow_up_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists recovery_opportunities (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid references patients(id) on delete set null,
  appointment_id uuid references appointments(id) on delete set null,
  treatment_plan_id uuid references treatment_plans(id) on delete set null,
  type text not null check (type in ('missed_appointment','unaccepted_treatment','dormant_patient','overdue_follow_up')),
  priority text not null default 'medium' check (priority in ('low','medium','high')),
  value_at_risk numeric(12,2) not null default 0,
  assigned_to text,
  status text not null default 'open' check (status in ('open','contacted','engaged','recovered','closed')),
  outcome text,
  next_action_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists communications (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid references patients(id) on delete set null,
  lead_id uuid references leads(id) on delete set null,
  channel text not null check (channel in ('whatsapp','sms','email','phone','instagram','facebook','web')),
  direction text not null check (direction in ('inbound','outbound')),
  message text not null,
  status text not null default 'logged' check (status in ('logged','queued','sent','delivered','failed','human_handoff')),
  external_id text,
  created_at timestamptz not null default now()
);

create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  patient_id uuid references patients(id) on delete set null,
  lead_id uuid references leads(id) on delete set null,
  event_type text not null,
  description text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_patients_clinic on patients(clinic_id);
create index if not exists idx_leads_clinic_status on leads(clinic_id,status);
create index if not exists idx_leads_follow_up on leads(clinic_id,follow_up_at);
create index if not exists idx_appointments_clinic_date on appointments(clinic_id,scheduled_at);
create index if not exists idx_treatment_plans_clinic_status on treatment_plans(clinic_id,status);
create index if not exists idx_recovery_clinic_status_priority on recovery_opportunities(clinic_id,status,priority);
create index if not exists idx_communications_patient on communications(patient_id,created_at desc);
create index if not exists idx_activity_clinic_date on activity_log(clinic_id,created_at desc);

alter table clinics enable row level security;
alter table patients enable row level security;
alter table leads enable row level security;
alter table appointments enable row level security;
alter table treatment_plans enable row level security;
alter table recovery_opportunities enable row level security;
alter table communications enable row level security;
alter table activity_log enable row level security;

create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists clinics_updated_at on clinics;
create trigger clinics_updated_at before update on clinics for each row execute function set_updated_at();
drop trigger if exists patients_updated_at on patients;
create trigger patients_updated_at before update on patients for each row execute function set_updated_at();
drop trigger if exists leads_updated_at on leads;
create trigger leads_updated_at before update on leads for each row execute function set_updated_at();
drop trigger if exists appointments_updated_at on appointments;
create trigger appointments_updated_at before update on appointments for each row execute function set_updated_at();
drop trigger if exists treatment_plans_updated_at on treatment_plans;
create trigger treatment_plans_updated_at before update on treatment_plans for each row execute function set_updated_at();
drop trigger if exists recovery_updated_at on recovery_opportunities;
create trigger recovery_updated_at before update on recovery_opportunities for each row execute function set_updated_at();

-- Run this seed only in a development/demo database.
insert into clinics (id,name) values ('00000000-0000-0000-0000-000000000001','Sunny Smile Dental') on conflict (id) do nothing;
