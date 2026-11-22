/* ═══════════════════════════════════════════════════════════════════════════
   FLUX — el ícono y la marca, horneados desde el mismo dibujo
   La marca: un ciclo (el anillo, con su flecha) y lo que entra en él (el
   trazo que baja). Es el mapa entero en dos trazos: una vía que desemboca en
   un ciclo.

   El dibujo vive ACÁ, una sola vez, en la grilla de 16 de la marca. De él
   salen el .ico (sobre la baldosa de Opal: a sangre, sin borde), los PNG de
   control y los <path> de la marca en index.html (titlebar, rail y splash) y
   en icons.js. Así el ícono y la marca no pueden desfasarse.

   Sin dependencias: SDF supersampleado ×4 + los encoders PNG/ICO propios.
   `npm run icons` regenera todo.
   ═══════════════════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { encodePNG } from './png.mjs';
import { encodeICO, resample } from './ico.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'build');

/* ── El dibujo, en la grilla de 16 ───────────────────────────────────────────
   Los ángulos se miden en sentido horario desde arriba, como en el mapa. */
const C = [8, 9.7];            // centro del anillo
const R = 4;                   // su radio
const TALLO = [[8, 1.9], [8, C[1] - R]];   // lo que entra: baja hasta tocar el anillo
const DESDE = 160, HASTA = 110;            // el arco va de 160° a 110° por el lado largo
const BRAZO = 1.9;             // largo de cada brazo de la punta
const ABRE = 38;               // cuánto abre la punta, en grados

const rad = (g) => (g * Math.PI) / 180;
const enAnillo = (g) => [C[0] + R * Math.sin(rad(g)), C[1] - R * Math.cos(rad(g))];
const A = enAnillo(DESDE), B = enAnillo(HASTA);

/* La punta: dos brazos que salen del final del arco hacia atrás. */
const tang = [Math.cos(rad(HASTA)), Math.sin(rad(HASTA))];   // hacia dónde avanza el ciclo
const girar = ([x, y], g) => [x * Math.cos(rad(g)) - y * Math.sin(rad(g)), x * Math.sin(rad(g)) + y * Math.cos(rad(g))];
const brazo = (g) => { const d = girar(tang, g); return [B[0] - d[0] * BRAZO, B[1] - d[1] * BRAZO]; };
const P1 = brazo(ABRE), P2 = brazo(-ABRE);

/* ── La marca en SVG ───────────────────────────────────────────────────────── */

const n = (v) => String(Math.round(v * 100) / 100);
const pt = ([x, y]) => `${n(x)} ${n(y)}`;
const D_CICLO = `M${pt(A)}A${R} ${R} 0 1 1 ${pt(B)}M${pt(P1)}L${pt(B)}L${pt(P2)}`;
const D_TALLO = `M${pt(TALLO[0])}V${n(TALLO[1][1])}`;

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
  [/<path d="[^"]*"\/>(\s*)<path class="op-brand__trail" d="[^"]*"\/>/g,
    (_m, aire) => `<path d="${D_CICLO}"/>${aire}<path class="op-brand__trail" d="${D_TALLO}"/>`, 2],
  // el splash: el mismo dibujo
  [/(<div id="boot-splash">\s*<svg viewBox="0 0 16 16">)[\s\S]*?(<\/svg>)/g,
    (_m, abre, cierra) => `${abre}\n    <path d="${D_CICLO}"/>\n    <path d="${D_TALLO}"/>\n  ${cierra}`, 1],
]);
reescribir('renderer/js/icons.js', [
  [/opal: '<path d="[^"]*"\/>'(\s*)\+ '<path class="op-brand__trail" d="[^"]*"\/>'/g,
    (_m, aire) => `opal: '<path d="${D_CICLO}"/>'${aire}+ '<path class="op-brand__trail" d="${D_TALLO}"/>'`, 1],
]);

/* ── El lienzo ───────────────────────────────────────────────────────────────
   Se pinta a 1024 (256 × 4) y se baja con el box filter del encoder. */
const S = 256, SS = 4, W = S * SS;
const K = 15.5 * SS;                        // px del master por unidad de grilla
const CX = 8, CY = (1.9 + C[1] + R) / 2;    // el centro del dibujo, al centro de la baldosa
const u = ([x, y]) => [W / 2 + (x - CX) * K, W / 2 + (y - CY) * K];

const TRAZO = 1.3 * K;
const TILE_R = 0.19 * W;        // el redondeo de la baldosa: 19 % del lado
const INK = [242, 244, 247];    // --op-text, la luz del sistema
const MEDIA_LUZ = 0.5;          // el tallo, como el trail de la marca

function segDist(px, py, [ax, ay], [bx, by]) {
  const dx = bx - ax, dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}
function rrectDist(x, y, half, r) {
  const qx = Math.abs(x - half) - (half - r), qy = Math.abs(y - half) - (half - r);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}
const uC = u(C), uA = u(A), uB = u(B), uP1 = u(P1), uP2 = u(P2), uT = TALLO.map(u), uR = R * K;

/** Distancia al arco: adentro de su abanico, al anillo; afuera, a sus puntas. */
function arcoDist(x, y) {
  const dx = x - uC[0], dy = y - uC[1];
  let g = (Math.atan2(dx, -dy) * 180) / Math.PI;
  if (g < 0) g += 360;
  if (g >= DESDE || g <= HASTA) return Math.abs(Math.hypot(dx, dy) - uR);
  return Math.min(Math.hypot(x - uA[0], y - uA[1]), Math.hypot(x - uB[0], y - uB[1]));
}
const aa = (d) => Math.max(0, Math.min(1, 0.5 - d / SS));

const master = new Uint8Array(W * W * 4);
for (let y = 0; y < W; y++) {
  for (let x = 0; x < W; x++) {
    const tile = aa(rrectDist(x, y, W / 2, TILE_R));
    if (tile <= 0) continue;

    // La baldosa: la base de Opal con su niebla, el velo abajo y el canto arriba.
    let v = 10;
    const d1 = Math.hypot(x - 0.20 * W, y - 0.14 * W) / (0.75 * W);
    const d2 = Math.hypot(x - 0.82 * W, y - 0.78 * W) / (0.65 * W);
    v += 255 * (0.075 * Math.max(0, 1 - d1) ** 2 + 0.05 * Math.max(0, 1 - d2) ** 2);
    v *= 1 - 0.12 * Math.max(0, (y / W - 0.62) / 0.38);
    if (y < 3 * SS) v += 255 * 0.10 * (1 - y / (3 * SS));
    let r = v, g = v, b = v;

    const tinta = (cov) => { r += (INK[0] - r) * cov; g += (INK[1] - g) * cov; b += (INK[2] - b) * cov; };
    // El tallo, a media luz y detrás.
    tinta(aa(segDist(x, y, uT[0], uT[1]) - TRAZO / 2) * MEDIA_LUZ);
    // El ciclo y su punta, a plena luz.
    tinta(aa(Math.min(arcoDist(x, y), segDist(x, y, uP1, uB), segDist(x, y, uB, uP2)) - TRAZO / 2));

    const o = (y * W + x) * 4;
    master[o] = Math.round(Math.min(255, r));
    master[o + 1] = Math.round(Math.min(255, g));
    master[o + 2] = Math.round(Math.min(255, b));
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

/* Hoja de control: cada tamaño a su tamaño real y ampliado por vecino más
   cercano, para ver qué queda de verdad a 16 y 24. */
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
console.log(`icon.ico      ${kb('icon.ico')} kB  (${SIZES.join(', ')})`);
console.log(`marca         ${D_CICLO}  +  ${D_TALLO}`);
