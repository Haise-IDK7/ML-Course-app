import { frame, makeCanvas, slider, check, buttons, readout, animator, onTheme, Plot, colors, mix, clear, fmt } from './kit.js';
import { makeRng } from '../lib/rng.js';
import { PinnNet } from '../lib/pinn.js';

// Ecuación del calor 1D:  u_t = alfa u_xx  en x, t ∈ [0, 1];  u(x, 0) = sin(pi x);  u(0, t) = u(1, t) = 0.
// Solución exacta: u = exp(-alfa pi^2 t) sin(pi x).
export default function mount(root) {
  const { stage, panel, foot } = frame(root);
  const c = makeCanvas(stage, 680, 360);
  const R = { x0: 0, x1: 1, y0: 0, y1: 1 };
  const A = new Plot(c.ctx, { x: 40, y: 34, w: 190, h: 270 }, R), B = new Plot(c.ctx, { x: 262, y: 34, w: 190, h: 270 }, R);
  const S = new Plot(c.ctx, { x: 494, y: 34, w: 174, h: 270 }, { x0: 0, x1: 1, y0: -0.1, y1: 1.1 });
  const NB = 20;
  let net, rand, pts, step, last = {}, seed = 1;
  const exact = (x, t) => Math.exp(-al.value * Math.PI ** 2 * t) * Math.sin(Math.PI * x);
  function reset() { rand = makeRng(seed); net = new PinnNet([2, 20, 20, 1], rand); step = 0; last = {}; pts = []; run.stop(); btn[0].textContent = 'Entrenar'; draw(); }
  function train() {
    const a = al.value;
    if (step % 100 === 0) pts = Array.from({ length: nc.value }, () => [rand(), rand()]); // remuestrear los puntos de colocación
    let lp = 0, lb = 0;
    if (phys.value) for (const [x, t] of pts) { const o = net.forward(x, t), r = o.ut - a * o.uxx, cf = 2 * r / pts.length; lp += r * r / pts.length; net.backward(0, 0, -a * cf, cf); }
    for (let i = 0; i < NB; i++) {
      const s = i / (NB - 1), w = 20 / NB;
      let o = net.forward(s, 0), e = o.u - Math.sin(Math.PI * s); lb += e * e / NB; net.backward(w * e, 0, 0, 0); // condición inicial
      o = net.forward(0, s); lb += o.u ** 2 / NB; net.backward(w * o.u, 0, 0, 0);                              // frontera x = 0
      o = net.forward(1, s); lb += o.u ** 2 / NB; net.backward(w * o.u, 0, 0, 0);                              // frontera x = 1
    }
    net.adam(5e-3 * 0.9995 ** step); step++; last = { lp, lb };
  }
  function draw() {
    const col = colors(), { ctx } = c; clear(c, col);
    const shade = (v) => mix(col.surface, v >= 0 ? col.bad : col.b, Math.min(1, Math.abs(v)) * 0.9);
    ctx.font = '600 13px IBM Plex Sans, sans-serif'; ctx.fillStyle = col.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('PINN: u(x, t)', A.box.x, 16); ctx.fillText('Solución exacta', B.box.x, 16); ctx.fillText(`Corte en t = ${ts.value.toFixed(2)}`, S.box.x, 16);
    A.heat((x, t) => shade(net.forward(x, t).u), 7); B.heat((x, t) => shade(exact(x, t)), 7);
    for (const P of [A, B]) { P.frame({ ...col, surface: 'transparent' }, { xl: 'posición x', yl: P === A ? 'tiempo t' : '', xt: 2, yt: 4, zero: false }); P.line([[0, ts.value], [1, ts.value]], col.ink, 1.5, [4, 3]); }
    if (phys.value) for (const [x, t] of pts) A.dot(x, t, col.ink, 1.2);
    S.frame(col, { xl: 'posición x', xt: 2, yt: 6 });
    S.line((x) => exact(x, ts.value), col.muted, 2, [6, 5]); S.line((x) => net.forward(x, ts.value).u, col.b, 3);
    let e = 0, n = 0; for (let i = 0; i <= 20; i++) for (let j = 0; j <= 20; j++) { e += (net.forward(i / 20, j / 20).u - exact(i / 20, j / 20)) ** 2; n++; }
    info.innerHTML = `paso <b>${step}</b>\npérdida de la EDP:        <b>${last.lp == null || !phys.value ? '—' : fmt(last.lp, 6)}</b>\npérdida inicial+frontera: <b>${last.lb == null ? '—' : fmt(last.lb, 6)}</b>\nerror real (RMSE):        <b>${fmt(Math.sqrt(e / n), 4)}</b>`;
  }
  const al = slider(panel, { label: 'Difusividad α', min: 0.02, max: 0.4, step: 0.02, value: 0.1, fmt: (v) => v.toFixed(2) }, () => reset());
  const nc = slider(panel, { label: 'Puntos de colocación', min: 20, max: 300, step: 10, value: 150 });
  const ts = slider(panel, { label: 'Instante del corte', min: 0, max: 1, step: 0.05, value: 0.5, fmt: (v) => v.toFixed(2) }, () => draw());
  const phys = check(panel, 'Usar la pérdida de la EDP', true, () => reset());
  const run = animator(root, () => { for (let i = 0; i < 8; i++) train(); draw(); });
  const btn = buttons(panel, [
    { label: 'Entrenar', primary: true, onclick: () => { btn[0].textContent = run.toggle() ? 'Pausar' : 'Entrenar'; } },
    { label: 'Reiniciar', onclick: () => { seed++; reset(); } }
  ]);
  const info = readout(panel);
  onTheme(root, draw);
  foot('<b>Qué observar:</b> la red recibe (x, t) y devuelve la temperatura u. No hay ningún dato en el interior: solo la condición inicial (borde inferior, t = 0), las dos fronteras y la exigencia de que u<sub>t</sub> = α·u<sub>xx</sub> en los puntos negros, que se remuestrean cada 100 pasos. En unos 500 pasos el mapa coincide con la solución exacta. Desmarca «Usar la pérdida de la EDP» y reentrena: la red cumple los bordes pero el interior queda sin determinar. Cambia α: una difusividad mayor hace que el calor se disipe antes.');
  reset();
}
