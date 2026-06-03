/* grubshelf, section rendering + interactions */

(function () {
  const esc = (s) => s;

  /* ---------------- STORY ---------------- */
  function beatVisual(kind) {
    if (kind === "paper-blank") {
      return `<div class="beat-visual" style="background:var(--paper);border-radius:4px;padding:24px;
        box-shadow:0 12px 24px rgba(4,52,44,0.12),0 4px 8px rgba(4,52,44,0.06);transform:rotate(-2.5deg);
        background-image:repeating-linear-gradient(0deg,transparent,transparent 27px,rgba(4,52,44,0.08) 27px,rgba(4,52,44,0.08) 28px);position:relative;height:200px">
        <div style="position:absolute;left:38px;top:14px;bottom:14px;width:1px;background:rgba(163,45,45,0.3)"></div>
        <div style="font-family:var(--font-hand);font-size:22px;color:var(--ink);line-height:28px;padding-left:18px">eggs???</div>
      </div>`;
    }
    if (kind === "cart-mess") {
      const lines = ["×3 pasta (have 2)", "×2 milk (have 1)", "×1 yogurt fancy", "snacks ×4"];
      return `<div class="beat-visual" style="background:var(--bg-teal);border-radius:12px;padding:20px;height:200px;color:var(--text-on-dark);display:flex;flex-direction:column;justify-content:space-between">
        <div class="eyebrow" style="color:rgba(225,245,238,0.5);margin:0">In your cart</div>
        <div style="display:flex;flex-direction:column;gap:6px">
          ${lines.map((s, i) => `<div style="font-family:var(--font-hand);font-size:16px;color:${i < 2 ? "var(--amber)" : "var(--text-on-dark)"}">${s}</div>`).join("")}
        </div>
        <div style="font-family:var(--font-mono);font-size:11px;color:var(--amber);font-weight:600">2 already at home</div>
      </div>`;
    }
    if (kind === "receipt") {
      return `<div class="beat-visual" style="background:var(--paper);padding:20px 16px;height:220px;box-shadow:0 12px 24px rgba(4,52,44,0.1);
        font-family:var(--font-mono);font-size:10px;color:var(--ink);line-height:1.6;position:relative;transform:rotate(1.5deg);
        clip-path:polygon(0 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,8px 100%,0 calc(100% - 8px))">
        <div style="text-align:center;font-weight:600;margin-bottom:8px">BIG GROCER · 4:47PM</div>
        <div style="border-top:1px dashed #c0b094;border-bottom:1px dashed #c0b094;padding:6px 0;display:flex;flex-direction:column;gap:2px">
          <div style="display:flex;justify-content:space-between"><span>YOGURT FANCY</span><span>6.49</span></div>
          <div style="display:flex;justify-content:space-between"><span>SNACK MIX</span><span>5.99</span></div>
          <div style="display:flex;justify-content:space-between"><span>PASTA SAUCE</span><span>7.29</span></div>
          <div style="display:flex;justify-content:space-between"><span>... 14 more</span><span>...</span></div>
        </div>
        <div style="margin-top:8px;display:flex;justify-content:space-between;font-weight:700;font-size:12px"><span>TOTAL</span><span>$87.43</span></div>
        <div style="margin-top:6px;color:var(--danger);font-size:9px">+$31 over your usual</div>
      </div>`;
    }
    if (kind === "fridge-bad") {
      const items = [
        { name: "berries", state: "gone furry", tone: "var(--danger)" },
        { name: "spinach", state: "liquefied", tone: "var(--danger)" },
        { name: "avocados", state: "today", tone: "var(--amber)" },
      ];
      return `<div class="beat-visual" style="background:linear-gradient(180deg,#021f1a 0%,#04342c 100%);border-radius:12px;padding:16px;height:200px;display:flex;flex-direction:column;gap:8px">
        <div class="eyebrow" style="color:rgba(225,245,238,0.5);margin:0">Day 6 · back of fridge</div>
        <div style="display:flex;flex-direction:column;gap:6px">
          ${items.map((it, i) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:rgba(225,245,238,0.05);border-radius:6px;border:1px solid rgba(225,245,238,0.08)">
            <span style="font-family:var(--font-hand);font-size:16px;color:var(--text-on-dark);text-decoration:${i < 2 ? "line-through" : "none"};opacity:${i < 2 ? 0.5 : 1}">${it.name}</span>
            <span style="font-family:var(--font-mono);font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:${it.tone};font-weight:600">${it.state}</span>
          </div>`).join("")}
        </div>
        <div style="margin-top:auto;font-family:var(--font-mono);font-size:11px;color:var(--danger);font-weight:600">~$23 binned</div>
      </div>`;
    }
    if (kind === "phone-end") {
      return `<div class="beat-visual" style="background:var(--ink);border-radius:24px;padding:8px;height:220px;width:130px;align-self:center;box-shadow:0 20px 40px rgba(4,52,44,0.25);position:relative">
        <div style="background:var(--cream);border-radius:18px;width:100%;height:100%;padding:16px 8px 8px;display:flex;flex-direction:column;gap:4px">
          <div style="font-family:var(--font-mono);font-size:7px;letter-spacing:0.18em;text-transform:uppercase;color:var(--subtle);text-align:center;margin-bottom:4px">· grubshelf ·</div>
          ${["eggs", "oat milk", "spinach", "tomatoes"].map((s) => `<div style="padding:4px 6px;background:var(--paper);border-radius:5px;border:1px solid var(--paper-border);font-family:var(--font-hand);font-size:11px;color:var(--ink)">${s}</div>`).join("")}
        </div>
      </div>`;
    }
    return "";
  }

  document.querySelector(".story-beats").innerHTML = BEATS.map((b) => `
    <div class="beat reveal">
      <div class="beat-n">${b.n}</div>
      <div>
        <h3>${b.title}</h3>
        <p>${b.body}</p>
      </div>
      ${beatVisual(b.visual)}
    </div>
  `).join("");

  /* ---------------- PRODUCT FEATURES ---------------- */
  function pantryMock() {
    return `<div class="phone"><div class="notch"></div><div class="screen">
      <div class="statusbar"><span>9:41</span><span class="right"><span>•••</span><span>5G</span><span>96</span></span></div>
      <div class="screen-body" style="padding:50px 16px 0;display:flex;flex-direction:column;gap:8px">
        <div>
          <div class="eyebrow">In the fridge</div>
          <div class="screen-title">Pantry</div>
          <div class="screen-meta">32 items · 3 expiring soon</div>
        </div>
        <div class="chip-row">
          ${["All", "Expiring", "Fresh", "Low"].map((p, i) => `<span class="chip${i === 1 ? " active" : ""}">${p}</span>`).join("")}
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;margin-top:6px">
          ${PANTRY_ITEMS.map((it) => `<div class="row-card">
            <div class="qty">×${it.qty}</div>
            <div style="flex:1"><div class="item-name">${it.name}</div></div>
            <span class="tag ${it.tone}">${it.expiry}</span>
          </div>`).join("")}
        </div>
      </div>
    </div></div>`;
  }
  function listMock() {
    const aisles = ["Dairy", "Produce", "Dry"];
    return `<div class="phone"><div class="notch"></div><div class="screen">
      <div class="statusbar"><span>9:41</span><span class="right"><span>•••</span><span>5G</span><span>96</span></span></div>
      <div class="screen-body" style="padding:50px 16px 0;display:flex;flex-direction:column;gap:8px">
        <div>
          <div class="eyebrow">Tuesday&rsquo;s run · 2/7</div>
          <div class="screen-title">Grocery list</div>
          <div class="screen-meta">Big Grocer · ~$58</div>
        </div>
        ${aisles.map((aisle) => `<div>
          <div class="aisle-label">· ${aisle} aisle ·</div>
          <div style="display:flex;flex-direction:column;gap:4px">
            ${LIST_ITEMS.filter((i) => i.aisle === aisle).map((it) => `<div class="row-card" style="padding:8px 10px;border-radius:8px;opacity:${it.hasIt ? 0.4 : 1}">
              <div class="checkbox${it.checked ? " checked" : ""}">${it.checked ? "✓" : ""}</div>
              <span class="item-name" style="flex:1;text-decoration:${it.checked ? "line-through" : "none"}">${it.name}</span>
              ${it.hasIt ? `<span class="have-it">have it</span>` : ""}
            </div>`).join("")}
          </div>
        </div>`).join("")}
      </div>
    </div></div>`;
  }
  function expenseMock() {
    const cats = [
      { name: "Produce", amt: "$86", pct: 100 },
      { name: "Dairy & eggs", amt: "$52", pct: 60 },
      { name: "Pantry staples", amt: "$41", pct: 48 },
      { name: "Household", amt: "$61", pct: 71 },
    ];
    return `<div class="phone"><div class="notch"></div><div class="screen">
      <div class="statusbar"><span>9:41</span><span class="right"><span>•••</span><span>5G</span><span>96</span></span></div>
      <div class="screen-body" style="padding:50px 16px 0;display:flex;flex-direction:column;gap:10px">
        <div>
          <div class="eyebrow">This month &middot; on track</div>
          <div class="screen-title">Spending</div>
        </div>
        <div style="background:linear-gradient(135deg,#04342c 0%,#0f6e56 100%);border-radius:14px;padding:16px;color:var(--text-on-dark);position:relative;overflow:hidden">
          <div style="position:absolute;top:-20px;right:-20px;width:120px;height:120px;border-radius:50%;background:radial-gradient(circle,rgba(232,160,32,0.4),transparent 70%)"></div>
          <div class="eyebrow" style="color:var(--amber);font-weight:600">Budget &middot; June</div>
          <div style="display:flex;align-items:baseline;gap:8px;margin:6px 0 12px">
            <span style="font-family:var(--font-outfit);font-weight:800;font-size:30px;letter-spacing:-0.03em">$240</span>
            <span style="font-family:var(--font-outfit);font-size:14px;color:rgba(225,245,238,0.7)">of $400</span>
          </div>
          <div style="height:8px;border-radius:999px;background:rgba(225,245,238,0.15);overflow:hidden">
            <div style="width:60%;height:100%;background:var(--amber);border-radius:999px"></div>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:8px;font-family:var(--font-outfit);font-size:11px;color:rgba(225,245,238,0.7)">
            <span>60% used</span><span>11 days left</span>
          </div>
        </div>
        <div class="eyebrow" style="margin-top:4px">By category</div>
        <div style="display:flex;flex-direction:column;gap:6px">
          ${cats.map((c) => `<div class="row-card" style="flex-direction:column;align-items:stretch;gap:7px;padding:10px 12px">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <span style="font-family:var(--font-outfit);font-weight:600;font-size:13px;color:var(--bg-teal)">${c.name}</span>
              <span style="font-family:var(--font-mono);font-size:12px;font-weight:600;color:var(--ink)">${c.amt}</span>
            </div>
            <div style="height:4px;border-radius:999px;background:rgba(4,52,44,0.08);overflow:hidden">
              <div style="width:${c.pct}%;height:100%;background:#0f6e56;border-radius:999px"></div>
            </div>
          </div>`).join("")}
        </div>
        <div class="row-card" style="margin-top:2px;background:rgba(15,110,86,0.07);border:1px dashed rgba(15,110,86,0.35);padding:10px 12px">
          <div style="flex:1">
            <div style="font-family:var(--font-outfit);font-weight:600;font-size:13px;color:var(--bg-teal)">Last shop &middot; $58</div>
            <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.04em;color:var(--subtle);margin-top:2px">logged from your Tuesday list</div>
          </div>
          <span style="font-family:var(--font-outfit);font-size:16px;color:#0f6e56">&rarr;</span>
        </div>
      </div>
    </div></div>`;
  }
  const MOCKS = { pantry: pantryMock, list: listMock, expense: expenseMock };

  const featuresHTML = FEATURES.map((f) => {
    const dark = f.text === "light";
    const bodyColor = dark ? "rgba(225,245,238,0.7)" : "var(--subtle)";
    const liColor = dark ? "rgba(225,245,238,0.85)" : "var(--ink)";
    const tickBg = dark ? "rgba(29,158,117,0.2)" : "rgba(29,158,117,0.15)";
    const titleColor = dark ? "var(--text-on-dark)" : "var(--bg-teal)";
    const textBlock = `
      <div class="feature-text reveal-x ${f.side === "left" ? "from-right" : "from-left"}" style="order:${f.side === "left" ? 2 : 1}">
        <h3 style="color:${titleColor}">${f.title}</h3>
        <p class="body" style="color:${bodyColor}">${f.body}</p>
        <ul>
          ${f.bullets.map((b) => `<li style="color:${liColor}"><span class="tick" style="background:${tickBg}">✓</span>${b}</li>`).join("")}
        </ul>
      </div>`;
    const visualBlock = `<div class="feature-visual reveal-v" style="order:${f.side === "left" ? 1 : 2}">${MOCKS[f.mock]()}</div>`;
    return `<section class="feature" style="background:${f.bg}">
      <div class="feature-grid">${textBlock}${visualBlock}</div>
    </section>`;
  }).join("");
  document.getElementById("product-features").innerHTML = featuresHTML;

  /* ---------------- SAVINGS ---------------- */
  document.querySelector(".stat-grid").innerHTML = STATS.map((s, i) => `
    <div class="stat reveal" style="transition-delay:${i * 0.15}s">
      <div class="value">${s.value}</div>
      <div class="label">${s.label}</div>
      <div class="sub">${s.sub}</div>
    </div>
  `).join("");

  /* ---------------- TESTIMONIALS ---------------- */
  const quoteGrid = document.querySelector(".quote-grid");
  if (quoteGrid) quoteGrid.innerHTML = QUOTES.map((q, i) => `
    <div class="quote-card" data-rot="${q.rotation}" style="transform:rotate(${q.rotation}deg) translateY(30px);transition-delay:${i * 0.1}s">
      <div class="tape"></div>
      <div class="quote-text">&ldquo;${q.text}&rdquo;</div>
      <div class="quote-foot">
        <div class="avatar">${q.name.charAt(0)}</div>
        <div>
          <div class="quote-name">${q.name}</div>
          <div class="quote-role">${q.role}</div>
        </div>
      </div>
    </div>
  `).join("");

  /* ---------------- PRICING ---------------- */
  function tierCard(tier, variant, rotation, lift) {
    const dark = variant === "dark";
    return `<article class="tier" data-rot="${rotation}" data-lift="${lift ? 1 : 0}" style="transform:rotate(${rotation}deg)${lift ? " translateY(-28px)" : ""}">
      ${tier.tag ? `<div class="tier-tag">${tier.tag}</div>` : ""}
      <div class="tape" style="background:${dark ? "rgba(232,160,32,0.55)" : "rgba(232,160,32,0.45)"}"></div>
      <div class="tier-card ${dark ? "dark" : "light"}">
        <div class="redline"></div>
        <p class="tier-name">${tier.name} list</p>
        <div class="tier-price-row">
          <span class="tier-price">${tier.price}</span>
          <div style="padding-top:8px;min-width:0">
            ${tier.sub ? `<div class="tier-sub">${tier.sub}</div>` : ""}
            ${tier.yearlyNote ? `<div class="tier-yearly">${tier.yearlyNote}</div>` : ""}
          </div>
        </div>
        <ul class="tier-feats">
          ${tier.features.map((f, i) => `<li><span class="feat-n">${String(i + 1).padStart(2, "0")}</span>${f}</li>`).join("")}
        </ul>
        <a href="#vf-waitlist" class="tier-btn ${tier.ctaStyle}">${tier.cta} <span aria-hidden="true">→</span></a>
      </div>
    </article>`;
  }
  document.querySelector(".pricing-cards").innerHTML =
    tierCard(PRICING_FREE, "light", -2.5, false) +
    tierCard(PRICING_PREMIUM, "dark", 2, true);

  // hover lift on pricing cards
  document.querySelectorAll(".pricing-cards .tier").forEach((card) => {
    const rot = card.getAttribute("data-rot");
    const lift = card.getAttribute("data-lift") === "1";
    card.addEventListener("mouseenter", () => { card.style.transform = `rotate(0deg) translateY(-36px)`; });
    card.addEventListener("mouseleave", () => { card.style.transform = `rotate(${rot}deg)${lift ? " translateY(-28px)" : ""}`; });
  });

  /* ---------------- FAQ ---------------- */
  const faqList = document.querySelector(".faq-list");
  faqList.innerHTML = FAQS.map((f, i) => `
    <div class="faq-item${i === 0 ? " open" : ""}">
      <button type="button" class="faq-q">
        <span class="q">${f.q}</span>
        <span class="plus">+</span>
      </button>
      <div class="faq-a"><div class="faq-a-inner">${f.a}</div></div>
    </div>
  `).join("");
  faqList.querySelectorAll(".faq-q").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const isOpen = item.classList.contains("open");
      faqList.querySelectorAll(".faq-item").forEach((it) => it.classList.remove("open"));
      if (!isOpen) item.classList.add("open");
    });
  });

  /* ---------------- NEWSLETTER ---------------- */
  const form = document.getElementById("newsletter-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = form.querySelector("input");
      const btn = form.querySelector("button");
      const msg = document.getElementById("newsletter-msg");
      const defaultLabel = btn.textContent;
      btn.textContent = "Joining...";
      btn.disabled = true;
      msg.textContent = "";
      try {
        const res = await fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: input.value.trim().toLowerCase(),
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          msg.textContent =
            "You're on the list. We'll email you the moment we launch.";
          msg.className = "msg ok";
          input.value = "";
        } else {
          msg.textContent =
            data.error || "Could not connect. Please try again.";
          msg.className = "msg err";
        }
      } catch {
        msg.textContent = "Could not connect. Please try again.";
        msg.className = "msg err";
      } finally {
        btn.textContent = defaultLabel;
        btn.disabled = false;
      }
    });
  }

  /* ---------------- SCROLL REVEALS ---------------- */
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        if (el.classList.contains("quote-card")) {
          const rot = el.getAttribute("data-rot");
          el.style.transform = `rotate(${rot}deg) translateY(0)`;
          el.style.opacity = "1";
        } else {
          el.classList.add("in");
        }
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll(".reveal, .reveal-x, .reveal-v, .quote-card").forEach((el) => obs.observe(el));

  /* ---------------- STICKY HEADER (appears after hero) ---------------- */
  const header = document.getElementById("site-header");
  if (header) {
    const onScrollHeader = () => {
      const show = window.scrollY > window.innerHeight * 0.85;
      header.classList.toggle("visible", show);
      header.setAttribute("aria-hidden", show ? "false" : "true");
    };
    window.addEventListener("scroll", onScrollHeader, { passive: true });
    window.addEventListener("resize", onScrollHeader);
    onScrollHeader();
  }

  /* ---------------- APP SCREENSHOTS (self-healing loads) ---------------- */
  document.querySelectorAll(".shot-img").forEach((img) => {
    const base = (img.getAttribute("src") || "").split("?")[0];
    const phone = img.closest(".shot-phone");
    let tries = 0;
    const settle = () => {
      if (img.naturalWidth > 0) phone.classList.remove("empty");
      else phone.classList.add("empty");
    };
    img.addEventListener("load", settle);
    img.addEventListener("error", () => {
      if (tries < 2) { tries++; setTimeout(() => { img.src = base + "?r=" + tries; }, 350 * tries); }
      else phone.classList.add("empty");
    });
    // catch images that already finished (cache hit / cached error) before listeners attached
    if (img.complete) settle();
  });
})();
