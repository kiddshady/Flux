/* ═══════════════════════════════════════════════════════════════════════════
   FLUX — el ícono y la marca, horneados desde el mismo dibujo
   La marca: un nudo de trébol. Un solo cuerpo que se entrelaza consigo mismo
   tres veces y no tiene principio ni fin, como un ciclo metabólico.

   El dibujo vive ACÁ, una sola vez: una curva cerrada en 3D (x, y para el
   trazo; z para saber quién pasa por arriba en cada cruce). De ella salen el
   .ico (sobre la baldosa de Opal: a sangre, sin borde), los PNG de control y
   los <path> de la marca en index.html (titlebar, rail y splash) y en
   icons.js. Así el ícono y la marca no pueden desfasarse.

   Sin dependencias: se pinta por píxel con supersampleo + los encoders
   PNG/ICO propios. `npm run icons` regenera todo.
   ═══════════════════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { encodePNG } from './png.mjs';
import { encodeICO, resample } from './ico.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'build');
const TAU = Math.PI * 2;

/* ── El dibujo ───────────────────────────────────────────────────────────────
   El trébol como nudo tórico (2, 3), encajado en la grilla de 16 de la marca.
   Cada punto: [x, y, z]. En un cruce, los dos tramos difieren en casi 2 de z. */
const N = 720;
const ANCHO = 12.2;           // cuánto ocupa el nudo en la grilla de 16
const TRAZO = 1.5;            // grosor del cuerpo en el ícono, en unidades de grilla
const HUECO = 0.62;           // el aire que deja el tramo de arriba a cada lado, en el cruce
const VECINO = N * 0.09;      // hasta acá, dos puntos son «el mismo tramo» y no un cruce

const cruda = Array.from({ length: N }, (_, i) => {
  const t = (i / N) * TAU, rho = 2 + 0.95 * Math.cos(3 * t);
  return [rho * Math.sin(2 * t), -rho * Math.cos(2 * t), Math.sin(3 * t)];
});
const xs = cruda.map((p) => p[0]), ys = cruda.map((p) => p[1]);
const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
const esc = ANCHO / Math.max(x1 - x0, y1 - y0);
/** La curva en la grilla de 16, centrada en (8, 8). */
const CURVA = cruda.map(([x, y, z]) => [8 + (x - (x0 + x1) / 2) * esc, 8 + (y - (y0 + y1) / 2) * esc, z]);

const lejos = (i, j) => { const d = Math.abs(i - j); return Math.min(d, N - d) > VECINO; };

/* ── La marca en SVG ─────────────────────────────────────────────────────────
   El trazo se corta donde pasa por debajo: quedan tres tramos, uno por cruce. */
function tramosVisibles(grosor) {
  const corte = grosor / 2 + HUECO;
  const oculto = CURVA.map((p, i) => CURVA.some((q, j) => q[2] > p[2] && lejos(i, j) && Math.hypot(p[0] - q[0], p[1] - q[1]) < corte));
  const arranque = oculto.findIndex((o, i) => o && !oculto[(i + 1) % N]);   // el fin de un hueco
  const tramos = [];
  let actual = null;
  for (let k = 1; k <= N; k++) {
    const i = (arranque + k) % N;
    if (!oculto[i]) (actual ||= []).push(CURVA[i]);
    else if (actual) { tramos.push(actual); actual = null; }
  }
  if (actual) tramos.push(actual);
  return tramos;
}
const n2 = (v) => String(Math.round(v * 100) / 100);
const aPath = (pts) => pts.filter((_, i) => i % 5 === 0 || i === pts.length - 1)
  .map(([x, y], i) => `${i ? 'L' : 'M'}${n2(x)} ${n2(y)}`).join('');
const TRAMOS = tramosVisibles(1.3).map(aPath);   // 1.3: el trazo de los íconos del sistema
if (TRAMOS.length !== 3) throw new Error(`el trébol tiene que dar 3 tramos y dio ${TRAMOS.length}`);
const PATHS = TRAMOS.map((d) => `<path pathLength="1" d="${d}"/>`);

function reescribir(rel, cambios) {
  const archivo = path.join(ROOT, rel);
  let s = fs.readFileSync(archivo, 'utf8');
  for (const [re, con, veces] of cambios) {
    const hallados = (s.match(re) || []).length;
    if (hallados !== veces) throw new Error(`${rel}: esperaba ${veces} de ${re} y hay ${hallados}`);
    s = s.replace(re, con);
  }
  fs.writeFileSync(archivo, s);
}

reescribir('renderer/index.html', [
  // la marca de la titlebar y la del rail
  [/(<svg class="op-brand__mark op-icon"[^>]*>)[\s\S]*?(\s*<\/svg>)/g, (_m, abre, cierra) => `${abre}${PATHS.join('')}${cierra}`, 2],
  // el splash: el mismo dibujo
  [/(<div id="boot-splash">\s*<svg viewBox="0 0 16 16">)[\s\S]*?(<\/svg>)/g, (_m, abre, cierra) => `${abre}${PATHS.join('')}${cierra}`, 1],
]);
reescribir('renderer/js/icons.js', [
  [/opal: '[^']*'(\s*\+ '[^']*')*,/g, () => `opal: '${PATHS.join('')}',`, 1],
]);

/* ── El lienzo ───────────────────────────────────────────────────────────────
   Se pinta a 1024 (256 × 4) y se baja con el box filter del encoder. */
const S = 256, SS = 4, W = S * SS;
const K = (0.66 * W) / ANCHO;                 // el nudo ocupa el 66 % de la baldosa
const P = CURVA.map(([x, y, z]) => [W / 2 + (x - 8) * K, W / 2 + (y - 8) * K, z]);
const RI = (TRAZO * K) / 2, RH = RI + HUECO * K;
const TILE_R = 0.19 * W;        // el redondeo de la baldosa: 19 % del lado
const INK = [242, 244, 247];    // --op-text, la luz del sistema

// una grilla para no recorrer los 720 puntos en cada píxel
const CELDA = Math.ceil(RH), COLS = Math.ceil(W / CELDA);
const grilla = new Map();
P.forEach((p, i) => { const k = Math.floor(p[1] / CELDA) * COLS + Math.floor(p[0] / CELDA); (grilla.get(k) || grilla.set(k, []).get(k)).push(i); });

/** Cuánta tinta lleva un punto del master: 1, o 0 si es fondo o el hueco de un cruce. */
function tinta(x, y) {
  let iT = -1, iH = -1;
  const gx = Math.floor(x / CELDA), gy = Math.floor(y / CELDA);
  for (let a = gy - 1; a <= gy + 1; a++) for (let b = gx - 1; b <= gx + 1; b++) {
    const lista = grilla.get(a * COLS + b);
    if (!lista) continue;
    for (const i of lista) {
      const d = Math.hypot(x - P[i][0], y - P[i][1]);
      if (d <= RH && (iH < 0 || P[i][2] > P[iH][2])) iH = i;
      if (d <= RI && (iT < 0 || P[i][2] > P[iT][2])) iT = i;
    }
  }
  if (iT < 0) return 0;
  // lo más alto que roza este punto: si es otro tramo y pasa por arriba, acá va el hueco
  return lejos(iT, iH) && P[iH][2] > P[iT][2] ? 0 : 1;
}

const master = new Uint8Array(W * W * 4);
for (let y = 0; y < W; y++) {
  for (let x = 0; x < W; x++) {
    const qx = Math.abs(x - W / 2) - (W / 2 - TILE_R), qy = Math.abs(y - W / 2) - (W / 2 - TILE_R);
    const dt = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - TILE_R;
    const tile = Math.max(0, Math.min(1, 0.5 - dt / SS));
    if (tile <= 0) continue;

    // La baldosa: la base de Opal con su niebla, el velo abajo y el canto arriba.
    let v = 10;
    const d1 = Math.hypot(x - 0.20 * W, y - 0.14 * W) / (0.75 * W);
    const d2 = Math.hypot(x - 0.82 * W, y - 0.78 * W) / (0.65 * W);
    v += 255 * (0.075 * Math.max(0, 1 - d1) ** 2 + 0.05 * Math.max(0, 1 - d2) ** 2);
    v *= 1 - 0.12 * Math.max(0, (y / W - 0.62) / 0.38);
    if (y < 3 * SS) v += 255 * 0.10 * (1 - y / (3 * SS));

    const t = tinta(x, y);
    const o = (y * W + x) * 4;
    for (let c = 0; c < 3; c++) master[o + c] = Math.round(Math.min(255, v + (INK[c] - v) * t));
    master[o + 3] = Math.round(tile * 255);
  }
}

/* ── Hornear: el mismo dibujo en todos los tamaños, sin versiones simplificadas ── */
const SIZES = [256, 128, 64, 48, 32, 24, 16];
const images = SIZES.map((size) => ({ size, data: resample(master, W, W, size, size) }));

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'icon.ico'), encodeICO(images));
fs.writeFileSync(path.join(OUT, 'icon-256.png'), encodePNG(256, 256, images[0].data));
fs.writeFileSync(path.join(OUT, 'icon-32.png'), encodePNG(32, 32, images.find((i) => i.size === 32).data));

/* Hoja de control: cada tamaño ampliado por vecino más cercano, para ver qué
   queda de verdad a 16 y 24. */
{
  const chicos = [16, 24, 32, 48], zoom = 6, aire = 16;
  const w = 256 + aire * 2 + chicos.reduce((a, s) => a + s * zoom + aire, 0);
  const h = 48 * zoom + aire * 2;
  const hoja = new Uint8Array(w * h * 4);
  for (let i = 0; i < w * h; i++) { hoja[i * 4] = 32; hoja[i * 4 + 1] = 33; hoja[i * 4 + 2] = 36; hoja[i * 4 + 3] = 255; }
  const pegar = (img, size, ox, oy, z) => {
    for (let y = 0; y < size * z; y++) for (let x = 0; x < size * z; x++) {
      const s = (Math.floor(y / z) * size + Math.floor(x / z)) * 4, d = ((oy + y) * w + ox + x) * 4, a = img[s + 3] / 255;
      for (let c = 0; c < 3; c++) hoja[d + c] = Math.round(img[s + c] * a + hoja[d + c] * (1 - a));
    }
  };
  pegar(images[0].data, 256, aire, aire, 1);
  let ox = 256 + aire * 2;
  for (const s of chicos) { pegar(images.find((i) => i.size === s).data, s, ox, aire, zoom); ox += s * zoom + aire; }
  fs.writeFileSync(path.join(OUT, 'control.png'), encodePNG(w, h, hoja));
}

const kb = (f) => Math.round(fs.statSync(path.join(OUT, f)).size / 1024 * 10) / 10;
console.log(`icon.ico  ${kb('icon.ico')} kB  (${SIZES.join(', ')})`);
console.log(`marca     3 tramos, ${TRAMOS.reduce((a, d) => a + d.length, 0)} caracteres de path`);
