"""Regresión logística desde cero con NumPy y comparación con scikit-learn."""
import numpy as np
from sklearn.datasets import make_moons
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

X, y = make_moons(n_samples=400, noise=0.25, random_state=0)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=0)


def sigmoide(z):
    return 1 / (1 + np.exp(-z))


w = np.zeros(X.shape[1])
b = 0.0
lr = 0.5

for paso in range(2000):
    p = sigmoide(X_tr @ w + b)                    # probabilidad de la clase 1
    # entropía cruzada binaria (se recorta p para no calcular log(0))
    pc = np.clip(p, 1e-12, 1 - 1e-12)
    perdida = -np.mean(y_tr * np.log(pc) + (1 - y_tr) * np.log(1 - pc))
    # con sigmoide + entropía cruzada, el gradiente respecto a z es simplemente (p - y)
    dz = (p - y_tr) / len(y_tr)
    w -= lr * (X_tr.T @ dz)
    b -= lr * dz.sum()
    if paso % 500 == 0:
        print(f"paso {paso:4d}  pérdida = {perdida:.4f}")

exactitud = np.mean((sigmoide(X_te @ w + b) > 0.5) == y_te)
print(f"\nimplementación propia: exactitud en prueba = {exactitud:.3f}")

modelo = LogisticRegression().fit(X_tr, y_tr)
print(f"scikit-learn:          exactitud en prueba = {modelo.score(X_te, y_te):.3f}")
print("\nNinguna llega al 100 %: la frontera de una regresión logística es una recta")
print("y las dos lunas no se pueden separar con una recta.")
