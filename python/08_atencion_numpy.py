"""Autoatención (scaled dot-product attention) paso a paso con NumPy."""
import numpy as np

rng = np.random.default_rng(0)
np.set_printoptions(precision=2, suppress=True)

tokens = ["el", "gato", "duerme", "porque", "está", "cansado"]
n, d = len(tokens), 8                      # 6 tokens, vectores de 8 dimensiones

X = rng.normal(size=(n, d))                # un vector (embedding) por token; en un modelo real se aprenden
# Tres proyecciones aprendidas: consulta (Q), clave (K) y valor (V)
Wq, Wk, Wv = (rng.normal(scale=d ** -0.5, size=(d, d)) for _ in range(3))
Q, K, V = X @ Wq, X @ Wk, X @ Wv


def softmax(Z):
    E = np.exp(Z - Z.max(axis=-1, keepdims=True))
    return E / E.sum(axis=-1, keepdims=True)


# 1) Puntuaciones: producto punto de cada consulta con cada clave, escalado por sqrt(d)
puntuaciones = Q @ K.T / np.sqrt(d)        # (6, 6): fila i = cuánto mira el token i a cada token j

# 2) Máscara causal (modelos tipo GPT): un token no puede mirar a los que vienen después
mascara = np.triu(np.ones((n, n), dtype=bool), k=1)
puntuaciones_causal = np.where(mascara, -np.inf, puntuaciones)

# 3) Softmax por filas: pesos de atención que suman 1
A = softmax(puntuaciones)
A_causal = softmax(puntuaciones_causal)

# 4) Salida: cada token pasa a ser un promedio ponderado de los valores
salida = A @ V                             # (6, 8)

print("pesos de atención (cada fila suma 1):")
print(A)
print("\ncon máscara causal (triangular: nada por encima de la diagonal):")
print(A_causal)
print("\nforma de la salida:", salida.shape, "-> un vector nuevo por token, ahora con contexto")
print("suma de cada fila de pesos:", A.sum(axis=1))
