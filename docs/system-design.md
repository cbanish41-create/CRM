# System Design

## Multi-tenant architecture

- Single database with strict `tenant_id` partitioning on every business table.
- Supabase Auth identifies user; `memberships` maps user to tenant + role.
- PostgreSQL RLS policies enforce tenant isolation using `auth.uid()` membership checks.

## Access model

- Roles:
  - `admin`: full tenant access including pipelines, settings, users.
  - `manager`: manage deals/tasks/contacts and automation.
  - `sales_rep`: manage assigned leads/deals/tasks, read shared pipeline.
- Permission logic is enforced in API layer and can be extended with per-route guards.

## Core domains

- **CRM entities**: `companies`, `contacts`, `deals`, `tasks`, `notes`, `activities`.
- **Customization**: `custom_fields`, `custom_field_values`, `pipelines`, `stages`, `tags`.
- **Automation**: `workflow_rules`, `workflow_runs` with trigger/action JSON contracts.
- **Comms**: `email_templates`, `email_messages`, `notifications`.
- **Integrations**: `webhook_endpoints`, `webhook_deliveries`.

## Workflow engine

- Triggers fired from API events (`contact_created`, `deal_stage_changed`, `task_overdue`).
- Actions include:
  - create task
  - assign deal
  - queue email
- Every run persisted to `workflow_runs` for auditing.

## Email integration pattern

- Outbound: app writes to `email_messages` (`status=queued`), external worker sends via SMTP/ESP and updates status.
- Inbound: provider webhook posts to `/api/email/inbound`, message stored and linked to contact/deal.

## Dashboard metrics

- Pipeline value = sum of deal values.
- Conversion rate = customers / (customers + leads).
- Won/lost from `deals.deal_status`.

## Scale + performance

- Indexes on tenant columns + common filters.
- API routes keep payloads small.
- UI is client-light and responsive.
- Webhook delivery is asynchronous fan-out with per-delivery logs.

## Deployment topology

- Vercel for Next.js frontend/API.
- Supabase managed Postgres + Auth.
- Background worker (Supabase Edge Function, Queue worker, or serverless cron) for:
  - email dispatch
  - task reminder notifications
  - overdue trigger processing
