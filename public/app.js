(() => {
  "use strict";
  document.documentElement.classList.remove("no-js");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Nav: scroll state + mobile menu ---------- */
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");

  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  toggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  links.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ---------- Active section highlight ---------- */
  const navAnchors = [...links.querySelectorAll('a[href^="#"]')];
  const sections = navAnchors.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navAnchors.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach((el, i) => {
      el.style.transitionDelay = (el.closest(".hero") ? i * 70 : 0) + "ms";
      io.observe(el);
    });
  }

  /* ---------- Spotlight on website cards ---------- */
  document.querySelectorAll(".site").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });

  /* ---------- Constellation background ---------- */
  const canvas = document.getElementById("stars");
  const ctx = canvas && canvas.getContext("2d");
  if (ctx) {
    let w = 0, h = 0, dpr = 1, stars = [], raf = 0;
    const COLORS = ["196,177,255", "225,124,255", "160,150,255", "255,255,255"];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(90, (w * h) / 16000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.3,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        p: Math.random() * Math.PI * 2,
        c: COLORS[(Math.random() * COLORS.length) | 0],
      }));
    };

    const LINK = 120;
    const draw = (t) => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        if (!reduceMotion) {
          s.x += s.vx; s.y += s.vy;
          if (s.x < -10) s.x = w + 10; else if (s.x > w + 10) s.x = -10;
          if (s.y < -10) s.y = h + 10; else if (s.y > h + 10) s.y = -10;
        }
        for (let j = i + 1; j < stars.length; j++) {
          const o = stars[j];
          const dx = s.x - o.x, dy = s.y - o.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            ctx.strokeStyle = `rgba(170,150,255,${0.12 * (1 - Math.sqrt(d2) / LINK)})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(o.x, o.y); ctx.stroke();
          }
        }
        const a = reduceMotion ? 0.7 : 0.45 + 0.4 * Math.sin(t / 900 + s.p);
        ctx.fillStyle = `rgba(${s.c},${a})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      }
      if (!reduceMotion) raf = requestAnimationFrame(draw);
    };

    resize();
    draw(0);
    let rt;
    window.addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(() => { resize(); if (reduceMotion) draw(0); }, 150);
    });
    document.addEventListener("visibilitychange", () => {
      if (reduceMotion) return;
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(draw);
    });
  }

  /* ---------- Contact form ---------- */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  if (form) {
    const btn = form.querySelector('button[type="submit"]');
    const label = btn.querySelector(".btn__label");
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const setStatus = (msg, kind) => {
      status.textContent = msg;
      status.className = "form__status" + (kind ? " is-" + kind : "");
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const checks = {
        name: data.name.trim().length > 0,
        email: emailRe.test(data.email.trim()),
        message: data.message.trim().length > 0,
      };
      let ok = true;
      Object.entries(checks).forEach(([k, valid]) => {
        form.querySelector("#" + k).closest(".field").classList.toggle("is-invalid", !valid);
        if (!valid) ok = false;
      });
      if (!ok) { setStatus("Please fill in your name, a valid email and a message.", "err"); return; }

      btn.disabled = true;
      label.textContent = "Sending…";
      setStatus("");
      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.ok) throw new Error(json.error || "Something went wrong.");
        form.reset();
        setStatus("Thank you — your message was sent.", "ok");
      } catch (err) {
        setStatus(err.message || "Something went wrong. Please email me directly.", "err");
      } finally {
        btn.disabled = false;
        label.textContent = "Send message";
      }
    });

    form.querySelectorAll("input, textarea").forEach((el) =>
      el.addEventListener("input", () => el.closest(".field") && el.closest(".field").classList.remove("is-invalid"))
    );
  }
})();
