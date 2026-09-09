/* Site behaviour: theme, nav, scroll effects, filters, carousel, lightbox.
   Everything degrades gracefully — the pages are readable with JS disabled. */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------------- theme */
  var root = document.documentElement;
  var themeBtn = $("#theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      themeBtn.setAttribute("aria-label", next === "dark" ? "Switch to light theme" : "Switch to dark theme");
      try { localStorage.setItem("dk-theme", next); } catch (e) {}
    });
  }

  /* ------------------------------------------------------------ mobile nav */
  var navToggle = $("#nav-toggle");
  var navLinks  = $("#nav-links");
  if (navToggle && navLinks) {
    var setNav = function (open) {
      navLinks.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
    };
    navToggle.addEventListener("click", function () {
      setNav(!navLinks.classList.contains("is-open"));
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.closest("a")) setNav(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setNav(false);
    });
  }

  /* --------------------------------------------- scroll progress + sticky */
  var nav      = $("#nav");
  var progress = $("#progress");
  var toTop    = $("#to-top");
  var ticking  = false;

  function onScroll() {
    var y   = window.scrollY || document.documentElement.scrollTop;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
    if (nav) nav.classList.toggle("is-stuck", y > 8);
    if (toTop) toTop.classList.toggle("is-visible", y > 600);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
  }

  /* ------------------------------------------------------------ scroll spy */
  var spyLinks = $$('#nav-links a[href^="#"]');
  if (spyLinks.length && "IntersectionObserver" in window) {
    var byId = {};
    var sections = spyLinks.map(function (a) {
      var el = document.getElementById(a.getAttribute("href").slice(1));
      if (el) byId[el.id] = a;
      return el;
    }).filter(Boolean);

    var visible = {};
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting; });
      var current = null;
      for (var i = 0; i < sections.length; i++) {
        if (visible[sections[i].id]) { current = sections[i].id; break; }
      }
      spyLinks.forEach(function (a) { a.classList.remove("is-active"); });
      if (current && byId[current]) byId[current].classList.add("is-active");
    }, { rootMargin: "-30% 0px -55% 0px", threshold: 0 });

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ------------------------------------------------------- reveal on scroll */
  var reveals = $$(".reveal");
  if (reveals.length) {
    if (reduced || !("IntersectionObserver" in window)) {
      reveals.forEach(function (el) { el.classList.add("is-in"); });
    } else {
      var ro = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.classList.add("is-in");
          obs.unobserve(en.target);
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
      reveals.forEach(function (el) { ro.observe(el); });
    }
  }

  /* ----------------------------------------------------------- stat counters */
  var counters = $$("[data-count]");
  if (counters.length) {
    var run = function (el) {
      el.dataset.done = "1";
      var target = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      var prefix = el.getAttribute("data-prefix") || "";
      if (reduced) { el.textContent = prefix + target + suffix; return; }
      var dur = 1400, t0 = null;
      var step = function (t) {
        if (t0 === null) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + Math.round(target * eased) + suffix;
        if (p < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    };
    if (!("IntersectionObserver" in window)) {
      counters.forEach(run);
    } else {
      var co = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          run(en.target);
          obs.unobserve(en.target);
        });
      }, { threshold: .5 });
      counters.forEach(function (el) { co.observe(el); });
    }

    /* Live publication metrics, refreshed weekly by a GitHub Action that
       reads OpenAlex. Falls back silently to the numbers in the HTML. */
    var metricEls = $$("[data-metric]");
    if (metricEls.length && window.fetch) {
      fetch("data/metrics.json", { cache: "no-cache" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (m) {
          if (!m) return;
          metricEls.forEach(function (el) {
            var v = m[el.getAttribute("data-metric")];
            if (typeof v !== "number" || v < 1) return;
            el.setAttribute("data-count", v);
            if (el.dataset.done) run(el);   // already animated — redo with the real figure
          });
          var stamp = $("#metrics-updated");
          if (stamp && m.updated) stamp.textContent = m.updated;
        })
        .catch(function () { /* offline or blocked: keep the static numbers */ });
    }
  }

  /* --------------------------------------------------- publication filters */
  var filters = $$("[data-filter]");
  if (filters.length) {
    var pubs = $$("[data-tags]");
    filters.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-filter");
        filters.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
        var shown = 0;
        pubs.forEach(function (p) {
          var match = key === "all" || p.getAttribute("data-tags").split(" ").indexOf(key) > -1;
          p.hidden = !match;
          if (match) shown++;
        });
        var live = $("#filter-status");
        if (live) live.textContent = shown + " publication" + (shown === 1 ? "" : "s") + " shown";
      });
    });
  }

  /* ----------------------------------------------------- expandable details */
  $$("[data-expand]").forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute("data-expand"));
    if (!panel) return;
    btn.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
      var label = btn.querySelector(".tl__more-label");
      if (label) label.textContent = open ? "Show less" : (btn.getAttribute("data-label") || "Show more");
    });
  });

  /* ------------------------------------------------------------- lightbox */
  var lb      = $("#lightbox");
  var lbImg   = $("#lightbox-img");
  var lbCap   = $("#lightbox-cap");
  var lastFocus = null;

  function openLightbox(src, alt) {
    if (!lb) return;
    lastFocus = document.activeElement;
    lbImg.src = src;
    lbImg.alt = alt || "";
    if (lbCap) lbCap.textContent = alt || "";
    lb.classList.add("is-open");
    document.body.style.overflow = "hidden";
    var close = $(".lightbox__close", lb);
    if (close) close.focus();
  }
  function closeLightbox() {
    if (!lb) return;
    lb.classList.remove("is-open");
    lbImg.src = "";
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  if (lb) {
    lb.addEventListener("click", function (e) {
      if (e.target === lb || e.target.closest(".lightbox__close")) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lb.classList.contains("is-open")) closeLightbox();
    });
  }
  $$("[data-full]").forEach(function (el) {
    el.addEventListener("click", function () {
      openLightbox(el.getAttribute("data-full"), el.getAttribute("data-alt") || "");
    });
  });

  /* -------------------------------------------------------------- carousel */
  $$(".carousel").forEach(function (car) {
    var track  = $(".carousel__track", car);
    var slides = $$(".carousel__slide", car);
    var prev   = $(".carousel__nav--prev", car);
    var next   = $(".carousel__nav--next", car);
    var dots   = $$(".carousel__dot", car);
    var thumbs = $$(".carousel__thumb", car);
    var cur    = $(".carousel__current", car);
    var play   = $(".carousel__play", car);
    if (!track || slides.length < 2) return;

    var index = 0, timer = null, playing = false;
    var DELAY = 6500;

    function render() {
      track.style.transform = "translateX(" + (-index * 100) + "%)";
      slides.forEach(function (s, i) {
        s.setAttribute("aria-hidden", String(i !== index));
        $$("a, button", s).forEach(function (el) {
          if (i === index) el.removeAttribute("tabindex");
          else el.setAttribute("tabindex", "-1");
        });
      });
      dots.forEach(function (d, i) { d.setAttribute("aria-selected", String(i === index)); });
      thumbs.forEach(function (t, i) { t.setAttribute("aria-selected", String(i === index)); });
      if (cur) cur.textContent = index + 1;
    }
    function go(i) { index = (i + slides.length) % slides.length; render(); }

    function stop() {
      playing = false;
      if (timer) { clearInterval(timer); timer = null; }
      if (play) {
        play.setAttribute("aria-pressed", "false");
        var l = $(".carousel__play-label", play);
        if (l) l.textContent = "Auto-play";
      }
    }
    function start() {
      if (reduced) return;
      playing = true;
      timer = setInterval(function () { go(index + 1); }, DELAY);
      if (play) {
        play.setAttribute("aria-pressed", "true");
        var l = $(".carousel__play-label", play);
        if (l) l.textContent = "Pause";
      }
    }

    if (prev) prev.addEventListener("click", function () { stop(); go(index - 1); });
    if (next) next.addEventListener("click", function () { stop(); go(index + 1); });
    dots.forEach(function (d, i) { d.addEventListener("click", function () { stop(); go(i); }); });
    thumbs.forEach(function (t, i) { t.addEventListener("click", function () { stop(); go(i); }); });
    if (play) play.addEventListener("click", function () { playing ? stop() : start(); });

    car.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft")  { stop(); go(index - 1); }
      if (e.key === "ArrowRight") { stop(); go(index + 1); }
    });
    car.addEventListener("mouseenter", function () { if (playing && timer) { clearInterval(timer); timer = null; } });
    car.addEventListener("mouseleave", function () { if (playing && !timer) timer = setInterval(function () { go(index + 1); }, DELAY); });

    /* touch swipe */
    var x0 = null;
    track.addEventListener("touchstart", function (e) { x0 = e.changedTouches[0].clientX; }, { passive: true });
    track.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) { stop(); go(index + (dx < 0 ? 1 : -1)); }
      x0 = null;
    }, { passive: true });

    render();
    if (car.hasAttribute("data-autoplay")) start();
  });

  /* ------------------------------------------------------------ year stamp */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
