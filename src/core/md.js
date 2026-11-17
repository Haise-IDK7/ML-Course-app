// Markdown -> HTML. Módulo puro (sin DOM) para poder usarlo también al generar los PDF con Node.
import MarkdownIt from 'markdown-it';
import container from 'markdown-it-container';
import katexPluginMod from '@vscode/markdown-it-katex';
import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import bash from 'highlight.js/lib/languages/bash';

hljs.registerLanguage('python', python);
hljs.registerLanguage('bash', bash);
const katexPlugin = katexPluginMod.default ?? katexPluginMod;

export const NOTES = { def: 'Definición', idea: 'Intuición', ojo: 'Cuidado', ejemplo: 'Ejemplo', reciente: 'Estado del arte', resumen: 'Resumen' };

const escHtml = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const md = new MarkdownIt({ html: true, linkify: false, typographer: false });
md.use(katexPlugin, { throwOnError: false, strict: false });

for (const [type, label] of Object.entries(NOTES)) {
  md.use(container, type, {
    render(tokens, idx) {
      if (tokens[idx].nesting !== 1) return '</div>\n';
      const title = tokens[idx].info.trim().slice(type.length).trim();
      return `<div class="note ${type}"><p class="note-title">${md.renderInline(title ? `${label}: ${title}` : label)}</p>\n`;
    }
  });
}

md.renderer.rules.fence = (tokens, idx) => {
  const t = tokens[idx];
  const [lang, ...flags] = t.info.trim().split(/\s+/);
  if (lang === 'python' && flags.includes('run')) {
    return `<div class="code pybox" data-inline="1"><pre><code>${escHtml(t.content)}</code></pre></div>\n`;
  }
  const body = hljs.getLanguage(lang) ? hljs.highlight(t.content, { language: lang }).value : escHtml(t.content);
  return `<div class="code"><pre><code class="hljs">${body}</code></pre></div>\n`;
};

const linkOpen = md.renderer.rules.link_open || ((tokens, idx, opts, env, self) => self.renderToken(tokens, idx, opts));
md.renderer.rules.link_open = (tokens, idx, opts, env, self) => {
  if (/^https?:/.test(tokens[idx].attrGet('href') || '')) {
    tokens[idx].attrSet('target', '_blank');
    tokens[idx].attrSet('rel', 'noopener');
  }
  return linkOpen(tokens, idx, opts, env, self);
};

// Directivas propias, una por línea: @lab(id)  @video(id | título | autor)  @py(archivo.py | norun)  @fig(id | pie)
function directives(src) {
  return src.replace(/^@(lab|video|py|fig)\(([^)]*)\)\s*$/gm, (_, kind, args) => {
    const p = args.split('|').map((s) => s.trim());
    let html;
    if (kind === 'lab') html = `<div class="lab" data-lab="${p[0]}"></div>`;
    else if (kind === 'video') html = `<div class="video" data-video="${p[0]}" data-title="${escHtml(p[1] || '')}" data-by="${escHtml(p[2] || '')}"></div>`;
    else if (kind === 'py') html = `<div class="code pybox" data-file="${p[0]}"${p[1] === 'norun' ? ' data-norun="1"' : ''}></div>`;
    else html = `<figure class="fig" data-fig="${p[0]}"><figcaption>${md.renderInline(p[1] || '')}</figcaption></figure>`;
    return `\n\n${html}\n\n`;
  });
}

export const render = (src) => md.render(directives(src));
export const renderInline = (src) => md.renderInline(src);

// Texto plano aproximado de una lección, para el buscador.
export const plain = (src) => src
  .replace(/```[\s\S]*?```/g, ' ')
  .replace(/^@\w+\([^)]*\)\s*$/gm, ' ')
  .replace(/\$\$[\s\S]*?\$\$/g, ' ')
  .replace(/\$[^$\n]*\$/g, ' ')
  .replace(/^:::.*$/gm, ' ')
  .replace(/[#*_`>|\[\]()]/g, ' ')
  .replace(/\s+/g, ' ');
