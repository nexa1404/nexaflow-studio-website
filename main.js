/* ============================================================
   NexaFlow Studio — main.js  (IIFE — no ES modules)
   ============================================================ */
(function () {
  'use strict';

  /* ---- Utility: wrap init in try/catch ---- */
  function safe(fn, name) {
    try { fn(); }
    catch (e) { console.warn('[NexaFlow:' + name + ']', e); }
  }

  /* ===== NAV ===== */
  function initNav() {
    var nav = document.getElementById('nav');
    var hamburger = document.getElementById('hamburger');
    var overlay = document.getElementById('nav-overlay');
    var overlayClose = document.getElementById('overlay-close');
    if (!nav) return;

    /* Solidify on scroll */
    function onScroll() {
      nav.classList.toggle('is-solid', window.scrollY > 60);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* Hamburger */
    if (hamburger && overlay) {
      hamburger.addEventListener('click', function () {
        overlay.classList.add('is-open');
        overlay.setAttribute('aria-hidden', 'false');
        hamburger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
      });

      function closeOverlay() {
        overlay.classList.remove('is-open');
        overlay.setAttribute('aria-hidden', 'true');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }

      if (overlayClose) overlayClose.addEventListener('click', closeOverlay);

      overlay.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', closeOverlay);
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeOverlay();
      });
    }
  }

  /* ===== SMOOTH SCROLL (anchor clicks) ===== */
  function setupSmoothScroll() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href');
      if (!id || id === '#') return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var navOffset = 80;
      var top = el.getBoundingClientRect().top + window.scrollY - navOffset;
      var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: top, behavior: reduced ? 'auto' : 'smooth' });
    });
  }

  /* ===== MOUSE-REACTIVE GRADIENT (hero) ===== */
  function initMouseGradient() {
    var hero = document.querySelector('.hero');
    var gradient = hero && hero.querySelector('.hero-gradient');
    if (!gradient) return;

    var target = { x: 20, y: 35 };
    var current = { x: 20, y: 35 };
    var rafId = null;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function tick() {
      current.x = lerp(current.x, target.x, 0.06);
      current.y = lerp(current.y, target.y, 0.06);
      gradient.style.setProperty('--mx', current.x.toFixed(1) + '%');
      gradient.style.setProperty('--my', current.y.toFixed(1) + '%');
      rafId = requestAnimationFrame(tick);
    }
    tick();

    document.addEventListener('mousemove', function (e) {
      target.x = (e.clientX / window.innerWidth) * 100;
      target.y = (e.clientY / window.innerHeight) * 100;
    });
  }

  /* ===== INTERSECTION OBSERVER REVEALS ===== */
  function initReveal() {
    if (!window.IntersectionObserver) {
      /* Fallback: show everything */
      document.querySelectorAll('[data-reveal]').forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -4% 0px' });

    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      io.observe(el);
    });

    /* 6-second safety net — also clears GSAP inline styles */
    setTimeout(function () {
      document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach(function (el) {
        el.classList.add('is-visible');
        el.style.removeProperty('opacity');
        el.style.removeProperty('transform');
        el.style.removeProperty('visibility');
      });
    }, 6000);
  }

  /* ===== COUNTER ANIMATION ===== */
  function initCounters() {
    var targets = document.querySelectorAll('[data-target]');
    if (!targets.length) return;
    if (!window.IntersectionObserver) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var target = parseInt(el.dataset.target, 10);
        if (isNaN(target)) return;
        io.unobserve(el);

        var startTime = null;
        var duration = 1400;

        function step(ts) {
          if (!startTime) startTime = ts;
          var progress = Math.min((ts - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3); /* ease-out cubic */
          el.textContent = Math.round(eased * target);
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });

    targets.forEach(function (el) { io.observe(el); });
  }

  /* ===== CARD TILT (hover: hover only) ===== */
  function initTilt() {
    if (matchMedia('(hover: none)').matches) return;

    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = [
          'perspective(900px)',
          'rotateX(' + (-y * 7) + 'deg)',
          'rotateY(' + (x * 7) + 'deg)',
          'translateZ(6px)'
        ].join(' ');
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        card.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
        setTimeout(function () { card.style.transition = ''; }, 500);
      });
    });
  }

  /* ===== GSAP SCROLL ANIMATIONS ===== */
  function initAnimations() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    /* Hero entrance */
    var heroTL = gsap.timeline({ defaults: { ease: 'power2.out' } });
    heroTL
      .from('.hero-kicker',  { opacity: 0, y: 16, duration: 0.7 }, 0.25)
      .from('.hero-title',   { opacity: 0, y: 48, duration: 0.9 }, 0.45)
      .from('.hero-sub',     { opacity: 0, y: 24, duration: 0.7 }, 0.75)
      .from('.hero-actions', { opacity: 0, y: 20, duration: 0.7 }, 0.95)
      .from('.hero-trust',   { opacity: 0, y: 16, duration: 0.6 }, 1.1)
      .from('.hero-visual',  { opacity: 0, x: 50, duration: 1.0 }, 0.55)
      .from('.hero-scroll-hint', { opacity: 0, duration: 0.6 }, 1.5);

    /* Section headers */
    gsap.utils.toArray('.section-header').forEach(function (el) {
      gsap.from(el.children, {
        opacity: 0, y: 36, stagger: 0.12, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 82%' }
      });
    });

    /* Stagger grids */
    gsap.utils.toArray('.stagger-grid').forEach(function (grid) {
      var items = Array.from(grid.children);
      items.forEach(function (item) { item.style.opacity = '0'; item.style.transform = 'translateY(40px)'; });
      gsap.to(items, {
        opacity: 1, y: 0, stagger: 0.1, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: grid, start: 'top 78%' }
      });
    });

    /* Service rows */
    gsap.utils.toArray('.service-row').forEach(function (row) {
      gsap.from(row, {
        opacity: 0, x: -24, duration: 0.6, ease: 'power2.out', clearProps: 'all',
        scrollTrigger: { trigger: row, start: 'top 88%' }
      });
    });

    /* Process timeline nodes */
    gsap.from('.ptl-node', {
      scale: 0, opacity: 0, stagger: 0.1, duration: 0.5, ease: 'back.out(1.7)',
      scrollTrigger: { trigger: '.process-timeline', start: 'top 75%' }
    });

    /* Comparison table rows */
    gsap.utils.toArray('.ct-row').forEach(function (row, i) {
      gsap.from(row, {
        opacity: 0, x: -16, duration: 0.5, delay: i * 0.07, ease: 'power2.out',
        scrollTrigger: { trigger: '.comparison-table', start: 'top 75%' }
      });
    });

    /* CTA section */
    gsap.from('.cta-inner > *', {
      opacity: 0, y: 40, stagger: 0.12, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: '.cta-section', start: 'top 75%' }
    });
  }

  /* ===== STAGGER GRID REVEAL FALLBACK ===== */
  function initStaggerReveal() {
    /* Works independently of GSAP — IO-based stagger */
    if (!window.IntersectionObserver) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var grid = e.target;
        io.unobserve(grid);
        /* Only apply if GSAP didn't already handle it */
        if (window.gsap && window.ScrollTrigger) return;
        Array.from(grid.children).forEach(function (child, i) {
          child.style.transitionDelay = (i * 0.08) + 's';
          child.classList.add('is-visible');
        });
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.stagger-grid').forEach(function (grid) {
      /* Prepare children */
      Array.from(grid.children).forEach(function (child) {
        child.setAttribute('data-reveal', '');
      });
      io.observe(grid);
    });
  }

  /* ===== 3D BROWSER SHOWCASE ===== */
  function init3DBrowser() {
    var stage = document.querySelector('.sc3d-stage');
    var browser = document.getElementById('sc3d-browser');
    if (!stage || !browser) return;

    var BASE = 'perspective(1200px) rotateX(3deg) rotateY(-14deg) rotateZ(0.5deg)';

    /* Mouse tilt — desktop only */
    if (!matchMedia('(hover: none)').matches) {
      stage.addEventListener('mousemove', function (e) {
        var rect = stage.getBoundingClientRect();
        var nx = (e.clientX - rect.left) / rect.width - 0.5;
        var ny = (e.clientY - rect.top) / rect.height - 0.5;
        var ry = -14 + nx * 18;
        var rx = 3 - ny * 10;
        browser.style.transform =
          'perspective(1200px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) rotateZ(0.5deg)';
      });

      stage.addEventListener('mouseleave', function () {
        browser.style.transform = BASE;
      });
    }

    /* GSAP entrance */
    if (window.gsap && window.ScrollTrigger) {
      gsap.from(stage, {
        opacity: 0,
        y: 60,
        duration: 1.0,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.showcase3d', start: 'top 72%' }
      });
    }
  }

  /* ===== BACKGROUND CANVAS (neural network) ===== */
  function initBgCanvas() {
    var canvas = document.getElementById('bg-canvas');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');

    var W, H, cols, drops, speeds;
    var FS = 13;        /* font size / row height */
    var COL_W = 62;     /* column width in px */

    /* Code tokens that rain down */
    var TOKENS = [
      'div','span','const','let','var','if','for','return','async','await',
      'true','null','{}','[]','</>','px;','rem','vh','flex','grid',
      '#id','.cls','rgb(','url(','0.5','100%','=>','===','&&','||',
      '//','AI','API','CSS','DOM','fn()','map','filter','fetch'
    ];

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      cols   = Math.max(1, Math.floor(W / COL_W));
      drops  = Array.from({ length: cols }, function () {
        return -(Math.random() * (H / FS));   /* start above viewport */
      });
      speeds = Array.from({ length: cols }, function () {
        return 0.22 + Math.random() * 0.32;
      });
    }

    function draw() {
      /* Fade trail — stone-grey tint at low alpha = motion blur effect */
      ctx.fillStyle = 'rgba(28,27,26,0.08)';
      ctx.fillRect(0, 0, W, H);

      ctx.font = 'bold ' + FS + 'px monospace';

      for (var i = 0; i < cols; i++) {
        var tok = TOKENS[Math.floor(Math.random() * TOKENS.length)];
        var x   = i * COL_W + 4;
        var y   = Math.floor(drops[i]) * FS;

        /* Alternate lime / cyan per column+row parity */
        var useLime = ((i + Math.floor(drops[i])) % 3) !== 0;
        ctx.fillStyle = useLime
          ? 'rgba(163,230,53,0.82)'
          : 'rgba(34,211,238,0.70)';
        ctx.fillText(tok, x, y);

        /* Reset column when it passes the bottom */
        if (y > H && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += speeds[i];
      }

      requestAnimationFrame(draw);
    }

    resize();
    draw();

    window.addEventListener('resize', resize, { passive: true });
  }

  /* ===== CONTACT FORM ===== */
  function initContactForm() {
    var form = document.getElementById('contact-form');
    var submitBtn = document.getElementById('form-submit');
    var successEl = document.getElementById('form-success');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault(); /* Siempre: nunca redirigir a Formspree */

      if (submitBtn) submitBtn.classList.add('is-loading');

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
      .then(function (res) {
        if (res.ok) {
          /* Éxito: mostrar mensaje inline */
          form.style.opacity = '0.3';
          form.style.pointerEvents = 'none';
          if (successEl) successEl.classList.add('is-visible');
        } else {
          res.json().then(function (data) {
            var msg = (data.errors || []).map(function (e) { return e.message; }).join(', ');
            alert('Error al enviar' + (msg ? ': ' + msg : '') + '. Escríbenos a hola.nexaflow@gmail.com');
          }).catch(function () {
            alert('Error al enviar. Escríbenos a hola.nexaflow@gmail.com');
          });
        }
      })
      .catch(function () {
        alert('Error de conexión. Escríbenos a hola.nexaflow@gmail.com');
      })
      .finally(function () {
        if (submitBtn) submitBtn.classList.remove('is-loading');
      });
    });
  }

  /* ===== TIDIO MÓVIL — reposicionar por encima de la barra flotante ===== */
  function initTidioMobilePosition() {
    if (window.innerWidth > 640) return; // solo móvil
    var OFFSET = '130px';

    function applyOffset() {
      var el = document.getElementById('tidio-chat');
      if (el && el.style.bottom !== OFFSET) { el.style.bottom = OFFSET; el.style.setProperty('bottom', OFFSET, 'important'); }
    }

    // Intentar en el momento del API ready
    document.addEventListener('tidioChat-ready', applyOffset);

    // MutationObserver por si Tidio resetea inline styles
    var observer = new MutationObserver(applyOffset);
    observer.observe(document.body, { childList: true, subtree: false });

    // Fallback poll hasta que aparezca
    var attempts = 0;
    var iv = setInterval(function () {
      var el = document.getElementById('tidio-chat');
      if (el) { applyOffset(); clearInterval(iv); }
      if (++attempts > 30) clearInterval(iv);
    }, 500);
  }

  /* ===== FLOATING BOTTOM NAV — active section tracking ===== */
  function initFloatNav() {
    var floatNav = document.getElementById('float-nav');
    if (!floatNav) return;

    var items = floatNav.querySelectorAll('.fn-item[data-section]');
    if (!items.length) return;

    // Map section id → nav item
    var sectionMap = {};
    items.forEach(function (item) {
      var sid = item.getAttribute('data-section');
      sectionMap[sid] = item;
    });

    // Section order for scroll detection
    var sectionIds = ['inicio', 'problema', 'servicios', 'proceso', 'portfolio', 'diferenciacion', 'planes', 'contacto'];
    // Map each section to which nav item should be active
    var sectionToNav = {
      'inicio':       'inicio',
      'problema':     'problema',
      'chatbot':      'servicios',
      'servicios':    'servicios',
      'showcase':     'servicios',
      'resultados':   'servicios',
      'proceso':      'proceso',
      'portfolio':    'proceso',
      'integraciones':'proceso',
      'diferenciacion':'planes',
      'planes':       'planes',
      'contacto':     'planes',
    };

    function setActive(navId) {
      items.forEach(function (item) {
        item.classList.toggle('is-active', item.getAttribute('data-section') === navId);
      });
    }

    // Use IntersectionObserver for efficiency
    var allSections = document.querySelectorAll('section[id]');
    var currentActive = 'inicio';

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var sid = entry.target.id;
          var navId = sectionToNav[sid] || sid;
          if (sectionMap[navId]) {
            currentActive = navId;
            setActive(navId);
          }
        }
      });
    }, { threshold: 0.25, rootMargin: '-20% 0px -20% 0px' });

    allSections.forEach(function (s) { io.observe(s); });
    setActive('inicio');
  }

  /* ===== BOOT ===== */
  function boot() {
    safe(initNav, 'initNav');
    safe(setupSmoothScroll, 'setupSmoothScroll');
    safe(initMouseGradient, 'initMouseGradient');
    safe(initReveal, 'initReveal');
    safe(initCounters, 'initCounters');
    safe(initTilt, 'initTilt');
    safe(initStaggerReveal, 'initStaggerReveal');
    safe(init3DBrowser, 'init3DBrowser');
    safe(initBgCanvas, 'initBgCanvas');
    safe(initContactForm, 'initContactForm');
    safe(initFloatNav, 'initFloatNav');
    safe(initTidioMobilePosition, 'initTidioMobilePosition');
    /* GSAP: runs after libs load */
    if (window.gsap && window.ScrollTrigger) {
      safe(initAnimations, 'initAnimations');
    } else {
      /* Wait for deferred scripts */
      window.addEventListener('load', function () {
        safe(initAnimations, 'initAnimations');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
