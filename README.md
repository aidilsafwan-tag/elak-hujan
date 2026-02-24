# ElakHujan

A mobile-first PWA that helps Malaysian scooter commuters pick the best office days and departure times based on rain forecasts.

## Features

- **Weekly View** — next 5 working days ranked by rain risk
- **Leave Advisor** — optimal departure time within your evening commute window
- **MET Malaysia Alerts** — weather warning banners sourced from data.gov.my
- **PWA** — installable on any mobile home screen

## Setup

```bash
npm install
```

## Local Development

```bash
npm run dev
```

## Production Build

```bash
npm run build
```

## Deploying to Vercel

1. Push to GitHub
2. Import the project at [vercel.com](https://vercel.com)
3. Deploy — no environment variables required

## Data Sources

| Source | Purpose | Cache |
|--------|---------|-------|
| [Open-Meteo](https://open-meteo.com) | Hourly rain probability forecasts | 60 min |
| [data.gov.my](https://api.data.gov.my) | MET Malaysia weather warnings | 30 min |
| [Nominatim](https://nominatim.openstreetmap.org) | Location search (onboarding only) | — |

## Tech Stack

- React 19 + TypeScript, Vite 7
- Tailwind CSS v4, shadcn/ui (new-york)
- Zustand (state), TanStack Query v5 (caching)
- React Router v7
- Vercel (SPA hosting)
