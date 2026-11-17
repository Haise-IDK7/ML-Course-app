import { h } from '../core/dom.js';
import { state, save, setDone, recordQuiz } from '../core/store.js';
import { lessonById, neighbors } from '../data/curriculum.js';
import { lessonSource } from '../core/content.js';
import { render } from '../core/md.js';
import { hydrate } from '../core/hydrate.js';
import { renderQuiz } from '../core/quiz.js';
import { QUIZ } from '../data/quiz.js';

export function viewLesson(page, id) {
  const lesson = lessonById(id);
  if (!lesson) { page.append(h('p', {}, 'Esa lección no existe. ', h('a', { href: '#/' }, 'Volver al inicio'))); return; }
  page.classList.add('narrow');
  state.last = id; save();
  const [prev, next] = neighbors(id);
  const m = lesson.mod, pos = m.lecciones.findIndex((l) => l.id === id) + 1;

  const prose = h('article', { class: 'prose', html: render(lessonSource(id)) });
  const doneBtn = h('button', { class: 'btn', onclick: () => { setDone(id, !state.done[id]); paintDone(); } });
  const paintDone = () => { const d = !!state.done[id]; doneBtn.textContent = d ? 'Completada (clic para desmarcar)' : 'Marcar como completada'; doneBtn.classList.toggle('on', d); };
  paintDone();

  page.append(
    h('p', { class: 'crumbs' }, h('a', { href: '#/' }, 'Inicio'), ` / Módulo ${m.n}: ${m.titulo} / Lección ${pos} de ${m.lecciones.length}`),
    h('header', { class: 'lesson-head' }, h('h1', {}, lesson.titulo),
      h('div', { class: 'row meta' }, h('span', { class: 'pill' }, `${lesson.min} min`), m.n > 0 ? h('a', { class: 'pill', href: `./pdf/modulo-${String(m.n).padStart(2, '0')}.pdf`, target: '_blank' }, 'Guía del módulo en PDF') : null,
        h('button', { class: 'btn small noprint', onclick: () => window.print() }, 'Imprimir esta lección'))),
    prose);

  const qs = QUIZ[id];
  if (qs?.length) {
    const box = h('div', { class: 'quiz' });
    page.append(h('h2', { class: 'section-title' }, 'Comprueba lo que entendiste'), box);
    renderQuiz(box, qs, { onFinish: (score, total) => { recordQuiz('quiz', id, score, total); if (score / total >= 0.7 && !state.done[id]) { setDone(id); paintDone(); } } });
  }

  const notes = h('textarea', { class: 'notes', placeholder: 'Escribe aquí tus apuntes de esta lección. Se guardan solos en este equipo.', value: state.notes[id] || '', 'aria-label': 'Apuntes de la lección' });
  let timer; notes.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => { state.notes[id] = notes.value; save(); }, 500); });
  page.append(
    h('h2', { class: 'section-title noprint' }, 'Tus apuntes'), h('div', { class: 'noprint' }, notes),
    h('div', { class: 'row noprint', style: { marginTop: '1.5rem' } }, doneBtn),
    h('nav', { class: 'lesson-nav', 'aria-label': 'Lección anterior y siguiente' },
      prev ? h('a', { class: 'btn', href: `#/leccion/${prev.id}` }, `Anterior: ${prev.titulo}`) : h('span'),
      next ? h('a', { class: 'btn primary', href: `#/leccion/${next.id}` }, `Siguiente: ${next.titulo}`) : h('a', { class: 'btn primary', href: '#/evaluacion' }, 'Ir a la evaluación final')));
  hydrate(prose);
}
