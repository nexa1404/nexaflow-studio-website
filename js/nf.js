/* ============================================================
   NexaFlow Studio — nf.js v2026.6
   Integraciones preservadas: Make webhook + fallback mailto, Tidio,
   form id="leadForm" con campos nombre/negocio/email/telefono/mensaje/consent,
   WhatsApp, nav, smooth scroll, reveal, cookies.
   ============================================================ */
(function(){
  'use strict';

  /* === CONFIG INTEGRACIONES === */
  var MAKE_WEBHOOK = "";  // pega aquí la URL del webhook de Make si la usas
  var TIDIO_KEY    = "ci_81677dce11fd4d569827be734385ad9d";
  var WA_NUMBER    = "34644218863";
  var CONTACT_MAIL = "hola@nexaflowestudio.com";

  function safe(fn,name){try{fn()}catch(e){console.warn('[nf:'+name+']',e)}}

  /* ===== NAV ===== */
  function initNav(){
    var nav=document.getElementById('nav');
    if(!nav)return;
    // A dark hero (video) that the nav floats over: keep nav text white until scrolled past it
    var darkHero=document.querySelector('[data-dark-hero],#hero,.pg-hero');
    function heroThreshold(){return darkHero?Math.max(0,darkHero.offsetHeight-nav.offsetHeight-8):0}
    function onScroll(){
      var y=window.scrollY;
      var overDark=darkHero && y<heroThreshold();
      nav.classList.toggle('scrolled',y>40);
      nav.classList.toggle('on-dark',!!overDark);
      nav.classList.toggle('solid',y>40);
    }
    window.addEventListener('scroll',onScroll,{passive:true});
    window.addEventListener('resize',onScroll,{passive:true});onScroll();

    var hamb=document.querySelector('.hamb');
    var overlay=document.getElementById('navOverlay');
    if(hamb&&overlay){
      function open(){overlay.classList.add('is-open');document.body.style.overflow='hidden';hamb.setAttribute('aria-expanded','true')}
      function close(){overlay.classList.remove('is-open');document.body.style.overflow='';hamb.setAttribute('aria-expanded','false')}
      hamb.addEventListener('click',open);
      overlay.querySelectorAll('a,.close').forEach(function(a){a.addEventListener('click',close)});
      document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
    }
  }

  /* ===== SMOOTH SCROLL ===== */
  function initSmoothScroll(){
    document.querySelectorAll('a[href^="#"]').forEach(function(a){
      a.addEventListener('click',function(e){
        var id=a.getAttribute('href').slice(1);if(!id)return;
        var t=document.getElementById(id);if(!t)return;
        e.preventDefault();
        window.scrollTo({top:t.getBoundingClientRect().top+window.scrollY-80,behavior:'smooth'});
      });
    });
  }

  /* ===== REVEAL ON SCROLL ===== */
  function initReveal(){
    var els=document.querySelectorAll('.rv');if(!els.length)return;
    if(!('IntersectionObserver' in window)){els.forEach(function(el){el.classList.add('vis')});return}
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('vis');io.unobserve(e.target)}})
    },{threshold:.16,rootMargin:'0px 0px -60px 0px'});
    els.forEach(function(el){io.observe(el)});
    setTimeout(function(){els.forEach(function(el){el.classList.add('vis')})},6000);
  }

  /* ===== HERO ENTRANCE ===== */
  function initHeroEntrance(){
    var hero=document.querySelector('[data-hero-entry]');
    if(!hero)return;
    setTimeout(function(){hero.classList.add('in')},90);
  }

  /* ===== VIDEO LAZY LOAD (Blob to bypass byte-range limits) ===== */
  function initHeroVideo(){
    document.querySelectorAll('video[data-blob-src]').forEach(function(v){
      var s=v.getAttribute('data-blob-src');if(!s)return;
      function go(){
        fetch(s).then(function(r){if(!r.ok)throw 0;return r.blob()})
          .then(function(b){
            var url=URL.createObjectURL(b);
            v.oncanplay=function(){v.classList.add('ready');v.play().catch(function(){})};
            v.src=url;v.load();
          }).catch(function(){/* keep poster */});
      }
      if('requestIdleCallback' in window)requestIdleCallback(go,{timeout:1500});else setTimeout(go,200);
    });
  }

  /* ===== CONTACT FORM (id="leadForm" — campos preservados) ===== */
  function initLeadForm(){
    var form=document.getElementById('leadForm');
    if(!form)return;
    var ok=document.getElementById('cfOk');
    var fields=document.getElementById('cfFields');
    var btn=document.getElementById('cfSubmit');

    function success(){
      if(ok)ok.style.display='block';
      if(fields)fields.style.display='none';
      try{
        if(window.gtag)window.gtag('event','generate_lead',{event_category:'form',event_label:'leadForm'});
        if(window.dataLayer)window.dataLayer.push({event:'lead_submit',form:'leadForm'});
      }catch(e){}
    }
    function fallbackEmail(d){
      var body="Nombre: "+encodeURIComponent(d.nombre||"-")+
               "%0ANegocio: "+encodeURIComponent(d.negocio||"-")+
               "%0AEmail: "+encodeURIComponent(d.email||"-")+
               "%0ATel\u00e9fono: "+encodeURIComponent(d.telefono||"-")+
               "%0AP\u00e1gina: "+encodeURIComponent(location.pathname||"-")+
               "%0A%0AMensaje:%0A"+encodeURIComponent(d.mensaje||"-");
      window.location.href="mailto:"+CONTACT_MAIL+"?subject="+
        encodeURIComponent("Nueva valoraci\u00f3n web \u2014 "+(d.negocio||d.nombre||""))+"&body="+body;
    }
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var fd=new FormData(form);
      var data={
        nombre:fd.get('nombre'),negocio:fd.get('negocio'),
        email:fd.get('email'),telefono:fd.get('telefono'),
        mensaje:fd.get('mensaje'),pagina:location.href,
        origen:'nexaflow-web',fecha:new Date().toISOString()
      };
      if(btn){btn.disabled=true;var bs=btn.querySelector('span');if(bs)bs.textContent='Enviando…'}
      if(MAKE_WEBHOOK){
        fetch(MAKE_WEBHOOK,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
          .then(function(r){if(!r.ok)throw new Error('net');success()})
          .catch(function(){fallbackEmail(data);success()});
      }else{
        fallbackEmail(data);success();
      }
    });
  }

  /* ===== COOKIES ===== */
  function initCookies(){
    var ck=document.getElementById('ck');if(!ck)return;
    try{if(localStorage.getItem('nf-cookies-ok')==='1')return}catch(e){}
    setTimeout(function(){ck.classList.add('is-open')},1500);
    window.acceptCookies=function(){
      try{localStorage.setItem('nf-cookies-ok','1')}catch(e){}
      ck.classList.remove('is-open');
    };
  }

  /* ===== TIDIO ===== */
  function initTidio(){
    if(!TIDIO_KEY)return;
    // Skip in preview/sandbox environments where the script can't be reached
    var h=location.hostname||'';
    var isPreview=/claudeusercontent|stackblitz|webcontainer|codesandbox|localhost|127\.0\.0\.1|file:/.test(h+location.protocol);
    if(isPreview)return;
    var ts=document.createElement('script');
    ts.src='//code.tidio.co/'+TIDIO_KEY+'.js';ts.async=true;
    ts.onerror=function(){/* silent */};
    document.body.appendChild(ts);
  }

  /* ===== EXPANDABLE CASE CARDS ===== */
  function initCases(){
    document.querySelectorAll('.case').forEach(function(c){
      var btn=c.querySelector('.case-foot');
      function toggle(){c.classList.toggle('open')}
      if(btn)btn.addEventListener('click',toggle);
    });
  }

  /* ===== NEWSLETTER FORM (id="nlForm": nombre/email) ===== */
  function initNewsletter(){
    var form=document.getElementById('nlForm');if(!form)return;
    var ok=document.getElementById('nlOk');
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var fd=new FormData(form);
      var data={nombre:fd.get('nombre'),email:fd.get('email'),tipo:'newsletter',origen:'nexaflow-blog',fecha:new Date().toISOString()};
      function done(){if(ok)ok.style.display='block';form.style.display='none';
        try{if(window.gtag)window.gtag('event','newsletter_signup',{event_label:'nlForm'});if(window.dataLayer)window.dataLayer.push({event:'newsletter_signup'})}catch(e){}}
      if(MAKE_WEBHOOK){
        fetch(MAKE_WEBHOOK,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
          .then(function(r){if(!r.ok)throw 0;done()}).catch(function(){mailto();});
      }else{mailto();}
      function mailto(){
        window.location.href="mailto:"+CONTACT_MAIL+"?subject="+encodeURIComponent("Alta newsletter NexaFlow")+
          "&body="+encodeURIComponent("Nombre: "+(data.nombre||"-")+"\nEmail: "+(data.email||"-"));
        done();
      }
    });
  }

  /* ===== CATEGORY FILTER (blog) ===== */
  function initFilter(){
    var bar=document.getElementById('catBar');if(!bar)return;
    var cards=document.querySelectorAll('[data-cats]');
    bar.querySelectorAll('.chip').forEach(function(ch){
      ch.addEventListener('click',function(){
        bar.querySelectorAll('.chip').forEach(function(c){c.classList.remove('on')});
        ch.classList.add('on');
        var f=ch.getAttribute('data-cat');
        cards.forEach(function(card){
          var show=f==='all'||(card.getAttribute('data-cats')||'').indexOf(f)>-1;
          card.style.display=show?'':'none';
        });
      });
    });
  }

  /* ===== BOOT ===== */
  function boot(){
    safe(initNav,'Nav');
    safe(initSmoothScroll,'SmoothScroll');
    safe(initHeroVideo,'HeroVideo');
    safe(initHeroEntrance,'HeroEntrance');
    safe(initReveal,'Reveal');
    safe(initLeadForm,'LeadForm');
    safe(initNewsletter,'Newsletter');
    safe(initFilter,'Filter');
    safe(initCases,'Cases');
    safe(initCookies,'Cookies');
    safe(initTidio,'Tidio');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
