# v3 landing page — full development record

Status as of this writing: **v3 is live at `https://grubshelf.app/`.** The previous homepage is preserved at `https://grubshelf.app/v2.html`. Nothing was deleted — see [Rollback](#rollback) if you ever need to switch back.

⚠️ **Known gap — analytics is not wired up on the live homepage.** See [Known gaps](#known-gaps--todo) before you rely on conversion numbers. This is documented, not yet fixed.

---

## 1. What v3 is

A full rebuild of the homepage hero + a pass over every section below it, built as a self-contained page (`hero-v3.js` + inline `<style>` in the HTML — no dependency on `styles.css` or `data.js`, unlike the old page).

The old hero (`hero-parallax.js`, still used by `v2.html`) was a mouse-parallax scene: floating emojis, a static phone mockup, headline + CTA text layered on top.

v3's hero (`hero-v3.js`) is a **six-act, scroll-driven story** with no headline or CTA text of its own — the animation is the pitch:

| Act | What happens | Approx. scroll range |
|---|---|---|
| 1. Shelf | 5 pantry items (spinach, avocados, cheddar, eggs, oat milk) sit on a two-tier shelf | 0 – 6% |
| 2. Open air | Items lift off the shelf, drift into open space | 6 – 26% |
| 3. Cart (gather) | Items fly into a shopping cart — dropping in from above the rim like actually placing groceries in a cart, not converging diagonally | 26 – 48% |
| 4. Cart (exit) | Items pop back out of the cart | 48 – 72% |
| 5. Phone (enter) | Items fly into a phone mockup and become the pantry list rows | 72 – 82%+ |
| 6. Notify | Expiry-alert cards spring out of the phone | 82 – 100% |

The hero section is `600vh` tall and `position: sticky`-pinned; all six acts are driven purely by scroll fraction in `updateScroll()` inside `hero-v3.js` (search for `T_AISLE_EXIT_START`, `T_GATHER_START`, `T_EXIT_START`, `T_ENTER_START`, `T_NOTIFY_START` for the exact per-act timing constants).

The scene is built from 5 layered `<div>`s appended into `.hero-sticky` at runtime: aurora blobs → ghost background words → ambient floating groceries → the shelf/cart/phone group → foreground expiry cards. A separate mouse-parallax loop (`tick()`) gently shifts each layer at a different depth for a 3D feel, independent of the scroll story.

## 2. Full timeline of decisions made

In roughly the order they happened:

1. **Built the original v3 hero** as a single-phase morph: floating pantry emojis fly into a phone and become its list, replacing the old parallax hero. Copied `v2.html` → `v3.html` as the starting point.
2. **Fixed `position: sticky` not working** — traced to `body { overflow-x: hidden }`, which makes a browser treat body as a scroll container and breaks `sticky` on descendants. Changed to `overflow-x: clip`, which prevents horizontal scroll without that side effect.
3. **Removed the hero headline and CTA buttons** — the visual story was made to carry the message alone, per your call.
4. **Pulled the foreground "expiry card" callouts inward** — they were clipping off the edge of the viewport on smaller screens (positioned relative to an oversized parallax layer, not the visible viewport).
5. **Found and fixed a real bug**: a "persistent phone" sidebar (meant to float alongside the Problem/Features/etc. sections) had CSS for a `.pp-visible` state but **no JavaScript anywhere ever added that class** — it was permanently invisible, leaving dead space on the right of those sections for as long as it had existed. First wired it up properly (`IntersectionObserver` pair to show/hide it and sync its content to the section in view); then, per your direction, **removed the whole feature** instead and recentered the sections — simpler, and one less moving part.
6. **Rebuilt the hero into the six-act shelf → cart → phone story** described above, replacing the single-phase morph. Extended the hero from `200vh` → `300vh` → `600vh` as the story grew.
7. **Full top-to-bottom deploy-readiness audit** (you asked me to review it "as a top UI/UX designer"). Found and fixed:
   - `--teal` and `--red` CSS variables were used in ~13 places (progress bar, "matched" labels, checkmarks, the CTA badge, a notification dot) but **never defined** — they rendered invisible. Defined them.
   - **Zero `<h1>` anywhere on the page** (lost when the headline was removed) — added a visually-hidden one for SEO/accessibility.
   - **No favicon, Open Graph, Twitter Card, or canonical tags** — present on the old page, missing here. Ported them over (all referenced image assets already existed in `/assets`).
   - `theme-color` didn't match the page's actual background color — fixed.
   - Removed dead code: an unused `data.js` script tag, four permanently-hidden legacy `<div>`s left over from the old hero pattern, a duplicate grain-texture overlay that was invisible due to z-index stacking.
   - Added `aria-hidden="true"` to the decorative hero (so screen readers don't read out background typography like "SPINACH AVOCADO CHICKEN…" as if it were content) and an `aria-label` on the email input.
8. **Enriched the background** — added more ambient floating groceries (tomato, garlic, corn, grapes, onion, potato) and more background "ghost words" (YOGHURT, GARLIC, ONION, CARROT, PASTA, LEMON, RICE, TOMATO) so the scene didn't feel sparse.
9. **Made the shelf and cart illustrations more dimensional** — wood-grain texture and cast shadows on the shelf; a denser wire mesh, rolled rim highlight, 4 wheels + axle, and a contact shadow on the cart.
10. Three quick fixes from visual QA: **hid the nav bar entirely until the hero finishes** (it now fades in only once you've scrolled past it, since there's no headline for it to compete with), **fixed two background words (YOGHURT/ONION) that were overlapping**, and **reverted a backdrop panel behind the shelf** you didn't want.
11. **Changed the cart-entry animation** so items drop into the cart from above (like actually placing groceries in), rather than converging on it diagonally.
12. **Reshuffled the Features section.** The hero tells one focused story (an expiring item becomes a shopping-list item); the Features grid broke that focus by introducing five features at once, two of which (spend tracking, family sync) the hero never hinted at. Pantry / Alerts / Shopping List are now the three primary cards (Shopping List promoted to full width to match); Spend Tracking and Family Sync were demoted to a smaller "Also in the app" row.
13. **Removed eight fabricated testimonials.** The "Early feedback" section had fake names, locations, and specific claims — not honest for a pre-launch product with no real users yet, which you flagged directly ("i dont want to sell a lie"). Replaced with a short, true, first-person "why we're building this" note instead of inventing anything else unverifiable (no fake waitlist counts either). This also happened to restore the section background-color alternation that a straight removal had broken.
14. **Fixed mobile responsiveness** — the phone/cart/shelf were sized with independent `width: min(px, vw)` / `height: min(px, vh)` caps on different axes, which badly distorted them on tall, narrow phone screens (the phone rendered ~97px wide × 430px tall — a sliver, not a phone). Fixed by locking each to its true aspect ratio via CSS `aspect-ratio`, and raising the phone's viewport-width cap so it renders at its full native 210×430 size on virtually any real phone (≥362px wide), since its internal text is sized in fixed px and needs that room.
15. **Fixed a stat-counter bug** — the `£720` / `30%` / `3×` count-up animation assumed `requestAnimationFrame` always passes a valid timestamp. If that assumption ever breaks, the math collapses to `NaN` and stays stuck that way forever. Hardened it to fall back to `performance.now()`.
16. **Wrote this documentation file**, committed, pushed to `origin/main`, and deployed via `vercel --prod`.
17. **Promoted v3 to the homepage.** Renamed the old `index.html` → `v2.html` (kept fully intact, still deployed) and `v3.html` → `index.html`, so `/` serves v3 directly with no rewrite-rule indirection. Committed, pushed, deployed.

## 3. File manifest

```
grubshelf-site/
├── index.html            # LIVE homepage — this is v3. Self-contained (CSS inline, no styles.css/data.js dependency)
├── hero-v3.js             # builds + animates the entire hero scene (all 5 layers, mouse parallax, 6-act scroll story)
├── v2.html                # the previous homepage, kept intact — still deployed at /v2.html
├── hero.js                # old hero script — still used by v2.html only
├── sections.js             # renders v2.html's story/features/stats/quotes/pricing — v2.html only
├── data.js                 # copy/content for v2.html — v2.html only
├── styles.css              # v2.html's stylesheet — v2.html only
├── ads-config.js           # GA4 + Meta Pixel IDs — currently wired into v2.html only (see Known gaps)
└── ads.js                  # consent-gated analytics loader + waitlist funnel event tracking — v2.html only (see Known gaps)
```

## 4. Deployment history

| Commit | What | Live URL after deploy |
|---|---|---|
| `d3c8543` | Added `v3.html` + `hero-v3.js` as a new, separate page | `grubshelf.app/v3` (not the homepage) |
| `baa812e` | Renamed files to promote v3 to homepage, old page preserved as `v2.html` | `grubshelf.app/` → v3, `grubshelf.app/v2.html` → old page |

Both were pushed to `origin/main` on GitHub and deployed to production via `vercel --prod` (Vercel project: `grubshelf-site`, linked via `.vercel/project.json`).

## 5. Known gaps / TODO

### Analytics is not wired up on the live homepage

`v2.html` loads `ads-config.js` + `ads.js`, which handle a **consent-gated** GA4 + Meta Pixel setup, including two custom funnel events (`waitlist_cta_click`, `waitlist_submit`) and a cookie-consent banner. The new `index.html` (v3) **does not load these scripts at all** — so as of the last deploy, **the live homepage has zero analytics and zero cookie consent banner.**

Wiring it up isn't just adding two `<script>` tags — three things would need to happen together:

1. Add `<script src="ads-config.js"></script>` and `<script src="ads.js"></script>` to `index.html`.
2. `ads.js`'s click-tracking looks for `a[href="#vf-waitlist"]` (the old page's anchor id) — v3 uses `#v2-cta`, so the selector (or v3's anchor ids) would need to line up for CTA-click tracking to actually fire.
3. `ads.js` exposes `window.GrubShelfAds.trackLead(source)`, which `sections.js` calls on successful signup (on `v2.html`). v3's newsletter form has its own independent inline submit handler in `index.html` that doesn't call it — that call would need adding there too, for submit tracking to fire.
4. The cookie-consent banner `ads.js` injects (`.cookie-consent` class) is styled in `styles.css`, which v3 doesn't load — it would render unstyled unless that CSS is ported into v3's own `<style>` block.

I haven't done this yet because it involves a few judgment calls (matching anchor ids vs. changing the tracking selector, whether v3 wants the same consent-banner design) that felt worth confirming with you rather than assuming. Ask me when you're ready and I'll wire it up properly.

### Other open items

- `sitemap.xml` still only lists `/`, `/privacy`, `/terms` — correct as-is, since the URL didn't change, only which file backs it. No action needed unless you want `<lastmod>` bumped to reflect this change.
- `v2.html` is still fully deployed and publicly reachable at `/v2.html`. If you'd rather it not be public, that's a separate decision (redirect it, noindex it, or take it down) — not done here.

## 6. Rollback

Nothing was deleted, so reverting the homepage swap is just the reverse rename:

```bash
git mv grubshelf-site/index.html grubshelf-site/v3.html
git mv grubshelf-site/v2.html grubshelf-site/index.html
git commit -m "Roll back homepage to previous version"
git push origin main
cd .. && vercel --prod
```

## 7. Deploying future changes

Same pattern each time — stage deliberately (the repo has other in-progress work unrelated to this page, so avoid `git add -A`), commit, push, then deploy from the repo root:

```bash
git status                 # see what's changed
git add <specific files>   # stage only what you mean to ship
git commit -m "..."
git push origin main
cd .. && vercel --prod
```

I'll always confirm with you in chat before pushing or deploying — just say the word.
