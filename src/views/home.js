import { h } from '../core/dom.js';
import { state, streak } from '../core/store.js';
import { MODULES, LESSONS, lessonById, moduleProgress } from '../data/curriculum.js';
import { LABS } from '../labs/index.js';
import { makeCanvas, animator, onTheme, Plot, colors, mix } from '../labs/kit.js';
import { MLP } from '../lib/nn.js';
import { makeRng, shuffle } from '../lib/rng.js';
import { spiral } from '../lib/datasets.js';

// Demostración de portada: una red pequeña aprende una espiral delante del estudiante.
function liveDemo(stage, cap) {
  const c = makeCanvas(stage, 560, 400);
  const P = new Plot(c.ctx, { x: 0, y: 0, w: 560, h: 400 }, { x0: -1.4, x1: 1.4, y0: -1, y1: 1 });
  let rand, net, X, Y, epoch;
  const reset = () => { rand = makeRng(Math.floor(Math.random() * 1e6)); const d = spiral(240, 0.03, rand); X = d.X; Y = d.y.map((v) => [v]); net = new MLP([2, 12, 12, 1], { rand }); epoch = 0; };
  const draw = () => {
    const col = colors();
    P.heat((x, y) => mix(mix(col.a, col.surface, 0.5), mix(col.b, col.surface, 0.5), net.forward([x, y])[0]), 8);
    X.forEach((p, i) => P.dot(p[0], p[1], Y[i][0] ? col.b : col.a, 3.5, col.surface));
    cap.textContent = '';
    cap.append(h('span', {}, 'Una red de 205 parámetros aprendiendo a separar dos espirales, ahora mismo, en tu equipo'), h('span', {}, `época ${epoch}, exactitud ${(100 * net.accuracy(X, Y)).toFixed(0)} %`));
  };
  const run = animator(stage, () => {
    const idx = shuffle(X.map((_, i) => i), rand);
    for (let s = 0; s < idx.length; s += 24) net.trainBatch(X, Y, idx.slice(s, s + 24), 0.02);
    epoch++; draw();
    if (epoch > 700) reset();
  });
  reset(); draw(); onTheme(stage, draw);
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) run.start();
  c.cv.addEventListener('click', () => { reset(); draw(); run.start(); });
  c.cv.title = 'Haz clic para reiniciar el entrenamiento';
}

export function viewHome(page) {
  const doneCount = LESSONS.filter((l) => state.done[l.id]).length;
  const next = LESSONS.find((l) => !state.done[l.id]) || LESSONS[0];
  const last = state.last && lessonById(state.last);
  const stage = h('div', {}), cap = h('div', { class: 'cap' });
  const hours = Math.round(LESSONS.reduce((s, l) => s + l.min, 0) / 60);

  page.append(
    h('section', { class: 'hero' },
      h('div', {},
        h('h1', {}, 'Redes neuronales y machine learning, entendidos desde dentro'),
        h('p', {}, `Un curso completo en español: de la regresión lineal a las CNN y las redes informadas por la física (PINN). ${LESSONS.length} lecciones, ${LABS.length} laboratorios interactivos y código Python que puedes ejecutar aquí mismo. Cada término nuevo se define la primera vez que aparece.`),
        h('div', { class: 'row' },
          h('a', { class: 'btn primary', href: `#/leccion/${(last && !state.done[last.id] ? last : next).id}` }, doneCount ? 'Continuar donde lo dejaste' : 'Empezar el curso'),
          h('a', { class: 'btn', href: '#/labs' }, 'Ver los laboratorios')),
        h('p', { class: 'muted', style: { fontFamily: 'var(--ui)', fontSize: '0.9rem', marginTop: '1rem' } },
          doneCount ? `Llevas ${doneCount} de ${LESSONS.length} lecciones${streak() > 1 ? ` y ${streak()} días seguidos estudiando` : ''}.` : `Unas ${hours} horas de estudio. No necesitas saber nada de ML; sí algo de programación.`)),
      h('div', { class: 'stage' }, stage, cap)),

    h('h2', { class: 'section-title' }, 'Ruta de aprendizaje'),
    h('ol', { class: 'route' }, MODULES.map((m) => {
      const p = moduleProgress(m, state.done), mins = m.lecciones.reduce((s, l) => s + l.min, 0);
      const target = m.lecciones.find((l) => !state.done[l.id]) || m.lecciones[0];
      return h('li', { class: p === 1 ? 'done' : p > 0 ? 'part' : '' },
        h('span', { class: 'n' }, String(m.n).padStart(2, '0')),
        h('div', {}, h('h3', {}, h('a', { href: `#/leccion/${target.id}` }, m.titulo)), h('p', {}, m.desc),
          h('p', { class: 'muted', style: { fontSize: '0.82rem' } }, `${m.lecciones.length} ${m.lecciones.length === 1 ? 'lección' : 'lecciones'}, ${mins} min`)),
        h('div', { style: { paddingTop: '0.5rem' } }, h('div', { class: 'bar', title: `${Math.round(p * 100)} % completado` }, h('i', { style: { width: `${p * 100}%` } }))));
    })),

    h('h2', { class: 'section-title' }, 'Además de las lecciones'),
    h('div', { class: 'tiles' },
      h('a', { class: 'tile', href: '#/labs' }, h('h3', {}, 'Laboratorios'), h('p', {}, 'Todos los experimentos interactivos en un solo lugar.')),
      h('a', { class: 'tile', href: '#/evaluacion' }, h('h3', {}, 'Evaluación'), h('p', {}, 'Exámenes por módulo, examen final, retos de código y tarjetas de repaso.')),
      h('a', { class: 'tile', href: '#/glosario' }, h('h3', {}, 'Glosario'), h('p', {}, 'Cada término técnico con su definición y su nombre en inglés.')),
      h('a', { class: 'tile', href: '#/biblioteca' }, h('h3', {}, 'Biblioteca'), h('p', {}, 'Guías en PDF, código Python, libros de referencia, videos y artículos.')))
  );
  liveDemo(stage, cap);
}
