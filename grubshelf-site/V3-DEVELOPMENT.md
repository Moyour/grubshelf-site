# v3 landing page — development notes

`v3.html` (+ `hero-v3.js`) is a redesigned variant of the landing page, built alongside the existing `index.html`. It is **not live** — it only serves at `/v3.html` right now. `index.html` is still what visitors get at `/`.

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
├── v3.html        # the v3 page — self-contained (all CSS inline in <style>)
└── hero-v3.js      # builds + animates the entire hero scene
```

`v3.html` does **not** use `data.js` or `styles.css` — it's intentionally self-contained.

## Current status / open decisions

- `v3.html` is only reachable at `/v3.html`. It is **not** wired into `vercel.json`'s rewrite rule or `sitemap.xml` as the homepage — that's a deliberate choice to leave open until you decide to promote it.
- Not committed to git yet (see below).

## Deploying, when you're ready

**1. Review what you're about to commit.** The repo has other in-progress changes unrelated to v3 (from other work), so stage deliberately rather than `git add -A`:

```bash
git status                 # see everything that's changed
git add grubshelf-site/v3.html grubshelf-site/hero-v3.js grubshelf-site/V3-DEVELOPMENT.md
git status                 # confirm only those are staged
```

**2. Commit:**

```bash
git commit -m "Add v3 landing page: scroll-driven hero story, honest pre-launch copy"
```

**3. Push:**

```bash
git push origin main
```

**4. Deploy to Vercel.** Per the main [README](README.md#deploy-vercel--site--newsletter-api), deploy from the **repo root** (parent of `grubshelf-site/`):

```bash
cd ..
vercel --prod
```

This publishes `v3.html` at `https://grubshelf.app/v3.html` (or your custom domain) — it still won't be the homepage until `vercel.json` and `sitemap.xml` are updated to point `/` at it, which is a separate, deliberate step.

Just ask me when you're ready for any of this and I'll walk through it with you (or do it directly, with your go-ahead — pushing and deploying are the kind of actions I'll always confirm with you first).
