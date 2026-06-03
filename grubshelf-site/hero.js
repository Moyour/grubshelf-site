/* grubshelf, hero scroll animation (ported from hero-section.tsx) */

(function () {
  const clamp = (t) => Math.max(0, Math.min(1, t));
  const lerp = (a, b, t) => a + (b - a) * clamp(t);
  const range = (p, a, b) => clamp((p - a) / (b - a));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  const TONES = {
    good: { bg: "rgba(29,158,117,0.18)", fg: "#1d9e75" },
    warn: { bg: "rgba(232,160,32,0.20)", fg: "#ba7517" },
    bad: { bg: "rgba(163,45,45,0.18)", fg: "#a32d2d" },
  };

  const stage = document.querySelector(".hero-stage");
  if (!stage) return;

  // ---- Build the stage DOM ----
  stage.innerHTML = `
    <div class="h-magnet"></div>
    <div class="h-magnet-shadow"></div>

    <div class="h-paper">
      <div class="h-paper-redline"></div>
      <div class="h-paper-tape"></div>
      <div class="h-paper-date">tuesday · grocery run</div>
      <div class="h-paper-list">
        ${HERO_ITEMS.map((it) => `<div class="h-paper-item">${it.text}</div>`).join("")}
      </div>
    </div>

    ${HERO_ITEMS.map((it) => `<div class="h-fly">${it.text}</div>`).join("")}

    <div class="h-phone">
      <div class="h-phone-body">
        <div class="h-phone-notch"></div>
        <div class="h-phone-screen">
          <div class="statusbar">
            <span>9:41</span>
            <span class="right"><span>•••</span><span>5G</span><span>96</span></span>
          </div>
          <div style="margin-top:6px">
            <div class="eyebrow">Tuesday&rsquo;s run</div>
            <div class="screen-title" style="font-size:22px">Grocery list</div>
            <div class="screen-meta" style="font-size:12px">5 items · ~$58</div>
          </div>
          <div class="h-phone-list">
            ${HERO_ITEMS.map((it) => `
              <div class="h-phone-item">
                <div class="h-phone-check"></div>
                <span class="item-name" style="font-size:18px;flex:1">${it.text}</span>
                <span class="tag ${it.tone}">${it.expiry}</span>
              </div>`).join("")}
          </div>
          <div class="h-phone-tabbar">
            <div class="h-tab active">Pantry</div>
            <div class="h-tab">Spend</div>
            <div class="h-tab">Shop</div>
          </div>
        </div>
      </div>
      <div class="h-phone-glow"></div>
    </div>
  `;

  // Inject the hero stage styles (kept here so they live with the animation)
  const css = document.createElement("style");
  css.textContent = `
    .h-magnet { position:absolute; right:40%; top:20%; width:28px; height:28px; border-radius:50%;
      background:var(--amber); box-shadow:0 6px 16px rgba(0,0,0,0.5), inset -2px -2px 4px rgba(0,0,0,0.3); }
    .h-magnet-shadow { position:absolute; right:38%; top:22%; width:60px; height:60px; border-radius:50%;
      background:rgba(0,0,0,0.25); filter:blur(10px); }
    .h-paper { position:absolute; width:280px; height:380px; transform-origin:center center; transform-style:preserve-3d;
      background:var(--paper); border-radius:4px; padding:36px 32px;
      background-image:repeating-linear-gradient(0deg, transparent, transparent 35px, rgba(4,52,44,0.08) 35px, rgba(4,52,44,0.08) 36px);
      transition:opacity 0.3s; }
    .h-paper-redline { position:absolute; left:50px; top:16px; bottom:16px; width:1px; background:rgba(163,45,45,0.3); }
    .h-paper-tape { position:absolute; top:-10px; left:50%; transform:translateX(-50%) rotate(-2deg);
      width:70px; height:22px; background:rgba(232,160,32,0.5); backdrop-filter:blur(2px); }
    .h-paper-date { font-family:var(--font-hand); font-size:16px; color:rgba(4,52,44,0.5); text-align:right; margin-bottom:12px; padding-right:4px; }
    .h-paper-list { font-family:var(--font-hand); font-size:26px; line-height:40px; color:var(--ink); padding-left:22px; }
    .h-fly { position:absolute; left:50%; top:50%; font-family:var(--font-hand); font-size:24px; color:var(--paper);
      white-space:nowrap; text-shadow:0 6px 20px rgba(0,0,0,0.6), 0 2px 6px rgba(232,160,32,0.3); pointer-events:none; z-index:30; opacity:0; }
    .h-phone { position:absolute; right:25%; top:50%; width:280px; height:560px; transform-style:preserve-3d; opacity:0; transition:opacity 0.3s; }
    .h-phone-body { width:100%; height:100%; background:#1f1f1d; border-radius:44px; border:3px solid #3a3a36; padding:8px;
      position:relative; box-shadow:inset 0 0 0 1px rgba(232,160,32,0.15); }
    .h-phone-notch { position:absolute; top:16px; left:50%; transform:translateX(-50%); width:110px; height:30px; background:#000; border-radius:18px; z-index:2; }
    .h-phone-screen { width:100%; height:100%; background:var(--cream); border-radius:36px; padding:52px 18px 18px;
      display:flex; flex-direction:column; gap:10px; position:relative; overflow:hidden; }
    .h-phone-list { display:flex; flex-direction:column; gap:6px; margin-top:8px; }
    .h-phone-item { display:flex; align-items:center; gap:10px; padding:8px 10px; background:var(--paper);
      border-radius:10px; border:1px solid var(--paper-border); opacity:0; }
    .h-phone-check { width:16px; height:16px; border:1.5px solid #d3c5a3; border-radius:4px; flex-shrink:0; }
    .h-phone-tabbar { margin-top:auto; display:flex; gap:6px; padding:6px; background:var(--paper);
      border-radius:12px; border:1px solid var(--paper-border); opacity:0; }
    .h-tab { flex:1; padding:8px 10px; text-align:center; color:var(--subtle); font-family:var(--font-outfit); font-weight:500; font-size:11px; border-radius:8px; }
    .h-tab.active { background:var(--bg-teal); color:var(--text-on-dark); font-weight:600; }
    .h-phone-glow { position:absolute; inset:-20px; border-radius:60px; pointer-events:none; }
  `;
  document.head.appendChild(css);

  // ---- Grab refs ----
  const heroSection = document.querySelector(".hero");
  const magnet = stage.querySelector(".h-magnet");
  const magnetShadow = stage.querySelector(".h-magnet-shadow");
  const paper = stage.querySelector(".h-paper");
  const paperTape = stage.querySelector(".h-paper-tape");
  const paperItems = [...stage.querySelectorAll(".h-paper-item")];
  const flyItems = [...stage.querySelectorAll(".h-fly")];
  const phone = stage.querySelector(".h-phone");
  const phoneGlow = stage.querySelector(".h-phone-glow");
  const phoneItems = [...stage.querySelectorAll(".h-phone-item")];
  const tabbar = stage.querySelector(".h-phone-tabbar");

  function render(progress) {
    const liftP = easeOut(range(progress, 0.15, 0.4));
    const dissolveP = easeOut(range(progress, 0.4, 0.65));
    const phoneP = easeOut(range(progress, 0.65, 0.85));

    // magnet
    magnet.style.opacity = 1 - liftP * 0.7;
    magnet.style.transform = `scale(${1 - liftP * 0.3})`;
    magnetShadow.style.opacity = (1 - liftP) * 0.8;

    // paper
    paper.style.right = `${lerp(40, 55, dissolveP)}%`;
    paper.style.top = `${lerp(48, 35, liftP)}%`;
    paper.style.transform = `translate(50%, -50%)
      rotateX(${lerp(0, 25, liftP)}deg)
      rotateY(${lerp(-3, -22, liftP)}deg)
      rotateZ(${lerp(-3, -10, liftP) + lerp(0, 15, dissolveP)}deg)
      translateZ(${lerp(0, 180, liftP)}px)
      scale(${lerp(1, 0.92, liftP) * (1 - phoneP * 0.4)})`;
    paper.style.opacity = 1 - phoneP;
    paper.style.boxShadow = liftP > 0.1
      ? `0 ${40 + liftP * 60}px ${60 + liftP * 80}px -20px rgba(0,0,0,${0.4 + liftP * 0.3}), 0 ${10 + liftP * 20}px ${20 + liftP * 30}px rgba(0,0,0,0.2)`
      : "0 12px 24px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)";
    paperTape.style.opacity = 1 - liftP;

    paperItems.forEach((el, i) => {
      const p = easeOut(range(dissolveP, i / 8, (i + 4) / 8));
      el.style.opacity = 1 - p;
      el.style.transform = `translateX(${p * (15 + i * 6)}px) translateY(${-p * (8 + i * 3)}px) rotate(${p * (i - 2) * 4}deg)`;
      el.style.filter = `blur(${p * 1.5}px)`;
    });

    // flying items (quadratic bezier through 3D)
    flyItems.forEach((el, i) => {
      const startP = i / 8;
      const itemP = easeOut(range(progress, 0.42 + startP * 0.04, 0.78 + startP * 0.02));
      const t = itemP;
      const startX = -100, midX = -180 + i * 25, endX = 0;
      const startY = -150 + i * 50, midY = -250 + i * 20, endY = -180 + i * 60;
      const startZ = 100, midZ = 400, endZ = 0;
      const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * midX + t * t * endX;
      const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * midY + t * t * endY;
      const z = (1 - t) * (1 - t) * startZ + 2 * (1 - t) * t * midZ + t * t * endZ;
      const visible = itemP > 0.01 && itemP < 0.99;
      el.style.opacity = visible ? Math.sin(itemP * Math.PI) : 0;
      el.style.transform = `translate(${x}px, ${y}px) translateZ(${z}px) rotate(${(i - 2) * 6 + t * 30}deg) scale(${0.8 + Math.sin(t * Math.PI) * 0.4})`;
    });

    // phone
    phone.style.transform = `translate(50%, -50%)
      translateY(${lerp(120, 0, phoneP)}px)
      scale(${lerp(0.85, 1, phoneP)})
      rotateY(${lerp(-15, 0, phoneP)}deg)`;
    phone.style.opacity = phoneP;
    phone.style.filter = `drop-shadow(0 ${40 + phoneP * 30}px ${60 + phoneP * 40}px rgba(0,0,0,${0.4 + phoneP * 0.3}))`;
    phoneGlow.style.boxShadow = `0 0 80px ${20 + phoneP * 40}px rgba(232,160,32,${phoneP * 0.15})`;

    phoneItems.forEach((el, i) => {
      const landP = easeOut(range(progress, 0.72 + i * 0.02, 0.84 + i * 0.02));
      el.style.opacity = landP;
      el.style.transform = `translateY(${(1 - landP) * 12}px) scale(${0.94 + landP * 0.06})`;
      el.style.boxShadow = landP > 0.5 ? "0 2px 4px rgba(4,52,44,0.04)" : "none";
    });
    tabbar.style.opacity = easeOut(range(progress, 0.84, 0.92));

    // scroll hint
    const hint = document.querySelector(".scroll-hint");
    if (hint) hint.style.opacity = 1 - progress * 4;
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const rect = heroSection.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = -rect.top;
      render(clamp(scrolled / total));
      ticking = false;
    });
  }

  render(0);

  // ---- Mobile hero phone (shown only on phones via CSS) ----
  const heroMobile = document.querySelector(".hero-mobile");
  if (heroMobile) {
    heroMobile.innerHTML = `
      <div class="phone">
        <div class="notch"></div>
        <div class="screen">
          <div class="statusbar">
            <span>9:41</span>
            <span class="right"><span>•••</span><span>5G</span><span>96</span></span>
          </div>
          <div class="screen-body" style="padding:50px 16px 0;display:flex;flex-direction:column;gap:10px">
            <div>
              <div class="eyebrow">Tuesday&rsquo;s run</div>
              <div class="screen-title">Grocery list</div>
              <div class="screen-meta">5 items · ~$58</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;margin-top:4px">
              ${HERO_ITEMS.map((it, i) => `
                <div class="row-card" style="padding:10px 12px;animation-delay:${0.45 + i * 0.09}s">
                  <div class="checkbox"></div>
                  <span class="item-name" style="flex:1">${it.text}</span>
                  <span class="tag ${it.tone}">${it.expiry}</span>
                </div>`).join("")}
            </div>
            <div style="margin-top:auto;display:flex;gap:6px;padding:6px;background:var(--paper);border-radius:12px;border:1px solid var(--paper-border)">
              <div style="flex:1;padding:8px 10px;text-align:center;background:var(--bg-teal);color:var(--text-on-dark);border-radius:8px;font-family:var(--font-outfit);font-weight:600;font-size:11px">Pantry</div>
              <div style="flex:1;padding:8px 10px;text-align:center;color:var(--subtle);font-family:var(--font-outfit);font-weight:500;font-size:11px">Spend</div>
              <div style="flex:1;padding:8px 10px;text-align:center;color:var(--subtle);font-family:var(--font-outfit);font-weight:500;font-size:11px">Shop</div>
            </div>
          </div>
        </div>
      </div>`;
  }

  // ---- Attach scroll animation on desktop only ----
  const mq = window.matchMedia("(min-width: 761px)");
  let attached = false;
  function attach() {
    if (attached) return;
    attached = true;
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
  }
  function detach() {
    if (!attached) return;
    attached = false;
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  }
  function syncMode() { mq.matches ? attach() : detach(); }
  syncMode();
  if (mq.addEventListener) mq.addEventListener("change", syncMode);
  else if (mq.addListener) mq.addListener(syncMode);

  // ---- One-time "glimpse the payoff" tease: previews the phone in the first ~2s ----
  // Desktop only, respects reduced-motion, and only when the page loads at the top.
  (function tease() {
    if (!mq.matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.scrollY > 4) return;

    let cancelled = false, rafId = 0;
    const progressNow = () => {
      const rect = heroSection.getBoundingClientRect();
      return clamp(-rect.top / (rect.height - window.innerHeight));
    };
    const events = ["wheel", "touchstart", "keydown", "scroll"];
    function stop() {
      if (cancelled) return;
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      render(progressNow());
      events.forEach((e) => window.removeEventListener(e, stop));
    }
    events.forEach((e) => window.addEventListener(e, stop, { passive: true }));

    const peak = 0.85, upMs = 1500, holdMs = 550, downMs = 950, startDelay = 950;
    const t0 = performance.now() + startDelay;
    function frame(now) {
      if (cancelled) return;
      if (window.scrollY > 4) { stop(); return; }
      const t = now - t0;
      let p;
      if (t < 0) p = 0;
      else if (t < upMs) p = easeOut(t / upMs) * peak;
      else if (t < upMs + holdMs) p = peak;
      else if (t < upMs + holdMs + downMs) p = peak * (1 - easeOut((t - upMs - holdMs) / downMs));
      else { render(0); cancelled = true; events.forEach((e) => window.removeEventListener(e, stop)); return; }
      render(p);
      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);
  })();
})();
