"""PINN para una EDO: oscilador amortiguado. Compara red normal, PINN y problema inverso.

Ecuación:  u''(t) + mu u'(t) + k u(t) = 0,   u(0) = 1,  u'(0) = 0
Es el mismo problema del laboratorio «PINN en vivo» (mu = 3, k = 144).
"""
import numpy as np
import torch
from torch import nn
import matplotlib.pyplot as plt

torch.manual_seed(0)
MU, K = 3.0, 144.0


def exacta(t):
    d, w0 = MU / 2, np.sqrt(K)
    w = np.sqrt(w0 ** 2 - d ** 2)
    return torch.exp(-d * t) * (torch.cos(w * t) + d / w * torch.sin(w * t))


def crear_red():
    # tanh y no ReLU: la ecuación necesita segundas derivadas, y la de ReLU es cero en todas partes
    return nn.Sequential(nn.Linear(1, 32), nn.Tanh(), nn.Linear(32, 32), nn.Tanh(), nn.Linear(32, 1))


def derivada(y, x):
    """dy/dx por diferenciación automática. create_graph=True permite derivar otra vez y retropropagar."""
    return torch.autograd.grad(y, x, torch.ones_like(y), create_graph=True)[0]


def residuo(red, t, mu):
    u = red(t)
    du = derivada(u, t)
    d2u = derivada(du, t)
    return (d2u + mu * du + K * u) / K          # dividir por k deja el residuo en escala ~1 (adimensionalización)


# Mediciones: solo 10, y solo en el primer 40 % del intervalo
t_datos = torch.linspace(0, 0.4, 10).view(-1, 1)
u_datos = exacta(t_datos)
# Puntos de colocación: 40 instantes en todo el intervalo, SIN medición. requires_grad porque derivamos respecto a t
t_col = torch.linspace(0, 1, 40).view(-1, 1).requires_grad_(True)
t_eval = torch.linspace(0, 1, 300).view(-1, 1)


def entrenar(usar_fisica, inverso=False, pasos=5000, peso_fisica=1.0):
    red = crear_red()
    mu = torch.nn.Parameter(torch.tensor(0.5)) if inverso else torch.tensor(MU)   # en el inverso, mu se aprende
    if inverso:                                   # 20 mediciones con ruido repartidas por todo el intervalo
        t_d = torch.linspace(0, 1, 20).view(-1, 1)
        u_d = exacta(t_d) + 0.02 * torch.randn_like(t_d)
    else:
        t_d, u_d = t_datos, u_datos
    grupos = [{"params": red.parameters(), "lr": 3e-3}] + ([{"params": [mu], "lr": 2e-2}] if inverso else [])
    opt = torch.optim.Adam(grupos)
    plan = torch.optim.lr_scheduler.ExponentialLR(opt, gamma=0.9995)
    for paso in range(pasos):
        perdida_datos = torch.mean((red(t_d) - u_d) ** 2)
        perdida_fisica = torch.mean(residuo(red, t_col, mu) ** 2) if usar_fisica else torch.tensor(0.0)
        perdida = perdida_datos + peso_fisica * perdida_fisica
        opt.zero_grad()
        perdida.backward()
        opt.step()
        plan.step()
    with torch.no_grad():
        rmse = torch.sqrt(torch.mean((red(t_eval) - exacta(t_eval)) ** 2)).item()
    return red, rmse, float(mu)


red_datos, e1, _ = entrenar(usar_fisica=False)
print(f"1) red normal (solo 10 mediciones):   RMSE en [0, 1] = {e1:.4f}")
red_pinn, e2, _ = entrenar(usar_fisica=True)
print(f"2) PINN (mediciones + ecuación):      RMSE en [0, 1] = {e2:.4f}")
red_inv, e3, mu_est = entrenar(usar_fisica=True, inverso=True)
print(f"3) problema inverso: mu estimado = {mu_est:.3f} (real: {MU}), RMSE = {e3:.4f}")

with torch.no_grad():
    fig, ax = plt.subplots(1, 2, figsize=(10, 3.6), sharey=True)
    for a, red, titulo in [(ax[0], red_datos, "Red normal: solo datos"), (ax[1], red_pinn, "PINN: datos + física")]:
        a.plot(t_eval, exacta(t_eval), "--", color="gray", label="solución exacta")
        a.plot(t_eval, red(t_eval), color="tab:blue", lw=2, label="red")
        a.scatter(t_datos, u_datos, color="tab:orange", zorder=3, label="mediciones")
        a.set(title=titulo, xlabel="t")
    ax[1].scatter(t_col.detach(), torch.full_like(t_col, -1.05).detach(), s=8, color="tab:green", label="puntos de colocación")
    ax[0].set_ylabel("u(t)")
    ax[1].legend(fontsize=8)
    plt.tight_layout()
    plt.show()
