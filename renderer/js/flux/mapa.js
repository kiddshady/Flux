/* ═══════════════════════════════════════════════════════════════════════════
   FLUX — el mapa
   Dibuja los metabolitos y las reacciones de datos.js en un SVG, y lo deja
   recorrer: la rueda lo desplaza, Ctrl + rueda acerca, arrastrar lo mueve.

   El dibujo se arma una sola vez. Elegir algo o cambiar de capa solo prende
   clases: lo que cambia de color u opacidad lo hace por transición (flux.css),
   nunca repintando.
   ═══════════════════════════════════════════════════════════════════════════ */

import { LIENZO, ANILLO, METABOLITOS, REACCIONES, metabolito, rasgos } from './datos.js';

const NODO_H = 26;
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const n1 = (v) => Math.round(v * 10) / 10;

const rotulo = (m) => m.corto || m.nombre;
const anchoNodo = (m) => Math.max(56, Math.round(rotulo(m).length * 6.9 + 24));

/* ── Geometría ─────────────────────────────────────────────────────────────── */

const enAnillo = (m) => typeof m.ang === 'number';
const puntoAnillo = (grados, r = ANILLO.r) => {
  const a = (grados * Math.PI) / 180;
  return { x: ANILLO.cx + r * Math.sin(a), y: ANILLO.cy - r * Math.cos(a) };
};

/** ¿El punto cae adentro de la pastilla del nodo (con un margen)? */
function tapado(p, m, margen) {
  return Math.abs(p.x - m.x) < anchoNodo(m) / 2 + margen && Math.abs(p.y - m.y) < NODO_H / 2 + margen;
}

/** Desde el centro de un nodo hacia un punto: dónde sale de la pastilla. */
function borde(m, hacia, margen) {
  const dx = hacia.x - m.x, dy = hacia.y - m.y;
  const largo = Math.hypot(dx, dy) || 1;
  const hw = anchoNodo(m) / 2 + margen, hh = NODO_H / 2 + margen;
  const t = Math.min(dx ? hw / Math.abs(dx) : Infinity, dy ? hh / Math.abs(dy) : Infinity);
  return { x: m.x + dx * t, y: m.y + dy * t, ux: dx / largo, uy: dy / largo };
}

/** La punta de una flecha: un triángulo en `p` que mira hacia (ux, uy). */
function punta(p, ux, uy, t = 7) {
  const bx = p.x - ux * t, by = p.y - uy * t;
  const nx = -uy * t * 0.5, ny = ux * t * 0.5;
  return `<polygon class="fx-punta" points="${n1(p.x)},${n1(p.y)} ${n1(bx + nx)},${n1(by + ny)} ${n1(bx - nx)},${n1(by - ny)}"/>`;
}

/* Lo que una reacción muestra al lado de su flecha: solo lo que importa para
   seguir la energía. El resto (ADP, CoA, Pi, agua) está en la ficha. */
const VISIBLES_GASTA = ['ATP', 'GTP', 'UTP', 'NADH'];
const VISIBLES_FORMA = ['ATP', 'GTP', 'NADH', 'FADH₂', 'NADPH', 'CO₂'];
const CLASE_COF = { ATP: 'atp', GTP: 'atp', NADH: 'red', 'FADH₂': 'red', NADPH: 'red', 'CO₂': 'co2' };

function cofactores(r) {
  const partes = [];
  for (const g of r.gasta || []) if (VISIBLES_GASTA.includes(g)) partes.push({ t: `− ${g}`, c: g === 'NADH' ? 'red' : 'gasto' });
  for (const f of r.forma || []) if (VISIBLES_FORMA.includes(f)) partes.push({ t: `+ ${f}`, c: CLASE_COF[f] });
  return partes;
}

function textoCof(partes, x, y, ancla) {
  if (!partes.length) return '';
  const spans = partes.map((p, i) => `<tspan class="fx-cof--${p.c}"${i ? ' dx="8"' : ''}>${esc(p.t)}</tspan>`).join('');
  return `<text class="fx-cof" x="${n1(x)}" y="${n1(y)}" text-anchor="${ancla}">${spans}</text>`;
}

function insignia(r, p) {
  return r.paso
    ? `<circle class="fx-insignia" cx="${n1(p.x)}" cy="${n1(p.y)}" r="10"/><text class="fx-insignia__n" x="${n1(p.x)}" y="${n1(p.y + 3.8)}" text-anchor="middle">${r.paso}</text>`
    : `<circle class="fx-insignia fx-insignia--chica" cx="${n1(p.x)}" cy="${n1(p.y)}" r="5"/>`;
}

/** Una reacción entera: tramos, puntas, insignia, enzima y cofactores. */
function dibujarReaccion(r) {
  const A = metabolito(r.de[0]), B = metabolito(r.a[0]);
  const cof = cofactores(r);
  let trazos = '', medio, etiqueta = '', cofTxt = '';

  if (enAnillo(A) && enAnillo(B) && r.ruta === 'krebs') {
    /* Un arco del anillo, en sentido horario. Se recorta contra las dos
       pastillas grado por grado: a los costados del anillo la pastilla tapa
       pocos grados, arriba y abajo tapa muchos. */
    let a1 = A.ang, a2 = B.ang <= A.ang ? B.ang + 360 : B.ang;
    while (tapado(puntoAnillo(a1), A, 5) && a1 < a2) a1 += 0.5;
    while (tapado(puntoAnillo(a2), B, 8) && a2 > a1) a2 -= 0.5;
    const p1 = puntoAnillo(a1), p2 = puntoAnillo(a2);
    const am = (A.ang + (B.ang <= A.ang ? B.ang + 360 : B.ang)) / 2;
    const rad = (a2 * Math.PI) / 180;
    trazos = `<path class="fx-tramo" d="M${n1(p1.x)},${n1(p1.y)} A${ANILLO.r},${ANILLO.r} 0 0 1 ${n1(p2.x)},${n1(p2.y)}"/>`
      + punta(p2, Math.cos(rad), Math.sin(rad));
    medio = puntoAnillo(am);

    const s = Math.sin((am * Math.PI) / 180), c = Math.cos((am * Math.PI) / 180);
    if (Math.abs(s) < 0.2 && c > 0) {
      // arriba: por ahí baja el acetil-CoA, la enzima va al costado
      etiqueta = `<text class="fx-enzima" x="${n1(medio.x + 18)}" y="${n1(medio.y - 30)}" text-anchor="start">${esc(r.enzima)}</text>`;
    } else {
      const fuera = puntoAnillo(am, ANILLO.r + 24);
      const ancla = Math.abs(s) < 0.2 ? 'middle' : s > 0 ? 'start' : 'end';
      etiqueta = `<text class="fx-enzima" x="${n1(fuera.x)}" y="${n1(fuera.y + 4 + (Math.abs(s) < 0.2 ? 6 : 0))}" text-anchor="${ancla}">${esc(r.enzima)}</text>`;
    }
    const dentro = puntoAnillo(am, ANILLO.r - 24);
    const anclaIn = Math.abs(s) < 0.2 ? 'middle' : s > 0 ? 'end' : 'start';
    cofTxt = textoCof(cof, dentro.x, dentro.y + 4, anclaIn);
  } else if (r.via) {
    /* Una curva: sale de A, pasa cerca del punto de control y llega a B. */
    const q = r.via;
    const p1 = borde(A, q, 5), p2 = borde(B, q, 8);
    trazos = `<path class="fx-tramo" d="M${n1(p1.x)},${n1(p1.y)} Q${q.x},${q.y} ${n1(p2.x)},${n1(p2.y)}"/>`
      + punta(p2, -p2.ux, -p2.uy);
    medio = { x: 0.25 * p1.x + 0.5 * q.x + 0.25 * p2.x, y: 0.25 * p1.y + 0.5 * q.y + 0.25 * p2.y };
    etiqueta = `<text class="fx-enzima" x="${n1(medio.x - 16)}" y="${n1(medio.y + 4)}" text-anchor="end">${esc(r.enzima)}</text>`;
    cofTxt = textoCof(cof, medio.x - 16, medio.y + 20, 'end');
  } else {
    const izq = r.lado === 'izq';
    const p1 = borde(A, B, 5), p2 = borde(B, A, 8);
    const ux = -p2.ux, uy = -p2.uy;
    trazos = `<path class="fx-tramo" d="M${n1(p1.x)},${n1(p1.y)} L${n1(p2.x)},${n1(p2.y)}"/>` + punta(p2, ux, uy);
    if (r.reversible) trazos += punta({ x: p1.x - ux * 3, y: p1.y - uy * 3 }, -ux, -uy, 6);
    medio = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    if (Math.abs(uy) > Math.abs(ux)) {
      // la enzima a un lado de la flecha y los cofactores al otro (o debajo de ella)
      const xe = medio.x + (izq ? -18 : 18);
      etiqueta = `<text class="fx-enzima" x="${n1(xe)}" y="${n1(medio.y + 4)}" text-anchor="${izq ? 'end' : 'start'}">${esc(r.enzima)}</text>`;
      cofTxt = r.cofLado === 'der'
        ? textoCof(cof, medio.x + 18, medio.y + 20, 'start')
        : textoCof(cof, medio.x + (izq ? 18 : -18), medio.y + 4, izq ? 'start' : 'end');
    } else if (r.rotulo === 'arriba') {
      etiqueta = `<text class="fx-enzima" x="${n1(medio.x)}" y="${n1(medio.y - 20)}" text-anchor="middle">${esc(r.enzima)}</text>`;
      cofTxt = textoCof(cof, medio.x, medio.y + 22, 'middle');
    } else {
      // debajo de las pastillas de los costados, no entre ellas: el tramo es corto
      etiqueta = `<text class="fx-enzima" x="${n1(medio.x)}" y="${n1(medio.y + 34)}" text-anchor="middle">${esc(r.enzima)}</text>`;
      cofTxt = textoCof(cof, medio.x, medio.y + 50, 'middle');
    }
  }

  /* Un rótulo puesto a mano (`rot`), para las flechas largas que cruzan zonas
     ocupadas: ahí el lugar por defecto cae encima de otra cosa. */
  if (r.rot) {
    etiqueta = `<text class="fx-enzima" x="${r.rot.x}" y="${r.rot.y}" text-anchor="${r.rot.ancla}">${esc(r.enzima)}</text>`;
    cofTxt = textoCof(cof, r.rot.x, r.rot.cofY ?? r.rot.y + 16, r.rot.ancla);
  }

  /* Los que entran o salen de más: otro sustrato llega a la insignia; otro
     producto sale del primer sustrato. */
  for (const id of r.de.slice(1)) {
    const m = metabolito(id);
    const p1 = borde(m, medio, 5);
    const fin = { x: medio.x - p1.ux * 13, y: medio.y - p1.uy * 13 };
    trazos += `<path class="fx-tramo" d="M${n1(p1.x)},${n1(p1.y)} L${n1(fin.x)},${n1(fin.y)}"/>` + punta(fin, p1.ux, p1.uy);
  }
  for (const id of r.a.slice(1)) {
    const m = metabolito(id);
    const p1 = borde(A, m, 5), p2 = borde(m, A, 8);
    trazos += `<path class="fx-tramo" d="M${n1(p1.x)},${n1(p1.y)} L${n1(p2.x)},${n1(p2.y)}"/>` + punta(p2, -p2.ux, -p2.uy);
  }

  const g = rasgos(r);
  const clases = ['fx-rx', `fx-rx--${r.ruta}`, r.tambien && `fx-rx--${r.tambien}`,
    g.gastaAtp && 'gasta-atp', g.formaAtp && 'forma-atp', g.reductor && 'da-reductor',
    g.irreversible && 'es-irreversible', g.regulada && 'es-regulada', g.inhibida && 'tiene-inhibidor',
  ].filter(Boolean).join(' ');

  // La zona que recibe el click es más ancha que la flecha: 2 px no se aciertan.
  const zona = trazos.replace(/class="fx-tramo"/g, 'class="fx-zona"').replace(/<polygon[^>]*\/>/g, '');
  return `<g class="${clases}" data-rx="${r.id}" data-mx="${n1(medio.x)}" data-my="${n1(medio.y)}" tabindex="0" role="button" aria-label="${esc(r.enzima)}">
    ${zona}${trazos}${insignia(r, medio)}${etiqueta}${cofTxt}</g>`;
}

function dibujarNodo(m) {
  const w = anchoNodo(m);
  return `<g class="fx-nodo" data-met="${m.id}" tabindex="0" role="button" aria-label="${esc(m.nombre)}">
    <rect x="${m.x - w / 2}" y="${m.y - NODO_H / 2}" width="${w}" height="${NODO_H}" rx="${NODO_H / 2}"/>
    <text x="${m.x}" y="${m.y + 4}" text-anchor="middle">${esc(rotulo(m))}</text></g>`;
}

function dibujar() {
  const mito = { x: 36, y: 948, w: LIENZO.w - 72, h: LIENZO.h - 948 - 14 };
  return `
    <g class="fx-zonas" aria-hidden="true">
      <rect class="fx-mito" x="${mito.x}" y="${mito.y}" width="${mito.w}" height="${mito.h}" rx="28"/>
      <text class="fx-lugar" x="60" y="52">Citosol</text>
      <text class="fx-lugar" x="60" y="${mito.y + 30}">Matriz mitocondrial</text>
      <text class="fx-fase" x="60" y="118">Fase preparatoria</text>
      <text class="fx-fase__sub" x="60" y="134">se gastan 2 ATP</text>
      <text class="fx-fase" x="60" y="560">Fase de beneficio</text>
      <text class="fx-fase__sub" x="60" y="576">4 ATP y 2 NADH</text>
      <text class="fx-fase__sub" x="60" y="592">desde acá, todo por dos</text>
      <text class="fx-centro" x="${ANILLO.cx}" y="${ANILLO.cy - 4}" text-anchor="middle">Ciclo de Krebs</text>
      <text class="fx-centro__sub" x="${ANILLO.cx}" y="${ANILLO.cy + 14}" text-anchor="middle">3 NADH, 1 FADH₂ y 1 GTP por vuelta</text>
    </g>
    <g class="fx-reacciones">${REACCIONES.map(dibujarReaccion).join('')}</g>
    <g class="fx-nodos">${METABOLITOS.map(dibujarNodo).join('')}</g>`;
}

/* ── El mapa montado ───────────────────────────────────────────────────────── */

const K_MIN = 0.4, K_MAX = 2.4, K_LEGIBLE = 0.82;

/**
 * Monta el mapa en `host` (un contenedor con tamaño propio).
 *   onElegir({ tipo: 'rx' | 'met', id } | null)   lo que se tocó; null = el fondo
 * Devuelve { elegir, capa, encuadrar, acercar, llevar, destruir }.
 */
export function montarMapa(host, { onElegir, capa = 'ruta', vista = null } = {}) {
  host.innerHTML = `<svg class="fx-mapa" data-capa="${esc(capa)}" role="group" aria-label="Mapa metabólico">
    <g class="fx-mundo">${dibujar()}</g></svg>`;
  const svg = host.querySelector('svg');
  const mundo = host.querySelector('.fx-mundo');
  /* `fit`: el mapa está encuadrado y nadie lo movió. Mientras siga así, si la
     vista cambia de tamaño (el panel que entra, la ventana) se vuelve a
     encuadrar; en cuanto la persona lo mueve, se respeta lo que eligió. */
  const v = { k: 1, tx: 0, ty: 0, fit: true };
  let elegido = null;

  const tam = () => ({ w: host.clientWidth, h: host.clientHeight });

  /* El mapa no se puede perder: si es más chico que la ventana queda centrado;
     si es más grande, no se lo puede arrastrar más allá de un margen. */
  function acotar() {
    const { w, h } = tam();
    const mw = LIENZO.w * v.k, mh = LIENZO.h * v.k, m = 24;
    v.tx = mw + 2 * m <= w ? (w - mw) / 2 : Math.min(m, Math.max(w - mw - m, v.tx));
    v.ty = mh + 2 * m <= h ? (h - mh) / 2 : Math.min(m, Math.max(h - mh - m, v.ty));
  }

  /* `viajando` = un movimiento que decide la app (encuadrar, llevar, los
     botones): va con transición. Lo que sigue al dedo (rueda, arrastre) no. */
  function aplicar(viajando = false) {
    acotar();
    mundo.classList.toggle('is-viajando', viajando);
    mundo.style.transform = `translate(${n1(v.tx)}px, ${n1(v.ty)}px) scale(${Math.round(v.k * 1000) / 1000})`;
  }

  function encuadrar(viajando = true) {
    /* A lo ancho si entra sin achicar la letra de más; si no, a una escala
       legible y centrado: lo que queda afuera se alcanza arrastrando. */
    const { w } = tam();
    v.k = Math.min(1.1, Math.max(K_LEGIBLE, (w - 48) / LIENZO.w));
    v.tx = (w - LIENZO.w * v.k) / 2;
    v.ty = 24;
    v.fit = true;
    aplicar(viajando);
  }

  function acercar(factor, cx, cy, viajando = true) {
    const { w, h } = tam();
    const px = cx ?? w / 2, py = cy ?? h / 2;
    const k = Math.min(K_MAX, Math.max(K_MIN, v.k * factor));
    v.tx = px - ((px - v.tx) / v.k) * k;
    v.ty = py - ((py - v.ty) / v.k) * k;
    v.k = k;
    v.fit = false;
    aplicar(viajando);
  }

  /** Trae un punto del mapa a la vista si quedó afuera de la zona cómoda. */
  function llevarPunto(x, y) {
    const { w, h } = tam();
    const sx = x * v.k + v.tx, sy = y * v.k + v.ty;
    if (sx > w * 0.15 && sx < w * 0.85 && sy > h * 0.18 && sy < h * 0.82) return;
    v.tx = w / 2 - x * v.k;
    v.ty = h / 2 - y * v.k;
    v.fit = false;
    aplicar(true);
  }

  function llevar(tipo, id) {
    if (tipo === 'rx') {
      const g = svg.querySelector(`[data-rx="${id}"]`);
      if (g) llevarPunto(Number(g.dataset.mx), Number(g.dataset.my));
    } else {
      const m = metabolito(id);
      if (m) llevarPunto(m.x, m.y);
    }
  }

  function elegir(sel, { avisar = false } = {}) {
    elegido = sel && (sel.tipo === 'rx' ? REACCIONES.some((r) => r.id === sel.id) : !!metabolito(sel.id)) ? sel : null;
    svg.classList.toggle('hay-eleccion', !!elegido);
    const rx = elegido?.tipo === 'rx' ? REACCIONES.find((r) => r.id === elegido.id) : null;
    const vecinos = new Set(rx ? [...rx.de, ...rx.a] : []);
    svg.querySelectorAll('.fx-rx').forEach((g) => {
      const propia = rx && g.dataset.rx === rx.id;
      const toca = elegido?.tipo === 'met' && REACCIONES.some((r) => r.id === g.dataset.rx && (r.de.includes(elegido.id) || r.a.includes(elegido.id)));
      g.classList.toggle('is-elegida', !!propia);
      g.classList.toggle('is-vecina', !!toca);
    });
    svg.querySelectorAll('.fx-nodo').forEach((g) => {
      g.classList.toggle('is-elegido', elegido?.tipo === 'met' && g.dataset.met === elegido.id);
      g.classList.toggle('is-vecino', vecinos.has(g.dataset.met));
    });
    if (avisar) onElegir?.(elegido);
  }

  /* ── Entrada ──────────────────────────────────────────────────────────── */

  const desde = (e) => {
    const rx = e.target.closest?.('[data-rx]');
    if (rx) return { tipo: 'rx', id: rx.dataset.rx };
    const met = e.target.closest?.('[data-met]');
    return met ? { tipo: 'met', id: met.dataset.met } : null;
  };

  let arrastre = null, seMovio = false;
  const alBajar = (e) => {
    if (e.button !== 0) return;
    arrastre = { x: e.clientX, y: e.clientY, tx: v.tx, ty: v.ty, id: e.pointerId };
    seMovio = false;
  };
  const alMover = (e) => {
    if (!arrastre || e.pointerId !== arrastre.id) return;
    const dx = e.clientX - arrastre.x, dy = e.clientY - arrastre.y;
    if (!seMovio && Math.hypot(dx, dy) < 4) return;
    if (!seMovio) { seMovio = true; svg.setPointerCapture(arrastre.id); svg.classList.add('is-arrastrando'); }
    v.tx = arrastre.tx + dx;
    v.ty = arrastre.ty + dy;
    v.fit = false;
    aplicar(false);
  };
  const alSoltar = (e) => {
    if (!arrastre || e.pointerId !== arrastre.id) return;
    if (seMovio) svg.releasePointerCapture(arrastre.id);
    svg.classList.remove('is-arrastrando');
    arrastre = null;
  };
  const alClick = (e) => {
    if (seMovio) { seMovio = false; return; }   // fue un arrastre, no un click
    elegir(desde(e), { avisar: true });
  };
  const alTeclear = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const sel = desde(e);
      if (!sel) return;
      e.preventDefault();
      elegir(sel, { avisar: true });
    } else if (e.key === 'Escape' && elegido) {
      elegir(null, { avisar: true });
    }
  };
  const alRodar = (e) => {
    e.preventDefault();
    const caja = host.getBoundingClientRect();
    if (e.ctrlKey) {
      acercar(Math.exp(-e.deltaY * 0.0022), e.clientX - caja.left, e.clientY - caja.top, false);
    } else {
      v.tx -= e.shiftKey ? e.deltaY : e.deltaX;
      v.ty -= e.shiftKey ? 0 : e.deltaY;
      v.fit = false;
      aplicar(false);
    }
  };
  // Con Tab, lo enfocado puede estar fuera de la vista: se lo trae.
  const alEnfocar = (e) => {
    if (!e.target.matches?.(':focus-visible')) return;
    const sel = desde(e);
    if (sel) llevar(sel.tipo, sel.id);
  };

  svg.addEventListener('pointerdown', alBajar);
  svg.addEventListener('pointermove', alMover);
  svg.addEventListener('pointerup', alSoltar);
  svg.addEventListener('pointercancel', alSoltar);
  svg.addEventListener('click', alClick);
  svg.addEventListener('keydown', alTeclear);
  svg.addEventListener('focusin', alEnfocar);
  host.addEventListener('wheel', alRodar, { passive: false });

  const ro = new ResizeObserver(() => (v.fit ? encuadrar(false) : aplicar(false)));
  ro.observe(host);

  if (vista && Number.isFinite(vista.k)) { Object.assign(v, vista); aplicar(false); } else encuadrar(false);

  return {
    elegir,
    llevar,
    encuadrar,
    acercar: (factor) => acercar(factor),
    capa(c) { svg.dataset.capa = c; },
    vista: () => ({ ...v }),
    destruir() { ro.disconnect(); host.removeEventListener('wheel', alRodar); },
  };
}
