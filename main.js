(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Mobile menu ---------------- */
  const burger = document.querySelector(".burger");
  const menu = document.getElementById("mobile-menu");
  const overlay = document.getElementById("overlay");

  function openMenu() {
    menu.hidden = false;
    overlay.hidden = false;
    burger.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
  }
  function closeMenu() {
    menu.hidden = true;
    overlay.hidden = true;
    burger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  }
  if (burger) {
    burger.addEventListener("click", () => {
      burger.getAttribute("aria-expanded") === "true" ? closeMenu() : openMenu();
    });
    overlay.addEventListener("click", closeMenu);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
    document.querySelectorAll(".m-link, .m-signin").forEach((el) => el.addEventListener("click", closeMenu));
    window.addEventListener("resize", () => { if (window.innerWidth > 720) closeMenu(); });
  }

  /* ---------------- Scroll reveal ---------------- */
  const revealTargets = document.querySelectorAll(".leaderboard, .core-loop, .methodology, .categories, .roadmap, .tech-strip");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealTargets.forEach((t) => io.observe(t));
  } else {
    revealTargets.forEach((t) => t.classList.add("in-view"));
  }

  /* ---------------- Line fills (step flow + roadmap track) ---------------- */
  function wireFill(lineSelector, sectionSelector) {
    const fill = document.querySelector(lineSelector);
    const section = document.querySelector(sectionSelector);
    if (!fill || !section) return;
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              fill.classList.add("is-lit");
              io.disconnect();
            }
          });
        },
        { threshold: 0.4 }
      );
      io.observe(section);
    } else {
      fill.classList.add("is-lit");
    }
  }
  wireFill(".step-line-fill", ".core-loop");
  wireFill(".track-fill", ".roadmap");

  /* ---------------- Signal-green spark canvas ---------------- */
  const canvas = document.querySelector(".forge-canvas");
  if (!canvas || reduceMotion) return;

  const ctx = canvas.getContext("2d");
  let width, height, dpr;
  let particles = [];
  const COUNT = 46;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeParticle(initial) {
    return {
      x: Math.random() * width,
      y: initial ? Math.random() * height : height + Math.random() * 60,
      r: Math.random() * 1.6 + 0.4,
      speed: Math.random() * 0.4 + 0.15,
      drift: (Math.random() - 0.5) * 0.3,
      hue: Math.random() > 0.5 ? "31,223,166" : "184,255,232",
      alpha: Math.random() * 0.5 + 0.15,
      flicker: Math.random() * Math.PI * 2,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: COUNT }, () => makeParticle(true));
  }

  function tick() {
    ctx.clearRect(0, 0, width, height);

    const grad = ctx.createRadialGradient(
      width * 0.5, height * 0.95, 0,
      width * 0.5, height * 0.95, Math.max(width, height) * 0.55
    );
    grad.addColorStop(0, "rgba(31,223,166,0.09)");
    grad.addColorStop(1, "rgba(31,223,166,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    for (const p of particles) {
      p.y -= p.speed;
      p.x += p.drift;
      p.flicker += 0.05;
      const flick = (Math.sin(p.flicker) + 1) / 2;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.hue},${(p.alpha * (0.5 + flick * 0.5)).toFixed(3)})`;
      ctx.fill();

      if (p.y < -10) Object.assign(p, makeParticle(false));
    }

    requestAnimationFrame(tick);
  }

  init();
  window.addEventListener("resize", resize);
  requestAnimationFrame(tick);
})();
