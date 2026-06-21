/* =============================================================
   NEXAFLOW STUDIO — JS compartido (páginas de sector/servicio/zona)
   ============================================================= */
(function(){
  "use strict";
  var RM = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* === CONFIG INTEGRACIONES (mismas que la home) === */
  var MAKE_WEBHOOK = "";
  var TIDIO_KEY    = "ci_81677dce11fd4d569827be734385ad9d";

  /* ===== MODAL ===== */
  var modal = document.getElementById("modal");
  window.openModal = function(){
    if(!modal) return;
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
    requestAnimationFrame(function(){ modal.classList.add("show"); });
    setTimeout(function(){ var f = modal.querySelector("#modal-box a, #modal-box button"); if(f) f.focus(); }, 250);
  };
  window.closeModal = function(){
    if(!modal) return;
    modal.classList.remove("show");
    setTimeout(function(){ modal.classList.remove("open"); document.body.style.overflow = ""; }, 230);
  };
  document.addEventListener("keydown", function(e){ if(e.key === "Escape") window.closeModal(); });
  window.hLink = function(e, url){ e.stopPropagation(); e.preventDefault(); window.open(url, "_blank"); };

  /* ===== IR AL FORMULARIO ===== */
  window.goContact = function(){
    var nl = document.getElementById("navLinks"); if(nl) nl.classList.remove("open");
    var nb = document.getElementById("navBackdrop"); if(nb) nb.classList.remove("show");
    document.body.classList.remove("nav-open");
    document.body.style.overflow = "";
    var t = document.getElementById("contacto");
    if(!t) return;
    t.scrollIntoView({behavior: RM ? "auto" : "smooth", block:"start"});
    setTimeout(function(){ var i = document.getElementById("f-nombre"); if(i) i.focus({preventScroll:true}); }, RM ? 0 : 620);
  };

  /* ===== FORMULARIO DE LEADS (Make + fallback email) ===== */
  (function(){
    var form = document.getElementById("leadForm");
    if(!form) return;
    var fields = document.getElementById("cfFields");
    var ok = document.getElementById("cfOk");
    var btn = document.getElementById("cfSubmit");
    function val(id){ var e = document.getElementById(id); return e ? e.value.trim() : ""; }
    function fallbackEmail(d){
      var body = "Nuevo lead desde la web:%0A%0ANombre: "+encodeURIComponent(d.nombre)+
                 "%0ANegocio: "+encodeURIComponent(d.negocio)+
                 "%0AEmail: "+encodeURIComponent(d.email)+
                 "%0ATel\u00e9fono: "+encodeURIComponent(d.telefono||"-")+
                 "%0AP\u00e1gina: "+encodeURIComponent(d.pagina||"-")+
                 "%0A%0AMensaje:%0A"+encodeURIComponent(d.mensaje||"-");
      window.location.href = "mailto:hola@nexaflowestudio.com?subject="+
        encodeURIComponent("Nueva valoraci\u00f3n web \u2014 "+d.negocio)+"&body="+body;
    }
    function success(){ if(fields) fields.style.display="none"; if(ok) ok.classList.add("show"); }
    form.addEventListener("submit", function(e){
      e.preventDefault();
      var nombre = val("f-nombre"), negocio = val("f-negocio"), email = val("f-email");
      var consent = document.getElementById("f-consent");
      if(!nombre || !negocio || !email || !(consent && consent.checked)){
        [["f-nombre",nombre],["f-negocio",negocio],["f-email",email]].forEach(function(p){
          var el = document.getElementById(p[0]); if(el) el.style.borderColor = p[1] ? "" : "var(--coral)";
        });
        if(consent && !consent.checked){ consent.parentElement.style.color = "var(--coral)"; }
        return;
      }
      var data = { nombre:nombre, negocio:negocio, email:email,
                   telefono: val("f-telefono"), mensaje: val("f-mensaje"),
                   pagina: (document.title||"").trim(),
                   origen:"nexaflow-web", fecha: new Date().toISOString() };
      btn.disabled = true; var bs = btn.querySelector("span"); if(bs) bs.textContent = "Enviando…";
      if(MAKE_WEBHOOK){
        fetch(MAKE_WEBHOOK, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(data) })
          .then(function(r){ if(!r.ok) throw new Error("net"); success(); })
          .catch(function(){ fallbackEmail(data); success(); });
      } else { fallbackEmail(data); success(); }
    });
  })();

  /* ===== COOKIES ===== */
  var cookieEl = document.getElementById("cookie");
  window.openCookies = function(){ if(cookieEl) cookieEl.classList.add("show"); };
  window.acceptCookies = function(){
    if(cookieEl) cookieEl.classList.remove("show");
    try { localStorage.setItem("nf_cookies","1"); } catch(e){}
  };
  setTimeout(function(){
    var seen = false; try { seen = !!localStorage.getItem("nf_cookies"); } catch(e){}
    if(!seen && cookieEl) cookieEl.classList.add("show");
  }, 1500);

  /* ===== TIDIO ===== */
  if(TIDIO_KEY){
    var ts = document.createElement("script");
    ts.src = "//code.tidio.co/" + TIDIO_KEY + ".js"; ts.async = true;
    document.body.appendChild(ts);
  }

  /* ===== NAV ===== */
  var nav = document.getElementById("nav");
  var navLinks = document.getElementById("navLinks");
  var navBackdrop = document.getElementById("navBackdrop");
  /* If backdrop element wasn't in the markup, create it (defensive) */
  if(!navBackdrop){
    navBackdrop = document.createElement("div");
    navBackdrop.id = "navBackdrop";
    navBackdrop.className = "nav-backdrop";
    document.body.appendChild(navBackdrop);
  }
  function openNav(){
    if(!navLinks) return;
    navLinks.classList.add("open");
    navBackdrop.classList.add("show");
    document.body.classList.add("nav-open");
    document.body.style.overflow = "hidden";
  }
  function closeNav(){
    if(!navLinks) return;
    navLinks.classList.remove("open");
    navBackdrop.classList.remove("show");
    document.body.classList.remove("nav-open");
    document.body.style.overflow = "";
  }
  window.toggleNav = function(){
    if(!navLinks) return;
    if(navLinks.classList.contains("open")) closeNav(); else openNav();
  };
  window.closeNav = closeNav;
  if(navLinks){
    navLinks.querySelectorAll(".nl, .nav-cta").forEach(function(a){
      a.addEventListener("click", closeNav);
    });
  }
  navBackdrop.addEventListener("click", closeNav);
  document.addEventListener("keydown", function(e){
    if(e.key === "Escape" && navLinks && navLinks.classList.contains("open")) closeNav();
  });
  function onScroll(){ if(nav) nav.classList.toggle("solid", window.scrollY > 60); }
  window.addEventListener("scroll", onScroll, {passive:true}); onScroll();

  /* ===== SMOOTH SCROLL (anclas internas de la misma página) ===== */
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener("click", function(e){
      var id = a.getAttribute("href");
      if(id.length < 2) return;
      var t = document.querySelector(id);
      if(!t) return;
      e.preventDefault();
      t.scrollIntoView({behavior: RM ? "auto" : "smooth", block:"start"});
    });
  });

  /* ===== FAQ ACORDEÓN ===== */
  document.querySelectorAll(".faq-item").forEach(function(item){
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    if(!q || !a) return;
    q.addEventListener("click", function(){
      var isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function(o){
        if(o!==item){ o.classList.remove("open"); var oa=o.querySelector(".faq-a"); if(oa) oa.style.maxHeight=null; var oq=o.querySelector(".faq-q"); if(oq) oq.setAttribute("aria-expanded","false"); }
      });
      if(isOpen){ item.classList.remove("open"); a.style.maxHeight=null; q.setAttribute("aria-expanded","false"); }
      else { item.classList.add("open"); a.style.maxHeight = a.scrollHeight + "px"; q.setAttribute("aria-expanded","true"); }
    });
  });

  /* ===== REVEALS ===== */
  var rvs = document.querySelectorAll(".rv,.rv-l,.rv-s");
  if("IntersectionObserver" in window){
    var io = new IntersectionObserver(function(ents){
      ents.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add("vis"); io.unobserve(en.target); } });
    }, {threshold:0.08, rootMargin:"0px 0px -40px 0px"});
    rvs.forEach(function(el,i){ el.style.transitionDelay = (Math.min(i,4)*0.06)+"s"; io.observe(el); });
  } else { rvs.forEach(function(el){ el.classList.add("vis"); }); }
  setTimeout(function(){ rvs.forEach(function(el){ el.classList.add("vis"); }); }, 6000);

  /* ===== CURSOR ===== */
  var fine = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  if(fine){
    document.body.classList.add("cursor-on");
    var cr = document.getElementById("cr"), cr2 = document.getElementById("cr2");
    if(cr && cr2){
      var mx=innerWidth/2, my=innerHeight/2, rx=mx, ry=my;
      document.addEventListener("mousemove", function(e){
        mx=e.clientX; my=e.clientY;
        cr.style.transform = "translate("+(mx-3.5)+"px,"+(my-3.5)+"px)";
      });
      (function loop(){
        rx += (mx-rx)*0.16; ry += (my-ry)*0.16;
        cr2.style.transform = "translate("+(rx-19)+"px,"+(ry-19)+"px)";
        requestAnimationFrame(loop);
      })();
      document.querySelectorAll("a,button,.faq-q,.prob-card,.ben-card,.proc-step,.rel-card").forEach(function(el){
        el.addEventListener("mouseenter", function(){
          cr.style.width="14px"; cr.style.height="14px";
          cr2.style.width="58px"; cr2.style.height="58px"; cr2.style.borderColor="var(--lime)";
        });
        el.addEventListener("mouseleave", function(){
          cr.style.width="7px"; cr.style.height="7px";
          cr2.style.width="38px"; cr2.style.height="38px"; cr2.style.borderColor="var(--lime-border)";
        });
      });
    }
  }
})();
