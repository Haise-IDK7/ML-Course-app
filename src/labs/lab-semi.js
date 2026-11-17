import { frame, makeCanvas, slider, buttons, readout, legend, animator, onTheme, Plot, colors, mix, clear } from './kit.js';
import { makeRng } from '../lib/rng.js';
import { moons } from '../lib/datasets.js';

// Propagación de etiquetas (Zhou et al., 2004): F <- alfa * S F + (1 - alfa) * Y,
// donde S es la matriz de similitud normalizada de un grafo de vecinos.
export default function mount(root) {
  const { stage, panel, foot } = frame(root);
  const c = makeCanvas(stage, 680, 330);
  const range = { x0: -1.15, x1: 1.15, y0: -0.85, y1: 0.85 };
  const A = new Plot(c.ctx, { x: 12, y: 30, w: 322, h: 288 }, range), B = new Plot(c.ctx, { x: 346, y: 30, w: 322, h: 288 }, range);
  const ALPHA = 0.9, K = 7;
  let seed = 3, X, y, lab, S, F, it;
  function gen() {
    const r = makeRng(seed); ({ X, y } = moons(220, 0.07, r));
    const n = X.length, W = Array.from({ length: n }, () => new Float64Array(n));
    X.forEach((p, i) => { // grafo de K vecinos con pesos gaussianos
      const d = X.map((q, j) => [(p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2, j]).sort((a, b) => a[0] - b[0]);
      for (let m = 1; m <= K; m++) { const [dd, j] = d[m], w = Math.exp(-dd / 0.02); W[i][j] = Math.max(W[i][j], w); W[j][i] = Math.max(W[j][i], w); }
    });
    const deg = W.map((row) => Math.sqrt(row.reduce((s, v) => s + v, 0)) || 1);
    S = W.map((row, i) => row.map((v, j) => v / (deg[i] * deg[j])));
    relabel(r);
  }
  function relabel(r = makeRng(seed * 31 + nl.value)) {
    lab = new Set();
    for (const cls of [0, 1]) { const ids = X.map((_, i) => i).filter((i) => y[i] === cls); for (let m = 0; m < nl.value / 2; m++) lab.add(ids[r.int(ids.length)]); }
    reset();
  }
  function reset() { F = X.map((_, i) => (lab.has(i) ? (y[i] ? 1 : -1) : 0)); it = 0; run.stop(); btn[1].textContent = 'Propagar'; draw(); }
  function step() {
    F = F.map((_, i) => { let s = 0; const row = S[i]; for (let j = 0; j < row.length; j++) if (row[j]) s += row[j] * F[j]; return ALPHA * s + (1 - ALPHA) * (lab.has(i) ? (y[i] ? 1 : -1) : 0); });
    it++;
  }
  const nn1 = (p) => { let b = 0, bd = Infinity; for (const i of lab) { const d = (p[0] - X[i][0]) ** 2 + (p[1] - X[i][1]) ** 2; if (d < bd) { bd = d; b = y[i]; } } return b; };
  function draw() {
    const col = colors(), { ctx } = c; clear(c, col);
    ctx.font = '600 13px IBM Plex Sans, sans-serif'; ctx.fillStyle = col.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('Supervisado: solo usa las etiquetadas', A.box.x, 15); ctx.fillText('Semi-supervisado: propaga por el grafo', B.box.x, 15);
    A.heat((px, py) => mix(mix(col.a, col.surface, 0.72), mix(col.b, col.surface, 0.72), nn1([px, py])), 8);
    ctx.fillStyle = col.surface; ctx.fillRect(B.box.x, B.box.y, B.box.w, B.box.h);
    let okA = 0, okB = 0, decided = 0;
    X.forEach((p, i) => {
      A.dot(p[0], p[1], mix(col.muted, col.surface, 0.5), 2.5);
      const f = F[i], t = Math.min(1, Math.abs(f) * 25);
      B.dot(p[0], p[1], f === 0 ? mix(col.muted, col.surface, 0.5) : mix(col.surface, f > 0 ? col.b : col.a, 0.25 + 0.75 * t), 3);
      okA += nn1(p) === y[i] ? 1 : 0; if (f !== 0) { decided++; okB += (f > 0 ? 1 : 0) === y[i] ? 1 : 0; }
    });
    for (const i of lab) for (const P of [A, B]) P.dot(X[i][0], X[i][1], y[i] ? col.b : col.a, 7, col.ink);
    info.innerHTML = `etiquetadas: <b>${lab.size}</b> de ${X.length}\niteración de propagación: <b>${it}</b>\n\nexactitud supervisado:      <b>${(100 * okA / X.length).toFixed(1)} %</b>\nexactitud semi-supervisado: <b>${decided ? (100 * okB / X.length).toFixed(1) + ' %' : '—'}</b>\npuntos con etiqueta propagada: ${decided}`;
  }
  const nl = slider(panel, { label: 'Puntos etiquetados', min: 2, max: 20, step: 2, value: 2 }, () => relabel());
  let last = 0;
  const run = animator(root, () => { const now = performance.now(); if (now - last > 90) { last = now; step(); draw(); if (it >= 80) { run.stop(); btn[1].textContent = 'Propagar'; } } });
  const btn = buttons(panel, [
    { label: 'Un paso', onclick: () => { step(); draw(); } },
    { label: 'Propagar', primary: true, onclick: () => { btn[1].textContent = run.toggle() ? 'Pausar' : 'Propagar'; } },
    { label: 'Reiniciar', onclick: reset },
    { label: 'Otras etiquetas', onclick: () => { seed++; gen(); } }
  ]);
  legend(panel, [[colors().a, 'clase 0'], [colors().b, 'clase 1'], [colors().muted, 'sin etiqueta']]);
  const info = readout(panel);
  onTheme(root, draw);
  foot('<b>Qué probar:</b> con solo 2 puntos etiquetados (los círculos grandes), el clasificador supervisado traza una frontera casi recta y falla en las puntas de las lunas. Pulsa «Propagar»: las etiquetas se difunden por las zonas densas y recuperan la forma. Funciona porque aquí se cumplen los supuestos de agrupamiento y de variedad: puntos cercanos y conectados por zonas densas comparten clase.');
  gen();
}
