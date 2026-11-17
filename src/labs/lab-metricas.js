import { frame, makeCanvas, slider, readout, legend, onTheme, Plot, colors, mix, clear } from './kit.js';

// Función de distribución normal estándar (aproximación de Abramowitz y Stegun).
const Phi = (x) => { const t = 1 / (1 + 0.2316419 * Math.abs(x)), d = 0.3989423 * Math.exp(-x * x / 2); const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return x > 0 ? 1 - p : p; };
const pdf = (x, m, s) => Math.exp(-((x - m) ** 2) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI));

export default function mount(root) {
  const { stage, panel, foot } = frame(root);
  const c = makeCanvas(stage, 680, 330);
  const D = new Plot(c.ctx, { x: 30, y: 14, w: 330, h: 270 }, { x0: 0, x1: 1, y0: 0, y1: 5 });
  const R = new Plot(c.ctx, { x: 420, y: 14, w: 246, h: 246 }, { x0: 0, x1: 1, y0: 0, y1: 1 });
  const N = 1000, S = 0.13;
  function draw() {
    const col = colors(); clear(c, col);
    const sep = sp.value, mn = 0.5 - sep / 2, mp = 0.5 + sep / 2, t = th.value, prev = pv.value / 100;
    const nPos = Math.round(N * prev), nNeg = N - nPos;
    const tpr = (u) => 1 - Phi((u - mp) / S), fpr = (u) => 1 - Phi((u - mn) / S);
    const TP = Math.round(nPos * tpr(t)), FP = Math.round(nNeg * fpr(t)), FN = nPos - TP, TN = nNeg - FP;
    D.frame(col, { xl: 'puntuación del modelo (probabilidad de «positivo»)', yt: 0 });
    D.line((x) => pdf(x, mn, S) * (1 - prev) * 2, col.a, 2); D.line((x) => pdf(x, mp, S) * prev * 2, col.b, 2);
    c.ctx.fillStyle = mix(col.ink, col.surface, 0.92); c.ctx.fillRect(D.px(t), D.box.y, D.box.x + D.box.w - D.px(t), D.box.h);
    c.ctx.strokeStyle = col.ink; c.ctx.lineWidth = 2; c.ctx.beginPath(); c.ctx.moveTo(D.px(t), D.box.y); c.ctx.lineTo(D.px(t), D.box.y + D.box.h); c.ctx.stroke();
    D.text('predice positivo →', t + 0.015, 4.7, col.ink); D.text('← predice negativo', t - 0.015, 4.7, col.muted, 'right');
    R.frame(col, { xl: 'tasa de falsos positivos', yl: 'exhaustividad (TPR)', xt: 4 });
    R.line([[0, 0], [1, 1]], col.rule, 1, [4, 4]);
    const roc = []; let auc = 0, px = 1, py = 1;
    for (let i = 0; i <= 200; i++) { const u = i / 200, x = fpr(u), y = tpr(u); roc.push([x, y]); auc += (px - x) * (py + y) / 2; px = x; py = y; }
    R.line(roc, col.violet, 2.5); R.dot(fpr(t), tpr(t), col.violet, 6, col.surface);
    const prec = TP / (TP + FP || 1), rec = TP / (TP + FN || 1), f1 = 2 * prec * rec / (prec + rec || 1), acc = (TP + TN) / N;
    info.innerHTML = `              pred. +   pred. −\nreal +   VP <b>${String(TP).padStart(4)}</b>   FN <b>${String(FN).padStart(4)}</b>\nreal −   FP <b>${String(FP).padStart(4)}</b>   VN <b>${String(TN).padStart(4)}</b>\n\nexactitud      <b>${(100 * acc).toFixed(1)} %</b>\nprecisión      <b>${(100 * prec).toFixed(1)} %</b>\nexhaustividad  <b>${(100 * rec).toFixed(1)} %</b>\nF1             <b>${f1.toFixed(3)}</b>\nAUC-ROC        <b>${auc.toFixed(3)}</b>`;
  }
  const th = slider(panel, { label: 'Umbral de decisión', min: 0.02, max: 0.98, step: 0.01, value: 0.5, fmt: (v) => v.toFixed(2) }, draw);
  const sp = slider(panel, { label: 'Calidad del modelo (separación)', min: 0, max: 0.6, step: 0.02, value: 0.26, fmt: (v) => v.toFixed(2) }, draw);
  const pv = slider(panel, { label: 'Positivos en los datos', min: 1, max: 50, value: 50, fmt: (v) => v + ' %' }, draw);
  legend(panel, [[colors().a, 'negativos reales'], [colors().b, 'positivos reales']]);
  const info = readout(panel);
  onTheme(root, draw);
  foot('<b>Qué probar:</b> mueve el umbral: subirlo aumenta la precisión y baja la exhaustividad, y viceversa. Ahora pon los positivos en 2 % y el umbral en 0.9: la exactitud supera el 97 % aunque el modelo casi no detecta positivos. Por eso la exactitud engaña con clases desbalanceadas. El AUC no cambia con el umbral: mide el modelo, no la decisión.');
  draw();
}
