(function () {
  "use strict";
  var C = window.WORMING_B2B || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Contact links from config ---------- */
  var wa = "https://wa.me/" + (C.whatsapp || "") + "?text=" + encodeURIComponent("Hi Toms, I just applied as a Worming partner.");
  $$("[data-whatsapp]").forEach(function (a) { a.href = wa; a.target = "_blank"; a.rel = "noopener"; });
  $$("[data-email]").forEach(function (a) { if (C.email) { a.href = "mailto:" + C.email; a.textContent = C.email; } });
  $$("[data-personal]").forEach(function (a) { if (C.personalUseUrl) a.href = C.personalUseUrl; });

  /* ---------- Launch offer: personal deadline per visitor ---------- */
  var firstVisit = Date.now();
  try {
    var fv = parseInt(localStorage.getItem("wm_first_visit"), 10);
    if (fv && fv <= Date.now()) firstVisit = fv; else localStorage.setItem("wm_first_visit", String(firstVisit));
  } catch (e) {}
  var offerEnd = firstVisit + (C.offerHours || 72) * 3600e3;
  if (C.offerDeadline) offerEnd = Math.min(offerEnd, new Date(C.offerDeadline).getTime());
  var offerOn = Date.now() <= offerEnd;
  function hideOffer() { $$("[data-offer]").forEach(function (el) { el.hidden = true; el.style.display = "none"; }); }
  function left(ms) {
    var m = Math.max(0, Math.floor(ms / 60000)), d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mm = m % 60;
    if (d >= 1) return d + (d === 1 ? " day " : " days ") + h + " h";
    if (h >= 1) return h + " h " + mm + " min";
    return mm + " min";
  }
  function tick() {
    var ms = offerEnd - Date.now();
    if (ms <= 0) { offerOn = false; hideOffer(); return; }
    $$("[data-countdown]").forEach(function (el) { el.textContent = left(ms); });
    setTimeout(tick, 30000);
  }
  if (offerOn) tick(); else hideOffer();

  /* ---------- Video ---------- */
  var fig = $("#video");
  if (fig && C.videoSrc) {
    var v = document.createElement("video");
    v.controls = true; v.playsInline = true; v.preload = "metadata";
    if (C.videoPoster) v.poster = C.videoPoster;
    v.src = C.videoSrc;
    v.addEventListener("play", function once() { track("ViewContent", { content_name: "founder_video" }); v.removeEventListener("play", once); });
    fig.innerHTML = ""; fig.appendChild(v);
  }

  /* ---------- Meta Pixel with consent ---------- */
  var pixelOn = false;
  function loadPixel() {
    if (pixelOn || !C.metaPixelId) return;
    pixelOn = true;
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    window.fbq("init", C.metaPixelId);
    window.fbq("track", "PageView");
  }
  function track(ev, data, custom) {
    if (pixelOn && window.fbq) window.fbq(custom ? "trackCustom" : "track", ev, data || {});
  }
  if (C.metaPixelId) {
    var choice = null;
    try { choice = localStorage.getItem("wm_consent"); } catch (e) {}
    if (choice === "yes") loadPixel();
    else if (choice !== "no") {
      var bar = $("#consent"); bar.hidden = false;
      $$("[data-consent]", bar).forEach(function (b) {
        b.addEventListener("click", function () {
          var yes = b.getAttribute("data-consent") === "yes";
          try { localStorage.setItem("wm_consent", yes ? "yes" : "no"); } catch (e) {}
          bar.hidden = true;
          if (yes) loadPixel();
        });
      });
    }
  }

  /* ---------- Tracking fields ---------- */
  var form = $("#qform");
  if (!form) return;
  var params = new URLSearchParams(location.search);
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"].forEach(function (k) {
    var val = params.get(k);
    try {
      if (val) sessionStorage.setItem("wm_" + k, val); else val = sessionStorage.getItem("wm_" + k);
    } catch (e) {}
    if (val && form.elements[k]) form.elements[k].value = val;
  });
  form.elements.landing_url.value = location.origin + location.pathname;

  /* ---------- Steps ---------- */
  var steps = $$(".q", form);
  var total = steps.length;
  var order = steps.map(function (_, i) { return i; });
  var pos = 0, cur = 0, quick = false;
  var bar = $(".qform__bar span", form);
  var nowEl = $("[data-step-now]", form);
  var totalEl = $("[data-step-total]", form);
  totalEl.textContent = total;
  var backBtn = $("[data-back]", form);
  var card = $(".card");
  var started = false;

  function show(p, focus) {
    pos = p; cur = order[p];
    var i = cur;
    steps.forEach(function (s, n) { s.classList.toggle("is-active", n === i); });
    nowEl.textContent = p + 1;
    totalEl.textContent = order.length;
    bar.style.width = ((p + 1) / order.length * 100) + "%";
    backBtn.hidden = p === 0 && !quick;
    var ql = $("[data-quick-link]", form); if (ql) ql.hidden = quick || p !== 0;
    if (focus) {
      var r = card.getBoundingClientRect();
      if (r.top < 0 || r.top > window.innerHeight * 0.4) card.scrollIntoView({ behavior: "smooth", block: "start" });
      var first = steps[i].querySelector("input:not([type=hidden]), select");
      if (first && window.matchMedia("(pointer:fine)").matches) setTimeout(function () { first.focus({ preventScroll: true }); }, 260);
    }
  }

  function valid(step) {
    if (step.hasAttribute("data-optional")) return true;
    var radios = $$("input[type=radio]", step);
    if (radios.length) return radios.some(function (r) { return r.checked; });
    var checks = $$(".opt--check input", step);
    if (checks.length) return checks.some(function (c) { return c.checked; });
    var ok = true;
    $$("input[required], select[required]", step).forEach(function (el) {
      var good = el.type === "checkbox" ? el.checked : el.checkValidity() && String(el.value).trim() !== "";
      el.closest(".field, .tick") && el.closest(".field, .tick").classList.toggle("is-bad", !good);
      if (!good) ok = false;
    });
    return ok;
  }

  function shake(step) {
    step.classList.remove("shake"); void step.offsetWidth; step.classList.add("shake");
  }

  function next() {
    var step = steps[cur];
    if (!valid(step)) { shake(step); return; }
    if (!started) { started = true; track("StartApplication", {}, true); }
    if (cur === 0) {
      var types = $$("input[name=business_type]:checked", form).map(function (c) { return c.value; });
      if (types.length === 1 && types[0] === "personal_use") { endScreen("#done-personal"); return; }
    }
    if (pos < order.length - 1) show(pos + 1, true);
  }

  // auto-advance on single-choice steps
  steps.forEach(function (step) {
    if (step.hasAttribute("data-auto")) {
      $$("input[type=radio]", step).forEach(function (r) {
        r.addEventListener("change", function () { setTimeout(next, 220); });
      });
    }
    // "Not sure yet" unticks the others, and the others untick it
    $$(".opt--check input", step).forEach(function (c) {
      c.addEventListener("change", function () {
        if (!c.checked) return;
        $$(".opt--check input", step).forEach(function (o) {
          if (o === c) return;
          if (c.value === "not_sure" || o.value === "not_sure") o.checked = false;
        });
      });
    });
  });
  $$("[data-next]", form).forEach(function (b) { b.addEventListener("click", next); });
  backBtn.addEventListener("click", function () {
    if (pos > 0) { show(pos - 1, true); return; }
    if (quick) { setQuick(false); show(0, true); }
  });
  // Quick path: country + contact only
  var phoneEl = form.elements.phone;
  function setQuick(on) {
    quick = on;
    order = on ? [total - 1] : steps.map(function (_, i) { return i; });
    form.classList.toggle("is-quick", on);
    // Quick path asks only for email, company and country
    ["first_name", "last_name", "phone"].forEach(function (n) { form.elements[n].required = !on; });
    if (on) form.elements.wants_sample.checked = false;
    var sb = $("button[type=submit] span", form);
    sb.textContent = on ? "Send me the price list" : "Send my application";
  }
  var qb = $("[data-quick]", form);
  if (qb) qb.addEventListener("click", function () { setQuick(true); track("QuickPriceList", {}, true); show(0, true); });
  // Skippable questions
  $$("[data-skip]", form).forEach(function (b) {
    b.addEventListener("click", function () {
      $$("input[type=radio]", steps[cur]).forEach(function (r) { r.checked = false; });
      if (pos < order.length - 1) show(pos + 1, true);
    });
  });
  form.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA" && e.target.tagName !== "BUTTON" && pos < order.length - 1) { e.preventDefault(); next(); }
  });
  $$(".field input, .field select, .tick input", form).forEach(function (el) {
    el.addEventListener("input", function () { var w = el.closest(".field, .tick"); if (w) w.classList.remove("is-bad"); });
  });

  function endScreen(sel) {
    form.hidden = true;
    $$(".done").forEach(function (d) { d.hidden = true; });
    var d = $(sel); d.hidden = false;
    d.focus({ preventScroll: true });
    card.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  $("[data-restart]").addEventListener("click", function () {
    $$(".done").forEach(function (d) { d.hidden = true; });
    form.hidden = false;
    $$("input[name=business_type]", form).forEach(function (r) { r.checked = false; });
    setQuick(false);
    show(0, true);
  });

  /* ---------- Lead score (A = call first) ---------- */
  function score(d) {
    var s = 0;
    var bt = { distributor_wholesaler: 30, substrate_producer: 30, retailer_online: 20, commercial_grower: 10 };
    s += String(d.business_type || "").split(", ").reduce(function (m, v) { return Math.max(m, bt[v] || 0); }, 0);
    s += ({ trial_first: 5, "0_1t": 5, "1_10t": 10, "10_50t": 20, "50_200t": 30, "200t_plus": 35 })[d.volume_year1] || 0;
    s += ({ under_500k: 5, "500k_2m": 12, "2m_10m": 20, "10m_plus": 25, prefer_not: 5 })[d.turnover] || 0;
    s += ({ within_1_month: 10, "1_3_months": 8, next_season: 5, exploring: 0 })[d.timeline] || 0;
    if (d.website) s += 5;
    return s;
  }

  function collect() {
    var fd = new FormData(form), d = {};
    fd.forEach(function (v, k) {
      if (k === "company_url") return;
      d[k] = d[k] ? d[k] + ", " + v : v;
    });
    d.use = d.use || ""; d.formats = d.formats || "";
    var s = score(d);
    d.lead_score = String(s);
    d.lead_tier = s >= 75 ? "A" : s >= 45 ? "B" : "C";
    if (quick) { d.path = "Quick price-list request"; d.lead_tier = "Quick"; } else d.path = "Full application";
    if (offerOn && C.offerLabel) d.launch_offer = C.offerLabel;
    d.first_visit = new Date(firstVisit).toISOString();
    d.offer_deadline = new Date(offerEnd).toISOString();
    return d;
  }

  var labels = {
    path: "Request type", business_type: "Business type", country: "Country", use: "Use", formats: "Formats",
    volume_year1: "First-year volume", turnover: "Turnover", timeline: "Start", first_name: "First name",
    last_name: "Last name", company: "Company", email: "Email", phone: "Phone / WhatsApp", website: "Website",
    wants_sample: "Free sample", launch_offer: "Launch offer", first_visit: "First visit", offer_deadline: "Offer deadline", lead_tier: "Lead tier", lead_score: "Lead score", utm_source: "utm_source",
    utm_medium: "utm_medium", utm_campaign: "utm_campaign", utm_content: "utm_content", fbclid: "fbclid"
  };
  function asText(d) {
    return Object.keys(labels).filter(function (k) { return d[k]; }).map(function (k) { return labels[k] + ": " + d[k]; }).join("\n");
  }

  var errEl = $(".q__error", form);
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var step = steps[cur];
    if (pos !== order.length - 1) { next(); return; }
    if (!valid(step)) { shake(step); return; }
    if (form.elements.company_url.value) return; // bot
    var d = collect();
    var subject = "Partner application [" + d.lead_tier + "]: " + d.company + " (" + d.country + ")";
    var btn = $("button[type=submit]", form);

    function success() {
      track("Lead", { content_name: "partner_application", lead_tier: d.lead_tier });
      $("[data-name]").textContent = d.first_name ? ", " + d.first_name : "";
      endScreen("#done-thanks");
    }

    if (!C.formEndpoint) {
      // No form service yet: open a pre-filled email so the application is not lost.
      $(".done__fallback").hidden = false;
      location.href = "mailto:" + C.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(asText(d));
      success();
      return;
    }

    btn.disabled = true; btn.classList.add("is-busy");
    errEl.hidden = true;
    var payload = Object.assign({ _subject: subject, subject: subject }, d);
    if (C.web3formsKey) payload.access_key = C.web3formsKey;
    fetch(C.formEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      success();
    }).catch(function () {
      errEl.innerHTML = "Something went wrong sending your application. Please <a href=\"mailto:" + C.email +
        "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(asText(d)) + "\">send it by email</a> instead.";
      errEl.hidden = false;
    }).then(function () { btn.disabled = false; btn.classList.remove("is-busy"); });
  });

  show(0, false);

  /* ---------- Sticky CTA: hide while the form is on screen ---------- */
  var sticky = $(".sticky-cta");
  var hero = $(".hero__form");
  if (sticky && hero && "IntersectionObserver" in window) {
    var past = false, formVisible = true;
    var wa = $(".wa-float");
    var upd = function () { var on = past && !formVisible; sticky.classList.toggle("is-on", on); if (wa) wa.classList.toggle("is-on", on); };
    new IntersectionObserver(function (en) { formVisible = en[0].isIntersecting; upd(); }).observe(hero);
    window.addEventListener("scroll", function () { past = window.scrollY > window.innerHeight * 0.8; upd(); }, { passive: true });
  }
})();
