// Conjuntos de datos sintéticos en 2D, con coordenadas aproximadamente en [-1, 1].
// Cada función devuelve { X: [[x1, x2], ...], y: [0 | 1 | ..., ...] }.

export function moons(n, noise, rand) {
  const X = [], y = [];
  for (let i = 0; i < n; i++) {
    const c = i % 2, a = Math.PI * rand();
    const px = c ? 0.5 - Math.cos(a) * 0.55 + 0.02 : Math.cos(a) * 0.55 - 0.3;
    const py = c ? -Math.sin(a) * 0.55 + 0.28 : Math.sin(a) * 0.55 - 0.12;
    X.push([px - 0.1 + noise * rand.normal(), py - 0.08 + noise * rand.normal()]);
    y.push(c);
  }
  return { X, y };
}

export function circles(n, noise, rand) {
  const X = [], y = [];
  for (let i = 0; i < n; i++) {
    const c = i % 2, r = c ? 0.3 : 0.75, a = 2 * Math.PI * rand();
    X.push([r * Math.cos(a) + noise * rand.normal(), r * Math.sin(a) + noise * rand.normal()]);
    y.push(c);
  }
  return { X, y };
}

export function blobs(n, noise, rand, centers = [[-0.45, -0.4], [0.45, 0.4]]) {
  const X = [], y = [];
  for (let i = 0; i < n; i++) {
    const c = i % centers.length;
    X.push([centers[c][0] + (0.12 + noise) * rand.normal(), centers[c][1] + (0.12 + noise) * rand.normal()]);
    y.push(c);
  }
  return { X, y };
}

export function xor(n, noise, rand) {
  const X = [], y = [];
  for (let i = 0; i < n; i++) {
    const a = (rand() * 0.8 + 0.1) * (rand() < 0.5 ? -1 : 1);
    const b = (rand() * 0.8 + 0.1) * (rand() < 0.5 ? -1 : 1);
    X.push([a + noise * rand.normal(), b + noise * rand.normal()]);
    y.push(a * b > 0 ? 1 : 0);
  }
  return { X, y };
}

export function spiral(n, noise, rand) {
  const X = [], y = [];
  for (let i = 0; i < n; i++) {
    const c = i % 2, t = Math.sqrt(rand()) * 3.2 * Math.PI, r = t / (3.2 * Math.PI) * 0.9;
    const a = t + c * Math.PI;
    X.push([r * Math.cos(a) + noise * rand.normal(), r * Math.sin(a) + noise * rand.normal()]);
    y.push(c);
  }
  return { X, y };
}

export const DATASETS = { lunas: moons, círculos: circles, grupos: blobs, xor, espiral: spiral };
