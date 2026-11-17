"""Regresión lineal entrenada por descenso de gradiente, comparada con la solución exacta."""
import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(0)

# Datos sintéticos: y = 3x + 2 + ruido
n = 100
x = rng.uniform(0, 2, size=n)
y = 3.0 * x + 2.0 + rng.normal(0, 0.4, size=n)

# Parámetros iniciales y tasa de aprendizaje
w, b = 0.0, 0.0
lr = 0.1
historia = []

for paso in range(200):
    y_pred = w * x + b                    # 1) pasada hacia delante
    error = y_pred - y
    perdida = np.mean(error ** 2)         # 2) pérdida: error cuadrático medio
    dw = 2 * np.mean(error * x)           # 3) gradientes (regla de la cadena)
    db = 2 * np.mean(error)
    w -= lr * dw                          # 4) paso en contra del gradiente
    b -= lr * db
    historia.append(perdida)

# Solución exacta por mínimos cuadrados, para comparar
A = np.column_stack([x, np.ones(n)])
w_ex, b_ex = np.linalg.lstsq(A, y, rcond=None)[0]

print(f"descenso de gradiente: w = {w:.3f}, b = {b:.3f}, pérdida = {historia[-1]:.4f}")
print(f"solución exacta:       w = {w_ex:.3f}, b = {b_ex:.3f}")
print("valores reales con los que se generaron los datos: w = 3, b = 2")

fig, ax = plt.subplots(1, 2, figsize=(9, 3.4))
ax[0].scatter(x, y, s=12, alpha=0.6)
xs = np.linspace(0, 2, 50)
ax[0].plot(xs, w * xs + b, color="crimson", lw=2)
ax[0].set(title="Datos y recta ajustada", xlabel="x", ylabel="y")
ax[1].plot(historia)
ax[1].set(title="Pérdida durante el entrenamiento", xlabel="paso", ylabel="ECM", yscale="log")
plt.tight_layout()
plt.show()
