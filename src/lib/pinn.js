// Motor mínimo para redes informadas por la física (PINN), sin dependencias.
//
// Una PINN necesita derivadas de la salida de la red respecto a sus ENTRADAS (u_x, u_xx, u_t) y, además,
// el gradiente de una pérdida construida con esas derivadas respecto a los PESOS. Las librerías lo resuelven
// con diferenciación automática de orden superior. Aquí se hace a mano para una red tanh con dos entradas (x, t):
//   1) pasada hacia delante que propaga cuatro «canales»: valor, d/dx, d2/dx2 y d/dt (modo directo o de Taylor);
//   2) pasada hacia atrás (retropropagación) a través de esos cuatro canales.
// Reglas por capa oculta, con z = W h + b, a = tanh(z), s = 1 - a^2:
//   a_x = s z_x          a_t = s z_t          a_xx = s z_xx - 2 a s z_x^2

export class PinnNet {
  constructor(sizes, rand) {
    this.sizes = sizes;
    const L = sizes.length - 1;
    this.W = []; this.b = []; this.gW = []; this.gb = []; this.mW = []; this.vW = []; this.mb = []; this.vb = [];
    this.step_ = 0;
    for (let l = 1; l <= L; l++) {
      const nin = sizes[l - 1], nout = sizes[l], std = Math.sqrt(1 / nin);
      const W = new Float64Array(nin * nout);
      for (let i = 0; i < W.length; i++) W[i] = std * rand.normal();
      this.W.push(W); this.b.push(new Float64Array(nout));
      for (const k of ['gW', 'mW', 'vW']) this[k].push(new Float64Array(nin * nout));
      for (const k of ['gb', 'mb', 'vb']) this[k].push(new Float64Array(nout));
    }
    const mk = () => sizes.map((n) => new Float64Array(n));
    // activaciones por canal y derivadas de z guardadas para la pasada hacia atrás
    this.h = mk(); this.hx = mk(); this.hxx = mk(); this.ht = mk();
    this.zx = mk(); this.zxx = mk(); this.zt = mk();
    this.g = mk(); this.gx = mk(); this.gxx = mk(); this.gt = mk();
    this.o = { u: 0, ux: 0, uxx: 0, ut: 0 };
  }

  // Evalúa la red y sus derivadas en un punto. Devuelve this.o = { u, ux, uxx, ut }.
  forward(x, t = 0) {
    const { sizes, W, b, h, hx, hxx, ht, zx, zxx, zt } = this, L = sizes.length - 1;
    h[0][0] = x; h[0][1] = t; hx[0][0] = 1; hx[0][1] = 0; ht[0][0] = 0; ht[0][1] = 1; hxx[0][0] = 0; hxx[0][1] = 0;
    for (let l = 1; l <= L; l++) {
      const nin = sizes[l - 1], nout = sizes[l], Wl = W[l - 1];
      const p = h[l - 1], px = hx[l - 1], pxx = hxx[l - 1], pt = ht[l - 1];
      for (let i = 0; i < nout; i++) {
        let z = b[l - 1][i], dzx = 0, dzxx = 0, dzt = 0;
        for (let j = 0, o = i * nin; j < nin; j++) {
          const w = Wl[o + j];
          z += w * p[j]; dzx += w * px[j]; dzxx += w * pxx[j]; dzt += w * pt[j];
        }
        zx[l][i] = dzx; zxx[l][i] = dzxx; zt[l][i] = dzt;
        if (l < L) {
          const a = Math.tanh(z), s = 1 - a * a;
          h[l][i] = a; hx[l][i] = s * dzx; ht[l][i] = s * dzt; hxx[l][i] = s * dzxx - 2 * a * s * dzx * dzx;
        } else {
          h[l][i] = z; hx[l][i] = dzx; ht[l][i] = dzt; hxx[l][i] = dzxx;
        }
      }
    }
    const o = this.o;
    o.u = h[L][0]; o.ux = hx[L][0]; o.uxx = hxx[L][0]; o.ut = ht[L][0];
    return o;
  }

  // Acumula el gradiente de una pérdida respecto a los pesos, dados sus «adjuntos» respecto a las cuatro salidas
  // (dL/du, dL/du_x, dL/du_xx, dL/du_t) del último forward().
  backward(gu, gux, guxx, gut) {
    const { sizes, W, h, hx, hxx, ht, zx, zxx, zt, g, gx, gxx, gt } = this, L = sizes.length - 1;
    g[L][0] = gu; gx[L][0] = gux; gxx[L][0] = guxx; gt[L][0] = gut;
    for (let l = L; l >= 1; l--) {
      const nin = sizes[l - 1], nout = sizes[l], Wl = W[l - 1], gW = this.gW[l - 1], gb = this.gb[l - 1];
      const p = h[l - 1], px = hx[l - 1], pxx = hxx[l - 1], pt = ht[l - 1];
      const q = g[l - 1], qx = gx[l - 1], qxx = gxx[l - 1], qt = gt[l - 1];
      q.fill(0); qx.fill(0); qxx.fill(0); qt.fill(0);
      for (let i = 0; i < nout; i++) {
        let dz = g[l][i], dzx = gx[l][i], dzxx = gxx[l][i], dzt = gt[l][i];
        if (l < L) {
          // de los adjuntos de (a, a_x, a_xx, a_t) a los de (z, z_x, z_xx, z_t)
          const a = h[l][i], s = 1 - a * a, vx = zx[l][i], vxx = zxx[l][i], vt = zt[l][i];
          const ga = dz, gax = dzx, gaxx = dzxx, gat = dzt;
          dz = ga * s + gax * (-2 * a * s * vx) + gat * (-2 * a * s * vt) + gaxx * (-2 * a * s * vxx - 2 * s * (1 - 3 * a * a) * vx * vx);
          dzx = gax * s + gaxx * (-4 * a * s * vx);
          dzxx = gaxx * s;
          dzt = gat * s;
        }
        gb[i] += dz;
        for (let j = 0, o = i * nin; j < nin; j++) {
          gW[o + j] += dz * p[j] + dzx * px[j] + dzxx * pxx[j] + dzt * pt[j];
          const w = Wl[o + j];
          q[j] += w * dz; qx[j] += w * dzx; qxx[j] += w * dzxx; qt[j] += w * dzt;
        }
      }
    }
  }

  // Paso de Adam con los gradientes acumulados.
  adam(lr) {
    const b1 = 0.9, b2 = 0.999, eps = 1e-8;
    this.step_++;
    const c1 = 1 - b1 ** this.step_, c2 = 1 - b2 ** this.step_;
    const upd = (p, gr, m, v) => {
      for (let i = 0; i < p.length; i++) {
        const gi = gr[i];
        m[i] = b1 * m[i] + (1 - b1) * gi;
        v[i] = b2 * v[i] + (1 - b2) * gi * gi;
        p[i] -= lr * (m[i] / c1) / (Math.sqrt(v[i] / c2) + eps);
        gr[i] = 0;
      }
    };
    for (let l = 0; l < this.W.length; l++) { upd(this.W[l], this.gW[l], this.mW[l], this.vW[l]); upd(this.b[l], this.gb[l], this.mb[l], this.vb[l]); }
  }
}

// Parámetro escalar entrenable (para problemas inversos), con su propio Adam.
export class Scalar {
  constructor(v) { this.v = v; this.g = 0; this.m = 0; this.s = 0; this.k = 0; }
  adam(lr) {
    this.k++;
    this.m = 0.9 * this.m + 0.1 * this.g; this.s = 0.999 * this.s + 0.001 * this.g * this.g;
    this.v -= lr * (this.m / (1 - 0.9 ** this.k)) / (Math.sqrt(this.s / (1 - 0.999 ** this.k)) + 1e-8);
    this.g = 0;
  }
}

// Solución exacta del oscilador amortiguado  u'' + mu u' + k u = 0,  u(0) = 1, u'(0) = 0  (caso subamortiguado).
export function oscillator(t, mu, k) {
  const d = mu / 2, w0 = Math.sqrt(k), w = Math.sqrt(w0 * w0 - d * d);
  return Math.exp(-d * t) * (Math.cos(w * t) + (d / w) * Math.sin(w * t));
}
