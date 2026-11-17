import { frame, makeCanvas, slider, buttons, readout, onTheme, colors, mix, clear, fmt } from './kit.js';

// Grafo de cómputo de una neurona con pérdida cuadrática:
//   p1 = w1*x1, p2 = w2*x2, z = p1 + p2 + b, a = sigmoide(z), L = (a - y)^2
const NODES = {
  x1: [60, 60, 'x₁'], w1: [60, 130, 'w₁'], x2: [60, 230, 'x₂'], w2: [60, 300, 'w₂'], b: [220, 360, 'b'],
  p1: [220, 95, '×'], p2: [220, 265, '×'], z: [370, 180, '+'], a: [500, 180, 'σ'], y: [500, 320, 'y'], L: [620, 180, '(a−y)²']
};
const EDGES = [['x1', 'p1'], ['w1', 'p1'], ['x2', 'p2'], ['w2', 'p2'], ['p1', 'z'], ['p2', 'z'], ['b', 'z'], ['z', 'a'], ['a', 'L'], ['y', 'L']];
const FWD = ['p1', 'p2', 'z', 'a', 'L'];
const BWD = ['L', 'a', 'z', 'p1', 'p2', 'b', 'w1', 'w2'];
const WHY = {
  p1: (v) => `p₁ = w₁·x₁ = ${fmt(v.w1, 2)}·${fmt(v.x1, 2)} = ${fmt(v.p1)}`,
  p2: (v) => `p₂ = w₂·x₂ = ${fmt(v.w2, 2)}·${fmt(v.x2, 2)} = ${fmt(v.p2)}`,
  z: (v) => `z = p₁ + p₂ + b = ${fmt(v.z)}`,
  a: (v) => `a = σ(z) = 1/(1+e^−z) = ${fmt(v.a)}`,
  L: (v) => `L = (a − y)² = (${fmt(v.a)} − ${fmt(v.y, 2)})² = ${fmt(v.L, 4)}`
};
const WHYB = {
  L: () => '∂L/∂L = 1  (punto de partida)',
  a: (v, g) => `∂L/∂a = 2(a − y) = ${fmt(g.a)}`,
  z: (v, g) => `∂L/∂z = ∂L/∂a · σ′(z) = ${fmt(g.a)} · a(1−a) = ${fmt(g.a)} · ${fmt(v.a * (1 - v.a))} = ${fmt(g.z)}`,
  p1: (v, g) => `∂L/∂p₁ = ∂L/∂z · 1 = ${fmt(g.p1)}  (la suma reparte el gradiente)`,
  p2: (v, g) => `∂L/∂p₂ = ∂L/∂z · 1 = ${fmt(g.p2)}`,
  b: (v, g) => `∂L/∂b = ∂L/∂z · 1 = ${fmt(g.b)}`,
  w1: (v, g) => `∂L/∂w₁ = ∂L/∂p₁ · x₁ = ${fmt(g.p1)} · ${fmt(v.x1, 2)} = ${fmt(g.w1)}  (el producto intercambia los factores)`,
  w2: (v, g) => `∂L/∂w₂ = ∂L/∂p₂ · x₂ = ${fmt(g.p2)} · ${fmt(v.x2, 2)} = ${fmt(g.w2)}`
};

export default function mount(root) {
  const { stage, panel, foot } = frame(root);
  const c = makeCanvas(stage, 680, 400);
  const v = { x1: 1.0, x2: -0.5, w1: 0.8, w2: 0.4, b: 0.1, y: 1 };
  let g = {}, stepI = 0, msg = 'Pulsa «Siguiente paso» para empezar la pasada hacia delante.', updates = 0;
  function compute() {
    v.p1 = v.w1 * v.x1; v.p2 = v.w2 * v.x2; v.z = v.p1 + v.p2 + v.b; v.a = 1 / (1 + Math.exp(-v.z)); v.L = (v.a - v.y) ** 2;
    g = { L: 1 }; g.a = 2 * (v.a - v.y); g.z = g.a * v.a * (1 - v.a); g.p1 = g.z; g.p2 = g.z; g.b = g.z; g.w1 = g.p1 * v.x1; g.w2 = g.p2 * v.x2;
  }
  const shownF = () => new Set(['x1', 'x2', 'w1', 'w2', 'b', 'y', ...FWD.slice(0, Math.min(stepI, FWD.length))]);
  const shownB = () => new Set(BWD.slice(0, Math.max(0, stepI - FWD.length)));
  function next() {
    const total = FWD.length + BWD.length;
    if (stepI < FWD.length) msg = 'Hacia delante: ' + WHY[FWD[stepI]](v);
    else if (stepI < total) msg = 'Hacia atrás: ' + WHYB[BWD[stepI - FWD.length]](v, g);
    else { // actualizar los parámetros en contra del gradiente
      const lr = eta.value; v.w1 -= lr * g.w1; v.w2 -= lr * g.w2; v.b -= lr * g.b; updates++;
      const before = v.L; compute(); stepI = -1;
      msg = `Actualización: cada parámetro ← parámetro − η·gradiente. La pérdida pasa de ${fmt(before, 4)} a ${fmt(v.L, 4)}. Vuelve a empezar para otra iteración.`;
    }
    stepI++; draw();
  }
  function draw() {
    const col = colors(), { ctx } = c; clear(c, col); compute();
    const F = shownF(), B = shownB(), back = stepI > FWD.length;
    for (const [s, t] of EDGES) {
      const [x0, y0] = NODES[s], [x1, y1] = NODES[t];
      ctx.strokeStyle = back && B.has(s) ? col.a : (F.has(t) ? col.b : col.rule); ctx.lineWidth = back && B.has(s) ? 3 : 2;
      ctx.beginPath(); ctx.moveTo(x0 + 26, y0); ctx.lineTo(x1 - 26, y1); ctx.stroke();
    }
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const [k, [x, y, label]] of Object.entries(NODES)) {
      const isOp = FWD.includes(k), isParam = ['w1', 'w2', 'b'].includes(k);
      ctx.fillStyle = isOp ? (F.has(k) ? mix(col.b, col.surface, 0.8) : col.sunken) : (isParam ? mix(col.violet, col.surface, 0.82) : col.surface);
      ctx.strokeStyle = isParam ? col.violet : col.muted; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(x - 26, y - 20, 52, 40, isOp ? 20 : 5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = col.ink; ctx.font = '600 13px IBM Plex Sans, sans-serif'; ctx.fillText(label, x, y);
      ctx.font = '12px IBM Plex Mono, monospace';
      if (F.has(k)) { ctx.fillStyle = col.b; ctx.fillText(fmt(v[k], k === 'L' ? 4 : 3), x, y - 31); }
      if (B.has(k)) { ctx.fillStyle = col.a; ctx.fillText('∂ ' + fmt(g[k]), x, y + 32); }
    }
    ctx.textAlign = 'left'; ctx.font = '12px IBM Plex Sans, sans-serif';
    ctx.fillStyle = col.b; ctx.fillText('arriba, azul: valor (pasada hacia delante)', 330, 30);
    ctx.fillStyle = col.a; ctx.fillText('abajo, ámbar: ∂L/∂nodo (pasada hacia atrás)', 330, 48);
    info.innerHTML = `${msg}\n\nactualizaciones hechas: <b>${updates}</b>\npérdida actual: <b>${fmt(v.L, 5)}</b>`;
  }
  const set = (k) => (val) => { v[k] = val; stepI = 0; msg = 'Entradas cambiadas: empieza de nuevo.'; draw(); };
  slider(panel, { label: 'Entrada x₁', min: -2, max: 2, step: 0.1, value: v.x1, fmt: (x) => x.toFixed(1) }, set('x1'));
  slider(panel, { label: 'Entrada x₂', min: -2, max: 2, step: 0.1, value: v.x2, fmt: (x) => x.toFixed(1) }, set('x2'));
  slider(panel, { label: 'Objetivo y', min: 0, max: 1, step: 1, value: v.y }, set('y'));
  const eta = slider(panel, { label: 'Tasa de aprendizaje η', min: 0.1, max: 5, step: 0.1, value: 1, fmt: (x) => x.toFixed(1) });
  buttons(panel, [
    { label: 'Siguiente paso', primary: true, onclick: next },
    { label: 'Iteración completa', onclick: () => { do next(); while (stepI !== 0); } },
    { label: 'Reiniciar pesos', onclick: () => { Object.assign(v, { w1: 0.8, w2: 0.4, b: 0.1 }); stepI = 0; updates = 0; msg = 'Pesos reiniciados.'; draw(); } }
  ]);
  const info = readout(panel);
  info.style.whiteSpace = 'pre-wrap';
  onTheme(root, draw);
  foot('<b>Qué observar:</b> hacia delante se calculan y guardan los valores; hacia atrás cada nodo multiplica el gradiente que recibe por su derivada local (regla de la cadena) y lo pasa a sus entradas. Una sola pasada hacia atrás da el gradiente de <i>todos</i> los parámetros: eso es lo que hace eficiente a la retropropagación. Los nodos violetas son los parámetros que se actualizan.');
  draw();
}
