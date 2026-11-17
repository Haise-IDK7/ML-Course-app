"""Una red neuronal completa (perceptrón multicapa) escrita solo con NumPy: forward, backward y entrenamiento."""
import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split

rng = np.random.default_rng(0)

# ---------- datos: dígitos 8x8, 10 clases ----------
X, y = load_digits(return_X_y=True)
X = X / 16.0
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)
Y_tr = np.eye(10)[y_tr]                                   # codificación one-hot

# ---------- arquitectura: 64 -> 32 (ReLU) -> 10 (softmax) ----------
n_ent, n_oc, n_sal = 64, 32, 10
W1 = rng.normal(0, np.sqrt(2 / n_ent), size=(n_ent, n_oc))    # inicialización de He (adecuada para ReLU)
b1 = np.zeros(n_oc)
W2 = rng.normal(0, np.sqrt(2 / n_oc), size=(n_oc, n_sal))
b2 = np.zeros(n_sal)


def forward(X):
    Z1 = X @ W1 + b1                 # (n, 32) sumas ponderadas de la capa oculta
    A1 = np.maximum(0, Z1)           # ReLU
    Z2 = A1 @ W2 + b2                # (n, 10) logits
    E = np.exp(Z2 - Z2.max(axis=1, keepdims=True))
    P = E / E.sum(axis=1, keepdims=True)                   # softmax: probabilidades por clase
    return Z1, A1, P


lr, lote, epocas = 0.1, 32, 30
historia = []
for epoca in range(epocas):
    orden = rng.permutation(len(X_tr))
    for i in range(0, len(orden), lote):
        idx = orden[i:i + lote]
        Xb, Yb = X_tr[idx], Y_tr[idx]
        n = len(idx)

        # ---- pasada hacia delante ----
        Z1, A1, P = forward(Xb)

        # ---- pasada hacia atrás (regla de la cadena, de la salida a la entrada) ----
        dZ2 = (P - Yb) / n               # softmax + entropía cruzada: gradiente = predicción - objetivo
        dW2 = A1.T @ dZ2                 # (32, 10)
        db2 = dZ2.sum(axis=0)
        dA1 = dZ2 @ W2.T                 # el error se reparte hacia atrás por los mismos pesos
        dZ1 = dA1 * (Z1 > 0)             # derivada de ReLU: 1 si z > 0, 0 si no
        dW1 = Xb.T @ dZ1                 # (64, 32)
        db1 = dZ1.sum(axis=0)

        # ---- actualización: descenso de gradiente estocástico ----
        W1 -= lr * dW1; b1 -= lr * db1
        W2 -= lr * dW2; b2 -= lr * db2

    P_tr = forward(X_tr)[2]
    perdida = -np.mean(np.log(P_tr[np.arange(len(y_tr)), y_tr] + 1e-12))
    ex_te = np.mean(forward(X_te)[2].argmax(axis=1) == y_te)
    historia.append((perdida, ex_te))
    if epoca % 5 == 0 or epoca == epocas - 1:
        print(f"época {epoca + 1:2d}  pérdida = {perdida:.4f}  exactitud en prueba = {ex_te:.3f}")

print(f"\nparámetros totales: {W1.size + b1.size + W2.size + b2.size}")

h = np.array(historia)
fig, ax = plt.subplots(1, 2, figsize=(9, 3.2))
ax[0].plot(h[:, 0]); ax[0].set(title="Pérdida de entrenamiento", xlabel="época")
ax[1].plot(h[:, 1]); ax[1].set(title="Exactitud en prueba", xlabel="época")
plt.tight_layout()
plt.show()
