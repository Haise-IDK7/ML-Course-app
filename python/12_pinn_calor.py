"""PINN para una EDP: ecuación del calor en 1D, con condiciones «blandas» (en la pérdida) y «duras» (en la arquitectura).

Ecuación:   u_t = alfa u_xx,   x, t en [0, 1]
Inicial:    u(x, 0) = sin(pi x)
Frontera:   u(0, t) = u(1, t) = 0
Exacta:     u(x, t) = exp(-alfa pi^2 t) sin(pi x)
"""
import math
import torch
from torch import nn
import matplotlib.pyplot as plt

torch.manual_seed(0)
ALFA = 0.1


def exacta(x, t):
    return torch.exp(-ALFA * math.pi ** 2 * t) * torch.sin(math.pi * x)


class Red(nn.Module):
    def __init__(self, duras=False):
        super().__init__()
        self.duras = duras
        self.mlp = nn.Sequential(nn.Linear(2, 32), nn.Tanh(), nn.Linear(32, 32), nn.Tanh(), nn.Linear(32, 1))

    def forward(self, x, t):
        n = self.mlp(torch.cat([x, t], dim=1))
        if self.duras:
            # Condiciones duras: esta fórmula cumple EXACTAMENTE la condición inicial (t = 0)
            # y las de frontera (x = 0 y x = 1), valga lo que valga la red n(x, t).
            return torch.sin(math.pi * x) + t * x * (1 - x) * n
        return n


def derivada(y, x):
    return torch.autograd.grad(y, x, torch.ones_like(y), create_graph=True)[0]


def residuo_edp(red, x, t):
    u = red(x, t)
    u_t = derivada(u, t)
    u_x = derivada(u, x)
    u_xx = derivada(u_x, x)
    return u_t - ALFA * u_xx


def entrenar(duras, pasos=3000, n_col=256, n_borde=64, peso_cond=10.0):
    red = Red(duras)
    opt = torch.optim.Adam(red.parameters(), lr=3e-3)
    plan = torch.optim.lr_scheduler.ExponentialLR(opt, gamma=0.999)
    for paso in range(pasos):
        # puntos de colocación nuevos en cada paso: muestreo aleatorio del interior del dominio
        x = torch.rand(n_col, 1, requires_grad=True)
        t = torch.rand(n_col, 1, requires_grad=True)
        perdida = torch.mean(residuo_edp(red, x, t) ** 2)
        if not duras:
            s = torch.rand(n_borde, 1)
            cero, uno = torch.zeros_like(s), torch.ones_like(s)
            inicial = torch.mean((red(s, cero) - torch.sin(math.pi * s)) ** 2)
            frontera = torch.mean(red(cero, s) ** 2) + torch.mean(red(uno, s) ** 2)
            perdida = perdida + peso_cond * (inicial + frontera)
        opt.zero_grad()
        perdida.backward()
        opt.step()
        plan.step()
    return red


g = torch.linspace(0, 1, 101)
Xg, Tg = torch.meshgrid(g, g, indexing="ij")
xg, tg = Xg.reshape(-1, 1), Tg.reshape(-1, 1)
U_exacta = exacta(xg, tg).reshape(101, 101)

resultados = {}
for nombre, duras in [("condiciones blandas", False), ("condiciones duras", True)]:
    red = entrenar(duras)
    with torch.no_grad():
        U = red(xg, tg).reshape(101, 101)
    rel = (torch.linalg.norm(U - U_exacta) / torch.linalg.norm(U_exacta)).item()
    resultados[nombre] = U
    print(f"{nombre:20s} error relativo L2 = {rel:.2e}")

fig, ax = plt.subplots(1, 3, figsize=(11, 3.3))
for a, (titulo, U) in zip(ax, [("Exacta", U_exacta), *[(f"PINN, {k}", v) for k, v in resultados.items()]]):
    im = a.imshow(U.T, origin="lower", extent=[0, 1, 0, 1], aspect="auto", cmap="inferno", vmin=0, vmax=1)
    a.set(title=titulo, xlabel="x", ylabel="t")
fig.colorbar(im, ax=ax, label="u(x, t)")
plt.show()
