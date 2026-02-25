# Deployment Guide

This app deploys to **Vercel** as a static SPA with one Edge Function (`api/met/`) that proxies MET Malaysia API calls server-side.

---

## Prerequisites

- A GitHub account
- A [Vercel](https://vercel.com) account (free tier is enough)
- A MET Malaysia API token — register at [api.met.gov.my](https://api.met.gov.my)

---

## Step 1 — Push the repo to GitHub

If you haven't already:

```bash
git remote add origin https://github.com/<your-username>/elak-hujan.git
git push -u origin main
```

---

## Step 2 — Import the project on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Add GitHub Account** (if not already connected) and authorise Vercel
3. Find the `elak-hujan` repo and click **Import**

---

## Step 3 — Configure build settings

Vercel will auto-detect the framework as **Vite**. The defaults are correct — no changes needed:

| Setting | Value |
|---------|-------|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

---

## Step 4 — Add the MET Malaysia API token

This is the only environment variable required.

1. On the **Configure Project** screen, expand **Environment Variables**
2. Add the following:

| Name | Value |
|------|-------|
| `MET_TOKEN` | your token from api.met.gov.my |

> **Important:** Do NOT prefix it with `VITE_`. It must stay server-side so it is never exposed in the browser.

---

## Step 5 — Deploy

Click **Deploy**. Vercel will:

1. Install dependencies (`npm install`)
2. Build the app (`tsc -b && vite build`)
3. Deploy the `dist/` folder as a static site
4. Deploy `api/met/[...path].ts` as a Vercel Edge Function

The first deployment takes about 1–2 minutes. You'll get a live URL like `https://elak-hujan.vercel.app`.

---

## Step 6 — Open the app and complete onboarding

1. Open the live URL on your phone
2. Go through the onboarding wizard — set your home location, office location, commute windows, and office day preferences
3. Tap **Install** (or **Add to Home Screen**) in your browser to install it as a PWA

---

## Subsequent deployments

Every `git push` to `main` triggers an automatic redeploy on Vercel. No manual steps needed.

```bash
git add .
git commit -m "your message"
git push
```

---

## Verifying the MET API proxy is working

After deployment, open the browser DevTools Network tab and check for requests to `/api/met/locations`. It should return a 200 with a JSON array of Malaysian state locations. If it returns 401, your `MET_TOKEN` is wrong or not set.

---

## Environment variables summary

| Variable | Where to set | Required |
|----------|-------------|----------|
| `MET_TOKEN` | Vercel project → Settings → Environment Variables | Yes |

No other environment variables are needed. Open-Meteo, data.gov.my, and Nominatim are all public APIs that require no key.
