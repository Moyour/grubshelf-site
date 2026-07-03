/* hero-v3.js — Deep Pantry v3: mouse parallax hero + scroll morph
   (floating items fly into the phone and become the pantry list) */
(function () {

  const heroSticky = document.querySelector('.hero-sticky');
  const heroEl = document.querySelector('.hero');
  if (!heroSticky || !heroEl) return;

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     PANTRY DATA — single source of truth for both the floating
     item and the list row it morphs into
     ============================================================ */
  // x/y are the "open air" waypoint items pass through between the aisle/cart —
  // kept close to center so exiting the cart or shelf doesn't fling them out to
  // the edges of the hero section.
  const PANTRY = [
    { e:'🥬', n:'Spinach',  d:'Today',    c:'bad',  w:3,  x:27, y:34 },
    { e:'🥑', n:'Avocados', d:'2 days',   c:'warn', w:20, x:67, y:30 },
    { e:'🧀', n:'Cheddar',  d:'Tomorrow', c:'warn', w:10, x:34, y:60 },
    { e:'🥚', n:'Eggs',     d:'8 days',   c:'good', w:72, x:60, y:62 },
    { e:'🥛', n:'Oat Milk', d:'6 days',   c:'good', w:60, x:70, y:50 },
  ];

  /* ============================================================
     BUILD LAYERS
     ============================================================ */

  /* --- Layer 1: Aurora background blobs --- */
  const aurora = document.createElement('div');
  aurora.className = 'dp-aurora';
  aurora.innerHTML = `
    <div class="dp-blob dp-blob--1"></div>
    <div class="dp-blob dp-blob--2"></div>
    <div class="dp-blob dp-blob--3"></div>
    <div class="dp-blob dp-blob--4"></div>
  `;

  /* --- Layer 2: Ghost food words --- */
  const WORDS = [
    { text:'SPINACH',  x:4,   y:8,   size:130, rot:-8  },
    { text:'AVOCADO',  x:58,  y:4,   size:96,  rot:4   },
    { text:'CHICKEN',  x:74,  y:16,  size:112, rot:-3  },
    { text:'CHEDDAR',  x:2,   y:52,  size:80,  rot:7   },
    { text:'OAT MILK', x:62,  y:74,  size:100, rot:-5  },
    { text:'EGGS',     x:18,  y:78,  size:148, rot:3   },
    { text:'SALMON',   x:80,  y:56,  size:86,  rot:-6  },
    { text:'HUMMUS',   x:34,  y:88,  size:92,  rot:5   },
    { text:'BROCCOLI', x:84,  y:82,  size:76,  rot:-4  },
    { text:'TOFU',     x:8,   y:70,  size:118, rot:9   },
    { text:'BUTTER',   x:44,  y:2,   size:100, rot:-6  },
    { text:'BREAD',    x:86,  y:32,  size:90,  rot:4   },
    { text:'YOGHURT',  x:50,  y:46,  size:70,  rot:-3  },
    { text:'GARLIC',   x:14,  y:38,  size:84,  rot:5   },
    { text:'ONION',    x:48,  y:66,  size:78,  rot:-6  },
    { text:'CARROT',   x:26,  y:22,  size:92,  rot:3   },
    { text:'PASTA',    x:90,  y:46,  size:88,  rot:-4  },
    { text:'LEMON',    x:56,  y:90,  size:96,  rot:6   },
    { text:'RICE',     x:6,   y:92,  size:104, rot:-5  },
    { text:'TOMATO',   x:76,  y:68,  size:82,  rot:4   },
  ];

  const ghostLayer = document.createElement('div');
  ghostLayer.className = 'dp-layer dp-ghost';
  ghostLayer.innerHTML = WORDS.map(w =>
    `<span class="dp-gword" style="left:${w.x}%;top:${w.y}%;font-size:${w.size}px;--rot:${w.rot}deg">${w.text}</span>`
  ).join('');

  /* --- Layer 3: Ambient floating emojis (decorative only, don't morph) --- */
  const AMBIENT_EMOJIS = [
    { e:'🍞', x:4,   y:80,  s:82,  dur:4.0, delay:1.5  },
    { e:'🐟', x:58,  y:84,  s:78,  dur:4.8, delay:0.4  },
    { e:'🥦', x:90,  y:74,  s:70,  dur:3.6, delay:1.1  },
    { e:'🥩', x:42,  y:8,   s:88,  dur:5.2, delay:0.7  },
    { e:'🫛', x:92,  y:20,  s:68,  dur:4.4, delay:1.8  },
    { e:'🍅', x:10,  y:45,  s:74,  dur:4.6, delay:0.9  },
    { e:'🧄', x:94,  y:48,  s:64,  dur:3.9, delay:1.3  },
    { e:'🥕', x:18,  y:93,  s:76,  dur:4.3, delay:0.2  },
    { e:'🌽', x:76,  y:5,   s:80,  dur:5.0, delay:1.6  },
    { e:'🍇', x:3,   y:28,  s:70,  dur:4.7, delay:0.6  },
    { e:'🧅', x:96,  y:64,  s:66,  dur:4.1, delay:1.9  },
    { e:'🥔', x:53,  y:94,  s:72,  dur:3.8, delay:1.0  },
  ];

  const floatLayer = document.createElement('div');
  floatLayer.className = 'dp-layer dp-floats';
  floatLayer.innerHTML = AMBIENT_EMOJIS.map(em =>
    `<div class="dp-emoji" style="left:${em.x}%;top:${em.y}%;font-size:${em.s}px;animation-duration:${em.dur}s;animation-delay:-${em.delay}s">${em.e}</div>`
  ).join('');

  /* --- Layer 4: Phone mockup + the 5 pantry items that fly into it --- */
  const phoneLayer = document.createElement('div');
  phoneLayer.className = 'dp-layer dp-phone-layer';
  phoneLayer.innerHTML = `
    <div class="dp-aisle">
      <div class="dp-aisle-upright dp-aisle-upright--l"></div>
      <div class="dp-aisle-upright dp-aisle-upright--r"></div>
      <div class="dp-aisle-shelf dp-aisle-shelf--1"><div class="dp-aisle-tag"></div></div>
      <div class="dp-aisle-shelf dp-aisle-shelf--2"><div class="dp-aisle-tag"></div></div>
    </div>
    <div class="dp-cart">
      <div class="dp-cart-shadow"></div>
      <div class="dp-cart-handle"></div>
      <div class="dp-cart-basket-back"></div>
      <div class="dp-cart-basket">
        <div class="dp-cart-mesh dp-cart-mesh--1"></div>
        <div class="dp-cart-mesh dp-cart-mesh--2"></div>
        <div class="dp-cart-mesh dp-cart-mesh--v1"></div>
        <div class="dp-cart-mesh dp-cart-mesh--v2"></div>
        <div class="dp-cart-mesh dp-cart-mesh--v3"></div>
      </div>
      <div class="dp-cart-frame"></div>
      <div class="dp-cart-wheel dp-cart-wheel--bl"></div>
      <div class="dp-cart-wheel dp-cart-wheel--br"></div>
      <div class="dp-cart-wheel dp-cart-wheel--fl"></div>
      <div class="dp-cart-wheel dp-cart-wheel--fr"></div>
      <span class="dp-cart-mark">GRUBSHELF</span>
    </div>
    <div class="dp-cart-rim"><div class="dp-cart-rim-inner"></div></div>
    <div class="dp-phone">
      <div class="dp-notch"></div>
      <div class="dp-screen">
        <div class="dp-s-header">
          <span class="dp-s-title">Pantry</span>
          <span class="dp-s-alert-pill">⚠ 3 expiring</span>
        </div>
        <div class="dp-s-alert">
          <div class="dp-s-alert-left">
            <span class="dp-s-alert-headline">Spinach expires today</span>
            <span class="dp-s-alert-sub">Check your fridge now</span>
          </div>
          <span class="dp-s-alert-arrow">›</span>
        </div>
        <div class="dp-s-items">
          ${PANTRY.map((r, i) => `
            <div class="dp-s-item" data-idx="${i}">
              <span class="dp-s-e">${r.e}</span>
              <div class="dp-s-info">
                <span class="dp-s-name">${r.n}</span>
                <div class="dp-s-bar-track">
                  <div class="dp-s-bar dp-bar--${r.c}" style="width:${r.w}%"></div>
                </div>
              </div>
              <span class="dp-s-day dp-day--${r.c}">${r.d}</span>
            </div>`).join('')}
        </div>
        <div class="dp-s-tabs">
          <span class="dp-tab dp-tab--on">Home</span>
          <span class="dp-tab">List</span>
          <div class="dp-tab-plus">+</div>
          <span class="dp-tab">Stats</span>
          <span class="dp-tab">Me</span>
        </div>
      </div>
    </div>
    ${PANTRY.map((r, i) => `
      <div class="dp-morph-item" data-idx="${i}" style="left:${r.x}%;top:${r.y}%">
        <span class="dp-morph-e">${r.e}</span>
        <div class="dp-morph-info">
          <span class="dp-morph-name">${r.n}</span>
          <div class="dp-morph-bar-track"><div class="dp-morph-bar dp-bar--${r.c}" style="width:${r.w}%"></div></div>
        </div>
        <span class="dp-morph-day dp-day--${r.c}">${r.d}</span>
      </div>`).join('')}
  `;

  /* --- Layer 5: Foreground expiry cards — one per pantry item, hugging the
     phone's edges rather than the far screen edges --- */
  function cardLabel(r) {
    if (r.d === 'Today') return 'EXPIRES TODAY';
    if (r.d === 'Tomorrow') return 'EXPIRES TOMORROW';
    return `${r.d.toUpperCase()} LEFT`;
  }
  // top/left/right/bottom % + rotation, one slot per PANTRY item, ringed close to the phone
  const CARD_POS = [
    { top:'16%',  left:'26%',  rot:-5 },  // spinach — top-left
    { bottom:'18%', right:'25%', rot:-4 }, // avocados — bottom-right
    { top:'47%',  left:'17%',  rot:4  },  // cheddar — mid-left
    { top:'14%',  right:'23%', rot:6  },  // eggs — top-right
    { top:'50%',  right:'17%', rot:-3 },  // oat milk — mid-right
  ];

  const fgLayer = document.createElement('div');
  fgLayer.className = 'dp-layer dp-fg';
  fgLayer.innerHTML = PANTRY.map((r, i) => {
    const pos = CARD_POS[i];
    const posCss = Object.entries(pos).filter(([k]) => k !== 'rot').map(([k, v]) => `${k}:${v}`).join(';');
    return `
    <div class="dp-card dp-card--${r.c}" style="${posCss};--rot:${pos.rot}deg">
      <span class="dp-card-e">${r.e}</span>
      <div class="dp-card-body">
        <span class="dp-card-name">${r.n}</span>
        <span class="dp-card-tag dp-ctag--${r.c}">${cardLabel(r)}</span>
      </div>
    </div>`;
  }).join('');

  /* ---- Assemble ---- */
  [aurora, ghostLayer, floatLayer, phoneLayer, fgLayer].forEach(el => heroSticky.appendChild(el));

  /* ============================================================
     CSS
     ============================================================ */
  const style = document.createElement('style');
  style.textContent = `
    /* ---- hero reset ---- */
    .hero        { background:#04190f; }
    .hero-sticky { min-height:600px; overflow:hidden; background:#04190f; }

    /* ---- layers ---- */
    .dp-layer {
      position:absolute; inset:-80px;          /* oversized so parallax shift stays in frame */
      pointer-events:none;
      will-change:transform;
    }
    .dp-fg { pointer-events:none; z-index:300; }

    /* ---- AURORA ---- */
    .dp-aurora { position:absolute; inset:-80px; z-index:0; overflow:hidden; background:#04190f; }
    .dp-blob {
      position:absolute; border-radius:50%; opacity:.7;
      filter:blur(110px); animation:blobDrift linear infinite alternate;
    }
    .dp-blob--1 {
      width:700px; height:600px; top:-10%; left:-15%;
      background:radial-gradient(circle,rgba(29,158,117,.55) 0%,transparent 70%);
      animation-duration:18s; animation-delay:0s;
    }
    .dp-blob--2 {
      width:600px; height:700px; top:30%; right:-20%;
      background:radial-gradient(circle,rgba(232,160,32,.35) 0%,transparent 70%);
      animation-duration:22s; animation-delay:-6s;
    }
    .dp-blob--3 {
      width:800px; height:500px; bottom:-15%; left:20%;
      background:radial-gradient(circle,rgba(15,90,55,.6) 0%,transparent 70%);
      animation-duration:26s; animation-delay:-12s;
    }
    .dp-blob--4 {
      width:400px; height:400px; top:40%; left:38%;
      background:radial-gradient(circle,rgba(29,158,117,.20) 0%,transparent 70%);
      animation-duration:14s; animation-delay:-4s;
    }
    @keyframes blobDrift {
      0%   { transform:translate(0px, 0px) scale(1);   }
      33%  { transform:translate(60px,-40px) scale(1.08); }
      66%  { transform:translate(-40px,60px) scale(0.94); }
      100% { transform:translate(30px, 30px) scale(1.04); }
    }

    /* ---- GHOST WORDS ---- */
    .dp-ghost { z-index:1; }
    .dp-gword {
      position:absolute; font-family:var(--font-outfit); font-weight:900;
      line-height:1; letter-spacing:-.04em; white-space:nowrap;
      color:rgba(255,255,255,.045);
      transform:rotate(var(--rot,0deg));
      user-select:none;
    }

    /* ---- AMBIENT FLOATING EMOJIS ---- */
    .dp-floats { z-index:2; transition:opacity .3s linear; }
    .dp-emoji {
      position:absolute; line-height:1; user-select:none;
      filter:drop-shadow(0 12px 32px rgba(0,0,0,.5)) drop-shadow(0 0 20px rgba(29,158,117,.12));
      animation:dpFloat ease-in-out infinite alternate;
      opacity:1;
    }
    @keyframes dpFloat {
      from { transform:translateY(0px) rotate(-3deg); }
      to   { transform:translateY(-22px) rotate(3deg); }
    }

    /* ---- PHONE ---- */
    .dp-phone-layer { z-index:10; display:flex; align-items:center; justify-content:center; }
    .dp-phone {
      position:relative;
      /* width drives the size (capped by px, viewport width, AND viewport height —
         converted to an equivalent width via the aspect ratio); height follows from
         aspect-ratio so the phone can never get squashed into an unrealistic shape,
         which is what happened with independent width:vw / height:vh caps on tall,
         narrow mobile viewports (width would starve while height stayed near max). */
      /* 58vw reaches the 210px cap at ~362px viewport width, so virtually every
         phone screen (375px+) renders the phone at its full native size — the
         internal list rows/labels use fixed px sizing tuned for 210px, so shrinking
         below that makes text wrap/collide (e.g. "Pantry" into the expiring pill). */
      width:min(210px,58vw,27.3vh); aspect-ratio:210/430; height:auto;
      background:#08150e; border:2px solid rgba(255,255,255,.14);
      border-radius:40px; overflow:hidden;
      box-shadow:
        0 0 0 6px rgba(4,15,10,.85),
        0 0 0 8px rgba(255,255,255,.05),
        0 50px 120px rgba(0,0,0,.7),
        0 0 100px rgba(29,158,117,.15);
      transform-style:preserve-3d;
      transition:box-shadow .3s ease;
      opacity:0;
    }
    .dp-phone:hover { box-shadow:0 0 0 6px rgba(4,15,10,.85),0 0 0 8px rgba(255,255,255,.07),0 60px 140px rgba(0,0,0,.75),0 0 120px rgba(29,158,117,.22); }

    /* ---- AISLE (opening state — items sit on the shelf before anything moves) ---- */
    .dp-aisle {
      position:absolute; left:50%; top:50%;
      /* same aspect-ratio fix as .dp-phone — keeps the shelf's proportions intact
         on tall mobile viewports instead of getting squeezed narrow-and-tall. */
      width:min(460px,88vw,59.4vh); aspect-ratio:460/310; height:auto;
      transform:translate(-50%,-50%);
      z-index:7;
    }
    .dp-aisle-upright {
      position:absolute; top:2%; bottom:0; width:9px;
      background:
        repeating-linear-gradient(180deg, rgba(0,0,0,.1) 0 2px, transparent 2px 7px),
        linear-gradient(90deg,#6b4a26,#8a6535 45%,#a17845 55%,#4a3218);
      border-radius:1.5px;
      box-shadow:
        0 20px 50px rgba(0,0,0,.4),
        inset -2px 0 3px rgba(0,0,0,.35),
        inset 1.5px 0 2px rgba(255,214,140,.15);
    }
    .dp-aisle-upright--l { left:2%; }
    .dp-aisle-upright--r { right:2%; }
    .dp-aisle-shelf {
      position:absolute; left:2%; right:2%; height:12px;
      background:linear-gradient(180deg, rgba(216,158,92,.92) 0%, rgba(193,129,63,.88) 45%, rgba(110,74,35,.92) 100%);
      border-top:1px solid rgba(255,214,140,.6);
      border-radius:2px;
      box-shadow:
        0 24px 40px rgba(0,0,0,.45),
        0 2px 0 rgba(255,255,255,.1) inset,
        0 3px 5px rgba(0,0,0,.3);
    }
    .dp-aisle-shelf::after {
      content:''; position:absolute; left:3%; right:3%; bottom:-16px; height:16px;
      background:linear-gradient(180deg, rgba(0,0,0,.32), transparent);
      pointer-events:none;
    }
    .dp-aisle-shelf--1 { top:40%; }
    .dp-aisle-shelf--2 { top:68%; }
    .dp-aisle-tag {
      position:absolute; left:8%; top:100%; width:26%; height:9px;
      background:linear-gradient(180deg, rgba(255,232,190,.7), rgba(232,160,32,.45));
      border-radius:0 0 3px 3px;
      box-shadow:0 2px 4px rgba(0,0,0,.3);
    }

    /* ---- CART (items gather + sit inside here before heading into the phone) ----
       Split into a shell (z-index BELOW the flying items, gives back/side walls)
       and a rim (z-index ABOVE the items, gives the front lip) so items parked
       in the basket read as contained rather than just overlapping a line icon. */
    .dp-cart, .dp-cart-rim {
      position:absolute; left:50%; top:50%;
      /* same aspect-ratio fix as .dp-phone/.dp-aisle */
      width:min(265px,60vw,35.7vh); aspect-ratio:265/230; height:auto;
      transform:translate(-50%,-46%);
      opacity:0;
    }
    .dp-cart { z-index:8; filter:drop-shadow(0 30px 70px rgba(0,0,0,.5)); }
    .dp-cart-rim { z-index:21; pointer-events:none; }

    .dp-cart-shadow {
      position:absolute; left:50%; bottom:2%; width:74%; height:12%;
      transform:translateX(-50%);
      background:radial-gradient(ellipse at center, rgba(0,0,0,.5) 0%, transparent 72%);
      z-index:-1;
    }
    .dp-cart-handle {
      position:absolute; right:86%; top:13%;
      width:20%; height:9px;
      background:linear-gradient(180deg, #d89a52 0%, #8a5a2c 50%, #7a5227 100%);
      border-radius:5px;
      box-shadow:0 2px 4px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,232,190,.3);
      transform-origin:right center; transform:rotate(20deg);
    }
    .dp-cart-basket-back {
      position:absolute; left:5%; right:5%; top:19%; bottom:27%;
      clip-path:polygon(19% 0%, 81% 0%, 71% 100%, 29% 100%);
      background:linear-gradient(180deg, rgba(74,50,24,.5), rgba(40,28,15,.65));
    }
    .dp-cart-basket {
      position:absolute; left:0; right:0; top:16%; bottom:22%;
      clip-path:polygon(14% 0%, 86% 0%, 74% 100%, 26% 100%);
      background-image:
        repeating-linear-gradient(115deg, rgba(0,0,0,.05) 0 1px, transparent 1px 9%),
        linear-gradient(165deg, rgba(232,160,32,.30) 0%, rgba(193,129,63,.24) 55%, rgba(122,82,39,.22) 100%);
      border:1px solid rgba(232,160,32,.4);
      box-shadow:
        inset 0 0 30px rgba(0,0,0,.35),
        0 0 46px rgba(232,160,32,.22);
      overflow:hidden;
    }
    .dp-cart-basket::before {
      content:''; position:absolute; left:-3%; right:-3%; top:-4%; height:7%;
      background:linear-gradient(180deg, rgba(255,224,160,.6), rgba(232,160,32,.15));
      border-radius:3px;
      box-shadow:0 2px 6px rgba(0,0,0,.3);
    }
    .dp-cart-mesh { position:absolute; background:rgba(0,0,0,.14); }
    .dp-cart-mesh--1 { left:0; right:0; top:34%; height:1.5px; }
    .dp-cart-mesh--2 { left:0; right:0; top:66%; height:1.5px; }
    .dp-cart-mesh--v1 { top:0; bottom:0; left:34%; width:1.5px; }
    .dp-cart-mesh--v2 { top:0; bottom:0; left:66%; width:1.5px; }
    .dp-cart-mesh--v3 { top:0; bottom:0; left:50%; width:1px; background:rgba(0,0,0,.1); }
    .dp-cart-frame {
      position:absolute; left:16%; right:16%; bottom:9%; height:4px;
      background:linear-gradient(90deg, #4a3218, #8a5a2c, #4a3218);
      border-radius:2px;
      box-shadow:0 1px 2px rgba(0,0,0,.3);
    }
    .dp-cart-wheel {
      position:absolute; bottom:-2%; border-radius:50%;
      background:#3a2a17; border:3px solid #c1813f;
      box-shadow:0 3px 6px rgba(0,0,0,.4);
    }
    .dp-cart-wheel--bl { left:24%; width:16px; height:16px; }
    .dp-cart-wheel--br { right:20%; width:16px; height:16px; }
    .dp-cart-wheel--fl { left:42%; width:10px; height:10px; bottom:-1%; }
    .dp-cart-wheel--fr { right:40%; width:10px; height:10px; bottom:-1%; }
    .dp-cart-mark {
      position:absolute; left:50%; bottom:-22px; transform:translateX(-50%);
      font-family:var(--font-mono); font-weight:700; font-size:10px;
      letter-spacing:.14em; color:rgba(232,160,32,.55); white-space:nowrap;
    }

    /* the visible front-lip slice, aligned to the basket's bottom edge —
       tall + opaque enough that items parked in the cart visibly tuck behind it */
    .dp-cart-rim-inner {
      position:absolute; left:20%; right:20%; top:48%; height:30%;
      border-radius:0 0 10px 10px;
      background:linear-gradient(180deg, rgba(122,82,39,0) 0%, rgba(122,82,39,.72) 35%, rgba(48,34,18,.94) 100%);
      border-bottom:1px solid rgba(232,160,32,.5);
    }

    .dp-notch {
      position:absolute; top:0; left:50%; transform:translateX(-50%);
      width:70px; height:24px; background:#08150e;
      border-radius:0 0 16px 16px; z-index:10;
      border-bottom:1.5px solid rgba(255,255,255,.07);
    }
    .dp-screen { padding:36px 14px 0; height:100%; box-sizing:border-box; display:flex; flex-direction:column; }

    /* screen header */
    .dp-s-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
    .dp-s-title { font-family:var(--font-outfit); font-weight:800; font-size:20px; color:#fff; letter-spacing:-.02em; }
    .dp-s-alert-pill {
      font-family:var(--font-mono); font-size:9px; font-weight:700; letter-spacing:.06em;
      background:rgba(220,60,60,.2); color:rgba(230,90,90,.95);
      padding:3px 9px; border-radius:20px;
      animation:pillPulse 2.5s ease-in-out infinite;
    }
    @keyframes pillPulse { 0%,100%{background:rgba(220,60,60,.2)} 50%{background:rgba(220,60,60,.35)} }

    /* alert banner */
    .dp-s-alert {
      display:flex; align-items:center; justify-content:space-between;
      background:rgba(220,55,55,.1); border:1px solid rgba(220,55,55,.22);
      border-radius:12px; padding:10px 12px; margin-bottom:12px;
      animation:alertGlow 3s ease-in-out infinite alternate;
    }
    @keyframes alertGlow { from{border-color:rgba(220,55,55,.15)} to{border-color:rgba(220,55,55,.4)} }
    .dp-s-alert-headline { display:block; font-family:var(--font-outfit); font-size:11px; font-weight:700; color:rgba(230,85,85,.95); }
    .dp-s-alert-sub      { display:block; font-family:var(--font-outfit); font-size:10px; color:rgba(255,255,255,.35); margin-top:1px; }
    .dp-s-alert-arrow { color:rgba(220,70,70,.45); font-size:18px; }

    /* items — hidden until its flying counterpart lands (scroll-driven) */
    .dp-s-items { flex:1; display:flex; flex-direction:column; gap:4px; }
    .dp-s-item {
      display:flex; align-items:center; gap:10px; padding:9px 10px;
      border-radius:12px; background:rgba(255,255,255,.03);
      opacity:0; transform:translateX(-6px);
      transition:opacity .35s ease, transform .35s ease;
    }
    .dp-s-item.is-in { opacity:1; transform:none; }
    .dp-s-e { font-size:22px; flex-shrink:0; line-height:1; }
    .dp-s-info { flex:1; min-width:0; }
    .dp-s-name { display:block; font-family:var(--font-outfit); font-size:12px; font-weight:600; color:rgba(255,255,255,.88); }
    .dp-s-bar-track { height:2.5px; background:rgba(255,255,255,.07); border-radius:2px; margin-top:5px; overflow:hidden; }
    .dp-s-bar { height:100%; border-radius:2px; }
    .dp-bar--bad  { background:linear-gradient(90deg,#dc4545,rgba(220,69,69,.4)); }
    .dp-bar--warn { background:linear-gradient(90deg,#e8a020,rgba(232,160,32,.4)); }
    .dp-bar--good { background:linear-gradient(90deg,#1d9e75,rgba(29,158,117,.4)); }
    .dp-s-day { font-family:var(--font-mono); font-size:9px; font-weight:700; letter-spacing:.04em; flex-shrink:0; white-space:nowrap; }
    .dp-day--bad  { color:rgba(220,80,80,.95); }
    .dp-day--warn { color:rgba(232,160,32,.95); }
    .dp-day--good { color:rgba(29,158,117,.9); }

    /* bottom tab bar */
    .dp-s-tabs {
      display:flex; justify-content:space-around; align-items:center;
      padding:10px 8px 16px; border-top:1px solid rgba(255,255,255,.06); margin-top:8px;
    }
    .dp-tab { font-family:var(--font-outfit); font-size:10px; color:rgba(255,255,255,.28); padding:4px 6px; }
    .dp-tab--on { color:rgba(29,158,117,.9); font-weight:600; }
    .dp-tab-plus {
      width:36px; height:36px; border-radius:50%;
      background:linear-gradient(135deg,#1d9e75,#0f7057);
      display:flex; align-items:center; justify-content:center;
      font-size:20px; font-weight:300; color:#fff; line-height:1;
      box-shadow:0 4px 16px rgba(29,158,117,.4);
    }

    /* ---- MORPH ITEMS — the flying pantry emojis that become list rows ---- */
    .dp-morph-item {
      position:absolute; box-sizing:border-box;
      display:flex; align-items:center; gap:10px;
      border-radius:12px; overflow:hidden; white-space:nowrap;
      pointer-events:none; z-index:20;
      /* deliberately no ambient bob here — items are always mid-journey
         (shelf, cart, phone) and a constant float undercuts "settled/contained" */
    }
    /* while resting on the shelf or parked in the cart, bottom-align the emoji
       so its visual base touches the surface instead of floating mid-box */
    .dp-morph-item.is-grounded { align-items:flex-end; padding-bottom:2px; }
    .dp-morph-e {
      font-size:44px; line-height:1; flex-shrink:0;
      filter:drop-shadow(0 12px 32px rgba(0,0,0,.5)) drop-shadow(0 0 20px rgba(29,158,117,.12));
      transition:filter .3s ease;
    }
    .dp-morph-info { flex:1; min-width:0; opacity:0; }
    .dp-morph-name { display:block; font-family:var(--font-outfit); font-size:12px; font-weight:600; color:rgba(255,255,255,.88); white-space:nowrap; }
    .dp-morph-bar-track { height:2.5px; background:rgba(255,255,255,.07); border-radius:2px; margin-top:5px; overflow:hidden; }
    .dp-morph-bar { height:100%; border-radius:2px; }
    .dp-morph-day { font-family:var(--font-mono); font-size:9px; font-weight:700; letter-spacing:.04em; flex-shrink:0; white-space:nowrap; opacity:0; }

    /* ---- FOREGROUND CARDS ---- */
    .dp-card {
      position:absolute;
      display:flex; align-items:center; gap:10px;
      padding:11px 14px; border-radius:16px;
      backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
      border:1px solid rgba(255,255,255,.1);
      background:rgba(4,25,15,.75);
      box-shadow:0 12px 40px rgba(0,0,0,.4);
      white-space:nowrap;
      opacity:0;
      z-index:30;
    }
    .dp-card.is-in {
      animation-name:cardFloat; animation-timing-function:ease-in-out;
      animation-iteration-count:infinite; animation-direction:alternate;
    }
    .dp-card--bad  { border-color:rgba(220,70,70,.28);  animation-duration:4.8s; }
    .dp-card--warn { border-color:rgba(232,160,32,.28); animation-duration:5.4s; }
    .dp-card--good { border-color:rgba(29,158,117,.28); animation-duration:4.2s; }
    @keyframes cardFloat {
      from { transform:rotate(var(--rot,0deg)) translateY(0);   }
      to   { transform:rotate(var(--rot,0deg)) translateY(-14px); }
    }
    .dp-card-e { font-size:22px; line-height:1; }
    .dp-card-body { display:flex; flex-direction:column; gap:3px; }
    .dp-card-name { font-family:var(--font-outfit); font-size:13px; font-weight:600; color:rgba(255,255,255,.9); }
    .dp-card-tag { font-family:var(--font-mono); font-size:9px; font-weight:700; letter-spacing:.08em; }
    .dp-ctag--bad  { color:rgba(220,80,80,.95); }
    .dp-ctag--warn { color:rgba(232,160,32,.95); }
    .dp-ctag--good { color:rgba(29,158,117,.9); }

    /* ---- noise grain overlay ---- */
    .hero-sticky::before {
      content:''; position:absolute; inset:0; z-index:600;
      pointer-events:none; opacity:.028;
      background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      background-size:200px 200px;
    }
  `;
  document.head.appendChild(style);

  /* ============================================================
     PARALLAX ENGINE — spring lerp, 5 depths
     ============================================================ */
  const STRENGTH = 70; // max px shift at edge

  const layerDefs = [
    { el: aurora,      depth: 0.06 },
    { el: ghostLayer,  depth: 0.16 },
    { el: floatLayer,  depth: 0.36 },
    { el: phoneLayer,  depth: 0.58 },
    { el: fgLayer,     depth: 0.88 },
  ].map(d => ({ ...d, cx: 0.5, cy: 0.5 }));

  const phone = phoneLayer.querySelector('.dp-phone');
  let mouseX = 0.5, mouseY = 0.5;

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
  }, { passive: true });

  // Touch support
  window.addEventListener('touchmove', e => {
    if (e.touches[0]) {
      mouseX = e.touches[0].clientX / window.innerWidth;
      mouseY = e.touches[0].clientY / window.innerHeight;
    }
  }, { passive: true });

  const LERP = 0.055;

  function tick() {
    layerDefs.forEach(layer => {
      layer.cx += (mouseX - layer.cx) * LERP;
      layer.cy += (mouseY - layer.cy) * LERP;

      const tx = (layer.cx - 0.5) * -layer.depth * STRENGTH;
      const ty = (layer.cy - 0.5) * -layer.depth * STRENGTH * 0.65;
      layer.el.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px)`;
    });

    // 3D tilt on phone (uses phone layer smoothed values)
    const pl = layerDefs[3];
    const rx = (pl.cy - 0.5) * -14;
    const ry = (pl.cx - 0.5) * 18;
    phone.style.transform = `perspective(1100px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;

    requestAnimationFrame(tick);
  }

  if (!REDUCED) tick();

  /* ============================================================
     SCROLL STORY — six acts driven by the hero's 600vh sticky
     scroll fraction (0 → 1):
       1. AISLE   pantry items sit on the shelf
       2. OUT     items lift off the shelf and drift into open space
       3. GATHER  items fly together into the shopping cart
       4. EXIT    items pop back out of the cart
       5. ENTER   the phone appears, items fly in and become list rows
       6. NOTIFY  expiry alert cards spring out of the phone
     ============================================================ */
  const aisle     = phoneLayer.querySelector('.dp-aisle');
  const aisleShelf1 = aisle.querySelector('.dp-aisle-shelf--1');
  const aisleShelf2 = aisle.querySelector('.dp-aisle-shelf--2');
  const cart      = phoneLayer.querySelector('.dp-cart');
  const cartBasket = cart.querySelector('.dp-cart-basket');
  const cartRim   = phoneLayer.querySelector('.dp-cart-rim');
  const cartRimInner = cartRim.querySelector('.dp-cart-rim-inner');
  const morphEls  = Array.from(phoneLayer.querySelectorAll('.dp-morph-item'));
  const rowEls    = Array.from(phoneLayer.querySelectorAll('.dp-s-item'));
  const cardEls   = Array.from(fgLayer.querySelectorAll('.dp-card'));

  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeOutBack(t) {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp01(t) { return Math.max(0, Math.min(1, t)); }

  if (REDUCED) {
    // No motion: just show the finished, "everything has already happened" state.
    aisle.style.display = 'none';
    cart.style.display = 'none';
    cartRim.style.display = 'none';
    phone.style.opacity = '1';
    morphEls.forEach(m => m.style.display = 'none');
    rowEls.forEach(r => r.classList.add('is-in'));
    cardEls.forEach(el => { el.classList.add('is-in'); el.style.opacity = '1'; });
    return;
  }

  /* ============================================================
     SOUND — opt-in only, muted by default. Short, soft cues synthesized
     with the Web Audio API (no external audio files) tied to the story's
     key beats: lift-off, cart landing, phone landing, notification cards.
     Browsers block audio until a real user gesture anyway, so "default
     muted + explicit toggle" isn't just polite, it's the only thing that
     reliably works on first visit.
     ============================================================ */
  const SOUND_KEY = 'grubshelf_hero_sound';
  let audioCtx = null;
  let muted = localStorage.getItem(SOUND_KEY) !== 'on';

  function ensureAudioCtx() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function tone(freq, dur, opts) {
    opts = opts || {};
    if (muted) return;
    const ctx = ensureAudioCtx();
    if (!ctx) return;
    const t0 = ctx.currentTime + (opts.delay || 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = opts.type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (opts.freqEnd) osc.frequency.exponentialRampToValueAtTime(opts.freqEnd, t0 + dur);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(opts.vol || 0.05, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  const sfx = {
    whoosh: () => tone(340, 0.16, { type: 'sine', vol: 0.035, freqEnd: 620 }),
    clink:  () => tone(880, 0.09, { type: 'triangle', vol: 0.045, freqEnd: 640 }),
    pop:    () => tone(660, 0.08, { type: 'sine', vol: 0.05, freqEnd: 900 }),
    ding:   () => {
      tone(988, 0.22, { type: 'sine', vol: 0.045 });
      tone(1319, 0.22, { type: 'sine', vol: 0.03, delay: 0.05 });
    },
  };

  const ICON_MUTED =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5Z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';
  const ICON_UNMUTED =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';

  // Lives outside the hero's aria-hidden="true" scope (appended to <body>,
  // not into the decorative layers) since it's a real interactive control.
  const soundBtn = document.createElement('button');
  soundBtn.type = 'button';
  soundBtn.className = 'dp-sound-toggle';
  soundBtn.innerHTML = muted ? ICON_MUTED : ICON_UNMUTED;
  soundBtn.setAttribute('aria-label', muted ? 'Turn on hero sound effects' : 'Turn off hero sound effects');
  soundBtn.addEventListener('click', () => {
    muted = !muted;
    localStorage.setItem(SOUND_KEY, muted ? 'off' : 'on');
    soundBtn.innerHTML = muted ? ICON_MUTED : ICON_UNMUTED;
    soundBtn.setAttribute('aria-label', muted ? 'Turn on hero sound effects' : 'Turn off hero sound effects');
    if (!muted) { ensureAudioCtx(); sfx.pop(); } // confirmation blip so unmuting feels responsive
  });
  document.body.appendChild(soundBtn);

  const soundStyle = document.createElement('style');
  soundStyle.textContent = `
    .dp-sound-toggle {
      position:fixed; right:20px; bottom:20px; z-index:950;
      width:40px; height:40px; border-radius:50%;
      background:rgba(4,25,15,.7); border:1px solid rgba(255,255,255,.12);
      backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px);
      color:rgba(225,245,238,.85);
      display:flex; align-items:center; justify-content:center;
      cursor:pointer; opacity:0; pointer-events:none;
      transition:opacity .4s ease, background .2s ease, transform .2s ease;
    }
    .dp-sound-toggle.is-visible { opacity:1; pointer-events:auto; }
    .dp-sound-toggle:hover { background:rgba(4,25,15,.9); transform:scale(1.06); }
  `;
  document.head.appendChild(soundStyle);

  // edge-triggered playback state — one flag per item/card per beat, so each
  // cue fires once per crossing and resets if you scroll back past it.
  const liftPlayed = new Array(PANTRY.length).fill(false);
  const cartLandPlayed = new Array(PANTRY.length).fill(false);
  const phoneLandPlayed = new Array(PANTRY.length).fill(false);
  const notifyPlayed = new Array(cardEls.length).fill(false);

  // Emoji box sizes at each stage of the journey: sitting on the shelf,
  // floating in open air, parked inside the cart, and (wider) as a phone row.
  const AISLE_BOX = 64;
  const START_BOX = 96;
  const PARK_BOX = 52;

  // Per-item shelf slot — % of the AISLE's own (responsive) width, centered on 50 —
  // 3 items on the top shelf, 2 on the bottom, both sharing the same outer span so
  // the two rows line up into a tidy grid (eggs under spinach, oat milk under cheddar).
  // Sizing against the aisle/cart's measured box (not the layer) keeps alignment
  // correct at every viewport, since both containers are capped with min(px, vw/vh)
  // and stop growing with the layer past a breakpoint.
  const AISLE_SLOT_X = [-31, 0, 31, -31, 31];

  // Per-item spread inside the cart's basket — % of the cart's own width, centered on 50.
  const CART_SPREAD = [-25, -12.5, 0, 12.5, 25];
  // How far down into the rim band (0 = rim top, 1 = rim bottom) the item's bottom
  // edge lands — tuned so it's tucked behind the front lip, not hovering above it.
  const CART_RIM_FRACTION = 0.7;
  // Per-item tilt + vertical jitter while in the cart, so they read as tossed into
  // a pile rather than a perfectly straight, identically-spaced row of icons.
  const CART_TILT     = [-11, 9, -7, 10, -6];  // deg
  const CART_JITTER_Y = [-7, 5, -9, 6, -3];    // px

  const T_AISLE_EXIT_START = 0.05; // act 1 -> 2: items lift off the shelf
  const AISLE_EXIT_STAGGER = 0.016;
  const T_AISLE_EXIT_DUR   = 0.11;

  const T_GATHER_START  = 0.26;  // act 2 -> 3: items fly into the cart
  const GATHER_STAGGER  = 0.016;
  const T_GATHER_DUR    = 0.12;

  const T_EXIT_START    = 0.48;  // act 3 -> 4: items pop back out of the cart
  const EXIT_STAGGER    = 0.016;
  const T_EXIT_DUR      = 0.12;

  const T_ENTER_START   = 0.72;  // act 4 -> 5: items fly into the (now visible) phone
  const ENTER_STAGGER   = 0.016;
  const T_ENTER_DUR     = 0.13;

  const T_NOTIFY_START  = 0.82;  // act 6: expiry cards spring out of the phone
  const NOTIFY_STAGGER  = 0.02;
  const NOTIFY_DUR      = 0.10;  // last card's window (start + 4*stagger + dur) must land by raw=1

  let targets = [];     // per pantry item: aisle / scatter / cart / phone-row positions
  let cardTargets = []; // per card: offset from the phone's actual screen center

  function measure() {
    const layerW = phoneLayer.offsetWidth;
    const layerH = phoneLayer.offsetHeight;

    // Measure the aisle/cart's *actual rendered* geometry via getBoundingClientRect,
    // with their transform briefly reset to the resting value — offsetLeft/Top can't
    // be used here since these elements are centered with `left:50%; transform:
    // translate(-50%,...)`, which makes offsetLeft report the parent's center, not
    // the element's own edge. Measuring the real rendered box (relative to the layer,
    // which cancels out the layer's own parallax transform) stays correct at any
    // viewport size, unlike assuming a fixed % of the ever-growing layer width.
    const restore = [aisle, cart, cartRim].map(el => [el, el.style.transform]);
    aisle.style.transform = 'translate(-50%,-50%)';
    cart.style.transform = 'translate(-50%,-46%)';
    cartRim.style.transform = 'translate(-50%,-46%)';

    const layerRect  = phoneLayer.getBoundingClientRect();
    const aisleRect  = aisle.getBoundingClientRect();
    const shelf1Rect = aisleShelf1.getBoundingClientRect();
    const shelf2Rect = aisleShelf2.getBoundingClientRect();
    const cartRect   = cart.getBoundingClientRect();
    const rimRect    = cartRimInner.getBoundingClientRect();

    restore.forEach(([el, t]) => { el.style.transform = t; });

    const aisleLeftEdge = aisleRect.left - layerRect.left;
    const aisleWidth    = aisleRect.width;
    const shelf1Top = shelf1Rect.top - layerRect.top;
    const shelf2Top = shelf2Rect.top - layerRect.top;
    const shelfTopFor = i => (i < 3 ? shelf1Top : shelf2Top); // 3 items on shelf 1, 2 on shelf 2

    const cartLeftEdge = cartRect.left - layerRect.left;
    const cartWidth     = cartRect.width;
    const rimTop    = rimRect.top - layerRect.top;
    const rimHeight = rimRect.height;
    const cartSurfaceY = rimTop + CART_RIM_FRACTION * rimHeight;

    targets = PANTRY.map((r, i) => {
      const row = rowEls[i];
      return {
        aisleLeft:   aisleLeftEdge + ((50 + AISLE_SLOT_X[i]) / 100) * aisleWidth - AISLE_BOX / 2,
        aisleTop:    shelfTopFor(i) - AISLE_BOX,
        scatterLeft: (r.x / 100) * layerW - START_BOX / 2,
        scatterTop:  (r.y / 100) * layerH - START_BOX / 2,
        cartLeft:    cartLeftEdge + ((50 + CART_SPREAD[i]) / 100) * cartWidth - PARK_BOX / 2,
        cartTop:     cartSurfaceY - PARK_BOX,
        endLeft:     phone.offsetLeft + row.offsetLeft,
        endTop:      phone.offsetTop + row.offsetTop,
        endWidth:    row.offsetWidth,
        endHeight:   row.offsetHeight,
      };
    });

    // Card flights originate from the phone's actual screen position, not an
    // assumed layer center, so the "pop out of the phone" motion stays true
    // even if the phone isn't perfectly centered in its layer.
    const phoneCx = phone.offsetLeft + phone.offsetWidth / 2;
    const phoneCy = phone.offsetTop + phone.offsetHeight / 2;
    cardTargets = cardEls.map(el => {
      const cx = el.offsetLeft + el.offsetWidth / 2;
      const cy = el.offsetTop + el.offsetHeight / 2;
      return { dx: phoneCx - cx, dy: phoneCy - cy };
    });
  }

  let morphRAF = null;

  function updateScroll() {
    morphRAF = null;
    const viewH = window.innerHeight;
    const scrollable = heroEl.offsetHeight - viewH;
    const scrolled = Math.max(0, window.scrollY);
    const raw = scrollable > 0 ? Math.min(scrolled / scrollable, 1) : 0;

    /* sound toggle only makes sense while the story with sound cues is on screen */
    soundBtn.classList.toggle('is-visible', raw < 0.995);

    /* ambient background emojis fade back once items start converging */
    floatLayer.style.opacity = String(1 - clamp01((raw - 0.2) / 0.4) * 0.85);

    /* aisle is visible at rest, then fades out once every item has left the shelf */
    const aisleOut = clamp01((raw - 0.06) / 0.18);
    aisle.style.opacity = String(1 - aisleOut);
    aisle.style.transform = `translate(-50%, ${lerp(-50, -58, aisleOut)}%) scale(${lerp(1, 0.92, aisleOut)})`;

    /* cart eases into view as items approach it, then rolls off once they've
       all popped back out — shell and rim move together so the "contained"
       illusion stays intact */
    const cartIn  = clamp01((raw - 0.18) / 0.10);
    const cartOut = clamp01((raw - 0.46) / 0.22);
    const cartOpacity = String(Math.min(cartIn, 1 - cartOut));
    const cartTransform = `translate(-50%, ${lerp(-46, -60, cartOut)}%) scale(${lerp(0.9, 1, cartIn) * lerp(1, 0.85, cartOut)})`;
    cart.style.opacity = cartOpacity;
    cart.style.transform = cartTransform;
    cartRim.style.opacity = cartOpacity;
    cartRim.style.transform = cartTransform;
    /* phone only appears once the cart has cleared out */
    phone.style.opacity = String(clamp01((raw - 0.66) / 0.12));

    /* acts 2-5, per item: shelf -> open air -> cart (gather) -> open air (exit) -> phone row (enter) */
    morphEls.forEach((el, i) => {
      const tgt = targets[i];
      if (!tgt) return;

      const aisleExitStart = T_AISLE_EXIT_START + i * AISLE_EXIT_STAGGER;
      const aisleExitEnd    = aisleExitStart + T_AISLE_EXIT_DUR;
      const gatherStart = T_GATHER_START + i * GATHER_STAGGER;
      const gatherEnd    = gatherStart + T_GATHER_DUR;
      const exitStart    = T_EXIT_START + i * EXIT_STAGGER;
      const exitEnd       = exitStart + T_EXIT_DUR;
      const enterStart   = T_ENTER_START + i * ENTER_STAGGER;

      // sound: lift-off the shelf, and settling into the cart — edge-triggered,
      // resets if you scroll back up past the threshold so it can replay
      if (raw > aisleExitStart) {
        if (!liftPlayed[i]) { liftPlayed[i] = true; sfx.whoosh(); }
      } else {
        liftPlayed[i] = false;
      }
      if (raw > gatherEnd) {
        if (!cartLandPlayed[i]) { cartLandPlayed[i] = true; sfx.clink(); }
      } else {
        cartLandPlayed[i] = false;
      }

      let left, top, width, height, emojiSize;
      let tc = 0; // enter-phone progress, used below for the row hand-off + text reveal
      let rot = 0; // cart-only tilt, so the pile reads as tossed in rather than a neat row
      // grounded = resting on a surface (shelf/cart), not mid-flight — bottom-aligns
      // the emoji so its visual base touches the shelf plank / rim instead of the
      // box's vertical center, which otherwise reads as floating above the surface.
      let grounded = false;

      if (raw <= aisleExitStart) {
        left = tgt.aisleLeft; top = tgt.aisleTop;
        width = height = AISLE_BOX; emojiSize = 32;
        grounded = true;
      } else if (raw < aisleExitEnd) {
        const ta = easeInOut(clamp01((raw - aisleExitStart) / T_AISLE_EXIT_DUR));
        left = lerp(tgt.aisleLeft, tgt.scatterLeft, ta);
        top  = lerp(tgt.aisleTop, tgt.scatterTop, ta);
        width = height = lerp(AISLE_BOX, START_BOX, ta); emojiSize = lerp(32, 44, ta);
      } else if (raw <= gatherStart) {
        left = tgt.scatterLeft; top = tgt.scatterTop;
        width = height = START_BOX; emojiSize = 44;
      } else if (raw < gatherEnd) {
        // Drop the item into the cart the way you actually would: swing sideways
        // + up to line up over the basket first, hover a beat, then fall straight
        // down into place — rather than converging on the cart in a diagonal line.
        const traw = clamp01((raw - gatherStart) / T_GATHER_DUR);
        const hoverTop = tgt.cartTop - 70;

        const lx = easeInOut(clamp01(traw / 0.6));
        left = lerp(tgt.scatterLeft, tgt.cartLeft, lx);

        if (traw < 0.5) {
          const ty = easeInOut(traw / 0.5);
          top = lerp(tgt.scatterTop, hoverTop, ty);
        } else {
          const ty = Math.pow((traw - 0.5) / 0.5, 2); // ease-in: accelerates like a real drop
          top = lerp(hoverTop, tgt.cartTop, ty);
        }

        const tg = easeInOut(traw);
        top += lerp(0, CART_JITTER_Y[i], tg);
        width = height = lerp(START_BOX, PARK_BOX, tg); emojiSize = lerp(44, 26, tg);
        rot = lerp(0, CART_TILT[i], tg);
      } else if (raw <= exitStart) {
        left = tgt.cartLeft; top = tgt.cartTop + CART_JITTER_Y[i];
        width = height = PARK_BOX; emojiSize = 26;
        rot = CART_TILT[i];
        grounded = true;
      } else if (raw < exitEnd) {
        const te = easeInOut(clamp01((raw - exitStart) / T_EXIT_DUR));
        left = lerp(tgt.cartLeft, tgt.scatterLeft, te);
        top  = lerp(tgt.cartTop, tgt.scatterTop, te) + lerp(CART_JITTER_Y[i], 0, te);
        width = height = lerp(PARK_BOX, START_BOX, te); emojiSize = lerp(26, 44, te);
        rot = lerp(CART_TILT[i], 0, te);
      } else if (raw <= enterStart) {
        left = tgt.scatterLeft; top = tgt.scatterTop;
        width = height = START_BOX; emojiSize = 44;
      } else {
        tc = easeInOut(clamp01((raw - enterStart) / T_ENTER_DUR));
        left = lerp(tgt.scatterLeft, tgt.endLeft, tc);
        top  = lerp(tgt.scatterTop, tgt.endTop, tc);
        width  = lerp(START_BOX, tgt.endWidth, tc);
        height = lerp(START_BOX, tgt.endHeight, tc);
        emojiSize = lerp(44, 22, tc);
      }

      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
      el.style.width = `${width}px`;
      el.style.height = `${height}px`;
      el.style.padding = tc > 0.05 ? `${lerp(0, 9, tc)}px ${lerp(0, 10, tc)}px` : '0';
      el.style.background = `rgba(255,255,255,${(0.03 * tc).toFixed(3)})`;
      el.style.opacity = '1';
      el.style.transform = rot ? `rotate(${rot.toFixed(1)}deg)` : '';
      el.classList.toggle('is-grounded', grounded);

      const emoji = el.querySelector('.dp-morph-e');
      emoji.style.fontSize = `${emojiSize}px`;

      const textT = clamp01((tc - 0.55) / 0.45);
      el.querySelector('.dp-morph-info').style.opacity = String(textT);
      el.querySelector('.dp-morph-day').style.opacity = String(textT);

      /* handoff: once landed, swap to the real (interactive-ready) row */
      const landed = tc > 0.94;
      if (landed) {
        if (!phoneLandPlayed[i]) { phoneLandPlayed[i] = true; sfx.pop(); }
      } else {
        phoneLandPlayed[i] = false;
      }
      rowEls[i].classList.toggle('is-in', landed);
      if (landed) el.style.opacity = '0';
    });

    /* act 4: alert cards spring out from the phone's center */
    cardEls.forEach((el, i) => {
      const tgt = cardTargets[i];
      if (!tgt) return;
      const start = T_NOTIFY_START + i * NOTIFY_STAGGER;
      const tRaw = clamp01((raw - start) / NOTIFY_DUR);
      const landed = tRaw >= 1;

      if (landed) {
        if (!notifyPlayed[i]) { notifyPlayed[i] = true; sfx.ding(); }
      } else {
        notifyPlayed[i] = false;
      }

      if (landed) {
        el.classList.add('is-in');
        el.style.transform = '';
        el.style.opacity = '1';
      } else {
        el.classList.remove('is-in');
        const te = easeOutBack(tRaw);
        const dx = lerp(tgt.dx, 0, te);
        const dy = lerp(tgt.dy, 0, te);
        const scale = Math.max(0, lerp(0.15, 1, easeInOut(tRaw)));
        el.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) rotate(var(--rot,0deg)) scale(${scale.toFixed(3)})`;
        el.style.opacity = String(clamp01(tRaw / 0.4));
      }
    });
  }

  window.addEventListener('scroll', () => {
    if (!morphRAF) morphRAF = requestAnimationFrame(updateScroll);
  }, { passive: true });

  let resizeT = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => { measure(); updateScroll(); }, 150);
  });

  /* run once after layout settles */
  requestAnimationFrame(() => { measure(); updateScroll(); });

})();
