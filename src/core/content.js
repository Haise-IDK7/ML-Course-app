// Acceso al contenido del curso (archivos Markdown) y al índice de búsqueda.
import { MODULES, LESSONS } from '../data/curriculum.js';
import { GLOSSARY } from '../data/glossary.js';
import { LABS } from '../labs/index.js';
import { plain } from './md.js';
import { norm } from './dom.js';

const files = import.meta.glob('../content/*.md', { query: '?raw', import: 'default', eager: true });
export const lessonSource = (id) => files[`../content/${id}.md`] ?? `Esta lección todavía no tiene contenido (${id}).`;

let index = null;
function build() {
  index = [];
  for (const l of LESSONS) index.push({ kind: 'Lección', title: l.titulo, sub: `Módulo ${l.mod.n}: ${l.mod.titulo}`, href: `#/leccion/${l.id}`, text: norm(l.titulo + ' ' + plain(lessonSource(l.id))), raw: plain(lessonSource(l.id)) });
  for (const g of GLOSSARY) index.push({ kind: 'Glosario', title: g.t, sub: g.d.replace(/\$/g, ''), href: `#/glosario/${encodeURIComponent(g.t)}`, text: norm([g.t, g.en, ...(g.a || [])].join(' ')), raw: '' });
  for (const lab of LABS) index.push({ kind: 'Laboratorio', title: lab.titulo, sub: lab.desc, href: `#/lab/${lab.id}`, text: norm(lab.titulo + ' ' + lab.desc), raw: '' });
  for (const m of MODULES) index.push({ kind: 'Módulo', title: m.titulo, sub: m.desc, href: `#/leccion/${m.lecciones[0].id}`, text: norm(m.titulo + ' ' + m.desc), raw: '' });
}

export function search(query, limit = 12) {
  if (!index) build();
  const words = norm(query).split(/\s+/).filter((w) => w.length > 1);
  if (!words.length) return [];
  const out = [];
  for (const it of index) {
    const title = norm(it.title);
    let score = 0, all = true;
    for (const w of words) {
      const inTitle = title.includes(w), pos = it.text.indexOf(w);
      if (pos < 0) { all = false; break; }
      score += (inTitle ? 10 : 1) + (it.kind === 'Glosario' && inTitle ? 4 : 0);
    }
    if (!all) continue;
    let sub = it.sub;
    if (it.raw && !words.some((w) => title.includes(w))) { // fragmento del texto donde aparece la búsqueda
      const p = norm(it.raw).indexOf(words[0]);
      if (p >= 0) sub = '…' + it.raw.slice(Math.max(0, p - 50), p + 90).trim() + '…';
    }
    out.push({ ...it, sub, score });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, limit);
}
