"""PyTorch esencial: tensores, diferenciación automática y el bucle de entrenamiento estándar."""
import torch
from torch import nn
from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split

torch.manual_seed(0)
dispositivo = "cuda" if torch.cuda.is_available() else "cpu"
print("PyTorch", torch.__version__, "en", dispositivo)

# ---------- 1) autograd: derivadas sin calcularlas a mano ----------
w = torch.tensor(1.5, requires_grad=True)
x, y = torch.tensor(2.0), torch.tensor(5.0)
L = (w * x - y) ** 2          # PyTorch va registrando el grafo de cómputo
L.backward()                  # retropropagación
print(f"dL/dw = {w.grad.item():.1f}   (a mano: 2(wx - y)x = -8)")

# ---------- 2) datos como tensores ----------
X, t = make_moons(n_samples=1000, noise=0.2, random_state=0)
X_tr, X_te, t_tr, t_te = train_test_split(X, t, test_size=0.25, random_state=0)
a_tensor = lambda a, tipo: torch.tensor(a, dtype=tipo, device=dispositivo)
X_tr, X_te = a_tensor(X_tr, torch.float32), a_tensor(X_te, torch.float32)
t_tr, t_te = a_tensor(t_tr, torch.long), a_tensor(t_te, torch.long)
datos = torch.utils.data.TensorDataset(X_tr, t_tr)
cargador = torch.utils.data.DataLoader(datos, batch_size=32, shuffle=True)   # reparte en lotes y baraja

# ---------- 3) modelo: un perceptrón multicapa ----------
modelo = nn.Sequential(
    nn.Linear(2, 32), nn.ReLU(),
    nn.Linear(32, 32), nn.ReLU(),
    nn.Linear(32, 2),                      # 2 logits; la softmax va dentro de la pérdida
).to(dispositivo)
print("parámetros:", sum(p.numel() for p in modelo.parameters()))

perdida_fn = nn.CrossEntropyLoss()         # softmax + entropía cruzada en una sola operación estable
optimizador = torch.optim.AdamW(modelo.parameters(), lr=1e-2, weight_decay=1e-4)

# ---------- 4) el bucle de entrenamiento: siempre los mismos cinco pasos ----------
for epoca in range(1, 31):
    modelo.train()
    for xb, tb in cargador:
        logits = modelo(xb)                # 1. pasada hacia delante
        perdida = perdida_fn(logits, tb)   # 2. pérdida
        optimizador.zero_grad()            # 3. borrar gradientes anteriores (si no, se acumulan)
        perdida.backward()                 # 4. retropropagación
        optimizador.step()                 # 5. actualizar los pesos
    if epoca % 10 == 0:
        modelo.eval()
        with torch.no_grad():              # al evaluar no hace falta el grafo de cómputo
            ex = (modelo(X_te).argmax(dim=1) == t_te).float().mean().item()
        print(f"época {epoca:2d}  pérdida del último lote = {perdida.item():.4f}  exactitud en prueba = {ex:.3f}")

# ---------- 5) guardar y cargar ----------
torch.save(modelo.state_dict(), "modelo_lunas.pt")
modelo.load_state_dict(torch.load("modelo_lunas.pt", weights_only=True))
print("modelo guardado en modelo_lunas.pt y vuelto a cargar")
