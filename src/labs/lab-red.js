import { frame, makeCanvas, slider, select, buttons, readout, legend, animator, onTheme, Plot, colors, mix, clear, fmt } from './kit.js';
import { makeRng, shuffle } from '../lib/rng.js';
import { DATASETS } from '../lib/datasets.js';
import { MLP } from '../lib/nn.js';

export default function mount(root) {
  const { stage, panel, foot } = frame(root);
  const c = makeCanvas(stage, 680, 400);
  const P = new Plot(c.ctx, { x: 12, y: 12, w: 376, h: 376 }, { x0: -1.2, x1: 1.2, y0: -1.2, y1: 1.2 });
  const Lp = new Plot(c.ctx, { x: 446, y: 12, w: 222, h: 180 }, { x0: 0, x1: 100, y0: 0, y1: 1 });
  let seed = 1, net, Xtr, Ytr, Xte, Yte, hist, epoch, rand;
  function data() {
    rand = makeRng(seed);
    const { X, y } = DATASETS[ds.value](300, noise.value, rand);
    const idx = shuffle(X.map((_, i) => i), rand), cut = 200;
    Xtr = idx.slice(0, cut).map((i) => X[i]); Ytr = idx.slice(0, cut).map((i) => [y[i]]);
    Xte = idx.slice(cut).map((i) => X[i]); Yte = idx.slice(cut).map((i) => [y[i]]);
    reset();
  }
  function reset() {
    net = new MLP([2, ...Array(layers.value).fill(units.value), 1], { act: act.value, rand: makeRng(seed + 100) });
    hist = []; epoch = 0; run.stop(); btn[1].textContent = 'Entrenar'; draw();
  }
  function trainEpoch() {
    const idx = shuffle(Xtr.map((_, i) => i), rand), B = 16, lam = l2.value <= -5 ? 0 : 10 ** l2.value;
    for (let s = 0; s < idx.length; s += B) net.trainBatch(Xtr, Ytr, idx.slice(s, s + B), 10 ** lr.value, lam);
    epoch++; hist.push([epoch, net.loss(Xtr, Ytr), net.loss(Xte, Yte)]);
    if (hist.length > 1200) hist = hist.filter((_, i) => i % 2 === 1);
  }
  function draw() {
    const col = colors(); clear(c, col);
    P.heat((px, py) => { const p = net.forward([px, py])[0]; return mix(mix(col.a, col.surface, 0.45), mix(col.b, col.surface, 0.45), p); }, 6);
    P.frame({ ...col, surface: 'transparent' }, { zero: false, xt: 4 });
    Xte.forEach((p, i) => P.dot(p[0], p[1], 'transparent', 3.5, Yte[i][0] ? col.b : col.a));
    Xtr.forEach((p, i) => P.dot(p[0], p[1], Ytr[i][0] ? col.b : col.a, 3.5, col.surface));
    Lp.r.x1 = Math.max(50, epoch); Lp.r.y1 = hist.length ? Math.min(2, Math.max(0.1, ...hist.map((v) => Math.max(v[1], v[2])))) : 0.8;
    Lp.frame(col, { xl: 'época', xt: 2, yt: 2 });
    Lp.line(hist.map((h) => [h[0], h[1]]), col.b, 2); Lp.line(hist.map((h) => [h[0], h[2]]), col.a, 2);
    const last = hist[hist.length - 1];
    info.innerHTML = `época <b>${epoch}</b>   parámetros <b>${net.nParams}</b>\npérdida entrenamiento <b>${last ? fmt(last[1]) : '—'}</b>\npérdida prueba        <b>${last ? fmt(last[2]) : '—'}</b>\nexactitud prueba      <b>${(100 * net.accuracy(Xte, Yte)).toFixed(1)} %</b>`;
  }
  const ds = select(panel, 'Datos', Object.keys(DATASETS), 'círculos', data);
  const noise = slider(panel, { label: 'Ruido', min: 0, max: 0.3, step: 0.01, value: 0.06, fmt: (v) => v.toFixed(2) }, data);
  const layers = slider(panel, { label: 'Capas ocultas', min: 0, max: 4, value: 1 }, reset);
  const units = slider(panel, { label: 'Neuronas por capa', min: 1, max: 12, value: 4 }, reset);
  const act = select(panel, 'Activación', ['tanh', 'relu', 'sigmoide'], 'tanh', reset);
  const lr = slider(panel, { label: 'Tasa de aprendizaje', min: -4, max: 0, step: 0.25, value: -2, fmt: (v) => (10 ** v).toPrecision(1) });
  const l2 = slider(panel, { label: 'Regularización L2', min: -5, max: -1, step: 0.5, value: -5, fmt: (v) => (v <= -5 ? 'sin' : (10 ** v).toPrecision(1)) });
  const run = animator(root, () => { trainEpoch(); draw(); });
  const btn = buttons(panel, [
    { label: 'Una época', onclick: () => { trainEpoch(); draw(); } },
    { label: 'Entrenar', primary: true, onclick: () => { btn[1].textContent = run.toggle() ? 'Pausar' : 'Entrenar'; } },
    { label: 'Reiniciar', onclick: () => { seed++; reset(); } }
  ]);
  legend(panel, [[colors().b, 'entrenamiento (relleno)'], [colors().a, 'prueba (hueco)']]);
  const info = readout(panel);
  onTheme(root, draw);
  foot('<b>Qué probar:</b> (1) Con «círculos» y 0 capas ocultas la red es un modelo lineal y no puede separar las clases; con 1 capa de 3 neuronas ya sí: cada neurona aporta un borde. (2) En «espiral» necesitas más capas y neuronas. (3) Sube el ruido a 0.25 con 4 capas × 12 neuronas y entrena mucho tiempo: la pérdida de prueba empieza a subir mientras la de entrenamiento baja (sobreajuste); añade regularización L2 y compara. (4) Pon la tasa de aprendizaje en 1: el entrenamiento se vuelve inestable.');
  data();
}
