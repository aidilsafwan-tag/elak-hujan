# Architecture – ElakHujan
**Version:** 0.1 (Draft)
**Last Updated:** February 2026

---

## 1. System Overview

ElakHujan is a fully static React SPA (Single Page Application) with one thin serverless function for Telegram notifications. There is no database, no user authentication, and no server-side state. All personalisation lives in the user's browser via localStorage.

```
┌─────────────────────────────────────────────┐
│              User's Browser                  │
│                                             │
│  ┌─────────────┐     ┌──────────────────┐  │
│  │  React SPA  │────▶│   localStorage   │  │
│  │  ElakHujan  │     │  (user config)   │  │
│  └──────┬──────┘     └──────────────────┘  │
│         │                                   │
└─────────┼───────────────────────────────────┘
          │
          ├──▶ Open-Meteo API (hourly forecast)
          ├──▶ data.gov.my API (weather warnings)
          ├──▶ Nominatim API (geocoding)
          └──▶ Vercel Serverless Function
                       │
                       └──▶ Telegram Bot API
```

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Routing | React Router v7 |
| State management | Zustand (UI state) + localStorage (persistent config) |
| Data fetching | TanStack Query (React Query) |
| Serverless function | Vercel Edge Function (Telegram proxy) |
| Deployment | Vercel |

---

## 3. Folder Structure

```
elakhujan/
├── public/
├── src/
│   ├── app/
│   │   ├── App.tsx                  # Root component, router setup
│   │   └── providers.tsx            # Query client, theme providers
│   │
│   ├── pages/
│   │   ├── Weekly.tsx               # Weekly planning view
│   │   ├── DayDetail.tsx            # Day detail view
│   │   ├── LeaveAdvisor.tsx         # Leave time advisor
│   │   ├── Settings.tsx             # Settings page
│   │   └── Onboarding/
│   │       ├── index.tsx            # Wizard controller
│   │       ├── StepLocation.tsx     # Step 1: Locations
│   │       ├── StepCommute.tsx      # Step 2: Commute windows
│   │       ├── StepDays.tsx         # Step 3: Preferred days
│   │       └── StepTelegram.tsx     # Step 4: Telegram setup
│   │
│   ├── components/
│   │   ├── ui/                      # shadcn/ui base components
│   │   ├── DayCard.tsx              # Day card (weekly view)
│   │   ├── RainBar.tsx              # Hourly rain probability bar
│   │   ├── RiskBadge.tsx            # Risk badge (Rendah/Sederhana/Tinggi)
│   │   ├── WarningAlert.tsx         # MET Malaysia warning banner
│   │   ├── LeavePanel.tsx           # Leave time recommendation panel
│   │   └── BottomNav.tsx            # Bottom navigation bar
│   │
│   ├── hooks/
│   │   ├── useWeather.ts            # Fetches & caches weather data
│   │   ├── useWarnings.ts           # Fetches MET Malaysia warnings
│   │   ├── useConfig.ts             # Reads/writes user config from localStorage
│   │   └── useDayRecommendation.ts  # Day recommendation scoring logic
│   │
│   ├── services/
│   │   ├── openMeteo.ts             # Open-Meteo API client
│   │   ├── dataGovMy.ts             # data.gov.my warnings API client
│   │   ├── nominatim.ts             # Geocoding service
│   │   └── telegram.ts              # Calls Vercel function to send notifications
│   │
│   ├── lib/
│   │   ├── rainScoring.ts           # Rain scoring & recommendation algorithm
│   │   ├── leaveAdvisor.ts          # Leave time recommendation logic
│   │   ├── localStorage.ts          # Typed localStorage helpers
│   │   └── utils.ts                 # General utilities
│   │
│   ├── types/
│   │   ├── weather.ts               # Weather data types
│   │   ├── config.ts                # User config types
│   │   └── telegram.ts              # Telegram types
│   │
│   └── constants/
│       ├── thresholds.ts            # Rain threshold values
│       └── copy.ts                  # All BM UI copy (i18n-ready)
│
├── api/
│   └── telegram.ts                  # Vercel Edge Function (Telegram proxy)
│
├── .env.example
├── vite.config.ts
└── package.json
```

---

## 4. Data Flow

### 4.1 App Startup
```
App loads
    │
    ├── Read localStorage → onboardingComplete === true?
    │       │
    │       ├── NO  → redirect to /onboarding (full-screen, no escape)
    │       └── YES → proceed to /mingguan (weekly view)
    │
    └── Fetch weather data (parallel)
            ├── Open-Meteo: home location (7-day hourly)
            ├── Open-Meteo: office location (7-day hourly)
            └── data.gov.my: active warnings
```

### 4.2 Weekly View Rendering
```
Weather data (hourly) + User config (commute windows, preferredDays)
    │
    └── skorHujan()
            ├── Determine rolling window: next 5 weekdays from today
            │     (uses Open-Meteo's 7-day forecast; today included)
            │
            ├── For each weekday in window:
            │     ├── Extract morning window hours → avg rain probability
            │     ├── Extract evening window hours → avg rain probability
            │     └── Combined score = (morning + evening) / 2
            │
            └── getRecommendedDays()
                    ├── Filter to preferredDays only → rank by score → take top N
                    ├── If preferredDays count < N → fill remainder from non-preferred
                    └── Highlight recommended set on UI as "Disyorkan"

Tap DayCard → toggle confirmedOfficeDays in config (single tap)
Tap DayCard chevron → navigate to /day/:date
```

### 4.3 Leave Time Advisor

**Contextual auto-surface (on /mingguan):**
```
Every minute, check: is current time within 2 hours before evening window start?
    │
    ├── YES → show PanelMasaBalik as a sticky banner at top of Mingguan
    └── NO  → banner hidden, accessible only via bottom nav tab
```

**Advisor logic:**
```
masaBalik()
    ├── Fetch hourly rain probability from office location
    ├── Scan slots: window start -1hr to window end +2hr
    ├── Find first 1-hour slot where probability < 40%
    └── Return recommended slot or "tiada tetingkap kering" warning
```

### 4.4 Telegram Notification Flow
```
Trigger: morning alarm (scheduled by user's device) OR manual send
    │
    └── telegram.ts (service)
            │
            └── POST /api/telegram (Vercel Edge Function)
                        │
                        ├── Receives: { chatId, message }
                        ├── Reads BOT_TOKEN from env
                        └── Calls Telegram Bot API → message delivered
```

---

## 5. User Config Schema (localStorage)

```typescript
interface UserConfig {
  // Locations
  homeLocation: {
    name: string;          // "Subang Jaya"
    lat: number;
    lon: number;
    state: string;         // "Selangor" — used for MET Malaysia warning filtering
  };
  officeLocation: {
    name: string;          // "KL Sentral"
    lat: number;
    lon: number;
    state: string;         // "W.P. Kuala Lumpur"
  };

  // Commute windows
  morningWindow: {
    start: string;         // "08:00"
    end: string;           // "09:00"
  };
  eveningWindow: {
    start: string;         // "17:00"
    end: string;           // "18:00"
  };

  // Office days
  officeDaysPerWeek: number;          // 3
  preferredDays: string[];            // ["monday", "tuesday", "wednesday", "thursday", "friday"]
  confirmedOfficeDays: Record<string, boolean>; // { "2026-02-23": true, ... }

  // Settings
  rainThreshold: number;              // 40 (percent)
  morningNotificationTime: string;    // "07:30"

  // Telegram
  telegram: {
    chatId: string;
    morningNotification: boolean;
    eveningNotification: boolean;
  } | null;

  // Meta
  onboardingComplete: boolean;
  configVersion: number;              // for future migrations
}
```

---

## 6. API Integration Details

### 6.1 Open-Meteo
```
GET https://api.open-meteo.com/v1/forecast
  ?latitude={lat}
  &longitude={lon}
  &hourly=precipitation_probability
  &timezone=Asia/Kuala_Lumpur
  &forecast_days=7
```
- Returns 168 hourly data points (7 days × 24 hours)
- Called twice — once for home, once for office
- Cached in TanStack Query for 60 minutes

### 6.2 data.gov.my (Warnings)
```
GET https://api.data.gov.my/weather/warning
  ?limit=5
  &sort=-warning_issue__issued
```
- Polled once on app open
- Cached for 30 minutes
- Filter client-side for warnings relevant to user's region

### 6.3 Nominatim (Geocoding)
```
GET https://nominatim.openstreetmap.org/search
  ?q={address}
  &format=json
  &limit=5
  &countrycodes=my
```
- Used only during onboarding/settings when user sets locations
- Results presented as a dropdown for user to confirm

---

## 7. Vercel Edge Function — Telegram Proxy

**File:** `api/telegram.ts`

```typescript
// Receives POST { chatId: string, message: string }
// Sends message via Telegram Bot API
// BOT_TOKEN stored as Vercel environment variable (never exposed to client)
```

**Environment variables required:**
```
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

**Why a proxy?** The Telegram Bot Token must never be exposed in the browser bundle. The Edge Function acts as a thin proxy that holds the secret and forwards the message.

---

## 8. Routing Structure

| Path | Page | Description |
|------|------|-------------|
| `/onboarding` | Onboarding Wizard | Full-screen, blocks app access until complete |
| `/` | Weekly | Weekly planning view (default after onboarding) |
| `/day/:date` | DayDetail | Day detail view |
| `/leave` | LeaveAdvisor | Leave time advisor — always accessible via bottom nav, auto-surfaces as a banner on Weekly when within 2 hours of evening commute window |
| `/settings` | Settings | Settings page |

---

## 9. Risk & Mitigation

| Risk | Mitigation |
|------|-----------|
| Open-Meteo downtime | Show cached data with a "data lama" warning |
| User clears localStorage | Redirect to onboarding, data is lost by design (stateless) |
| Telegram bot token exposed | Always kept server-side in Vercel env vars |
| Nominatim rate limiting | Debounce location search input, cache results |
| Weather inaccuracy for KL microclimates | Fetch both home + office separately; user can adjust threshold |
