// Comprobaciones numéricas: los gradientes escritos a mano deben coincidir con diferencias finitas.
import test from 'node:test';
import assert from 'node:assert/strict';
import { MLP } from '../src/lib/nn.js';
import { PinnNet, oscillator } from '../src/lib/pinn.js';
import { makeRng } from '../src/lib/rng.js';
import { moons } from '../src/lib/datasets.js';

const relErr = (a, b) => Math.abs(a - b) / Math.max(1e-8, Math.abs(a) + Math.abs(b));

test('MLP: retropropagación = diferencias finitas', () => {
  for (const [act, out] of [['tanh', 'sigmoide'], ['sigmoide', 'lineal'], ['tanh', 'lineal']]) {
    const net = new MLP([2, 5, 4, 1], { act, out, rand: makeRng(3) });
    const x = [0.3, -0.7], y = [out === 'sigmoide' ? 1 : 0.4];
    const lossAt = () => { net.forward(x); const g = net.gW.map((a) => a.slice()), gb = net.gb.map((a) => a.slice()); const L = net.backward(y); net.gW.forEach((a, i) => a.set(g[i])); net.gb.forEach((a, i) => a.set(gb[i])); return L; };
    net.forward(x); net.backward(y);
    const analytic = net.gW.map((a) => a.slice());
    net.gW.forEach((a) => a.fill(0)); net.gb.forEach((a) => a.fill(0));
    for (let l = 0; l < net.W.length; l++) for (let i = 0; i < net.W[l].length; i += 3) {
      const w = net.W[l][i], e = 1e-5;
      net.W[l][i] = w + e; const lp = lossAt();
      net.W[l][i] = w - e; const lm = lossAt();
      net.W[l][i] = w;
      assert.ok(relErr((lp - lm) / (2 * e), analytic[l][i]) < 1e-5, `${act}/${out} capa ${l} peso ${i}`);
    }
  }
});

test('MLP: aprende a separar las dos lunas', () => {
  const rand = makeRng(7), { X, y } = moons(200, 0.08, rand), Y = y.map((v) => [v]);
  const net = new MLP([2, 8, 8, 1], { rand });
  const idx = X.map((_, i) => i);
  for (let ep = 0; ep < 400; ep++) net.trainBatch(X, Y, idx, 0.03);
  assert.ok(net.accuracy(X, Y) > 0.95);
});

test('PinnNet: u_x, u_xx, u_t coinciden con diferencias finitas en la entrada', () => {
  const net = new PinnNet([2, 6, 6, 1], makeRng(5));
  const x = 0.37, t = -0.2, e = 1e-4;
  const u = (a, b) => net.forward(a, b).u;
  const o = { ...net.forward(x, t) };
  assert.ok(relErr(o.ux, (u(x + e, t) - u(x - e, t)) / (2 * e)) < 1e-6);
  assert.ok(relErr(o.ut, (u(x, t + e) - u(x, t - e)) / (2 * e)) < 1e-6);
  assert.ok(relErr(o.uxx, (u(x + e, t) - 2 * u(x, t) + u(x - e, t)) / (e * e)) < 1e-4);
});

test('PinnNet: gradiente de una pérdida con derivadas = diferencias finitas en los pesos', () => {
  const net = new PinnNet([2, 5, 5, 1], makeRng(11));
  const x = 0.6, t = 0.3;
  // pérdida de prueba que mezcla todos los canales, como el residuo de una EDP
  const lossOf = (o) => 0.5 * (o.uxx + 0.7 * o.ux - 1.3 * o.ut + 2 * o.u) ** 2 + 0.3 * o.u * o.ux;
  const o = net.forward(x, t);
  const r = o.uxx + 0.7 * o.ux - 1.3 * o.ut + 2 * o.u;
  net.backward(2 * r + 0.3 * o.ux, 0.7 * r + 0.3 * o.u, r, -1.3 * r);
  for (let l = 0; l < net.W.length; l++) {
    for (let i = 0; i < net.W[l].length; i += 2) {
      const w = net.W[l][i], e = 1e-5;
      net.W[l][i] = w + e; const lp = lossOf(net.forward(x, t));
      net.W[l][i] = w - e; const lm = lossOf(net.forward(x, t));
      net.W[l][i] = w;
      assert.ok(relErr((lp - lm) / (2 * e), net.gW[l][i]) < 1e-5, `capa ${l} peso ${i}`);
    }
    for (let i = 0; i < net.b[l].length; i++) {
      const w = net.b[l][i], e = 1e-5;
      net.b[l][i] = w + e; const lp = lossOf(net.forward(x, t));
      net.b[l][i] = w - e; const lm = lossOf(net.forward(x, t));
      net.b[l][i] = w;
      assert.ok(relErr((lp - lm) / (2 * e), net.gb[l][i]) < 1e-5, `capa ${l} sesgo ${i}`);
    }
  }
});

test('oscilador: la solución exacta cumple la ecuación y las condiciones iniciales', () => {
  const mu = 3, k = 144, e = 1e-4;
  assert.ok(Math.abs(oscillator(0, mu, k) - 1) < 1e-12);
  assert.ok(Math.abs((oscillator(e, mu, k) - oscillator(-e, mu, k)) / (2 * e)) < 1e-6);
  for (const t of [0.1, 0.45, 0.9]) {
    const u = oscillator(t, mu, k);
    const du = (oscillator(t + e, mu, k) - oscillator(t - e, mu, k)) / (2 * e);
    const ddu = (oscillator(t + e, mu, k) - 2 * u + oscillator(t - e, mu, k)) / (e * e);
    assert.ok(Math.abs(ddu + mu * du + k * u) < 1e-3);
  }
});
