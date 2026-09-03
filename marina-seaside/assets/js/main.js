/* ==========================================================================
   Marina Seaside — site behaviour
   Vanilla JS, no dependencies. Progressive enhancement throughout.
   ========================================================================== */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Nav: sticky state ---------- */
  var nav = document.querySelector(".nav");
  var progress = document.querySelector(".progress");
  var waFloat = document.querySelector(".wa-float");

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle("is-stuck", y > 60);
    if (waFloat) waFloat.classList.toggle("show", y > 420);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    }
  }
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(function () { onScroll(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  /* ---------- Mobile drawer ---------- */
  var burger = document.querySelector(".burger");
  var drawer = document.querySelector(".drawer");
  function closeMenu() {
    document.body.classList.remove("menu-open");
    if (burger) burger.setAttribute("aria-expanded", "false");
  }
  if (burger && drawer) {
    burger.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      // stagger the links in
      drawer.querySelectorAll("a").forEach(function (a, i) {
        a.style.transitionDelay = open ? (0.18 + i * 0.06) + "s" : "0s";
      });
    });
    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealables = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        // isIntersecting alone can miss elements taller than the viewport
        if (en.isIntersecting || en.intersectionRatio > 0) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0, rootMargin: "0px 0px -6% 0px" });
    revealables.forEach(function (el) { io.observe(el); });

    // Safety net: anything still hidden once the page is fully loaded and
    // sitting inside/above the viewport gets revealed regardless.
    window.addEventListener("load", function () {
      setTimeout(function () {
        revealables.forEach(function (el) {
          if (el.classList.contains("in")) return;
          var r = el.getBoundingClientRect();
          if (r.top < window.innerHeight * 1.1) el.classList.add("in");
        });
      }, 260);
    });
  } else {
    revealables.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Hero video: lazy, resilient, respects data-saver ---------- */
  var heroVideo = document.querySelector("[data-hero-video]");
  if (heroVideo) {
    var conn = navigator.connection || {};
    var slow = conn.saveData === true ||
               (conn.effectiveType && /(^|\W)(2g|slow-2g)($|\W)/i.test(conn.effectiveType));

    if (reduce || slow) {
      // Keep the static poster — never fetch the video.
      heroVideo.remove();
    } else {
      heroVideo.addEventListener("loadeddata", function () {
        heroVideo.classList.add("is-ready");
      });
      heroVideo.addEventListener("error", function () { heroVideo.remove(); });

      // Attach sources only once we're ready to play (keeps them off the critical path)
      var srcs = heroVideo.querySelectorAll("source[data-src]");
      srcs.forEach(function (s) { s.src = s.dataset.src; });
      heroVideo.load();

      var p = heroVideo.play();
      if (p && p.catch) {
        p.catch(function () { /* autoplay blocked — poster remains */ });
      }

      // Pause when off-screen (battery / CPU)
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (e.isIntersecting) { heroVideo.play().catch(function () {}); }
            else { heroVideo.pause(); }
          });
        }, { threshold: 0.1 }).observe(heroVideo);
      }
    }
  }

  /* ---------- Lazy videos elsewhere (SRS 5.3) ---------- */
  var lazyVids = document.querySelectorAll("video[data-lazy]");
  if (lazyVids.length && "IntersectionObserver" in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) {
          if (!v.dataset.loaded) {
            v.querySelectorAll("source[data-src]").forEach(function (s) { s.src = s.dataset.src; });
            v.load();
            v.dataset.loaded = "1";
          }
          if (!reduce) v.play().catch(function () {});
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.25 });
    lazyVids.forEach(function (v) { vio.observe(v); });
  }

  /* ---------- Hero motion toggle ---------- */
  var ctrl = document.querySelector("[data-motion-toggle]");
  if (ctrl && heroVideo) {
    ctrl.addEventListener("click", function () {
      var paused = heroVideo.paused;
      if (paused) {
        heroVideo.play().then(function () {
          ctrl.querySelector(".t").textContent = "Pause";
          ctrl.setAttribute("aria-pressed", "true");
        }).catch(function () {});
      } else {
        heroVideo.pause();
        ctrl.querySelector(".t").textContent = "Play";
        ctrl.setAttribute("aria-pressed", "false");
      }
    });
  }

  /* ---------- Parallax bands ---------- */
  var bands = document.querySelectorAll("[data-parallax]");
  if (bands.length && !reduce) {
    var raf = false;
    function park() {
      bands.forEach(function (b) {
        var r = b.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        var img = b.querySelector("img");
        if (!img) return;
        var pct = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
        img.style.transform = "translate3d(0," + (pct * -8).toFixed(2) + "%,0)";
      });
      raf = false;
    }
    window.addEventListener("scroll", function () {
      if (!raf) { window.requestAnimationFrame(park); raf = true; }
    }, { passive: true });
    park();
  }

  /* ---------- Gallery filters ---------- */
  var filterBar = document.querySelector("[data-filters]");
  if (filterBar) {
    var items = document.querySelectorAll("[data-cat]");
    filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      var cat = btn.dataset.filter;
      filterBar.querySelectorAll("button").forEach(function (b) {
        b.classList.toggle("is-on", b === btn);
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      items.forEach(function (it) {
        var show = cat === "all" || it.dataset.cat === cat;
        it.classList.toggle("is-hidden", !show);
      });
    });
  }

  /* ---------- Opening hours: highlight today + open/closed ---------- */
  var hoursList = document.querySelector("[data-hours]");
  if (hoursList) {
    var today = new Date().getDay(); // 0 = Sun
    var rows = hoursList.querySelectorAll("li[data-day]");
    function appliesToday(li) {
      return li.dataset.day.split(",").some(function (day) {
        return parseInt(day.trim(), 10) === today;
      });
    }
    rows.forEach(function (li) {
      if (appliesToday(li)) li.classList.add("is-today");
    });
    var pill = document.querySelector("[data-open-state]");
    if (pill) {
      var row = Array.prototype.find.call(rows, appliesToday);
      var open = false;
      if (row && row.dataset.from) {
        var now = new Date();
        var mins = now.getHours() * 60 + now.getMinutes();
        var f = row.dataset.from.split(":");
        var t = row.dataset.to.split(":");
        var from = +f[0] * 60 + +f[1];
        var to = +t[0] * 60 + +t[1];
        open = mins >= from && mins <= to;
      }
      pill.querySelector(".t").textContent = open ? "Open now" : "Closed now";
      if (!open) {
        pill.style.background = "rgba(255,255,255,.08)";
        pill.style.color = "rgba(255,255,255,.7)";
        pill.style.borderColor = "rgba(255,255,255,.2)";
        var dot = pill.querySelector("i");
        if (dot) { dot.style.background = "rgba(255,255,255,.5)"; dot.style.animation = "none"; }
      }
    }
  }

  /* ---------- Testimonials ---------- */
  var quotesBox = document.querySelector("[data-quotes]");
  if (quotesBox) {
    var qs = quotesBox.querySelectorAll(".quote");
    var dots = quotesBox.parentElement.querySelectorAll(".q-dots button");
    var idx = 0, timer;
    function go(n) {
      qs[idx].classList.remove("is-on");
      if (dots[idx]) dots[idx].classList.remove("is-on");
      idx = (n + qs.length) % qs.length;
      qs[idx].classList.add("is-on");
      if (dots[idx]) dots[idx].classList.add("is-on");
    }
    function auto() {
      clearInterval(timer);
      if (!reduce) timer = setInterval(function () { go(idx + 1); }, 6500);
    }
    dots.forEach(function (d, i) {
      d.addEventListener("click", function () { go(i); auto(); });
    });
    auto();
  }

  /* ---------- Reservation form -> WhatsApp ---------- */
  var resForm = document.querySelector("[data-reservation]");
  if (resForm) {
    resForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!resForm.checkValidity()) {
        resForm.reportValidity();
        return;
      }
      var d = new FormData(resForm);
      var phone = resForm.dataset.phone || "254722406291";
      var msg =
        "Hello Marina Seaside! I'd like to make a reservation.\n\n" +
        "Name: " + (d.get("name") || "-") + "\n" +
        "Date: " + (d.get("date") || "-") + "\n" +
        "Time: " + (d.get("time") || "-") + "\n" +
        "Guests: " + (d.get("guests") || "-") + "\n" +
        "Notes: " + (d.get("notes") || "-");
      window.open("https://wa.me/" + phone + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Mark active nav item ---------- */
  var path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a, .drawer a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === path) a.classList.add("is-active");
  });
})();
