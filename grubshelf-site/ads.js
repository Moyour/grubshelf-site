(function () {
  var CONSENT_KEY = "grubshelf_cookie_consent";
  var UTM_KEY = "grubshelf_utm";
  var UTM_PARAMS = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
  ];

  function readConsent() {
    try {
      return localStorage.getItem(CONSENT_KEY);
    } catch {
      return null;
    }
  }

  function saveConsent(value) {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {}
  }

  function captureUtm() {
    try {
      var params = new URLSearchParams(window.location.search);
      var utm = {};
      var hasAny = false;
      UTM_PARAMS.forEach(function (key) {
        var val = params.get(key);
        if (val) {
          utm[key] = val.slice(0, 200);
          hasAny = true;
        }
      });
      if (hasAny) {
        sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));
      }
    } catch {}
  }

  function getAttribution() {
    try {
      var raw = sessionStorage.getItem(UTM_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function getPixelId() {
    var cfg = window.GRUBSHELF_ADS_CONFIG || {};
    return (cfg.metaPixelId || "").trim();
  }

  function getGa4Id() {
    var cfg = window.GRUBSHELF_ADS_CONFIG || {};
    return (cfg.ga4MeasurementId || "").trim();
  }

  function loadGa4() {
    var measurementId = getGa4Id();
    if (!measurementId || window.gtag) return;

    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + measurementId;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", measurementId);
  }

  function loadMetaPixel() {
    var pixelId = getPixelId();
    if (!pixelId || window.fbq) return;

    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

    window.fbq("init", pixelId);
    window.fbq("track", "PageView");
  }

  function trackLead(source) {
    if (readConsent() !== "accepted") return;
    if (window.fbq) window.fbq("track", "Lead", source ? { content_name: source } : {});
    if (window.gtag) window.gtag("event", "waitlist_submit", source ? { method: source } : {});
  }

  function trackCtaClick(source) {
    if (readConsent() !== "accepted" || !window.gtag) return;
    window.gtag("event", "waitlist_cta_click", source ? { method: source } : {});
  }

  function attachCtaClickTracking() {
    var links = document.querySelectorAll('a[href="#vf-waitlist"]');
    links.forEach(function (link, index) {
      link.addEventListener("click", function () {
        trackCtaClick(link.className || "cta-" + index);
      });
    });
  }

  function showConsentBanner() {
    if (readConsent() || (!getPixelId() && !getGa4Id())) return;

    var bar = document.createElement("div");
    bar.className = "cookie-consent";
    bar.setAttribute("role", "dialog");
    bar.setAttribute("aria-label", "Cookie consent");
    bar.innerHTML =
      '<p>We use cookies to measure ads and improve the site. See our <a href="/privacy">Privacy Policy</a>.</p>' +
      '<div class="cookie-consent-actions">' +
      '<button type="button" class="cookie-decline">Decline</button>' +
      '<button type="button" class="cookie-accept">Accept</button>' +
      "</div>";

    bar.querySelector(".cookie-accept").addEventListener("click", function () {
      saveConsent("accepted");
      bar.remove();
      loadMetaPixel();
      loadGa4();
    });
    bar.querySelector(".cookie-decline").addEventListener("click", function () {
      saveConsent("declined");
      bar.remove();
    });

    document.body.appendChild(bar);
  }

  captureUtm();
  if (readConsent() === "accepted") {
    loadMetaPixel();
    loadGa4();
  } else {
    showConsentBanner();
  }
  attachCtaClickTracking();

  window.GrubShelfAds = {
    getAttribution: getAttribution,
    trackLead: trackLead,
  };
})();
