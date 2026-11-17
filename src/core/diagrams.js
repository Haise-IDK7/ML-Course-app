// Diagramas del curso como SVG generados por código (propios, sin imágenes externas).
// Usan las variables de color del tema, así que funcionan en claro, oscuro y en los PDF.
const INK = 'var(--ink)', MUTED = 'var(--muted)', RULE = 'var(--rule)', BLUE = 'var(--cobalt)', AMBER = 'var(--amber)', OK = 'var(--ok)', VIOLET = 'var(--violet)', BAD = 'var(--bad)';
const SOFT = { blue: 'var(--cobalt-soft)', amber: 'var(--amber-soft)', ok: 'var(--ok-soft)', bad: 'var(--bad-soft)', none: 'var(--surface)', sunken: 'var(--sunken)' };

const svg = (w, h, body, title) => `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${title}" font-family="IBM Plex Sans, sans-serif"><defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${MUTED}"/></marker></defs>${body}</svg>`;
const T = (x, y, t, { size = 13, anchor = 'middle', color = INK, weight = 400 } = {}) => `<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}" fill="${color}" font-weight="${weight}" dominant-baseline="middle">${t}</text>`;
const B = (x, y, w, h, t, { fill = 'none', stroke = MUTED, sub, r = 6, weight = 600, size = 13 } = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${SOFT[fill] || fill}" stroke="${stroke}" stroke-width="1.5"/>` +
  T(x + w / 2, y + h / 2 - (sub ? 8 : 0), t, { weight, size }) + (sub ? T(x + w / 2, y + h / 2 + 10, sub, { size: 11, color: MUTED }) : '');
const A = (x1, y1, x2, y2, { dash = '', color = MUTED } = {}) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.5" stroke-dasharray="${dash}" marker-end="url(#ah)"/>`;
const P = (d, { dash = '', color = MUTED, arrow = true } = {}) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="1.5" stroke-dasharray="${dash}" ${arrow ? 'marker-end="url(#ah)"' : ''}/>`;
const C = (x, y, r, { fill = 'none', stroke = MUTED, t, size = 12 } = {}) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${SOFT[fill] || fill}" stroke="${stroke}" stroke-width="1.5"/>` + (t ? T(x, y, t, { size, weight: 600 }) : '');

// Red totalmente conectada: capas = [3, 4, 4, 2]
function net(layers, x0, y0, w, h, labels = []) {
  const xs = layers.map((_, i) => x0 + (w * i) / (layers.length - 1));
  const ys = (n, j) => y0 + h / 2 + (j - (n - 1) / 2) * Math.min(46, h / n);
  let s = '';
  for (let l = 0; l < layers.length - 1; l++) for (let i = 0; i < layers[l]; i++) for (let j = 0; j < layers[l + 1]; j++) s += `<line x1="${xs[l]}" y1="${ys(layers[l], i)}" x2="${xs[l + 1]}" y2="${ys(layers[l + 1], j)}" stroke="${RULE}" stroke-width="1"/>`;
  layers.forEach((n, l) => { for (let i = 0; i < n; i++) s += C(xs[l], ys(n, i), 13, { fill: l === 0 ? 'amber' : l === layers.length - 1 ? 'ok' : 'blue', stroke: l === 0 ? AMBER : l === layers.length - 1 ? OK : BLUE }); if (labels[l]) s += T(xs[l], y0 + h + 16, labels[l], { size: 12, color: MUTED }); });
  return s;
}

export const FIGURES = {
  'ia-ml-dl': () => svg(700, 300,
    B(20, 15, 660, 270, '', { fill: 'none', r: 14 }) + T(40, 38, 'Inteligencia artificial: máquinas que realizan tareas que asociamos con inteligencia', { anchor: 'start', weight: 600 }) +
    T(40, 58, 'incluye sistemas de reglas, búsqueda y planificación que no aprenden de datos', { anchor: 'start', size: 12, color: MUTED }) +
    B(60, 78, 600, 190, '', { fill: 'blue', stroke: BLUE, r: 12 }) + T(80, 100, 'Machine learning: el comportamiento se aprende a partir de datos', { anchor: 'start', weight: 600 }) +
    T(80, 119, 'regresión, árboles, SVM, k-means, PCA…', { anchor: 'start', size: 12, color: MUTED }) +
    B(100, 136, 520, 118, '', { fill: 'none', stroke: BLUE, r: 10 }) + T(120, 158, 'Deep learning: redes neuronales con muchas capas', { anchor: 'start', weight: 600 }) +
    T(120, 177, 'CNN, RNN, Transformers, PINN', { anchor: 'start', size: 12, color: MUTED }) +
    B(140, 194, 440, 48, 'IA generativa y modelos fundacionales', { fill: 'amber', stroke: AMBER, sub: 'modelos de lenguaje, difusión', r: 8 }), 'IA contiene a machine learning, que contiene a deep learning'),

  tipos: () => {
    const cols = [
      ['Supervisado', 'cada ejemplo trae su respuesta', 'datos: (x, y)', ['regresión', 'clasificación'], 'blue', BLUE],
      ['No supervisado', 'solo hay entradas', 'datos: x', ['agrupamiento', 'reducción de dimensión', 'anomalías'], 'amber', AMBER],
      ['Semi-supervisado', 'pocas respuestas, muchas entradas', 'datos: pocos (x, y) + muchos x', ['pseudo-etiquetas', 'propagación en grafos'], 'ok', OK],
      ['Auto-supervisado', 'la respuesta se fabrica con el propio dato', 'datos: x → (x parcial, resto)', ['predecir lo oculto', 'contrastivo'], 'none', VIOLET],
      ['Por refuerzo', 'un agente actúa y recibe recompensas', 'datos: estados, acciones, recompensa', ['control', 'juegos'], 'bad', BAD]
    ];
    let s = B(250, 10, 300, 38, 'Machine learning: ¿de dónde viene la señal para aprender?', { size: 12 });
    cols.forEach(([t, a, d, items, fill, stroke], i) => {
      const x = 8 + i * 158;
      s += A(400, 48, x + 74, 74) + B(x, 76, 148, 46, t, { fill, stroke }) + T(x + 74, 138, a, { size: 10.5, color: MUTED }) + T(x + 74, 154, d, { size: 10.5, color: MUTED });
      items.forEach((it, j) => { s += B(x + 8, 170 + j * 32, 132, 26, it, { weight: 400, size: 11.5, r: 13 }); });
    });
    return svg(800, 272, s, 'Tipos de aprendizaje automático');
  },

  flujo: () => {
    const steps = ['Definir el problema', 'Reunir datos', 'Preparar y dividir', 'Entrenar modelo', 'Evaluar', 'Desplegar y vigilar'];
    let s = '';
    steps.forEach((t, i) => { const x = 8 + i * 132; s += B(x, 40, 118, 50, t, { size: 11.5, fill: i === 3 ? 'blue' : 'none', stroke: i === 3 ? BLUE : MUTED }); if (i < 5) s += A(x + 118, 65, x + 132, 65); });
    s += P('M 595 90 C 595 140, 330 140, 330 92', { dash: '5 4' }) + T(462, 142, 'si el error es alto: más datos, otras características, otro modelo', { size: 11.5, color: MUTED });
    s += P('M 727 40 C 727 6, 200 6, 200 38', { dash: '5 4' }) + T(462, 12, 'el mundo cambia: los datos nuevos se desvían y hay que reentrenar', { size: 11.5, color: MUTED });
    return svg(800, 160, s, 'Flujo de un proyecto de machine learning');
  },

  split: () => svg(700, 130,
    B(10, 30, 476, 44, 'Entrenamiento (70 %)', { fill: 'blue', stroke: BLUE }) + B(486, 30, 102, 44, 'Validación', { fill: 'amber', stroke: AMBER, sub: '15 %' }) + B(588, 30, 102, 44, 'Prueba', { fill: 'ok', stroke: OK, sub: '15 %' }) +
    T(248, 96, 'ajusta los parámetros (pesos)', { size: 12, color: MUTED }) + T(537, 96, 'elige hiperparámetros', { size: 12, color: MUTED }) + T(639, 96, 'se usa una vez,', { size: 12, color: MUTED }) + T(639, 112, 'al final', { size: 12, color: MUTED }) +
    T(10, 14, 'Todos los datos disponibles, mezclados al azar', { anchor: 'start', weight: 600 }), 'División en entrenamiento, validación y prueba'),

  kfold: () => {
    let s = T(10, 14, 'Validación cruzada con k = 5: cada bloque hace una vez de validación', { anchor: 'start', weight: 600 });
    for (let r = 0; r < 5; r++) { for (let k = 0; k < 5; k++) s += B(90 + k * 112, 30 + r * 30, 106, 24, k === r ? 'validación' : 'entrenamiento', { fill: k === r ? 'amber' : 'blue', stroke: k === r ? AMBER : BLUE, weight: 400, size: 11, r: 4 }); s += T(80, 42 + r * 30, `ronda ${r + 1}`, { anchor: 'end', size: 12, color: MUTED }); }
    return svg(700, 190, s + T(370, 180, 'resultado final = media (y desviación) de las 5 puntuaciones', { size: 12, color: MUTED }), 'Validación cruzada');
  },

  neurona: () => {
    let s = '';
    [['x₁', 40], ['x₂', 100], ['x₃', 160]].forEach(([t, y], i) => { s += C(60, y, 20, { fill: 'amber', stroke: AMBER, t }) + A(82, y, 268, 100 + (y - 100) * 0.25) + T(170, y + (100 - y) * 0.42 - 10, `w${'₁₂₃'[i]}`, { size: 12, color: BLUE, weight: 600 }); });
    s += C(300, 100, 34, { fill: 'blue', stroke: BLUE }) + T(300, 92, 'Σ', { size: 20, weight: 600 }) + T(300, 114, '+ b', { size: 12 }) + A(334, 100, 404, 100) + T(369, 86, 'z', { weight: 600 });
    s += B(406, 72, 90, 56, 'f(z)', { fill: 'none', stroke: VIOLET, sub: 'activación' }) + A(496, 100, 566, 100) + C(590, 100, 22, { fill: 'ok', stroke: OK, t: 'a' });
    s += T(300, 170, 'z = w₁x₁ + w₂x₂ + w₃x₃ + b', { size: 13 }) + T(545, 170, 'a = f(z)', { size: 13 }) + T(60, 196, 'entradas', { size: 12, color: MUTED }) + T(170, 196, 'pesos', { size: 12, color: MUTED }) + T(590, 136, 'salida', { size: 12, color: MUTED });
    return svg(660, 210, s, 'Esquema de una neurona artificial');
  },

  mlp: () => svg(660, 250, net([3, 5, 5, 2], 80, 14, 500, 190, ['capa de entrada', 'capa oculta 1', 'capa oculta 2', 'capa de salida']), 'Perceptrón multicapa'),

  bucle: () => {
    const st = [['Tomar un lote', 'de datos'], ['Pasada hacia delante', 'predicción ŷ'], ['Calcular la pérdida', 'L(ŷ, y)'], ['Retropropagación', 'gradientes ∂L/∂w'], ['Actualizar pesos', 'w ← w − η·∂L/∂w']];
    let s = '';
    st.forEach(([t, sub], i) => { const x = 8 + i * 158; s += B(x, 40, 144, 54, t, { sub, size: 12, fill: i === 3 ? 'amber' : i === 4 ? 'blue' : 'none', stroke: i === 3 ? AMBER : i === 4 ? BLUE : MUTED }); if (i < 4) s += A(x + 144, 67, x + 158, 67); });
    s += P('M 712 94 C 712 140, 80 140, 80 96', { dash: '5 4' }) + T(400, 142, 'se repite miles de veces; una pasada por todos los datos es una época', { size: 12, color: MUTED });
    return svg(800, 160, s, 'Bucle de entrenamiento');
  },

  cnn: () => {
    let s = '';
    const stack = (x, y, w, h, n, fill, stroke) => { let r = ''; for (let i = n - 1; i >= 0; i--) r += `<rect x="${x + i * 5}" y="${y - i * 5}" width="${w}" height="${h}" fill="${SOFT[fill]}" stroke="${stroke}" stroke-width="1.2"/>`; return r; };
    s += stack(20, 60, 90, 90, 1, 'amber', AMBER) + T(65, 172, 'imagen', { size: 12 }) + T(65, 188, '28×28×1', { size: 11, color: MUTED });
    s += A(114, 105, 146, 105) + stack(150, 64, 80, 80, 4, 'blue', BLUE) + T(198, 172, 'conv 3×3 + ReLU', { size: 12 }) + T(198, 188, '26×26×8', { size: 11, color: MUTED });
    s += A(252, 105, 284, 105) + stack(288, 82, 46, 46, 4, 'blue', BLUE) + T(318, 172, 'pooling 2×2', { size: 12 }) + T(318, 188, '13×13×8', { size: 11, color: MUTED });
    s += A(356, 105, 388, 105) + stack(392, 84, 40, 40, 7, 'blue', BLUE) + T(430, 172, 'conv + ReLU', { size: 12 }) + T(430, 188, '11×11×16', { size: 11, color: MUTED });
    s += A(470, 105, 502, 105) + stack(506, 94, 20, 20, 7, 'blue', BLUE) + T(535, 172, 'pooling', { size: 12 }) + T(535, 188, '5×5×16', { size: 11, color: MUTED });
    s += A(564, 105, 596, 105) + B(600, 40, 22, 130, '', { fill: 'none' }) + T(611, 188, 'aplanar', { size: 11, color: MUTED }) + T(611, 202, '400', { size: 11, color: MUTED });
    s += A(624, 105, 656, 105) + B(660, 60, 22, 90, '', { fill: 'ok', stroke: OK }) + T(672, 172, 'densa', { size: 12 }) + T(672, 188, '10 clases', { size: 11, color: MUTED });
    s += T(260, 18, 'extracción de características: el tamaño espacial baja, los canales suben', { size: 12, color: MUTED }) + T(650, 18, 'clasificación', { size: 12, color: MUTED });
    return svg(710, 214, s, 'Arquitectura típica de una CNN');
  },

  residual: () => svg(660, 170,
    T(30, 85, 'x', { weight: 600, size: 15 }) + A(42, 85, 88, 85) + B(90, 62, 100, 46, 'Capa', { sub: 'conv + norm.' }) + A(190, 85, 218, 85) + B(220, 62, 70, 46, 'ReLU', { fill: 'none', stroke: VIOLET }) + A(290, 85, 318, 85) + B(320, 62, 100, 46, 'Capa', { sub: 'conv + norm.' }) + A(420, 85, 458, 85) +
    C(478, 85, 18, { fill: 'amber', stroke: AMBER, t: '+', size: 18 }) + A(496, 85, 528, 85) + B(530, 62, 70, 46, 'ReLU', { fill: 'none', stroke: VIOLET }) + A(600, 85, 640, 85) +
    P('M 62 85 C 62 10, 478 10, 478 65', { color: AMBER }) + T(270, 20, 'conexión residual (atajo): copia x sin modificar', { size: 12, color: MUTED }) + T(270, 136, 'las capas aprenden solo la corrección F(x)', { size: 12, color: MUTED }) + T(478, 126, 'F(x) + x', { size: 12, weight: 600 }), 'Bloque residual'),

  rnn: () => {
    let s = '';
    for (let i = 0; i < 4; i++) { const x = 90 + i * 150; s += B(x, 70, 90, 46, `h${'₁₂₃₄'[i]}`, { fill: 'blue', stroke: BLUE, sub: 'misma celda' }) + C(x + 45, 160, 16, { fill: 'amber', stroke: AMBER, t: `x${'₁₂₃₄'[i]}` }) + A(x + 45, 142, x + 45, 118) + C(x + 45, 28, 16, { fill: 'ok', stroke: OK, t: `y${'₁₂₃₄'[i]}` }) + A(x + 45, 70, x + 45, 46); if (i < 3) s += A(x + 90, 93, x + 150, 93); }
    s += A(40, 93, 88, 93) + T(28, 93, 'h₀', { size: 12, color: MUTED }) + T(630, 160, 'los mismos pesos en cada paso', { anchor: 'end', size: 12, color: MUTED });
    return svg(680, 186, s, 'Red recurrente desplegada en el tiempo');
  },

  transformer: () => svg(700, 300,
    B(20, 232, 150, 44, 'Tokens', { fill: 'amber', stroke: AMBER, sub: 'texto troceado' }) + A(170, 254, 198, 254) + B(200, 232, 190, 44, 'Vectores + posición', { sub: 'embeddings' }) + P('M 390 254 L 440 254 L 440 222') +
    B(250, 30, 380, 190, '', { fill: 'sunken', stroke: RULE, r: 10 }) + T(266, 46, 'bloque Transformer, repetido N veces', { anchor: 'start', size: 12, color: MUTED }) +
    B(280, 150, 320, 46, 'Autoatención multi-cabeza', { fill: 'blue', stroke: BLUE, sub: 'cada token mira a los demás' }) + A(440, 150, 440, 128) + B(280, 80, 320, 46, 'Red densa (MLP)', { sub: 'procesa cada token por separado' }) +
    P('M 262 206 C 240 206, 240 138, 276 138', { color: AMBER }) + P('M 262 138 C 240 138, 240 68, 276 68', { color: AMBER }) + T(190, 140, 'conexiones residuales', { size: 11.5, color: MUTED }) + T(190, 156, '+ normalización', { size: 11.5, color: MUTED }) +
    P('M 440 80 L 440 20 L 652 20 L 652 100', {}) + B(604, 102, 90, 50, 'Salida', { fill: 'ok', stroke: OK, sub: 'siguiente token' }), 'Bloque Transformer'),

  autoencoder: () => svg(680, 210,
    B(20, 30, 70, 150, 'x', { fill: 'amber', stroke: AMBER, size: 16 }) + `<path d="M 110 30 L 290 80 L 290 130 L 110 180 Z" fill="${SOFT.blue}" stroke="${BLUE}" stroke-width="1.5"/>` + T(200, 105, 'Codificador', { weight: 600 }) +
    B(310, 80, 60, 50, 'z', { fill: 'none', stroke: VIOLET, size: 16 }) + T(340, 150, 'código latente', { size: 12, color: MUTED }) + T(340, 166, '(pocas dimensiones)', { size: 11, color: MUTED }) +
    `<path d="M 390 80 L 570 30 L 570 180 L 390 130 Z" fill="${SOFT.blue}" stroke="${BLUE}" stroke-width="1.5"/>` + T(480, 105, 'Decodificador', { weight: 600 }) + B(590, 30, 70, 150, 'x̂', { fill: 'ok', stroke: OK, size: 16 }) +
    A(90, 105, 108, 105) + A(292, 105, 308, 105) + A(372, 105, 388, 105) + A(572, 105, 588, 105) + T(340, 200, 'pérdida = diferencia entre x y su reconstrucción x̂', { size: 12, color: MUTED }), 'Autoencoder'),

  difusion: () => {
    let s = T(350, 16, 'proceso directo: añadir ruido gaussiano poco a poco (fijo, no se aprende)', { size: 12, color: MUTED });
    const lab = ['x₀', 'x₁', '…', 'x_t', '…', 'x_T'];
    lab.forEach((t, i) => { const x = 40 + i * 120; s += C(x + 20, 70, 26, { fill: i === 0 ? 'amber' : i === 5 ? 'sunken' : 'none', stroke: i === 0 ? AMBER : MUTED, t }); if (i < 5) s += A(x + 48, 60, x + 112, 60) + A(x + 112, 82, x + 48, 82, { color: BLUE }); });
    s += T(60, 112, 'dato real', { size: 12, color: MUTED }) + T(660, 112, 'ruido puro', { size: 12, color: MUTED }) + T(350, 136, 'proceso inverso: una red aprende a quitar un poco de ruido en cada paso', { size: 12, color: BLUE });
    return svg(700, 150, s, 'Proceso de difusión');
  },

  pinn: () => svg(800, 330,
    T(18, 97, 'x', { weight: 600, size: 14 }) + T(18, 143, 't', { weight: 600, size: 14 }) + net([2, 4, 4, 1], 48, 40, 242, 160) +
    T(165, 228, 'red neuronal u_θ(x, t)', { size: 12, color: MUTED }) + C(290, 120, 18, { fill: 'ok', stroke: OK, t: 'u' }) +
    A(310, 120, 356, 120) + B(358, 92, 150, 56, 'Diferenciación', { fill: 'none', stroke: VIOLET, sub: 'automática' }) + T(433, 164, 'u_t,  u_x,  u_xx …', { size: 12 }) +
    A(508, 110, 556, 76) + B(558, 40, 226, 56, 'Residuo de la ecuación', { fill: 'blue', stroke: BLUE, sub: 'r = u_t − α·u_xx   →   L_física' }) + T(671, 110, 'en puntos de colocación (sin datos)', { size: 11, color: MUTED }) +
    P('M 290 140 C 290 200, 520 180, 556 180') + B(558, 152, 226, 50, 'Condiciones inicial y de frontera', { size: 12, sub: 'u en los bordes   →   L_cond' }) +
    P('M 280 138 C 250 262, 520 262, 556 262') + B(558, 238, 226, 50, 'Mediciones (si las hay)', { fill: 'amber', stroke: AMBER, size: 12, sub: 'u frente a los datos   →   L_datos' }) +
    T(671, 310, 'L = λ₁·L_física + λ₂·L_cond + λ₃·L_datos', { weight: 600 }) +
    P('M 556 310 L 165 310 L 165 244', { dash: '5 4', color: BAD }) + T(350, 298, 'el optimizador ajusta θ para minimizar L', { size: 12, color: BAD }), 'Esquema de una red informada por la física')
};
