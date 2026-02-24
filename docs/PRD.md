# PRD – ElakHujan
### Perancang Hujan untuk Rider
**Version:** 0.1 (Draft)
**Author:** Aidil Safwan
**Last Updated:** February 2026

---

## 1. Overview

ScootWeather is a mobile-first React web app that helps scooter commuters in Malaysia plan their office days and commute timing around rain. It combines a weekly planning view with a daily leave-time advisor, personalised through a local configuration setup. The app is designed to be stateless on the server — all user preferences are stored in the browser's localStorage, making it instantly shareable with friends without requiring accounts or a backend.

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
| G5 | Deliver timely Telegram notifications as a companion nudge layer |
| G6 | All UI copy, labels, and notifications in Bahasa Melayu as the primary language |

---

## 4. Non-Goals (v1)

- No user accounts or cloud sync
- No Android/iOS native app
- No social or sharing features between users
- No paid weather API integrations
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
- Tapping a day card toggles its confirmed office day status (single tap); a chevron button navigates to the Day Detail view

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

### 6.4 Onboarding & Settings
> *"As a new user, I want a guided setup so I can configure my commute details before using the app."*

- First-launch onboarding wizard with the following steps:
  1. Set home location (map picker or address search)
  2. Set office location (map picker or address search)
  3. Set morning commute window (e.g. 8:00am – 9:00am)
  4. Set evening commute window (e.g. 5:00pm – 6:00pm)
  5. Set number of office days per week (default: 3)
  6. Set preferred days of the week (e.g. Mon, Tue, Wed — flexible)
  7. (Optional) Connect Telegram bot
- All settings editable post-onboarding from a Settings page

### 6.5 Telegram Notifications
> *"As a user, I want a Telegram message on my office day mornings summarising rain risk for my commute, and an afternoon nudge if rain is expected during my ride home."*

- Morning alert: Sent on confirmed office days at a configurable time (e.g. 7:30am)
  - Summary: Rain risk for morning window + evening window
- Evening nudge: Sent ~1 hour before the evening commute window on office days
  - Summary: Best leave time recommendation
- User connects via a Telegram bot (token stored locally in config)

---

## 7. Key Screens

| Screen | Description |
|--------|-------------|
| **Weekly View** | Mon–Fri cards showing morning + evening rain risk. Recommended days highlighted. User can tap to confirm office days. |
| **Day Detail View** | Hourly rain forecast for a selected day. Commute windows highlighted as bands. |
| **Leave Now Advisor** | Contextual panel (or dedicated view) showing rolling forecast and recommended leave time. Visible when approaching evening commute window. |
| **Onboarding Wizard** | Step-by-step first-launch setup flow. |
| **Settings Page** | Full config editor — locations, commute windows, office day preferences, Telegram setup. |

---

## 8. Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | React + TypeScript | Aidil's primary stack, fast to build |
| Styling | Tailwind CSS + shadcn/ui | Clean, minimal, component-ready |
| State / Storage | localStorage | No backend needed, shareable by design |
| Primary weather API | Open-Meteo (free, no key required) | Hourly precipitation probability, no API key, covers Malaysia |
| Secondary weather API | data.gov.my Weather API (MET Malaysia) | Official source for active weather warnings only |
| Location input | Nominatim (OpenStreetMap geocoding) | Free, no API key required |
| Notifications | Telegram Bot API | User-configured, lightweight push layer |
| Localisation | Bahasa Melayu (primary) | Local-first product, aligns with MET Malaysia data which is also in BM |

**Note on weather data sources:** data.gov.my provides daily forecasts in morning/afternoon/night buckets (text-based, Bahasa Melayu) — insufficient for hourly commute planning. Open-Meteo is used for all planning and scoring logic. data.gov.my is used exclusively to surface active MET Malaysia weather warnings as a banner/alert in the UI.

---

## 9. Weather Data Requirements

**Open-Meteo (primary):**
- Hourly precipitation probability for the next 7 days
- Two separate API calls — one for home location, one for office location
- Refresh strategy: fetch on app open, cache for 30–60 minutes

**data.gov.my (secondary — warnings only):**
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
- Fetch hourly rain probability from the office location
- Scan from 1 hour before evening window start through 2 hours after
- Recommend the earliest 1-hour slot where rain probability stays below 40%
- If no dry window exists, surface the least-bad slot with a warning message

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
| OQ3 | ~~Should confirmed office days sync to a calendar or remain app-only?~~ **Resolved: App-only.** |
| OQ4 | ~~Telegram bot architecture?~~ **Resolved: Single bot owned by developer, each user stores their own Chat ID locally. See Section 14.** |

---

## 14. Telegram Bot — How It Works

A Telegram bot is essentially a special Telegram account that can send and receive messages programmatically via the Telegram Bot API.

**Setup (one-time, done by you as the developer):**
1. Message `@BotFather` on Telegram and create a new bot — you'll receive a **Bot Token** (a secret string)
2. Deploy a minimal backend (or use a serverless function on Vercel) that holds this token and handles sending notifications
3. Each user who wants notifications must start a chat with your bot on Telegram, which gives them a **Chat ID**
4. The user enters their Chat ID in the app's settings — this is stored in their localStorage

**How notifications are sent:**
- The web app calls your serverless function with the user's Chat ID + message
- The function calls the Telegram Bot API using the bot token to deliver the message
- The token stays server-side (never exposed in the browser); the Chat ID is the only user-specific piece

**For v1 simplicity:** You create and own one bot. All users (you + friends) use the same bot but each have their own Chat ID. This is the standard pattern and requires no complex infrastructure — a single Vercel serverless function is enough.

**User onboarding flow for Telegram:**
1. User opens app settings → Telegram section
2. App shows a link to your bot on Telegram
3. User clicks, starts the bot, and it responds with their Chat ID
4. User pastes the Chat ID into the app settings — done

---

## 15. Out of Scope for v1 / Future Considerations

- Multi-city or multi-user shared dashboard
- Historical rain pattern analysis
- Integration with Google Calendar for office day confirmation
