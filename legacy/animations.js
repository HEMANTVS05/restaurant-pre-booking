// ================================================================
// animations.js — Premium Motion & Visual Effects
// Foodie Palace · Scroll-Based Transitions
// ================================================================
(function () {
  'use strict';

  // ── 1. SCROLL PROGRESS BAR ─────────────────────────────────────
  function initScrollProgress() {
    const bar = document.getElementById('scroll-bar');
    if (!bar) return;
    window.addEventListener('scroll', () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = Math.min((window.scrollY / max) * 100, 100) + '%';
    }, { passive: true });
  }

  // ── 2. NAVBAR SCROLL TRANSFORMATION ───────────────────────────
  function initNavbarScroll() {
    const navbar = document.getElementById('main-navbar');
    if (!navbar) return;
    let lastY = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      navbar.classList.toggle('navbar-scrolled', y > 60);
      navbar.classList.toggle('navbar-hidden',   y > 200 && y > lastY);
      lastY = y;
    }, { passive: true });
  }

  // ── 3. CANVAS PARTICLE SYSTEM (Rising Embers) ─────────────────
  function initParticles() {
    const canvas = document.getElementById('hero-particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [], raf;

    const PALETTES = [
      [247, 151, 30],   // amber
      [255, 210, 0],    // gold
      [255, 255, 255],  // white
      [253, 186, 116],  // apricot
    ];

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    function mkParticle(randomY) {
      const c = PALETTES[Math.floor(Math.random() * PALETTES.length)];
      return {
        x:     Math.random() * canvas.width,
        y:     randomY ? Math.random() * canvas.height : canvas.height + 4,
        r:     Math.random() * 2.2 + 0.3,
        vy:    Math.random() * 0.5 + 0.12,
        vx:    (Math.random() - 0.5) * 0.22,
        alpha: Math.random() * 0.45 + 0.06,
        fade:  Math.random() * 0.0007 + 0.0003,
        c,
      };
    }

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.y -= p.vy; p.x += p.vx; p.alpha -= p.fade;
        if (p.y < -6 || p.alpha <= 0) { particles[i] = mkParticle(false); return; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.c[0]},${p.c[1]},${p.c[2]},${p.alpha})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(tick);
    }

    resize();
    particles = Array.from({ length: Math.floor(canvas.width / 9) }, () => mkParticle(true));
    tick();
    window.addEventListener('resize', () => { resize(); particles = Array.from({ length: Math.floor(canvas.width / 9) }, () => mkParticle(true)); }, { passive: true });
    document.addEventListener('visibilitychange', () => { document.hidden ? cancelAnimationFrame(raf) : tick(); });
  }

  // ── 4. HERO STAGGER REVEAL ────────────────────────────────────
  function initHeroReveal() {
    const add = (sel, delay) => setTimeout(() => document.querySelector(sel)?.classList.add('visible'), delay);
    const addAll = (sel, base, step) =>
      document.querySelectorAll(sel).forEach((el, i) => setTimeout(() => el.classList.add('visible'), base + i * step));

    add('.reveal-badge', 250);
    addAll('.word-reveal', 450, 230);
    addAll('.reveal-fade', 750, 170);
    setTimeout(() => document.querySelector('.scroll-hint')?.classList.add('visible'), 1900);
  }

  // ── 5. SCROLL REVEAL (Intersection Observer) ─────────────────
  function initScrollReveal() {
    const targets = document.querySelectorAll(
      '.section-header, .region-search-wrapper, .reservation-box, ' +
      '.menu-card, .booking-restaurant-info, .map-panel'
    );

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

    targets.forEach(el => { el.classList.add('scroll-reveal'); observer.observe(el); });

    // Stagger restaurant cards whenever they appear in the DOM
    const cardObserver = new IntersectionObserver((entries) => {
      let visible = 0;
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.transitionDelay = (visible * 55) + 'ms';
          entry.target.classList.add('in-view');
          visible++;
          cardObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    // Observe cards immediately + re-observe whenever grid changes
    function observeCards() {
      document.querySelectorAll('.restaurant-card:not(.in-view)').forEach(card => {
        card.classList.add('scroll-reveal');
        cardObserver.observe(card);
      });
    }

    observeCards();
    const grid = document.getElementById('restaurant-grid');
    if (grid) new MutationObserver(observeCards).observe(grid, { childList: true });
  }

  // ── 6. ANIMATED STAT COUNTERS ─────────────────────────────────
  function initCounters() {
    const els = document.querySelectorAll('.count-up');
    if (!els.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el   = entry.target;
        const end  = parseInt(el.dataset.count, 10);
        const plus = el.dataset.plus === 'true';
        const dur  = 1800, step = 16;
        let cur = 0;
        const inc = end / (dur / step);
        el.textContent = '0' + (plus ? '+' : '');
        const t = setInterval(() => {
          cur += inc;
          if (cur >= end) { el.textContent = end + (plus ? '+' : ''); clearInterval(t); }
          else             { el.textContent = Math.floor(cur) + (plus ? '+' : ''); }
        }, step);
        observer.unobserve(el);
      });
    }, { threshold: 0.6 });
    els.forEach(c => observer.observe(c));
  }

  // ── 7. HERO BACKGROUND PARALLAX ───────────────────────────────
  function initParallax() {
    const hero = document.querySelector('.homesec');
    if (!hero) return;
    window.addEventListener('scroll', () => {
      if (window.scrollY < window.innerHeight * 1.3)
        hero.style.backgroundPositionY = `calc(center + ${window.scrollY * 0.28}px)`;
    }, { passive: true });
  }

  // ── 8. FLOATING ICONS PARALLAX ────────────────────────────────
  function initFloatingParallax() {
    const icons = document.querySelectorAll('.floating-icon');
    if (!icons.length) return;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      icons.forEach((ic, i) => { ic.style.transform = `translateY(${y * (0.04 + i * 0.015)}px)`; });
    }, { passive: true });
  }

  // ── 9. AMBIENT CURSOR GLOW ────────────────────────────────────
  function initCursorGlow() {
    if (window.matchMedia('(pointer: coarse)').matches) return; // skip on touch
    const g = document.createElement('div');
    g.id = 'cursor-glow';
    Object.assign(g.style, {
      position: 'fixed', width: '320px', height: '320px',
      borderRadius: '50%', pointerEvents: 'none', zIndex: '0',
      transform: 'translate(-50%,-50%)',
      background: 'radial-gradient(circle, rgba(247,151,30,0.065) 0%, transparent 70%)',
      transition: 'left .12s ease, top .12s ease',
      willChange: 'left,top', mixBlendMode: 'screen', left: '-400px', top: '-400px',
    });
    document.body.appendChild(g);
    window.addEventListener('mousemove', e => { g.style.left = e.clientX + 'px'; g.style.top = e.clientY + 'px'; }, { passive: true });
  }

  // ── 10. SCROLL HINT FADE OUT ──────────────────────────────────
  function initScrollHint() {
    window.addEventListener('scroll', () => {
      const h = document.querySelector('.scroll-hint');
      if (h && window.scrollY > 100) { h.style.opacity = '0'; h.style.transform = 'translateY(10px)'; }
    }, { passive: true });
  }

  // ── 11. SECTION GRADIENT TINT ON SCROLL ───────────────────────
  function initSectionTint() {
    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('section-active');
        else e.target.classList.remove('section-active');
      });
    }, { threshold: 0.3 });
    sections.forEach(s => observer.observe(s));
  }

  // ── INIT ──────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initScrollProgress();
    initNavbarScroll();
    initParticles();
    initHeroReveal();
    initScrollReveal();
    initCounters();
    initParallax();
    initFloatingParallax();
    initCursorGlow();
    initScrollHint();
    initSectionTint();
    console.log('✅ animations.js loaded');
  });
})();
