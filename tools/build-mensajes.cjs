#!/usr/bin/env node
/* ============================================================
   GENERADOR DE DATOS DE MENSAJES
   Lee los PDF de una carpeta, extrae el texto con `pdftotext`
   y genera assets/mensajes/mensajes.js  +  copia los PDF a
   assets/mensajes/pdf/ para el botón de descarga.

   Uso:   node tools/build-mensajes.cjs  [carpeta-pdf]
   Por defecto la carpeta es  D:\MENSAJES
   Requiere `pdftotext` en el PATH (viene con poppler / git-bash).
   ============================================================ */
const { execFileSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const SRC  = process.argv[2] || 'D:\\MENSAJES';
const ROOT = path.resolve(__dirname, '..');
const OUTDIR = path.join(ROOT, 'assets', 'mensajes');
const PDFDIR = path.join(OUTDIR, 'pdf');

fs.mkdirSync(PDFDIR, { recursive: true });

const CODE_RE = /^\d{2}-\d{4}[A-Za-z]?$/;

function extract(file){
  // -layout conserva los saltos; -enc UTF-8 evita caracteres rotos
  return execFileSync('pdftotext', ['-layout', '-enc', 'UTF-8', file, '-'], {
    maxBuffer: 64 * 1024 * 1024
  }).toString('utf8');
}

function parse(txt){
  // Quitar pie de página de la fuente
  let lines = txt.replace(/\r/g,'').split('\n');
  // Eliminar líneas de pie tipo "Mensaje extraido de Messagehub"
  lines = lines.filter(l => !/Mensaje\s+extraido\s+de/i.test(l));

  // El encabezado va separado por líneas en blanco:
  //   bloque 0 = título (puede ocupar 2 líneas),  bloques intermedios = lugar,
  //   luego una línea = código.  El cuerpo empieza tras el código.
  let codeIdx = lines.findIndex(l => CODE_RE.test(l.trim()));
  if(codeIdx === -1) codeIdx = 0;
  const code = (lines[codeIdx] || '').trim();

  // Agrupar el encabezado en bloques por líneas en blanco
  const headBlocks = [];
  let buf = [];
  for(let h = 0; h < codeIdx; h++){
    const l = lines[h].trim();
    if(!l){ if(buf.length){ headBlocks.push(buf.join(' ')); buf = []; } }
    else buf.push(l);
  }
  if(buf.length) headBlocks.push(buf.join(' '));

  const title = (headBlocks.shift() || '').replace(/\s+/g,' ').trim();
  const place = headBlocks.join(' · ').replace(/\s+/g,' ').replace(/\s·\s$/,'').trim();

  let i = codeIdx + 1;

  // Cuerpo → párrafos numerados
  const paras = [];          // { num, blocks:[str,...] }
  let expected = 1;
  let cur = null;            // párrafo en construcción
  let block = [];            // líneas del bloque actual

  const flushBlock = () => {
    if(block.length && cur){
      const t = block.join(' ').replace(/\s+/g,' ').trim();
      if(t && !/^Missing Text$/i.test(t)) cur.blocks.push(t);
    }
    block = [];
  };
  const flushPara = () => {
    flushBlock();
    if(cur && cur.blocks.length) paras.push(cur);
    cur = null;
  };

  for(; i < lines.length; i++){
    const raw = lines[i];
    const l = raw.trim();
    if(!l){ flushBlock(); continue; }

    const m = l.match(/^(\d+)\s+(.*)$/);
    if(m && +m[1] === expected){
      flushPara();
      cur = { num: expected, blocks: [] };
      expected++;
      block = [m[2]];
      continue;
    }
    if(!cur){ // texto antes del primer número → ignorar / encabezado suelto
      continue;
    }
    block.push(l);
  }
  flushPara();

  return { code, title, place, paras };
}

const files = fs.readdirSync(SRC)
  .filter(f => f.toLowerCase().endsWith('.pdf'))
  .sort();

const data = [];
const seen = new Set();
for(const f of files){
  const full = path.join(SRC, f);
  try{
    const txt = extract(full);
    const m = parse(txt);
    if(!m.code) m.code = path.basename(f, '.pdf');
    if(seen.has(m.code)){ console.log(`DUP ${m.code}  (omitido: ${f})`); continue; }
    seen.add(m.code);
    m.pdf = f;                       // nombre del PDF para descarga
    // copiar PDF al sitio
    fs.copyFileSync(full, path.join(PDFDIR, f));
    data.push(m);
    console.log(`OK  ${m.code}  ${m.title}  (${m.paras.length} párrafos)`);
  }catch(e){
    console.error(`ERR ${f}: ${e.message}`);
  }
}

// Ordenar por código (fecha) ascendente
data.sort((a,b) => a.code.localeCompare(b.code));

fs.writeFileSync(
  path.join(OUTDIR, 'mensajes.js'),
  'window.MENSAJES=' + JSON.stringify(data) + ';\n',
  'utf8'
);
console.log(`\n${data.length} mensajes → assets/mensajes/mensajes.js`);
