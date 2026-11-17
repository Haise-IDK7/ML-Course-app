// Componente de preguntas. Dos modos:
//  - práctica: corrige cada pregunta al responder y muestra la explicación;
//  - examen: se responde todo, se entrega y entonces se corrige.
import { h } from './dom.js';
import { renderInline } from './md.js';

const KEYS = 'abcdefgh';

export function renderQuiz(root, questions, { exam = false, onFinish } = {}) {
  root.textContent = '';
  const state = questions.map(() => ({ picked: null, ok: null }));
  let submitted = false;
  const cards = questions.map((q, qi) => {
    const why = h('div', { class: 'why', hidden: true });
    const grade = () => {
      const st = state[qi];
      st.ok = q.num != null ? Math.abs(parseFloat(String(st.picked).replace(',', '.')) - q.num) <= (q.tol ?? 0.01) : st.picked === q.a;
      why.hidden = false;
      why.innerHTML = `<b>${st.ok ? 'Correcto.' : q.num != null ? `Respuesta: ${q.num}.` : 'No es correcto.'}</b> ${renderInline(q.e)}`;
      return st.ok;
    };
    let body;
    if (q.num != null) {
      const input = h('input', { class: 'numin', inputMode: 'decimal', placeholder: 'tu respuesta', 'aria-label': 'Respuesta numérica' });
      const check = h('button', { class: 'btn small', onclick: () => { state[qi].picked = input.value; if (!exam) { input.disabled = true; check.disabled = true; grade(); progress(); } } }, 'Comprobar');
      input.addEventListener('input', () => { state[qi].picked = input.value; });
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !exam) check.click(); });
      body = h('div', { class: 'row' }, input, exam ? null : check);
      body.lock = () => { input.disabled = true; };
    } else {
      const opts = q.o.map((text, oi) => h('button', { class: 'opt', onclick: () => {
        if (submitted || (!exam && state[qi].picked != null)) return;
        state[qi].picked = oi;
        opts.forEach((b, i) => b.classList.toggle('sel', i === oi));
        if (!exam) { reveal(); progress(); }
      } }, h('span', { class: 'k' }, KEYS[oi] + ')'), h('span', { html: renderInline(text) })));
      const reveal = () => { grade(); opts.forEach((b, i) => { b.disabled = true; b.classList.remove('sel'); if (i === q.a) b.classList.add('right'); else if (i === state[qi].picked) b.classList.add('wrong'); }); };
      body = h('div', {}, opts);
      body.lock = reveal;
    }
    const card = h('div', { class: 'q' }, h('p', { class: 'stem', html: `<span class="n">${qi + 1}.</span> ${renderInline(q.q)}` }), body, why);
    card.finish = () => { if (state[qi].ok == null) { body.lock(); if (q.num != null) grade(); } };
    return card;
  });

  const summary = h('div', { class: 'card', hidden: true });
  function finish() {
    submitted = true;
    cards.forEach((c) => c.finish());
    const score = state.filter((s) => s.ok).length;
    summary.hidden = false;
    summary.innerHTML = `<div class="score">${score} / ${questions.length}</div><p class="muted">${Math.round(100 * score / questions.length)} % de aciertos. ${score / questions.length >= 0.7 ? 'Superado.' : 'Repasa las explicaciones y vuelve a intentarlo.'}</p>`;
    onFinish?.(score, questions.length, state.map((s) => !!s.ok));
    if (exam) summary.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function progress() { if (!exam && state.every((s) => s.ok != null) && !submitted) finish(); }

  root.append(...cards);
  if (exam) root.append(h('div', { class: 'row' }, h('button', { class: 'btn primary', onclick: (e) => { e.target.disabled = true; finish(); } }, 'Entregar y corregir')));
  root.append(summary);
}
