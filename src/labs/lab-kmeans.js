import { frame, makeCanvas, pointer, slider, buttons, readout, animator, onTheme, Plot, colors, clear, fmt } from './kit.js';
import { makeRng } from '../lib/rng.js';

export default function mount(root) {
  const { stage, panel, foot } = frame(root);
  const c = makeCanvas(stage, 640, 420);
  const P = new Plot(c.ctx, { x: 36, y: 12, w: 592, h: 376 }, { x0: -1.2, x1: 1.2, y0: -0.9, y1: 0.9 });
  let seed = 5, X, cent, trail, assign, phase, iter, moved, rnd;
  const palette = (col) => [col.b, col.a, col.ok, col.bad, col.violet, col.muted];
  function gen() {
    rnd = makeRng(seed);
    const centers = Array.from({ length: 4 }, () => [rnd() * 1.6 - 0.8, rnd() * 1.2 - 0.6]);
    X = Array.from({ length: 180 }, (_, i) => { const m = centers[i % 4]; return [m[0] + 0.13 * rnd.normal(), m[1] + 0.13 * rnd.normal()]; });
    init();
  }
  function init() { // centroides iniciales: k puntos elegidos al azar
    cent = Array.from({ length: k.value }, () => [...X[rnd.int(X.length)]]);
    trail = cent.map((p) => [[...p]]); assign = X.map(() => -1); phase = 0; iter = 0; moved = Infinity;
    run.stop(); btn[1].textContent = 'Ejecutar'; draw();
  }
  function step() {
    if (phase === 0) { // 1) asignar cada punto al centroide más cercano
      assign = X.map((p) => { let b = 0, bd = Infinity; cent.forEach((m, j) => { const d = (p[0] - m[0]) ** 2 + (p[1] - m[1]) ** 2; if (d < bd) { bd = d; b = j; } }); return b; });
    } else { // 2) mover cada centroide a la media de sus puntos
      moved = 0;
      cent.forEach((m, j) => {
        const mine = X.filter((_, i) => assign[i] === j); if (!mine.length) return;
        const nx = mine.reduce((s, p) => s + p[0], 0) / mine.length, ny = mine.reduce((s, p) => s + p[1], 0) / mine.length;
        moved += Math.hypot(nx - m[0], ny - m[1]); m[0] = nx; m[1] = ny; trail[j].push([nx, ny]);
      });
      iter++;
    }
    phase = 1 - phase;
  }
  const inertia = () => X.reduce((s, p, i) => (assign[i] < 0 ? s : s + (p[0] - cent[assign[i]][0]) ** 2 + (p[1] - cent[assign[i]][1]) ** 2), 0);
  function draw() {
    const col = colors(), pal = palette(col); clear(c, col);
    P.frame(col, { zero: false });
    X.forEach((p, i) => {
      if (assign[i] >= 0) { c.ctx.strokeStyle = pal[assign[i]]; c.ctx.globalAlpha = 0.18; c.ctx.lineWidth = 1; c.ctx.beginPath(); c.ctx.moveTo(P.px(p[0]), P.py(p[1])); c.ctx.lineTo(P.px(cent[assign[i]][0]), P.py(cent[assign[i]][1])); c.ctx.stroke(); c.ctx.globalAlpha = 1; }
      P.dot(p[0], p[1], assign[i] < 0 ? col.muted : pal[assign[i]], 3.5);
    });
    cent.forEach((m, j) => {
      P.line(trail[j], pal[j], 1.5, [3, 3]);
      const x = P.px(m[0]), y = P.py(m[1]);
      c.ctx.fillStyle = pal[j]; c.ctx.strokeStyle = col.ink; c.ctx.lineWidth = 2; c.ctx.beginPath(); c.ctx.rect(x - 7, y - 7, 14, 14); c.ctx.fill(); c.ctx.stroke();
    });
    const conv = iter > 0 && moved < 1e-4;
    info.innerHTML = `iteración <b>${iter}</b>\nsiguiente paso: <b>${conv ? 'convergió' : phase === 0 ? 'asignar puntos' : 'mover centroides'}</b>\ninercia (suma de distancias²): <b>${assign[0] < 0 ? '—' : fmt(inertia(), 2)}</b>`;
    if (conv) { run.stop(); btn[1].textContent = 'Ejecutar'; }
  }
  const k = slider(panel, { label: 'Número de grupos k', min: 2, max: 6, value: 4 }, () => init());
  let last = 0;
  const run = animator(root, () => { const now = performance.now(); if (now - last > 450) { last = now; step(); draw(); } });
  const btn = buttons(panel, [
    { label: 'Un paso', onclick: () => { step(); draw(); } },
    { label: 'Ejecutar', primary: true, onclick: () => { btn[1].textContent = run.toggle() ? 'Pausar' : 'Ejecutar'; } },
    { label: 'Reiniciar centroides', onclick: init },
    { label: 'Datos nuevos', onclick: () => { seed++; gen(); } }
  ]);
  const info = readout(panel);
  pointer(c, { down: (x, y) => { if (P.inside(x, y)) { X.push([P.ix(x), P.iy(y)]); assign.push(-1); draw(); } } });
  onTheme(root, draw);
  foot('<b>Qué probar:</b> avanza paso a paso y fíjate en que la inercia nunca sube. Pulsa «Reiniciar centroides» varias veces: a veces dos centroides caen en el mismo grupo y el resultado es peor. k-means solo garantiza un mínimo local; por eso en la práctica se usa la inicialización k-means++ y varias repeticiones. Prueba k = 2 y k = 6 para ver qué pasa cuando k no coincide con la estructura real.');
  gen();
}
