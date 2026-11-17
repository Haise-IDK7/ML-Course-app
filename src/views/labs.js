import { h } from '../core/dom.js';
import { LABS, mountLab } from '../labs/index.js';
import { lessonById } from '../data/curriculum.js';

export function viewLabs(page) {
  page.append(
    h('h1', { style: { fontSize: '2rem' } }, 'Laboratorios'),
    h('p', { class: 'muted', style: { maxWidth: '44rem' } }, 'Cada laboratorio es un experimento: cambia un parámetro, predice qué va a pasar y compruébalo. Todos funcionan sin conexión y aparecen también dentro de su lección, con la teoría al lado.'),
    h('div', { class: 'tiles', style: { marginTop: '1.4rem' } }, LABS.map((lab) => {
      const l = lessonById(lab.leccion);
      return h('a', { class: 'tile', href: `#/lab/${lab.id}` }, h('h3', {}, lab.titulo), h('p', {}, lab.desc), h('p', { style: { marginTop: '0.5rem' } }, h('span', { class: 'pill' }, `Módulo ${l.mod.n}: ${l.mod.titulo}`)));
    })));
}

export function viewLab(page, id) {
  const lab = LABS.find((l) => l.id === id);
  if (!lab) { page.append(h('p', {}, 'Ese laboratorio no existe. ', h('a', { href: '#/labs' }, 'Ver todos'))); return; }
  const l = lessonById(lab.leccion), root = h('div', { class: 'lab' });
  page.append(
    h('p', { class: 'crumbs' }, h('a', { href: '#/labs' }, 'Laboratorios'), ` / ${lab.titulo}`),
    h('p', { class: 'muted' }, lab.desc, ' La teoría está en la lección ', h('a', { href: `#/leccion/${l.id}` }, `«${l.titulo}»`), '.'),
    root);
  mountLab(root, id, { link: false });
}
