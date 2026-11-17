import { frame, makeCanvas, pointer, slider, select, buttons, readout, onTheme, Plot, colors, mix, clear } from './kit.js';
import { makeRng } from '../lib/rng.js';
import { moons } from '../lib/datasets.js';

export default function mount(root) {
  const { stage, panel, foot } = frame(root);
  const c = makeCanvas(stage, 640, 420);
  const P = new Plot(c.ctx, { x: 36, y: 12, w: 592, h: 376 }, { x0: -1.2, x1: 1.2, y0: -0.9, y1: 0.9 });
  let seed = 3, X, y;
  const vote = (px, py, k, skip = -1) => { // fracción de vecinos de clase 1 entre los k más cercanos
    const d = X.map((p, i) => [i === skip ? Infinity : (p[0] - px) ** 2 + (p[1] - py) ** 2, y[i]]).sort((a, b) => a[0] - b[0]);
    let s = 0; for (let i = 0; i < k; i++) s += d[i][1];
    return s / k;
  };
  function gen() { ({ X, y } = moons(120, noise.value, makeRng(seed))); draw(); }
  function draw() {
    const col = colors(), k = Math.min(kk.value, X.length - 1); clear(c, col);
    P.heat((px, py) => { const v = vote(px, py, k); return mix(mix(col.a, col.surface, 0.6), mix(col.b, col.surface, 0.6), v); }, 8);
    P.frame({ ...col, surface: 'transparent' }, { xl: 'característica 1', yl: 'característica 2', zero: false });
    X.forEach((p, i) => P.dot(p[0], p[1], y[i] ? col.b : col.a, 4, col.surface));
    let ok = 0; X.forEach((p, i) => { ok += (vote(p[0], p[1], k, i) > 0.5 ? 1 : 0) === y[i] ? 1 : 0; });
    info.innerHTML = `k = <b>${k}</b>\nexactitud (dejando uno fuera): <b>${(100 * ok / X.length).toFixed(1)} %</b>\n${k <= 2 ? 'k pequeño → frontera irregular (varianza alta)' : k >= 40 ? 'k grande → frontera demasiado suave (sesgo alto)' : 'k intermedio'}`;
  }
  const kk = slider(panel, { label: 'Vecinos k', min: 1, max: 61, step: 2, value: 1 }, draw);
  const noise = slider(panel, { label: 'Ruido de los datos', min: 0.02, max: 0.3, step: 0.01, value: 0.14, fmt: (v) => v.toFixed(2) }, gen);
  const cls = select(panel, 'Clase del punto que añades', [['0', 'ámbar'], ['1', 'azul']], '0');
  buttons(panel, [{ label: 'Datos nuevos', onclick: () => { seed++; gen(); } }]);
  const info = readout(panel);
  pointer(c, { down: (x, yy) => { if (P.inside(x, yy)) { X.push([P.ix(x), P.iy(yy)]); y.push(+cls.value); draw(); } } });
  onTheme(root, draw);
  foot('<b>Qué probar:</b> con k = 1 cada punto ruidoso crea su propia «isla». Sube k: la frontera se suaviza y la exactitud medida sobre datos no vistos mejora… hasta que k es tan grande que el modelo ignora la forma de las lunas. Haz clic para añadir puntos.');
  gen();
}
