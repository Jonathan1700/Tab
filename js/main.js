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
  window._revealIO = io;

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

// ─── REALCE VISUAL v2 ──────────────────────────────────────────
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('header');

  // Barra de progreso de lectura
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);

  // Aura de luz del hero (solo donde existe el hero)
  const hero = document.querySelector('.hero');
  if (hero && !hero.querySelector('.hero-glow')) {
    const g = document.createElement('div');
    g.className = 'hero-glow';
    g.setAttribute('aria-hidden', 'true');
    hero.insertBefore(g, hero.firstChild);
  }

  // Scroll: progreso + estado compacto del header (un solo rAF)
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY || document.documentElement.scrollTop;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
      if (header) header.classList.toggle('scrolled', y > 20);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Revelado del título palabra por palabra (efecto de montaje)
  const h1 = document.querySelector('.hero h1');
  if (h1 && !reduce) {
    const frag = document.createDocumentFragment();
    let idx = 0;
    Array.from(h1.childNodes).forEach(node => {
      const em = node.nodeType === 1 && node.tagName === 'EM';
      (node.textContent || '').split(/(\s+)/).forEach(tok => {
        if (tok === '') return;
        if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(tok)); return; }
        const mask = document.createElement('span');
        mask.className = 'word-mask';
        const up = document.createElement('span');
        up.className = 'word-up' + (em ? ' em' : '');
        up.textContent = tok;
        up.style.transitionDelay = (0.25 + idx * 0.09).toFixed(2) + 's';
        idx++;
        mask.appendChild(up);
        frag.appendChild(mask);
      });
    });
    h1.innerHTML = '';
    h1.appendChild(frag);
    h1.style.animation = 'none';
    h1.style.opacity = '1';
    requestAnimationFrame(() =>
      requestAnimationFrame(() => h1.classList.add('ready')));
  }
})();

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
  const verBtns = document.querySelectorAll('.bvt');

  let BOOKS=null, loaded=false, loading=false;

  function load(){
    if(loaded || loading) return;
    loading=true;
    const s=document.createElement('script');
    s.src='assets/biblia/rv1960.js';
    s.onload =()=>{ BOOKS=window.RV1960_BOOKS; loaded=true; loading=false; build(); };
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
    readerFS.classList.remove('minimized');
    document.body.style.overflow = 'hidden';
    rfsBody.scrollTop = 0;

    // Desplazar al versículo clickeado
    if (targetVn) {
      const target = rfsInner.querySelector('[data-vn="' + targetVn + '"]');
      if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
    }

    requestNative();
  }

  // Helpers de pantalla completa nativa
  function inNativeFS() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  }
  function requestNative() {
    const reqFS = readerFS.requestFullscreen || readerFS.webkitRequestFullscreen || readerFS.mozRequestFullScreen;
    if (reqFS) reqFS.call(readerFS).catch(() => {});
  }
  function exitNative() {
    const exitFS = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen;
    if (exitFS && inNativeFS()) exitFS.call(document).catch(() => {});
  }

  // Esc (1ª vez): salir de pantalla completa y quedarse en ventana flotante
  function minimize() {
    readerFS.classList.add('minimized');
    exitNative();
  }
  // Volver a pantalla completa desde la ventana flotante
  function expand() {
    readerFS.classList.remove('minimized');
    requestNative();
  }
  // Cierre total del lector
  function closeFullscreen() {
    readerFS.classList.remove('open', 'minimized');
    document.body.style.overflow = '';
    exitNative();
  }

  // Cuando el navegador sale de pantalla completa (p. ej. con Esc),
  // no cerramos: pasamos a ventana flotante minimizada.
  ['fullscreenchange', 'webkitfullscreenchange'].forEach(ev => {
    document.addEventListener(ev, () => {
      if (!inNativeFS() && readerFS.classList.contains('open')) {
        readerFS.classList.add('minimized');
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
  document.getElementById('rfsExpand').addEventListener('click', expand);
  // Cerrar al pulsar fuera de la ventana (solo en modo minimizado)
  readerFS.addEventListener('click', (e) => {
    if (readerFS.classList.contains('minimized') && e.target === readerFS) closeFullscreen();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !readerFS.classList.contains('open')) return;
    if (inNativeFS()) return;                  // el navegador gestiona el Esc → dispara minimize
    if (readerFS.classList.contains('minimized')) closeFullscreen(); // Esc otra vez → cerrar
    else minimize();
  });

  // Carga diferida: solo cuando el apartado se acerca a la vista
  const obs=new IntersectionObserver((es)=>{
    es.forEach(e=>{ if(e.isIntersecting){ load(); obs.disconnect(); } });
  },{rootMargin:'250px'});
  obs.observe(section);
})();

/* ===================== LECTOR DE MENSAJES ===================== */
(function initMensajes(){
  const section = document.getElementById('mensajes');
  if(!section) return;

  const listEl   = document.getElementById('msgList');
  const readerEl = document.getElementById('msgReader');
  const filterEl = document.getElementById('msgFilter');
  const searchEl = document.getElementById('msgSearch');
  const searchBtn= document.getElementById('msgSearchBtn');
  const tbCode   = document.getElementById('msgToolCode');
  const tbTitle  = document.getElementById('msgToolTitle');
  const tbDown   = document.getElementById('msgToolDownload');
  const tbSearch = document.getElementById('msgToolSearch');

  let MSGS=null, loaded=false, loading=false, current=-1, activeQuery='';

  // Quitar acentos + minúsculas para buscar/filtrar
  const norm = s => (s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  const esc  = s => (s||'').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  const MESES=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  function fechaDe(code){
    const m=/^(\d{2})-(\d{2})(\d{2})[A-Za-z]?$/.exec(code);
    if(!m) return '';
    const yy=+m[1], mm=+m[2], dd=+m[3];
    const year=(yy<30?2000:1900)+yy;
    if(mm<1||mm>12||dd<1||dd>31) return String(year);
    return dd+' '+MESES[mm-1]+' '+year;
  }
  function textoDe(m){ return m.paras.map(p=>p.blocks.join(' ')).join(' '); }

  function load(){
    if(loaded||loading) return;
    loading=true;
    const s=document.createElement('script');
    s.src='assets/mensajes/mensajes.js';
    s.onload =()=>{ MSGS=window.MENSAJES||[]; MSGS.forEach(m=>{ m._buscable=norm(textoDe(m)); }); loaded=true; loading=false; buildList(); };
    s.onerror=()=>{ loading=false; listEl.innerHTML='<div class="msg-loading">No se pudieron cargar los mensajes. Ábrelo desde Live Server o tu hosting (no con doble clic).</div>'; };
    document.head.appendChild(s);
  }

  // ── LISTA ─────────────────────────────────────────────────
  function listItem(m, i, snippet){
    return '<button class="msg-item'+(i===current?' active':'')+'" data-i="'+i+'">'
      + '<div class="msg-item-head"><span class="msg-item-code">'+esc(m.code)+'</span>'
      + '<span class="msg-item-title">'+esc(m.title)+'</span></div>'
      + '<div class="msg-item-place">'+esc(m.place||'—')+'</div>'
      + (snippet?'<div class="msg-item-snippet">'+snippet+'</div>':'')
      + '<div class="msg-item-src">'+esc(fechaDe(m.code))+'</div>'
      + '</button>';
  }
  function buildList(items){
    const arr = items || MSGS.map((m,i)=>({m,i}));
    if(!arr.length){ listEl.innerHTML='<div class="msg-loading">Sin resultados.</div>'; return; }
    listEl.innerHTML = arr.map(o=>listItem(o.m,o.i,o.snippet)).join('');
  }

  // Filtro por metadatos (título / fecha / lugar / código)
  function applyFilter(){
    if(!loaded) return;
    const q=norm(filterEl.value.trim());
    if(!q){ buildList(); return; }
    const arr=[];
    MSGS.forEach((m,i)=>{
      const hay=norm(m.title+' '+m.place+' '+m.code+' '+fechaDe(m.code));
      if(hay.includes(q)) arr.push({m,i});
    });
    buildList(arr);
  }

  // Búsqueda en el texto completo de todos los mensajes
  function snippetFor(buscable, original, q){
    const idx=buscable.indexOf(q);
    if(idx<0) return '';
    const start=Math.max(0,idx-40), end=Math.min(original.length,idx+q.length+60);
    let frag=original.slice(start,end);
    // resaltar coincidencia (insensible a acentos por posición)
    const before=esc(frag.slice(0,idx-start));
    const hit=esc(frag.slice(idx-start, idx-start+q.length));
    const after=esc(frag.slice(idx-start+q.length));
    return (start>0?'…':'')+before+'<mark>'+hit+'</mark>'+after+(end<original.length?'…':'');
  }
  function applySearch(){
    if(!loaded) return;
    const raw=searchEl.value.trim();
    activeQuery=raw;
    if(!raw){ filterEl.disabled=false; buildList(); return; }
    const q=norm(raw);
    const arr=[];
    MSGS.forEach((m,i)=>{
      const pos=m._buscable.indexOf(q);
      if(pos>=0){
        const original=textoDe(m);
        arr.push({m,i,snippet:snippetFor(m._buscable,original,q)});
      }
    });
    buildList(arr);
  }

  // Normaliza conservando la longitud (1 char → 1 char) para resaltar con offsets correctos
  const normLen = s => Array.from(s||'').map(c=>c.normalize('NFD')[0].toLowerCase()).join('');

  // ── LECTOR ────────────────────────────────────────────────
  function render(i){
    const m=MSGS[i]; if(!m) return;
    current=i;
    tbCode.textContent=m.code;
    tbTitle.textContent=m.title;
    tbDown.href='assets/mensajes/pdf/'+encodeURIComponent(m.pdf||(m.code+'.pdf'));
    tbDown.setAttribute('download', m.code+' '+m.title+'.pdf');

    const place = m.place ? esc(m.place) : '';
    let html='<div class="msg-doc">'
      + '<div class="msg-doc-mast">'
      +   '<div class="msg-doc-date">'+esc(fechaDe(m.code))+'</div>'
      +   '<h3 class="msg-doc-title">'+esc(m.title)+'</h3>'
      +   '<div class="msg-doc-meta">'+(place?place+' · ':'')+'<span class="msg-doc-codeval">'+esc(m.code)+'</span></div>'
      + '</div>';
    m.paras.forEach((p,pi)=>{
      html+='<div class="msg-para" data-pi="'+pi+'">';
      p.blocks.forEach((b,bi)=>{
        if(bi===0) html+='<p class="msg-block"><span class="msg-pn">'+p.num+'</span>'+esc(b)+'</p>';
        else       html+='<p class="msg-block msg-sub">'+esc(b)+'</p>';
      });
      html+='</div>';
    });
    html+='</div>';
    readerEl.innerHTML=html;
    readerEl.scrollTop=0;

    if(activeQuery) markInReader(activeQuery);

    // marcar activo en la lista
    listEl.querySelectorAll('.msg-item').forEach(b=>b.classList.toggle('active', +b.dataset.i===i));
  }

  // Resaltado dentro del lector (insensible a acentos, offsets conservados)
  function markInReader(raw){
    const q=normLen(raw); if(!q) return;
    // recolectar nodos de texto primero (no mutar durante el recorrido)
    const walker=document.createTreeWalker(readerEl, NodeFilter.SHOW_TEXT, null);
    const nodes=[]; let node;
    while((node=walker.nextNode())) nodes.push(node);
    let first=null;
    nodes.forEach(n=>{
      const idx=normLen(n.nodeValue).indexOf(q);
      if(idx<0) return;
      const after=n.splitText(idx);
      after.splitText(q.length);
      const mark=document.createElement('mark'); mark.className='msg-mark';
      mark.textContent=after.nodeValue;
      after.parentNode.replaceChild(mark, after);
      if(!first) first=mark;
    });
    if(first) setTimeout(()=>first.scrollIntoView({behavior:'smooth',block:'center'}),60);
  }

  // ── EVENTOS ───────────────────────────────────────────────
  listEl.addEventListener('click',e=>{
    const item=e.target.closest('.msg-item'); if(!item) return;
    render(+item.dataset.i);
  });
  filterEl.addEventListener('input', applyFilter);
  searchEl.addEventListener('input', ()=>{ if(!searchEl.value.trim()){ activeQuery=''; applySearch(); } });
  searchEl.addEventListener('keydown', e=>{ if(e.key==='Enter') applySearch(); });
  searchBtn.addEventListener('click', applySearch);
  tbSearch.addEventListener('click', ()=>{
    if(current<0){ searchEl.focus(); return; }
    if(activeQuery){ markInReader(activeQuery); }
    else searchEl.focus();
  });

  // ── LECTOR INMERSIVO PANTALLA COMPLETA (reutiliza #readerFS) ──
  const readerFS=document.getElementById('readerFS');
  const rfsRef  =document.getElementById('rfsRef');
  const rfsInner=document.getElementById('rfsInner');
  const rfsBody =readerFS?readerFS.querySelector('.rfs-body'):null;

  function inNativeFS(){ return !!(document.fullscreenElement||document.webkitFullscreenElement); }
  function requestNative(){ const r=readerFS.requestFullscreen||readerFS.webkitRequestFullscreen; if(r) r.call(readerFS).catch(()=>{}); }
  function exitNative(){ const x=document.exitFullscreen||document.webkitExitFullscreen; if(x&&inNativeFS()) x.call(document).catch(()=>{}); }

  function openFullscreen(i, targetPi){
    const m=MSGS[i]; if(!m||!readerFS) return;
    rfsRef.textContent=m.title+' · '+m.code;
    let html='<div class="bible-ref">'+esc(m.title)+'</div>';
    m.paras.forEach((p,pi)=>{
      const act=pi===targetPi?' fs-active':'';
      html+='<div class="rfs-para'+act+'" data-pi="'+pi+'">';
      p.blocks.forEach((b,bi)=>{
        if(bi===0) html+='<p class="verse"><span class="vn">'+p.num+'</span>'+esc(b)+'</p>';
        else       html+='<p class="verse rfs-subv">'+esc(b)+'</p>';
      });
      html+='</div>';
    });
    rfsInner.innerHTML=html;
    readerFS.classList.add('open'); readerFS.classList.remove('minimized');
    document.body.style.overflow='hidden'; rfsBody.scrollTop=0;
    if(targetPi!=null){
      const t=rfsInner.querySelector('[data-pi="'+targetPi+'"]');
      if(t) setTimeout(()=>t.scrollIntoView({behavior:'smooth',block:'center'}),80);
    }
    requestNative();
  }
  function minimize(){ readerFS.classList.add('minimized'); exitNative(); }
  function expand(){ readerFS.classList.remove('minimized'); requestNative(); }
  function closeFullscreen(){ readerFS.classList.remove('open','minimized'); document.body.style.overflow=''; exitNative(); }

  if(readerFS){
    readerEl.addEventListener('click',e=>{
      const para=e.target.closest('.msg-para'); if(!para||current<0) return;
      openFullscreen(current, +para.dataset.pi);
    });
    document.getElementById('rfsClose').addEventListener('click', closeFullscreen);
    document.getElementById('rfsExpand').addEventListener('click', expand);
    readerFS.addEventListener('click',e=>{ if(readerFS.classList.contains('minimized')&&e.target===readerFS) closeFullscreen(); });
    ['fullscreenchange','webkitfullscreenchange'].forEach(ev=>document.addEventListener(ev,()=>{
      if(!inNativeFS()&&readerFS.classList.contains('open')) readerFS.classList.add('minimized');
    }));
    document.addEventListener('keydown',e=>{
      if(e.key!=='Escape'||!readerFS.classList.contains('open')) return;
      if(inNativeFS()) return;
      if(readerFS.classList.contains('minimized')) closeFullscreen(); else minimize();
    });
  }

  // Carga diferida
  const obs=new IntersectionObserver(es=>{ es.forEach(e=>{ if(e.isIntersecting){ load(); obs.disconnect(); } }); },{rootMargin:'250px'});
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