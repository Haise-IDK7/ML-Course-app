import { frame, makeCanvas, pointer, slider, check, buttons, readout, onTheme, Plot, colors, mix, clear, fmt } from './kit.js';
import { makeRng } from '../lib/rng.js';

export default function mount(root) {
  const { stage, panel, foot } = frame(root);
  const c = makeCanvas(stage, 680, 340);
  const P = new Plot(c.ctx, { x: 30, y: 14, w: 312, h: 312 }, { x0: -1, x1: 1, y0: -1, y1: 1 });
  const V = new Plot(c.ctx, { x: 410, y: 14, w: 256, h: 270 }, { x0: 0, x1: 180, y0: 0, y1: 1 });
  let seed = 9, X, cov, total, pc1;
  function gen() {
    const r = makeRng(seed), rho = corr.value, th = 0.6;
    X = Array.from({ length: 140 }, () => {
      const u = 0.42 * r.normal(), v = 0.42 * (1 - rho) * r.normal(); // nube alargada: mucha varianza en u, poca en v
      return [u * Math.cos(th) - v * Math.sin(th), u * Math.sin(th) + v * Math.cos(th)];
    });
    const mx = X.reduce((s, p) => s + p[0], 0) / X.length, my = X.reduce((s, p) => s + p[1], 0) / X.length;
    X = X.map((p) => [p[0] - mx, p[1] - my]); // PCA siempre centra los datos primero
    let sxx = 0, sxy = 0, syy = 0; for (const [x, y] of X) { sxx += x * x; sxy += x * y; syy += y * y; }
    cov = [sxx / X.length, sxy / X.length, syy / X.length]; total = cov[0] + cov[2];
    pc1 = (0.5 * Math.atan2(2 * cov[1], cov[0] - cov[2]) * 180 / Math.PI + 180) % 180; // ángulo del primer vector propio
    draw();
  }
  const varAt = (deg) => { const a = deg * Math.PI / 180, cx = Math.cos(a), sy = Math.sin(a); return cx * cx * cov[0] + 2 * cx * sy * cov[1] + sy * sy * cov[2]; };
  function draw() {
    const col = colors(); clear(c, col);
    const a = ang.value * Math.PI / 180, ux = Math.cos(a), uy = Math.sin(a);
    P.frame(col, { xt: 4 });
    P.line([[-1.4 * ux, -1.4 * uy], [1.4 * ux, 1.4 * uy]], col.b, 2);
    for (const [x, y] of X) {
      const t = x * ux + y * uy;
      if (proj.value) { c.ctx.strokeStyle = mix(col.muted, col.surface, 0.55); c.ctx.lineWidth = 1; c.ctx.beginPath(); c.ctx.moveTo(P.px(x), P.py(y)); c.ctx.lineTo(P.px(t * ux), P.py(t * uy)); c.ctx.stroke(); P.dot(t * ux, t * uy, col.b, 2.5); }
      P.dot(x, y, col.a, 3.5, col.surface);
    }
    if (show.value) { const p = pc1 * Math.PI / 180; P.line([[-Math.cos(p), -Math.sin(p)], [Math.cos(p), Math.sin(p)]], col.ok, 2, [6, 4]); P.line([[Math.sin(p) * 0.5, -Math.cos(p) * 0.5], [-Math.sin(p) * 0.5, Math.cos(p) * 0.5]], col.ok, 1.5, [2, 4]); }
    V.frame(col, { xl: 'ángulo del eje (grados)', yl: 'fracción de varianza conservada', xt: 6 });
    const curve = []; for (let d = 0; d <= 180; d += 2) curve.push([d, varAt(d) / total]);
    V.line(curve, col.b, 2); V.dot(ang.value, varAt(ang.value) / total, col.b, 6, col.surface);
    if (show.value) V.line([[pc1, 0], [pc1, 1]], col.ok, 1.5, [6, 4]);
    info.innerHTML = `varianza sobre el eje: <b>${fmt(varAt(ang.value), 4)}</b>\nconserva el <b>${(100 * varAt(ang.value) / total).toFixed(1)} %</b> del total\nerror de reconstrucción: <b>${fmt(total - varAt(ang.value), 4)}</b>${show.value ? `\nPC1 está en ${pc1.toFixed(0)}°` : ''}`;
  }
  const ang = slider(panel, { label: 'Ángulo del eje', min: 0, max: 180, value: 100, fmt: (v) => v + '°' }, draw);
  const corr = slider(panel, { label: 'Alargamiento de la nube', min: 0, max: 0.98, step: 0.02, value: 0.9, fmt: (v) => v.toFixed(2) }, gen);
  const proj = check(panel, 'Mostrar proyecciones', true, draw);
  const show = check(panel, 'Revelar la componente principal', false, draw);
  buttons(panel, [{ label: 'Datos nuevos', onclick: () => { seed++; gen(); } }]);
  const info = readout(panel);
  pointer(c, { move: (x, y, drag) => { if (drag && P.inside(x, y)) { const d = (Math.atan2(P.iy(y), P.ix(x)) * 180 / Math.PI + 360) % 180; ang.set(Math.round(d)); draw(); } }, down: () => {} });
  onTheme(root, draw);
  foot('<b>Qué probar:</b> arrastra sobre la nube para girar el eje azul. Busca el ángulo que hace máxima la varianza de las proyecciones (puntos azules más dispersos): es el mismo que hace mínimas las líneas grises, es decir, el error de reconstrucción. Luego revela la componente principal para comprobarlo. Con alargamiento 0 ningún eje es mejor que otro y PCA no aporta nada.');
  gen();
}
