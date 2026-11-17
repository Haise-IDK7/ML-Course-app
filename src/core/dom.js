// Utilidades mínimas de DOM compartidas por vistas y laboratorios.
export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k in el && k !== 'list') { try { el[k] = v; } catch { el.setAttribute(k, v); } }
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue;
    el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return el;
}

const PATHS = {
  home: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  lab: 'M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M7.5 15h9',
  check: 'M4 12l5 5L20 6',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21V5M8 7h7M8 11h7',
  abc: 'M4 18l4-12 4 12M5.5 14h5M15 9h3a2 2 0 0 1 0 4h-3zM15 13h3.5a2.2 2.2 0 0 1 0 5H15z',
  chart: 'M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5',
  sun: 'M12 4V2M12 22v-2M4 12H2M22 12h-2M6 6L4.5 4.5M19.5 19.5L18 18M6 18l-1.5 1.5M19.5 4.5L18 6M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z',
  moon: 'M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z',
  menu: 'M4 6h16M4 12h16M4 18h16',
  play: 'M7 4l13 8-13 8z',
  code: 'M8 7l-5 5 5 5M16 7l5 5-5 5M13 5l-2 14',
  cards: 'M3 7h13v11H3zM7 4h13v11'
};
export function icon(name) {
  const fill = name === 'play' ? 'currentColor' : 'none';
  return `<svg viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${PATHS[name]}"/></svg>`;
}

export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Normaliza texto para búsquedas: minúsculas y sin tildes.
export const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
