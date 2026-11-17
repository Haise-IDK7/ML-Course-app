// Piezas comunes de los laboratorios: lienzo con coordenadas lógicas, controles, gráficas y animación.
import { h } from '../core/dom.js';

const cssVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
export const colors = () => ({
  ink: cssVar('--ink'), muted: cssVar('--muted'), rule: cssVar('--rule'), surface: cssVar('--surface'), paper: cssVar('--paper'),
  sunken: cssVar('--sunken'), a: cssVar('--amber'), b: cssVar('--cobalt'), ok: cssVar('--ok'), bad: cssVar('--bad'), violet: cssVar('--violet')
});

// Acepta '#rrggbb', '#rgb' o 'rgb(r, g, b)', para poder encadenar mezclas.
const hex = (c) => {
  if (c[0] === '#') { let s = c.slice(1); if (s.length === 3) s = [...s].map((ch) => ch + ch).join(''); const n = parseInt(s, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  const m = c.match(/[\d.]+/g);
  return m ? m.slice(0, 3).map(Number) : [128, 128, 128];
};
export function mix(c1, c2, t) {
  const a = hex(c1), b = hex(c2);
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`;
}

// Estructura estándar: escenario (lienzos) + panel de controles + pie con «qué observar».
export function frame(root) {
  const stage = h('div', { class: 'lab-stage' }), panel = h('div', { class: 'lab-panel' }), foot = h('div', { class: 'lab-foot' });
  root.append(h('div', { class: 'lab-body' }, stage, panel), foot);
  return { stage, panel, foot: (html) => { foot.innerHTML = html; } };
}

// Lienzo de tamaño lógico fijo (W x H); se escala por CSS y por densidad de píxeles.
export function makeCanvas(parent, W = 640, H = 400) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const cv = h('canvas', { width: W * dpr, height: H * dpr });
  cv.style.aspectRatio = `${W} / ${H}`;
  const ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  parent.append(cv);
  return { cv, ctx, W, H };
}

// Eventos de puntero en coordenadas lógicas del lienzo.
export function pointer(c, { down, move, up }) {
  const pos = (e) => { const r = c.cv.getBoundingClientRect(); return [(e.clientX - r.left) * c.W / r.width, (e.clientY - r.top) * c.H / r.height]; };
  let dragging = false;
  c.cv.addEventListener('pointerdown', (e) => { dragging = true; c.cv.setPointerCapture(e.pointerId); down?.(...pos(e), e); });
  c.cv.addEventListener('pointermove', (e) => move?.(...pos(e), dragging, e));
  const end = (e) => { if (dragging) { dragging = false; up?.(...pos(e), e); } };
  c.cv.addEventListener('pointerup', end); c.cv.addEventListener('pointercancel', end);
}

export function slider(panel, { label, min, max, step = 1, value, fmt = (v) => v }, onInput) {
  const out = h('output', {}, fmt(value));
  const input = h('input', { type: 'range', min, max, step, value, 'aria-label': label });
  input.addEventListener('input', () => { out.textContent = fmt(+input.value); onInput?.(+input.value); });
  panel.append(h('div', { class: 'ctl' }, h('label', {}, label, out), input));
  return { get value() { return +input.value; }, set(v) { input.value = v; out.textContent = fmt(+input.value); } };
}

export function select(panel, label, options, value, onChange) {
  const sel = h('select', { 'aria-label': label }, options.map((o) => { const [v, t] = Array.isArray(o) ? o : [o, o]; return h('option', { value: v, selected: v === value }, t); }));
  sel.addEventListener('change', () => onChange?.(sel.value));
  panel.append(h('div', { class: 'ctl' }, h('label', {}, label), sel));
  return { get value() { return sel.value; }, set(v) { sel.value = v; } };
}

export function check(panel, label, value, onChange) {
  const input = h('input', { type: 'checkbox', checked: value });
  input.addEventListener('change', () => onChange?.(input.checked));
  panel.append(h('div', { class: 'ctl check' }, h('label', {}, input, ' ', label)));
  return { get value() { return input.checked; }, set(v) { input.checked = v; } };
}

export function buttons(panel, defs) {
  const els = defs.map((d) => h('button', { class: `btn small${d.primary ? ' primary' : ''}`, onclick: d.onclick }, d.label));
  panel.append(h('div', { class: 'row' }, els));
  return els;
}

export function readout(panel) { const el = h('div', { class: 'readout' }); panel.append(el); return el; }

export function legend(panel, items) {
  const el = h('div', { class: 'legend' });
  const set = (list) => { el.innerHTML = list.map(([c, t]) => `<span><i style="background:${c}"></i>${t}</span>`).join(''); };
  set(items); panel.append(el);
  return set;
}

// Bucle de animación que se detiene solo cuando el laboratorio sale de la página.
export function animator(el, tick) {
  let running = false, raf = 0;
  const loop = () => {
    if (!running) return;
    if (!el.isConnected) { running = false; return; }
    if (!document.hidden) tick();
    raf = requestAnimationFrame(loop);
  };
  return {
    get running() { return running; },
    start() { if (!running) { running = true; raf = requestAnimationFrame(loop); } },
    stop() { running = false; cancelAnimationFrame(raf); },
    toggle() { running ? this.stop() : this.start(); return running; }
  };
}

// Redibuja al cambiar el tema claro/oscuro.
export function onTheme(el, fn) {
  const handler = () => { if (!el.isConnected) window.removeEventListener('themechange', handler); else fn(); };
  window.addEventListener('themechange', handler);
}

// Gráfica cartesiana dentro de una caja del lienzo.
export class Plot {
  constructor(ctx, box, range) { this.ctx = ctx; this.box = box; this.r = range; }
  px(x) { return this.box.x + (x - this.r.x0) / (this.r.x1 - this.r.x0) * this.box.w; }
  py(y) { return this.box.y + this.box.h - (y - this.r.y0) / (this.r.y1 - this.r.y0) * this.box.h; }
  ix(px) { return this.r.x0 + (px - this.box.x) / this.box.w * (this.r.x1 - this.r.x0); }
  iy(py) { return this.r.y0 + (this.box.y + this.box.h - py) / this.box.h * (this.r.y1 - this.r.y0); }
  inside(px, py) { const b = this.box; return px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h; }
  clip(fn) { const { ctx, box: b } = this; ctx.save(); ctx.beginPath(); ctx.rect(b.x, b.y, b.w, b.h); ctx.clip(); fn(); ctx.restore(); }
  frame(c, { xl, yl, xt = 5, yt = 4, zero = true, fmt = (v) => +v.toFixed(2), fx = fmt, fy = fmt } = {}) {
    const { ctx, box: b, r } = this;
    ctx.save();
    ctx.fillStyle = c.surface; ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.font = '11px IBM Plex Sans, sans-serif'; ctx.fillStyle = c.muted; ctx.strokeStyle = c.rule; ctx.lineWidth = 1;
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    for (let i = 0; i <= xt; i++) { const x = r.x0 + (r.x1 - r.x0) * i / xt, p = Math.round(this.px(x)) + 0.5; ctx.beginPath(); ctx.moveTo(p, b.y); ctx.lineTo(p, b.y + b.h); ctx.stroke(); ctx.fillText(fx(x), p, b.y + b.h + 4); }
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    for (let i = 0; i <= yt; i++) { const y = r.y0 + (r.y1 - r.y0) * i / yt, p = Math.round(this.py(y)) + 0.5; ctx.beginPath(); ctx.moveTo(b.x, p); ctx.lineTo(b.x + b.w, p); ctx.stroke(); ctx.fillText(fy(y), b.x - 5, p); }
    if (zero) {
      ctx.strokeStyle = c.muted; ctx.lineWidth = 1;
      if (r.y0 < 0 && r.y1 > 0) { const p = Math.round(this.py(0)) + 0.5; ctx.beginPath(); ctx.moveTo(b.x, p); ctx.lineTo(b.x + b.w, p); ctx.stroke(); }
      if (r.x0 < 0 && r.x1 > 0) { const p = Math.round(this.px(0)) + 0.5; ctx.beginPath(); ctx.moveTo(p, b.y); ctx.lineTo(p, b.y + b.h); ctx.stroke(); }
    }
    ctx.fillStyle = c.muted; ctx.textAlign = 'center';
    if (xl) { ctx.textBaseline = 'bottom'; ctx.fillText(xl, b.x + b.w / 2, b.y + b.h + 32); }
    if (yl) { ctx.save(); ctx.translate(b.x - 40, b.y + b.h / 2); ctx.rotate(-Math.PI / 2); ctx.textBaseline = 'top'; ctx.fillText(yl, 0, 0); ctx.restore(); }
    ctx.restore();
  }
  // pts: [[x, y], ...] o función y = f(x)
  line(pts, color, width = 2, dash = []) {
    const { ctx, r } = this;
    if (typeof pts === 'function') { const f = pts; pts = []; for (let i = 0; i <= 240; i++) { const x = r.x0 + (r.x1 - r.x0) * i / 240; pts.push([x, f(x)]); } }
    this.clip(() => {
      ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dash);
      let pen = false;
      for (const [x, y] of pts) { if (!Number.isFinite(y)) { pen = false; continue; } const X = this.px(x), Y = this.py(y); pen ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); pen = true; }
      ctx.stroke(); ctx.setLineDash([]);
    });
  }
  dot(x, y, color, rad = 4, stroke) {
    const { ctx } = this;
    ctx.beginPath(); ctx.arc(this.px(x), this.py(y), rad, 0, 7); ctx.fillStyle = color; ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
  }
  // Mapa de calor de f(x, y) -> color CSS, con celdas de «cell» píxeles lógicos.
  heat(fn, cell = 8) {
    const { ctx, box: b } = this;
    for (let py = b.y; py < b.y + b.h; py += cell) for (let px = b.x; px < b.x + b.w; px += cell) {
      ctx.fillStyle = fn(this.ix(px + cell / 2), this.iy(py + cell / 2));
      ctx.fillRect(px, py, Math.min(cell, b.x + b.w - px) + 0.5, Math.min(cell, b.y + b.h - py) + 0.5);
    }
  }
  text(s, x, y, color, align = 'left') { const { ctx } = this; ctx.font = '12px IBM Plex Sans, sans-serif'; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(s, this.px(x), this.py(y)); }
}

export const clear = (c, col) => { c.ctx.fillStyle = col.surface; c.ctx.fillRect(0, 0, c.W, c.H); };
export const fmt = (v, d = 3) => (Math.abs(v) >= 1000 || (Math.abs(v) < 0.001 && v !== 0) ? v.toExponential(1) : v.toFixed(d));
