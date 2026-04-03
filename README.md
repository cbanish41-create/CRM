# CRM SaaS (Next.js + Supabase + PostgreSQL)

Production-ready multi-tenant CRM for sales teams and agencies.

## Features

- Contact management: leads/customers, tags, notes, timeline-ready activity model.
- Deals + pipeline: kanban board, stage movement, owner and value tracking.
- Tasks: assignment, due dates, reminders, linked to contacts/deals.
- Dashboard KPIs: pipeline value, conversion rate, won/lost counts.
- Workflow automation: trigger/action rules and run logs.
- Email integration: outbound queue, inbound ingestion, templates schema.
- Company-level accounts: one company to many contacts and deals.
- Multi-user roles: admin, manager, sales_rep via memberships.
- Customization: custom fields + multiple pipelines/stages.
- Notifications: per-user notifications feed.
- API + webhooks: CRUD API endpoints and signed outgoing webhook dispatcher.

## Stack

- Next.js App Router (TypeScript)
- Supabase Auth + Postgres + RLS
- PostgreSQL schema in `supabase/migrations`

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env template:
   ```bash
   cp .env.example .env
   ```
3. Fill Supabase keys.
4. Run migration (`supabase db push` or SQL editor with `supabase/migrations/20260403_init.sql`).
5. Start app:
   ```bash
   npm run dev
   ```

## Deployment

- Deploy app to Vercel.
- Host database/auth on Supabase.
- Set production environment variables in Vercel.
- Configure webhook signing secret and outbound email worker.

## API Endpoints

- `GET/POST /api/contacts`
- `GET/POST/PATCH /api/deals`
- `GET/POST/PATCH /api/tasks`
- `GET /api/dashboard`
- `GET/POST /api/workflows`
- `POST /api/email/send`
- `POST /api/email/inbound`
- `GET /api/notifications`
- `POST /api/webhooks`

## Architecture notes

See `docs/system-design.md` for architecture, tenancy strategy, role model, and scaling plan.
