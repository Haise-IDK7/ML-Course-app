// Cliente del worker de Python y componente «caja de código» (editor + salida).
import { h, esc } from './dom.js';

const files = import.meta.glob('../../python/*.py', { query: '?raw', import: 'default', eager: true });
export const pyFile = (name) => files[`../../python/${name}`];
export const pyFiles = () => Object.keys(files).map((k) => k.split('/').pop()).sort();

let worker = null;
let seq = 0;
const jobs = new Map();

function getWorker() {
  if (worker) return worker;
  worker = new Worker(new URL('./pyworker.js', import.meta.url));
  worker.onmessage = (e) => jobs.get(e.data.id)?.(e.data);
  worker.onerror = (e) => { for (const fn of jobs.values()) fn({ type: 'error', text: `No se pudo iniciar Python: ${e.message || 'error del worker'}. Revisa tu conexión a internet.` }); };
  return worker;
}

// Ejecuta código y entrega eventos {type: status|out|done|error}. Devuelve una función para cancelar.
export function runPython(code, onEvent, tests) {
  const id = ++seq;
  jobs.set(id, (msg) => { onEvent(msg); if (msg.type === 'done' || msg.type === 'error') jobs.delete(id); });
  getWorker().postMessage({ id, code, tests });
  return () => {
    if (!jobs.has(id)) return;
    worker.terminate(); worker = null; jobs.clear();
    onEvent({ type: 'error', text: 'Ejecución detenida.' });
  };
}

export function download(name, text) {
  const a = h('a', { href: URL.createObjectURL(new Blob([text], { type: 'text/x-python' })), download: name });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// Convierte un <div class="pybox"> en editor ejecutable. opts.tests: código de comprobación (retos).
export function mountPyBox(box, opts = {}) {
  const file = box.dataset.file;
  const source = opts.code ?? (file ? pyFile(file) : box.textContent) ?? `# No se encontró ${file}`;
  const norun = box.dataset.norun === '1';
  box.textContent = '';
  const area = h('textarea', { spellcheck: false, value: source.replace(/\n$/, ''), 'aria-label': 'Código Python editable' });
  area.rows = Math.min(28, Math.max(4, source.split('\n').length));
  const out = h('div', { class: 'out', 'aria-live': 'polite' });
  const status = h('span');
  let cancel = null;

  const run = h('button', { class: 'btn small', onclick: () => {
    if (cancel) { cancel(); return; }
    out.textContent = '';
    run.textContent = 'Detener';
    cancel = runPython(area.value, (msg) => {
      if (msg.type === 'status') status.textContent = msg.text;
      else if (msg.type === 'out') out.append(msg.text);
      else {
        cancel = null; run.textContent = opts.tests ? 'Comprobar' : 'Ejecutar'; status.textContent = '';
        if (msg.type === 'error') out.append(h('span', { class: 'err', html: esc(msg.text) }));
        else {
          for (const b64 of msg.images || []) out.append(h('img', { src: `data:image/png;base64,${b64}`, alt: 'Gráfica generada por el código' }));
          if (opts.tests) out.append(h('span', { class: 'okmsg' }, '\n✔ Todas las comprobaciones pasaron.'));
          else if (!out.childNodes.length) out.append(h('span', { class: 'okmsg' }, 'Ejecutado sin salida.'));
        }
        opts.onResult?.(msg.type === 'done');
      }
    }, opts.tests);
  } }, opts.tests ? 'Comprobar' : 'Ejecutar');

  area.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') { e.preventDefault(); area.setRangeText('    ', area.selectionStart, area.selectionEnd, 'end'); }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !norun) run.click();
  });

  const bar = h('div', { class: 'bar2' },
    h('span', { class: 'name' }, file || (opts.tests ? 'tu solución' : 'python')),
    status,
    norun ? h('span', {}, 'Requiere PyTorch: ejecútalo en tu PC') : run,
    h('button', { class: 'btn small', onclick: () => { area.value = source.replace(/\n$/, ''); out.textContent = ''; } }, 'Restablecer'),
    h('button', { class: 'btn small', onclick: (e) => { navigator.clipboard?.writeText(area.value); e.target.textContent = 'Copiado'; setTimeout(() => (e.target.textContent = 'Copiar'), 1200); } }, 'Copiar'),
    file ? h('button', { class: 'btn small', onclick: () => download(file, area.value) }, 'Descargar .py') : null
  );
  box.append(bar, area, out);
  return { area, run };
}
