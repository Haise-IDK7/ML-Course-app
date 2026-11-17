import { frame, makeCanvas, pointer, slider, select, buttons, readout, legend, animator, onTheme, Plot, colors, mix, clear, fmt } from './kit.js';

// Superficies de prueba: f(x, y), su gradiente y el rango de la vista.
const SURF = {
  'Valle alargado': { f: (x, y) => 0.5 * (x * x + 20 * y * y), g: (x, y) => [x, 20 * y], r: [-2.4, 2.4, -1.4, 1.4], start: [-2.1, 1.0] },
  'Rosenbrock (valle curvo)': { f: (x, y) => (1 - x) ** 2 + 10 * (y - x * x) ** 2, g: (x, y) => [-2 * (1 - x) - 40 * x * (y - x * x), 20 * (y - x * x)], r: [-1.8, 1.8, -0.8, 2.4], start: [-1.3, 1.9] },
  'Punto de silla': { f: (x, y) => 0.5 * x * x - 0.5 * y * y + 0.25 * y ** 4, g: (x, y) => [x, -y + y ** 3], r: [-2.2, 2.2, -1.9, 1.9], start: [-1.9, 0.02] },
  'Varios mínimos': { f: (x, y) => 0.06 * ((x * x + y - 3) ** 2 + (x + y * y - 4) ** 2), g: (x, y) => [0.06 * (4 * x * (x * x + y - 3) + 2 * (x + y * y - 4)), 0.06 * (2 * (x * x + y - 3) + 4 * y * (x + y * y - 4))], r: [-4.5, 4.5, -4.5, 4.5], start: [0.2, -0.6] }
};
// Cada optimizador guarda su propio estado y devuelve el desplazamiento a aplicar.
const OPT = {
  SGD: () => (g, lr) => [-lr * g[0], -lr * g[1]],
  Momento: () => { const v = [0, 0]; return (g, lr) => { for (const i of [0, 1]) v[i] = 0.9 * v[i] - lr * g[i]; return [...v]; }; },
  RMSProp: () => { const s = [0, 0]; return (g, lr) => g.map((gi, i) => { s[i] = 0.9 * s[i] + 0.1 * gi * gi; return -lr * gi / (Math.sqrt(s[i]) + 1e-8); }); },
  Adam: () => { const m = [0, 0], s = [0, 0]; let t = 0; return (g, lr) => { t++; return g.map((gi, i) => { m[i] = 0.9 * m[i] + 0.1 * gi; s[i] = 0.999 * s[i] + 0.001 * gi * gi; return -lr * (m[i] / (1 - 0.9 ** t)) / (Math.sqrt(s[i] / (1 - 0.999 ** t)) + 1e-8); }); }; }
};
const BASE_LR = { SGD: 1, Momento: 1, RMSProp: 0.6, Adam: 1.2 }; // escala relativa razonable para comparar

export default function mount(root) {
  const { stage, panel, foot } = frame(root);
  const c = makeCanvas(stage, 640, 420);
  const P = new Plot(c.ctx, { x: 36, y: 12, w: 592, h: 376 }, { x0: -1, x1: 1, y0: -1, y1: 1 });
  let S, start, runners, steps, bg = null;
  const palette = (col) => ({ SGD: col.muted, Momento: col.a, RMSProp: col.ok, Adam: col.bad });
  function setSurface() { S = SURF[surf.value]; [P.r.x0, P.r.x1, P.r.y0, P.r.y1] = S.r; start = [...S.start]; bg = null; reset(); }
  function reset() { runners = Object.keys(OPT).map((name) => ({ name, p: [...start], path: [[...start]], upd: OPT[name]() })); steps = 0; run.stop(); btn[0].textContent = 'Iniciar'; draw(); }
  function step() {
    for (const r of runners) {
      const d = r.upd(S.g(...r.p), lr.value * BASE_LR[r.name]);
      r.p = [r.p[0] + d[0], r.p[1] + d[1]];
      if (!Number.isFinite(r.p[0]) || Math.abs(r.p[0]) > 1e3) r.p = [NaN, NaN];
      r.path.push([...r.p]);
    }
    steps++;
  }
  function draw() {
    const col = colors(), pal = palette(col); clear(c, col);
    const fmax = Math.log(1 + S.f(S.r[0], S.r[3]) + S.f(S.r[1], S.r[2]));
    P.heat((x, y) => { const t = Math.min(1, Math.log(1 + S.f(x, y) - Math.min(0, -0.25)) / fmax); return mix(col.surface, col.b, 0.08 + 0.75 * (Math.round(t * 14) / 14)); }, 5);
    P.frame({ ...col, surface: 'transparent' }, { zero: false });
    for (const r of runners) { P.line(r.path, pal[r.name], 2.2); if (Number.isFinite(r.p[0])) P.dot(r.p[0], r.p[1], pal[r.name], 5, col.ink); }
    P.dot(start[0], start[1], col.surface, 4, col.ink);
    info.innerHTML = `paso <b>${steps}</b>\n` + runners.map((r) => `${r.name.padEnd(8)} f = <b>${Number.isFinite(r.p[0]) ? fmt(S.f(...r.p), 4) : 'divergió'}</b>`).join('\n');
  }
  const surf = select(panel, 'Superficie de pérdida', Object.keys(SURF), 'Valle alargado', setSurface);
  const lr = slider(panel, { label: 'Tasa de aprendizaje base', min: 0.002, max: 0.12, step: 0.002, value: 0.04, fmt: (v) => v.toFixed(3) });
  const run = animator(root, () => { step(); draw(); if (steps > 1500) { run.stop(); btn[0].textContent = 'Iniciar'; } });
  const btn = buttons(panel, [
    { label: 'Iniciar', primary: true, onclick: () => { btn[0].textContent = run.toggle() ? 'Pausar' : 'Iniciar'; } },
    { label: 'Un paso', onclick: () => { step(); draw(); } },
    { label: 'Reiniciar', onclick: reset }
  ]);
  legend(panel, Object.entries(palette(colors())).map(([k, v]) => [v, k]));
  const info = readout(panel);
  pointer(c, { down: (x, y) => { if (P.inside(x, y)) { start = [P.ix(x), P.iy(y)]; reset(); } } });
  onTheme(root, draw);
  foot('<b>Qué probar:</b> en el «valle alargado», SGD zigzaguea entre las paredes y avanza despacio; el momento acumula velocidad a lo largo del valle; RMSProp y Adam reescalan cada coordenada y van casi rectos. Sube la tasa hasta 0.1: SGD diverge (la curvatura 20 exige η &lt; 0.1). En el «punto de silla» SGD se queda casi parado porque el gradiente es diminuto; los métodos adaptativos escapan antes. Haz clic para elegir el punto de partida.');
  setSurface();
}
