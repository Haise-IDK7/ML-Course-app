import { frame, makeCanvas, slider, select, buttons, readout, legend, animator, onTheme, Plot, colors, clear, fmt } from './kit.js';
import { makeRng } from '../lib/rng.js';
import { PinnNet, Scalar, oscillator } from '../lib/pinn.js';

// Oscilador amortiguado:  u'' + mu u' + k u = 0,  u(0) = 1, u'(0) = 0.
const MU = 3, K = 144;
const MODOS = [
  ['datos', 'Solo datos (red normal)'],
  ['pinn', 'Datos + física (PINN)'],
  ['directo', 'Solo física + condiciones iniciales'],
  ['inverso', 'Problema inverso: descubrir μ']
];

export default function mount(root) {
  const { stage, panel, foot } = frame(root);
  const c = makeCanvas(stage, 680, 420);
  const U = new Plot(c.ctx, { x: 52, y: 12, w: 616, h: 240 }, { x0: 0, x1: 1, y0: -1.1, y1: 1.3 });
  const Lg = new Plot(c.ctx, { x: 52, y: 292, w: 616, h: 84 }, { x0: 0, x1: 1000, y0: -6, y1: 1 });
  let net, mu, data, col_, hist, step, lr0, seed = 1, last = {};
  function reset() {
    const rand = makeRng(seed);
    net = new PinnNet([2, 24, 24, 1], rand);
    const m = modo.value;
    mu = new Scalar(m === 'inverso' ? 0.5 : MU);
    const tmax = tm.value, n = nd.value;
    data = m === 'directo' ? [] : Array.from({ length: n }, (_, i) => { const t = tmax * i / (n - 1); return [t, oscillator(t, MU, K)]; });
    col_ = Array.from({ length: nc.value }, (_, i) => i / (nc.value - 1));
    hist = []; step = 0; lr0 = 3e-3; last = {};
    run.stop(); btn[0].textContent = 'Entrenar'; draw();
  }
  function train() {
    const m = modo.value, phys = m !== 'datos', w = 10 ** wp.value;
    let ld = 0, lp = 0;
    if (m === 'directo') { // condiciones iniciales u(0) = 1 y u'(0) = 0 (esta última con peso pequeño por su escala)
      const o = net.forward(0, 0); ld = (o.u - 1) ** 2 + 1e-2 * o.ux ** 2; net.backward(2 * (o.u - 1), 2e-2 * o.ux, 0, 0);
    } else for (const [t, u] of data) { const o = net.forward(t, 0), e = o.u - u; ld += e * e / data.length; net.backward(2 * e / data.length, 0, 0, 0); }
    if (phys) for (const t of col_) { // residuo de la ecuación en los puntos de colocación, dividido por k para adimensionalizar
      const o = net.forward(t, 0), r = (o.uxx + mu.v * o.ux + K * o.u) / K, cf = 2 * w * r / (K * col_.length);
      lp += r * r / col_.length; net.backward(cf * K, cf * mu.v, cf, 0);
      if (m === 'inverso') mu.g += cf * o.ux;
    }
    net.adam(lr0 * 0.9995 ** step); if (m === 'inverso') mu.adam(0.02);
    step++; last = { ld, lp };
  }
  const rmse = () => { let e = 0; for (let i = 0; i <= 100; i++) e += (net.forward(i / 100, 0).u - oscillator(i / 100, MU, K)) ** 2; return Math.sqrt(e / 101); };
  function draw() {
    const col = colors(), m = modo.value; clear(c, col);
    U.frame(col, { xl: 'tiempo t', yl: 'posición u(t)', xt: 10 });
    U.line((t) => oscillator(t, MU, K), col.muted, 2, [6, 5]);
    if (m !== 'datos') for (const t of col_) U.dot(t, -1.04, col.ok, 2.5);
    U.line((t) => net.forward(t, 0).u, col.b, 3);
    for (const [t, u] of data) U.dot(t, u, col.a, 5, col.ink);
    Lg.r.x1 = Math.max(1000, step);
    Lg.frame(col, { xl: 'paso de entrenamiento', xt: 5, yt: 2, zero: false, fy: (v) => `1e${Math.round(v)}` });
    const lg = (v) => Math.max(-6, Math.log10(v + 1e-12));
    Lg.line(hist.map((h) => [h[0], lg(h[1])]), col.a, 2); if (m !== 'datos') Lg.line(hist.map((h) => [h[0], lg(h[2])]), col.ok, 2);
    info.innerHTML = `paso <b>${step}</b>\npérdida ${m === 'directo' ? 'cond. iniciales' : 'de datos'}: <b>${last.ld != null ? fmt(last.ld, 5) : '—'}</b>\npérdida de física:  <b>${m === 'datos' || last.lp == null ? '—' : fmt(last.lp, 5)}</b>\nerror real (RMSE):  <b>${fmt(rmse(), 4)}</b>${m === 'inverso' ? `\nμ estimado: <b>${fmt(mu.v, 3)}</b>  (real: ${MU})` : ''}`;
  }
  const modo = select(panel, 'Qué ve la red', MODOS, 'datos', () => { if (modo.value === 'inverso') { tm.set(1); nd.set(20); } reset(); });
  const nd = slider(panel, { label: 'Mediciones', min: 4, max: 30, value: 10 }, reset);
  const tm = slider(panel, { label: 'Hay datos hasta t =', min: 0.2, max: 1, step: 0.05, value: 0.4, fmt: (v) => v.toFixed(2) }, reset);
  const nc = slider(panel, { label: 'Puntos de colocación', min: 5, max: 80, value: 40 }, reset);
  const wp = slider(panel, { label: 'Peso de la física λ', min: -3, max: 1, step: 0.5, value: 0, fmt: (v) => (10 ** v).toPrecision(1) });
  const run = animator(root, () => { for (let i = 0; i < 30; i++) train(); hist.push([step, last.ld, last.lp]); if (hist.length > 800) hist = hist.filter((_, i) => i % 2); draw(); });
  const btn = buttons(panel, [
    { label: 'Entrenar', primary: true, onclick: () => { btn[0].textContent = run.toggle() ? 'Pausar' : 'Entrenar'; } },
    { label: 'Reiniciar', onclick: () => { seed++; reset(); } }
  ]);
  legend(panel, [[colors().muted, 'solución exacta'], [colors().b, 'red neuronal'], [colors().a, 'mediciones'], [colors().ok, 'colocación / pérdida física']]);
  const info = readout(panel);
  onTheme(root, draw);
  foot('<b>Experimento guiado:</b> (1) «Solo datos»: entrena unos 2000 pasos. La red clava las mediciones pero más allá de t = 0.4 inventa cualquier cosa: no sabe física. (2) «Datos + física»: los puntos verdes no tienen medición; ahí solo se exige que se cumpla la ecuación u″ + μu′ + ku = 0. La red extrapola correctamente. (3) «Solo física»: cero mediciones, solo u(0) = 1 y u′(0) = 0; tarda más (≈ 5000 pasos) pero resuelve la ecuación. (4) «Problema inverso»: μ es desconocido y se aprende junto con los pesos. Baja λ a 0.001 en el modo 2 para ver qué pasa cuando la física casi no cuenta.');
  reset();
}
