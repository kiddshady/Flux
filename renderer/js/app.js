/* ═══════════════════════════════════════════════════════════════════════════
   FLUX — la app
   Un mapa del metabolismo para estudiar Química Biológica: las rutas dibujadas,
   y al tocar una flecha, la ficha de su enzima tal como está en los apuntes.

   Dos vistas (el mapa y la lista de enzimas) y el panel derecho, que siempre
   muestra la ficha de lo elegido. Lo elegido y la capa viven acá, en S, y se
   guardan en los ajustes: al volver a abrir, la app está donde quedó.
   ═══════════════════════════════════════════════════════════════════════════ */

import { Icons } from './icons.js';
import { Tooltip, Toast, FieldMenu } from './overlays.js';
import Router from './router.js';
import { initClickFlash, initScrollFades, raf2, bindSwitcher, swap } from './motion.js';
import { esc, paint, head, empty, attempt, colorToken } from './ui.js';
import { Shell } from './shell.js';
import { REACCIONES, METABOLITOS, RUTAS, APUNTES, reaccion, metabolito, rasgos, etiquetaPaso } from './flux/datos.js';
import { montarMapa } from './flux/mapa.js';
import { fichaReaccion, fichaMetabolito, fichaResumen } from './flux/fichas.js';

const api = window.opal;

const CAPAS = [
  { id: 'ruta', label: 'Ruta', leyenda: [['fx-ley--linea', 'Reacción'], ['fx-ley--irr', 'Irreversible']] },
  { id: 'vias', label: 'Vías', leyenda: [['fx-ley--linea', 'Glucólisis y Krebs'], ['fx-ley--gng', 'Gluconeogénesis'], ['fx-ley--pen', 'Pentosas'], ['fx-ley--gno', 'Glucógeno'], ['fx-ley--box', 'Oxidación de ácidos grasos'], ['fx-ley--cet', 'Cuerpos cetónicos'], ['fx-ley--lip', 'Síntesis de ácidos grasos'], ['fx-ley--cad', 'Cadena respiratoria']] },
  { id: 'energia', label: 'Energía', leyenda: [['fx-ley--gasto', 'Gasta ATP, GTP o UTP'], ['fx-ley--atp', 'Forma ATP o GTP'], ['fx-ley--red', 'Da NADH, FADH₂ o NADPH'], ['fx-ley--h', 'Bombea H⁺']] },
  { id: 'regulacion', label: 'Regulación', leyenda: [['fx-ley--reg', 'Paso regulado']] },
  { id: 'inhibidores', label: 'Inhibidores', leyenda: [['fx-ley--inh', 'Tiene inhibidor o clínica']] },
];

const S = {
  info: null,
  settings: {},
  sel: null,        // { tipo: 'rx' | 'met', id } | null
  capa: 'ruta',
  vista: null,      // el encuadre del mapa, para volver a él al cambiar de vista
  busqueda: '',
};

let mapa = null;   // el mapa montado, mientras la vista Mapa está a la vista

const selValida = (s) => !!s && (s.tipo === 'rx' ? !!reaccion(s.id) : s.tipo === 'met' ? !!metabolito(s.id) : false);

function persist(patch) {
  return attempt(async () => { S.settings = await api.settings.save(patch); },
    { errorTitle: 'No se pudieron guardar los ajustes' });
}

/* ══ Elegir ══════════════════════════════════════════════════════════════════
   Un solo camino para todo lo que elige: el mapa, la lista, un enlace de la
   ficha. Así el mapa, la lista, el panel y la titlebar nunca quedan distintos. */

function elegir(sel, { llevar = false } = {}) {
  S.sel = selValida(sel) ? { tipo: sel.tipo, id: sel.id } : null;
  mapa?.elegir(S.sel);
  if (llevar && S.sel) mapa?.llevar(S.sel.tipo, S.sel.id);
  marcarLista();
  pintarPanel();
  updateChrome();
  persist({ sel: S.sel });
}

/* ══ Vista: Mapa ═════════════════════════════════════════════════════════════ */

const leyendaHTML = (capa) => (CAPAS.find((c) => c.id === capa) || CAPAS[0]).leyenda
  .map(([clase, texto]) => `<span class="fx-ley"><span class="fx-ley__marca ${clase}"></span>${esc(texto)}</span>`).join('');

function viewMapa() {
  paint(head({
    title: 'Mapa',
    sub: 'Glúcidos, lípidos, ciclo de Krebs y cadena respiratoria',
    actions: `<div class="op-segmented" id="fx-capas" aria-label="Capa">${CAPAS.map((c) =>
      `<button class="op-segmented__opt${c.id === S.capa ? ' is-active' : ''}" data-value="${c.id}">${esc(c.label)}</button>`).join('')}</div>`,
  }) + `
    <div class="fx-escena op-grow">
      <div class="fx-lienzo" id="fx-lienzo"></div>
      <div class="fx-leyenda" id="fx-leyenda">${leyendaHTML(S.capa)}</div>
      <div class="fx-zoom">
        <button class="op-iconbtn op-iconbtn--sm" data-zoom="menos" aria-label="Alejar" data-tip="Alejar"><i data-icon="zoomOut"></i></button>
        <button class="op-iconbtn op-iconbtn--sm" data-zoom="mas" aria-label="Acercar" data-tip="Acercar"><i data-icon="zoomIn"></i></button>
        <button class="op-iconbtn op-iconbtn--sm" data-zoom="todo" aria-label="Encuadrar" data-tip="Encuadrar"><i data-icon="fit"></i></button>
      </div>
    </div>`);

  mapa = montarMapa(document.getElementById('fx-lienzo'), {
    capa: S.capa,
    vista: S.vista,
    onElegir: (sel) => elegir(sel),
  });
  mapa.elegir(S.sel);
  if (S.sel && !S.vista) mapa.llevar(S.sel.tipo, S.sel.id);

  bindSwitcher(document.getElementById('fx-capas'), (capa) => {
    S.capa = capa;
    mapa?.capa(capa);
    swap(document.getElementById('fx-leyenda'), leyendaHTML(capa), { fundido: true });
    updateChrome();
    persist({ capa });
  });

  // Al irse de la vista: se guarda el encuadre y se sueltan los observadores.
  Router.onLeave(() => {
    if (!mapa) return;
    S.vista = mapa.vista();
    mapa.destruir();
    mapa = null;
  });
}

/* ══ Vista: Enzimas ══════════════════════════════════════════════════════════ */

const ORDEN_RUTAS = ['glucolisis', 'fermentacion', 'gluconeogenesis', 'pentosas', 'glucogeno', 'puente', 'anaplerotica', 'krebs', 'cadena', 'betaox', 'cetogenesis', 'lipogenesis'];

/** Minúsculas y sin acentos: «glucolisis» encuentra «Glucólisis». */
const plano = (s) => String(s).normalize('NFD').replace(/\p{Mn}/gu, '').toLowerCase();

function textoBuscable(r) {
  const mets = [...r.de, ...r.a].map((id) => metabolito(id).nombre);
  const inh = (r.inhibidores || []).map((i) => i.nombre);
  return plano([r.enzima, r.alias, r.tipo, RUTAS[r.ruta].nombre, ...mets, ...inh].filter(Boolean).join(' '));
}

function filaEnzima(r) {
  const g = rasgos(r);
  const de = r.de.map((id) => metabolito(id).corto || metabolito(id).nombre).join(' + ');
  const a = r.a.map((id) => metabolito(id).corto || metabolito(id).nombre).join(' + ');
  return `
    <div class="op-listitem fx-enz" role="button" tabindex="0" data-rx="${esc(r.id)}" data-busca="${esc(textoBuscable(r))}">
      <span class="fx-enz__n">${r.paso ?? ''}</span>
      <div class="op-listitem__main">
        <span class="op-listitem__title">${esc(r.enzima)}</span>
        <span class="op-listitem__sub fx-enz__rx">${esc(de)}${Icons.svg('arrowRight', 'op-icon--sm')}${esc(a)}</span>
      </div>
      <div class="op-listitem__aside">
        ${g.irreversible ? '<span class="op-chip fx-chip--reg">Irreversible</span>' : ''}
        ${g.regulada && !g.irreversible ? '<span class="op-chip fx-chip--reg">Regulada</span>' : ''}
        ${g.inhibida ? '<span class="op-chip fx-chip--inh">Inhibidor</span>' : ''}
      </div>
    </div>`;
}

function viewEnzimas() {
  const grupos = ORDEN_RUTAS.map((ruta) => {
    const rs = REACCIONES.filter((r) => r.ruta === ruta);
    return `<div class="fx-grupo" data-grupo="${ruta}">
      <div class="op-eyebrow fx-grupo__titulo">${esc(RUTAS[ruta].nombre)} <span class="op-dim">${esc(RUTAS[ruta].lugar)}</span></div>
      <div class="op-list">${rs.map(filaEnzima).join('')}</div></div>`;
  }).join('');

  paint(head({
    title: 'Enzimas',
    sub: `${REACCIONES.length} reacciones, en el orden de cada ruta`,
    actions: `<div class="op-inputwrap fx-buscar">${Icons.svg('search')}
      <input class="op-input" id="fx-buscar" placeholder="Buscar enzima, metabolito o inhibidor" spellcheck="false" value="${esc(S.busqueda)}"></div>`,
  }) + `
    <div class="op-scroll op-grow" id="fx-enzimas">
      ${grupos}
      <div class="fx-nada" id="fx-nada" hidden>Ninguna enzima coincide con la búsqueda.</div>
      <div style="height:24px"></div>
    </div>`);

  document.getElementById('fx-buscar').addEventListener('input', (e) => {
    S.busqueda = e.target.value;
    filtrar(true);
  });
  filtrar(false);
  marcarLista();
}

/* Filtrar pliega y despliega filas: una lista que cambia de golpe no deja ver
   qué se fue. Cada fila anima su propio alto; nada se desmonta. */
function plegar(el, fuera, animado) {
  if (!el || el.hidden === fuera) return;
  el.getAnimations().forEach((a) => a.cancel());
  if (!animado) { el.hidden = fuera; return; }
  if (fuera) {
    const alto = el.offsetHeight;
    el.style.overflow = 'hidden';
    const anim = el.animate([{ height: `${alto}px`, opacity: 1 }, { height: '0px', opacity: 0 }],
      { duration: 160, easing: 'cubic-bezier(.65, 0, .35, 1)' });
    anim.onfinish = () => { el.hidden = true; el.style.overflow = ''; };
    anim.oncancel = () => { el.style.overflow = ''; };
  } else {
    el.hidden = false;
    const alto = el.offsetHeight;
    el.style.overflow = 'hidden';
    const anim = el.animate([{ height: '0px', opacity: 0 }, { height: `${alto}px`, opacity: 1 }],
      { duration: 220, easing: 'cubic-bezier(.16, 1, .3, 1)' });
    anim.onfinish = anim.oncancel = () => { el.style.overflow = ''; };
  }
}

function filtrar(animado) {
  const caja = document.getElementById('fx-enzimas');
  if (!caja) return;
  const q = plano(S.busqueda.trim());
  let total = 0;
  caja.querySelectorAll('.fx-grupo').forEach((grupo) => {
    let enGrupo = 0;
    grupo.querySelectorAll('.fx-enz').forEach((fila) => {
      const va = !q || fila.dataset.busca.includes(q);
      if (va) enGrupo++;
      plegar(fila, !va, animado);
    });
    total += enGrupo;
    plegar(grupo, enGrupo === 0, animado);
  });
  plegar(document.getElementById('fx-nada'), total > 0, animado);
}

function marcarLista() {
  document.querySelectorAll('.fx-enz').forEach((fila) =>
    fila.classList.toggle('is-selected', S.sel?.tipo === 'rx' && fila.dataset.rx === S.sel.id));
}

/* ══ El panel derecho: la ficha ══════════════════════════════════════════════
   Siempre prendido. Al cambiar de ficha, la vieja se apaga y la nueva asoma:
   son dos textos distintos en el mismo lugar, no se cruzan. */

let fichaEnPanel = null;

function fichaActual() {
  const enMapa = Router.name === 'mapa';
  if (S.sel?.tipo === 'rx') return { clave: `rx:${S.sel.id}:${enMapa}`, ...fichaReaccion(reaccion(S.sel.id), { enMapa }) };
  if (S.sel?.tipo === 'met') return { clave: `met:${S.sel.id}:${enMapa}`, ...fichaMetabolito(metabolito(S.sel.id), { enMapa }) };
  return { clave: 'resumen', ...fichaResumen() };
}

function ponerFicha(p, f) {
  p.innerHTML = `<div class="op-panel__swap fx-ficha">
    <div class="op-panel__head"><div style="min-width:0">
      <div class="op-panel__title fx-ficha__titulo">${esc(f.titulo)}</div>
      <div class="op-panel__sub">${esc(f.sub)}</div>
    </div></div>
    <div class="op-panel__body op-scroll">${f.cuerpo}</div>
    ${f.pie ? `<div class="op-panel__foot fx-pie">${f.pie}</div>` : ''}
  </div>`;
  Icons.mount(p);
  initScrollFades(p);
}

function pintarPanel() {
  const p = document.getElementById('panel');
  if (!p) return;
  const f = fichaActual();
  if (f.clave === fichaEnPanel) return;
  const primera = fichaEnPanel === null;
  fichaEnPanel = f.clave;

  const vieja = p.firstElementChild;
  if (primera || !vieja) { ponerFicha(p, f); return; }
  const sale = vieja.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 90, easing: 'cubic-bezier(.65, 0, .35, 1)', fill: 'forwards' });
  sale.onfinish = sale.oncancel = () => {
    if (fichaEnPanel !== f.clave) return;   // ya se pidió otra: esa gana
    ponerFicha(p, f);
    p.firstElementChild.animate([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }],
      { duration: 220, easing: 'cubic-bezier(.16, 1, .3, 1)' });
  };
}

async function abrirApunte(unidad) {
  const ap = APUNTES[unidad];
  if (!ap) return;
  await attempt(() => api.apunte.abrir(ap.pdf), { errorTitle: 'No se pudo abrir el apunte' });
}

/* ══ Router ══════════════════════════════════════════════════════════════════ */

Router.define({
  mapa: { view: viewMapa },
  enzimas: { view: viewEnzimas },
}, document.getElementById('view'));

/* ══ Shell ═══════════════════════════════════════════════════════════════════ */

function wireShell() {
  const w = api?.win;
  document.getElementById('win-min')?.addEventListener('click', () => w?.minimize());
  document.getElementById('win-close')?.addEventListener('click', () => w?.close());
  const maxBtn = document.getElementById('win-max');
  maxBtn?.addEventListener('click', () => w?.toggleMaximize());
  w?.onMaximized((isMax) => {
    maxBtn.classList.toggle('is-b', isMax);
    maxBtn.setAttribute('aria-label', isMax ? 'Restaurar' : 'Maximizar');
  });

  document.querySelectorAll('.op-navitem').forEach((b) =>
    b.addEventListener('click', () => Router.go(b.dataset.view)));

  /* Delegación global: las vistas y el panel se repintan enteros, así que el
     cableado se hace una sola vez y sobrevive a cualquier innerHTML. */
  document.addEventListener('click', (e) => {
    const irRx = e.target.closest('[data-ir-rx]');
    if (irRx) { elegir({ tipo: 'rx', id: irRx.dataset.irRx }, { llevar: true }); return; }

    const irMet = e.target.closest('[data-ir-met]');
    if (irMet) { elegir({ tipo: 'met', id: irMet.dataset.irMet }, { llevar: true }); return; }

    const fila = e.target.closest('.fx-enz');
    if (fila) { elegir({ tipo: 'rx', id: fila.dataset.rx }); return; }

    if (e.target.closest('[data-ver-mapa]')) { S.vista = null; Router.go('mapa'); return; }

    const ap = e.target.closest('[data-apunte]');
    if (ap) { abrirApunte(ap.dataset.apunte); return; }

    const z = e.target.closest('[data-zoom]');
    if (z && mapa) {
      if (z.dataset.zoom === 'mas') mapa.acercar(1.3);
      if (z.dataset.zoom === 'menos') mapa.acercar(1 / 1.3);
      if (z.dataset.zoom === 'todo') mapa.encuadrar();
    }
  });

  document.addEventListener('keydown', (e) => {
    // Enter y Espacio sobre una fila de la lista: usable sin mouse.
    if (e.key === 'Enter' || e.key === ' ') {
      const fila = e.target.closest?.('.fx-enz');
      if (fila && e.target === fila) { e.preventDefault(); elegir({ tipo: 'rx', id: fila.dataset.rx }); }
      return;
    }
    // Ctrl+F lleva a buscar, desde donde sea.
    if (e.key.toLowerCase() === 'f' && e.ctrlKey && !e.altKey) {
      e.preventDefault();
      if (Router.name !== 'enzimas') Router.go('enzimas');
      raf2(() => document.getElementById('fx-buscar')?.focus());
    }
  });
}

/** Todo lo que vive fuera de la vista: statusbar y contexto de la titlebar. */
function updateChrome() {
  document.getElementById('stat-rx').textContent = REACCIONES.length;
  document.getElementById('stat-met').textContent = METABOLITOS.length;
  const capa = CAPAS.find((c) => c.id === S.capa) || CAPAS[0];
  const pie = document.getElementById('rail-foot');
  if (pie && S.info) pie.innerHTML = `<span class="op-meta">Química Biológica · U5, U7 y U8</span><span class="op-meta op-dim">v${esc(S.info.version)}</span>`;
  swap(document.getElementById('stat-capa'), esc(capa.label), { fundido: true });

  let html = '';
  if (S.sel?.tipo === 'rx') {
    const r = reaccion(S.sel.id);
    html = `<span>${esc(r.enzima)}</span><span class="op-dim">${esc(etiquetaPaso(r))}</span>`;
  } else if (S.sel?.tipo === 'met') {
    html = `<span>${esc(metabolito(S.sel.id).nombre)}</span>`;
  }
  swap(document.getElementById('titlebar-context'), html, { fundido: true });
}

/* --op-bg está en oklch y Electron solo entiende hex: se resuelve acá y se le
   manda al proceso principal (el porqué, en ui.js). */
function syncWindowColor() {
  const hex = colorToken('--op-bg');
  if (hex) api?.win?.setBackground(hex);
}

/* Un archivo de datos ilegible se aparta (store.cjs) y la app arranca sin él.
   Sin este aviso, para la persona sus datos simplemente desaparecieron. */
async function tellAsides() {
  const list = await api.asides().catch(() => []);
  if (!list.length) return;
  const files = [...new Set(list.map((a) => a.file))];
  Toast.show({
    tone: 'error',
    duration: 0,
    title: files.length === 1 ? `${files[0]} estaba dañado` : `${files.join(', ')} estaban dañados`,
    text: `${files.length === 1 ? 'Quedó' : 'Quedaron'} aparte en la carpeta de datos, con «.corrupto-» en el nombre, y la app arrancó sin ${files.length === 1 ? 'él' : 'ellos'}.`,
  });
}

/* ══ Actualización ═══════════════════════════════════════════════════════════
   La descarga la maneja el proceso principal (src/update.cjs) y avisa recién
   cuando el instalador ya está bajado. Acá solo se ofrece la decisión. Sin
   duración: se queda hasta que decidas; si lo ignorás, la versión nueva se
   instala igual la próxima vez que cierres la app. */
function avisarUpdate(info) {
  if (!info?.version) return;
  Toast.show({
    title: `Flux ${info.version} está lista`,
    text: 'Se instala sola al cerrar la app. O reiniciá ahora y la usás ya.',
    icon: 'download',
    duration: 0,
    actions: [
      { label: 'Después' },
      { label: 'Reiniciar', variant: 'primary', onSelect: () => api.update.install() },
    ],
  });
}

/* ══ Arranque ════════════════════════════════════════════════════════════════ */

async function boot() {
  Icons.mount(document);
  Tooltip.init();
  FieldMenu.init();
  initClickFlash();
  initScrollFades();
  Shell.init();
  wireShell();
  syncWindowColor();

  try {
    [S.info, S.settings] = await Promise.all([api.info(), api.settings.get()]);
  } catch (err) {
    paint(empty({ icon: 'alert', title: 'No se pudo iniciar', text: err.message }));
    console.error(err);
    return;
  }

  S.capa = CAPAS.some((c) => c.id === S.settings.capa) ? S.settings.capa : 'ruta';
  S.sel = selValida(S.settings.sel) ? S.settings.sel : null;

  Shell.set({ panel: true });
  updateChrome();
  Router.onChange(pintarPanel);
  Router.go('mapa');
  pintarPanel();
  tellAsides();
  api.update?.onReady(avisarUpdate);
  api.update?.pending().then(avisarUpdate).catch(() => {});

  // El splash se va recién cuando ya hay algo pintado debajo.
  raf2(() => {
    const splash = document.getElementById('boot-splash');
    if (!splash) return;
    splash.style.opacity = '0';
    splash.addEventListener('transitionend', () => splash.remove(), { once: true });
    setTimeout(() => splash.remove(), 600);
  });
}

boot();
