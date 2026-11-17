import { frame, makeCanvas, slider, select, readout, onTheme, colors, clear, fmt } from './kit.js';

const CLASES = ['gato', 'perro', 'pájaro', 'pez'];

export default function mount(root) {
  const { stage, panel, foot } = frame(root);
  const c = makeCanvas(stage, 640, 300);
  const z = [2.0, 1.0, 0.1, -1.0];
  function draw() {
    const col = colors(), { ctx } = c; clear(c, col);
    const T = temp.value, m = Math.max(...z.map((v) => v / T));
    const e = z.map((v) => Math.exp(v / T - m)), s = e.reduce((a, b) => a + b, 0), p = e.map((v) => v / s);
    const y = CLASES.indexOf(real.value);
    ctx.font = '13px IBM Plex Sans, sans-serif'; ctx.textBaseline = 'middle';
    CLASES.forEach((name, i) => {
      const y0 = 30 + i * 62;
      ctx.fillStyle = col.ink; ctx.textAlign = 'left'; ctx.fillText(`${name}${i === y ? '  (clase real)' : ''}`, 16, y0);
      ctx.fillStyle = col.muted; ctx.fillText(`puntuación z = ${z[i].toFixed(1)}`, 16, y0 + 20);
      ctx.fillStyle = col.sunken; ctx.fillRect(190, y0 - 6, 380, 30);
      ctx.fillStyle = i === y ? col.ok : col.b; ctx.fillRect(190, y0 - 6, 380 * p[i], 30);
      ctx.fillStyle = col.ink; ctx.textAlign = 'left'; ctx.fillText((100 * p[i]).toFixed(1) + ' %', 198 + 380 * p[i], y0 + 9);
    });
    const loss = -Math.log(p[y]);
    info.innerHTML = `p(clase real) = <b>${fmt(p[y])}</b>\npérdida = −ln p = <b>${fmt(loss)}</b>\nsuma de probabilidades = ${p.reduce((a, b) => a + b, 0).toFixed(3)}`;
  }
  CLASES.forEach((name, i) => slider(panel, { label: `z ${name}`, min: -5, max: 5, step: 0.1, value: z[i], fmt: (v) => v.toFixed(1) }, (v) => { z[i] = v; draw(); }));
  const temp = slider(panel, { label: 'Temperatura T', min: 0.1, max: 5, step: 0.1, value: 1, fmt: (v) => v.toFixed(1) }, draw);
  const real = select(panel, 'Clase real', CLASES, 'gato', draw);
  const info = readout(panel);
  onTheme(root, draw);
  foot('<b>Qué probar:</b> baja la puntuación de la clase real hasta −5: la pérdida crece sin límite, porque la entropía cruzada castiga mucho estar seguro y equivocado. Con temperatura baja la distribución se vuelve casi «todo o nada»; con temperatura alta se aplana. Es el mismo parámetro de temperatura que usan los modelos de lenguaje al generar texto.');
  draw();
}
