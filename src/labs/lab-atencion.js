import { frame, makeCanvas, pointer, slider, check, buttons, readout, onTheme, Plot, colors, mix, clear, fmt } from './kit.js';

// Autoatención de juguete: cada palabra tiene un vector 2D que hace a la vez de consulta, clave y valor.
// pesos = softmax(q · k_j / (sqrt(d) · T));  salida = suma de pesos_j · v_j
const INICIAL = [['el', [0.3, 0.2]], ['gato', [1.2, 1.0]], ['duerme', [0.2, 1.4]], ['porque', [-0.5, 0.1]], ['está', [-0.2, 0.8]], ['cansado', [0.9, 1.3]]];

export default function mount(root) {
  const { stage, panel, foot } = frame(root);
  const c = makeCanvas(stage, 680, 400);
  const P = new Plot(c.ctx, { x: 40, y: 50, w: 330, h: 330 }, { x0: -1.6, x1: 1.6, y0: -1.6, y1: 1.6 });
  let toks, q = 5, drag = -1;
  const init = () => { toks = INICIAL.map(([w, v]) => ({ w, v: [...v] })); draw(); };
  function attend() {
    const s = toks.map((t, j) => (causal.value && j > q ? -Infinity : (toks[q].v[0] * t.v[0] + toks[q].v[1] * t.v[1]) / (Math.SQRT2 * temp.value)));
    const m = Math.max(...s), e = s.map((v) => Math.exp(v - m)), z = e.reduce((a, b) => a + b, 0), a = e.map((v) => v / z);
    return { s, a, out: [a.reduce((r, w, j) => r + w * toks[j].v[0], 0), a.reduce((r, w, j) => r + w * toks[j].v[1], 0)] };
  }
  function draw() {
    const col = colors(), { ctx } = c, { s, a, out } = attend(); clear(c, col);
    // frase con los pesos de atención como intensidad de fondo
    ctx.font = '600 14px IBM Plex Sans, sans-serif'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    let x = 40; toks.forEach((t, j) => {
      const wd = ctx.measureText(t.w).width + 18; t.box = [x, 10, wd, 26];
      ctx.fillStyle = mix(col.surface, col.b, a[j] * 0.85); ctx.fillRect(x, 10, wd, 26);
      ctx.strokeStyle = j === q ? col.a : col.rule; ctx.lineWidth = j === q ? 3 : 1; ctx.strokeRect(x, 10, wd, 26);
      ctx.fillStyle = col.ink; ctx.fillText(t.w, x + wd / 2, 23); x += wd + 6;
    });
    P.frame(col, { xt: 4, yt: 4 });
    toks.forEach((t, j) => {
      P.line([[0, 0], t.v], j === q ? col.a : mix(col.muted, col.b, a[j]), 1.5 + 5 * a[j]);
      P.dot(t.v[0], t.v[1], j === q ? col.a : col.b, 5, col.surface); P.text(t.w, t.v[0] + 0.07, t.v[1] + 0.09, col.ink);
    });
    P.dot(out[0], out[1], col.ok, 7, col.ink); P.text('salida', out[0] + 0.09, out[1] - 0.1, col.ok);
    // barras de pesos
    ctx.textAlign = 'left'; ctx.font = '12px IBM Plex Sans, sans-serif';
    ctx.fillStyle = col.ink; ctx.fillText(`A qué atiende «${toks[q].w}»`, 420, 62);
    toks.forEach((t, j) => {
      const y = 86 + j * 44;
      ctx.fillStyle = col.ink; ctx.fillText(t.w, 420, y + 8); ctx.fillStyle = col.muted; ctx.fillText(Number.isFinite(s[j]) ? `puntuación ${fmt(s[j], 2)}` : 'enmascarada', 420, y + 24);
      ctx.fillStyle = col.sunken; ctx.fillRect(520, y, 148, 16); ctx.fillStyle = col.b; ctx.fillRect(520, y, 148 * a[j], 16);
      ctx.fillStyle = col.ink; ctx.fillText((100 * a[j]).toFixed(0) + ' %', 524 + 148 * a[j] > 640 ? 640 : 524 + 148 * a[j], y + 8);
    });
    info.innerHTML = `consulta: <b>${toks[q].w}</b> = (${fmt(toks[q].v[0], 2)}, ${fmt(toks[q].v[1], 2)})\nsalida = Σ peso·valor = <b>(${fmt(out[0], 2)}, ${fmt(out[1], 2)})</b>\nentropía de los pesos: ${fmt(-a.reduce((r, p) => r + (p > 0 ? p * Math.log(p) : 0), 0), 2)}`;
  }
  const temp = slider(panel, { label: 'Temperatura', min: 0.1, max: 3, step: 0.1, value: 0.5, fmt: (v) => v.toFixed(1) }, draw);
  const causal = check(panel, 'Máscara causal (no mirar al futuro)', false, draw);
  buttons(panel, [{ label: 'Restablecer vectores', onclick: init }]);
  const info = readout(panel);
  pointer(c, {
    down: (x, y) => {
      const hit = toks.findIndex((t) => x >= t.box[0] && x <= t.box[0] + t.box[2] && y >= t.box[1] && y <= t.box[1] + t.box[3]);
      if (hit >= 0) { q = hit; draw(); return; }
      drag = toks.findIndex((t) => Math.hypot(P.px(t.v[0]) - x, P.py(t.v[1]) - y) < 12);
    },
    move: (x, y, d) => { if (d && drag >= 0 && P.inside(x, y)) { toks[drag].v = [P.ix(x), P.iy(y)]; draw(); } },
    up: () => { drag = -1; }
  });
  onTheme(root, draw);
  foot('<b>Qué probar:</b> haz clic en una palabra de la frase para usarla como consulta. Su vector se compara (producto punto) con el de todas las palabras; las más alineadas reciben más peso, y la salida (punto verde) es el promedio ponderado. «cansado» apunta en la misma dirección que «gato», así que atiende a él. Arrastra «gato» al lado contrario y la atención se va a otra parte. Activa la máscara causal: la palabra ya no puede atender a las que vienen después, como en los modelos tipo GPT. <b>Simplificación:</b> en un Transformer real, consulta, clave y valor son tres proyecciones aprendidas distintas y los vectores tienen cientos de dimensiones.');
  init();
}
