// Genera una guía en PDF por módulo (public/pdf/modulo-NN.pdf) a partir de las mismas lecciones Markdown de la app.
// Uso: npm run pdf      Requiere Google Chrome o Chromium (variable CHROME_PATH para indicar otra ruta).
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { MODULES } from '../src/data/curriculum.js';
import { QUIZ } from '../src/data/quiz.js';
import { REF } from '../src/data/resources.js';
import { FIGURES } from '../src/core/diagrams.js';
import { render, renderInline } from '../src/core/md.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const chrome = process.env.CHROME_PATH || ['google-chrome', 'chromium', 'chromium-browser'].find((c) => { try { execFileSync(c, ['--version'], { stdio: 'ignore' }); return true; } catch { return false; } });
if (!chrome) { console.error('No se encontró Chrome ni Chromium. Indica su ruta con CHROME_PATH.'); process.exit(1); }

const labs = Object.fromEntries([...readFileSync(join(root, 'src/labs/index.js'), 'utf8').matchAll(/\{ id: '([\w-]+)', titulo: '([^']+)'/g)].map((m) => [m[1], m[2]]));
const css = (p) => `<link rel="stylesheet" href="${pathToFileURL(join(root, 'node_modules', p))}">`;
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

// Sustituye los elementos interactivos por su equivalente imprimible.
function printable(html) {
  return html
    .replace(/<div class="lab" data-lab="([\w-]+)"><\/div>/g, (_, id) => `<div class="note idea"><p class="note-title">Laboratorio interactivo: ${labs[id] || id}</p><p>Este experimento solo funciona dentro de la app (sección Laboratorios). Hazlo antes de seguir leyendo.</p></div>`)
    .replace(/<div class="video" data-video="([\w-]+)" data-title="([^"]*)" data-by="([^"]*)"><\/div>/g, (_, id, t, by) => `<p class="ref">Video recomendado: <b>${t}</b>, de ${by}. https://www.youtube.com/watch?v=${id}</p>`)
    .replace(/<div class="code pybox" data-file="([\w.]+)"(?: data-norun="1")?><\/div>/g, (_, f) => `<p class="ref">Archivo <code>python/${f}</code></p>` + render('```python\n' + readFileSync(join(root, 'python', f), 'utf8') + '\n```'))
    .replace(/<figure class="fig" data-fig="([\w-]+)">/g, (_, name) => `<figure class="fig">${FIGURES[name]()}`);
}

function moduleHtml(m) {
  const today = new Date().toLocaleDateString('es', { year: 'numeric', month: 'long' });
  let body = `<header class="cover"><p class="kicker">Curso ML: redes neuronales, deep learning, CNN y PINN</p><h1>Módulo ${m.n}. ${m.titulo}</h1><p class="lead">${m.desc}</p><p class="meta">Guía de estudio. Edición de ${today}. ${m.lecciones.length} lecciones, ${m.lecciones.reduce((s, l) => s + l.min, 0)} minutos de lectura.</p><ol class="toc">${m.lecciones.map((l) => `<li>${l.titulo}</li>`).join('')}</ol></header>`;
  m.lecciones.forEach((l, i) => {
    body += `<section class="lesson"><h1>${m.n}.${i + 1} ${l.titulo}</h1>${printable(render(readFileSync(join(root, 'src/content', `${l.id}.md`), 'utf8')))}</section>`;
  });
  const qs = m.lecciones.flatMap((l) => QUIZ[l.id] || []);
  if (qs.length) {
    body += '<section class="lesson"><h1>Preguntas de repaso</h1><p>Respóndelas sin mirar el texto. Las soluciones están al final.</p><ol class="quiz">';
    body += qs.map((q) => `<li>${renderInline(q.q)}${q.o ? `<ol type="a">${q.o.map((o) => `<li>${renderInline(o)}</li>`).join('')}</ol>` : ''}</li>`).join('');
    body += '</ol><h2>Soluciones</h2><ol class="quiz">';
    body += qs.map((q) => `<li><b>${q.o ? 'abcdefgh'[q.a] + ')' : q.num}</b> ${renderInline(q.e)}</li>`).join('');
    body += '</ol></section>';
  }
  if (m.lecturas.length) body += `<section><h2>Lecturas recomendadas</h2><ul>${m.lecturas.map(([k, ch]) => `<li><b>${esc(REF[k].t)}</b>, ${esc(REF[k].by)} (${esc(ch)}). ${REF[k].url}</li>`).join('')}</ul></section>`;
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Módulo ${m.n}. ${m.titulo}</title>
${css('katex/dist/katex.min.css')}${css('@fontsource/ibm-plex-sans/latin-400.css')}${css('@fontsource/ibm-plex-sans/latin-600.css')}${css('@fontsource/ibm-plex-sans/latin-700.css')}${css('@fontsource/ibm-plex-mono/latin-400.css')}${css('@fontsource-variable/source-serif-4/wght.css')}${css('@fontsource-variable/source-serif-4/wght-italic.css')}
<style>${readFileSync(join(root, 'scripts/pdf.css'), 'utf8')}</style></head><body>${body}</body></html>`;
}

const tmp = mkdtempSync(join(tmpdir(), 'curso-pdf-'));
const out = join(root, 'public/pdf');
mkdirSync(out, { recursive: true });
for (const m of MODULES.filter((x) => x.n > 0)) {
  const name = `modulo-${String(m.n).padStart(2, '0')}`;
  const html = join(tmp, `${name}.html`);
  writeFileSync(html, moduleHtml(m));
  execFileSync(chrome, ['--headless=new', '--no-sandbox', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${join(out, name + '.pdf')}`, '--virtual-time-budget=4000', pathToFileURL(html).href], { stdio: 'ignore' });
  console.log(`${name}.pdf`);
}
