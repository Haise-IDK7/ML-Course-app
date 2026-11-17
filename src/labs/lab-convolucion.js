import { frame, makeCanvas, pointer, slider, select, buttons, readout, animator, onTheme, colors, mix, clear } from './kit.js';
import { h } from '../core/dom.js';

const N = 8;
const IMAGENES = {
  'Borde vertical': (i, j) => (j >= 4 ? 1 : 0),
  'Cuadrado': (i, j) => (i >= 2 && i <= 5 && j >= 2 && j <= 5 ? 1 : 0),
  'Diagonal': (i, j) => (Math.abs(i - j) <= 0 ? 1 : 0),
  'Cruz': (i, j) => (i === 3 || i === 4 || j === 3 || j === 4 ? 1 : 0),
  'Degradado': (i, j) => j / (N - 1)
};
const FILTROS = {
  'Sobel X (bordes verticales)': [-1, 0, 1, -2, 0, 2, -1, 0, 1],
  'Sobel Y (bordes horizontales)': [-1, -2, -1, 0, 0, 0, 1, 2, 1],
  'Desenfoque (media)': Array(9).fill(+(1 / 9).toFixed(3)),
  'Enfoque': [0, -1, 0, -1, 5, -1, 0, -1, 0],
  'Laplaciano (contornos)': [0, 1, 0, 1, -4, 1, 0, 1, 0],
  'Identidad': [0, 0, 0, 0, 1, 0, 0, 0, 0]
};

export default function mount(root) {
  const { stage, panel, foot } = frame(root);
  const c = makeCanvas(stage, 680, 360);
  let img = [], K = [...FILTROS['Sobel X (bordes verticales)']], pos = 0;
  const kin = [];
  const setImage = (name) => { img = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => IMAGENES[name](i, j))); pos = 0; draw(); };
  const outSize = () => Math.floor((N + 2 * pad.value - 3) / stride.value) + 1;
  const at = (i, j) => (i < 0 || j < 0 || i >= N || j >= N ? 0 : img[i][j]); // relleno con ceros
  const conv = (oi, oj) => { let s = 0; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) s += K[a * 3 + b] * at(oi * stride.value - pad.value + a, oj * stride.value - pad.value + b); return s; };
  function draw() {
    const col = colors(), { ctx } = c; clear(c, col);
    const p = pad.value, s = stride.value, M = N + 2 * p, cell = Math.min(34, 290 / M), ox = 16, oy = 46;
    const O = outSize(), oi = Math.floor(pos / O) % O, oj = pos % O;
    ctx.font = '600 13px IBM Plex Sans, sans-serif'; ctx.fillStyle = col.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(`Entrada ${N}×${N}${p ? ` + relleno ${p}` : ''}`, ox, 22); ctx.fillText(`Salida ${O}×${O} (mapa de características)`, 400, 22);
    for (let i = 0; i < M; i++) for (let j = 0; j < M; j++) {
      const inside = i >= p && j >= p && i < N + p && j < N + p, v = at(i - p, j - p);
      ctx.fillStyle = inside ? mix(col.sunken, col.ink, v * 0.85) : col.surface; ctx.fillRect(ox + j * cell, oy + i * cell, cell - 1, cell - 1);
      if (!inside) { ctx.strokeStyle = col.rule; ctx.setLineDash([2, 2]); ctx.strokeRect(ox + j * cell + 0.5, oy + i * cell + 0.5, cell - 2, cell - 2); ctx.setLineDash([]); }
    }
    ctx.strokeStyle = col.a; ctx.lineWidth = 3; ctx.strokeRect(ox + oj * s * cell - 1, oy + oi * s * cell - 1, 3 * cell + 1, 3 * cell + 1);
    const oc = Math.min(34, 250 / O), qx = 400, vals = [];
    let vmax = 1e-9; for (let i = 0; i < O; i++) for (let j = 0; j < O; j++) { const v = conv(i, j); vals.push(v); vmax = Math.max(vmax, Math.abs(v)); }
    ctx.font = '10px IBM Plex Mono, monospace'; ctx.textAlign = 'center';
    for (let i = 0; i < O; i++) for (let j = 0; j < O; j++) {
      const idx = i * O + j, v = vals[idx], done = idx <= pos;
      ctx.fillStyle = done ? mix(col.surface, v >= 0 ? col.b : col.a, Math.abs(v) / vmax * 0.9) : col.sunken; ctx.fillRect(qx + j * oc, oy + i * oc, oc - 1, oc - 1);
      if (done && oc >= 24) { ctx.fillStyle = col.ink; ctx.fillText(Math.abs(v) < 10 ? v.toFixed(1) : v.toFixed(0), qx + j * oc + oc / 2, oy + i * oc + oc / 2); }
    }
    ctx.strokeStyle = col.a; ctx.lineWidth = 3; ctx.strokeRect(qx + oj * oc - 1, oy + oi * oc - 1, oc + 1, oc + 1);
    const terms = []; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) terms.push(`${at(oi * s - p + a, oj * s - p + b).toFixed(1)}·${K[a * 3 + b]}`);
    info.innerHTML = `salida[${oi}, ${oj}] =\n${terms.slice(0, 3).join(' + ')}\n+ ${terms.slice(3, 6).join(' + ')}\n+ ${terms.slice(6).join(' + ')}\n= <b>${conv(oi, oj).toFixed(2)}</b>\n\ntamaño = ⌊(${N} + 2·${p} − 3)/${s}⌋ + 1 = <b>${O}</b>`;
  }
  select(panel, 'Imagen', Object.keys(IMAGENES), 'Cuadrado', setImage);
  select(panel, 'Filtro (kernel 3×3)', Object.keys(FILTROS), 'Sobel X (bordes verticales)', (name) => { K = [...FILTROS[name]]; kin.forEach((el, i) => { el.value = K[i]; }); pos = 0; draw(); });
  const grid = h('div', { class: 'kgrid', style: { gridTemplateColumns: 'repeat(3, auto)' } });
  for (let i = 0; i < 9; i++) { const el = h('input', { type: 'number', step: 0.5, value: K[i], 'aria-label': `Peso ${i + 1} del filtro` }); el.addEventListener('input', () => { K[i] = +el.value || 0; draw(); }); kin.push(el); grid.append(el); }
  panel.append(grid);
  const stride = slider(panel, { label: 'Paso (stride)', min: 1, max: 3, value: 1 }, () => { pos = 0; draw(); });
  const pad = slider(panel, { label: 'Relleno (padding)', min: 0, max: 2, value: 0 }, () => { pos = 0; draw(); });
  let last = 0;
  const run = animator(root, () => { const now = performance.now(); if (now - last > 160) { last = now; pos = (pos + 1) % (outSize() ** 2); draw(); } });
  const btn = buttons(panel, [
    { label: 'Siguiente celda', onclick: () => { pos = (pos + 1) % (outSize() ** 2); draw(); } },
    { label: 'Animar', primary: true, onclick: () => { btn[1].textContent = run.toggle() ? 'Pausar' : 'Animar'; } },
    { label: 'Ver todo', onclick: () => { run.stop(); btn[1].textContent = 'Animar'; pos = outSize() ** 2 - 1; draw(); } }
  ]);
  const info = readout(panel);
  pointer(c, { down: (x, y) => { const p = pad.value, M = N + 2 * p, cell = Math.min(34, 290 / M), j = Math.floor((x - 16) / cell) - p, i = Math.floor((y - 46) / cell) - p; if (i >= 0 && j >= 0 && i < N && j < N) { img[i][j] = img[i][j] > 0.5 ? 0 : 1; draw(); } } });
  onTheme(root, draw);
  foot('<b>Qué probar:</b> con «Cuadrado» y Sobel X, la salida es positiva (azul) en un borde y negativa (ámbar) en el otro, y 0 donde la imagen es uniforme: el filtro detecta <i>cambios</i>, no brillo. Cambia a Sobel Y. Edita los nueve pesos a mano: en una CNN esos números no los diseña nadie, se aprenden. Con relleno 1 la salida conserva el tamaño 8×8; con paso 2 se reduce a la mitad. Haz clic en la imagen para pintar píxeles.');
  setImage('Cuadrado');
}
