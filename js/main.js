document.getElementById('year').textContent = new Date().getFullYear();

// ─── MOTOR DE ANIMACIONES PREMIUM ──────────────────────────────
(function () {
  const desktop = window.innerWidth > 768;

  /* 1 · Variantes por tipo de elemento */
  document.querySelectorAll('.player.reveal').forEach(el =>
    el.classList.add('v-scale', 'v-blur'));
  document.querySelectorAll('.visit-card.reveal').forEach(el =>
    el.classList.add('v-right'));
  document.querySelectorAll('.live-actions.reveal, .sched-note.reveal').forEach(el =>
    el.classList.add('v-fade'));
  const visitLeft = document.querySelector('#visitanos .visit-grid > div:not(.visit-card)');
  if (visitLeft) visitLeft.classList.add('v-left');

  /* 2 · Stagger por índice para tarjetas de horario */
  document.querySelectorAll('.day.reveal').forEach((el, i) => {
    el.style.transitionDelay = (i * 115) + 'ms';
  });

  /* 3 · Marcar hijos de sec-head para animación individual */
  document.querySelectorAll('.sec-head.reveal').forEach(sec => {
    sec.querySelectorAll('.sec-tag, h2, h3, .divider, p').forEach(child =>
      child.classList.add('ac'));
  });

  /* 4 · IntersectionObserver con umbrales refinados */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;

      if (el.classList.contains('sec-head')) {
        /* Contenedor: aparecer al instante; hijos: stagger suave */
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.querySelectorAll('.ac').forEach((child, i) =>
          setTimeout(() => child.classList.add('in'), i * 140));
      } else {
        el.classList.add('in');
      }
      io.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* 5 · Parallax en el hero (solo desktop) */
  if (desktop) {
    const heroInner = document.querySelector('.hero-inner');
    const scrollHint = document.querySelector('.scroll-hint');
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (ticking) return;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (heroInner && y < window.innerHeight * 1.3) {
          heroInner.style.transform = 'translateY(' + (y * 0.14) + 'px)';
        }
        if (scrollHint) scrollHint.style.opacity = Math.max(0, 1 - y / 200);
        ticking = false;
      });
      ticking = true;
    }, { passive: true });
  }
})();

// Header shrink on scroll
const head=document.querySelector('header');
addEventListener('scroll',()=>{
  head.style.boxShadow = scrollY>20 ? '0 8px 30px -18px rgba(60,48,20,.5)' : 'none';
});

// ─── MENÚ MÓVIL ────────────────────────────────────────────────
(function(){
  const btn  = document.querySelector('.menu-btn');
  const nav  = document.getElementById('mobileNav');
  if (!btn || !nav) return;

  function close(){
    nav.classList.remove('open');
    nav.setAttribute('aria-hidden','true');
    btn.textContent = '☰';
    btn.setAttribute('aria-expanded','false');
  }
  btn.addEventListener('click', () => {
    const isOpen = nav.classList.contains('open');
    isOpen ? close() : (
      nav.classList.add('open'),
      nav.setAttribute('aria-hidden','false'),
      btn.textContent = '✕',
      btn.setAttribute('aria-expanded','true')
    );
  });
  // Cerrar al hacer clic en un enlace
  nav.querySelectorAll('.mob-link, .mob-live').forEach(a =>
    a.addEventListener('click', close));
  // Cerrar al hacer scroll
  window.addEventListener('scroll', () => { if(nav.classList.contains('open')) close(); }, { passive: true });
})();

/* ============================================================
   CONFIGURACIÓN DE LA TRANSMISIÓN
   Rellena estos datos con la información de la iglesia.
   ============================================================ */
const CONFIG = {
  youtubeChannelId: "UCArQ1MNf_iuKcQldUjfel2g",  // ID del canal de YouTube
  youtubeApiKey:    "",   // (opcional) clave de YouTube Data API v3: activa la detección automática en vivo / último video
  latestVideoId:    "",   // (opcional) ID de un video para mostrar como respaldo
  youtubeUrl:       "https://www.youtube.com/@White.Eagle7",  // canal de YouTube
  facebookUrl:      ""    // enlace de la página de Facebook
};

(function initLive(){
  const frame  = document.getElementById('playerFrame');
  if(!frame) return; // esta página no tiene reproductor (p. ej. biblia.html)
  const status = document.getElementById('liveStatus');
  const lsText = document.getElementById('lsText');
  const uploads = CONFIG.youtubeChannelId ? 'UU' + CONFIG.youtubeChannelId.slice(2) : '';

  document.querySelectorAll('[data-link="youtube"]').forEach(a=>{ if(CONFIG.youtubeUrl) a.href=CONFIG.youtubeUrl; });
  document.querySelectorAll('[data-link="facebook"]').forEach(a=>{ if(CONFIG.facebookUrl) a.href=CONFIG.facebookUrl; });

  function setStatus(text, live){
    lsText.textContent = text;
    status.classList.toggle('is-live', !!live);
  }
  function embedVideo(videoId, live){
    const auto = live ? '&autoplay=1&mute=1' : '';
    frame.innerHTML =
      '<iframe src="https://www.youtube.com/embed/'+videoId+'?rel=0&modestbranding=1'+auto+'" '+
      'allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
  }
  // Último servicio del canal (lista de subidas) — no necesita clave de API
  function showLatest(){
    frame.innerHTML =
      '<iframe src="https://www.youtube.com/embed/videoseries?list='+uploads+'&rel=0&modestbranding=1" '+
      'allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    setStatus('Servicio más reciente', false);
  }

  // Carga (una sola vez) de la API IFrame de YouTube
  const ytReady = (window.YT && window.YT.Player) ? Promise.resolve() : new Promise(res=>{
    const tag=document.createElement('script'); tag.src='https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = res;
  });

  // Sin clave: intenta la señal en vivo; si no hay, muestra el último servicio
  function tryLiveThenLatest(){
    frame.innerHTML =
      '<iframe id="ytLive" src="https://www.youtube.com/embed/live_stream?channel='+CONFIG.youtubeChannelId+
      '&enablejsapi=1&autoplay=1&mute=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
    setStatus('Buscando transmisión…', false);
    ytReady.then(()=>{
      let settled=false;
      const player=new YT.Player('ytLive',{
        events:{
          onStateChange:(e)=>{
            if(!settled && (e.data===YT.PlayerState.PLAYING || e.data===YT.PlayerState.BUFFERING)){
              settled=true; setStatus('En vivo ahora', true);
            }
          },
          onError:()=>{ if(!settled){ settled=true; showLatest(); } }
        }
      });
      // Red de seguridad: si en 5.5s no hay reproducción en vivo, muestra el último servicio
      setTimeout(()=>{
        if(settled) return;
        let s=-1; try{ s=player.getPlayerState(); }catch(_){}
        if(s===1 || s===3){ settled=true; setStatus('En vivo ahora', true); }
        else { settled=true; showLatest(); }
      }, 5500);
    });
  }

  async function run(){
    // --- Con clave de API: detección automática y precisa ---
    if(CONFIG.youtubeApiKey && CONFIG.youtubeChannelId){
      const base='https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&channelId='+CONFIG.youtubeChannelId+'&key='+CONFIG.youtubeApiKey;
      try{
        const live = await (await fetch(base+'&eventType=live')).json();
        if(live.items && live.items.length){ embedVideo(live.items[0].id.videoId, true); setStatus('En vivo ahora', true); return; }
        const last = await (await fetch(base+'&order=date&maxResults=1')).json();
        if(last.items && last.items.length){ embedVideo(last.items[0].id.videoId, false); setStatus('Servicio más reciente', false); return; }
      }catch(e){ /* si falla, cae al modo sin clave */ }
    }
    // --- Con canal (sin clave): vivo si hay, si no el último servicio ---
    if(CONFIG.youtubeChannelId){ tryLiveThenLatest(); return; }
    // --- Solo un video de respaldo ---
    if(CONFIG.latestVideoId){ embedVideo(CONFIG.latestVideoId, false); setStatus('Servicio más reciente', false); return; }
    setStatus('La transmisión aparecerá aquí', false);
  }
  run();
})();
/* ===================== LECTOR DE LA BIBLIA (Reina-Valera) ===================== */
(function initBible(){
  const section = document.getElementById('biblia');
  if(!section) return;
  const reader  = document.getElementById('bibReader');
  const bookSel = document.getElementById('bibBook');
  const chapSel = document.getElementById('bibChap');
  const prev    = document.getElementById('bibPrev');
  const next    = document.getElementById('bibNext');
  let BOOKS=null, loaded=false, loading=false;

  function load(){
    if(loaded || loading) return;
    loading=true;
    const s=document.createElement('script');
    s.src='assets/biblia/rv1909.js';
    s.onload =()=>{ BOOKS=window.RV1909_BOOKS; loaded=true; loading=false; build(); };
    s.onerror=()=>{ loading=false; reader.innerHTML='<div class="bible-loading">No se pudo cargar la Biblia. Ábrelo desde Live Server o tu hosting (no con doble clic).</div>'; };
    document.head.appendChild(s);
  }
  function fillChapters(bi){
    let o=''; const n=BOOKS[bi].c.length;
    for(let i=1;i<=n;i++) o+='<option value="'+i+'">'+i+'</option>';
    chapSel.innerHTML=o;
  }
  function render(){
    const bi=+bookSel.value, ci=+chapSel.value;
    const verses=BOOKS[bi].c[ci-1];
    let html='<div class="bible-ref">'+BOOKS[bi].n+' '+ci+'</div>';
    verses.forEach((v,k)=>{ html+='<p class="verse"><span class="vn">'+(k+1)+'</span>'+v+'</p>'; });
    reader.innerHTML=html;
    reader.scrollTop=0;
    prev.disabled = (bi===0 && ci===1);
    next.disabled = (bi===BOOKS.length-1 && ci===BOOKS[bi].c.length);
  }
  function build(){
    bookSel.innerHTML=BOOKS.map((b,i)=>'<option value="'+i+'">'+b.n+'</option>').join('');
    bookSel.value=42; fillChapters(42); chapSel.value=3;  // Juan 3 por defecto
    render();
  }

  bookSel.addEventListener('change',()=>{ fillChapters(+bookSel.value); chapSel.value=1; render(); });
  chapSel.addEventListener('change',render);
  prev.addEventListener('click',()=>{
    let bi=+bookSel.value, ci=+chapSel.value;
    if(ci>1){ ci--; } else if(bi>0){ bi--; bookSel.value=bi; fillChapters(bi); ci=BOOKS[bi].c.length; }
    chapSel.value=ci; render();
  });
  next.addEventListener('click',()=>{
    let bi=+bookSel.value, ci=+chapSel.value;
    if(ci<BOOKS[bi].c.length){ ci++; } else if(bi<BOOKS.length-1){ bi++; bookSel.value=bi; fillChapters(bi); ci=1; }
    chapSel.value=ci; render();
  });

  // ── LECTOR SCROLL VERTICAL ──────────────────────────────────
  const readerFS = document.getElementById('readerFS');
  const rfsRef   = document.getElementById('rfsRef');
  const rfsInner = document.getElementById('rfsInner');
  const rfsBody  = readerFS.querySelector('.rfs-body');

  function openFullscreen(bi, ci, targetVn) {
    const verses = BOOKS[bi].c[ci - 1];
    rfsRef.textContent = BOOKS[bi].n + ' · Capítulo ' + ci;

    let html = '<div class="bible-ref">' + BOOKS[bi].n + ' · Capítulo ' + ci + '</div>';
    verses.forEach((v, k) => {
      const vn = k + 1;
      const act = vn === targetVn ? ' fs-active' : '';
      html += '<p class="verse' + act + '" data-vn="' + vn + '"><span class="vn">' + vn + '</span>' + v + '</p>';
    });
    rfsInner.innerHTML = html;

    readerFS.classList.add('open');
    document.body.style.overflow = 'hidden';
    rfsBody.scrollTop = 0;

    // Desplazar al versículo clickeado
    if (targetVn) {
      const target = rfsInner.querySelector('[data-vn="' + targetVn + '"]');
      if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
    }

    // Pantalla completa nativa
    const reqFS = readerFS.requestFullscreen || readerFS.webkitRequestFullscreen || readerFS.mozRequestFullScreen;
    if (reqFS) reqFS.call(readerFS).catch(() => {});
  }

  function closeFullscreen() {
    readerFS.classList.remove('open');
    document.body.style.overflow = '';
    const exitFS = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen;
    if (exitFS && (document.fullscreenElement || document.webkitFullscreenElement)) {
      exitFS.call(document).catch(() => {});
    }
  }

  ['fullscreenchange', 'webkitfullscreenchange'].forEach(ev => {
    document.addEventListener(ev, () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement && readerFS.classList.contains('open')) {
        readerFS.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  reader.addEventListener('click', (e) => {
    const verse = e.target.closest('.verse');
    if (!verse || !loaded) return;
    const vn = +(verse.querySelector('.vn').textContent.trim());
    openFullscreen(+bookSel.value, +chapSel.value, vn);
  });

  document.getElementById('rfsClose').addEventListener('click', closeFullscreen);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && readerFS.classList.contains('open')) closeFullscreen();
  });

  // Carga diferida: solo cuando el apartado se acerca a la vista
  const obs=new IntersectionObserver((es)=>{
    es.forEach(e=>{ if(e.isIntersecting){ load(); obs.disconnect(); } });
  },{rootMargin:'250px'});
  obs.observe(section);
})();

// ==========================================
// CONVERTIDOR A SELECTORES PERSONALIZADOS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const selects = document.querySelectorAll('.bsel select');
  
  selects.forEach(select => {
    // 1. Crear el contenedor principal
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select-wrapper';
    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);
    
    // 2. Crear los elementos visuales
    const customSelect = document.createElement('div');
    customSelect.className = 'custom-select';
    
    const customOptions = document.createElement('div');
    customOptions.className = 'custom-options';
    
    wrapper.appendChild(customSelect);
    wrapper.appendChild(customOptions);
    
    // 3. Función para leer opciones
    function renderOptions() {
      customOptions.innerHTML = '';
      
      if (select.options.length > 0) {
        customSelect.textContent = select.options[select.selectedIndex].text;
      } else {
        customSelect.textContent = 'Cargando...';
      }
      
      Array.from(select.options).forEach((option, index) => {
        const customOpt = document.createElement('div');
        customOpt.className = 'custom-option';
        customOpt.textContent = option.text;
        
        // Al elegir una opción
        customOpt.addEventListener('click', (e) => {
          e.preventDefault();
          select.selectedIndex = index;
          customSelect.textContent = option.text;
          
          customOptions.classList.remove('open');
          customSelect.classList.remove('open');
          
          select.dispatchEvent(new Event('change')); 
        });
        
        customOptions.appendChild(customOpt);
      });
    }
    
    renderOptions();
    
    // 4. Observador de cambios (API de la Biblia)
    const observer = new MutationObserver(renderOptions);
    observer.observe(select, { childList: true });
    
    // 5. Manejo del clic corregido para evitar problemas con el <label>
    customSelect.addEventListener('click', (e) => {
      e.preventDefault(); // Bloquear comportamiento nativo
      
      // Verificamos si ESTE menú ya estaba abierto
      const isOpen = customOptions.classList.contains('open');
      
      // Cerramos TODOS los menús primero para evitar tener varios abiertos
      document.querySelectorAll('.custom-options').forEach(opt => opt.classList.remove('open'));
      document.querySelectorAll('.custom-select').forEach(sel => sel.classList.remove('open'));
      
      // Si no estaba abierto, lo abrimos
      if (!isOpen) {
        customOptions.classList.add('open');
        customSelect.classList.add('open');
      }
    });
  });
  
  // 6. Cerrar menús al hacer clic afuera (Ignorando clics dentro del selector)
  document.addEventListener('click', (e) => {
    // Si el clic NO ocurrió dentro de nuestro selector personalizado, cerramos todo
    if (!e.target.closest('.custom-select-wrapper')) {
      document.querySelectorAll('.custom-options.open').forEach(opt => opt.classList.remove('open'));
      document.querySelectorAll('.custom-select.open').forEach(sel => sel.classList.remove('open'));
    }
  });
});