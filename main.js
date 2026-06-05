/* ============================================================
   NexaFlow Studio — main.js v20260606  (IIFE, no ES modules)
   ============================================================ */
(function () {
  'use strict';

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn('[NexaFlow:' + name + ']', e); }
  }

  /* ===== NAV ===== */
  function initNav() {
    var nav = document.getElementById('nav');
    var hamburger = document.getElementById('hamburger');
    var overlay = document.getElementById('nav-overlay');
    var overlayClose = document.getElementById('overlay-close');
    if (!nav) return;

    function onScroll() {
      nav.classList.toggle('solid', window.scrollY > 60);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

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

  /* ===== SMOOTH SCROLL ===== */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href').slice(1);
        if (!id) return;
        var target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        var offset = document.getElementById('nav') ? 80 : 0;
        window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
      });
    });
  }

  /* ===== HERO VIDEO LAZY LOAD ===== */
  function initHeroVideo() {
    var vid = document.getElementById('heroVid');
    if (!vid) return;
    var src = vid.getAttribute('data-src');
    if (!src) return;
    vid.src = src;
    vid.load();
    vid.addEventListener('canplay', function () {
      vid.style.opacity = '.38';
    });
  }

  /* ===== HERO ENTRANCE ANIMATION ===== */
  function initHeroEntrance() {
    var hero = document.getElementById('hero');
    if (!hero) return;
    // Small timeout to ensure fonts loaded
    setTimeout(function () {
      hero.classList.add('in');
    }, 80);
  }

  /* ===== REVEAL ON SCROLL ===== */
  function initReveal() {
    var els = document.querySelectorAll('.rv');
    if (!els.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
    // Safety: reveal anything still hidden after 6s
    setTimeout(function () {
      els.forEach(function (el) { el.classList.add('is-visible'); });
    }, 6000);
  }

  /* ===== CUSTOM CURSOR ===== */
  function initCursor() {
    var cr = document.getElementById('cr');
    var cr2 = document.getElementById('cr2');
    if (!cr || !cr2) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    document.body.classList.add('cursor-on');
    var mx = 0, my = 0, ax = 0, ay = 0;

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      cr.style.transform = 'translate(calc(' + mx + 'px - 50%), calc(' + my + 'px - 50%))';
    });

    (function loop() {
      ax += (mx - ax) * 0.14;
      ay += (my - ay) * 0.14;
      cr2.style.transform = 'translate(calc(' + ax + 'px - 50%), calc(' + ay + 'px - 50%))';
      requestAnimationFrame(loop);
    })();

    document.querySelectorAll('a, button, .svc-card, .why-card').forEach(function (el) {
      el.addEventListener('mouseenter', function () { document.body.classList.add('cursor-xl'); });
      el.addEventListener('mouseleave', function () { document.body.classList.remove('cursor-xl'); });
    });
  }

  /* ===== SERVICE CARD GLOW (mouse track) ===== */
  function initCardGlow() {
    document.querySelectorAll('.svc-card').forEach(function (card) {
      var glow = card.querySelector('.glow');
      if (!glow) return;
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var x = ((e.clientX - r.left) / r.width * 100).toFixed(1);
        var y = ((e.clientY - r.top) / r.height * 100).toFixed(1);
        card.style.setProperty('--mx', x + '%');
        card.style.setProperty('--my', y + '%');
      });
    });
  }

  /* ===== BEFORE / AFTER SLIDER ===== */
  function initBASlider() {
    var slider = document.getElementById('baSlider');
    var handle = document.getElementById('baHandle');
    var before = document.getElementById('baBefore');
    if (!slider || !handle || !before) return;

    var dragging = false;

    function setPos(clientX) {
      var rect = slider.getBoundingClientRect();
      var pct = Math.min(90, Math.max(10, ((clientX - rect.left) / rect.width) * 100));
      before.style.width = pct + '%';
      handle.style.left = pct + '%';
      handle.setAttribute('aria-valuenow', Math.round(pct));
    }

    handle.addEventListener('mousedown', function () { dragging = true; });
    document.addEventListener('mouseup', function () { dragging = false; });
    document.addEventListener('mousemove', function (e) { if (dragging) setPos(e.clientX); });

    handle.addEventListener('touchstart', function (e) { dragging = true; e.preventDefault(); }, { passive: false });
    document.addEventListener('touchend', function () { dragging = false; });
    document.addEventListener('touchmove', function (e) {
      if (dragging) setPos(e.touches[0].clientX);
    }, { passive: true });

    handle.addEventListener('keydown', function (e) {
      var rect = slider.getBoundingClientRect();
      var curr = parseFloat(before.style.width) || 50;
      if (e.key === 'ArrowLeft') setPos(rect.left + (curr - 5) / 100 * rect.width);
      if (e.key === 'ArrowRight') setPos(rect.left + (curr + 5) / 100 * rect.width);
    });
  }

  /* ===== FLOAT NAV ACTIVE SECTION ===== */
  function initFloatNav() {
    var floatNav = document.getElementById('float-nav');
    if (!floatNav) return;
    var items = floatNav.querySelectorAll('.fn-item[data-section]');
    var sectionToNav = {
      'inicio': 'inicio',
      'servicios': 'servicios',
      'porque': 'porque',
      'transformacion': 'transformacion',
      'contacto': 'transformacion',
    };
    function setActive(navId) {
      items.forEach(function (item) {
        item.classList.toggle('is-active', item.getAttribute('data-section') === navId);
      });
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var sid = entry.target.id;
          var navId = sectionToNav[sid] || sid;
          var matched = floatNav.querySelector('[data-section="' + navId + '"]');
          if (matched) setActive(navId);
        }
      });
    }, { threshold: 0.25, rootMargin: '-20% 0px -20% 0px' });
    document.querySelectorAll('section[id], #hero').forEach(function (s) { io.observe(s); });
    setActive('inicio');
  }

  /* ===== CONTACT FORM (Formspree — no tocar) ===== */
  function initContactForm() {
    var form = document.getElementById('contact-form');
    var submitBtn = document.getElementById('form-submit');
    var successEl = document.getElementById('form-success');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (submitBtn) submitBtn.classList.add('is-loading');

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
        .then(function (res) {
          if (res.ok) {
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

  /* ===== TIDIO MOBILE POSITION ===== */
  function initTidioMobilePosition() {
    if (window.innerWidth > 767) return;
    var OFFSET = window.innerWidth <= 640 ? '82px' : '130px';

    function applyToEl(el) {
      if (!el) return;
      el.style.setProperty('bottom', OFFSET, 'important');
    }
    function applyOffset() {
      applyToEl(document.getElementById('tidio-chat'));
      applyToEl(document.getElementById('tidio-chat-iframe'));
      document.querySelectorAll('[id*="tidio"]').forEach(applyToEl);
    }

    document.addEventListener('tidioChat-ready', function () {
      applyOffset();
      setTimeout(applyOffset, 500);
      setTimeout(applyOffset, 1500);
    });

    var attempts = 0;
    var iv = setInterval(function () {
      if (document.getElementById('tidio-chat')) {
        applyOffset();
        var obs = new MutationObserver(applyOffset);
        obs.observe(document.getElementById('tidio-chat'), { attributes: true, childList: true, subtree: true });
        clearInterval(iv);
      }
      if (++attempts > 40) clearInterval(iv);
    }, 500);

    // Also sync WhatsApp to Tidio baseline
    setTimeout(function () {
      var tidioEl = document.getElementById('tidio-chat-iframe') || document.getElementById('tidio-chat');
      var wa = document.querySelector('.whatsapp-float');
      if (tidioEl && wa && window.innerWidth <= 767) {
        var px = parseFloat(window.getComputedStyle(tidioEl).bottom);
        if (!isNaN(px) && px > 10) {
          wa.style.setProperty('bottom', (px + 10) + 'px', 'important');
        }
      }
    }, 3000);
  }

  /* ===== BOOT ===== */
  function boot() {
    safe(initNav, 'Nav');
    safe(initSmoothScroll, 'SmoothScroll');
    safe(initHeroVideo, 'HeroVideo');
    safe(initHeroEntrance, 'HeroEntrance');
    safe(initReveal, 'Reveal');
    safe(initCursor, 'Cursor');
    safe(initCardGlow, 'CardGlow');
    safe(initBASlider, 'BASlider');
    safe(initFloatNav, 'FloatNav');
    safe(initContactForm, 'ContactForm');
    safe(initTidioMobilePosition, 'TidioMobile');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
