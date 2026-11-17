// Da vida al HTML de una lección: laboratorios, videos, código ejecutable, figuras y términos del glosario.
import { h, icon } from './dom.js';
import { renderInline } from './md.js';
import { mountPyBox } from './py.js';
import { FIGURES } from './diagrams.js';
import { mountLab } from '../labs/index.js';
import { GLOSSARY } from '../data/glossary.js';

function videos(root) {
  for (const el of root.querySelectorAll('.video[data-video]')) {
    const { video: id, title, by } = el.dataset;
    const url = `https://www.youtube.com/watch?v=${id}`;
    const thumb = h('img', { src: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, alt: '', loading: 'lazy' });
    thumb.addEventListener('error', () => thumb.remove()); // sin conexión: queda el recuadro con el título
    const frame = h('div', { class: 'frame' }, thumb, h('div', { class: 'ttl' }, title),
      h('button', { class: 'play', 'aria-label': `Reproducir: ${title}`, html: icon('play'), onclick: () => {
        frame.textContent = '';
        frame.append(h('iframe', { src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`, title, allow: 'accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen', referrerPolicy: 'strict-origin-when-cross-origin' }));
      } }));
    el.append(frame, h('p', { class: 'cap' }, `Video de ${by} (en inglés; activa los subtítulos traducidos en YouTube). `, h('a', { href: url, target: '_blank', rel: 'noopener' }, 'Abrir en YouTube')));
  }
}

function copyButtons(root) {
  for (const el of root.querySelectorAll('.code:not(.pybox)')) {
    el.append(h('button', { class: 'btn small copy', onclick: (e) => { navigator.clipboard?.writeText(el.querySelector('code').textContent); e.target.textContent = 'Copiado'; setTimeout(() => (e.target.textContent = 'Copiar'), 1200); } }, 'Copiar'));
  }
}

// ---- Glosario: subraya la primera aparición de cada término y muestra su definición al pasar el cursor ----
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const terms = new Map();
for (const g of GLOSSARY) for (const name of [g.t, ...(g.a || [])]) terms.set(name.toLowerCase(), g);
const termRe = new RegExp(`(?<![\\p{L}\\p{N}_-])(${[...terms.keys()].sort((a, b) => b.length - a.length).map(escRe).join('|')})(?![\\p{L}\\p{N}_-])`, 'giu');
const SKIP = 'code, pre, a, h1, h2, h3, h4, .katex, .lab, .pybox, .note-title, .gl, figure, .video, button, .quiz';

let tip = null;
function showTip(el) {
  hideTip();
  const g = terms.get(el.dataset.term);
  tip = h('div', { class: 'tip', role: 'tooltip', html: `<b>${g.t}${g.en ? ` <span style="font-weight:400;opacity:.75">(${g.en})</span>` : ''}</b>${renderInline(g.d)}` });
  document.body.append(tip);
  const r = el.getBoundingClientRect(), w = tip.offsetWidth, hh = tip.offsetHeight;
  const left = Math.max(8, Math.min(window.innerWidth - w - 8, r.left));
  const top = r.top - hh - 8 > 0 ? r.top - hh - 8 : r.bottom + 8;
  tip.style.left = `${left + window.scrollX}px`; tip.style.top = `${top + window.scrollY}px`;
}
function hideTip() { tip?.remove(); tip = null; }
document.addEventListener('scroll', hideTip, true);

function glossary(root) {
  const seen = new Set();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  for (let node of nodes) {
    termRe.lastIndex = 0;
    let m;
    while ((m = termRe.exec(node.data))) {
      const key = m[1].toLowerCase(), g = terms.get(key);
      if (seen.has(g)) continue;
      seen.add(g);
      const rest = node.splitText(m.index), after = rest.splitText(m[1].length);
      const span = h('span', { class: 'gl', tabIndex: 0 }, rest.data); span.dataset.term = key;
      span.addEventListener('mouseenter', () => showTip(span)); span.addEventListener('mouseleave', hideTip);
      span.addEventListener('focus', () => showTip(span)); span.addEventListener('blur', hideTip);
      span.addEventListener('click', () => (tip ? hideTip() : showTip(span)));
      rest.replaceWith(span);
      node = after; termRe.lastIndex = 0;
    }
  }
}

export function hydrate(root, { gloss = true } = {}) {
  for (const el of root.querySelectorAll('.lab[data-lab]')) mountLab(el, el.dataset.lab);
  for (const el of root.querySelectorAll('figure.fig[data-fig]')) el.insertAdjacentHTML('afterbegin', FIGURES[el.dataset.fig]?.() ?? `<p>Figura «${el.dataset.fig}» no encontrada.</p>`);
  for (const el of root.querySelectorAll('.pybox')) mountPyBox(el);
  videos(root); copyButtons(root);
  if (gloss) glossary(root);
}
export { hideTip };
