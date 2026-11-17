"""No supervisado: k-means y PCA desde cero con NumPy, comprobados contra scikit-learn."""
import numpy as np
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from sklearn.datasets import load_digits
from sklearn.decomposition import PCA

rng = np.random.default_rng(0)


def kmeans(X, k, iteraciones=100):
    """k-means: alterna asignar puntos y mover centroides hasta que nada cambia."""
    centroides = X[rng.choice(len(X), size=k, replace=False)]
    for _ in range(iteraciones):
        dist = ((X[:, None, :] - centroides[None, :, :]) ** 2).sum(axis=2)   # (n, k)
        asig = dist.argmin(axis=1)
        nuevos = np.array([X[asig == j].mean(axis=0) if np.any(asig == j) else centroides[j] for j in range(k)])
        if np.allclose(nuevos, centroides):
            break
        centroides = nuevos
    inercia = ((X - centroides[asig]) ** 2).sum()
    return asig, centroides, inercia


def pca(X, n_componentes):
    """PCA: centrar, calcular la covarianza y quedarse con sus vectores propios principales."""
    Xc = X - X.mean(axis=0)
    cov = Xc.T @ Xc / (len(X) - 1)
    valores, vectores = np.linalg.eigh(cov)            # eigh: para matrices simétricas
    orden = np.argsort(valores)[::-1]                   # de mayor a menor varianza
    valores, vectores = valores[orden], vectores[:, orden]
    Z = Xc @ vectores[:, :n_componentes]                # proyección
    return Z, valores / valores.sum()


# Dígitos escritos a mano: 1797 imágenes de 8x8 = 64 características
X, y = load_digits(return_X_y=True)
print("forma de X:", X.shape)

# --- PCA: de 64 dimensiones a 2 ---
Z, var = pca(X, 2)
print(f"varianza explicada por las 2 primeras componentes: {var[:2].sum():.1%}")
print(f"componentes necesarias para explicar el 90 %: {np.searchsorted(np.cumsum(var), 0.90) + 1}")
ref = PCA(n_components=2).fit(X)
print("coincide con scikit-learn:", np.allclose(var[:2], ref.explained_variance_ratio_, atol=1e-6))

# --- k-means sobre los datos originales ---
asig, _, inercia = min((kmeans(X, 10) for _ in range(5)), key=lambda r: r[2])   # 5 reinicios, nos quedamos con el mejor
print(f"\nk-means propio (mejor de 5 reinicios): inercia = {inercia:,.0f}")
print(f"k-means de scikit-learn:               inercia = {KMeans(10, n_init=5, random_state=0).fit(X).inertia_:,.0f}")

# ¿Los grupos encontrados SIN etiquetas se corresponden con los dígitos reales?
pureza = sum(np.bincount(y[asig == j]).max() for j in range(10) if np.any(asig == j)) / len(y)
print(f"pureza de los grupos respecto a los dígitos reales: {pureza:.1%}")

fig, ax = plt.subplots(1, 2, figsize=(9.5, 4))
ax[0].scatter(Z[:, 0], Z[:, 1], c=y, cmap="tab10", s=6)
ax[0].set(title="PCA, coloreado por el dígito real", xlabel="componente 1", ylabel="componente 2")
ax[1].scatter(Z[:, 0], Z[:, 1], c=asig, cmap="tab10", s=6)
ax[1].set(title="Mismos puntos, coloreados por grupo de k-means", xlabel="componente 1")
plt.tight_layout()
plt.show()
