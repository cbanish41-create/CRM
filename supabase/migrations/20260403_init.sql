create extension if not exists "pgcrypto";

create type public.app_role as enum ('admin', 'manager', 'sales_rep');
create type public.task_status as enum ('open', 'in_progress', 'done');
create type public.deal_status as enum ('open', 'won', 'lost');

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null,
  role public.app_role not null default 'sales_rep',
  created_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);

create table public.pipelines (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.stages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  pipeline_id uuid not null references public.pipelines(id) on delete cascade,
  name text not null,
  position int not null,
  created_at timestamptz not null default now(),
  unique (pipeline_id, position)
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  domain text,
  owner_id uuid,
  created_at timestamptz not null default now()
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  owner_id uuid,
  company_id uuid references public.companies(id) on delete set null,
  lead_status text not null default 'lead',
  created_at timestamptz not null default now(),
  unique(tenant_id, email)
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, name)
);

create table public.contact_tags (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (contact_id, tag_id)
);

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  title text not null,
  value numeric(12,2) not null default 0,
  stage_id uuid not null references public.stages(id),
  owner_id uuid not null,
  contact_id uuid references public.contacts(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  deal_status public.deal_status not null default 'open',
  close_date date,
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  title text not null,
  description text,
  assigned_to uuid not null,
  status public.task_status not null default 'open',
  due_at timestamptz,
  reminder_at timestamptz,
  deal_id uuid references public.deals(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  body text not null,
  created_by uuid not null,
  contact_id uuid references public.contacts(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  deal_id uuid references public.deals(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  actor_id uuid,
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.workflow_rules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  trigger_type text not null,
  conditions jsonb not null default '{}',
  actions jsonb not null default '[]',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.workflow_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  workflow_rule_id uuid not null references public.workflow_rules(id) on delete cascade,
  payload jsonb not null,
  status text not null,
  created_at timestamptz not null default now()
);

create table public.email_templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  subject text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.email_messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  direction text not null,
  from_email text,
  to_email text,
  subject text,
  body text,
  created_by uuid,
  contact_id uuid references public.contacts(id) on delete set null,
  deal_id uuid references public.deals(id) on delete set null,
  status text not null default 'queued',
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null,
  title text not null,
  body text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.webhook_endpoints (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  url text not null,
  events text[] not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.webhook_deliveries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  webhook_endpoint_id uuid not null references public.webhook_endpoints(id) on delete cascade,
  event text not null,
  status_code int,
  request_body jsonb,
  error text,
  created_at timestamptz not null default now()
);

create table public.custom_fields (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  entity_type text not null,
  name text not null,
  field_type text not null,
  options jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table public.custom_field_values (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  custom_field_id uuid not null references public.custom_fields(id) on delete cascade,
  entity_id uuid not null,
  value jsonb not null default 'null',
  created_at timestamptz not null default now()
);

create index idx_contacts_tenant on public.contacts(tenant_id);
create index idx_deals_tenant on public.deals(tenant_id);
create index idx_tasks_tenant on public.tasks(tenant_id);

alter table public.memberships enable row level security;
alter table public.pipelines enable row level security;
alter table public.stages enable row level security;
alter table public.companies enable row level security;
alter table public.contacts enable row level security;
alter table public.tags enable row level security;
alter table public.contact_tags enable row level security;
alter table public.deals enable row level security;
alter table public.tasks enable row level security;
alter table public.notes enable row level security;
alter table public.activities enable row level security;
alter table public.workflow_rules enable row level security;
alter table public.workflow_runs enable row level security;
alter table public.email_templates enable row level security;
alter table public.email_messages enable row level security;
alter table public.notifications enable row level security;
alter table public.webhook_endpoints enable row level security;
alter table public.webhook_deliveries enable row level security;
alter table public.custom_fields enable row level security;
alter table public.custom_field_values enable row level security;

create function public.is_tenant_member(tid uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.memberships m
    where m.tenant_id = tid and m.user_id = auth.uid()
  );
$$;

create policy "tenant select memberships" on public.memberships for select using (public.is_tenant_member(tenant_id));

create policy "tenant access pipelines" on public.pipelines for all using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant access stages" on public.stages for all using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant access companies" on public.companies for all using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant access contacts" on public.contacts for all using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant access tags" on public.tags for all using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant access contact_tags" on public.contact_tags for all using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant access deals" on public.deals for all using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant access tasks" on public.tasks for all using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant access notes" on public.notes for all using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant access activities" on public.activities for all using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant access workflow_rules" on public.workflow_rules for all using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant access workflow_runs" on public.workflow_runs for all using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant access email_templates" on public.email_templates for all using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant access email_messages" on public.email_messages for all using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant access notifications" on public.notifications for all using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant access webhook_endpoints" on public.webhook_endpoints for all using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant access webhook_deliveries" on public.webhook_deliveries for all using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant access custom_fields" on public.custom_fields for all using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
create policy "tenant access custom_field_values" on public.custom_field_values for all using (public.is_tenant_member(tenant_id)) with check (public.is_tenant_member(tenant_id));
