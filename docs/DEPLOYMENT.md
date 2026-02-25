# Deployment Guide

This app deploys to **Netlify** as a static SPA with one Edge Function (`netlify/edge-functions/met-proxy.ts`) that proxies MET Malaysia API calls server-side.

---

## Prerequisites

- A GitHub account
- A [Netlify](https://netlify.com) account (free tier is enough)
- A MET Malaysia API token — register at [api.met.gov.my](https://api.met.gov.my)

---

## Step 1 — Push the repo to GitHub

If you haven't already:

```bash
git remote add origin https://github.com/<your-username>/elak-hujan.git
git push -u origin main
```

---

## Step 2 — Import the project on Netlify

1. Go to [app.netlify.com](https://app.netlify.com) and log in
2. Click **Add new site → Import an existing project**
3. Choose **GitHub** and authorise Netlify if prompted
4. Find and select the `elak-hujan` repo

---

## Step 3 — Configure build settings

Netlify will read `netlify.toml` automatically — no manual changes needed. Confirm the settings look like this before deploying:

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Publish directory | `dist` |

---

## Step 4 — Add the MET Malaysia API token

1. On the **Configure site** screen, expand **Environment variables**
2. Add the following:

| Key | Value |
|-----|-------|
| `MET_TOKEN` | your token from api.met.gov.my |

> **Important:** Do NOT prefix it with `VITE_`. It must stay server-side so it is never exposed in the browser.

---

## Step 5 — Deploy

Click **Deploy site**. Netlify will:

1. Install dependencies (`npm install`)
2. Build the app (`tsc -b && vite build`)
3. Deploy the `dist/` folder as a static site
4. Deploy `netlify/edge-functions/met-proxy.ts` as an Edge Function on the Deno runtime

The first deployment takes about 1–2 minutes. You'll get a live URL like `https://elak-hujan.netlify.app`.

---

## Step 6 — Open the app and complete onboarding

1. Open the live URL on your phone
2. Go through the onboarding wizard — set your home location, office location, commute windows, and office day preferences
3. Tap **Add to Home Screen** in your browser to install it as a PWA

---

## Subsequent deployments

Every `git push` to `main` triggers an automatic redeploy on Netlify. No manual steps needed.

```bash
git add .
git commit -m "your message"
git push
```

---

## Verifying the MET API proxy is working

After deployment, open browser DevTools → Network tab and look for a request to `/api/met/locations`. It should return 200 with a JSON array of Malaysian state locations. If it returns 401, the `MET_TOKEN` env var is missing or incorrect.

---

## Environment variables summary

| Variable | Where to set | Required |
|----------|-------------|----------|
| `MET_TOKEN` | Netlify site → Site configuration → Environment variables | Yes |

No other environment variables are needed. Open-Meteo, data.gov.my, and Nominatim are all public APIs that require no key.
