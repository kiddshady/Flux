/* ═══════════════════════════════════════════════════════════════════════════
   FLUX — los datos del mapa
   Todo lo que dice una ficha sale de los apuntes de Química Biológica de Fran
   (U5 y U7). Nada se inventa acá: si el apunte no lo dice, la ficha no lo dice.
   Lo que el apunte marca como «plus» (excede a la cátedra) lleva `plus: true`.

   Un metabolito es un nodo; una reacción es una arista con su enzima. La
   geometría (x, y) está en unidades del lienzo del mapa (ver mapa.js).
   ═══════════════════════════════════════════════════════════════════════════ */

export const LIENZO = { w: 2100, h: 2180, eje: 520, mito: { x: 36, y: 948, w: 1488, h: 888 } };

/* El anillo de Krebs: ocho metabolitos cada 45°, medidos en sentido horario
   desde arriba. El paso 1 (citrato sintasa) queda justo arriba, donde entra
   el acetil-CoA. */
export const ANILLO = { cx: 520, cy: 1300, r: 190 };
const enAnillo = (grados) => {
  const a = (grados * Math.PI) / 180;
  return { x: Math.round(ANILLO.cx + ANILLO.r * Math.sin(a)), y: Math.round(ANILLO.cy - ANILLO.r * Math.cos(a)), ang: grados };
};

export const RUTAS = {
  glucolisis: { nombre: 'Glucólisis', lugar: 'Citosol', unidad: 'U7', seccion: 'La glucólisis' },
  fermentacion: { nombre: 'Fermentación láctica', lugar: 'Citosol', unidad: 'U7', seccion: 'Glucólisis aeróbica, anaeróbica y fermentaciones' },
  puente: { nombre: 'Decarboxilación oxidativa del piruvato', lugar: 'Matriz mitocondrial', unidad: 'U7', seccion: 'La decarboxilación oxidativa del piruvato' },
  krebs: { nombre: 'Ciclo de Krebs', lugar: 'Matriz mitocondrial', unidad: 'U5', seccion: 'El ciclo de Krebs' },
  gluconeogenesis: { nombre: 'Gluconeogénesis', lugar: 'Citosol', unidad: 'U7', seccion: 'La gluconeogénesis' },
  pentosas: { nombre: 'Vía de las pentosas fosfato', lugar: 'Citosol', unidad: 'U7', seccion: 'La vía de las pentosas fosfato' },
  glucogeno: { nombre: 'Glucógeno', lugar: 'Citosol', unidad: 'U7', seccion: 'El glucógeno' },
  cadena: { nombre: 'Cadena respiratoria', lugar: 'Membrana mitocondrial interna', unidad: 'U5', seccion: 'La cadena respiratoria' },
  betaox: { nombre: 'Oxidación de ácidos grasos', lugar: 'Matriz mitocondrial', unidad: 'U8', seccion: 'La oxidación de los ácidos grasos' },
  cetogenesis: { nombre: 'Cuerpos cetónicos', lugar: 'Matriz mitocondrial', unidad: 'U8', seccion: 'Los cuerpos cetónicos' },
  lipogenesis: { nombre: 'Síntesis de ácidos grasos', lugar: 'Citosol', unidad: 'U8', seccion: 'La síntesis de ácidos grasos' },
  colesterol: { nombre: 'Síntesis de colesterol', lugar: 'Citosol y retículo endoplasmático liso', unidad: 'U8', seccion: 'El colesterol' },
  lipoproteinas: { nombre: 'Lipoproteínas', lugar: 'Plasma', unidad: 'U8', seccion: 'Las lipoproteínas' },
  nitrogeno: { nombre: 'Grupo amino', lugar: 'Hígado', unidad: 'U9', seccion: 'El catabolismo de los aminoácidos: el grupo amino' },
  urea: { nombre: 'Ciclo de la urea', lugar: 'Hígado', unidad: 'U9', seccion: 'El ciclo de la urea' },
  anaplerotica: { nombre: 'Reacción anaplerótica', lugar: 'Matriz mitocondrial', unidad: 'U5', seccion: 'Un ciclo anfibólico' },
};

/* Los PDF de los apuntes, relativos a la carpeta de teoría (ajuste `apuntesDir`). */
export const APUNTES = {
  U5: { titulo: 'U5 · Metabolismo energético', pdf: 'U5 metabolismo energético/U5 - Metabolismo energético.pdf' },
  U9: { titulo: 'U9 · Metabolismo nitrogenado', pdf: 'U9 metabolismo nitrogenado/U9 - Metabolismo nitrogenado.pdf' },
  U8: { titulo: 'U8 · Lípidos y su metabolismo', pdf: 'U8 lípidos y su metabolismo/U8 - Lípidos y su metabolismo.pdf' },
  U7: { titulo: 'U7 · Hidratos de carbono y su metabolismo', pdf: 'U7 hidratos de carbono y su metabolismo/U7 - Hidratos de carbono y su metabolismo.pdf' },
};

const X = 520;   // el eje de la glucólisis

export const METABOLITOS = [
  { id: 'glucosa', nombre: 'Glucosa', c: 6, x: X, y: 70 },
  { id: 'g6p', nombre: 'Glucosa-6-P', c: 6, x: X, y: 160,
    notas: [{ t: 'Es la bifurcación: va a la glucólisis, a las pentosas o al glucógeno, y en el hígado puede volver a glucosa.' }] },
  { id: 'f6p', nombre: 'Fructosa-6-P', c: 6, x: X, y: 250,
    llegadas: ['Fase no oxidativa de las pentosas: 3 pentosas dan 2 fructosa-6-P y 1 gliceraldehído-3-P.', 'Fructosa en el músculo y el riñón: la hexoquinasa la fosforila a fructosa-6-P.'] },
  { id: 'f16bp', nombre: 'Fructosa-1,6-bisfosfato', corto: 'Fructosa-1,6-BP', c: 6, x: X, y: 340 },
  { id: 'dhap', nombre: 'Dihidroxiacetona fosfato', corto: 'DHAP', c: 3, x: 340, y: 430 },
  { id: 'g3p', nombre: 'Gliceraldehído-3-P', c: 3, x: X, y: 430,
    llegadas: ['Fase no oxidativa de las pentosas.'] },
  { id: 'bpg13', nombre: '1,3-Bisfosfoglicerato', c: 3, x: X, y: 520 },
  { id: 'pg3', nombre: '3-Fosfoglicerato', c: 3, x: X, y: 610 },
  { id: 'pg2', nombre: '2-Fosfoglicerato', c: 3, x: X, y: 700 },
  { id: 'pep', nombre: 'Fosfoenolpiruvato', corto: 'PEP', c: 3, x: X, y: 790 },
  { id: 'piruvato', nombre: 'Piruvato', c: 3, x: X, y: 880,
    notas: [{ t: 'Con O₂ entra a la mitocondria y pasa a acetil-CoA. Sin O₂ suficiente se reduce a lactato y así se recupera el NAD⁺.' }] },
  { id: 'lactato', nombre: 'Lactato', c: 3, x: 150, y: 880,
    notas: [{ t: 'Ciclo de Cori: el músculo en ejercicio intenso (y el glóbulo rojo) libera lactato; viaja al hígado, que lo convierte en piruvato y fabrica glucosa por gluconeogénesis; la glucosa vuelve al músculo. En el músculo se ganan 2 ATP; en el hígado se gastan 6 (4 ATP y 2 GTP).' }] },
  { id: 'acetilcoa', nombre: 'Acetil-CoA', c: 2, x: X, y: 1010,
    notas: [
      { t: 'Llega de la glucólisis (por la piruvato deshidrogenasa), de la β-oxidación de los ácidos grasos o de los aminoácidos.' },
      { t: 'No fabrica oxalacetato: por cada acetil-CoA entran 2 carbonos y salen 2 CO₂. Por eso, en los animales, los ácidos grasos no pueden convertirse en glucosa.' },
    ] },
  { id: 'citrato', nombre: 'Citrato', c: 6, ...enAnillo(22.5),
    salidas: ['Sale al citosol y da acetil-CoA para ácidos grasos y colesterol.'] },
  { id: 'isocitrato', nombre: 'Isocitrato', c: 6, ...enAnillo(67.5) },
  { id: 'akg', nombre: 'α-Cetoglutarato', c: 5, ...enAnillo(112.5),
    salidas: ['Glutamato y otros aminoácidos (y de ahí, purinas).'],
    llegadas: ['Transaminaciones: los aminoácidos lo reponen.'] },
  { id: 'succoa', nombre: 'Succinil-CoA', c: 4, ...enAnillo(157.5),
    salidas: ['Porfirinas: hemo y citocromos.'],
    llegadas: ['Isoleucina, metionina, valina y los ácidos grasos de número impar.'] },
  { id: 'succinato', nombre: 'Succinato', c: 4, ...enAnillo(202.5) },
  { id: 'fumarato', nombre: 'Fumarato', c: 4, ...enAnillo(247.5),
    llegadas: ['Fenilalanina y tirosina.'] },
  { id: 'malato', nombre: 'L-Malato', c: 4, ...enAnillo(292.5),
    llegadas: ['Enzima málica: piruvato + CO₂ + NADPH dan malato (la reacción es reversible).'] },
  { id: 'oaa', nombre: 'Oxalacetato', c: 4, ...enAnillo(337.5),
    salidas: ['Aspartato y otros aminoácidos.', 'Fosfoenolpiruvato y de ahí glucosa (gluconeogénesis).'],
    llegadas: ['Piruvato carboxilasa: la reposición más importante.', 'Transaminaciones.'],
    notas: [{ t: 'Se regenera al final de cada vuelta: el ciclo funciona catalíticamente, y una pequeña cantidad de oxalacetato alcanza para oxidar mucho acetil-CoA.' }] },
  /* ── Gluconeogénesis ────────────────────────────────────────────────────── */
  { id: 'oaa_cit', nombre: 'Oxalacetato (citosol)', corto: 'Oxalacetato', c: 4, x: 220, y: 790,
    notas: [{ t: 'El oxalacetato no atraviesa la membrana interna de la mitocondria: sale como malato y en el citosol vuelve a oxalacetato.' }] },

  /* ── Glucógeno ──────────────────────────────────────────────────────────── */
  { id: 'g1p', nombre: 'Glucosa-1-P', c: 6, x: 780, y: 160 },
  { id: 'udpglc', nombre: 'UDP-glucosa', c: 6, x: 940, y: 160,
    notas: [{ t: 'Es la glucosa activada: la forma donadora para la síntesis del glucógeno.' }] },
  { id: 'glucogeno', nombre: 'Glucógeno', c: 6, x: 860, y: 300,
    notas: [
      { t: 'Las ramas dan muchos extremos no reductores, donde actúan a la vez la sintasa y la fosforilasa: la síntesis y la degradación son más rápidas. Además lo hacen más soluble.' },
      { t: 'Guardar la glucosa como polímero evita la presión osmótica enorme que haría la misma cantidad de glucosa libre.' },
      { t: 'La glucogenina es el cebador: una proteína dimérica que se autoglucosila. Une una glucosa a una tirosina propia y agrega hasta 8 glucosas; sobre ese octámero sigue la glucógeno sintasa. Queda en el centro de la molécula, en el único extremo reductor.' },
      { t: 'El glucógeno del hígado dura alrededor de 12 a 24 horas de ayuno; el muscular es solo para el músculo.' },
    ] },

  /* ── Vía de las pentosas ────────────────────────────────────────────────── */
  { id: 'lactona', nombre: '6-Fosfogluconolactona', c: 6, x: 120, y: 205 },
  { id: 'pg6', nombre: '6-Fosfogluconato', c: 6, x: 120, y: 295 },
  { id: 'ru5p', nombre: 'Ribulosa-5-P', c: 5, x: 120, y: 385,
    notas: [{ plus: true, t: 'La epimerasa la convierte en xilulosa-5-P, que entra en la fase no oxidativa.' }] },
  { id: 'r5p', nombre: 'Ribosa-5-P', c: 5, x: 120, y: 475,
    salidas: ['Nucleótidos, ADN, ARN y coenzimas: la vía es muy activa en las células que se dividen.'],
    notas: [
      { t: 'Fase no oxidativa (reversible): la transcetolasa (con TPP y Mg²⁺) transfiere unidades de dos carbonos y la transaldolasa (sin cofactor; forma una base de Schiff con una lisina) transfiere unidades de tres. Así 3 pentosas dan 2 fructosa-6-P y 1 gliceraldehído-3-P, y al revés.' },
      { t: 'Si la célula necesita más NADPH que ribosa, las pentosas sobrantes vuelven a la glucólisis. Si necesita ribosa sin NADPH, la saca de la fructosa-6-P y el gliceraldehído-3-P por la fase no oxidativa al revés.' },
    ] },
  /* ── Cadena respiratoria: los que llevan los electrones ─────────────────── */
  { id: 'nadh', nombre: 'NADH', x: 150, y: 1640, clase: 'Entrega sus electrones al complejo I',
    notas: [
      { t: 'Viene del ciclo de Krebs, de la piruvato deshidrogenasa y de la β-oxidación. Rinde unos 2,5 ATP (clásicamente se redondeaba a 3): bombea 4 + 4 + 2 = 10 H⁺.' },
      { t: 'El NADH del citosol no puede entrar a la mitocondria: lo resuelven las lanzaderas, que pasan los electrones, no el NADH. La de malato-aspartato (hígado, corazón, riñón) entra por el complejo I y rinde unos 2,5 ATP; la de glicerol-3-fosfato (músculo esquelético, cerebro) entra por la coenzima Q y rinde unos 1,5.' },
    ] },
  { id: 'fadh2', nombre: 'FADH₂', x: 430, y: 1760, clase: 'Entrega sus electrones por el complejo II',
    notas: [
      { t: 'El de la succinato deshidrogenasa. Rinde unos 1,5 ATP (clásicamente, 2): entra un paso después, se saltea el complejo I y bombea solo 6 H⁺.' },
      { t: 'El FADH₂ de la β-oxidación le cede sus electrones directamente a la coenzima Q.' },
    ] },
  { id: 'coq', nombre: 'Coenzima Q', x: 430, y: 1640, clase: 'Transportador móvil (ubiquinona)',
    notas: [
      { t: 'Lleva los electrones de los complejos I y II al III moviéndose dentro de la membrana.' },
      { t: 'El complejo I no le pasa nada al II: son dos entradas paralelas, y los dos le dan sus electrones a la coenzima Q.' },
      { plus: true, t: 'Otras flavoproteínas también le dan sus electrones sin pasar por el complejo II: la acil-CoA deshidrogenasa de la β-oxidación y la glicerol-3-fosfato deshidrogenasa mitocondrial.' },
    ] },
  { id: 'citc', nombre: 'Citocromo c', x: 680, y: 1640, clase: 'Transportador móvil',
    notas: [{ t: 'Una proteína chica de la cara externa de la membrana interna: lleva los electrones del complejo III al IV.' }] },
  { id: 'agua', nombre: 'H₂O', x: 900, y: 1640, clase: 'El O₂, último aceptor, ya reducido',
    notas: [{ t: 'Sin O₂, el complejo IV no puede ceder los electrones: el NADH y el FADH₂ quedan reducidos, se frena el ciclo de Krebs y el paso de piruvato a acetil-CoA. El piruvato se convierte en lactato.' }] },
  { id: 'adp', nombre: 'ADP + Pi', x: 680, y: 1760, clase: 'Lo que espera la ATP sintasa',
    notas: [{ t: 'Control respiratorio: si la célula gasta ATP, sube el ADP, la ATP sintasa deja pasar protones, el gradiente baja y la cadena se acelera. Si sobra ATP, falta ADP y la cadena se frena. La velocidad de la respiración la fija la demanda de ATP.' }] },
  { id: 'atp', nombre: 'ATP', x: 900, y: 1760, clase: 'El producto de la fosforilación oxidativa',
    notas: [{ t: 'Sale al citosol por el translocador ADP/ATP, que mete un ADP en la matriz por cada ATP que saca.' }] },

  /* ── Oxidación de los ácidos grasos ─────────────────────────────────────── */
  { id: 'ag', nombre: 'Ácido graso', x: 1270, y: 560, clase: 'Llega por la sangre unido a la albúmina',
    notas: [
      { t: 'Sale de la lipólisis: en el ayuno o el ejercicio, el glucagón y la adrenalina suben el AMPc en el adipocito y la PKA activa la lipasa sensible a hormonas. La insulina la frena.' },
      { t: 'El glicerol que queda va al hígado: la glicerol quinasa lo fosforila y, como DHAP, entra a la glucólisis o a la gluconeogénesis.' },
    ] },
  { id: 'acil_cit', nombre: 'Acil-CoA (citosol)', corto: 'Acil-CoA', x: 1270, y: 670, clase: 'El ácido graso activado' },
  { id: 'acilcarnitina', nombre: 'Acil-carnitina', x: 1270, y: 780, clase: 'La forma en que cruza la membrana interna',
    notas: [{ t: 'La carnitina es una molécula derivada de la lisina.' }] },
  { id: 'acil_m', nombre: 'Acil-CoA (matriz)', corto: 'Acil-CoA', x: 1270, y: 1090, clase: 'Listo para oxidarse',
    notas: [{ t: 'Después de cada vuelta de la β-oxidación queda con dos carbonos menos y empieza otra.' }] },
  { id: 'enoil', nombre: 'trans-Enoil-CoA', x: 1400, y: 1200, clase: 'Doble enlace trans entre C-2 y C-3' },
  { id: 'hidroxiacil', nombre: 'L-3-Hidroxiacil-CoA', x: 1270, y: 1310, clase: 'Intermediario de la β-oxidación' },
  { id: 'cetoacil', nombre: '3-Cetoacil-CoA', x: 1140, y: 1200, clase: 'Intermediario de la β-oxidación' },

  /* ── Cuerpos cetónicos ──────────────────────────────────────────────────── */
  { id: 'acetoacetil', nombre: 'Acetoacetil-CoA', c: 4, x: 800, y: 1010 },
  { id: 'hmgcoa', nombre: 'HMG-CoA', c: 6, x: 960, y: 1010,
    notas: [{ t: 'El HMG-CoA del citosol es otro: lo fabrica una isoforma distinta de la sintasa y va a la síntesis de colesterol, donde la HMG-CoA reductasa (el paso limitante, que inhiben las estatinas) lo reduce a mevalonato.' }] },
  { id: 'acetoacetato', nombre: 'Acetoacetato', c: 4, x: 1130, y: 1010,
    notas: [
      { t: 'Se descarboxila espontáneamente a acetona, que se elimina por el aliento.' },
      { t: 'Cetólisis, fuera del hígado: una transferasa (β-cetoacil-CoA transferasa) le pasa la CoA del succinil-CoA y queda acetoacetil-CoA; la tiolasa lo corta en 2 acetil-CoA, que se oxidan en el ciclo de Krebs.' },
      { t: 'El hígado los fabrica pero no los usa: le falta la enzima que los activa. Los usan el músculo esquelético, el corazón, la corteza renal y, en el ayuno prolongado, el cerebro.' },
    ] },
  { id: 'bhb', nombre: 'β-Hidroxibutirato', c: 4, x: 1130, y: 1100,
    notas: [{ t: 'Los cuerpos cetónicos son ácidos. En el ayuno se mantienen en niveles que el organismo amortigua (cetosis). En la diabetes tipo 1 sin tratar se acumulan tanto que bajan el pH de la sangre: es la cetoacidosis diabética, con aliento a acetona, cetonas en la orina y riesgo de coma.' }] },

  /* ── Síntesis de ácidos grasos ──────────────────────────────────────────── */
  { id: 'accoa_cit', nombre: 'Acetil-CoA (citosol)', corto: 'Acetil-CoA', c: 2, x: 940, y: 800,
    notas: [{ t: 'El acetil-CoA no atraviesa la membrana interna: sale como citrato, que se forma cuando sobran acetil-CoA y ATP.' }] },
  { id: 'malonil', nombre: 'Malonil-CoA', c: 3, x: 940, y: 690,
    notas: [{ t: 'Inhibe la CPT-I: cuando se sintetizan ácidos grasos, impide que entren a la mitocondria a oxidarse. Así síntesis y oxidación no ocurren a la vez.' }] },
  { id: 'palmitato', nombre: 'Palmitato', c: 16, x: 940, y: 580,
    notas: [
      { t: 'Elongación: se alarga a estearato (18:0) y a ácidos más largos en el retículo endoplasmático liso. El donador de los dos carbonos es otra vez el malonil-CoA, pero con la CoA en lugar de la ACP.' },
      { t: 'Desaturación: las desaturasas del retículo introducen dobles enlaces cis; son oxidasas de función mixta. La Δ9-desaturasa lo convierte en palmitoleico, y al estearato en oleico.' },
      { t: 'Con glicerol-3-fosfato (que sale de la DHAP) forma triglicéridos: el hígado los exporta en las VLDL y el tejido adiposo los guarda.' },
    ] },
  /* ── Síntesis de colesterol ─────────────────────────────────────────────── */
  { id: 'hmg_cit', nombre: 'HMG-CoA (citosol)', corto: 'HMG-CoA', c: 6, x: 1640, y: 840,
    notas: [{ t: 'Es el mismo compuesto que el de la cetogénesis, pero en otro compartimiento y fabricado por otra isoforma de la sintasa: en la mitocondria va a cuerpos cetónicos; en el citosol, a colesterol.' }] },
  { id: 'mevalonato', nombre: 'Mevalonato', c: 6, x: 1640, y: 730 },
  { id: 'ipp', nombre: 'Isopentenil pirofosfato', c: 5, x: 1640, y: 620,
    notas: [{ t: 'Es el isopreno activado.' }] },
  { id: 'escualeno', nombre: 'Escualeno', c: 30, x: 1640, y: 510 },
  { id: 'colesterol', nombre: 'Colesterol', c: 27, x: 1640, y: 400,
    salidas: [
      'Membranas celulares.',
      'Ácidos biliares (en el hígado): son la principal vía de eliminación. Se secretan a la bilis, ayudan a digerir las grasas y se reabsorben en gran parte (circulación enterohepática).',
      'Hormonas esteroideas (corteza suprarrenal, gónadas), por enzimas P450 mitocondriales.',
      'Vitamina D (en la piel, desde el 7-dehidrocolesterol, con luz UV).',
    ],
    notas: [
      { t: 'Todos sus 27 carbonos vienen del acetil-CoA. Se fabrica en casi todas las células, sobre todo en el hígado.' },
      { t: 'Es el principal regulador de su propia síntesis: cuando sube dentro de la célula, frena la transcripción de la HMG-CoA reductasa y del receptor de LDL (por el factor de transcripción SREBP), acelera la degradación de la reductasa y activa la ACAT.' },
      { t: 'Parte se excreta intacto por la bilis, y las bacterias intestinales lo transforman en coprostanol.' },
    ] },
  { id: 'esteres', nombre: 'Ésteres de colesterol', x: 1900, y: 400, clase: 'Forma de almacenamiento y de transporte',
    notas: [{ t: 'Van en el núcleo no polar de las lipoproteínas, junto con los triglicéridos.' }] },

  /* ── Lipoproteínas ──────────────────────────────────────────────────────── */
  { id: 'vldl', nombre: 'VLDL', x: 1220, y: 110, clase: 'Triglicéridos fabricados en el hígado',
    notas: [
      { t: 'Densidad 0,95 a 1,006 g/mL; 10 % de proteína; triglicéridos (50 %). En la electroforesis migra como pre-beta.' },
      { t: 'El hígado exporta en ellas sus triglicéridos y colesterol. Lleva apo B-100 (ensamblaje), C-II, C-III y E.' },
    ] },
  { id: 'idl', nombre: 'IDL', x: 1480, y: 110, clase: 'Remanente de la VLDL',
    notas: [{ t: 'Densidad 1,006 a 1,019 g/mL; triglicéridos y colesterol. Parte vuelve al hígado; el resto se convierte en LDL.' }] },
  { id: 'ldl', nombre: 'LDL', x: 1740, y: 110, clase: 'Lleva colesterol a los tejidos',
    notas: [
      { t: 'Densidad 1,019 a 1,063 g/mL; 23 % de proteína; ésteres de colesterol (37 %). En la electroforesis migra como beta. Su apo B-100 es el ligando del receptor de LDL.' },
      { t: 'El «colesterol malo»: lleva colesterol a los tejidos. Si está alta, o se oxida, la captan los macrófagos de la pared arterial por receptores scavenger, que no se regulan. Esos macrófagos se llenan de colesterol, se transforman en células espumosas y forman la placa de ateroma.' },
      { plus: true, t: 'La Lp(a), una LDL con una apo(a) unida por un puente disulfuro, es aterogénica y protrombótica.' },
    ] },
  { id: 'qm', nombre: 'Quilomicrón', x: 1220, y: 230, clase: 'Grasa de la dieta, desde el intestino',
    notas: [
      { t: 'Densidad menor de 1,006 g/mL; 2 % de proteína; triglicéridos (85 %). Es la más grande y la menos densa: en la electroforesis se queda en el origen.' },
      { t: 'El intestino los forma nacientes, con apo B-48. En la sangre reciben de la HDL la apo C-II y la E.' },
    ] },
  { id: 'remanente', nombre: 'Remanente de quilomicrón', x: 1470, y: 230, clase: 'Rico en colesterol',
    notas: [{ t: 'El colesterol de la dieta que trae baja la síntesis propia del hígado.' }] },
  { id: 'hdl_n', nombre: 'HDL naciente', x: 1940, y: 110, clase: 'Discoidal, con apo A-I',
    notas: [{ t: 'La secretan el hígado y el intestino. Toma colesterol de las membranas de los tejidos y de los macrófagos.' }] },
  { id: 'hdl', nombre: 'HDL madura', x: 1940, y: 230, clase: 'Saca colesterol de los tejidos',
    notas: [
      { t: 'Densidad 1,063 a 1,210 g/mL; 55 % de proteína; fosfolípidos y ésteres de colesterol. Es la más chica y densa; migra como alfa.' },
      { t: 'El «colesterol bueno»: hace el transporte reverso, saca colesterol de los tejidos y lo lleva al hígado.' },
      { t: 'Es el depósito de apolipoproteínas: las C y la E pasan de una lipoproteína a otra, sobre todo desde la HDL. Las B-48 y B-100 no se transfieren (hay una por partícula).' },
    ] },
  /* ── El grupo amino ─────────────────────────────────────────────────────── */
  { id: 'aminoacido', nombre: 'Aminoácido', x: 1000, y: 1590, clase: 'Cualquiera de los 20',
    notas: [
      { t: 'Sin el grupo amino, los 20 aminoácidos dan siete productos, que entran al ciclo de Krebs o se relacionan con él: piruvato, acetil-CoA, acetoacetil-CoA, α-cetoglutarato, succinil-CoA, fumarato y oxalacetato.' },
      { t: 'Glucogénicos: dan piruvato o intermediarios del ciclo de Krebs, que pueden llegar a glucosa. Son todos menos la leucina y la lisina.' },
      { t: 'Cetogénicos: dan acetil-CoA o acetoacetil-CoA, que no pueden dar glucosa y forman cuerpos cetónicos. Solo cetogénicos: leucina y lisina. Mixtos: isoleucina, fenilalanina, tirosina, triptófano y treonina.' },
      { t: 'Esenciales (hay que comerlos): histidina, isoleucina, leucina, lisina, metionina, fenilalanina, treonina, triptófano y valina.' },
      { t: 'Fenilcetonuria: falta la fenilalanina hidroxilasa (fenilalanina a tirosina, con tetrahidrobiopterina). Se acumula fenilalanina, que se desvía a fenilpiruvato y daña el cerebro en desarrollo; la tirosina se vuelve esencial. Se detecta con la pesquisa neonatal y se trata con una dieta pobre en fenilalanina desde el nacimiento.' },
      { plus: true, t: 'Los de cadena ramificada (leucina, isoleucina, valina) se degradan sobre todo en el músculo. Su deshidrogenasa usa los mismos cinco cofactores que la piruvato deshidrogenasa; si falta, es la enfermedad de la orina con olor a jarabe de arce.' },
    ] },
  { id: 'glutamato', nombre: 'Glutamato', c: 5, x: 1180, y: 1590,
    salidas: ['GABA (glutamato descarboxilasa, con PLP): el principal neurotransmisor inhibitorio, disminuido en la epilepsia.', 'Glutatión.', 'Glutamina, prolina y arginina.'],
    notas: [{ t: 'El nitrógeno de muchos aminoácidos se concentra en él: es el punto de encuentro de las transaminaciones.' }] },
  { id: 'glutamina', nombre: 'Glutamina', c: 5, x: 1180, y: 1460,
    notas: [
      { t: 'Es la forma no tóxica en que la mayoría de los tejidos, incluido el cerebro, mandan el amoníaco al hígado. Es el aminoácido más abundante en la sangre.' },
      { t: 'Dona su nitrógeno amídico a muchas biosíntesis: purinas, pirimidinas, aminoazúcares y asparagina.' },
      { t: 'El músculo usa además la alanina (ciclo glucosa-alanina): pasa los grupos amino al piruvato por la ALT; en el hígado la alanina vuelve a piruvato, el nitrógeno va a la urea y el piruvato, a la gluconeogénesis. Es parecido al ciclo de Cori, pero además lleva nitrógeno.' },
    ] },
  { id: 'nh4', nombre: 'Amonio (NH₄⁺)', x: 1420, y: 1590, clase: 'Tóxico, sobre todo para el cerebro',
    notas: [
      { t: 'Su concentración en sangre se mantiene muy baja. Otras fuentes: la glutaminasa, las serina y treonina deshidratasas (con PLP) y las bacterias intestinales.' },
      { t: 'Por qué es tóxico: en el cerebro, el exceso se elimina formando glutamina en los astrocitos. La glutamina se acumula, arrastra agua y produce edema cerebral; además se agotan el glutamato y el α-cetoglutarato (y con ellos el ciclo de Krebs y el GABA).' },
      { t: 'Hiperamonemia (insuficiencia hepática o defectos del ciclo de la urea): temblor, confusión, vómitos, letargo y coma. Es la encefalopatía hepática.' },
      { plus: true, t: 'Se trata con dieta pobre en proteínas y con lactulosa, que acidifica el colon, atrapa el amoníaco como NH₄⁺ y disminuye las bacterias que lo producen.' },
    ] },

  /* ── Ciclo de la urea ───────────────────────────────────────────────────── */
  { id: 'carbamoilp', nombre: 'Carbamoil fosfato', c: 1, x: 1420, y: 1700 },
  { id: 'ornitina', nombre: 'Ornitina', c: 5, x: 1250, y: 1760,
    notas: [{ t: 'Se regenera en cada vuelta y vuelve a la mitocondria: funciona como el oxalacetato en el ciclo de Krebs.' }] },
  { id: 'citrulina', nombre: 'Citrulina', c: 6, x: 1420, y: 1900,
    notas: [{ t: 'Se forma en la matriz y sale al citosol.' }] },
  { id: 'aspartato', nombre: 'Aspartato', c: 4, x: 1335, y: 2110,
    notas: [
      { t: 'Aporta el segundo nitrógeno de la urea.' },
      { t: 'Bicicleta de Krebs: el fumarato que sale del ciclo de la urea pasa a malato y a oxalacetato (con NADH); el oxalacetato, por transaminación (AST), se convierte otra vez en aspartato.' },
    ] },
  { id: 'argsucc', nombre: 'Argininosuccinato', c: 10, x: 1250, y: 2040 },
  { id: 'arginina', nombre: 'Arginina', c: 6, x: 1080, y: 1900,
    salidas: ['Óxido nítrico.', 'Creatina.'],
    notas: [{ t: 'Se sintetiza en el ciclo de la urea, pero en el crecimiento no alcanza: es condicionalmente esencial.' }] },
  { id: 'urea', nombre: 'Urea', c: 1, x: 900, y: 1900,
    notas: [
      { t: 'Una molécula neutra, soluble y no tóxica que se excreta por la orina.' },
      { t: 'De sus dos nitrógenos, uno viene del amonio y el otro del aspartato; el carbono viene del bicarbonato.' },
    ] },
];

/* gasta / forma: lo que la reacción consume o produce además del sustrato y el
   producto. Las capas del mapa se pintan con esto. */
export const REACCIONES = [
  /* ── Glucólisis: fase preparatoria ──────────────────────────────────────── */
  {
    id: 'hk', ruta: 'glucolisis', paso: 1, enzima: 'Hexoquinasa', fase: 'Fase preparatoria',
    de: ['glucosa'], a: ['g6p'], gasta: ['ATP'], forma: ['ADP'],
    tipo: 'Fosforilación (transferasa)', irreversible: true, regulada: true,
    notas: [
      { t: 'Necesita Mg²⁺, que forma el complejo Mg-ATP y apantalla las cargas negativas de los fosfatos.' },
      { t: 'La glucosa queda atrapada en la célula.' },
    ],
    regulacion: {
      inhiben: ['Glucosa-6-P (su producto, en forma alostérica)'],
      activan: [],
      notas: [
        { t: 'Hexoquinasas I a III: Km bajo, trabajan saturadas, en todos los tejidos.' },
        { t: 'Glucoquinasa (hexoquinasa IV): no la inhibe la glucosa-6-P y tiene Km alto. Está en el hígado y en las células β del páncreas: actúa cuando la glucemia sube.' },
      ],
    },
  },
  {
    id: 'pgi', ruta: 'glucolisis', paso: 2, enzima: 'Fosfoglucosa isomerasa', alias: 'Glucosa-6-fosfato isomerasa', fase: 'Fase preparatoria',
    de: ['g6p'], a: ['f6p'], reversible: true,
    tipo: 'Isomerización (de aldosa a cetosa)',
  },
  {
    id: 'pfk1', ruta: 'glucolisis', paso: 3, enzima: 'Fosfofructoquinasa-1', alias: 'PFK-1', fase: 'Fase preparatoria',
    de: ['f6p'], a: ['f16bp'], gasta: ['ATP'], forma: ['ADP'],
    tipo: 'Fosforilación', irreversible: true, regulada: true,
    notas: [{ t: 'Es el paso comprometido y el principal punto de control de la glucólisis.' }],
    regulacion: {
      inhiben: ['ATP', 'Citrato'],
      activan: ['AMP', 'ADP', 'Fructosa-2,6-bisfosfato'],
      notas: [
        { t: 'El ATP es sustrato, pero cuando sobra se une a un sitio alostérico distinto y baja la afinidad por la fructosa-6-P. Si la célula tiene energía, la glucólisis se frena; si sube el AMP, se acelera.' },
        { t: 'La fructosa-2,6-bisfosfato es el activador más potente y a la vez inhibe la fructosa-1,6-bisfosfatasa de la gluconeogénesis. La fabrica y la degrada una enzima bifuncional (PFK-2 / FBPasa-2).' },
        { t: 'Glucagón: AMPc y PKA, que fosforila la enzima bifuncional. Baja la fructosa-2,6-bisfosfato, se frena la glucólisis y se activa la gluconeogénesis en el hígado. La insulina hace lo contrario.' },
      ],
    },
  },
  {
    id: 'aldolasa', ruta: 'glucolisis', paso: 4, enzima: 'Aldolasa', fase: 'Fase preparatoria',
    de: ['f16bp'], a: ['g3p', 'dhap'], reversible: true,
    tipo: 'Ruptura de la hexosa (6 C) en dos triosas',
    notas: [{ t: 'Es reversible: en la célula su ΔG es casi cero.' }],
  },
  {
    id: 'tpi', ruta: 'glucolisis', paso: 5, enzima: 'Triosa fosfato isomerasa', fase: 'Fase preparatoria',
    de: ['dhap'], a: ['g3p'], reversible: true,
    tipo: 'Isomerización',
    notas: [{ t: 'Solo el gliceraldehído-3-P sigue la vía. Al convertir la DHAP, las dos mitades de la glucosa continúan: desde acá todo se multiplica por dos.' }],
  },

  /* ── Glucólisis: fase de beneficio ──────────────────────────────────────── */
  {
    id: 'gapdh', ruta: 'glucolisis', paso: 6, enzima: 'Gliceraldehído-3-P deshidrogenasa', fase: 'Fase de beneficio',
    de: ['g3p'], a: ['bpg13'], gasta: ['NAD⁺', 'Pi'], forma: ['NADH'],
    tipo: 'Oxidación (la única de la vía)',
    notas: [
      { t: 'Oxida un aldehído y la energía se guarda en un enlace acil-fosfato de alta energía. Es ligeramente endergónica.' },
      { t: 'El NAD⁺ tiene que volver: si el NADH no se reoxida, la vía se frena. Con O₂ pasa sus electrones a la mitocondria por las lanzaderas; sin O₂, el piruvato se reduce a lactato.' },
    ],
    inhibidores: [
      { nombre: 'Arsenato', plus: true, t: 'Reemplaza al fosfato: se forma un compuesto inestable que se hidroliza solo y se pierde el ATP del paso 7.' },
    ],
  },
  {
    id: 'pgk', ruta: 'glucolisis', paso: 7, enzima: 'Fosfoglicerato quinasa', fase: 'Fase de beneficio',
    de: ['bpg13'], a: ['pg3'], gasta: ['ADP'], forma: ['ATP'],
    tipo: 'Fosforilación a nivel de sustrato (la primera)',
  },
  {
    id: 'pgm', ruta: 'glucolisis', paso: 8, enzima: 'Fosfoglicerato mutasa', fase: 'Fase de beneficio',
    de: ['pg3'], a: ['pg2'],
    tipo: 'Cambio de posición del fosfato (del C-3 al C-2)',
    notas: [{ plus: true, t: 'La enzima tiene una histidina fosforilada: le pasa su fosfato al C-2 (se forma 2,3-bisfosfoglicerato) y recupera el del C-3.' }],
  },
  {
    id: 'enolasa', ruta: 'glucolisis', paso: 9, enzima: 'Enolasa', alias: 'Fosfopiruvato hidratasa', fase: 'Fase de beneficio',
    de: ['pg2'], a: ['pep'], forma: ['H₂O'],
    tipo: 'Deshidratación',
    notas: [
      { t: 'Es una metaloenzima con Mg²⁺.' },
      { t: 'La deshidratación redistribuye la energía de la molécula y genera un compuesto de muy alto potencial de transferencia de fosfato.' },
    ],
    inhibidores: [
      { nombre: 'Fluoruro', plus: true, t: 'Inhibe la enolasa. Por eso se usa en los tubos para medir glucemia: frena la glucólisis de los glóbulos rojos.' },
    ],
  },
  {
    id: 'pk', ruta: 'glucolisis', paso: 10, enzima: 'Piruvato quinasa', fase: 'Fase de beneficio',
    de: ['pep'], a: ['piruvato'], gasta: ['ADP'], forma: ['ATP'],
    tipo: 'Fosforilación a nivel de sustrato (la segunda)', irreversible: true, regulada: true,
    regulacion: {
      inhiben: ['ATP', 'Acetil-CoA', 'Alanina', 'Ácidos grasos'],
      activan: ['Fructosa-1,6-bisfosfato (proalimentación)'],
      notas: [{ t: 'La hepática se inactiva por fosforilación (glucagón y PKA).' }],
    },
  },

  /* ── Lo que sale del piruvato ───────────────────────────────────────────── */
  {
    id: 'ldh', ruta: 'fermentacion', enzima: 'Lactato deshidrogenasa',
    de: ['piruvato'], a: ['lactato'], gasta: ['NADH'], forma: ['NAD⁺'], reversible: true,
    rot: { x: 380, y: 866, ancla: 'middle', cofY: 902 },
    tipo: 'Reducción del piruvato',
    notas: [
      { t: 'Sin O₂ suficiente, reduce el piruvato a lactato con el NADH de la glucólisis. No hay oxidación neta: el NADH del paso 6 se gasta acá, y así se regenera el NAD⁺.' },
      { t: 'Rinde solo 2 ATP por glucosa.' },
      { t: 'Músculo en ejercicio intenso: el «ácido láctico» que se acumula. Glóbulo rojo: siempre, porque no tiene mitocondrias.' },
      { plus: true, t: 'También en la retina y la médula renal.' },
    ],
  },
  {
    id: 'pdh', ruta: 'puente', enzima: 'Complejo piruvato deshidrogenasa', alias: 'PDH',
    de: ['piruvato'], a: ['acetilcoa'], gasta: ['CoA', 'NAD⁺'], forma: ['NADH', 'CO₂'], cofLado: 'der',
    tipo: 'Descarboxilación oxidativa', irreversible: true, regulada: true,
    notas: [
      { t: 'Ocurre con O₂ (con poco O₂ se bloquea). Es irreversible: por eso el acetil-CoA no puede volver a dar glucosa.' },
      { t: 'Tres enzimas que actúan en forma concatenada con cinco coenzimas.' },
      { t: 'E1, piruvato deshidrogenasa: descarboxila el piruvato; queda un hidroxietilo unido al TPP (tiamina pirofosfato, vitamina B1).' },
      { t: 'E2, dihidrolipoil transacetilasa: el hidroxietilo se oxida a acetilo y pasa a la lipoamida; después lo transfiere a la CoA y sale el acetil-CoA.' },
      { t: 'E3, dihidrolipoil deshidrogenasa: reoxida la lipoamida; los electrones pasan al FAD y de ahí al NAD⁺: sale el NADH.' },
      { t: 'La lipoamida funciona como un brazo flexible que lleva el sustrato de un sitio activo a otro, sin que los intermediarios se suelten.' },
      { plus: true, t: 'El núcleo del complejo lo forman muchas copias de E2 (60 en mamíferos), con E1 y E3 alrededor. La E3 es la misma del complejo de la α-cetoglutarato deshidrogenasa.' },
    ],
    regulacion: {
      inhiben: ['Acetil-CoA', 'NADH', 'ATP'],
      activan: ['AMP', 'CoA', 'NAD⁺'],
      notas: [
        { t: 'Covalente: la PDH quinasa fosforila la E1 y la inactiva; la PDH fosfatasa la reactiva.' },
        { plus: true, t: 'El Ca²⁺ del músculo en contracción y la insulina activan la fosfatasa.' },
      ],
    },
    inhibidores: [
      { nombre: 'Falta de tiamina', t: 'Sin tiamina no se oxida bien el piruvato y se acumula. Pasa en el beriberi y en el alcoholismo (Wernicke-Korsakoff); el cerebro, que vive de glucosa, es el más afectado.' },
      { nombre: 'Arsenito', plus: true, t: 'Se une a la lipoamida reducida e inhibe el complejo.' },
    ],
  },
  {
    id: 'pc', ruta: 'anaplerotica', enzima: 'Piruvato carboxilasa',
    de: ['piruvato'], a: ['oaa'], gasta: ['CO₂', 'ATP'], forma: ['ADP'],
    via: { x: 390, y: 1000 }, rot: { x: 457, y: 944, ancla: 'end', cofY: 928 }, tambien: 'gluconeogenesis',
    tipo: 'Carboxilación (con biotina)', regulada: true,
    notas: [
      { t: 'Es la reacción anaplerótica más importante: repone el oxalacetato que se saca del ciclo para sintetizar.' },
      { t: 'Si se sacan intermediarios, el oxalacetato se agota y el ciclo se frena.' },
      { t: 'Es también el primer paso de la gluconeogénesis (primer rodeo): piruvato + HCO₃⁻ + ATP dan oxalacetato + ADP + Pi. Es el único paso mitocondrial de esa vía.' },
      { t: 'Es una ligasa y un homotetrámero. La biotina va unida a una lisina de la enzima y forma un brazo flexible que lleva el CO₂ activado de un sitio activo al otro.' },
    ],
    inhibidores: [
      { nombre: 'Avidina', plus: true, t: 'La avidina de la clara de huevo cruda se une a la biotina y la inactiva.' },
    ],
    regulacion: {
      inhiben: ['ADP'],
      activan: ['Acetil-CoA'],
      notas: [
        { t: 'Cuando sobra acetil-CoA, se fabrica el oxalacetato para oxidarlo.' },
        { t: 'El acetil-CoA es la señal clave: cuando sobra (por ejemplo, porque se oxidan ácidos grasos en el ayuno) inhibe la PDH y activa la piruvato carboxilasa. Así el piruvato va a glucosa y no se quema.' },
      ],
    },
  },

  /* ── Ciclo de Krebs ─────────────────────────────────────────────────────── */
  {
    id: 'cs', ruta: 'krebs', paso: 1, enzima: 'Citrato sintasa',
    de: ['oaa', 'acetilcoa'], a: ['citrato'], forma: ['CoA'],
    tipo: 'Condensación aldólica', tipoPlus: 'de tipo Claisen', irreversible: true, regulada: true,
    notas: [
      { t: 'Que la primera reacción sea irreversible y regulada evita gastar el acetil-CoA cuando no se necesita.' },
      { plus: true, t: 'Es muy exergónica (–32,2 kJ/mol).' },
    ],
    regulacion: { inhiben: ['Succinil-CoA', 'NADH', 'ATP', 'Citrato'], activan: [], activanPlus: ['ADP'] },
  },
  {
    id: 'aconitasa', ruta: 'krebs', paso: 2, enzima: 'Aconitasa',
    de: ['citrato'], a: ['isocitrato'],
    tipo: 'Isomerización: deshidratación seguida de hidratación',
    notas: [
      { t: 'Pasa por cis-aconitato. Tiene un centro Fe-S.' },
      { t: 'El alcohol terciario pasa a secundario, que se puede oxidar.' },
    ],
    inhibidores: [
      { nombre: 'Fluoroacetato', t: 'Se convierte en fluorocitrato, que la aconitasa no puede procesar: se bloquea esa enzima y el ciclo entero. Es un veneno muy potente.' },
    ],
  },
  {
    id: 'idh', ruta: 'krebs', paso: 3, enzima: 'Isocitrato deshidrogenasa',
    de: ['isocitrato'], a: ['akg'], gasta: ['NAD⁺'], forma: ['NADH', 'CO₂'],
    tipo: 'Primera descarboxilación oxidativa', irreversible: true, regulada: true,
    regulacion: { inhiben: ['ATP', 'NADH'], activan: [], activanPlus: ['ADP', 'Ca²⁺'] },
  },
  {
    id: 'akgdh', ruta: 'krebs', paso: 4, enzima: 'Complejo α-cetoglutarato deshidrogenasa',
    de: ['akg'], a: ['succoa'], gasta: ['CoA', 'NAD⁺'], forma: ['NADH', 'CO₂'],
    tipo: 'Segunda descarboxilación oxidativa', irreversible: true, regulada: true,
    notas: [
      { t: 'Es un complejo multienzimático igual al de la piruvato deshidrogenasa: usa las mismas cinco coenzimas (TPP, lipoamida, FAD, CoA y NAD⁺).' },
      { plus: true, t: 'Es muy exergónica (–33,5 kJ/mol).' },
    ],
    regulacion: { inhiben: ['Succinil-CoA (su producto)', 'NADH'], activan: [], activanPlus: ['Ca²⁺'] },
    inhibidores: [
      { nombre: 'Arsénico (arsenito)', t: 'Se une a los grupos –SH de la lipoamida y bloquea la α-cetoglutarato deshidrogenasa (y la piruvato deshidrogenasa). Se frena el ciclo y, sin poder reductor, la fosforilación oxidativa: produce daño gastrointestinal, cardiovascular y nervioso, y puede causar la muerte.' },
    ],
  },
  {
    id: 'scs', ruta: 'krebs', paso: 5, enzima: 'Succinil-CoA sintetasa',
    de: ['succoa'], a: ['succinato'], gasta: ['GDP', 'Pi'], forma: ['GTP', 'CoA'],
    tipo: 'Fosforilación a nivel de sustrato',
    notas: [{ plus: true, t: 'Da GTP o ATP, según la isoenzima.' }],
  },
  {
    id: 'sdh', ruta: 'krebs', paso: 6, enzima: 'Succinato deshidrogenasa',
    de: ['succinato'], a: ['fumarato'], gasta: ['FAD'], forma: ['FADH₂'],
    tipo: 'Deshidrogenación (forma un doble enlace trans)',
    notas: [{ t: 'Es la única enzima del ciclo unida a la membrana interna: es a la vez el complejo II de la cadena respiratoria.' }],
    inhibidores: [
      { nombre: 'Malonato', t: 'Inhibidor competitivo: se parece al succinato.' },
    ],
  },
  {
    id: 'fumarasa', ruta: 'krebs', paso: 7, enzima: 'Fumarasa',
    de: ['fumarato'], a: ['malato'], gasta: ['H₂O'],
    tipo: 'Hidratación',
  },
  {
    id: 'mdh', ruta: 'krebs', paso: 8, enzima: 'Malato deshidrogenasa',
    de: ['malato'], a: ['oaa'], gasta: ['NAD⁺'], forma: ['NADH'],
    tipo: 'Oxidación del alcohol secundario a cetona',
    notas: [{ plus: true, t: 'Es endergónica (+29,7 kJ/mol), pero avanza porque la citrato sintasa consume enseguida el oxalacetato y lo mantiene en concentraciones bajísimas.' }],
  },
  /* ── Gluconeogénesis: los rodeos de los tres pasos irreversibles ────────── */
  {
    id: 'malato_sale', ruta: 'gluconeogenesis', enzima: 'Salida al citosol como malato',
    de: ['oaa'], a: ['oaa_cit'], forma: ['NADH'],
    lugar: 'De la matriz al citosol',
    rot: { x: 368, y: 1040, ancla: 'end' },
    tipo: 'Reducción a malato, salida y reoxidación',
    notas: [
      { t: 'El oxalacetato no atraviesa la membrana interna. Se reduce a malato (malato deshidrogenasa mitocondrial), sale, y en el citosol vuelve a oxalacetato.' },
      { t: 'Así además se lleva al citosol el NADH que hace falta más adelante.' },
      { plus: true, t: 'Si el precursor es el lactato, el NADH citosólico ya está, y el PEP se forma en la mitocondria con una PEPCK mitocondrial.' },
    ],
  },
  {
    id: 'pepck', ruta: 'gluconeogenesis', enzima: 'Fosfoenolpiruvato carboxiquinasa', alias: 'PEPCK',
    de: ['oaa_cit'], a: ['pep'], gasta: ['GTP'], forma: ['GDP', 'CO₂'],
    tipo: 'Primer rodeo, segundo paso: descarboxilación y fosforilación',
    notas: [
      { t: 'Es citosólica y muy exigente: solo usa GTP, que se regenera desde ATP por la nucleósido difosfato quinasa.' },
      { t: 'El CO₂ que agregó la piruvato carboxilasa se va acá: sirvió para activar la molécula.' },
      { t: 'Rodea a la piruvato quinasa junto con la piruvato carboxilasa: el primer rodeo son dos pasos.' },
    ],
    regulacion: { inhiben: [], activan: [], notas: [{ t: 'El glucagón induce la PEPCK.' }] },
  },
  {
    id: 'fbpasa', ruta: 'gluconeogenesis', enzima: 'Fructosa-1,6-bisfosfatasa', alias: 'FBPasa-1',
    de: ['f16bp'], a: ['f6p'], gasta: ['H₂O'], forma: ['Pi'],
    via: { x: 340, y: 295 },
    tipo: 'Segundo rodeo: hidrólisis del fosfato del C-1 (hidrolasa)', regulada: true,
    notas: [{ t: 'Necesita Mg²⁺ y es alostérica. Rodea a la PFK-1.' }],
    regulacion: {
      inhiben: ['AMP', 'Fructosa-2,6-bisfosfato'],
      activan: [],
      notas: [
        { t: 'La glucólisis y la gluconeogénesis se regulan en forma recíproca: lo que activa una inhibe a la otra. Así no funcionan las dos a la vez, en un ciclo que solo gastaría ATP (un «ciclo fútil»).' },
        { t: 'El glucagón baja la fructosa-2,6-bisfosfato; la insulina hace lo contrario.' },
      ],
    },
  },
  {
    id: 'g6pasa', ruta: 'gluconeogenesis', enzima: 'Glucosa-6-fosfatasa',
    de: ['g6p'], a: ['glucosa'], gasta: ['H₂O'], forma: ['Pi'],
    via: { x: 340, y: 115 },
    lugar: 'Membrana del retículo endoplasmático',
    tipo: 'Tercer rodeo: hidrólisis (hidrolasa)',
    notas: [
      { t: 'Está solo en el hígado, el riñón y el intestino. El músculo no la tiene.' },
      { t: 'Es también el último paso de la glucogenólisis hepática: lo que permite exportar glucosa a la sangre.' },
      { t: 'Costo de la gluconeogénesis: 2 piruvatos para 1 glucosa gastan 4 ATP, 2 GTP y 2 NADH.' },
    ],
    inhibidores: [
      { nombre: 'Glucogenosis I, von Gierke', plus: true, t: 'Falta la glucosa-6-fosfatasa: hígado grande e hipoglucemia grave en ayunas.' },
    ],
  },

  /* ── Vía de las pentosas: fase oxidativa ────────────────────────────────── */
  {
    id: 'g6pd', ruta: 'pentosas', paso: 1, enzima: 'Glucosa-6-fosfato deshidrogenasa', alias: 'G6PD',
    de: ['g6p'], a: ['lactona'], gasta: ['NADP⁺'], forma: ['NADPH'],
    tipo: 'Oxidación (fase oxidativa, irreversible)', irreversible: true, regulada: true,
    notas: [
      { t: 'Es el paso regulado de la vía.' },
      { t: 'Balance de la fase oxidativa: glucosa-6-P + 2 NADP⁺ + H₂O dan ribosa-5-P + CO₂ + 2 NADPH. No produce ni consume ATP, y no usa NADH ni FADH₂.' },
      { t: 'El NADPH sirve para las biosíntesis reductoras (ácidos grasos, colesterol, hormonas esteroideas) y para mantener el glutatión reducido, la defensa antioxidante del glóbulo rojo, que no tiene otra fuente de NADPH.' },
      { t: 'La vía de las pentosas es la principal fuente de NADPH, pero no la única: también lo dan la enzima málica y la isocitrato deshidrogenasa dependiente de NADP del citosol.' },
    ],
    regulacion: {
      inhiben: ['NADPH'],
      activan: ['NADP⁺'],
      notas: [{ t: 'Cuando se gasta NADPH en biosíntesis, sube el NADP⁺ y la vía se acelera.' }],
    },
    inhibidores: [
      { nombre: 'Deficiencia de G6PD', plus: true, t: 'La enzimopatía más frecuente. El glóbulo rojo no puede regenerar glutatión, y ante un estrés oxidativo se hemoliza. Lo desencadenan las habas (favismo), la primaquina y otros antipalúdicos, y algunas sulfas. La deficiencia protege contra la malaria.' },
    ],
  },
  {
    id: 'lactonasa', ruta: 'pentosas', paso: 2, enzima: 'Lactonasa', alias: '6-fosfogluconolactonasa',
    de: ['lactona'], a: ['pg6'], gasta: ['H₂O'],
    tipo: 'Hidrólisis: abre el anillo con agua',
  },
  {
    id: 'pgd6', ruta: 'pentosas', paso: 3, enzima: '6-Fosfogluconato deshidrogenasa',
    de: ['pg6'], a: ['ru5p'], gasta: ['NADP⁺'], forma: ['NADPH', 'CO₂'],
    tipo: 'Descarboxilación oxidativa',
  },
  {
    id: 'rpi', ruta: 'pentosas', paso: 4, enzima: 'Ribosa-5-fosfato isomerasa',
    de: ['ru5p'], a: ['r5p'], reversible: true,
    tipo: 'Isomerización',
  },

  /* ── Glucógeno ──────────────────────────────────────────────────────────── */
  {
    id: 'pgmutasa', ruta: 'glucogeno', enzima: 'Fosfoglucomutasa',
    de: ['g6p'], a: ['g1p'], reversible: true, rotulo: 'arriba',
    tipo: 'Isomerización',
    notas: [
      { t: 'Usa como intermediario la glucosa-1,6-bisfosfato, en pequeñas concentraciones.' },
      { t: 'Trabaja en los dos sentidos: hacia glucosa-1-P en la síntesis del glucógeno y hacia glucosa-6-P en la degradación.' },
    ],
  },
  {
    id: 'ugp', ruta: 'glucogeno', enzima: 'UDP-glucosa pirofosforilasa',
    de: ['g1p'], a: ['udpglc'], gasta: ['UTP'], forma: ['PPi'], rotulo: 'arriba',
    tipo: 'Activación de la glucosa (transferasa)',
    notas: [
      { t: 'Es un homooctámero citoplasmático.' },
      { t: 'Su ΔG es casi cero; la reacción avanza porque la pirofosfatasa hidroliza enseguida el PPi.' },
    ],
  },
  {
    id: 'sintasa', ruta: 'glucogeno', enzima: 'Glucógeno sintasa',
    de: ['udpglc'], a: ['glucogeno'], forma: ['UDP'],
    tipo: 'Agrega glucosa al extremo no reductor con un enlace α(1,4)', regulada: true,
    notas: [
      { t: 'Es la enzima reguladora de la síntesis. Tiene dos isoenzimas: la 1 en el músculo y la 2 en el hígado.' },
      { t: 'No puede empezar una cadena: necesita un cebador (la glucogenina).' },
      { t: 'Enzima ramificante (una transferasa, no una quinasa): cuando una cadena llega a unos 11 residuos, corta un bloque de 6 a 7 glucosas y lo une con un enlace α(1,6) a una cadena vecina o a otra parte de la misma.' },
    ],
    regulacion: {
      inhiben: [],
      activan: ['Glucosa-6-P (alostérica)'],
      notas: [
        { t: 'Fosforilada está inactiva; desfosforilada, activa. Al revés que la fosforilasa.' },
        { t: 'Insulina (después de comer): activa la fosfoproteína fosfatasa 1, que desfosforila las dos enzimas, e inactiva la glucógeno sintasa quinasa 3. Resultado: glucogenogénesis.' },
        { t: 'Glucagón y adrenalina: la PKA fosforila la sintasa y la inactiva.' },
      ],
    },
  },
  {
    id: 'fosforilasa', ruta: 'glucogeno', enzima: 'Glucógeno fosforilasa',
    de: ['glucogeno'], a: ['g1p'], gasta: ['Pi'], lado: 'izq',
    tipo: 'Fosforólisis de los enlaces α(1,4)', regulada: true,
    notas: [
      { t: 'Rompe los enlaces desde los extremos no reductores con fosfato inorgánico, no con agua, y libera glucosa-1-P. Así se ahorra un ATP: la glucosa sale ya fosforilada.' },
      { t: 'Usa piridoxal fosfato (vitamina B6) como coenzima. Se detiene a 4 residuos de una rama.' },
      { t: 'Enzima desramificante, bifuncional: su actividad transferasa mueve un bloque de 3 glucosas a otra cadena, y su actividad amilo-α-1,6-glucosidasa hidroliza la última glucosa de la rama, que sale como glucosa libre.' },
      { t: 'El destino depende del tejido: en el hígado, la glucosa-6-fosfatasa libera glucosa a la sangre; en el músculo, la glucosa-6-P va a la glucólisis.' },
    ],
    regulacion: {
      inhiben: ['ATP', 'Glucosa-6-P', 'Glucosa (en el hígado)'],
      activan: ['AMP y Ca²⁺ (en el músculo)'],
      notas: [
        { t: 'Fosforilada está activa (forma a); desfosforilada, inactiva (forma b).' },
        { t: 'Glucagón (hígado, en la hipoglucemia) y adrenalina (hígado y músculo): AMPc y PKA, que fosforila la fosforilasa quinasa; esta fosforila la fosforilasa. Resultado: glucogenólisis. La cascada amplifica la señal.' },
        { t: 'En el músculo, el Ca²⁺ de la contracción activa la fosforilasa quinasa y el AMP activa la fosforilasa b: el músculo degrada glucógeno cuando trabaja, aun sin hormonas.' },
        { t: 'En el hígado, la glucosa se une a la fosforilasa a y favorece que la desfosforilen: con la glucemia alta se frena la degradación.' },
      ],
    },
    inhibidores: [
      { nombre: 'Glucogenosis V, McArdle', plus: true, t: 'Falta la fosforilasa muscular: calambres y fatiga con el ejercicio.' },
      { nombre: 'Glucogenosis II, Pompe', plus: true, t: 'Falta la α-glucosidasa lisosómica: el glucógeno se acumula en los lisosomas (corazón, músculo).' },
    ],
  },
  /* ── Cadena respiratoria ────────────────────────────────────────────────── */
  {
    id: 'c1', ruta: 'cadena', sigla: 'I', enzima: 'Complejo I', alias: 'NADH deshidrogenasa (NADH-ubiquinona oxidorreductasa)',
    de: ['nadh'], a: ['coq'], bombea: 4,
    tipo: 'Transferencia de electrones del NADH a la coenzima Q',
    notas: [
      { t: 'Grupos prostéticos: FMN y centros Fe-S.' },
      { t: 'Bombea 4 H⁺ por cada par de electrones, de la matriz al espacio intermembrana.' },
    ],
    inhibidores: [
      { nombre: 'Rotenona', t: 'Un insecticida natural.' },
      { nombre: 'Amital', t: 'Un barbitúrico.' },
    ],
  },
  {
    id: 'c2', ruta: 'cadena', sigla: 'II', enzima: 'Complejo II', alias: 'Succinato deshidrogenasa (la del ciclo de Krebs)',
    de: ['fadh2'], a: ['coq'],
    tipo: 'Transferencia de electrones del succinato (FADH₂) a la coenzima Q',
    notas: [
      { t: 'Grupos prostéticos: FAD, centros Fe-S y citocromo b₅₆₀.' },
      { t: 'Es el único complejo que no bombea protones: la diferencia de potencial entre el succinato y la coenzima Q es mínima.' },
    ],
    inhibidores: [{ nombre: 'Malonato', t: 'Inhibidor competitivo: se parece al succinato.' }],
  },
  {
    id: 'c3', ruta: 'cadena', sigla: 'III', enzima: 'Complejo III', alias: 'Citocromo bc₁ (ubiquinona-citocromo c oxidorreductasa)',
    de: ['coq'], a: ['citc'], bombea: 4,
    tipo: 'Transferencia de electrones de la coenzima Q al citocromo c',
    notas: [
      { t: 'Grupos prostéticos: citocromos b y c₁, y un centro Fe-S.' },
      { t: 'Bombea 4 H⁺ por cada par de electrones.' },
    ],
    inhibidores: [{ nombre: 'Antimicina A', t: 'Bloquea el complejo III.' }],
  },
  {
    id: 'c4', ruta: 'cadena', sigla: 'IV', enzima: 'Complejo IV', alias: 'Citocromo c oxidasa',
    de: ['citc'], a: ['agua'], gasta: ['O₂'], bombea: 2,
    tipo: 'Reducción del O₂, el último aceptor, a agua',
    notas: [
      { t: 'Grupos prostéticos: citocromos a y a₃, y cobre.' },
      { t: 'Retiene el O₂ hasta tener los cuatro electrones juntos, para que no se escapen intermediarios parciales (radicales libres).' },
      { t: 'Bombea 2 H⁺ por cada par de electrones.' },
    ],
    inhibidores: [
      { nombre: 'Cianuro y monóxido de carbono', t: 'Se unen al hierro del hemo a₃. El cianuro es tan tóxico porque frena la respiración de todas las células.' },
      { nombre: 'Azida', plus: true, t: 'También se une al hemo a₃.' },
    ],
  },
  {
    id: 'c5', ruta: 'cadena', sigla: 'V', enzima: 'ATP sintasa',
    de: ['adp'], a: ['atp'],
    tipo: 'Fosforilación oxidativa: los protones que vuelven a la matriz dan la energía',
    notas: [
      { t: 'Teoría quimiosmótica (Mitchell): la caída de los electrones bombea protones al espacio intermembrana; como la membrana interna es impermeable a ellos, se forma un gradiente electroquímico (la fuerza protonmotriz); los protones solo pueden volver por la ATP sintasa.' },
      { t: 'F₀ está embebida en la membrana interna y forma el canal de protones; F₁ sobresale hacia la matriz y tiene los sitios catalíticos, en sus tres subunidades β.' },
      { t: 'Los protones hacen girar el anillo de subunidades c, como una turbina; con él gira el tallo central dentro de la cabeza F₁, que no gira, y le cambia la forma a cada subunidad β.' },
      { t: 'Mecanismo de cambio de unión (Boyer): cada sitio pasa por tres estados. L (laxo) une ADP y Pi; T (tenso) forma el ATP; O (abierto) lo libera. Cada vuelta completa produce tres ATP.' },
      { t: 'La energía de los protones no se usa para formar el enlace, sino para liberar el ATP ya formado.' },
      { t: 'Con 4 H⁺ por ATP, el NADH rinde 10/4 = 2,5 y el FADH₂, 6/4 = 1,5.' },
    ],
    inhibidores: [
      { nombre: 'Oligomicina', plus: true, t: 'Inhibe la ATP sintasa.' },
      { nombre: 'Desacoplantes', plus: true, t: 'Dejan pasar protones a través de la membrana interna sin pasar por la ATP sintasa: la cadena sigue consumiendo O₂ pero no se forma ATP, y la energía se libera como calor. El 2,4-dinitrofenol se vendió como pastilla para adelgazar y causó muertes por hipertermia. La termogenina (UCP1) es un desacoplante natural del tejido adiposo pardo.' },
    ],
  },

  /* ── Oxidación de los ácidos grasos: activación y entrada ───────────────── */
  {
    id: 'acs', ruta: 'betaox', enzima: 'Acil-CoA sintetasa',
    de: ['ag'], a: ['acil_cit'], gasta: ['CoA', 'ATP'], forma: ['AMP', 'PPi'],
    lugar: 'Citosol (membrana mitocondrial externa)',
    tipo: 'Activación: une el ácido graso a la CoA',
    notas: [
      { t: 'Pasa por un intermediario acil-adenilato y forma un enlace tioéster de alta energía.' },
      { t: 'La pirofosfatasa hidroliza el PPi: la activación cuesta dos enlaces de alta energía.' },
    ],
  },
  {
    id: 'cpt1', ruta: 'betaox', enzima: 'CPT-I', alias: 'Carnitina palmitoil transferasa I',
    de: ['acil_cit'], a: ['acilcarnitina'], regulada: true,
    lugar: 'Membrana mitocondrial externa',
    tipo: 'Pasa el acilo de la CoA a la carnitina',
    notas: [
      { t: 'Es el paso limitante y el principal punto de regulación de la oxidación de ácidos grasos.' },
      { t: 'La membrana interna es impermeable al acil-CoA de cadena larga: por eso hace falta la lanzadera de carnitina.' },
    ],
    regulacion: {
      inhiben: ['Malonil-CoA'],
      activan: [],
      notas: [
        { t: 'El malonil-CoA es el primer intermediario de la síntesis de ácidos grasos. Cuando hay glucosa e insulina de sobra, impide que los ácidos grasos entren a la mitocondria a oxidarse.' },
        { t: 'En el ayuno, el glucagón y la adrenalina inactivan la acetil-CoA carboxilasa (por PKA y por la AMPK): baja el malonil-CoA, la CPT-I queda libre y se oxidan ácidos grasos. Después de comer, la insulina hace lo contrario.' },
        { t: 'Por eso la CPT-I es también clave en la regulación de la cetogénesis.' },
      ],
    },
    inhibidores: [
      { nombre: 'Deficiencia de carnitina o de CPT-I', plus: true, t: 'Impide oxidar ácidos grasos: en el ayuno aparecen hipoglucemia sin cetonas, debilidad muscular y acumulación de grasa.' },
    ],
  },
  {
    id: 'cpt2', ruta: 'betaox', enzima: 'Translocasa y CPT-II',
    de: ['acilcarnitina'], a: ['acil_m'],
    rot: { x: 1288, y: 900, ancla: 'start' },
    lugar: 'Membrana mitocondrial interna',
    tipo: 'Entrada a la matriz y devolución del acilo a una CoA',
    notas: [
      { t: 'Una translocasa de la membrana interna lleva la acil-carnitina a la matriz, a cambio de carnitina libre.' },
      { t: 'La CPT-II, en la cara interna, devuelve el acilo a una CoA de la matriz: queda acil-CoA listo para oxidarse.' },
    ],
  },

  /* ── β-oxidación: las cuatro reacciones de cada vuelta ──────────────────── */
  {
    id: 'acad', ruta: 'betaox', paso: 1, enzima: 'Acil-CoA deshidrogenasa',
    de: ['acil_m'], a: ['enoil'], gasta: ['FAD'], forma: ['FADH₂'],
    rot: { x: 1352, y: 1132, ancla: 'start' },
    lugar: 'Matriz mitocondrial',
    tipo: 'Oxidación: forma un doble enlace trans entre C-2 y C-3',
    notas: [
      { t: 'Se llama β-oxidación porque se oxida el carbono beta (C-3). Cada vuelta tiene cuatro reacciones y saca dos carbonos del extremo carboxilo como acetil-CoA.' },
      { t: 'Su FADH₂ cede los electrones directamente a la coenzima Q.' },
      { t: 'Es la misma secuencia química que en el ciclo de Krebs lleva de succinato a oxalacetato: oxidación con FAD, hidratación, oxidación con NAD⁺.' },
    ],
    inhibidores: [
      { nombre: 'Deficiencia de la acil-CoA deshidrogenasa de cadena media', plus: true, t: 'Impide oxidar ácidos grasos: hipoglucemia sin cetonas en el ayuno.' },
    ],
  },
  {
    id: 'ech', ruta: 'betaox', paso: 2, enzima: 'Enoil-CoA hidratasa',
    de: ['enoil'], a: ['hidroxiacil'], gasta: ['H₂O'],
    rot: { x: 1352, y: 1272, ancla: 'start' },
    lugar: 'Matriz mitocondrial',
    tipo: 'Hidratación: agrega agua al doble enlace',
  },
  {
    id: 'hadh', ruta: 'betaox', paso: 3, enzima: '3-Hidroxiacil-CoA deshidrogenasa',
    de: ['hidroxiacil'], a: ['cetoacil'], gasta: ['NAD⁺'], forma: ['NADH'],
    rot: { x: 1188, y: 1272, ancla: 'end' },
    lugar: 'Matriz mitocondrial',
    tipo: 'Oxidación del OH a cetona',
    regulacion: { inhiben: ['Cociente NADH/NAD⁺ alto'], activan: [] },
  },
  {
    id: 'tiolasa', ruta: 'betaox', paso: 4, enzima: 'Tiolasa',
    de: ['cetoacil'], a: ['acil_m', 'acetilcoa'], gasta: ['CoA'],
    rot: { x: 1188, y: 1132, ancla: 'end' },
    lugar: 'Matriz mitocondrial',
    tipo: 'Tiólisis: una CoA corta entre C-2 y C-3',
    notas: [
      { t: 'Da acetil-CoA y un acil-CoA con dos carbonos menos, que empieza otra vuelta.' },
      { t: 'Palmitato (16 C): 7 vueltas dan 8 acetil-CoA + 7 FADH₂ + 7 NADH. El acetil-CoA va al ciclo de Krebs y el FADH₂ y el NADH, a la cadena respiratoria.' },
      { plus: true, t: 'Cadena impar: la última vuelta deja propionil-CoA (3 C). La propionil-CoA carboxilasa (con biotina) y la metilmalonil-CoA mutasa (con vitamina B₁₂) lo convierten en succinil-CoA: es la única parte de un ácido graso que sirve para la gluconeogénesis.' },
      { plus: true, t: 'Insaturados: sus dobles enlaces cis necesitan una isomerasa (y una reductasa con NADPH si hay dos). Cadena muy larga (más de 22 C) y ramificados: la β-oxidación empieza en los peroxisomas, con una oxidasa que forma H₂O₂.' },
    ],
    regulacion: { inhiben: ['Acetil-CoA alto'], activan: [] },
  },

  /* ── Cuerpos cetónicos ──────────────────────────────────────────────────── */
  {
    id: 'tiolasa_c', ruta: 'cetogenesis', paso: 1, enzima: 'Tiolasa',
    de: ['acetilcoa'], a: ['acetoacetil'], reversible: true, rotulo: 'arriba',
    lugar: 'Matriz mitocondrial del hígado',
    tipo: 'Une 2 acetil-CoA',
    notas: [
      { t: 'La cetogénesis ocurre cuando llega más acetil-CoA del que el ciclo de Krebs puede oxidar: en el ayuno prolongado y en la diabetes no controlada.' },
      { t: 'El hígado oxida muchos ácidos grasos y a la vez usa el oxalacetato para la gluconeogénesis. Sin oxalacetato, el acetil-CoA no puede entrar al ciclo de Krebs y se desvía a cuerpos cetónicos.' },
      { t: 'En la cetólisis trabaja al revés: corta el acetoacetil-CoA en 2 acetil-CoA.' },
    ],
  },
  {
    id: 'hmgs', ruta: 'cetogenesis', paso: 2, enzima: 'HMG-CoA sintasa', alias: 'la isoforma mitocondrial',
    de: ['acetoacetil'], a: ['hmgcoa'], gasta: ['Acetil-CoA'], regulada: true, rotulo: 'arriba',
    lugar: 'Matriz mitocondrial del hígado',
    tipo: 'Agrega otro acetil-CoA',
    notas: [
      { t: 'Es el paso regulado de la cetogénesis.' },
      { t: 'Es una isoforma distinta de la citosólica, que participa en la síntesis de colesterol.' },
    ],
  },
  {
    id: 'hmgl', ruta: 'cetogenesis', paso: 3, enzima: 'HMG-CoA liasa',
    de: ['hmgcoa'], a: ['acetoacetato'], forma: ['Acetil-CoA'], rotulo: 'arriba',
    lugar: 'Matriz mitocondrial del hígado',
    tipo: 'Rompe el HMG-CoA',
  },
  {
    id: 'bhbdh', ruta: 'cetogenesis', paso: 4, enzima: 'β-Hidroxibutirato deshidrogenasa',
    de: ['acetoacetato'], a: ['bhb'], gasta: ['NADH'], forma: ['NAD⁺'], reversible: true, lado: 'izq',
    lugar: 'Matriz mitocondrial',
    tipo: 'Reducción del acetoacetato',
    notas: [{ t: 'En los tejidos que usan cuerpos cetónicos trabaja al revés: el β-hidroxibutirato vuelve a acetoacetato, con NAD⁺.' }],
  },

  /* ── Síntesis de ácidos grasos ──────────────────────────────────────────── */
  {
    id: 'acl', ruta: 'lipogenesis', paso: 1, enzima: 'ATP-citrato liasa',
    de: ['citrato'], a: ['accoa_cit'], gasta: ['ATP'], forma: ['Oxalacetato'],
    rot: { x: 880, y: 885, ancla: 'start' },
    lugar: 'Citosol',
    tipo: 'Rompe el citrato en acetil-CoA y oxalacetato',
    notas: [
      { t: 'El acetil-CoA no atraviesa la membrana interna: sale como citrato, que se forma cuando sobran acetil-CoA y ATP.' },
      { t: 'El oxalacetato vuelve a la mitocondria, como malato o como piruvato. En ese camino, la enzima málica genera NADPH.' },
    ],
  },
  {
    id: 'acc', ruta: 'lipogenesis', paso: 2, enzima: 'Acetil-CoA carboxilasa',
    de: ['accoa_cit'], a: ['malonil'], gasta: ['ATP', 'HCO₃⁻'], forma: ['ADP'], regulada: true,
    lugar: 'Citosol',
    tipo: 'Carboxilación, con biotina',
    notas: [{ t: 'Es el paso limitante y regulado de la síntesis de ácidos grasos.' }],
    regulacion: {
      inhiben: ['Palmitoil-CoA (el producto)'],
      activan: ['Citrato (señal de que sobran acetil-CoA y ATP)'],
      notas: [
        { t: 'Covalente: la insulina la desfosforila y la activa; el glucagón y la adrenalina (por PKA) y la AMPK la fosforilan y la inactivan. Por eso la epinefrina y el glucagón inhiben la lipogénesis.' },
      ],
    },
  },
  {
    id: 'fas', ruta: 'lipogenesis', paso: 3, enzima: 'Ácido graso sintasa',
    de: ['malonil'], a: ['palmitato'], gasta: ['NADPH'], forma: ['CO₂'],
    lugar: 'Citosol',
    tipo: 'Ensamblaje: agrega dos carbonos por vuelta',
    notas: [
      { t: 'Es un complejo multienzimático: en los animales, un dímero de cadenas con siete actividades, una de ellas la proteína transportadora de acilos (ACP), que lleva el sustrato de un sitio activo a otro con un brazo de fosfopanteteína.' },
      { t: 'Cada vuelta tiene cuatro pasos: condensación (sale CO₂), reducción con NADPH, deshidratación y reducción con NADPH. Después de 7 vueltas, una tioesterasa libera el palmitato.' },
      { t: 'Balance: 8 acetil-CoA + 7 ATP + 14 NADPH dan palmitato. El NADPH sale de la vía de las pentosas y de la enzima málica. La síntesis no produce ATP: lo consume.' },
      { t: 'No es la β-oxidación al revés: ocurre en el citosol, el transportador del acilo es la ACP (no la CoA), la unidad de dos carbonos entra como malonil-CoA y la coenzima es el NADPH.' },
    ],
  },
  /* ── Síntesis de colesterol ─────────────────────────────────────────────── */
  {
    id: 'hmgs_cit', ruta: 'colesterol', paso: 1, enzima: 'Tiolasa y HMG-CoA sintasa', alias: 'la isoforma citosólica',
    de: ['accoa_cit'], a: ['hmg_cit'],
    rot: { x: 1450, y: 856, ancla: 'middle' }, insigniaEn: 0.72,
    lugar: 'Citosol',
    tipo: 'Tres acetil-CoA forman HMG-CoA',
    notas: [{ t: 'La HMG-CoA sintasa citosólica es una isoforma distinta de la mitocondrial de la cetogénesis.' }],
  },
  {
    id: 'hmgr', ruta: 'colesterol', paso: 2, enzima: 'HMG-CoA reductasa',
    de: ['hmg_cit'], a: ['mevalonato'], gasta: ['NADPH'], irreversible: true, regulada: true,
    lugar: 'Retículo endoplasmático liso',
    tipo: 'Reducción a mevalonato, con 2 NADPH',
    notas: [
      { t: 'Es el paso limitante, comprometido e irreversible de la síntesis de colesterol.' },
      { t: 'Es una síntesis cara: gasta mucho ATP y NADPH.' },
    ],
    regulacion: {
      inhiben: ['Colesterol (y sus derivados oxidados)'],
      activan: [],
      notas: [
        { t: 'Cuando sube el colesterol dentro de la célula, se frena su transcripción (por el SREBP) y se acelera su degradación.' },
        { t: 'Hormonas: la insulina la activa (por desfosforilación); el glucagón y la AMPK la fosforilan y la inactivan.' },
        { plus: true, t: 'El mevalonato y otros productos de la vía también la retroinhiben.' },
      ],
    },
    inhibidores: [
      { nombre: 'Estatinas', t: 'Análogos del mevalonato: la inhiben en forma competitiva (lovastatina, simvastatina, atorvastatina, rosuvastatina). Baja el colesterol dentro del hepatocito, se activa el SREBP, el hígado fabrica más receptores de LDL, capta más LDL de la sangre y el colesterol LDL plasmático baja.' },
      { nombre: 'Más sobre las estatinas', plus: true, t: 'Se toman de noche, cuando la síntesis es máxima (las de vida media corta). Su efecto adverso más importante es la miopatía. Se potencian con la ezetimiba, que bloquea la absorción intestinal de colesterol, y con las resinas que secuestran ácidos biliares.' },
    ],
  },
  {
    id: 'isoprenos', ruta: 'colesterol', paso: 3, enzima: 'Fosforilación y descarboxilación',
    de: ['mevalonato'], a: ['ipp'], gasta: ['ATP'], forma: ['CO₂'],
    lugar: 'Citosol',
    tipo: 'El mevalonato se fosforila con 3 ATP y se descarboxila',
  },
  {
    id: 'escualeno_s', ruta: 'colesterol', paso: 4, enzima: 'Condensación de seis isoprenos',
    de: ['ipp'], a: ['escualeno'],
    lugar: 'Retículo endoplasmático liso',
    tipo: 'Seis isoprenos se condensan en el escualeno (30 C)',
    notas: [{ t: 'Pasa por geranil y farnesil pirofosfato.' }],
  },
  {
    id: 'ciclacion', ruta: 'colesterol', paso: 5, enzima: 'Ciclación y unos 20 pasos',
    de: ['escualeno'], a: ['colesterol'],
    lugar: 'Retículo endoplasmático liso',
    tipo: 'El escualeno se cicla a lanosterol y de ahí a colesterol',
    notas: [{ t: 'Del lanosterol al colesterol se eliminan tres metilos y se mueven dobles enlaces: quedan 27 carbonos.' }],
  },
  {
    id: 'acat', ruta: 'colesterol', enzima: 'ACAT',
    de: ['colesterol'], a: ['esteres'], rotulo: 'arriba',
    lugar: 'Dentro de la célula',
    tipo: 'Esterifica el colesterol para guardarlo',
    regulacion: { inhiben: [], activan: ['Colesterol'], notas: [{ t: 'El colesterol que entra con la LDL la activa.' }] },
  },

  /* ── Lipoproteínas ──────────────────────────────────────────────────────── */
  {
    id: 'lpl_vldl', ruta: 'lipoproteinas', enzima: 'Lipoproteína lipasa', alias: 'LPL',
    de: ['vldl'], a: ['idl'], regulada: true,
    lugar: 'Endotelio de los capilares',
    tipo: 'Vía endógena: hidroliza los triglicéridos de la VLDL',
    notas: [
      { t: 'Está en el endotelio de los capilares del tejido adiposo, el músculo y la mama, anclada por heparán sulfato.' },
      { t: 'Hidroliza los triglicéridos a ácidos grasos y monoacilglicerol. Al perderlos, la VLDL queda como IDL.' },
    ],
    regulacion: {
      inhiben: ['Apo C-III'],
      activan: ['Apo C-II'],
      notas: [{ t: 'La insulina aumenta la del tejido adiposo; en el ayuno y el ejercicio aumenta la del músculo.' }],
    },
  },
  {
    id: 'lh', ruta: 'lipoproteinas', enzima: 'Lipasa hepática',
    de: ['idl'], a: ['ldl'],
    lugar: 'Hígado',
    tipo: 'Vía endógena: de IDL a LDL',
    notas: [{ t: 'Hidroliza triglicéridos y fosfolípidos de las IDL y las HDL. Parte de las IDL vuelve al hígado; el resto se convierte en LDL.' }],
  },
  {
    id: 'rldl', ruta: 'lipoproteinas', enzima: 'Receptor de LDL',
    de: ['ldl'], a: ['colesterol'], regulada: true,
    rot: { x: 1712, y: 300, ancla: 'start' },
    lugar: 'Membrana de las células',
    tipo: 'Endocitosis mediada por receptor',
    notas: [
      { t: 'Está en fosas recubiertas de clatrina. Une la LDL por la apo B-100 y la mete en la célula por endocitosis.' },
      { t: 'En el lisosoma se degradan las proteínas y se liberan el colesterol y los ácidos grasos. El receptor vuelve a la membrana.' },
      { t: 'El colesterol que entró inhibe la HMG-CoA reductasa, activa la ACAT y reprime la síntesis de más receptores.' },
    ],
    regulacion: { inhiben: ['Colesterol (reprime la síntesis de receptores)'], activan: [] },
    inhibidores: [
      { nombre: 'Hipercolesterolemia familiar', t: 'Receptores de LDL defectuosos o ausentes: la LDL no se capta y se acumula en sangre. Los homocigotas tienen aterosclerosis grave desde la infancia.' },
      { nombre: 'Dislipemias', plus: true, t: 'La clasificación de Fredrickson ordena las hiperlipoproteinemias según la lipoproteína elevada; la IIa (LDL alta) es la de la hipercolesterolemia familiar. Fármacos: estatinas, ezetimiba, fibratos (activan el PPARα y bajan los triglicéridos) y omega-3.' },
    ],
  },
  {
    id: 'lpl_qm', ruta: 'lipoproteinas', enzima: 'Lipoproteína lipasa', alias: 'LPL',
    de: ['qm'], a: ['remanente'], regulada: true,
    lugar: 'Endotelio de los capilares',
    tipo: 'Vía exógena: hidroliza los triglicéridos del quilomicrón',
    notas: [{ t: 'Los ácidos grasos entran al músculo y al tejido adiposo. Quedan los remanentes de quilomicrones, ricos en colesterol.' }],
    regulacion: { inhiben: ['Apo C-III'], activan: ['Apo C-II'] },
    inhibidores: [{ nombre: 'Hipertrigliceridemia', plus: true, t: 'Cuando es muy alta puede dar pancreatitis.' }],
  },
  {
    id: 'captacion', ruta: 'lipoproteinas', enzima: 'Captación hepática por la apo E',
    de: ['remanente'], a: ['colesterol'],
    rot: { x: 1530, y: 340, ancla: 'end' },
    lugar: 'Hígado',
    tipo: 'Vía exógena: el hígado capta los remanentes',
    notas: [{ t: 'La apo E es el ligando de los receptores hepáticos de remanentes y del de LDL.' }],
  },
  {
    id: 'lcat', ruta: 'lipoproteinas', enzima: 'LCAT', alias: 'Lecitina colesterol aciltransferasa',
    de: ['hdl_n'], a: ['hdl'],
    lugar: 'Plasma (circula con la HDL)',
    tipo: 'Transporte reverso: esterifica el colesterol que toma la HDL',
    notas: [
      { t: 'Pasa un ácido graso de la lecitina al colesterol y forma ésteres de colesterol, que se meten en el núcleo de la HDL: la partícula se vuelve esférica.' },
    ],
    regulacion: { inhiben: [], activan: ['Apo A-I'] },
  },
  {
    id: 'cetp', ruta: 'lipoproteinas', enzima: 'CETP', alias: 'Proteína de transferencia de ésteres de colesterol',
    de: ['hdl'], a: ['ldl'],
    rot: { x: 1840, y: 150, ancla: 'middle' },
    lugar: 'Plasma',
    tipo: 'Pasa ésteres de colesterol de la HDL a las lipoproteínas con apo B',
    notas: [{ t: 'En sentido inverso pasa triglicéridos.' }],
  },
  {
    id: 'entrega', ruta: 'lipoproteinas', enzima: 'Entrega al hígado',
    de: ['hdl'], a: ['esteres'],
    lugar: 'Hígado',
    tipo: 'Transporte reverso: la HDL lleva el colesterol al hígado',
    notas: [
      { t: 'El hígado lo elimina como ácidos biliares.' },
      { plus: true, t: 'Lo entrega por un receptor que capta solo los ésteres (SR-B1) o pasándolo a otras lipoproteínas por la CETP.' },
    ],
  },
  /* ── El grupo amino: transdesaminación y transporte ─────────────────────── */
  {
    id: 'transaminasa', ruta: 'nitrogeno', enzima: 'Aminotransferasas', alias: 'Transaminasas: ALT (GPT) y AST (GOT)',
    de: ['aminoacido'], a: ['glutamato'], gasta: ['α-Cetoglutarato'], forma: ['α-Cetoácido'], reversible: true, rotulo: 'arriba',
    lugar: 'Citosol y mitocondria',
    tipo: 'Transaminación: el grupo α-amino pasa al α-cetoglutarato',
    notas: [
      { t: 'Es el primer paso para degradar casi todos los aminoácidos. El aminoácido queda como su α-cetoácido y el α-cetoglutarato se convierte en glutamato.' },
      { t: 'Son reversibles (ΔG cercano a cero): sirven tanto para degradar aminoácidos como para sintetizar los no esenciales a partir de su cetoácido.' },
      { t: 'Coenzima: el piridoxal fosfato (PLP), derivado de la vitamina B6, unido a una lisina por una base de Schiff. Mecanismo de doble desplazamiento (ping-pong): el PLP recibe el grupo amino y queda como piridoxamina fosfato; después se lo entrega al α-cetoglutarato.' },
      { t: 'ALT (alanina aminotransferasa, GPT): alanina + α-cetoglutarato dan piruvato + glutamato.' },
      { t: 'AST (aspartato aminotransferasa, GOT): aspartato + α-cetoglutarato dan oxalacetato + glutamato.' },
      { plus: true, t: 'El PLP es la coenzima de casi todas las reacciones de aminoácidos: transaminaciones, descarboxilaciones (de ahí salen las aminas biógenas) y racemizaciones. También es la de la glucógeno fosforilasa.' },
    ],
    inhibidores: [
      { nombre: 'En el diagnóstico', t: 'Las transaminasas son intracelulares: si suben en sangre, hubo daño de células. La ALT es más específica del hígado (hepatitis); la AST está además en el corazón y el músculo.' },
      { nombre: 'Isoniazida', plus: true, t: 'El antituberculoso atrapa la vitamina B6 y puede dar neuropatía si no se suplementa.' },
    ],
  },
  {
    id: 'gdh', ruta: 'nitrogeno', enzima: 'Glutamato deshidrogenasa',
    de: ['glutamato'], a: ['nh4'], gasta: ['NAD⁺'], forma: ['NADH', 'α-Cetoglutarato'], reversible: true, regulada: true, rotulo: 'arriba',
    lugar: 'Matriz mitocondrial del hígado',
    tipo: 'Desaminación oxidativa: libera el grupo amino como amonio',
    notas: [
      { t: 'Es de las pocas enzimas que usan tanto NAD⁺ como NADP⁺. Está también en el riñón.' },
      { t: 'Regenera el α-cetoglutarato que necesitan las transaminasas.' },
      { t: 'Transdesaminación: la transaminación (que junta los grupos amino en el glutamato) seguida de esta enzima (que los libera) es la vía principal por la que se saca el nitrógeno de los aminoácidos.' },
    ],
    regulacion: {
      inhiben: ['ATP', 'GTP'],
      activan: ['ADP', 'GDP'],
      notas: [{ t: 'Cuando falta energía, se degradan aminoácidos y su esqueleto va al ciclo de Krebs.' }],
    },
  },
  {
    id: 'gs', ruta: 'nitrogeno', enzima: 'Glutamina sintetasa',
    de: ['glutamato'], a: ['glutamina'], gasta: ['NH₄⁺', 'ATP'],
    via: { x: 1120, y: 1525 },
    lugar: 'La mayoría de los tejidos, incluido el cerebro',
    tipo: 'Une el amonio al glutamato',
    notas: [{ t: 'Es la puerta de entrada del amonio a los compuestos orgánicos.' }],
  },
  {
    id: 'glutaminasa', ruta: 'nitrogeno', enzima: 'Glutaminasa',
    de: ['glutamina'], a: ['glutamato'], forma: ['NH₄⁺'],
    via: { x: 1240, y: 1525 }, rot: { x: 1228, y: 1529, ancla: 'start' },
    lugar: 'Hígado y riñón',
    tipo: 'Libera el nitrógeno amídico de la glutamina',
    notas: [{ plus: true, t: 'En la acidosis, el riñón usa más glutamina y elimina el amonio por la orina, que así se lleva protones.' }],
  },

  /* ── Ciclo de la urea ───────────────────────────────────────────────────── */
  {
    id: 'cps1', ruta: 'urea', paso: 1, enzima: 'Carbamoil fosfato sintetasa I',
    de: ['nh4'], a: ['carbamoilp'], gasta: ['HCO₃⁻', 'ATP'], regulada: true, lado: 'izq',
    lugar: 'Matriz mitocondrial',
    tipo: 'NH₄⁺ + HCO₃⁻ + 2 ATP dan carbamoil fosfato',
    notas: [
      { t: 'Es el paso limitante del ciclo de la urea.' },
      { plus: true, t: 'Es distinta de la carbamoil fosfato sintetasa II del citosol, que fabrica pirimidinas.' },
    ],
    regulacion: {
      inhiben: [],
      activan: ['N-acetilglutamato (activador alostérico obligado)'],
      notas: [
        { t: 'A corto plazo: al N-acetilglutamato lo fabrica la N-acetilglutamato sintetasa a partir de acetil-CoA y glutamato, y a esta la activa la arginina. Cuando hay muchos aminoácidos, se forma más y el ciclo se acelera.' },
        { t: 'A largo plazo: cambia la cantidad de las cinco enzimas, que aumenta con las dietas ricas en proteínas y en el ayuno prolongado.' },
      ],
    },
    inhibidores: [
      { nombre: 'Defectos del ciclo de la urea', plus: true, t: 'Cualquier enzima que falte da hiperamonemia desde el nacimiento. Se tratan con dieta pobre en proteínas, con arginina y con compuestos que se llevan el nitrógeno por otra vía: el benzoato se une a la glicina y el fenilbutirato a la glutamina, y se excretan por la orina.' },
    ],
  },
  {
    id: 'otc', ruta: 'urea', paso: 2, enzima: 'Ornitina transcarbamilasa',
    de: ['ornitina', 'carbamoilp'], a: ['citrulina'],
    rot: { x: 1318, y: 1858, ancla: 'end' },
    lugar: 'Matriz mitocondrial',
    tipo: 'Carbamoil fosfato + ornitina dan citrulina',
    notas: [{ t: 'La citrulina sale al citosol.' }],
  },
  {
    id: 'ass', ruta: 'urea', paso: 3, enzima: 'Argininosuccinato sintetasa',
    de: ['citrulina', 'aspartato'], a: ['argsucc'], gasta: ['ATP'], forma: ['AMP', 'PPi'],
    rot: { x: 1354, y: 1996, ancla: 'start' },
    lugar: 'Citosol',
    tipo: 'Citrulina + aspartato dan argininosuccinato',
    notas: [
      { t: 'Acá entra el segundo nitrógeno de la urea, el del aspartato.' },
      { t: 'Costo del ciclo: 3 ATP por urea, pero equivalen a 4 enlaces de alta energía (dos ATP a ADP en el paso 1 y un ATP a AMP + PPi acá). Parte se recupera con el NADH de la malato deshidrogenasa.' },
    ],
  },
  {
    id: 'asl', ruta: 'urea', paso: 4, enzima: 'Argininosuccinato liasa',
    de: ['argsucc'], a: ['arginina'], forma: ['Fumarato'],
    rot: { x: 1148, y: 1996, ancla: 'end' },
    lugar: 'Citosol',
    tipo: 'Argininosuccinato da arginina + fumarato',
    notas: [{ t: 'El fumarato es la unión con el ciclo de Krebs: pasa a malato y a oxalacetato, que por transaminación vuelve a ser aspartato. Por eso se habla de la «bicicleta de Krebs».' }],
  },
  {
    id: 'arginasa', ruta: 'urea', paso: 5, enzima: 'Arginasa',
    de: ['arginina'], a: ['ornitina', 'urea'], gasta: ['H₂O'],
    rot: { x: 1148, y: 1812, ancla: 'end' },
    lugar: 'Citosol',
    tipo: 'Hidrólisis: arginina + H₂O dan urea + ornitina',
    notas: [{ t: 'La ornitina vuelve a la mitocondria para otra vuelta.' }],
  },
];

/* Lo que muestra el panel cuando no hay nada elegido: los balances. */
export const BALANCES = [
  {
    ruta: 'glucolisis', titulo: 'Glucólisis',
    ecuacion: ['Glucosa + 2 NAD⁺ + 2 ADP + 2 Pi', '2 piruvato + 2 NADH + 2 ATP + 2 H₂O'],
    notas: ['Se gastan 2 ATP y se forman 4: quedan 2 ATP netos.', 'La regulación actúa en los tres pasos irreversibles: 1, 3 y 10.'],
  },
  {
    ruta: 'puente', titulo: 'Piruvato deshidrogenasa',
    ecuacion: ['Piruvato + CoA + NAD⁺', 'Acetil-CoA + CO₂ + NADH'],
    notas: ['Por cada glucosa pasa dos veces.'],
  },
  {
    ruta: 'krebs', titulo: 'Ciclo de Krebs',
    ecuacion: ['Acetil-CoA + 3 NAD⁺ + FAD + GDP + Pi + 2 H₂O', '2 CO₂ + 3 NADH + 3 H⁺ + FADH₂ + GTP + CoA'],
    notas: [
      'No se obtiene ATP: se obtiene poder reductor. El ATP sale después, en la cadena respiratoria.',
      'Por cada glucosa entran dos acetil-CoA: el ciclo da dos vueltas.',
      'Lo controlan las tres enzimas de los pasos irreversibles (1, 3 y 4), la relación NADH/NAD⁺ y la disponibilidad de acetil-CoA y oxalacetato.',
    ],
  },
];

BALANCES.push(
  {
    ruta: 'gluconeogenesis', titulo: 'Gluconeogénesis',
    ecuacion: ['2 piruvato + 4 ATP + 2 GTP + 2 NADH', 'Glucosa'],
    notas: [
      'No es la glucólisis al revés: siete pasos son reversibles y se comparten; los tres irreversibles se rodean. Son tres rodeos con cuatro enzimas.',
      'Precursores: lactato, piruvato, aminoácidos glucogénicos (todos menos leucina y lisina) y glicerol, que entra como DHAP.',
      'En el hígado (alrededor del 90 %) y la corteza renal.',
    ],
  },
  {
    ruta: 'pentosas', titulo: 'Pentosas, fase oxidativa',
    ecuacion: ['Glucosa-6-P + 2 NADP⁺ + H₂O', 'Ribosa-5-P + CO₂ + 2 NADPH'],
    notas: ['No produce ni consume ATP.', 'Comparte con la glucólisis la glucosa-6-P, la fructosa-6-P y el gliceraldehído-3-P.'],
  },
);

BALANCES.push(
  {
    ruta: 'cadena', titulo: 'Cadena respiratoria',
    ecuacion: ['NADH o FADH₂ + O₂', 'H₂O + gradiente de H⁺'],
    notas: [
      'Por cada par de electrones, el NADH bombea 10 H⁺ y el FADH₂, 6.',
      'Si se bloquea cualquier complejo, los transportadores anteriores quedan reducidos y los posteriores, oxidados: el flujo de electrones se corta.',
    ],
  },
  {
    ruta: 'betaox', titulo: 'β-oxidación del palmitato',
    ecuacion: ['Palmitoil-CoA, 7 vueltas', '8 acetil-CoA + 7 FADH₂ + 7 NADH'],
    notas: [
      '106 ATP por palmitato (129 con los valores clásicos), ya restados los 2 enlaces de la activación.',
      'Por gramo, un ácido graso rinde más del doble que la glucosa, porque está mucho más reducido.',
    ],
  },
  {
    ruta: 'lipogenesis', titulo: 'Síntesis de palmitato',
    ecuacion: ['8 acetil-CoA + 7 ATP + 14 NADPH', 'Palmitato'],
    notas: ['En el citosol, cuando sobran glúcidos: hígado, tejido adiposo y glándula mamaria.'],
  },
);

BALANCES.push({
  ruta: 'lipoproteinas', titulo: 'Lipoproteínas: las tres vías',
  ecuacion: ['Quilomicrones, VLDL y HDL', 'Tejidos e hígado'],
  notas: [
    'Exógena (dieta): quilomicrón, lipoproteína lipasa, remanente, hígado.',
    'Endógena (hígado): VLDL, IDL, LDL, receptor de LDL.',
    'Transporte reverso: HDL naciente, LCAT, HDL madura, hígado.',
    'Cuanto más lípido tienen, más grandes y menos densas son.',
  ],
});

BALANCES.push({
  ruta: 'urea', titulo: 'Ciclo de la urea',
  ecuacion: ['NH₄⁺ + HCO₃⁻ + aspartato + 3 ATP', 'Urea + fumarato'],
  notas: [
    'En el hígado: los pasos 1 y 2 en la matriz mitocondrial, los otros tres en el citosol.',
    'Transdesaminación: las transaminasas juntan el nitrógeno en el glutamato y la glutamato deshidrogenasa lo libera como amonio.',
  ],
});

/* Lo que el metabolismo nitrogenado suma a metabolitos que ya estaban: son
   los puntos donde los aminoácidos se cruzan con el resto. */
function sumar(id, campo, texto) {
  const m = METABOLITOS.find((x) => x.id === id);
  (m[campo] ||= []).push(texto);
}
sumar('piruvato', 'llegadas', 'Alanina, por la ALT (ciclo glucosa-alanina).');
sumar('oaa', 'llegadas', 'Aspartato, por la AST.');
sumar('akg', 'llegadas', 'Glutamato, por la glutamato deshidrogenasa.');
sumar('fumarato', 'llegadas', 'Ciclo de la urea: el fumarato de la argininosuccinato liasa.');
sumar('acetoacetil', 'llegadas', 'Aminoácidos cetogénicos: leucina y lisina.');
sumar('pg3', 'salidas', 'Serina, glicina y cisteína.');

export const RENDIMIENTO = {
  filas: [
    ['Glucólisis', '2 ATP netos', '2'],
    ['Glucólisis', '2 NADH en el citosol', '5 o 3'],
    ['Piruvato deshidrogenasa (x 2)', '2 NADH', '5'],
    ['Ciclo de Krebs (x 2)', '6 NADH + 2 FADH₂ + 2 GTP', '20'],
  ],
  total: '30 a 32 ATP por glucosa',
  clasico: '36 a 38 con los valores clásicos (3 y 2 ATP por NADH y FADH₂)',
  nota: 'La diferencia entre 30 y 32 está en la lanzadera: la de malato-aspartato (hígado, corazón) mete los electrones como NADH; la de glicerol-3-fosfato (músculo esquelético, cerebro), por la coenzima Q, y rinde menos.',
};

/* ── Índices ───────────────────────────────────────────────────────────────── */

export const metabolito = (id) => METABOLITOS.find((m) => m.id === id) || null;
export const reaccion = (id) => REACCIONES.find((r) => r.id === id) || null;

/** Las reacciones que forman y las que consumen un metabolito. */
export function vecinas(id) {
  return {
    loForman: REACCIONES.filter((r) => r.a.includes(id)),
    loConsumen: REACCIONES.filter((r) => r.de.includes(id)),
  };
}

/** Qué pinta cada capa: la clase que lleva una reacción en el mapa. */
export function rasgos(r) {
  const tiene = (lista, ...que) => (lista || []).some((x) => que.includes(x));
  return {
    gastaAtp: tiene(r.gasta, 'ATP', 'GTP', 'UTP'),
    formaAtp: tiene(r.forma, 'ATP', 'GTP') || r.a.includes('atp'),
    reductor: tiene(r.forma, 'NADH', 'FADH₂', 'NADPH'),
    bombea: !!r.bombea,
    co2: tiene(r.forma, 'CO₂'),
    irreversible: !!r.irreversible,
    regulada: !!r.regulada,
    inhibida: !!(r.inhibidores && r.inhibidores.length),
  };
}

export const lugarDe = (r) => r.lugar || RUTAS[r.ruta].lugar;

export const etiquetaPaso = (r) => (r.sigla ? `${RUTAS[r.ruta].nombre} · ${r.sigla}` : r.paso ? `${RUTAS[r.ruta].nombre} · paso ${r.paso}` : RUTAS[r.ruta].nombre);
