# grubshelf — landing page

Static marketing site for **grubshelf**. No build step, no framework — just HTML, CSS, and vanilla JS. Drop the folder on any static host.

## Files

```
grubshelf-site/
├── index.html              # the page
├── styles.css              # all styling + responsive rules
├── data.js                 # copy / content (edit text here)
├── hero.js                 # scroll-driven desktop hero + mobile hero phone
├── sections.js             # renders story, features, stats, quotes, pricing, FAQ
├── manifest.webmanifest    # PWA manifest
├── robots.txt
└── assets/                 # wordmark, app icon, favicons, OG image
```

## Run locally

From the **repo root** (parent of this folder), with newsletter API:

```bash
cd ..
cp .env.example .env.local   # add BUTTONDOWN_API_KEY
npm run dev                  # → http://127.0.0.1:8080
```

`python3 -m http.server` in this folder only shows the page — **Join the list** will fail without the API. Use `npm run dev` from the repo root instead.

Serve the **folder** over HTTP (don't open `index.html` via `file://`, or the scripts won't load).

## Deploy (Vercel — site + newsletter API)

Deploy from the **parent** repo root (`Main Grubby web/`), not only this folder. Vercel serves static files from `grubshelf-site/` and runs `/api/newsletter` for waitlist signups (Buttondown).

```bash
cd ..   # repo root (parent of grubshelf-site/)
vercel --prod
```

1. In Vercel → **Settings → Environment Variables**, set `BUTTONDOWN_API_KEY` (from [Buttondown → Settings → API](https://buttondown.com/settings/programming)) for Production and Preview.
2. Redeploy after adding the key.

Copy `.env.example` from the repo root to `.env.local` for local API testing:

```bash
BUTTONDOWN_API_KEY=your_key_here
```

### Local development

`python3 -m http.server` inside this folder does **not** run the newsletter API. Use Vercel dev from the repo root:

```bash
cd ..
vercel dev
```

Then open the URL Vercel prints (usually `http://localhost:3000`) and test the waitlist form, or:

```bash
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email":"you@yourdomain.com"}'
```

Expected: `{"ok":true}`. Use a real email; Buttondown often blocks `test@example.com`.

## Before you go live

- Replace the social links in the footer (`index.html`) if needed.
- Point the **Privacy** and **Terms** footer links at real pages.
- Update the canonical/OG URLs in `<head>` if the domain isn't `grubshelf.app`.

## Editing copy

All section text lives in **`data.js`** (beats, features, stats, quotes, FAQs, pricing) and in the static headings inside **`index.html`**.
