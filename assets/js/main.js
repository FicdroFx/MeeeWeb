/* Mani — portfolio behaviour. Plain JavaScript, no dependencies. */
(function () {
  "use strict";

  var root = document.documentElement;
  var config = window.SITE_CONFIG || {};
  var base = root.getAttribute("data-root") || "";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Settings from config.js -------------------------------------------- */
  function applyConfig() {
    var links = {
      email: config.email ? "mailto:" + config.email : "",
      linkedin: config.linkedin || "",
      github: config.github || "",
      resume: config.resumeUrl ? base + config.resumeUrl : ""
    };

    document.querySelectorAll("[data-link]").forEach(function (el) {
      var key = el.getAttribute("data-link");
      var href = links[key];
      var label = el.querySelector("[data-link-text]");

      if (href) {
        el.setAttribute("href", href);
        el.removeAttribute("aria-disabled");
        el.classList.remove("is-pending");
        if (key !== "email") {
          el.setAttribute("target", "_blank");
          el.setAttribute("rel", "noopener");
        }
        if (el.hasAttribute("data-download")) el.setAttribute("download", "");
        if (label && key === "email") label.textContent = config.email;
      } else {
        var pending = el.getAttribute("data-pending") || "Coming soon";
        el.removeAttribute("href");
        el.setAttribute("aria-disabled", "true");
        el.classList.add("is-pending");
        el.setAttribute("title", pending);
        if (label) label.textContent = pending;
      }
    });

    document.querySelectorAll("[data-resume-note]").forEach(function (note) {
      note.hidden = Boolean(config.resumeUrl);
    });

    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* Theme ----------------------------------------------------------------- */
  function initTheme() {
    var btn = document.querySelector("[data-theme-toggle]");
    if (!btn) return;

    function sync() {
      var dark = root.getAttribute("data-theme") === "dark";
      btn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    }

    sync();
    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) { /* storage unavailable */ }
      sync();
    });
  }

  /* Header & mobile navigation ------------------------------------------ */
  function initHeader() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector("[data-menu-toggle]");
    if (!header) return;

    function onScroll() {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (!toggle) return;
    var nav = document.getElementById(toggle.getAttribute("aria-controls"));

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      header.classList.toggle("nav-open", open);
      document.body.classList.toggle("no-scroll", open);
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && header.classList.contains("nav-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
    window.matchMedia("(min-width: 900px)").addEventListener("change", function (e) {
      if (e.matches) setOpen(false);
    });
  }

  /* Highlights the link for the section in view (main nav and case-study contents). */
  function initScrollSpy(selector) {
    var links = Array.prototype.slice.call(document.querySelectorAll(selector));
    var targets = [];
    links.forEach(function (link) {
      var id = link.hash ? link.hash.slice(1) : "";
      var section = id && document.getElementById(id);
      if (section) targets.push({ section: section, link: link });
    });
    if (!targets.length || !("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        targets.forEach(function (t) {
          if (t.section === entry.target) t.link.setAttribute("aria-current", "true");
          else t.link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });

    targets.forEach(function (t) { observer.observe(t.section); });
  }

  /* Scroll-triggered reveal ---------------------------------------------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    items.forEach(function (el) { observer.observe(el); });
  }

  /* Back to top ------------------------------------------------------------ */
  function initBackToTop() {
    var btn = document.querySelector("[data-back-to-top]");
    if (!btn) return;
    function onScroll() {
      btn.classList.toggle("is-visible", window.scrollY > 700);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      var target = document.getElementById("main");
      if (target) target.focus({ preventScroll: true });
    });
  }

  /* Tabs (skills) ------------------------------------------------------------ */
  function initTabs() {
    document.querySelectorAll("[data-tabs]").forEach(function (wrap) {
      var tabs = Array.prototype.slice.call(wrap.querySelectorAll('[role="tab"]'));

      function select(tab, focus) {
        tabs.forEach(function (t) {
          var on = t === tab;
          var panel = document.getElementById(t.getAttribute("aria-controls"));
          t.setAttribute("aria-selected", String(on));
          t.tabIndex = on ? 0 : -1;
          panel.hidden = !on;
          panel.classList.toggle("is-entering", on);
        });
        if (focus) tab.focus();
      }

      tabs.forEach(function (tab, i) {
        tab.addEventListener("click", function () { select(tab); });
        tab.addEventListener("keydown", function (e) {
          var next = null;
          if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
          else if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
          else if (e.key === "Home") next = tabs[0];
          else if (e.key === "End") next = tabs[tabs.length - 1];
          if (next) {
            e.preventDefault();
            select(next, true);
          }
        });
      });

      // Without JavaScript every panel stays visible; with it, show the first one.
      select(tabs.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0] || tabs[0]);
    });
  }

  /* Project filter ----------------------------------------------------------- */
  function initFilter() {
    var bar = document.querySelector("[data-filter]");
    if (!bar) return;
    var buttons = Array.prototype.slice.call(bar.querySelectorAll("button[data-value]"));
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-category]"));
    var status = document.querySelector("[data-filter-status]");

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var value = btn.getAttribute("data-value");
        var count = 0;
        buttons.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
        items.forEach(function (item) {
          var show = value === "all" || item.getAttribute("data-category").split(" ").indexOf(value) !== -1;
          item.hidden = !show;
          if (show) count++;
        });
        if (status) status.textContent = "Showing " + count + " project" + (count === 1 ? "" : "s");
      });
    });
  }

  /* Terminal intro (skippable) ------------------------------------------------- */
  function initTerminal() {
    var term = document.querySelector("[data-terminal]");
    if (!term) return;
    var lines = Array.prototype.slice.call(term.querySelectorAll("[data-line]"));
    var skip = term.querySelector("[data-terminal-skip]");
    var texts = lines.map(function (l) { return l.textContent; });
    var lineIndex = 0;
    var charIndex = 0;
    var timer = null;

    function finish() {
      clearTimeout(timer);
      lines.forEach(function (l, i) {
        l.textContent = texts[i];
        l.classList.remove("is-typing");
      });
      if (skip) skip.hidden = true;
    }

    if (reduceMotion) {
      finish();
      return;
    }

    function tick() {
      if (lineIndex >= lines.length) return finish();
      var line = lines[lineIndex];
      var text = texts[lineIndex];
      line.classList.add("is-typing");
      if (charIndex < text.length) {
        charIndex++;
        line.textContent = text.slice(0, charIndex);
        timer = setTimeout(tick, line.classList.contains("t-cmd") ? 45 : 14);
      } else {
        line.classList.remove("is-typing");
        lineIndex++;
        charIndex = 0;
        timer = setTimeout(tick, 280);
      }
    }

    lines.forEach(function (l) { l.textContent = ""; });
    if (skip) skip.addEventListener("click", finish);
    timer = setTimeout(tick, 700);
  }

  /* Hero sky: twinkling stars, a new constellation every 3 seconds ------------ */
  function initSky() {
    var sky = document.querySelector("[data-sky]");
    var canvas = sky && sky.querySelector("canvas");
    if (!canvas || !canvas.getContext) return;

    var ctx = canvas.getContext("2d");
    var CYCLE = 3000;   // a new constellation starts every 3 seconds
    var DRAW = 1100;    // time to draw its lines
    var FADE = 700;     // fade-out after the next one has started
    var w = 0, h = 0, dpr = 1;
    var stars = [], constellations = [], colors = null;
    var lastSpawn = -Infinity, frame = 0, running = false, inView = true;
    var sprites = {
      glow: ["205,212,255", "255,205,236", "218,206,255"].map(makeGlow),
      spark: makeSpark()
    };

    // Pre-rendered star images keep each frame cheap.
    function makeGlow(tint) {
      var s = document.createElement("canvas");
      s.width = s.height = 64;
      var c = s.getContext("2d");
      var g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.12, "rgba(255,255,255,0.9)");
      g.addColorStop(0.32, "rgba(" + tint + ",0.38)");
      g.addColorStop(1, "rgba(" + tint + ",0)");
      c.fillStyle = g;
      c.fillRect(0, 0, 64, 64);
      return s;
    }

    function makeSpark() {
      var s = document.createElement("canvas");
      s.width = s.height = 128;
      var c = s.getContext("2d");
      [[0, 64, 128, 64], [64, 0, 64, 128]].forEach(function (l) {
        var g = c.createLinearGradient(l[0], l[1], l[2], l[3]);
        g.addColorStop(0, "rgba(255,255,255,0)");
        g.addColorStop(0.5, "rgba(255,255,255,0.95)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        c.strokeStyle = g;
        c.lineWidth = 1.5;
        c.beginPath();
        c.moveTo(l[0], l[1]);
        c.lineTo(l[2], l[3]);
        c.stroke();
      });
      return s;
    }

    function readColors() {
      var cs = getComputedStyle(sky);
      return {
        line: cs.getPropertyValue("--sky-line").trim() || "#fff",
        glow: cs.getPropertyValue("--sky-glow").trim() || "rgba(125,135,255,0.95)",
        alpha: parseFloat(cs.getPropertyValue("--sky-line-alpha")) || 0.85
      };
    }

    function makeStars() {
      var count = Math.max(40, Math.min(160, Math.round((w * h) / 9000)));
      stars = [];
      for (var i = 0; i < count; i++) {
        var big = Math.random() < 0.12;
        stars.push({
          x: Math.random(),
          y: Math.random() * 0.92,
          r: big ? 1.6 + Math.random() * 1.4 : 0.5 + Math.random() * 0.9,
          big: big,
          glow: sprites.glow[i % 3],
          speed: 0.6 + Math.random() * 1.6,
          phase: Math.random() * Math.PI * 2,
          amp: 2 + Math.random() * 4
        });
      }
    }

    function pos(s, t) {
      return {
        x: s.x * w + Math.sin(t * 0.00025 + s.phase) * s.amp,
        y: s.y * h + Math.cos(t * 0.0002 + s.phase) * s.amp
      };
    }

    // Stars behind the headline and intro text are left out of constellations.
    function textArea() {
      var copy = document.querySelector(".hero-copy");
      if (!copy) return null;
      var sr = sky.getBoundingClientRect(), cr = copy.getBoundingClientRect(), pad = 24;
      return {
        x1: (cr.left - sr.left - pad) / w, x2: (cr.right - sr.left + pad) / w,
        y1: (cr.top - sr.top - pad) / h, y2: (cr.bottom - sr.top + pad) / h
      };
    }

    // Join 3–5 nearby stars, sometimes closing the shape, away from the previous one.
    function spawn(t) {
      var avoid = textArea();
      var pool = stars.filter(function (s) {
        var inText = avoid && s.x > avoid.x1 && s.x < avoid.x2 && s.y > avoid.y1 && s.y < avoid.y2;
        return s.r > 1 && s.y < 0.85 && !inText;
      });
      var prev = constellations[constellations.length - 1];
      var maxDist = Math.min(w, h) * 0.4;
      for (var tries = 0; tries < 12 && pool.length > 2; tries++) {
        var anchor = pool[Math.floor(Math.random() * pool.length)];
        if (prev && Math.abs(anchor.x - prev.anchor.x) < 0.25) continue;
        var chain = [anchor];
        var size = 3 + Math.floor(Math.random() * 3);
        while (chain.length < size) {
          var cur = chain[chain.length - 1], best = null, bestDist = Infinity;
          pool.forEach(function (s) {
            if (chain.indexOf(s) !== -1) return;
            var d = Math.hypot((s.x - cur.x) * w, (s.y - cur.y) * h);
            if (d > 48 && d < maxDist && d < bestDist) { best = s; bestDist = d; }
          });
          if (!best) break;
          chain.push(best);
        }
        if (chain.length < 3) continue;
        var edges = [];
        for (var i = 1; i < chain.length; i++) edges.push([chain[i - 1], chain[i]]);
        if (Math.random() < 0.45) edges.push([chain[chain.length - 1], chain[0]]);
        constellations.push({ start: t, anchor: anchor, stars: chain, edges: edges });
        return;
      }
    }

    function render(t) {
      ctx.clearRect(0, 0, w, h);
      constellations = constellations.filter(function (c) { return t - c.start < CYCLE + FADE; });

      var lit = new Map();
      ctx.lineCap = "round";
      constellations.forEach(function (c) {
        var age = t - c.start;
        var alpha = age < CYCLE ? 1 : 1 - (age - CYCLE) / FADE;
        var per = DRAW / c.edges.length;
        ctx.save();
        ctx.globalAlpha = alpha * colors.alpha;
        ctx.strokeStyle = colors.line;
        ctx.lineWidth = 1.1;
        ctx.shadowColor = colors.glow;
        ctx.shadowBlur = 10;
        c.edges.forEach(function (e, i) {
          var p = Math.min(1, Math.max(0, (age - i * per) / per));
          if (p <= 0) return;
          var a = pos(e[0], t), b = pos(e[1], t);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(a.x + (b.x - a.x) * p, a.y + (b.y - a.y) * p);
          ctx.stroke();
        });
        ctx.restore();
        var glow = alpha * Math.min(1, age / DRAW);
        c.stars.forEach(function (s) { lit.set(s, Math.max(lit.get(s) || 0, glow)); });
      });

      stars.forEach(function (s) {
        var p = pos(s, t);
        var twinkle = 0.55 + 0.45 * Math.sin(t * 0.001 * s.speed + s.phase);
        var boost = lit.get(s) || 0;
        var size = s.r * 8 * (1 + boost * 1.2);
        ctx.globalAlpha = Math.min(1, twinkle * (s.big ? 1 : 0.75) + boost * 0.5);
        ctx.drawImage(s.glow, p.x - size / 2, p.y - size / 2, size, size);
        if (s.big || boost > 0) {
          var spark = s.r * 9 * (1 + boost * 1.5) * (0.7 + 0.3 * twinkle);
          ctx.globalAlpha = Math.min(1, (s.big ? 0.55 * twinkle : 0) + boost * 0.8);
          ctx.drawImage(sprites.spark, p.x - spark, p.y - spark, spark * 2, spark * 2);
        }
      });
      ctx.globalAlpha = 1;
    }

    function loop(t) {
      if (t - lastSpawn >= CYCLE) {
        colors = readColors();
        spawn(t);
        lastSpawn = t;
      }
      render(t);
      frame = requestAnimationFrame(loop);
    }

    function start() {
      if (running || reduceMotion || !inView || document.hidden) return;
      running = true;
      frame = requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(frame);
    }

    // Reduced motion: one still constellation, fully drawn.
    function drawStill() {
      colors = readColors();
      if (!constellations.length) spawn(0);
      render(DRAW);
    }

    function resize() {
      var rect = sky.getBoundingClientRect();
      var nw = Math.round(rect.width), nh = Math.round(rect.height);
      if (!nw || !nh || (nw === w && nh === h)) return;
      var regenerate = !stars.length || Math.abs(nw - w) > 80;
      w = nw;
      h = nh;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (regenerate) {
        makeStars();
        constellations = [];
        lastSpawn = -Infinity;
      }
      if (reduceMotion) drawStill();
    }

    resize();
    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(sky);
    else window.addEventListener("resize", resize);

    if (reduceMotion) return;

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (inView) start(); else stop();
      }).observe(sky);
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });
    start();
  }

  /* Dialogs ------------------------------------------------------------------- */
  function initDialogs() {
    document.querySelectorAll("[data-dialog-open]").forEach(function (btn) {
      var dialog = document.getElementById(btn.getAttribute("data-dialog-open"));
      if (!dialog || typeof dialog.showModal !== "function") return;
      btn.addEventListener("click", function () { dialog.showModal(); });
    });
    document.querySelectorAll("dialog").forEach(function (dialog) {
      dialog.addEventListener("click", function (e) {
        if (e.target === dialog) dialog.close();
      });
      dialog.querySelectorAll("[data-dialog-close]").forEach(function (b) {
        b.addEventListener("click", function () { dialog.close(); });
      });
    });
    if (location.hash) {
      var target = document.querySelector('[data-dialog-open][data-hash="' + location.hash.slice(1) + '"]');
      if (target) target.click();
    }
  }

  /* Contact form ------------------------------------------------------------- */
  function initContactForm() {
    var form = document.querySelector("[data-contact-form]");
    if (!form) return;
    var status = form.querySelector("[data-form-status]");
    var submit = form.querySelector('[type="submit"]');
    var submitLabel = submit.querySelector("[data-label]");
    var rules = {
      name: function (v) { return v.trim().length >= 2 || "Please enter your name."; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || "Please enter a valid email address."; },
      subject: function (v) { return v.trim().length >= 3 || "Please add a short subject."; },
      message: function (v) { return v.trim().length >= 20 || "Please write a message of at least 20 characters."; }
    };
    var fields = Object.keys(rules).map(function (name) { return form.elements[name]; });

    form.noValidate = true;

    function validate(field) {
      var result = rules[field.name](field.value);
      var error = document.getElementById(field.id + "-error");
      if (result === true) {
        field.removeAttribute("aria-invalid");
        error.textContent = "";
        return true;
      }
      field.setAttribute("aria-invalid", "true");
      error.textContent = result;
      return false;
    }

    function setStatus(type, message) {
      status.className = "form-status" + (type ? " is-" + type : "");
      status.textContent = message;
    }

    function setLoading(loading) {
      submit.disabled = loading;
      submit.classList.toggle("is-loading", loading);
      submit.setAttribute("aria-busy", String(loading));
      submitLabel.textContent = loading ? "Sending…" : "Send message";
    }

    fields.forEach(function (field) {
      field.addEventListener("blur", function () { if (field.value) validate(field); });
      field.addEventListener("input", function () {
        if (field.getAttribute("aria-invalid") === "true") validate(field);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      setStatus("", "");

      var invalid = fields.filter(function (f) { return !validate(f); });
      if (invalid.length) {
        invalid[0].focus();
        setStatus("error", "Please check the highlighted fields and try again.");
        return;
      }

      // Bots fill the hidden field; quietly pretend success.
      if (form.elements._gotcha && form.elements._gotcha.value) {
        form.reset();
        setStatus("success", "Thanks — your message has been sent.");
        return;
      }

      if (!config.formEndpoint) {
        setStatus("error", "The contact form isn't connected yet. Please reach out through GitHub for now.");
        return;
      }

      setLoading(true);
      fetch(config.formEndpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form)
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Request failed: " + res.status);
          form.reset();
          setStatus("success", "Thanks — your message has been sent. I'll get back to you soon.");
        })
        .catch(function () {
          setStatus("error", "Something went wrong while sending your message. Please try again in a moment.");
        })
        .then(function () { setLoading(false); });
    });
  }

  applyConfig();
  initTheme();
  initHeader();
  initScrollSpy(".nav-link");
  initScrollSpy(".toc a");
  initReveal();
  initBackToTop();
  initTabs();
  initFilter();
  initTerminal();
  initSky();
  initDialogs();
  initContactForm();
})();
