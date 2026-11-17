import { h, norm } from '../core/dom.js';
import { state, streak, exportData, importData, resetAll } from '../core/store.js';
import { MODULES, LESSONS, moduleProgress } from '../data/curriculum.js';
import { GLOSSARY } from '../data/glossary.js';
import { BOOKS, REF, VIDEOS, COURSES, PAPERS, TOOLS } from '../data/resources.js';
import { QUIZ } from '../data/quiz.js';
import { renderInline } from '../core/md.js';
import { pyFiles, pyFile, download } from '../core/py.js';

export function viewGlossary(page, term) {
  page.classList.add('narrow');
  const sorted = [...GLOSSARY].sort((a, b) => a.t.localeCompare(b.t, 'es'));
  const input = h('input', { class: 'field', type: 'search', placeholder: 'Filtrar términos (en español o en inglés)', 'aria-label': 'Filtrar el glosario' });
  const list = h('dl', { class: 'gloss' });
  const paint = () => {
    const q = norm(input.value.trim());
    list.textContent = '';
    const hits = sorted.filter((g) => !q || norm([g.t, g.en, ...(g.a || [])].join(' ')).includes(q));
    for (const g of hits) list.append(h('dt', { id: `g-${g.t}` }, g.t, g.en ? h('span', {}, g.en) : null), h('dd', { html: renderInline(g.d) }));
    if (!hits.length) list.append(h('p', { class: 'muted' }, 'Ningún término coincide. Prueba el buscador general (Ctrl K).'));
  };
  input.addEventListener('input', paint);
  page.append(h('h1', { style: { fontSize: '2rem' } }, 'Glosario'),
    h('p', { class: 'muted' }, `${GLOSSARY.length} términos. Junto a cada uno va su nombre en inglés, que es el que encontrarás en la documentación y los artículos. En las lecciones, los términos subrayados con puntos muestran esta misma definición al pasar el cursor.`), input, list);
  paint();
  if (term) requestAnimationFrame(() => { const el = document.getElementById(`g-${term}`); if (el) { el.scrollIntoView({ block: 'center' }); el.style.background = 'var(--amber-soft)'; } });
}

const linkList = (items) => h('ul', { class: 'list card' }, items.map((it) => h('li', {},
  h('div', { class: 'grow' }, h('a', { href: it.url, target: '_blank', rel: 'noopener' }, h('b', {}, it.t)), it.by ? h('span', { class: 'muted' }, ` — ${it.by}`) : null, h('div', { class: 'muted', style: { fontSize: '0.88rem', marginTop: '0.15rem' } }, it.d)),
  it.tag ? h('span', { class: `pill${it.free ? ' ok' : ''}` }, it.tag) : null)));

export function viewLibrary(page) {
  page.append(
    h('h1', { style: { fontSize: '2rem' } }, 'Biblioteca'),
    h('p', { class: 'muted', style: { maxWidth: '44rem' } }, 'Material para estudiar fuera de la app y las fuentes en las que se basa el curso. Los enlaces externos se abren en tu navegador.'),

    h('h2', { class: 'section-title' }, 'Guías en PDF por módulo'),
    h('p', { class: 'muted' }, 'Cada guía reúne las lecciones completas del módulo, con fórmulas, diagramas y código, lista para imprimir o leer sin conexión.'),
    h('div', { class: 'tiles' }, MODULES.filter((m) => m.n > 0).map((m) => h('a', { class: 'tile', href: `./pdf/modulo-${String(m.n).padStart(2, '0')}.pdf`, target: '_blank' }, h('h3', {}, `Módulo ${m.n}`), h('p', {}, m.titulo)))),

    h('h2', { class: 'section-title' }, 'Código Python'),
    h('p', { class: 'muted' }, 'Los mismos programas que aparecen en las lecciones. Están probados con Python 3.13, NumPy 2, scikit-learn 1.9 y PyTorch 2.15; la carpeta python/ del repositorio incluye requirements.txt.'),
    h('ul', { class: 'list card' }, pyFiles().map((f) => h('li', {}, h('code', { class: 'grow' }, f), h('span', { class: 'muted', style: { fontSize: '0.86rem' } }, (pyFile(f).match(/^"""\s*(.+)/) || [])[1] || ''), h('button', { class: 'btn small', onclick: () => download(f, pyFile(f)) }, 'Descargar')))),

    h('h2', { class: 'section-title' }, 'Libros de referencia'),
    h('p', { class: 'muted' }, 'Los libros en los que se apoya el contenido. «Abierto» significa que el autor o la editorial lo ofrecen completo y legalmente en línea.'),
    linkList(Object.values(BOOKS)),
    h('h2', { class: 'section-title' }, 'Qué leer para cada módulo'),
    h('ul', { class: 'list card' }, MODULES.filter((m) => m.lecturas.length).map((m) => h('li', {}, h('div', { class: 'grow' }, h('b', {}, `Módulo ${m.n}: ${m.titulo}`), h('div', { class: 'muted', style: { fontSize: '0.88rem' } }, m.lecturas.flatMap(([k, ch], i) => [i ? '; ' : '', h('a', { href: REF[k]?.url, target: '_blank', rel: 'noopener' }, REF[k]?.corto || k), ` (${ch})`])))))),

    h('h2', { class: 'section-title' }, 'Videos'), linkList(VIDEOS),
    h('h2', { class: 'section-title' }, 'Cursos universitarios abiertos'), linkList(COURSES),
    h('h2', { class: 'section-title' }, 'Explicaciones interactivas de otros autores'), linkList(TOOLS),
    h('h2', { class: 'section-title' }, 'Artículos científicos clave'), linkList(Object.values(PAPERS)));
}

export function viewProgress(page) {
  const done = LESSONS.filter((l) => state.done[l.id]).length;
  const exams = Object.values(state.exams), avg = exams.length ? exams.reduce((s, e) => s + e.best, 0) / exams.length : null;
  const mins = LESSONS.filter((l) => state.done[l.id]).reduce((s, l) => s + l.min, 0);
  const file = h('input', { type: 'file', accept: '.json,application/json', hidden: true });
  const msg = h('p', { class: 'muted', 'aria-live': 'polite' });
  file.addEventListener('change', async () => { try { importData(await file.files[0].text()); location.reload(); } catch (err) { msg.textContent = `No se pudo importar: ${err.message}`; } });
  page.append(
    h('h1', { style: { fontSize: '2rem' } }, 'Progreso'),
    h('div', { class: 'stats card', style: { margin: '1rem 0 2rem' } },
      h('div', { class: 'stat' }, h('b', {}, `${done}/${LESSONS.length}`), h('span', {}, 'lecciones completadas')),
      h('div', { class: 'stat' }, h('b', {}, `${Math.floor(mins / 60)} h ${mins % 60} min`), h('span', {}, 'de contenido estudiado')),
      h('div', { class: 'stat' }, h('b', {}, streak()), h('span', {}, 'días seguidos')),
      h('div', { class: 'stat' }, h('b', {}, avg == null ? '—' : `${Math.round(avg * 100)} %`), h('span', {}, 'media de tus mejores exámenes')),
      h('div', { class: 'stat' }, h('b', {}, Object.keys(state.retos).length), h('span', {}, 'retos de código resueltos'))),
    h('h2', { class: 'section-title' }, 'Por módulo'),
    h('ul', { class: 'list card' }, MODULES.map((m) => {
      const p = moduleProgress(m, state.done), ex = state.exams[m.id];
      const quizzes = m.lecciones.map((l) => state.quiz[l.id]?.best).filter((v) => v != null);
      return h('li', {}, h('div', { class: 'grow' }, h('b', {}, `${m.n}. ${m.titulo}`), h('div', { class: 'bar', style: { marginTop: '0.4rem', maxWidth: '22rem' } }, h('i', { style: { width: `${p * 100}%` } }))),
        h('span', { class: 'pill' }, `${Math.round(p * 100)} % leído`),
        quizzes.length ? h('span', { class: 'pill' }, `autoevaluaciones ${Math.round(100 * quizzes.reduce((a, b) => a + b, 0) / quizzes.length)} %`) : null,
        m.lecciones.some((l) => QUIZ[l.id]) ? (ex ? h('span', { class: `pill${ex.best >= 0.7 ? ' ok' : ' amber'}` }, `examen ${Math.round(ex.best * 100)} %`) : h('a', { class: 'btn small', href: `#/examen/${m.id}` }, 'Hacer examen')) : null);
    })),
    h('h2', { class: 'section-title' }, 'Copia de seguridad'),
    h('p', { class: 'muted', style: { maxWidth: '44rem' } }, 'El progreso, los apuntes y las notas se guardan solo en este equipo. Exporta un archivo para llevarlos a otro equipo o por si reinstalas la app.'),
    h('div', { class: 'row' },
      h('button', { class: 'btn', onclick: () => { const a = h('a', { href: URL.createObjectURL(new Blob([exportData()], { type: 'application/json' })), download: 'progreso-curso-ml.json' }); a.click(); } }, 'Exportar progreso'),
      h('button', { class: 'btn', onclick: () => file.click() }, 'Importar progreso'), file,
      h('button', { class: 'btn', onclick: (e) => { if (e.target.dataset.sure) { resetAll(); location.reload(); } else { e.target.dataset.sure = 1; e.target.textContent = 'Pulsa otra vez para borrar todo'; } } }, 'Borrar todo el progreso')),
    msg);
}
