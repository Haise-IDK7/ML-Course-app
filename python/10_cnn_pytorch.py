"""Una CNN en PyTorch para reconocer dígitos, comparada con un perceptrón multicapa.

Usa los dígitos 8x8 incluidos en scikit-learn: no descarga nada y entrena en segundos en CPU.
Al final se indica cómo pasar a MNIST (28x28) con torchvision.
"""
import torch
from torch import nn
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split

torch.manual_seed(0)

X, y = load_digits(return_X_y=True)
X = (X / 16.0).reshape(-1, 1, 8, 8)          # forma (N, canales, alto, ancho): lo que esperan las capas Conv2d
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)
X_tr, X_te = torch.tensor(X_tr, dtype=torch.float32), torch.tensor(X_te, dtype=torch.float32)
y_tr, y_te = torch.tensor(y_tr), torch.tensor(y_te)
cargador = torch.utils.data.DataLoader(torch.utils.data.TensorDataset(X_tr, y_tr), batch_size=64, shuffle=True)


class CNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.extractor = nn.Sequential(
            nn.Conv2d(1, 16, kernel_size=3, padding=1),    # 1x8x8  -> 16x8x8  (padding 1 conserva el tamaño)
            nn.ReLU(),
            nn.MaxPool2d(2),                               # 16x8x8 -> 16x4x4
            nn.Conv2d(16, 32, kernel_size=3, padding=1),   # 16x4x4 -> 32x4x4
            nn.ReLU(),
            nn.MaxPool2d(2),                               # 32x4x4 -> 32x2x2
        )
        self.clasificador = nn.Sequential(
            nn.Flatten(),                                  # 32*2*2 = 128
            nn.Dropout(0.3),
            nn.Linear(128, 10),
        )

    def forward(self, x):
        return self.clasificador(self.extractor(x))


mlp = nn.Sequential(nn.Flatten(), nn.Linear(64, 96), nn.ReLU(), nn.Linear(96, 10))


def entrenar(modelo, epocas=25):
    opt = torch.optim.AdamW(modelo.parameters(), lr=3e-3, weight_decay=1e-4)
    perdida_fn = nn.CrossEntropyLoss()
    for _ in range(epocas):
        modelo.train()
        for xb, yb in cargador:
            opt.zero_grad()
            perdida_fn(modelo(xb), yb).backward()
            opt.step()
    modelo.eval()
    with torch.no_grad():
        return (modelo(X_te).argmax(1) == y_te).float().mean().item()


for nombre, modelo in [("perceptrón multicapa", mlp), ("CNN", CNN())]:
    n_par = sum(p.numel() for p in modelo.parameters())
    print(f"{nombre:22s} parámetros = {n_par:5d}   exactitud en prueba = {entrenar(modelo):.3f}")

# Formas intermedias: útil para depurar cualquier CNN
x = X_te[:1]
print("\nformas al atravesar la CNN:")
print("  entrada              ", tuple(x.shape))
for capa in CNN().extractor:
    x = capa(x)
    print(f"  {capa.__class__.__name__:20s}", tuple(x.shape))

# Para MNIST (28x28) basta cambiar los datos y el tamaño de la capa lineal:
#   from torchvision import datasets, transforms
#   datos = datasets.MNIST("datos", train=True, download=True, transform=transforms.ToTensor())
#   ... y nn.Linear(32 * 7 * 7, 10), porque 28 -> 14 -> 7 tras dos poolings.
