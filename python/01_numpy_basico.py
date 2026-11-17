"""NumPy en lo esencial: arreglos, formas, vectorización y broadcasting."""
import numpy as np

# 1) Crear arreglos y mirar su forma (shape)
x = np.array([4.0, 3.0, 1.0])              # vector de 3 elementos
W = np.array([[0.5, -1.0, 2.0],
              [1.0,  0.0, 1.0]])            # matriz de 2 filas y 3 columnas
print("forma de x:", x.shape, "  forma de W:", W.shape)

# 2) Producto punto y producto matriz-vector (el operador @)
w = W[0]                                    # primera fila de W
print("w . x =", w @ x)                     # 0.5*4 - 1*3 + 2*1 = 1.0
print("W @ x =", W @ x)                     # una suma ponderada por cada fila

# 3) Operaciones elemento a elemento: sin bucles
z = W @ x
sigmoide = 1 / (1 + np.exp(-z))
print("sigmoide(W @ x) =", sigmoide.round(4))

# 4) Un lote de datos: cada fila es un ejemplo
X = np.array([[4.0, 3.0, 1.0],
              [0.0, 1.0, 2.0],
              [1.0, 1.0, 1.0],
              [2.0, 0.0, 0.5]])             # forma (4, 3): 4 ejemplos, 3 características
b = np.array([0.1, -0.2])                   # un sesgo por neurona
Z = X @ W.T + b                             # forma (4, 2). El sesgo se suma a cada fila: eso es broadcasting
print("forma de Z:", Z.shape)
print(Z)

# 5) Reducir a lo largo de un eje
print("media por columna (axis=0):", X.mean(axis=0))
print("suma por fila     (axis=1):", X.sum(axis=1))

# 6) Estandarizar: media 0 y desviación estándar 1 en cada columna
X_std = (X - X.mean(axis=0)) / X.std(axis=0)
print("medias tras estandarizar:", X_std.mean(axis=0).round(6))
print("desviaciones:           ", X_std.std(axis=0).round(6))

# 7) Números aleatorios reproducibles
rng = np.random.default_rng(seed=42)
ruido = rng.normal(loc=0.0, scale=1.0, size=5)
print("5 muestras de una normal estándar:", ruido.round(3))
