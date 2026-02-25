# PRD – ElakHujan
### Perancang Hujan untuk Rider
**Version:** 0.2
**Author:** Aidil Safwan
**Last Updated:** February 2026

---

## 1. Overview

ElakHujan is a mobile-first React web app that helps scooter commuters in Malaysia plan their office days and commute timing around rain. It combines a weekly planning view with a daily leave-time advisor, personalised through a local configuration setup. All user preferences are stored in the browser's localStorage. A thin Vercel Edge Function proxy is used to forward MET Malaysia API requests server-side (to avoid CORS and keep the API token out of the browser), but no user data ever touches the server.

---

## 2. Problem Statement

Malaysian tropical weather is unpredictable and makes scooter commuting uncomfortable or dangerous. Commuters who have flexible work arrangements (e.g. 3 office days per week) currently have no easy way to:
1. Pick the best days of the week to go to the office based on rain probability during their commute windows.
2. Decide what time to leave the office in the evening to avoid getting caught in the rain.

---

## 3. Goals

| # | Goal |
|---|------|
| G1 | Help users pick the 3 best office days each week based on rain forecast during commute windows |
| G2 | Help users decide when to leave the office in the evening |
| G3 | Be fully configurable per user with no backend or login required |
| G4 | Be shareable — any friend can open the app and set it up for their own commute |
| G5 | All UI copy and labels in Bahasa Melayu as the primary language |

---

## 4. Non-Goals (v1)

- No user accounts or cloud sync (see Section 15 for future plans)
- No Android/iOS native app
- No crowdsourced rain reports or community alerts (see Section 15)
- No paid weather API integrations (MET Malaysia API is free with registration)
- No traffic or route planning

---

## 5. Users

**Primary user:** Aidil — Senior Software Engineer, rides a scooter, flexible 3-days-in-office arrangement, commutes in KL, checks his phone in the morning and evening.

**Secondary users:** Friends with similar flexible office arrangements and scooter/motorcycle commutes, primarily in Malaysia.

---

## 6. User Stories

### 6.1 Weekly Planning
> *"As a user, I want to open the app on Sunday night and see which 3 days next week are best for commuting to the office by scooter, so I can plan my week in advance."*

- Show the next 5 weekdays from today (rolling window, not fixed Mon–Fri calendar week) — this aligns exactly with Open-Meteo's 7-day forecast window
- For each day, display rain probability during the configured morning commute window and evening commute window
- Highlight the recommended N days (default: 3) with the lowest combined rain risk, drawn **only from the user's `preferredDays`** — non-preferred days are shown but never highlighted as recommended unless there are fewer than N preferred days available in the window
- Tapping anywhere on a day card navigates to the Day Detail view

### 6.2 Daily Evening Check-in
> *"As a user, on each evening before an office day, I want to quickly verify whether tomorrow's forecast has changed."*

- Accessible from the weekly view — tapping a day drills into a day detail view
- Show hourly rain probability for the full day with commute windows clearly marked

### 6.3 Leave Time Advisor
> *"As a user, when I'm at the office and it's approaching the end of the day, I want to know the best time to leave to avoid rain during my ride home."*

- Triggered contextually when the current time is within 2 hours before the user's configured evening commute window
- Shows a rolling hourly rain forecast from the current time through the next 3 hours
- Highlights the recommended leave window (lowest rain probability slot)
- Uses the **office location** as the weather reference point
- Displays a **MET Malaysia radar nowcast** section showing current rain status and near-term outlook at 30-minute intervals up to 120 minutes ahead, sourced from the official MET radar observation data (supplementary to the Open-Meteo hourly forecast)

### 6.4 Onboarding & Settings
> *"As a new user, I want a guided setup so I can configure my commute details before using the app."*

- First-launch onboarding wizard with the following steps:
  1. Set home location (map picker or address search)
  2. Set office location (map picker or address search)
  3. Set morning commute window (e.g. 8:00am – 9:00am)
  4. Set evening commute window (e.g. 5:00pm – 6:00pm)
  5. Set number of office days per week (default: 3)
  6. Set preferred days of the week (e.g. Mon, Tue, Wed — flexible)
- All settings editable post-onboarding from a Settings page

---

## 7. Key Screens

| Screen | Description |
|--------|-------------|
| **Weekly View** | Rolling 5-weekday cards showing morning + evening rain risk. Recommended days highlighted. Tapping a card navigates to Day Detail. |
| **Day Detail View** | Hourly rain forecast for a selected day. Commute windows highlighted as bands. |
| **Leave Now Advisor** | Contextual panel (or dedicated view) showing rolling forecast, recommended leave time, and MET radar nowcast (0–120 min). Visible when approaching evening commute window. |
| **Onboarding Wizard** | Step-by-step first-launch setup flow. |
| **Settings Page** | Full config editor — locations, commute windows, office day preferences. |

---

## 8. Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | React + TypeScript | Aidil's primary stack, fast to build |
| Styling | Tailwind CSS + shadcn/ui | Clean, minimal, component-ready |
| State / Storage | localStorage | No backend needed, shareable by design |
| Primary weather API | Open-Meteo (free, no key required) | Hourly precipitation probability, no API key, covers Malaysia |
| Radar nowcast API | MET Malaysia API — api.met.gov.my (free with registration) | Official radar-based nowcast (0–120 min at 10-min intervals); proxied via Vercel Edge Function to avoid CORS and keep token server-side |
| Warnings API | data.gov.my Weather API | Official source for active weather warnings, displayed as dismissible banner |
| API proxy | Vercel Edge Function (`api/met/[...path].ts`) | Forwards MET API calls server-side; `MET_TOKEN` never reaches the browser |
| Location input | Nominatim (OpenStreetMap geocoding) | Free, no API key required |
| Localisation | Bahasa Melayu (primary) | Local-first product, aligns with MET Malaysia data which is also in BM |

**Note on weather data sources:** Open-Meteo is used for all multi-day planning and scoring logic (hourly precipitation probability, 7-day forecast). MET Malaysia API provides radar-derived nowcast data for near-term conditions in the Leave Advisor. data.gov.my is used exclusively to surface active MET Malaysia weather warnings as a banner/alert in the UI.

---

## 9. Weather Data Requirements

**Open-Meteo (primary):**
- Hourly precipitation probability for the next 7 days
- Two separate API calls — one for home location, one for office location
- Refresh strategy: fetch on app open, cache for 30–60 minutes

**MET Malaysia API — api.met.gov.my (radar nowcast):**
- Fetch `OBSERVATION / RAINS` datatypes (`RAINS`, `RAINS10m` … `RAINS120m`) for the user's office state location
- Called via Vercel Edge Function proxy; token stored as server-side env var `MET_TOKEN`
- Refresh every 5 minutes while LeaveAdvisor is open; state location list cached 24 hours
- Displayed as a supplementary "Radar Sekarang" section in the LeaveAdvisor view

**data.gov.my (warnings only):**
- Poll `/weather/warning` on app open
- Filter for warnings relevant to user's configured district/state
- Display as a dismissible alert banner if active warnings exist

---

## 10. Recommendation Logic (v1)

**Rain risk threshold:** A commute window is considered "risky" if average precipitation probability exceeds **40%**. This is the default; user-configurable in settings.

**Day scoring:**
- For each weekday in the rolling 7-day window, fetch hourly rain probability from both home and office locations
- Morning score = average probability across the configured morning commute window (home location, outbound)
- Evening score = average probability across the configured evening commute window (office location, inbound)
- Combined day score = average of morning + evening scores
- Rank weekdays by score (lowest = best)
- **Recommended days selection:** Fill top-N slots from preferred days only, ranked by score. Non-preferred days only appear in the top-N if there are fewer than N preferred days available in the current window. Non-preferred days are always visible on the UI but never carry a "Disyorkan" badge unless filling a gap.
- N = `officeDaysPerWeek` from config

**Leave time recommendation:**
- Fetch hourly rain probability from the office location (Open-Meteo)
- Scan from 1 hour before evening window start through 2 hours after
- Recommend the earliest 1-hour slot where rain probability stays below 40%
- If no dry window exists, surface the least-bad slot with a warning message
- Supplement with MET radar nowcast showing actual rain intensity at 0 / +30 / +60 / +90 / +120 min (binary Kering/Hujan display, calibration TBD once real data values are observed)

---

## 11. Success Metrics (Personal v1)

- App is usable end-to-end within 1 weekend of development
- Aidil uses it for at least 4 consecutive weeks
- At least 1 friend sets it up successfully without guidance

---

## 12. Open Questions

| # | Question |
|---|----------|
| OQ1 | ~~Should weather be fetched for home location, office location, or both?~~ **Resolved: Both.** |
| OQ2 | ~~What rain probability threshold counts as "risky"?~~ **Resolved: 40% default, user-configurable.** |
| OQ3 | ~~Should confirmed office days sync to a calendar or remain app-only?~~ **Superseded: confirmed office day feature removed. DayCard taps now navigate directly to Day Detail.** |
| OQ4 | ~~Telegram notifications?~~ **Deferred to future work. See Section 15.** |

---


## 15. Out of Scope for v1 / Future Work

- Multi-city or multi-user shared dashboard
- Historical rain pattern analysis
- Integration with Google Calendar for office day confirmation
- **Telegram notifications** — morning summary on confirmed office days (rain risk for both commute windows) and an evening nudge with the best leave time recommendation, delivered via a Vercel serverless function holding the bot token; each user stores only their own Chat ID locally
- **User accounts & cloud sync** — allow users to sign in and have their config (locations, commute windows, preferences) synced across devices, rather than being tied to a single browser's localStorage
- **Crowdsourced rain reports** — authenticated users could submit real-time "it's raining here" reports anchored to their coordinates, creating a community-sourced rain layer that complements the NWP model forecast (especially useful for the hyperlocal convective storms that global models miss)
- **Crowdsourced alerts** — users could push or receive alerts from other riders on the same route or area (e.g. "jalan Ampang banjir sekarang"), building a peer-to-peer hazard layer on top of the forecast data
