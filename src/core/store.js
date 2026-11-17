// Estado del estudiante: se guarda en localStorage (por dispositivo y navegador).
const KEY = 'mlc:v1';
const blank = () => ({ done: {}, quiz: {}, exams: {}, cards: {}, notes: {}, retos: {}, days: {}, theme: null, last: null });

function load() {
  try { return { ...blank(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
  catch { return blank(); }
}

export const state = load();
const subs = new Set();
export const onChange = (fn) => { subs.add(fn); return () => subs.delete(fn); };

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* almacenamiento lleno o bloqueado */ }
  subs.forEach((fn) => fn(state));
}

const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function touchDay() {
  const k = dayKey();
  if (!state.days[k]) { state.days[k] = 1; save(); }
}

// Días consecutivos de estudio contando hoy (o hasta ayer si hoy aún no hay actividad).
export function streak() {
  let n = 0;
  const d = new Date();
  if (!state.days[dayKey(d)]) d.setDate(d.getDate() - 1);
  while (state.days[dayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

export function setDone(id, v = true) {
  if (v) state.done[id] = Date.now(); else delete state.done[id];
  touchDay(); save();
}

export function recordQuiz(bucket, id, score, total) {
  const prev = state[bucket][id];
  const pct = total ? score / total : 0;
  state[bucket][id] = { best: Math.max(prev?.best ?? 0, pct), last: pct, n: (prev?.n ?? 0) + 1, at: Date.now() };
  touchDay(); save();
}

export function exportData() { return JSON.stringify(state, null, 2); }

export function importData(text) {
  const data = JSON.parse(text);
  if (typeof data !== 'object' || !data || !('done' in data)) throw new Error('El archivo no es una copia de progreso de este curso.');
  Object.assign(state, blank(), data);
  save();
}

export function resetAll() {
  const theme = state.theme;
  Object.assign(state, blank(), { theme });
  save();
}
