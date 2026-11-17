import './styles.css';
import { h, icon } from './core/dom.js';
import { state, save, onChange } from './core/store.js';
import { MODULES, moduleProgress } from './data/curriculum.js';
import { search } from './core/content.js';
import { hideTip } from './core/hydrate.js';
import { viewHome } from './views/home.js';
import { viewLesson } from './views/lesson.js';
import { viewLabs, viewLab } from './views/labs.js';
import { viewEval, viewExam, viewRetos, viewCards } from './views/evaluate.js';
import { viewGlossary, viewLibrary, viewProgress } from './views/reference.js';

const ROUTES = [
  [/^\/?$/, viewHome, 'inicio'],
  [/^\/leccion\/([\w-]+)$/, viewLesson, 'curso'],
  [/^\/labs$/, viewLabs, 'labs'],
  [/^\/lab\/([\w-]+)$/, viewLab, 'labs'],
  [/^\/evaluacion$/, viewEval, 'eval'],
  [/^\/examen\/([\w-]+)$/, viewExam, 'eval'],
  [/^\/retos$/, viewRetos, 'eval'],
  [/^\/tarjetas$/, viewCards, 'eval'],
  [/^\/glosario(?:\/(.+))?$/, viewGlossary, 'glosario'],
  [/^\/biblioteca$/, viewLibrary, 'biblio'],
  [/^\/progreso$/, viewProgress, 'progreso']
];
const NAV = [['inicio', '#/', 'Inicio', 'home'], ['labs', '#/labs', 'Laboratorios', 'lab'], ['eval', '#/evaluacion', 'Evaluación', 'check'], ['glosario', '#/glosario', 'Glosario', 'abc'], ['biblio', '#/biblioteca', 'Biblioteca', 'book'], ['progreso', '#/progreso', 'Progreso', 'chart']];

const app = document.getElementById('app');
const side = h('aside', { class: 'side', 'aria-label': 'Navegación del curso' });
const page = h('main', { class: 'page', id: 'contenido', tabIndex: -1 });
const themeBtn = h('button', { class: 'iconbtn', 'aria-label': 'Cambiar entre tema claro y oscuro', onclick: toggleTheme });
app.append(h('div', { class: 'shell' }, side, h('div', { class: 'main' },
  h('div', { class: 'top' },
    h('button', { class: 'iconbtn menubtn', 'aria-label': 'Abrir el menú', html: icon('menu'), onclick: () => side.classList.toggle('open') }),
    h('button', { class: 'searchbtn', onclick: openSearch, html: `${icon('search')}<span>Buscar en el curso</span><kbd>Ctrl K</kbd>` }),
    h('span', { class: 'grow' }), themeBtn),
  page)));

function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next; state.theme = next; save();
  paintTheme(); window.dispatchEvent(new Event('themechange'));
}
function paintTheme() { themeBtn.innerHTML = icon(document.documentElement.dataset.theme === 'dark' ? 'sun' : 'moon'); }

function renderSide(active, lessonId) {
  side.textContent = '';
  side.append(
    h('a', { class: 'brand', href: '#/' }, h('img', { src: './icon.svg', alt: '' }), 'Curso ML'),
    h('nav', { class: 'nav', 'aria-label': 'Secciones' }, NAV.map(([key, href, label, ic]) => h('a', { href, 'aria-current': key === active ? 'page' : null, html: `${icon(ic)}<span>${label}</span>` }))),
    h('h2', {}, 'Ruta de aprendizaje'),
    ...MODULES.map((m) => {
      const p = moduleProgress(m, state.done), open = m.lecciones.some((l) => l.id === lessonId);
      return h('details', { class: `mod${p === 1 ? ' done' : p > 0 ? ' part' : ''}`, open },
        h('summary', {}, h('span', { class: 'num' }, m.n), h('span', {}, m.titulo), h('span', { class: 'pct' }, p > 0 ? `${Math.round(p * 100)} %` : '')),
        h('ul', {}, m.lecciones.map((l) => h('li', {}, h('a', { href: `#/leccion/${l.id}`, 'aria-current': l.id === lessonId ? 'page' : null }, h('span', { class: `tick${state.done[l.id] ? ' on' : ''}` }), h('span', {}, l.titulo))))));
    }));
}

let current = { key: 'inicio', lesson: null };
function route() {
  hideTip();
  const path = decodeURIComponent(location.hash.replace(/^#/, '')) || '/';
  const match = ROUTES.map(([re, view, key]) => [path.match(re), view, key]).find(([m]) => m) || [[''], viewHome, 'inicio'];
  const [m, view, key] = match;
  current = { key, lesson: view === viewLesson ? m[1] : null };
  renderSide(key, current.lesson);
  side.classList.remove('open');
  page.textContent = ''; page.className = 'page';
  try { view(page, ...m.slice(1)); }
  catch (err) { console.error(err); page.append(h('p', {}, `No se pudo mostrar esta página: ${err.message}`)); }
  if (!path.startsWith('/glosario/')) window.scrollTo(0, 0);
  side.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'nearest' });
}
onChange(() => renderSide(current.key, current.lesson));

// ---- Buscador (Ctrl+K) ----
function openSearch() {
  if (document.querySelector('.overlay')) return;
  const input = h('input', { type: 'search', placeholder: 'Busca un concepto, una lección o un laboratorio', 'aria-label': 'Buscar en el curso' });
  const list = h('ul');
  const overlay = h('div', { class: 'overlay', onclick: (e) => { if (e.target === overlay) close(); } }, h('div', { class: 'palette', role: 'dialog', 'aria-label': 'Buscador' }, input, list));
  let act = 0, results = [];
  const close = () => overlay.remove();
  const paint = () => {
    list.textContent = '';
    if (!results.length) { list.append(h('li', { class: 'empty' }, input.value.trim().length > 1 ? 'Sin resultados. Prueba con otra palabra o revisa el glosario.' : 'Escribe al menos dos letras.')); return; }
    results.forEach((r, i) => list.append(h('li', {}, h('a', { href: r.href, class: i === act ? 'act' : '', onclick: close }, `${r.title} `, h('span', { class: 'pill' }, r.kind), h('small', {}, r.sub)))));
  };
  input.addEventListener('input', () => { results = search(input.value); act = 0; paint(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowDown') { act = Math.min(results.length - 1, act + 1); paint(); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { act = Math.max(0, act - 1); paint(); e.preventDefault(); }
    else if (e.key === 'Enter' && results[act]) { location.hash = results[act].href; close(); }
  });
  document.body.append(overlay); paint(); input.focus();
}
window.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); } });

window.addEventListener('hashchange', route);
paintTheme();
route();
