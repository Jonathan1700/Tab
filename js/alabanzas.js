/* ══════════════════════════════════════════════════════════════
   LISTA DE ALABANZAS
   Para agregar una alabanza:
     1. Copia el archivo .mp3 a la carpeta  assets/alabanzas/
     2. Añade una línea al arreglo con este formato:
        { titulo: "Nombre", autor: "Artista", archivo: "assets/alabanzas/nombre.mp3" }
   Para quitar una alabanza: borra su línea del arreglo.
══════════════════════════════════════════════════════════════ */
const ALABANZAS = [
  { titulo: "EL TERCER EXODO", archivo: "assets/alabanzas/El TERCER EXODO.mp3" },
];

(function () {
  const grid  = document.getElementById('alabanzasGrid');
  const empty = document.getElementById('albEmpty');
  if (!grid) return;

  if (!ALABANZAS.length) {
    empty.style.display = 'block';
    return;
  }

  grid.innerHTML = ALABANZAS.map((a, i) => `
    <div class="alb-card reveal" style="transition-delay:${i * 90}ms">
      <div class="alb-header">
        <div class="alb-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>
        </div>
        <div class="alb-info">
          <h3 class="alb-titulo">${a.titulo}</h3>
          ${a.autor ? `<p class="alb-autor">${a.autor}</p>` : ''}
        </div>
      </div>
      <div class="alb-player" data-src="${a.archivo}">
        <button class="ap-play" aria-label="Reproducir / Pausar">
          <svg class="ico-play"  viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
          <svg class="ico-pause" viewBox="0 0 24 24" style="display:none">
            <rect x="6"  y="4" width="4" height="16"/>
            <rect x="14" y="4" width="4" height="16"/>
          </svg>
        </button>
        <div class="ap-body">
          <div class="ap-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
            <div class="ap-fill"></div>
          </div>
          <div class="ap-times">
            <span class="ap-cur">0:00</span>
            <span class="ap-dur">--:--</span>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  /* Registrar nuevas tarjetas en el IntersectionObserver de main.js */
  const io = window._revealIO;
  if (io) {
    grid.querySelectorAll('.reveal').forEach(el => io.observe(el));
  } else {
    grid.querySelectorAll('.reveal').forEach(el =>
      setTimeout(() => el.classList.add('in'), 100));
  }

  function fmt(s) {
    if (!isFinite(s)) return '--:--';
    const m = Math.floor(s / 60), ss = Math.floor(s % 60);
    return m + ':' + (ss < 10 ? '0' : '') + ss;
  }

  grid.querySelectorAll('.alb-player').forEach(player => {
    player._audio = null; // se crea al primer toque (requerido por iOS)
    const playBtn  = player.querySelector('.ap-play');
    const icoPlay  = playBtn.querySelector('.ico-play');
    const icoPause = playBtn.querySelector('.ico-pause');
    const fill     = player.querySelector('.ap-fill');
    const bar      = player.querySelector('.ap-bar');
    const curEl    = player.querySelector('.ap-cur');
    const durEl    = player.querySelector('.ap-dur');

    /* El Audio se crea la primera vez que el usuario toca play.
       Esto es necesario para iOS Safari, que bloquea audio creado fuera de un gesto.
       Los espacios en el nombre de archivo se reemplazan por %20 solo en la parte del nombre. */
    function ensureAudio() {
      if (player._audio) return player._audio;
      const src = player.dataset.src
        .split('/')
        .map((seg, i, arr) => i === arr.length - 1 ? seg.replace(/ /g, '%20') : seg)
        .join('/');
      const a = new Audio(src);
      a.addEventListener('loadedmetadata', () => { durEl.textContent = fmt(a.duration); });
      a.addEventListener('timeupdate', () => {
        const p = a.duration ? (a.currentTime / a.duration) * 100 : 0;
        fill.style.width = p + '%';
        bar.setAttribute('aria-valuenow', Math.round(p));
        curEl.textContent = fmt(a.currentTime);
      });
      a.addEventListener('ended', () => {
        icoPlay.style.display  = '';
        icoPause.style.display = 'none';
        fill.style.width = '0%';
        curEl.textContent = '0:00';
      });
      player._audio = a;
      return a;
    }

    playBtn.addEventListener('click', () => {
      const a = ensureAudio();

      /* Pausar todos los demás reproductores */
      grid.querySelectorAll('.alb-player').forEach(other => {
        if (other !== player && other._audio && !other._audio.paused) {
          other._audio.pause();
          other.querySelector('.ico-play').style.display  = '';
          other.querySelector('.ico-pause').style.display = 'none';
        }
      });

      if (a.paused) {
        /* Actualizar ícono de inmediato para respuesta visual instantánea */
        icoPlay.style.display  = 'none';
        icoPause.style.display = '';
        const p = a.play();
        /* Si el navegador rechaza la reproducción, revertir el ícono */
        if (p) p.catch(() => {
          icoPlay.style.display  = '';
          icoPause.style.display = 'none';
        });
      } else {
        a.pause();
        icoPlay.style.display  = '';
        icoPause.style.display = 'none';
      }
    });

    /* Toque/clic en la barra de progreso para saltar */
    bar.addEventListener('click', e => {
      const a = player._audio;
      if (!a || !a.duration) return;
      const r = bar.getBoundingClientRect();
      a.currentTime = ((e.clientX - r.left) / r.width) * a.duration;
    });
  });
})();
