# CLAIMR

CLAIMR (Connecting Landowners to Automated Intelligent Money Recovery) is a multi-agent real estate surplus recovery platform built with Next.js, Supabase, and Anthropic.

## How it works

### Agent 1 — Scraper & Extractor
- Fetches county HTML/PDF auction result sources
- Extracts case records and calculates gross surplus
- Stores only leads with gross surplus >= $20,000 as `RAW_LEAD`

### Agent 2 — Legal Risk Evaluator
- Processes `RAW_LEAD` records
- Uses ATTOM API when available, falls back to Anthropic simulation when not
- Enriches lien/risk data and moves records to `CLEARED_LEAD` or `DEAD_LEAD`

### Agent 3 — Skip Tracer & CRM Manager
- Processes `CLEARED_LEAD` records
- Uses Skipify when available, otherwise Anthropic mock contact generation
- Stores contact data and moves records to `READY_FOR_OUTREACH`

## Tech stack
- Next.js 14 + TypeScript + Tailwind CSS
- Supabase (PostgreSQL)
- Anthropic API
- n8n-compatible webhook routes

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env template:
   ```bash
   cp .env.example .env.local
   ```
3. Run database migration in Supabase SQL editor:
   - `supabase/migrations/001_create_surplus_leads.sql`
4. Start dev server:
   ```bash
   npm run dev
   ```

## Environment variables

| Variable |
|---|
| `NEXT_PUBLIC_SUPABASE_URL` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `SUPABASE_SERVICE_ROLE_KEY` |
| `ANTHROPIC_API_KEY` |
| `ATTOM_API_KEY` |
| `SKIPIFY_API_KEY` |
| `SURPLUS_CRON_SECRET` |
| `NEXT_PUBLIC_APP_URL` |

## API endpoints

- `POST /api/surplus/scrape`
- `GET /api/cron/scrape-surplus`
- `POST /api/surplus/evaluate-risk`
- `POST /api/surplus/skip-trace`
- `POST /api/surplus/seed-mock`
- `PATCH /api/surplus/leads/:id/status`
- `GET /api/surplus/pipeline`
- `GET /api/surplus/export`

## Dashboard routes
- `/dashboard`
- `/dashboard/leads`
- `/dashboard/leads/[id]`
- `/dashboard/pipeline`
- `/dashboard/settings`

## Dashboard screenshots
- Overview: _(placeholder)_
- Leads table: _(placeholder)_
- Pipeline board: _(placeholder)_
- Lead detail: _(placeholder)_
- Settings: _(placeholder)_
