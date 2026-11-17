import { frame, makeCanvas, pointer, check, buttons, readout, onTheme, colors, mix, clear } from './kit.js';

const N = 20;
const FILTROS = [
  ['Bordes verticales', [-1, 0, 1, -2, 0, 2, -1, 0, 1]],
  ['Bordes horizontales', [-1, -2, -1, 0, 0, 0, 1, 2, 1]],
  ['Diagonal ↘', [2, -1, -1, -1, 2, -1, -1, -1, 2]],
  ['Diagonal ↗', [-1, -1, 2, -1, 2, -1, 2, -1, -1]]
];
const PRESETS = {
  'Siete': (g) => { for (let j = 4; j <= 15; j++) g[4][j] = 1; for (let i = 5; i <= 16; i++) g[i][Math.round(15 - (i - 4) * 0.55)] = 1; },
  'Cero': (g) => { for (let a = 0; a < 200; a++) { const t = a / 200 * 2 * Math.PI; g[Math.round(10 + 6.5 * Math.sin(t))][Math.round(10 + 4.5 * Math.cos(t))] = 1; } },
  'Equis': (g) => { for (let i = 4; i <= 15; i++) { g[i][i] = 1; g[i][19 - i] = 1; } },
  'Cruz': (g) => { for (let i = 3; i <= 16; i++) { g[i][10] = 1; g[10][i] = 1; } }
};

export default function mount(root) {
  const { stage, panel, foot } = frame(root);
  const c = makeCanvas(stage, 680, 420);
  let img, erase = false;
  const PAD = { x: 12, y: 40, cell: 11 };
  const blank = () => Array.from({ length: N }, () => new Array(N).fill(0));
  const conv = (k) => { const O = N - 2, out = []; for (let i = 0; i < O; i++) { out.push([]); for (let j = 0; j < O; j++) { let s = 0; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) s += k[a * 3 + b] * img[i + a][j + b]; out[i].push(s); } } return out; };
  const pool = (m) => { const O = Math.floor(m.length / 2), out = []; for (let i = 0; i < O; i++) { out.push([]); for (let j = 0; j < O; j++) out[i].push(Math.max(m[2 * i][2 * j], m[2 * i][2 * j + 1], m[2 * i + 1][2 * j], m[2 * i + 1][2 * j + 1])); } return out; };
  function grid(m, x, y, size, color) {
    const n = m.length, cell = size / n; let vmax = 1e-9; for (const row of m) for (const v of row) vmax = Math.max(vmax, Math.abs(v));
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { c.ctx.fillStyle = color(m[i][j] / vmax); c.ctx.fillRect(x + j * cell, y + i * cell, cell + 0.4, cell + 0.4); }
  }
  function draw() {
    const col = colors(), { ctx } = c; clear(c, col);
    ctx.font = '600 13px IBM Plex Sans, sans-serif'; ctx.fillStyle = col.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('Dibuja aquí (20×20)', PAD.x, 20);
    ['Filtro', 'Convolución', relu.value ? 'ReLU' : 'Sin ReLU', 'Pooling 2×2'].forEach((t, i) => ctx.fillText(t, [250, 330, 430, 530][i], 20));
    grid(img, PAD.x, PAD.y, N * PAD.cell, (v) => mix(col.sunken, col.ink, v));
    ctx.strokeStyle = col.rule; ctx.strokeRect(PAD.x - 0.5, PAD.y - 0.5, N * PAD.cell + 1, N * PAD.cell + 1);
    const div = (v) => mix(col.surface, v >= 0 ? col.b : col.a, Math.min(1, Math.abs(v)) * 0.9), pos = (v) => mix(col.sunken, col.b, Math.max(0, v));
    const resp = [];
    FILTROS.forEach(([name, k], f) => {
      const y = 40 + f * 92, m = conv(k), r = m.map((row) => row.map((v) => (relu.value ? Math.max(0, v) : v))), p = pool(r);
      grid([k.slice(0, 3), k.slice(3, 6), k.slice(6)], 250, y + 8, 54, div);
      grid(m, 330, y, 80, div); grid(r, 430, y, 80, relu.value ? pos : div); grid(p, 530, y, 80, relu.value ? pos : div);
      ctx.font = '11px IBM Plex Sans, sans-serif'; ctx.fillStyle = col.muted; ctx.fillText(name, 250, y + 76);
      resp.push([name, p.flat().reduce((s, v) => s + Math.max(0, v), 0)]);
    });
    const tot = resp.reduce((s, r) => s + r[1], 0) || 1;
    info.innerHTML = 'respuesta total por filtro\n' + resp.map(([n, v]) => `${n.padEnd(20)} <b>${(100 * v / tot).toFixed(0).padStart(3)} %</b>`).join('\n');
  }
  const paint = (x, y) => { const j = Math.floor((x - PAD.x) / PAD.cell), i = Math.floor((y - PAD.y) / PAD.cell); if (i < 0 || j < 0 || i >= N || j >= N) return; for (const [di, dj] of [[0, 0], [0, 1], [1, 0]]) if (i + di < N && j + dj < N) img[i + di][j + dj] = erase ? 0 : 1; draw(); };
  pointer(c, { down: paint, move: (x, y, drag) => { if (drag) paint(x, y); } });
  buttons(panel, Object.keys(PRESETS).map((name) => ({ label: name, onclick: () => { img = blank(); PRESETS[name](img); draw(); } })));
  buttons(panel, [{ label: 'Borrar todo', onclick: () => { img = blank(); draw(); } }]);
  check(panel, 'Modo borrador', false, (v) => { erase = v; });
  const relu = check(panel, 'Aplicar ReLU', true, draw);
  const info = readout(panel);
  onTheme(root, draw);
  foot('<b>Qué observar:</b> cada fila es un filtro distinto aplicado a tu dibujo. La columna «Convolución» responde con valores positivos (azul) y negativos (ámbar); ReLU elimina los negativos; el pooling reduce la resolución conservando la respuesta más fuerte de cada bloque 2×2. Dibuja un «Siete»: el trazo horizontal activa un filtro y el diagonal otro. Esa combinación de respuestas es lo que las capas siguientes usan para reconocer formas. En una CNN real estos filtros se aprenden y hay decenas o cientos por capa.');
  img = blank(); PRESETS.Siete(img); draw();
}
