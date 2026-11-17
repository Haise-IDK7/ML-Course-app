import { frame, makeCanvas, slider, buttons, readout, legend, onTheme, Plot, colors, clear, fmt } from './kit.js';
import { makeRng } from '../lib/rng.js';

// Base de Chebyshev en [-1, 1]: mismo espacio de polinomios que 1, x, x^2..., pero numéricamente estable.
const basis = (x, deg) => { const t = [1, x]; for (let k = 2; k <= deg; k++) t.push(2 * x * t[k - 1] - t[k - 2]); return t.slice(0, deg + 1); };

function solve(A, y) { // eliminación gaussiana con pivoteo parcial
  const n = y.length, M = A.map((r, i) => [...r, y[i]]);
  for (let i = 0; i < n; i++) {
    let p = i; for (let r = i + 1; r < n; r++) if (Math.abs(M[r][i]) > Math.abs(M[p][i])) p = r;
    [M[i], M[p]] = [M[p], M[i]];
    const d = M[i][i] || 1e-12;
    for (let r = i + 1; r < n; r++) { const f = M[r][i] / d; for (let k = i; k <= n; k++) M[r][k] -= f * M[i][k]; }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) { let s = M[i][n]; for (let k = i + 1; k < n; k++) s -= M[i][k] * x[k]; x[i] = s / (M[i][i] || 1e-12); }
  return x;
}

function fit(train, deg, lam) { // mínimos cuadrados con regularización L2 (ridge)
  const m = deg + 1, A = Array.from({ length: m }, () => new Array(m).fill(0)), rhs = new Array(m).fill(0);
  for (const [x, y] of train) { const t = basis(2 * x - 1, deg); for (let i = 0; i < m; i++) { rhs[i] += t[i] * y; for (let j = 0; j < m; j++) A[i][j] += t[i] * t[j]; } }
  for (let i = 1; i < m; i++) A[i][i] += lam * train.length;
  for (let i = 0; i < m; i++) A[i][i] += 1e-10;
  const wts = solve(A, rhs);
  return (x) => basis(2 * x - 1, deg).reduce((s, t, i) => s + t * wts[i], 0);
}
const mse = (f, set) => set.reduce((s, [x, y]) => s + (f(x) - y) ** 2, 0) / set.length;
const truth = (x) => 0.5 + 0.35 * Math.sin(2 * Math.PI * x);

export default function mount(root) {
  const { stage, panel, foot } = frame(root);
  const c = makeCanvas(stage, 680, 340);
  const P = new Plot(c.ctx, { x: 40, y: 14, w: 300, h: 280 }, { x0: 0, x1: 1, y0: -0.1, y1: 1.1 });
  const E = new Plot(c.ctx, { x: 400, y: 14, w: 266, h: 280 }, { x0: 0, x1: 12, y0: -4, y1: 0 });
  let seed = 2, train, test;
  function gen() {
    const r = makeRng(seed);
    const mk = (n) => Array.from({ length: n }, () => { const x = r(); return [x, truth(x) + noise.value * r.normal()]; });
    train = mk(n.value); test = mk(120); draw();
  }
  function draw() {
    const col = colors(); clear(c, col);
    const lam = reg.value <= -8 ? 0 : 10 ** reg.value;
    const f = fit(train, deg.value, lam);
    P.frame(col, { xl: 'x', yl: 'y' });
    P.line(truth, col.muted, 1.5, [5, 4]);
    for (const [x, y] of test) P.dot(x, y, 'transparent', 2.5, col.a);
    for (const [x, y] of train) P.dot(x, y, col.b, 4.5, col.surface);
    P.line(f, col.bad, 2.5);
    const tr = [], te = [];
    for (let d = 0; d <= 12; d++) { const g = fit(train, d, lam); tr.push([d, Math.log10(Math.max(1e-4, mse(g, train)))]); te.push([d, Math.log10(Math.max(1e-4, Math.min(1, mse(g, test))))]); }
    E.frame(col, { xl: 'grado del polinomio (complejidad)', yl: 'error cuadrático medio', xt: 6, yt: 4, fx: (v) => v, fy: (v) => (v === 0 ? '1' : `1e${v}`) });
    E.line(tr, col.b, 2); E.line(te, col.a, 2);
    E.dot(deg.value, tr[deg.value][1], col.b, 5, col.surface); E.dot(deg.value, te[deg.value][1], col.a, 5, col.surface);
    const etr = mse(f, train), ete = mse(f, test);
    const dx = ete > 3 * etr && ete > 2 * noise.value ** 2 ? 'sobreajuste: memoriza el ruido' : (etr > 2.5 * noise.value ** 2 + 0.004 ? 'subajuste: modelo demasiado simple' : 'buen equilibrio');
    info.innerHTML = `error de entrenamiento: <b>${fmt(etr, 4)}</b>\nerror de prueba:        <b>${fmt(ete, 4)}</b>\nruido irreducible σ²:   ${fmt(noise.value ** 2, 4)}\n→ <b>${dx}</b>`;
  }
  const deg = slider(panel, { label: 'Grado del polinomio', min: 0, max: 12, value: 3 }, draw);
  const n = slider(panel, { label: 'Datos de entrenamiento', min: 6, max: 60, value: 12 }, gen);
  const noise = slider(panel, { label: 'Ruido σ', min: 0, max: 0.3, step: 0.01, value: 0.1, fmt: (v) => v.toFixed(2) }, gen);
  const reg = slider(panel, { label: 'Regularización log₁₀ λ', min: -8, max: 0, step: 0.5, value: -8, fmt: (v) => (v <= -8 ? 'sin' : v) }, draw);
  buttons(panel, [{ label: 'Datos nuevos', onclick: () => { seed++; gen(); } }]);
  legend(panel, [[colors().b, 'entrenamiento'], [colors().a, 'prueba'], [colors().bad, 'modelo'], [colors().muted, 'función real']]);
  const info = readout(panel);
  onTheme(root, draw);
  foot('<b>Qué probar:</b> con 12 datos sube el grado de 1 a 12. El error de entrenamiento siempre baja; el de prueba baja y luego se dispara. Después, con grado 12, sube la regularización o el número de datos: el sobreajuste se corrige sin cambiar de modelo.');
  gen();
}
