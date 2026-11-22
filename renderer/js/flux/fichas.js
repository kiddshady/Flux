/* ═══════════════════════════════════════════════════════════════════════════
   FLUX — las fichas
   El HTML de lo que muestra el panel derecho: la ficha de una reacción (con su
   enzima), la de un metabolito, y el resumen de balances cuando no hay nada
   elegido. Solo arma texto: el panel lo pinta y lo cablea app.js.
   ═══════════════════════════════════════════════════════════════════════════ */

import { Icons } from '../icons.js';
import { esc } from '../ui.js';
import {
  RUTAS, APUNTES, BALANCES, RENDIMIENTO, REACCIONES, METABOLITOS,
  metabolito, vecinas, etiquetaPaso, lugarDe,
} from './datos.js';

const flecha = () => Icons.svg('arrowRight', 'op-icon--sm fx-ec__flecha');
const plus = () => '<span class="fx-plus" data-tip="Excede a la cátedra">plus</span>';

const bloque = (titulo, cuerpo) => (cuerpo
  ? `<section class="fx-bloque"><div class="op-eyebrow fx-bloque__titulo">${esc(titulo)}</div>${cuerpo}</section>` : '');

const lista = (items) => (items && items.length
  ? `<ul class="fx-lista">${items.map((n) => `<li>${n.plus ? plus() : ''}${esc(n.t ?? n)}</li>`).join('')}</ul>` : '');

const enlaceMet = (id) => {
  const m = metabolito(id);
  return `<button class="fx-enlace" data-ir-met="${esc(id)}">${esc(m.corto || m.nombre)}</button>`;
};

const filaRx = (r) => `
  <button class="fx-fila" data-ir-rx="${esc(r.id)}">
    <span class="fx-fila__n">${r.paso ?? ''}</span>
    <span class="fx-fila__texto"><span class="fx-fila__titulo">${esc(r.enzima)}</span>
    <span class="fx-fila__sub">${esc(RUTAS[r.ruta].nombre)}</span></span>
  </button>`;

/** Sustratos y productos, con lo que se gasta y lo que se forma al lado. */
function ecuacion(r) {
  const lado = (mets, extras) => [
    ...mets.map(enlaceMet),
    ...(extras || []).map((x) => `<span class="fx-ec__cof">${esc(x)}</span>`),
  ].join('<span class="fx-ec__mas">+</span>');
  return `<div class="fx-ec">
    <div class="fx-ec__lado">${lado(r.de, r.gasta)}</div>
    ${flecha()}
    <div class="fx-ec__lado">${lado(r.a, r.forma)}</div>
  </div>`;
}

function pieApunte(ruta) {
  const R = RUTAS[ruta];
  const ap = APUNTES[R.unidad];
  return `<button class="op-btn op-btn--secondary op-flashable fx-pie__btn" data-apunte="${esc(R.unidad)}">
      <i data-icon="book"></i> Abrir el apunte</button>
    <div class="op-meta fx-pie__donde">${esc(ap.titulo)} · ${esc(R.seccion)}</div>`;
}

export function fichaReaccion(r, { enMapa = true } = {}) {
  const R = RUTAS[r.ruta];
  const chips = [
    r.irreversible ? '<span class="op-chip fx-chip--reg">Irreversible</span>' : '',
    r.reversible ? '<span class="op-chip">Reversible</span>' : '',
    r.regulada ? '<span class="op-chip fx-chip--reg">Regulada</span>' : '',
    `<span class="op-chip">${esc(lugarDe(r))}</span>`,
  ].join('');

  const reg = r.regulacion;
  const regulacion = reg ? [
    reg.inhiben?.length ? `<div class="fx-par"><span class="fx-par__k">La inhiben</span><span class="fx-par__v">${reg.inhiben.map(esc).join(', ')}</span></div>` : '',
    reg.activan?.length ? `<div class="fx-par"><span class="fx-par__k">La activan</span><span class="fx-par__v">${reg.activan.map(esc).join(', ')}</span></div>` : '',
    reg.activanPlus?.length ? `<div class="fx-par"><span class="fx-par__k">La activan ${plus()}</span><span class="fx-par__v">${reg.activanPlus.map(esc).join(', ')}</span></div>` : '',
    lista(reg.notas),
  ].join('') : '';

  const inhibidores = r.inhibidores?.length
    ? r.inhibidores.map((i) => `<div class="fx-inh"><div class="fx-inh__nombre">${i.plus ? plus() : ''}${esc(i.nombre)}</div><div class="fx-inh__texto">${esc(i.t)}</div></div>`).join('')
    : '';

  return {
    titulo: r.enzima,
    sub: etiquetaPaso(r),
    cuerpo: `
      ${ecuacion(r)}
      <div class="fx-chips">${chips}</div>
      ${bloque('Tipo de reacción', `<p class="fx-texto">${esc(r.tipo)}${r.tipoPlus ? ` ${plus()}<span class="op-dim">${esc(r.tipoPlus)}</span>` : ''}</p>`
        + (r.alias ? `<p class="fx-texto op-dim">También: ${esc(r.alias)}</p>` : ''))}
      ${bloque('Lo importante', lista(r.notas))}
      ${bloque('Regulación', regulacion)}
      ${bloque('Inhibidores y clínica', inhibidores)}`,
    pie: (enMapa ? '' : `<button class="op-btn op-btn--primary op-flashable fx-pie__btn" data-ver-mapa><i data-icon="target"></i> Ver en el mapa</button>`)
      + pieApunte(r.ruta),
  };
}

export function fichaMetabolito(m, { enMapa = true } = {}) {
  const { loForman, loConsumen } = vecinas(m.id);
  const ruta = (loForman[0] || loConsumen[0])?.ruta || 'glucolisis';
  return {
    titulo: m.nombre,
    sub: `${m.c} carbono${m.c === 1 ? '' : 's'}`,
    cuerpo: `
      ${bloque('Lo forma', loForman.map(filaRx).join(''))}
      ${bloque('Lo consume', loConsumen.map(filaRx).join(''))}
      ${bloque('Sale hacia las síntesis', lista(m.salidas))}
      ${bloque('Lo reponen', lista(m.llegadas))}
      ${bloque('Lo importante', lista(m.notas))}`,
    pie: (enMapa ? '' : `<button class="op-btn op-btn--primary op-flashable fx-pie__btn" data-ver-mapa><i data-icon="target"></i> Ver en el mapa</button>`)
      + pieApunte(ruta),
  };
}

export function fichaResumen() {
  const balances = BALANCES.map((b) => bloque(b.titulo, `
    <div class="fx-ec fx-ec--texto">
      <div class="fx-ec__lado">${esc(b.ecuacion[0])}</div>${flecha()}<div class="fx-ec__lado">${esc(b.ecuacion[1])}</div>
    </div>${lista(b.notas)}`)).join('');

  const filas = RENDIMIENTO.filas.map((f) => `
    <div class="fx-rend__fila"><span class="fx-rend__que"><span>${esc(f[0])}</span><span class="op-dim">${esc(f[1])}</span></span>
    <span class="fx-rend__n op-num">${esc(f[2])}</span></div>`).join('');

  return {
    titulo: 'Metabolismo de los glúcidos',
    sub: `${REACCIONES.length} reacciones · ${METABOLITOS.length} metabolitos`,
    cuerpo: `
      <p class="fx-texto op-dim">Tocá una flecha para ver su enzima, o un metabolito para ver qué lo forma y qué lo consume.</p>
      ${balances}
      ${bloque('Rendimiento por glucosa', `<div class="fx-rend">${filas}
        <div class="fx-rend__fila fx-rend__fila--total"><span class="fx-rend__que"><span>${esc(RENDIMIENTO.total)}</span>
        <span class="op-dim">${esc(RENDIMIENTO.clasico)}</span></span></div></div>
        <p class="fx-texto op-dim">${esc(RENDIMIENTO.nota)}</p>`)}`,
    pie: '',
  };
}
