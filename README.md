# ElakHujan

A mobile-first PWA that helps Malaysian scooter commuters pick the best office days and departure times based on rain forecasts.

## Features

- **Weekly View** — next 5 working days ranked by rain risk across morning and evening commute windows
- **Leave Advisor** — optimal departure time within your evening commute window, with MET Malaysia's official daily forecast (Pagi / Petang / Malam) shown alongside
- **MET Malaysia Warnings** — weather warning banners sourced from data.gov.my, dismissible per session
- **PWA** — installable on any mobile home screen

## Setup

```bash
npm install
```

Copy `.env.example` to `.env.local` and fill in your MET Malaysia API token:

```bash
cp .env.example .env.local
```

## Local Development

```bash
npm run dev
```

The Vite dev server proxies `/api/met/*` to `api.met.gov.my/v2.1` using the `MET_TOKEN` from `.env.local`. No browser CORS issues.

## Production Build

```bash
npm run build
```

## Deploying to Vercel

1. Push to GitHub
2. Import the project at [vercel.com](https://vercel.com)
3. Add the environment variable `MET_TOKEN` (your api.met.gov.my token) in the Vercel project settings
4. Deploy

The `api/met/[...path].ts` Vercel Edge Function proxies all MET Malaysia API calls server-side, keeping the token out of the browser.

## Data Sources

| Source | Purpose | Cache |
|--------|---------|-------|
| [Open-Meteo](https://open-meteo.com) | Hourly rain probability forecasts | 60 min |
| [api.met.gov.my](https://api.met.gov.my) | Official daily forecast per state (Pagi/Petang/Malam) | 5 min |
| [api.data.gov.my](https://api.data.gov.my) | MET Malaysia weather warnings | 30 min |
| [Nominatim](https://nominatim.openstreetmap.org) | Location search (onboarding only) | — |

## Tech Stack

- React 19 + TypeScript, Vite 7
- Tailwind CSS v4, shadcn/ui (new-york)
- Zustand (state), TanStack Query v5 (caching)
- React Router v7
- Vercel (SPA hosting + Edge Function proxy for MET Malaysia API)
