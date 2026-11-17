// Perceptrón multicapa mínimo, sin dependencias, con retropropagación escrita a mano y optimizador Adam.
// Sirve a los laboratorios (red en vivo, demo de inicio) y es legible como referencia.

export const ACT = {
  tanh: { f: Math.tanh, d: (a) => 1 - a * a },
  relu: { f: (z) => (z > 0 ? z : 0), d: (a) => (a > 0 ? 1 : 0) },
  sigmoide: { f: (z) => 1 / (1 + Math.exp(-z)), d: (a) => a * (1 - a) }
};

export class MLP {
  // sizes: [entradas, ocultas..., salidas]. out: 'sigmoide' (clasificación binaria, pérdida de entropía cruzada)
  // o 'lineal' (regresión, error cuadrático).
  constructor(sizes, { act = 'tanh', out = 'sigmoide', rand = Math.random } = {}) {
    this.sizes = sizes; this.act = ACT[act]; this.out = out;
    this.W = []; this.b = []; this.gW = []; this.gb = [];
    this.mW = []; this.vW = []; this.mb = []; this.vb = [];
    this.t = 0;
    const normal = rand.normal || (() => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand()));
    for (let l = 1; l < sizes.length; l++) {
      const nin = sizes[l - 1], nout = sizes[l];
      // He para ReLU, Xavier/Glorot para tanh y sigmoide
      const std = Math.sqrt((act === 'relu' ? 2 : 1) / nin);
      const W = new Float64Array(nin * nout);
      for (let i = 0; i < W.length; i++) W[i] = std * normal();
      this.W.push(W); this.b.push(new Float64Array(nout));
      for (const k of ['gW', 'mW', 'vW']) this[k].push(new Float64Array(nin * nout));
      for (const k of ['gb', 'mb', 'vb']) this[k].push(new Float64Array(nout));
    }
    this.a = sizes.map((n) => new Float64Array(n));
    this.delta = sizes.map((n) => new Float64Array(n));
  }

  forward(x) {
    const { sizes, a, W, b } = this, L = sizes.length - 1;
    a[0].set(x);
    for (let l = 1; l <= L; l++) {
      const nin = sizes[l - 1], nout = sizes[l], Wl = W[l - 1], prev = a[l - 1], cur = a[l];
      for (let i = 0; i < nout; i++) {
        let z = b[l - 1][i];
        for (let j = 0, o = i * nin; j < nin; j++) z += Wl[o + j] * prev[j];
        cur[i] = l < L ? this.act.f(z) : (this.out === 'sigmoide' ? 1 / (1 + Math.exp(-z)) : z);
      }
    }
    return a[L];
  }

  // Acumula gradientes para un ejemplo (x, y) y devuelve su pérdida.
  // En ambos casos (sigmoide + entropía cruzada, lineal + error cuadrático) dL/dz de la salida es (predicción - objetivo).
  backward(y) {
    const { sizes, a, W, delta } = this, L = sizes.length - 1;
    let loss = 0;
    for (let i = 0; i < sizes[L]; i++) {
      const p = a[L][i], yi = y[i];
      delta[L][i] = p - yi;
      loss += this.out === 'sigmoide'
        ? -(yi * Math.log(p + 1e-12) + (1 - yi) * Math.log(1 - p + 1e-12))
        : 0.5 * (p - yi) ** 2;
    }
    for (let l = L; l >= 1; l--) {
      const nin = sizes[l - 1], nout = sizes[l], Wl = W[l - 1], gW = this.gW[l - 1], gb = this.gb[l - 1];
      const prev = a[l - 1], dl = delta[l], dprev = delta[l - 1];
      if (l > 1) dprev.fill(0);
      for (let i = 0; i < nout; i++) {
        const d = dl[i];
        gb[i] += d;
        for (let j = 0, o = i * nin; j < nin; j++) {
          gW[o + j] += d * prev[j];
          if (l > 1) dprev[j] += Wl[o + j] * d;
        }
      }
      if (l > 1) for (let j = 0; j < nin; j++) dprev[j] *= this.act.d(prev[j]);
    }
    return loss;
  }

  // Un paso de Adam con los gradientes acumulados de n ejemplos. l2: regularización (decaimiento de pesos).
  step(lr, n = 1, l2 = 0) {
    const b1 = 0.9, b2 = 0.999, eps = 1e-8;
    this.t++;
    const c1 = 1 - b1 ** this.t, c2 = 1 - b2 ** this.t;
    const upd = (p, g, m, v, decay) => {
      for (let i = 0; i < p.length; i++) {
        const gi = g[i] / n + decay * p[i];
        m[i] = b1 * m[i] + (1 - b1) * gi;
        v[i] = b2 * v[i] + (1 - b2) * gi * gi;
        p[i] -= lr * (m[i] / c1) / (Math.sqrt(v[i] / c2) + eps);
        g[i] = 0;
      }
    };
    for (let l = 0; l < this.W.length; l++) {
      upd(this.W[l], this.gW[l], this.mW[l], this.vW[l], l2);
      upd(this.b[l], this.gb[l], this.mb[l], this.vb[l], 0);
    }
  }

  // Entrena con un lote de índices; devuelve la pérdida media del lote.
  trainBatch(X, Y, idx, lr, l2 = 0) {
    let loss = 0;
    for (const i of idx) { this.forward(X[i]); loss += this.backward(Y[i]); }
    this.step(lr, idx.length, l2);
    return loss / idx.length;
  }

  loss(X, Y) {
    let s = 0;
    for (let i = 0; i < X.length; i++) {
      const p = this.forward(X[i])[0], y = Y[i][0];
      s += this.out === 'sigmoide' ? -(y * Math.log(p + 1e-12) + (1 - y) * Math.log(1 - p + 1e-12)) : 0.5 * (p - y) ** 2;
    }
    return s / X.length;
  }

  accuracy(X, Y) {
    let ok = 0;
    for (let i = 0; i < X.length; i++) ok += (this.forward(X[i])[0] > 0.5 ? 1 : 0) === Y[i][0] ? 1 : 0;
    return ok / X.length;
  }

  get nParams() { return this.W.reduce((s, w, l) => s + w.length + this.b[l].length, 0); }
}
