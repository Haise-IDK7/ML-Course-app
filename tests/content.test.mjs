// Integridad del contenido: todo lo que las lecciones referencian debe existir.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, writeFileSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { MODULES, LESSONS } from '../src/data/curriculum.js';
import { GLOSSARY } from '../src/data/glossary.js';
import { QUIZ } from '../src/data/quiz.js';
import { RETOS } from '../src/data/challenges.js';
import { REF } from '../src/data/resources.js';
import { FIGURES } from '../src/core/diagrams.js';
import { render, renderInline } from '../src/core/md.js';

const root = new URL('..', import.meta.url).pathname;
const src = (id) => readFileSync(join(root, 'src/content', `${id}.md`), 'utf8');
const labsIndex = readFileSync(join(root, 'src/labs/index.js'), 'utf8');
const labIds = [...labsIndex.matchAll(/\{ id: '([\w-]+)', titulo/g)].map((m) => m[1]);

test('cada lección tiene su archivo y sus referencias existen', () => {
  for (const l of LESSONS) {
    assert.ok(existsSync(join(root, 'src/content', `${l.id}.md`)), `falta ${l.id}.md`);
    const text = src(l.id);
    for (const [, id] of text.matchAll(/^@lab\(([\w-]+)\)/gm)) assert.ok(labIds.includes(id), `${l.id}: laboratorio «${id}» inexistente`);
    for (const [, f] of text.matchAll(/^@py\(([\w.]+)/gm)) assert.ok(existsSync(join(root, 'python', f)), `${l.id}: falta python/${f}`);
    for (const [, f] of text.matchAll(/^@fig\(([\w-]+)/gm)) assert.ok(FIGURES[f], `${l.id}: figura «${f}» inexistente`);
    assert.ok(/^::: resumen/m.test(text), `${l.id}: falta el resumen`);
    assert.equal((text.match(/^:::/gm) || []).length % 2, 0, `${l.id}: bloque ::: sin cerrar`);
    assert.ok(!render(text).includes('katex-error'), `${l.id}: fórmula con error`);
  }
});

test('cada laboratorio tiene archivo, lección existente y se usa en ella', () => {
  for (const [, id, lesson] of labsIndex.matchAll(/\{ id: '([\w-]+)', titulo[^}]*leccion: '([\w-]+)'/g)) {
    assert.ok(existsSync(join(root, 'src/labs', `lab-${id}.js`)), `falta lab-${id}.js`);
    assert.ok(src(lesson).includes(`@lab(${id})`), `el laboratorio ${id} no aparece en ${lesson}`);
  }
});

test('banco de preguntas bien formado', () => {
  let total = 0;
  for (const [id, qs] of Object.entries(QUIZ)) {
    assert.ok(LESSONS.some((l) => l.id === id), `preguntas para una lección inexistente: ${id}`);
    for (const q of qs) {
      total++;
      assert.ok(q.q && q.e, `${id}: pregunta sin texto o sin explicación`);
      if (q.num == null) { assert.ok(q.o.length >= 2 && q.a >= 0 && q.a < q.o.length, `${id}: índice de respuesta inválido`); assert.equal(new Set(q.o).size, q.o.length, `${id}: opciones repetidas`); }
      for (const t of [q.q, q.e, ...(q.o || [])]) assert.ok(!renderInline(t).includes('katex-error'), `${id}: fórmula con error en «${t}»`);
    }
  }
  for (const l of LESSONS) assert.ok(QUIZ[l.id]?.length >= 2, `${l.id}: menos de 2 preguntas`);
  assert.ok(total >= 150, `solo ${total} preguntas`);
});

test('glosario sin duplicados y lecturas con referencia', () => {
  const names = GLOSSARY.flatMap((g) => [g.t, ...(g.a || [])].map((s) => s.toLowerCase()));
  const dup = names.filter((n, i) => names.indexOf(n) !== i);
  assert.deepEqual(dup, [], `términos repetidos: ${dup}`);
  for (const g of GLOSSARY) assert.ok(!renderInline(g.d).includes('katex-error'), `glosario: fórmula con error en ${g.t}`);
  for (const m of MODULES) for (const [k] of m.lecturas) assert.ok(REF[k], `módulo ${m.n}: referencia «${k}» sin definir`);
});

test('retos: la solución pasa las pruebas y la plantilla no', { skip: !(() => { try { execFileSync('python3', ['-c', 'import numpy']); return true; } catch { return false; } })() }, () => {
  const dir = mkdtempSync(join(tmpdir(), 'retos-'));
  for (const r of RETOS) {
    const ok = join(dir, `${r.id}_ok.py`), bad = join(dir, `${r.id}_plantilla.py`);
    writeFileSync(ok, `${r.solucion}\n${r.tests}`); writeFileSync(bad, `${r.starter}\n${r.tests}`);
    execFileSync('python3', ['-I', ok], { stdio: 'pipe' });
    assert.throws(() => execFileSync('python3', ['-I', bad], { stdio: 'pipe' }), `reto ${r.id}: la plantilla sin completar pasa las pruebas`);
  }
});
