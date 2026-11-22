/* ═══════════════════════════════════════════════════════════════════════════
   Humo de Flux: monta la app de verdad y la recorre.
   `npm run smoke`. Con FLUX_SHOTS=<carpeta> además guarda capturas.

   Mide lo que un test de unidad no ve: que el mapa dibuje todo, que nada se
   encime, que elegir llegue al panel, que las capas pinten y que la lista
   filtre. Los datos del humo van a una carpeta propia que se borra al final.
   ═══════════════════════════════════════════════════════════════════════════ */

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

const ROOT = path.join(__dirname, '..');
const OWN_DATA = !process.env.FLUX_DATA;
if (OWN_DATA) process.env.FLUX_DATA = fs.mkdtempSync(path.join(os.tmpdir(), 'flux-humo-'));
const SHOTS = process.env.FLUX_SHOTS || '';
const W = 1440; const H = 900;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let pass = 0; let fail = 0;
const ok = (n, c, x = '') => { if (c) { pass++; console.log(`  ok   ${n}`); } else { fail++; console.log(`  FALLA ${n} ${x}`); } };
const bail = (w, e) => { console.log(`ABORTADO ${w}`, e?.stack || e || ''); app.exit(3); };
process.on('unhandledRejection', (e) => bail('rechazo', e));
process.on('uncaughtException', (e) => bail('excepción', e));
setTimeout(() => bail('timeout de 120s'), 120000);

app.whenReady().then(async () => {
  require(path.join(ROOT, 'src', 'ipc.cjs')).register();
  // El humo no abre el lector de PDF de nadie: anota qué se pidió.
  const abiertos = [];
  ipcMain.removeHandler('apunte:abrir');
  ipcMain.handle('apunte:abrir', (_e, rel) => { abiertos.push(rel); return { ok: true, data: true }; });

  const win = new BrowserWindow({
    x: -20000, y: -20000, width: W, height: H,
    frame: false, show: false, paintWhenInitiallyHidden: true, backgroundColor: '#000',
    webPreferences: { preload: path.join(ROOT, 'preload.cjs'), contextIsolation: true },
  });
  const errores = [];
  win.webContents.on('console-message', (e) => { if (e.level === 'warning' || e.level === 'error') errores.push(`${e.level}: ${e.message}`); });
  await win.loadFile(path.join(ROOT, 'renderer', 'index.html'));
  win.show();
  await sleep(2000);

  const js = (c) => win.webContents.executeJavaScript(c);
  const click = (sel) => js(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) return false;
    el.dispatchEvent(new MouseEvent('click', { bubbles: true })); return true; })()`);
  const foto = async (nombre) => {
    if (!SHOTS) return;
    fs.mkdirSync(SHOTS, { recursive: true });
    fs.writeFileSync(path.join(SHOTS, `${nombre}.png`), (await win.webContents.capturePage()).toPNG());
  };

  const datos = await js(`import('./js/flux/datos.js').then((d) => ({ rx: d.REACCIONES.length, met: d.METABOLITOS.length,
    huerfanos: d.REACCIONES.flatMap((r) => [...r.de, ...r.a]).filter((id) => !d.metabolito(id)),
    cuenta: d.REACCIONES.reduce((n, r) => { const g = d.rasgos(r); for (const k in g) if (g[k]) n[k] = (n[k] || 0) + 1; return n; }, {}),
    sueltos: d.METABOLITOS.filter((m) => !d.REACCIONES.some((r) => r.de.includes(m.id) || r.a.includes(m.id))).map((m) => m.id) }))`);

  console.log('\n1. Arranque');
  ok('el splash se fue', !(await js(`!!document.getElementById('boot-splash')`)));
  ok('los <i data-icon> se reemplazaron por SVG', !(await js(`!!document.querySelector('i[data-icon]')`)));
  ok('el rail marca Mapa', await js(`!!document.querySelector('[data-view="mapa"].is-active')`));
  ok('el panel está prendido y muestra el resumen', await js(`document.querySelector('.op-app').classList.contains('con-panel') && document.querySelector('.op-panel__title').textContent.includes('glúcidos')`));

  console.log('\n2. Los datos cierran');
  ok('toda reacción apunta a metabolitos que existen', datos.huerfanos.length === 0, datos.huerfanos.join());
  ok('ningún metabolito queda suelto', datos.sueltos.length === 0, datos.sueltos.join());

  console.log('\n3. El mapa dibuja todo');
  const dib = await js(`({ rx: document.querySelectorAll('.fx-rx').length, met: document.querySelectorAll('.fx-nodo').length,
    nan: document.querySelector('.fx-mapa').innerHTML.includes('NaN') })`);
  ok(`las ${datos.rx} reacciones`, dib.rx === datos.rx, dib.rx);
  ok(`los ${datos.met} metabolitos`, dib.met === datos.met, dib.met);
  ok('sin coordenadas rotas', !dib.nan);
  const choques = await js(`(() => {
    const cajas = [...document.querySelectorAll('.fx-nodo rect, .fx-enzima, .fx-cof, .fx-fase, .fx-fase__sub, .fx-lugar, .fx-centro, .fx-centro__sub')].map((el) => {
      const b = el.getBoundingClientRect();
      return { t: (el.closest('[data-met]')?.dataset.met || el.textContent).slice(0, 34), l: b.left, r: b.right, a: b.top, b: b.bottom };
    });
    const mal = [];
    for (let i = 0; i < cajas.length; i++) for (let j = i + 1; j < cajas.length; j++) {
      const p = cajas[i], q = cajas[j];
      if (Math.min(p.r, q.r) - Math.max(p.l, q.l) > 1 && Math.min(p.b, q.b) - Math.max(p.a, q.a) > 1) mal.push(p.t + ' / ' + q.t);
    }
    return mal;
  })()`);
  ok('ningún rótulo se encima con otro ni con una pastilla', choques.length === 0, `\n      ${choques.join('\n      ')}`);
  const textos = await js(`(() => {
    const mal = [];
    document.querySelectorAll('.fx-nodo').forEach((g) => {
      const r = g.querySelector('rect').getBoundingClientRect(), t = g.querySelector('text').getBoundingClientRect();
      if (t.left < r.left + 4 || t.right > r.right - 4) mal.push(g.dataset.met);
    });
    return mal;
  })()`);
  const pisados = await js(`(() => {
    // un rótulo tampoco puede caer sobre una flecha: se mide el centro de cada texto contra los tramos
    const mal = [];
    const tramos = [...document.querySelectorAll('.fx-tramo')];
    document.querySelectorAll('.fx-enzima, .fx-cof').forEach((t) => {
      const b = t.getBoundingClientRect();
      for (const tr of tramos) {
        const L = tr.getTotalLength(), m = tr.getScreenCTM();
        for (let d = 0; d <= L; d += 4) {
          const p = tr.getPointAtLength(d).matrixTransform(m);
          if (p.x > b.left + 2 && p.x < b.right - 2 && p.y > b.top + 2 && p.y < b.bottom - 2) { mal.push(t.textContent.slice(0, 30) + ' / flecha de ' + tr.closest('[data-rx]').dataset.rx); return; }
        }
      }
    });
    return mal;
  })()`);
  ok('ningún rótulo cae sobre una flecha', pisados.length === 0, `\n      ${pisados.join('\n      ')}`);
  ok('cada nombre entra en su pastilla', textos.length === 0, textos.join());
  // El recuadro de la mitocondria ocupa casi todo el ancho del lienzo: sirve de regla.
  const medirAncho = () => js(`(() => { const m = document.querySelector('.fx-mito').getBoundingClientRect(); const l = document.getElementById('fx-lienzo').getBoundingClientRect();
    return { izq: Math.round(m.left - l.left), der: Math.round(l.right - m.right) }; })()`);
  const ancho = await medirAncho();
  const letra = await js(`document.querySelector('.fx-nodo text').getBoundingClientRect().height`);
  ok('encuadrado: el mapa queda centrado y la letra se lee', Math.abs(ancho.izq - ancho.der) <= 2 && ancho.izq > -60 && letra >= 11, JSON.stringify({ ...ancho, letra }));
  await foto('1-mapa');

  console.log('\n4. Elegir una reacción');
  await click('[data-rx="pfk1"] .fx-zona');
  await sleep(500);
  ok('la ficha es la de la PFK-1', (await js(`document.querySelector('.op-panel__title').textContent`)) === 'Fosfofructoquinasa-1');
  ok('la flecha queda marcada y el resto se retira', await js(`document.querySelector('[data-rx="pfk1"]').classList.contains('is-elegida') && getComputedStyle(document.querySelector('[data-rx="hk"]')).opacity < 0.6`));
  ok('sus dos metabolitos quedan como vecinos', (await js(`document.querySelectorAll('.fx-nodo.is-vecino').length`)) === 2);
  ok('la titlebar dice qué está elegido', (await js(`document.getElementById('titlebar-context').textContent`)).includes('Fosfofructoquinasa-1'));
  ok('la ficha trae regulación', (await js(`document.querySelector('.op-panel__body').textContent`)).includes('Fructosa-2,6-bisfosfato'));
  ok('el botón del apunte se ve entero', (await js(`document.querySelector('[data-apunte]').getBoundingClientRect().height`)) >= 26);
  await foto('2-pfk1');
  await click('[data-apunte]');
  await sleep(150);
  ok('«Abrir el apunte» pide el PDF de la U7', abiertos.length === 1 && abiertos[0].startsWith('U7 ') && abiertos[0].endsWith('.pdf'), abiertos.join());

  console.log('\n5. De la ficha a un metabolito y a otra reacción');
  await click('.fx-ec [data-ir-met="f16bp"]');
  await sleep(500);
  ok('la ficha pasa al metabolito', (await js(`document.querySelector('.op-panel__title').textContent`)) === 'Fructosa-1,6-bisfosfato');
  ok('lista quién lo forma y quién lo consume', (await js(`document.querySelectorAll('.op-panel__body [data-ir-rx]').length`)) === 3);
  await click('.op-panel__body [data-ir-rx="aldolasa"]');
  await sleep(500);
  ok('y de ahí a la aldolasa', (await js(`document.querySelector('.op-panel__title').textContent`)) === 'Aldolasa');

  console.log('\n6. Capas');
  for (const [capa, sel, n] of [['vias', '.fx-rx--gluconeogenesis', 5], ['energia', '.fx-rx.gasta-atp', datos.cuenta.gastaAtp], ['regulacion', '.fx-rx.es-regulada', datos.cuenta.regulada], ['inhibidores', '.fx-rx.tiene-inhibidor', datos.cuenta.inhibida]]) {
    await click(`#fx-capas [data-value="${capa}"]`);
    await sleep(450);
    const r = await js(`({ capa: document.querySelector('.fx-mapa').dataset.capa, n: document.querySelectorAll(${JSON.stringify(sel)}).length,
      color: getComputedStyle(document.querySelector(${JSON.stringify(`${sel} .fx-tramo`)})).stroke, base: getComputedStyle(document.querySelector('[data-rx="pgi"] .fx-tramo')).stroke })`);
    ok(`${capa}: ${n} flechas pintadas de su color`, r.capa === capa && r.n === n && r.color !== r.base, JSON.stringify(r));
    await foto(`3-capa-${capa}`);
  }
  ok('la statusbar acompaña la capa', (await js(`document.getElementById('stat-capa').textContent`)).includes('Inhibidores'));

  console.log('\n7. Moverse por el mapa');
  const antes = await js(`document.querySelector('.fx-mundo').style.transform`);
  await click('[data-zoom="mas"]');
  await sleep(600);
  const cerca = await js(`document.querySelector('.fx-mundo').style.transform`);
  ok('acercar cambia la escala', antes !== cerca, cerca);
  await js(`document.querySelector('.fx-mapa').dispatchEvent(new MouseEvent('click', { bubbles: true }))`);
  await sleep(400);
  ok('click en el fondo suelta la elección', await js(`!document.querySelector('.fx-mapa').classList.contains('hay-eleccion') && document.querySelector('.op-panel__title').textContent.includes('glúcidos')`));
  await click('[data-zoom="todo"]');
  await sleep(600);
  const vuelta = await medirAncho();
  ok('encuadrar lo vuelve a centrar', Math.abs(vuelta.izq - vuelta.der) <= 2, JSON.stringify(vuelta));

  console.log('\n8. La lista de enzimas');
  await click('[data-view="enzimas"]');
  await sleep(700);
  ok('lista las reacciones', (await js(`document.querySelectorAll('.fx-enz').length`)) === datos.rx);
  await js(`(() => { const i = document.getElementById('fx-buscar'); i.value = 'malonato'; i.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  await sleep(500);
  const filtradas = await js(`[...document.querySelectorAll('.fx-enz')].filter((f) => !f.hidden).map((f) => f.dataset.rx)`);
  ok('buscar un inhibidor deja su enzima', filtradas.length === 1 && filtradas[0] === 'sdh', filtradas.join());
  ok('los grupos vacíos se pliegan', (await js(`[...document.querySelectorAll('.fx-grupo')].filter((g) => !g.hidden).length`)) === 1);
  await click('.fx-enz[data-rx="sdh"]');
  await sleep(500);
  ok('elegir en la lista llena la ficha', (await js(`document.querySelector('.op-panel__title').textContent`)) === 'Succinato deshidrogenasa');
  await foto('4-enzimas');
  await click('[data-ver-mapa]');
  await sleep(900);
  const enVista = await js(`(() => { const g = document.querySelector('[data-rx="sdh"] .fx-insignia').getBoundingClientRect(); const l = document.getElementById('fx-lienzo').getBoundingClientRect();
    return g.top > l.top && g.bottom < l.bottom && g.left > l.left && g.right < l.right; })()`);
  ok('«Ver en el mapa» lleva a la enzima y la deja a la vista', enVista && await js(`document.querySelector('[data-rx="sdh"]').classList.contains('is-elegida')`));
  await foto('5-sdh-en-el-mapa');

  console.log('\n9. Lo elegido se guarda');
  const guardado = await js(`window.opal.settings.get()`);
  ok('la elección y la capa quedaron en los ajustes', guardado.sel?.id === 'sdh' && guardado.capa === 'inhibidores', JSON.stringify(guardado));

  console.log('\n10. Ni un glifo');
  const glifos = await js(`(document.body.innerText.match(/[\\u2190-\\u21ff\\u2700-\\u27bf\\u25a0-\\u25ff\\u{1f300}-\\u{1faff}]/gu) || []).join('')`);
  ok('no hay flechas ni símbolos unicode en pantalla', glifos === '', glifos);

  if (OWN_DATA) fs.rmSync(process.env.FLUX_DATA, { recursive: true, force: true });
  console.log(`\n═══ ${pass} ok · ${fail} fallas ═══`);
  console.log(errores.length ? `CONSOLA:\n  ${errores.join('\n  ')}` : 'CONSOLA: limpia');
  app.exit(fail || errores.length ? 1 : 0);
});
