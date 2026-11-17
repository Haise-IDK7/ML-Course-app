import { frame, makeCanvas, pointer, select, check, readout, legend, onTheme, Plot, colors, clear, fmt } from './kit.js';

const erf = (x) => { const s = Math.sign(x), a = Math.abs(x), t = 1 / (1 + 0.3275911 * a); return s * (1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a)); };
const sig = (z) => 1 / (1 + Math.exp(-z));
const FN = {
  Sigmoide: { f: sig, nota: 'Rango (0, 1). Se satura en ambos extremos: su derivada máxima es 0.25, así que encadenar muchas capas encoge el gradiente. Hoy se usa sobre todo en la salida de clasificación binaria.' },
  Tanh: { f: Math.tanh, nota: 'Rango (−1, 1), centrada en 0. Derivada máxima 1, pero también se satura. Común en redes recurrentes y en PINN, donde hace falta una función suave y derivable varias veces.' },
  ReLU: { f: (z) => Math.max(0, z), nota: 'max(0, z). Barata y con derivada 1 para z > 0, lo que alivia el desvanecimiento del gradiente. Riesgo: neuronas «muertas» que quedan siempre en 0. Su segunda derivada es 0: por eso no sirve en PINN con ecuaciones de segundo orden.' },
  'Leaky ReLU': { f: (z) => (z > 0 ? z : 0.1 * z), nota: 'Como ReLU, pero deja pasar una pequeña pendiente para z < 0 (aquí 0.1), de modo que ninguna neurona queda sin gradiente.' },
  ELU: { f: (z) => (z > 0 ? z : Math.exp(z) - 1), nota: 'Suave para z < 0 y con salidas negativas que acercan la media de activación a 0.' },
  GELU: { f: (z) => 0.5 * z * (1 + erf(z / Math.SQRT2)), nota: 'z·Φ(z): una ReLU suavizada. Es la activación estándar en Transformers (BERT, GPT, ViT).' },
  'SiLU / Swish': { f: (z) => z * sig(z), nota: 'z·σ(z). Suave y no monótona; usada en EfficientNet y en muchos modelos de difusión.' },
  Softplus: { f: (z) => Math.log1p(Math.exp(z)), nota: 'ln(1 + eᶻ): versión suave de ReLU; su derivada es exactamente la sigmoide.' }
};

export default function mount(root) {
  const { stage, panel, foot } = frame(root);
  const c = makeCanvas(stage, 640, 380);
  const P = new Plot(c.ctx, { x: 40, y: 12, w: 588, h: 336 }, { x0: -5, x1: 5, y0: -1.5, y1: 3 });
  let z0 = 1.5;
  const d = (f, z) => (f(z + 1e-4) - f(z - 1e-4)) / 2e-4;
  function draw() {
    const col = colors(), { f, nota } = FN[fn.value]; clear(c, col);
    P.frame(col, { xl: 'z (entrada de la neurona)', xt: 10, yt: 9, fmt: (v) => +v.toFixed(1) });
    if (cmp.value) for (const k of Object.keys(FN)) if (k !== fn.value) P.line(FN[k].f, col.rule, 1.5);
    if (der.value) P.line((z) => d(f, z), col.a, 2, [6, 4]);
    P.line(f, col.b, 3);
    P.line([[z0, -1.5], [z0, 3]], col.muted, 1, [3, 3]);
    P.dot(z0, f(z0), col.b, 6, col.surface); if (der.value) P.dot(z0, d(f, z0), col.a, 5, col.surface);
    const g = d(f, z0);
    info.innerHTML = `z = <b>${fmt(z0, 2)}</b>\nf(z)  = <b>${fmt(f(z0))}</b>\nf′(z) = <b>${fmt(g)}</b>\n${Math.abs(g) < 0.02 ? '→ zona saturada: casi no pasa gradiente' : '→ el gradiente fluye'}\n\ngradiente tras 10 capas ≈ f′(z)¹⁰ = <b>${fmt(Math.abs(g) ** 10)}</b>`;
    foot(`<b>${fn.value}.</b> ${nota} <b>Qué probar:</b> arrastra el punto hacia valores grandes de |z| y mira la derivada (línea discontinua): donde vale casi 0, la neurona deja de aprender.`);
  }
  const fn = select(panel, 'Función', Object.keys(FN), 'Sigmoide', draw);
  const der = check(panel, 'Mostrar la derivada f′(z)', true, draw);
  const cmp = check(panel, 'Comparar con las demás', false, draw);
  legend(panel, [[colors().b, 'f(z)'], [colors().a, 'f′(z)']]);
  const info = readout(panel);
  const move = (px, py, drag) => { if (drag && P.inside(px, py)) { z0 = P.ix(px); draw(); } };
  pointer(c, { down: (px, py) => move(px, py, true), move });
  onTheme(root, draw);
  draw();
}
