import { frame, makeCanvas, pointer, slider, buttons, readout, animator, onTheme, Plot, colors, mix, clear, fmt } from './kit.js';
import { makeRng } from '../lib/rng.js';

export default function mount(root) {
  const { stage, panel, foot } = frame(root);
  const c = makeCanvas(stage, 680, 340);
  let seed = 4, pts, w, b, path, steps;
  const data = new Plot(c.ctx, { x: 44, y: 14, w: 270, h: 280 }, { x0: 0, x1: 1, y0: 0, y1: 1 });
  const land = new Plot(c.ctx, { x: 390, y: 14, w: 276, h: 280 }, { x0: -1, x1: 2.5, y0: -0.8, y1: 1.6 });

  const J = (ww, bb) => pts.reduce((s, [x, y]) => s + (ww * x + bb - y) ** 2, 0) / (2 * pts.length);
  const grad = () => { let gw = 0, gb = 0; for (const [x, y] of pts) { const e = w * x + b - y; gw += e * x; gb += e; } return [gw / pts.length, gb / pts.length]; };
  function best() { // solución exacta por mínimos cuadrados
    const n = pts.length; let sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (const [x, y] of pts) { sx += x; sy += y; sxx += x * x; sxy += x * y; }
    const ww = (n * sxy - sx * sy) / (n * sxx - sx * sx || 1e-9);
    return [ww, (sy - ww * sx) / n];
  }
  function newData() {
    const r = makeRng(seed++);
    pts = Array.from({ length: 22 }, () => { const x = r(); return [x, Math.min(0.98, Math.max(0.02, 0.2 + 0.6 * x + 0.07 * r.normal()))]; });
    reset();
  }
  function reset() { w = -0.5; b = 1.2; path = [[w, b]]; steps = 0; run.stop(); btn[1].textContent = 'Entrenar'; draw(); }
  function step() {
    const [gw, gb] = grad();
    w -= lr.value * gw; b -= lr.value * gb; steps++;
    if (!Number.isFinite(w) || Math.abs(w) > 1e6) { run.stop(); btn[1].textContent = 'Entrenar'; }
    path.push([w, b]); if (path.length > 600) path.shift();
  }

  function draw() {
    const col = colors(); clear(c, col);
    data.frame(col, { xl: 'x (entrada)', yl: 'y (objetivo)' });
    for (const [x, y] of pts) { // residuos: lo que la pérdida intenta reducir
      c.ctx.strokeStyle = mix(col.bad, col.surface, 0.5); c.ctx.lineWidth = 1; c.ctx.beginPath();
      c.ctx.moveTo(data.px(x), data.py(y)); c.ctx.lineTo(data.px(x), data.py(Math.max(-1, Math.min(2, w * x + b)))); c.ctx.stroke();
    }
    data.line((x) => w * x + b, col.b, 2.5);
    for (const [x, y] of pts) data.dot(x, y, col.a, 4, col.surface);
    const [bw, bb] = best(), jmax = Math.log(1 + 40 * J(-1, 1.6));
    land.heat((ww, bbb) => mix(col.surface, col.b, Math.min(1, Math.log(1 + 40 * J(ww, bbb)) / jmax) * 0.85), 6);
    land.frame({ ...col, surface: 'transparent' }, { xl: 'w (pendiente)', yl: 'b (sesgo)', zero: false });
    land.line(path, col.a, 2);
    land.dot(bw, bb, col.ok, 5, col.surface); land.text('mínimo', bw + 0.08, bb, col.ink);
    land.dot(w, b, col.a, 5, col.ink);
    info.innerHTML = `paso <b>${steps}</b>\nw = <b>${fmt(w)}</b>   b = <b>${fmt(b)}</b>\npérdida J = <b>${fmt(J(w, b), 5)}</b>\nóptimo: w = ${fmt(bw)}, b = ${fmt(bb)}`;
  }

  const lr = slider(panel, { label: 'Tasa de aprendizaje η', min: 0.02, max: 2, step: 0.02, value: 0.5, fmt: (v) => v.toFixed(2) });
  const run = animator(root, () => { for (let i = 0; i < 2; i++) step(); draw(); });
  const btn = buttons(panel, [
    { label: 'Un paso', onclick: () => { step(); draw(); } },
    { label: 'Entrenar', primary: true, onclick: () => { btn[1].textContent = run.toggle() ? 'Pausar' : 'Entrenar'; } },
    { label: 'Reiniciar', onclick: reset },
    { label: 'Datos nuevos', onclick: newData }
  ]);
  const info = readout(panel);
  pointer(c, { down: (x, y) => {
    if (data.inside(x, y)) { pts.push([data.ix(x), data.iy(y)]); draw(); }
    else if (land.inside(x, y)) { w = land.ix(x); b = land.iy(y); path = [[w, b]]; steps = 0; draw(); }
  } });
  onTheme(root, draw);
  foot('<b>Qué probar:</b> entrena con η = 0.5 y luego con η = 1.7: la trayectoria empieza a rebotar y diverge. Haz clic en la gráfica izquierda para añadir puntos y en la derecha para elegir desde dónde empezar. Las líneas rojas son los errores que la pérdida promedia.');
  newData();
}
