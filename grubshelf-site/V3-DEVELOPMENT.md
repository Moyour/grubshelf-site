# v3 landing page — development notes

`v3.html` (+ `hero-v3.js`) is a redesigned version of the landing page, originally built alongside the previous homepage. **It is now the homepage.** The file that used to be `index.html` was renamed to `v2.html` (kept for reference, still fully intact — nothing was deleted), and the v3 file was renamed to `index.html`, so `/` now serves v3 with no config/rewrite trickery needed. `/v2.html` still serves the previous version if you want to compare or roll back.

## What changed from the original hero

The old hero (`hero-parallax.js`) was a mouse-parallax scene with floating emojis, a static phone mockup, and headline + CTA text over the top.

v3's hero (`hero-v3.js`) replaces that with a scroll-driven story, no headline/CTA text — the animation carries the message on its own:

1. **Shelf** — pantry items (spinach, avocados, cheddar, eggs, oat milk) sit on a two-tier shelf.
2. **Open air** — items lift off the shelf.
3. **Cart** — items fly into a shopping cart, dropping in from above the rim (not converging diagonally).
4. **Exit** — items pop back out of the cart.
5. **Phone** — items fly into a phone mockup and become the pantry list rows.
6. **Notify** — expiry-alert cards spring out of the phone.

The hero is `600vh` tall (sticky-pinned), driven entirely by scroll position — see the `updateScroll()` function in `hero-v3.js` for the six-act timing.

## Other decisions made along the way

- **Nav is hidden during the hero**, fading in only once you scroll past it — the hero has no text/CTA of its own, so there's nothing for the nav to compete with until the story ends.
- **Persistent-phone sidebar removed.** An earlier version had a phone mockup that was supposed to float alongside the Problem/Features/etc. sections, but the JS that was meant to show it had never been wired up — it was permanently invisible, leaving dead space on the right of those sections. Rather than fix and keep it, it was removed and the sections were recentered.
- **Features section reshuffled.** The hero tells one focused story (an expiring item becomes a shopping-list item). The original Features grid broke that focus by introducing five features at once, two of which (spend tracking, family sync) the hero never hinted at. Now only Pantry / Alerts / Shopping List are primary cards; Spend Tracking and Family Sync are demoted to a smaller "Also in the app" row.
- **Fake testimonials removed.** The "Early feedback" section had eight fabricated reviews with fake names/locations — not honest for a pre-launch, no-users-yet product. It's replaced with a short, real "why we're building this" note instead of inventing anything else unverifiable (no fake waitlist counts either).
- **Mobile responsiveness fix.** The phone/cart/shelf were sized with independent `width: min(px, vw)` / `height: min(px, vh)` caps, which distorted badly on tall narrow phone screens (the phone rendered ~97px wide × 430px tall). Fixed by locking each to its real aspect ratio via CSS `aspect-ratio`, and raising the phone's width cap so it renders at full native size on virtually any phone (≥362px wide) — its internal text is sized in fixed px and needs the room.
- **Stat-counter NaN bug fixed.** The count-up animation (`£720` / `30%` / `3×`) assumed `requestAnimationFrame` always passes a valid timestamp; hardened it to fall back to `performance.now()` if not, so it can't get stuck showing "NaN".
- Fixed a handful of deploy-readiness issues: undefined `--teal`/`--red` CSS variables (several UI elements were invisible), missing favicon/Open Graph/Twitter meta tags, no `<h1>` on the page, dead/unused markup and scripts.

## Files

```
grubshelf-site/
├── index.html      # the homepage — this is v3's content now (self-contained, CSS inline)
├── hero-v3.js       # builds + animates the entire hero scene
└── v2.html          # the previous homepage, kept intact for reference/rollback
```

`index.html` does **not** use `data.js` or `styles.css` — it's intentionally self-contained. (`v2.html` still uses both, plus `hero.js`, `sections.js`, etc. — untouched.)

## Current status

- Live at `https://grubshelf.app/` as of this deploy.
- `v2.html` is still deployed too, at `https://grubshelf.app/v2.html`, in case you want to compare or roll back.
- `sitemap.xml` still only lists `/`, `/privacy`, `/terms` — no change needed there since the URL didn't change, only which file backs it.

## Rolling back, if you ever need to

Since nothing was deleted, reverting is just the reverse rename:

```bash
git mv grubshelf-site/index.html grubshelf-site/v3.html
git mv grubshelf-site/v2.html grubshelf-site/index.html
git commit -m "Roll back homepage to previous version"
git push origin main
cd .. && vercel --prod
```

## Deploying changes going forward

Same as any other change to this repo — stage deliberately (the repo has other in-progress work unrelated to this page, so avoid `git add -A`), commit, push, then deploy from the repo root:

```bash
git add grubshelf-site/index.html grubshelf-site/hero-v3.js grubshelf-site/v2.html grubshelf-site/V3-DEVELOPMENT.md vercel.json
git commit -m "your message"
git push origin main
cd .. && vercel --prod
```

I'll always confirm with you before pushing or deploying — just say the word.
