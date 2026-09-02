(function () {
  "use strict";

  var root = document.getElementById("nova-root");
  var nav = document.getElementById("nova-nav");
  var linksEl = document.getElementById("nova-nav-links");
  var burger = document.getElementById("nova-burger");
  var menu = document.getElementById("nova-mobile-menu");
  var heroArt = document.getElementById("nova-hero-art");
  var statement = document.getElementById("nova-statement");
  var menuOpen = false;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setMenu(open) {
    menuOpen = open;
    if (menu) {
      menu.style.opacity = open ? "1" : "0";
      menu.style.visibility = open ? "visible" : "hidden";
      menu.style.transform = open ? "translateY(0)" : "translateY(-12px)";
      menu.setAttribute("aria-hidden", open ? "false" : "true");
    }
    if (burger) {
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      var lines = burger.querySelectorAll("[data-burger-line]");
      if (lines[0]) lines[0].style.transform = open ? "translateY(3.25px) rotate(45deg)" : "none";
      if (lines[1]) lines[1].style.transform = open ? "translateY(-3.25px) rotate(-45deg)" : "none";
    }
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (burger) {
    burger.addEventListener("click", function () {
      setMenu(!menuOpen);
    });
  }

  document.querySelectorAll("[data-close-menu]").forEach(function (el) {
    el.addEventListener("click", function () {
      setMenu(false);
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menuOpen) setMenu(false);
  });

  function setupReveal() {
    if (!root) return;
    var items = root.querySelectorAll("[data-reveal]");
    var show = function (el) {
      var d = parseInt(el.getAttribute("data-delay") || "0", 10);
      window.setTimeout(function () {
        el.style.opacity = "1";
        el.style.transform = "none";
      }, reduced ? 0 : d);
    };
    if (reduced || !("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.style.transition = "none";
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      return;
    }
    var revealObs = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            show(e.target);
            obs.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );
    items.forEach(function (el) {
      revealObs.observe(el);
    });
  }

  function setupNav() {
    if (!root) return;
    var links = Array.prototype.slice.call(root.querySelectorAll("[data-navlink]"));
    var setActive = function (id) {
      links.forEach(function (a) {
        var on = a.getAttribute("data-navlink") === id;
        a.style.color = on ? "var(--ink)" : "var(--ink-2)";
        var bar = a.querySelector("[data-bar]");
        if (bar) bar.style.transform = on ? "scaleX(1)" : "scaleX(0)";
        if (on) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    };
    var sections = ["work", "services", "approach", "about"]
      .map(function (id) {
        return document.getElementById(id);
      })
      .filter(Boolean);
    if (!sections.length || !("IntersectionObserver" in window)) return;
    var navObs = new IntersectionObserver(
      function (entries) {
        var vis = entries
          .filter(function (e) {
            return e.isIntersecting;
          })
          .sort(function (a, b) {
            return b.intersectionRatio - a.intersectionRatio;
          });
        if (vis.length) setActive(vis[0].target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.2, 0.5] }
    );
    sections.forEach(function (s) {
      navObs.observe(s);
    });
  }

  var mq = window.matchMedia("(max-width: 900px)");
  function onMq() {
    var narrow = mq.matches;
    if (linksEl) linksEl.style.display = narrow ? "none" : "flex";
    if (burger) burger.style.display = narrow ? "flex" : "none";
    if (!narrow && menuOpen) setMenu(false);
  }
  onMq();
  if (mq.addEventListener) mq.addEventListener("change", onMq);
  else if (mq.addListener) mq.addListener(onMq);

  var ticking = false;
  function update() {
    ticking = false;
    var y = window.scrollY || 0;
    if (nav) nav.style.borderBottomColor = y > 24 ? "var(--line)" : "transparent";
    if (reduced) return;
    if (heroArt) heroArt.style.transform = "translate3d(0," + (y * -0.06).toFixed(2) + "px,0)";
    if (statement) {
      var r = statement.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) {
        var p = (window.innerHeight - r.top) / (window.innerHeight + r.height) - 0.5;
        statement.style.transform = "translate3d(0," + (p * -34).toFixed(2) + "px,0)";
      }
    }
  }
  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    },
    { passive: true }
  );

  setupReveal();
  setupNav();
  update();
})();
