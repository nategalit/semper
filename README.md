# Semper

D&D 5e character sheets, forged for play.

A progressive web app for managing D&D 5th Edition characters. Works offline. Installable on iOS, Android, and desktop. User accounts for cloud-synced characters.

## Stack

- **Next.js 15** (App Router) + TypeScript + React
- **Tailwind CSS** + shadcn/ui
- **Supabase** (Postgres + Auth + Row Level Security)
- **Zustand** (client state) + **TanStack Query** (server state)
- **next-pwa** (service worker, offline, installability)
- Deploy target: Vercel

## Setup

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### Environment variables

Create a `.env.local` file at the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
```

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database

Apply the SQL migrations in `supabase/migrations/` to your Supabase project:

```bash
npx supabase db push
```

### Content

Load the bundled SRD content:

```bash
npm run content:load-srd
```

To import Aurora Legacy content, use the in-app import UI after signing in.

## Development

```bash
npm run dev        # start dev server
npm run build      # production build
npm run test       # run vitest
npm run lint       # eslint
```
