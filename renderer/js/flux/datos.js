/* ═══════════════════════════════════════════════════════════════════════════
   FLUX — los datos del mapa
   Todo lo que dice una ficha sale de los apuntes de Química Biológica de Fran
   (U5 y U7). Nada se inventa acá: si el apunte no lo dice, la ficha no lo dice.
   Lo que el apunte marca como «plus» (excede a la cátedra) lleva `plus: true`.

   Un metabolito es un nodo; una reacción es una arista con su enzima. La
   geometría (x, y) está en unidades del lienzo del mapa (ver mapa.js).
   ═══════════════════════════════════════════════════════════════════════════ */

export const LIENZO = { w: 1050, h: 1560 };

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
  anaplerotica: { nombre: 'Reacción anaplerótica', lugar: 'Matriz mitocondrial', unidad: 'U5', seccion: 'Un ciclo anfibólico' },
};

/* Los PDF de los apuntes, relativos a la carpeta de teoría (ajuste `apuntesDir`). */
export const APUNTES = {
  U5: { titulo: 'U5 · Metabolismo energético', pdf: 'U5 metabolismo energético/U5 - Metabolismo energético.pdf' },
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
    formaAtp: tiene(r.forma, 'ATP', 'GTP'),
    reductor: tiene(r.forma, 'NADH', 'FADH₂', 'NADPH'),
    co2: tiene(r.forma, 'CO₂'),
    irreversible: !!r.irreversible,
    regulada: !!r.regulada,
    inhibida: !!(r.inhibidores && r.inhibidores.length),
  };
}

export const lugarDe = (r) => r.lugar || RUTAS[r.ruta].lugar;

export const etiquetaPaso = (r) => (r.paso ? `${RUTAS[r.ruta].nombre} · paso ${r.paso}` : RUTAS[r.ruta].nombre);
