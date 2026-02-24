# Implementation Plan – ElakHujan
**Version:** 0.1 (Draft)
**Last Updated:** February 2026

---

## Overview

| Phase | Scope | Estimated Effort |
|-------|-------|-----------------|
| 1 | Project setup, onboarding wizard, localStorage config | 1 day |
| 2 | Weather integration + weekly planning view | 1–2 days |
| 3 | Day detail view + leave time advisor | 1 day |
| 4 | MET Malaysia warning banner | 0.5 day |
| 5 | Telegram bot + Vercel serverless function | 1 day |
| 6 | Polish, testing & deployment | 1 day |

**Total estimated:** ~1.5–2 weekends

---

## Phase 1 — Project Setup, Onboarding & Config

### Goals
- Runnable project scaffold
- User can complete onboarding and have their config saved to localStorage
- App correctly gates access until onboarding is complete

### Tasks

**1.1 Project scaffold**
- Initialise Vite + React + TypeScript project
- Install and configure Tailwind CSS v4
- Install and configure shadcn/ui
- Install dependencies: `react-router-dom`, `zustand`, `@tanstack/react-query`
- Set up folder structure as per architecture doc
- Create `.env.example`

**1.2 Config foundation**
- Define `UserConfig` TypeScript interface (`src/types/config.ts`)
- Build typed localStorage helpers (`src/lib/localStorage.ts`)
  - `getConfig()` — returns `UserConfig | null`
  - `setConfig(config: UserConfig)` — saves to localStorage
  - `updateConfig(partial: Partial<UserConfig>)` — merges partial update
- Build `useConfig` hook (`src/hooks/useConfig.ts`)

**1.3 Routing & auth guard**
- Set up React Router with all routes
- Build `OnboardingGuard` — redirects to `/onboarding` if `onboardingComplete === false`
- Build `BottomNav` component (hidden during onboarding)

**1.4 Onboarding wizard**
- Wizard controller with step state management (`src/pages/Onboarding/index.tsx`)
- Step 1 — `StepLocation.tsx`
  - Two search fields: Rumah & Pejabat
  - Nominatim geocoding service (`src/services/nominatim.ts`)
  - Debounced search with dropdown results
  - State dropdown (16 Malaysian states + 3 Federal Territories) per location — used for MET warning filtering
  - Save `homeLocation` + `officeLocation` (including `state`) to config
- Step 2 — `StepCommute.tsx`
  - Time pickers for morning and evening commute windows
  - Defaults: 08:00–09:00 and 17:00–18:00
  - Save `morningWindow` + `eveningWindow` to config
- Step 3 — `StepDays.tsx`
  - Number selector for `officeDaysPerWeek` (default: 3)
  - Day toggles for `preferredDays` (Mon–Fri)
- Step 4 — `StepTelegram.tsx`
  - Optional step — can be skipped
  - Instructions: how to find your Telegram Chat ID
  - Input for `chatId`
  - Toggle for morning/evening notifications
  - `morningNotificationTime` time picker (default: 07:30) — shown when morning notification is enabled
  - Disclaimer: *"Notifikasi hanya dihantar apabila aplikasi dibuka"* (notifications only fire when app is open)
- Completion — set `onboardingComplete: true`, redirect to `/`

**1.5 Settings page**
- Mirror all onboarding fields in an editable form (`src/pages/Settings.tsx`)
- Add `rainThreshold` slider (10%–80%, default 40%)
- Add `morningNotificationTime` picker
- "Reset semua data" button (clears localStorage, redirects to onboarding)

### Deliverable
A working onboarding flow that saves config and unlocks the main app.

---

## Phase 2 — Weather Integration & Weekly View

### Goals
- Fetch and display real hourly weather data from Open-Meteo
- Weekly view shows all 5 weekdays with morning + evening rain risk
- Algorithm recommends the best N days and highlights them

### Tasks

**2.1 Open-Meteo service**
- Build `openMeteo.ts` service (`src/services/openMeteo.ts`)
  - `fetchHourlyForecast(lat, lon)` — returns 7-day hourly precipitation probability array
- Build `useWeather` hook (`src/hooks/useWeather.ts`)
  - Calls `fetchHourlyForecast` for both home and office locations in parallel
  - TanStack Query with 60-minute stale time
  - Returns `{ homeWeather, officeWeather, isLoading, isError }`

**2.2 Rain scoring algorithm**
- Build `rainScoring.ts` (`src/lib/rainScoring.ts`)
  - `getRollingWeekdays(today: Date): Date[]` — returns next 5 weekdays from today (inclusive)
  - `extractWindowAverage(hourlyData, date, startTime, endTime)` — returns average probability for a given time window
  - `scoreDays(homeWeather, officeWeather, config)` — returns array of scored weekdays for the rolling window
  - `getRecommendedDays(scoredDays, count, preferredDays)` — fills top-N from preferred days first; falls back to non-preferred only if preferred count < N

**2.3 Weekly view**
- Build `Weekly.tsx` page (`src/pages/Weekly.tsx`)
  - Fetch weather via `useWeather`
  - Run scoring via `useDayRecommendation` hook
  - Render the next 5 weekdays from today (rolling window, not fixed Mon–Fri)
  - Show loading skeleton while fetching
  - Show error state if fetch fails
- Build `DayCard.tsx` component
  - Shows: day name, date, morning rain %, evening rain %, `RiskBadge`
  - "Disyorkan" highlight badge for recommended days (preferred days first; non-preferred only if gap to fill)
  - "Hari Pejabat" indicator for confirmed office days
  - **Single tap** on the card body → toggle `confirmedOfficeDays` in config
  - **Chevron button** (right edge) → navigate to `/day/:date`
- Build `RiskBadge.tsx` component
  - Rendah (< 40%) — green
  - Sederhana (40–70%) — amber
  - Tinggi (> 70%) — red
- Build `RainBar.tsx` component
  - Horizontal bar showing rain probability with colour gradient

**2.4 Day confirmation**
- Single tap on `DayCard` body → toggle `confirmedOfficeDays[date]` in config
- Confirmed days get a distinct visual indicator (e.g. filled background, checkmark)
- Prune `confirmedOfficeDays` entries older than 30 days on app load (in `useConfig` init)

### Deliverable
A working weekly view with real weather data, scoring, and recommended days highlighted.

---

## Phase 3 — Day Detail View & Leave Time Advisor

### Goals
- Tapping a day card shows full hourly breakdown
- Leave advisor shows best time to leave and auto-surfaces contextually

### Tasks

**3.1 Day detail view**
- Build `DayDetail.tsx` page (`src/pages/DayDetail.tsx`)
  - Accepts `date` param from route
  - Shows full 24-hour `RainBar` chart for the selected day
  - Highlights morning and evening commute windows as coloured bands
  - Shows morning + evening risk summary at the top

**3.2 Leave advisor logic**
- Build `leaveAdvisor.ts` (`src/lib/leaveAdvisor.ts`)
  - `getRecommendedLeaveTime(officeWeather, date, eveningWindow, rainThreshold)`
  - Scans hourly slots from `eveningWindow.start - 1hr` to `eveningWindow.end + 2hr`
  - Returns: `{ recommendedTime, probability, hasCleanWindow }`

**3.3 Leave advisor page**
- Build `LeaveAdvisor.tsx` page (`src/pages/LeaveAdvisor.tsx`)
  - Shows rolling 3-hour forecast from current time
  - Highlights recommended leave slot
  - Shows "Tiada tetingkap kering" warning if no dry slot found
  - Manual refresh button

**3.4 Auto-surface on Weekly view**
- Build `LeavePanel.tsx` component
  - Compact version of the leave recommendation
  - Shows as a sticky banner at the top of `Weekly.tsx`
- Build `useLeaveAdvisorVisible` hook
  - Returns `true` if current time is within 2 hours before `eveningWindow.start`
  - Checked every minute via `setInterval`
- Conditionally render `LeavePanel` on `Weekly.tsx`

### Deliverable
Full day detail view and a working leave time advisor with contextual auto-surface.

---

## Phase 4 — MET Malaysia Warning Banner

### Goals
- Active MET Malaysia weather warnings are surfaced as a dismissible banner

### Tasks

**4.1 data.gov.my service**
- Build `dataGovMy.ts` service (`src/services/dataGovMy.ts`)
  - `fetchActiveWarnings()` — fetches latest warnings, returns English text
- Build `useWarnings` hook (`src/hooks/useWarnings.ts`)
  - TanStack Query with 30-minute stale time
  - Returns `{ warnings, isLoading }`

**4.2 Warning banner**
- Build `WarningAlert.tsx` component
  - Dismissible banner (dismissed state stored in sessionStorage — reappears next session)
  - Shows warning title + text in English (data.gov.my provides `title_en`, `text_en`)
  - Only renders if active warnings exist
- Mount `WarningAlert` at the top of `Weekly.tsx` and `LeaveAdvisor.tsx`

### Deliverable
Active MET Malaysia warnings appear prominently and can be dismissed.

---

## Phase 5 — Telegram Bot & Notifications

### Goals
- User receives a morning Telegram message on office days
- User receives an evening nudge with leave recommendation on office days

### Tasks

**5.1 Create the bot**
- Message `@BotFather` on Telegram → `/newbot`
- Save the bot token as `TELEGRAM_BOT_TOKEN` in Vercel environment variables
- Build a `/start` command response that replies with the user's Chat ID

**5.2 Vercel Edge Function**
- Build `api/telegram.ts`
  - Accepts `POST { chatId: string, message: string }`
  - Validates input
  - Calls `https://api.telegram.org/bot{TOKEN}/sendMessage`
  - Returns success/error response
- Build `telegram.ts` service (`src/services/telegram.ts`)
  - `sendNotification(chatId, message)` — calls `/api/telegram`

**5.3 Notification messages (BM)**
- Morning message format:
  ```
  🌤️ Selamat pagi! Ramalan perjalanan hari ini:

  🏠 → 🏢 Pagi (08:00–09:00): 25% hujan — Selamat memandu!
  🏢 → 🏠 Petang (17:00–18:00): 65% hujan — Bawa baju hujan!

  Masa terbaik balik: 17:30
  ```
- Evening nudge format:
  ```
  🌧️ Peringatan petang!

  Masa terbaik untuk balik sekarang: 17:30
  Kebarangkalian hujan: 20%
  ```

**5.4 Notification scheduling**
- Since the app is fully static (no server-side cron), notifications are triggered client-side
  - On app open each morning, check if today is a confirmed office day → send morning notification if within 15 minutes of `morningNotificationTime`
  - On the Weekly view, when `LeavePanel` auto-surfaces → trigger evening nudge once (debounced, max once per day via localStorage flag)
- Note: this means the app must be opened for notifications to fire. True background push can be added in a future version via a server-side cron.

### Deliverable
Telegram notifications working end-to-end for morning and evening.

---

## Phase 6 — Polish, Testing & Deployment

### Goals
- App is production-ready, deployed, and shareable via URL

### Tasks

**6.1 UI polish**
- Consistent spacing, typography, and colour usage across all pages
- Empty states (no confirmed office days, no weather data yet)
- All copy reviewed and finalised in BM (`src/constants/copy.ts`)
- App icon and title in `index.html`

**6.2 Error handling**
- Graceful error states for failed API calls
- Fallback to cached data where available
- Friendly BM error messages

**6.3 Performance**
- Verify TanStack Query caching is working correctly
- Ensure no redundant API calls on re-renders
- Lighthouse mobile score check

**6.4 Testing**
- Manual end-to-end walkthrough:
  - Fresh install → onboarding → weekly view → day detail → leave advisor
  - Telegram notification send
  - Settings update → verify config updates correctly
- Test on real mobile device (not just browser DevTools)

**6.5 Deployment**
- Push to GitHub repository
- Connect to Vercel
- Set `TELEGRAM_BOT_TOKEN` in Vercel environment variables
- Verify Edge Function works in production
- Share URL with at least one friend for real-world config test

---

## Implementation Order Summary

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6
  │           │          │          │          │          │
Config    Weather     Leave      Warnings  Telegram   Deploy
 Setup    + Weekly   Advisor     Banner      Bot
```

Each phase produces a working, testable increment. You can stop after Phase 3 and have a fully functional app — Phases 4 and 5 are additive enhancements.
