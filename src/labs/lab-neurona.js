import { frame, makeCanvas, pointer, slider, select, buttons, readout, onTheme, Plot, colors, mix, clear, fmt } from './kit.js';

const F = {
  escalón: (z) => (z >= 0 ? 1 : 0),
  sigmoide: (z) => 1 / (1 + Math.exp(-z)),
  tanh: (z) => (Math.tanh(z) + 1) / 2, // reescalada a [0, 1] solo para colorear
  ReLU: (z) => Math.min(1, Math.max(0, z) / 3)
};
const RAW = { escalón: F.escalón, sigmoide: F.sigmoide, tanh: Math.tanh, ReLU: (z) => Math.max(0, z) };
const PUERTAS = { AND: [0, 0, 0, 1], OR: [0, 1, 1, 1], XOR: [0, 1, 1, 0] };

export default function mount(root) {
  const { stage, panel, foot } = frame(root);
  const c = makeCanvas(stage, 640, 420);
  const P = new Plot(c.ctx, { x: 40, y: 12, w: 400, h: 376 }, { x0: -1, x1: 2, y0: -1, y1: 2 });
  let x = [1, 1], gate = 'AND';
  function draw() {
    const col = colors(), { ctx } = c; clear(c, col);
    const w = [w1.value, w2.value], b = bias.value, f = F[act.value];
    P.heat((px, py) => mix(mix(col.a, col.surface, 0.55), mix(col.b, col.surface, 0.45), f(w[0] * px + w[1] * py + b)), 6);
    P.frame({ ...col, surface: 'transparent' }, { xl: 'x₁', yl: 'x₂', xt: 3, yt: 3 });
    // frontera w·x + b = 0 y vector de pesos (perpendicular a la frontera)
    if (Math.abs(w[1]) > 1e-6) P.line((px) => -(w[0] * px + b) / w[1], col.ink, 2); else if (Math.abs(w[0]) > 1e-6) P.line([[-b / w[0], -1], [-b / w[0], 2]], col.ink, 2);
    const nrm = Math.hypot(w[0], w[1]) || 1; P.line([[0.5, 0.5], [0.5 + 0.45 * w[0] / nrm, 0.5 + 0.45 * w[1] / nrm]], col.violet, 3); P.text('w', 0.5 + 0.52 * w[0] / nrm, 0.5 + 0.52 * w[1] / nrm, col.violet, 'center');
    let ok = 0;
    [[0, 0], [0, 1], [1, 0], [1, 1]].forEach(([a, bb], i) => {
      const t = PUERTAS[gate][i], pred = w[0] * a + w[1] * bb + b >= 0 ? 1 : 0; ok += pred === t ? 1 : 0;
      P.dot(a, bb, t ? col.b : col.a, 9, pred === t ? col.ok : col.bad); P.text(String(t), a, bb, col.surface, 'center');
    });
    P.dot(x[0], x[1], col.surface, 6, col.ink);
    const z = w[0] * x[0] + w[1] * x[1] + b, a = RAW[act.value](z);
    // esquema de la neurona
    const X0 = 470, mid = 190;
    ctx.font = '12px IBM Plex Sans, sans-serif'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    [[x[0], w[0], mid - 70, 'x₁'], [x[1], w[1], mid, 'x₂'], [1, b, mid + 70, '1']].forEach(([v, wt, yy, name]) => {
      ctx.strokeStyle = wt >= 0 ? col.b : col.a; ctx.lineWidth = Math.min(7, 1 + Math.abs(wt) * 1.6); ctx.beginPath(); ctx.moveTo(X0 + 14, yy); ctx.lineTo(X0 + 96, mid); ctx.stroke();
      ctx.fillStyle = col.sunken; ctx.strokeStyle = col.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(X0, yy, 14, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = col.ink; ctx.fillText(name, X0, yy); ctx.fillStyle = col.muted; ctx.fillText(name === '1' ? `b=${fmt(wt, 1)}` : `${fmt(v, 2)} · ${fmt(wt, 1)}`, X0 + 50, yy - 16 + (yy - mid) * 0.12);
    });
    ctx.fillStyle = mix(col.a, col.b, f(z)); ctx.strokeStyle = col.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X0 + 118, mid, 24, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = col.surface; ctx.font = '600 13px IBM Plex Sans, sans-serif'; ctx.fillText('Σ → f', X0 + 118, mid);
    info.innerHTML = `z = w₁x₁ + w₂x₂ + b\n  = ${fmt(w[0], 1)}·${fmt(x[0], 2)} + ${fmt(w[1], 1)}·${fmt(x[1], 2)} + ${fmt(b, 1)}\n  = <b>${fmt(z, 2)}</b>\na = f(z) = <b>${fmt(a, 3)}</b>\n\npuerta ${gate}: <b>${ok}/4</b> correctas`;
  }
  const w1 = slider(panel, { label: 'Peso w₁', min: -3, max: 3, step: 0.1, value: 1, fmt: (v) => v.toFixed(1) }, draw);
  const w2 = slider(panel, { label: 'Peso w₂', min: -3, max: 3, step: 0.1, value: 1, fmt: (v) => v.toFixed(1) }, draw);
  const bias = slider(panel, { label: 'Sesgo b', min: -4, max: 4, step: 0.1, value: -0.5, fmt: (v) => v.toFixed(1) }, draw);
  const act = select(panel, 'Función de activación', Object.keys(F), 'escalón', draw);
  buttons(panel, Object.keys(PUERTAS).map((g) => ({ label: `Objetivo ${g}`, onclick: () => { gate = g; draw(); } })));
  const info = readout(panel);
  pointer(c, { down: (px, py) => { if (P.inside(px, py)) { x = [P.ix(px), P.iy(py)]; draw(); } }, move: (px, py, drag) => { if (drag && P.inside(px, py)) { x = [P.ix(px), P.iy(py)]; draw(); } } });
  onTheme(root, draw);
  foot('<b>Qué probar:</b> los cuatro círculos son las entradas de una puerta lógica; el borde verde indica acierto. Con w₁ = w₂ = 1 busca el sesgo que resuelve AND (≈ −1.5) y OR (≈ −0.5). Ahora intenta XOR: es imposible, porque una sola neurona solo puede separar el plano con una línea recta. Ese límite es la razón de ser de las capas ocultas. Arrastra el punto blanco para ver el cálculo en otra entrada.');
  draw();
}
