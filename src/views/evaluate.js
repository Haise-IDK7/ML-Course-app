import { h } from '../core/dom.js';
import { state, save, recordQuiz, touchDay } from '../core/store.js';
import { MODULES, moduleById } from '../data/curriculum.js';
import { QUIZ } from '../data/quiz.js';
import { RETOS } from '../data/challenges.js';
import { GLOSSARY } from '../data/glossary.js';
import { renderQuiz } from '../core/quiz.js';
import { render, renderInline } from '../core/md.js';
import { mountPyBox } from '../core/py.js';
import { makeRng, shuffle } from '../lib/rng.js';

const pool = (m) => m.lecciones.flatMap((l) => (QUIZ[l.id] || []).map((q) => ({ ...q, src: l })));
const pct = (v) => `${Math.round(v * 100)} %`;

// Baraja el orden de las opciones conservando cuál es la correcta.
function shuffled(q, rand) {
  if (!q.o) return q;
  const order = shuffle(q.o.map((_, i) => i), rand);
  return { ...q, o: order.map((i) => q.o[i]), a: order.indexOf(q.a) };
}

export function viewEval(page) {
  const total = MODULES.reduce((s, m) => s + pool(m).length, 0);
  const due = GLOSSARY.filter((g) => (state.cards[g.t]?.due ?? 0) <= Date.now()).length;
  page.append(
    h('h1', { style: { fontSize: '2rem' } }, 'Evaluación'),
    h('p', { class: 'muted', style: { maxWidth: '44rem' } }, `Recordar activamente es lo que consolida el aprendizaje, más que releer. Aquí tienes ${total} preguntas con explicación, ${RETOS.length} retos de código con corrección automática y tarjetas de repaso espaciado.`),
    h('div', { class: 'tiles', style: { margin: '1.2rem 0 2rem' } },
      h('a', { class: 'tile', href: '#/examen/final' }, h('h3', {}, 'Examen final'), h('p', {}, '30 preguntas de todos los módulos. Se corrige al entregar.'), state.exams.final ? h('p', {}, h('span', { class: 'pill ok' }, `Mejor nota ${pct(state.exams.final.best)}`)) : null),
      h('a', { class: 'tile', href: '#/retos' }, h('h3', {}, 'Retos de código'), h('p', {}, 'Implementa en Python las piezas clave. Se comprueban en tu navegador.'), h('p', {}, h('span', { class: 'pill' }, `${Object.keys(state.retos).length} de ${RETOS.length} resueltos`))),
      h('a', { class: 'tile', href: '#/tarjetas' }, h('h3', {}, 'Tarjetas de repaso'), h('p', {}, 'Los términos del glosario con repetición espaciada.'), h('p', {}, h('span', { class: 'pill amber' }, `${due} pendientes hoy`)))),
    h('h2', { class: 'section-title' }, 'Exámenes por módulo'),
    h('ul', { class: 'list card' }, MODULES.filter((m) => pool(m).length).map((m) => {
      const r = state.exams[m.id];
      return h('li', {}, h('div', { class: 'grow' }, h('b', {}, `Módulo ${m.n}: ${m.titulo}`), h('div', { class: 'muted', style: { fontSize: '0.86rem' } }, `${Math.min(12, pool(m).length)} preguntas`)),
        r ? h('span', { class: `pill${r.best >= 0.7 ? ' ok' : ' amber'}` }, `Mejor nota ${pct(r.best)}`) : h('span', { class: 'pill' }, 'Sin intentar'),
        h('a', { class: 'btn small', href: `#/examen/${m.id}` }, r ? 'Repetir' : 'Empezar'));
    })));
}

export function viewExam(page, id) {
  page.classList.add('narrow');
  const rand = makeRng(Date.now() % 1e9), m = moduleById(id);
  let qs, title;
  if (id === 'final') {
    title = 'Examen final';
    // muestreo por módulo para que todos los temas aparezcan
    qs = MODULES.flatMap((mod) => shuffle(pool(mod), rand).slice(0, 3));
    qs = shuffle(qs, rand).slice(0, 30);
  } else if (m) { title = `Examen del módulo ${m.n}: ${m.titulo}`; qs = shuffle(pool(m), rand).slice(0, 12); }
  else { page.append(h('p', {}, 'Ese examen no existe. ', h('a', { href: '#/evaluacion' }, 'Volver a Evaluación'))); return; }
  qs = qs.map((q) => shuffled(q, rand));
  const box = h('div', { class: 'quiz' }), after = h('div', { class: 'row', style: { marginTop: '1rem' } });
  page.append(h('p', { class: 'crumbs' }, h('a', { href: '#/evaluacion' }, 'Evaluación'), ` / ${title}`), h('h1', { style: { fontSize: '1.7rem', marginBottom: '0.4rem' } }, title),
    h('p', { class: 'muted' }, `${qs.length} preguntas. Responde todas y pulsa «Entregar y corregir». Se aprueba con 70 %. Las preguntas y el orden cambian en cada intento.`), box, after);
  renderQuiz(box, qs, { exam: true, onFinish: (score, total, oks) => {
    recordQuiz('exams', id, score, total);
    const weak = [...new Map(qs.filter((_, i) => !oks[i]).map((q) => [q.src.id, q.src])).values()];
    after.append(h('a', { class: 'btn', href: '#/evaluacion' }, 'Volver a Evaluación'), h('button', { class: 'btn', onclick: () => { page.textContent = ''; viewExam(page, id); window.scrollTo(0, 0); } }, 'Nuevo intento'));
    if (weak.length) after.after(h('p', { class: 'muted', style: { marginTop: '1rem' } }, 'Lecciones para repasar: ', weak.slice(0, 6).flatMap((l, i) => [i ? ', ' : '', h('a', { href: `#/leccion/${l.id}` }, l.titulo)])));
  } });
}

export function viewRetos(page) {
  page.classList.add('narrow');
  page.append(h('p', { class: 'crumbs' }, h('a', { href: '#/evaluacion' }, 'Evaluación'), ' / Retos de código'), h('h1', { style: { fontSize: '1.7rem' } }, 'Retos de código'),
    h('p', { class: 'muted' }, 'Completa cada función y pulsa «Comprobar». El código se ejecuta en tu navegador con Python real (Pyodide); la primera vez descarga el intérprete, así que necesitas conexión. Usa solo NumPy.'));
  for (const r of RETOS) {
    const box = h('div', { class: 'code pybox' }), badge = h('span', { class: `pill${state.retos[r.id] ? ' ok' : ''}` }, state.retos[r.id] ? 'Resuelto' : 'Pendiente');
    page.append(h('h2', { class: 'section-title', style: { fontSize: '1.15rem' } }, r.titulo, ' ', badge), h('div', { class: 'prose', html: render(r.enunciado) }), box);
    mountPyBox(box, { code: r.starter, tests: r.tests, onResult: (ok) => { if (ok) { state.retos[r.id] = Date.now(); touchDay(); save(); badge.textContent = 'Resuelto'; badge.className = 'pill ok'; } } });
    const sol = h('details', { style: { margin: '0.6rem 0 0' } }, h('summary', { class: 'muted', style: { cursor: 'pointer', fontSize: '0.9rem' } }, 'Ver una solución (inténtalo antes)'), h('div', { class: 'prose', html: render('```python\n' + r.solucion + '\n```') }));
    page.append(sol);
  }
}

// Repaso espaciado tipo Leitner: cada acierto sube la tarjeta de caja y alarga el intervalo.
const DAYS = [0, 1, 3, 7, 16, 35];
export function viewCards(page) {
  page.classList.add('narrow');
  const now = Date.now();
  const dueOld = GLOSSARY.filter((g) => state.cards[g.t] && state.cards[g.t].due <= now);
  const fresh = GLOSSARY.filter((g) => !state.cards[g.t]).slice(0, Math.max(0, 15 - dueOld.length));
  const queue = shuffle([...dueOld, ...fresh], makeRng(now % 1e9));
  const learned = GLOSSARY.filter((g) => (state.cards[g.t]?.box ?? 0) >= 3).length;
  const stage = h('div');
  page.append(h('p', { class: 'crumbs' }, h('a', { href: '#/evaluacion' }, 'Evaluación'), ' / Tarjetas de repaso'), h('h1', { style: { fontSize: '1.7rem' } }, 'Tarjetas de repaso'),
    h('p', { class: 'muted' }, `Intenta definir el término con tus palabras antes de girar la tarjeta. Las que aciertas vuelven cada vez más tarde (1, 3, 7, 16 y 35 días); las que fallas, enseguida. Dominas ${learned} de ${GLOSSARY.length} términos.`), stage);
  let i = 0, shown = false, hits = 0;
  function paint() {
    stage.textContent = '';
    if (i >= queue.length) { stage.append(h('div', { class: 'card' }, h('p', {}, queue.length ? `Sesión terminada: ${hits} de ${queue.length} a la primera. Vuelve mañana para el siguiente repaso.` : 'No tienes tarjetas pendientes hoy. Vuelve mañana.'), h('a', { class: 'btn', href: '#/evaluacion' }, 'Volver a Evaluación'))); return; }
    const g = queue[i];
    const face = h('div', { class: 'card flash', tabIndex: 0, role: 'button', onclick: flip, onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } } },
      shown ? h('div', { html: `<small>${g.t}${g.en ? ` (${g.en})` : ''}</small>${renderInline(g.d)}` }) : h('div', { html: `<small>¿Qué significa?</small><b>${g.t}</b>` }));
    stage.append(h('p', { class: 'muted' }, `Tarjeta ${i + 1} de ${queue.length}`), face,
      h('div', { class: 'row', style: { marginTop: '0.8rem' } }, shown ? [h('button', { class: 'btn', onclick: () => answer(false) }, 'No la sabía'), h('button', { class: 'btn primary', onclick: () => answer(true) }, 'La sabía')] : h('button', { class: 'btn primary', onclick: flip }, 'Girar la tarjeta')));
  }
  function flip() { shown = !shown; paint(); }
  function answer(ok) {
    const g = queue[i], prev = state.cards[g.t]?.box ?? 0, box = ok ? Math.min(5, prev + 1) : 0;
    state.cards[g.t] = { box, due: Date.now() + DAYS[box] * 864e5 };
    if (ok) hits++; else queue.push(g); // las falladas reaparecen al final de la sesión
    touchDay(); save(); i++; shown = false; paint();
  }
  paint();
}
