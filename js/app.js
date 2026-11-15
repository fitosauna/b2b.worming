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

  /* ---------- Phone country code (guessed from the visitor's time zone; no IP lookup) ---------- */
  var DIAL = [["AL","Albania","+355"],["AD","Andorra","+376"],["AT","Austria","+43"],["BE","Belgium","+32"],["BA","Bosnia and Herzegovina","+387"],["BG","Bulgaria","+359"],["HR","Croatia","+385"],["CY","Cyprus","+357"],["CZ","Czechia","+420"],["DK","Denmark","+45"],["EE","Estonia","+372"],["FI","Finland","+358"],["FR","France","+33"],["DE","Germany","+49"],["GR","Greece","+30"],["HU","Hungary","+36"],["IS","Iceland","+354"],["IE","Ireland","+353"],["IT","Italy","+39"],["XK","Kosovo","+383"],["LV","Latvia","+371"],["LI","Liechtenstein","+423"],["LT","Lithuania","+370"],["LU","Luxembourg","+352"],["MT","Malta","+356"],["MD","Moldova","+373"],["MC","Monaco","+377"],["ME","Montenegro","+382"],["NL","Netherlands","+31"],["MK","North Macedonia","+389"],["NO","Norway","+47"],["PL","Poland","+48"],["PT","Portugal","+351"],["RO","Romania","+40"],["SM","San Marino","+378"],["RS","Serbia","+381"],["SK","Slovakia","+421"],["SI","Slovenia","+386"],["ES","Spain","+34"],["SE","Sweden","+46"],["CH","Switzerland","+41"],["TR","Turkey","+90"],["UA","Ukraine","+380"],["GB","United Kingdom","+44"],["US","United States","+1"],["CA","Canada","+1"]];
  var TZ = {Riga:"LV",Vilnius:"LT",Tallinn:"EE",Helsinki:"FI",Stockholm:"SE",Oslo:"NO",Copenhagen:"DK",Berlin:"DE",Busingen:"DE",Amsterdam:"NL",Brussels:"BE",Luxembourg:"LU",Paris:"FR",Monaco:"MC",Madrid:"ES",Canary:"ES",Lisbon:"PT",Madeira:"PT",London:"GB",Dublin:"IE",Zurich:"CH",Vienna:"AT",Prague:"CZ",Bratislava:"SK",Warsaw:"PL",Budapest:"HU",Ljubljana:"SI",Zagreb:"HR",Belgrade:"RS",Sarajevo:"BA",Podgorica:"ME",Skopje:"MK",Tirane:"AL",Sofia:"BG",Bucharest:"RO",Chisinau:"MD",Kiev:"UA",Kyiv:"UA",Athens:"GR",Rome:"IT",Vaduz:"LI",San_Marino:"SM",Andorra:"AD",Malta:"MT",Istanbul:"TR",Reykjavik:"IS",Nicosia:"CY",Famagusta:"CY"};
  function guessCountry() {
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      var city = tz.split("/").pop();
      if (TZ[city]) return TZ[city];
    } catch (e) {}
    var langs = navigator.languages || [navigator.language || ""];
    for (var i = 0; i < langs.length; i++) {
      var m = /-([A-Z]{2})$/i.exec(langs[i]);
      if (m && DIAL.some(function (c) { return c[0] === m[1].toUpperCase(); })) return m[1].toUpperCase();
    }
    return "LV";
  }
  var prefixSel = form.elements.phone_prefix;
  if (prefixSel) {
    var guess = guessCountry();
    prefixSel.innerHTML = DIAL.map(function (c) {
      return '<option value="' + c[0] + '"' + (c[0] === guess ? " selected" : "") + ">" + c[0] + " " + c[2] + "</option>";
    }).join("");
    $$("option", prefixSel).forEach(function (o, i) { o.title = DIAL[i][1]; });
  }
  function dialFor(cc) { var c = DIAL.filter(function (x) { return x[0] === cc; })[0]; return c ? c[2] : ""; }

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
  // Quick path: company + email only
  var phoneEl = form.elements.phone;
  function setQuick(on) {
    quick = on;
    order = on ? [total - 1] : steps.map(function (_, i) { return i; });
    form.classList.toggle("is-quick", on);
    // Quick path asks only for company and email
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
    d.use = d.use || "";
    if (d.phone_prefix) {
      d.phone_country = d.phone_prefix;
      var ph = String(d.phone || "").trim();
      if (ph) d.phone = ph.charAt(0) === "+" ? ph : dialFor(d.phone_prefix) + " " + ph.replace(/^0+/, "");
      delete d.phone_prefix;
    }
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
    path: "Request type", business_type: "Business type", phone_country: "Phone country", use: "Use",
    volume_year1: "First-year volume", turnover: "Turnover", timeline: "Start", first_name: "First name",
    last_name: "Last name", company: "Company", email: "Email", phone: "Phone / WhatsApp", website: "Website",
    wants_sample: "Free sample", launch_offer: "Launch offer", first_visit: "First visit", offer_deadline: "Offer deadline", lead_tier: "Lead tier", lead_score: "Lead score", utm_source: "utm_source",
    utm_medium: "utm_medium", utm_campaign: "utm_campaign", utm_content: "utm_content", fbclid: "fbclid"
  };
  function asText(d) {
    return Object.keys(labels).filter(function (k) { return d[k]; }).map(function (k) { return labels[k] + ": " + d[k]; }).join("\n");
  }

  var errEl = $(".q__error", form);

  // Sends a lead to the form service (or opens a pre-filled email if none is set).
  // cb(ok, usedEmailFallback)
  function sendLead(d, subject, errBox, cb) {
    var mail = "mailto:" + C.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(asText(d));
    if (!C.formEndpoint) { location.href = mail; cb(true, true); return; }
    errBox.hidden = true;
    var payload = Object.assign({ _subject: subject, subject: subject }, d);
    if (C.web3formsKey) payload.access_key = C.web3formsKey;
    fetch(C.formEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      cb(true, false);
    }).catch(function () {
      errBox.innerHTML = "Something went wrong. Please <a href=\"" + mail + "\">send it by email</a> instead.";
      errBox.hidden = false;
      cb(false, false);
    });
  }

  function tracking() {
    var o = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "landing_url"].forEach(function (k) {
      if (form.elements[k] && form.elements[k].value) o[k] = form.elements[k].value;
    });
    return o;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var step = steps[cur];
    if (pos !== order.length - 1) { next(); return; }
    if (!valid(step)) { shake(step); return; }
    if (form.elements.company_url.value) return; // bot
    var d = collect();
    var subject = "Partner application [" + d.lead_tier + "]: " + d.company + (d.phone_country ? " (" + d.phone_country + ")" : "");
    var btn = $("button[type=submit]", form);
    btn.disabled = true; btn.classList.add("is-busy");
    sendLead(d, subject, errEl, function (ok, fallback) {
      btn.disabled = false; btn.classList.remove("is-busy");
      if (!ok) return;
      submitted = true;
      track("Lead", { content_name: "partner_application", lead_tier: d.lead_tier });
      if (fallback) $("#done-thanks .done__fallback").hidden = false;
      $("[data-name]").textContent = d.first_name ? ", " + d.first_name : "";
      endScreen("#done-thanks");
    });
  });

  show(0, false);

  /* ---------- WhatsApp button: on phones, hide while the form is on screen ---------- */
  var wa = $(".wa-float");
  var heroForm = $(".hero__form");
  if (wa && heroForm && "IntersectionObserver" in window) {
    var past = false, formVisible = true;
    var upd = function () { wa.classList.toggle("is-on", past && !formVisible); };
    new IntersectionObserver(function (en) { formVisible = en[0].isIntersecting; upd(); }).observe(heroForm);
    window.addEventListener("scroll", function () { past = window.scrollY > window.innerHeight * 0.8; upd(); }, { passive: true });
  }

  /* ---------- Exit intent: email for product details and wholesale offer ---------- */
  var exitBox = $("#exit");
  var submitted = false;
  function seen() { try { return localStorage.getItem("wm_exit_seen") === "1"; } catch (e) { return false; } }
  function openExit() {
    if (!exitBox || seen() || submitted || form.hidden) return;
    try { localStorage.setItem("wm_exit_seen", "1"); } catch (e) {}
    exitBox.hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(function () { var i = $("#exit-form input[name=email]"); if (i && window.matchMedia("(pointer:fine)").matches) i.focus(); }, 50);
    track("ExitOfferShown", {}, true);
  }
  function closeExit() { if (!exitBox) return; exitBox.hidden = true; document.body.style.overflow = ""; }
  if (exitBox) {
    var armedAt = Date.now() + 8000; // never in the first 8 seconds
    document.addEventListener("mouseout", function (e) {
      if (!e.relatedTarget && e.clientY <= 0 && Date.now() > armedAt) openExit();
    });
    // Phones: a quick scroll back up after reading half the page
    var lastY = window.scrollY, lastT = Date.now(), maxY = 0;
    window.addEventListener("scroll", function () {
      var y = window.scrollY, now = Date.now();
      maxY = Math.max(maxY, y);
      var speed = (lastY - y) / Math.max(1, now - lastT);
      if (window.matchMedia("(pointer:coarse)").matches && now > armedAt &&
          maxY > document.body.scrollHeight * 0.5 && speed > 1.5) openExit();
      lastY = y; lastT = now;
    }, { passive: true });
    $$("[data-exit-close]", exitBox).forEach(function (b) { b.addEventListener("click", closeExit); });
    exitBox.addEventListener("click", function (e) { if (e.target === exitBox) closeExit(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !exitBox.hidden) closeExit(); });
    var exitForm = $("#exit-form");
    exitForm.elements.email.addEventListener("input", function () { exitForm.querySelector(".field").classList.remove("is-bad"); });
    exitForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var em = exitForm.elements.email;
      var good = em.checkValidity() && em.value.trim() !== "";
      em.closest(".field").classList.toggle("is-bad", !good);
      if (!good) { exitForm.classList.remove("shake"); void exitForm.offsetWidth; exitForm.classList.add("shake"); return; }
      var d = Object.assign({ path: "Exit popup: product details and wholesale offer", email: em.value.trim(), lead_tier: "Exit" }, tracking());
      if (offerOn && C.offerLabel) d.launch_offer = C.offerLabel;
      var btn = $("button[type=submit]", exitForm);
      btn.disabled = true;
      sendLead(d, "Wholesale offer request (exit popup): " + d.email, $(".q__error", exitForm), function (ok, fallback) {
        btn.disabled = false;
        if (!ok) return;
        submitted = true;
        track("Lead", { content_name: "exit_popup" });
        exitForm.hidden = true;
        var dn = $(".exit__done", exitBox); dn.hidden = false;
        if (fallback) $(".done__fallback", dn).hidden = false;
      });
    });
  }
})();
