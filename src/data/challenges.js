// Retos de código. Cada reto: enunciado (Markdown), plantilla inicial, pruebas automáticas (Python) y una solución.
// Las pruebas se ejecutan después del código del estudiante, en el mismo espacio de nombres.
export const RETOS = [
  {
    id: 'sigmoide', titulo: '1. La sigmoide', enunciado: 'Implementa $\\sigma(z) = \\dfrac{1}{1+e^{-z}}$ de modo que funcione tanto con un número como con un arreglo de NumPy.',
    starter: `import numpy as np

def sigmoide(z):
    # tu código aquí
    return z
`,
    tests: `import numpy as np
assert abs(sigmoide(0.0) - 0.5) < 1e-12, "sigmoide(0) debe ser 0.5"
z = np.array([-2.0, 0.0, 3.0])
assert np.allclose(sigmoide(z), [0.11920292, 0.5, 0.95257413]), "valores incorrectos para un arreglo"
assert np.allclose(sigmoide(z) + sigmoide(-z), 1.0), "debe cumplirse sigmoide(z) + sigmoide(-z) = 1"
`,
    solucion: `import numpy as np

def sigmoide(z):
    return 1.0 / (1.0 + np.exp(-z))`
  },
  {
    id: 'gradiente-mse', titulo: '2. Gradiente de la regresión lineal', enunciado: 'Para el modelo $\\hat y = X\\mathbf{w} + b$ y la pérdida $L = \\frac{1}{n}\\sum_i (\\hat y_i - y_i)^2$, devuelve la pérdida y sus gradientes respecto a $\\mathbf{w}$ y $b$.\n\nPista: $\\partial L/\\partial \\mathbf{w} = \\frac{2}{n} X^\\top(\\hat y - y)$ y $\\partial L/\\partial b = \\frac{2}{n}\\sum_i(\\hat y_i - y_i)$.',
    starter: `import numpy as np

def perdida_y_gradientes(X, y, w, b):
    """X: (n, d), y: (n,), w: (d,), b: número. Devuelve (L, dw, db)."""
    # tu código aquí
    return 0.0, np.zeros_like(w), 0.0
`,
    tests: `import numpy as np
rng = np.random.default_rng(0)
X = rng.normal(size=(20, 3)); y = rng.normal(size=20); w = rng.normal(size=3); b = 0.3
L, dw, db = perdida_y_gradientes(X, y, w, b)
f = lambda w_, b_: np.mean((X @ w_ + b_ - y) ** 2)
assert abs(L - f(w, b)) < 1e-10, "la pérdida no coincide con el error cuadrático medio"
eps = 1e-6
num = np.array([(f(w + eps * np.eye(3)[i], b) - f(w - eps * np.eye(3)[i], b)) / (2 * eps) for i in range(3)])
assert np.allclose(dw, num, atol=1e-6), "dw no coincide con el gradiente numérico"
assert abs(db - (f(w, b + eps) - f(w, b - eps)) / (2 * eps)) < 1e-6, "db no coincide con el gradiente numérico"
`,
    solucion: `import numpy as np

def perdida_y_gradientes(X, y, w, b):
    err = X @ w + b - y
    n = len(y)
    return np.mean(err ** 2), 2 / n * X.T @ err, 2 / n * err.sum()`
  },
  {
    id: 'softmax', titulo: '3. Softmax estable', enunciado: 'Implementa softmax por filas para una matriz de puntuaciones de forma `(n, clases)`. Debe ser **numéricamente estable**: con puntuaciones como 1000 no puede devolver `nan`.\n\nPista: restar a cada fila su máximo no cambia el resultado y evita el desbordamiento de la exponencial.',
    starter: `import numpy as np

def softmax(Z):
    """Z: (n, clases). Devuelve probabilidades por fila."""
    # tu código aquí
    return Z
`,
    tests: `import numpy as np
P = softmax(np.array([[1.0, 2.0, 3.0], [0.0, 0.0, 0.0]]))
assert np.allclose(P.sum(axis=1), 1.0), "cada fila debe sumar 1"
assert np.allclose(P[0], [0.09003057, 0.24472847, 0.66524096]), "valores incorrectos"
assert np.allclose(P[1], 1 / 3), "puntuaciones iguales deben dar probabilidades iguales"
big = softmax(np.array([[1000.0, 1001.0, 1002.0]]))
assert np.all(np.isfinite(big)), "no es estable: aparecen inf o nan con puntuaciones grandes"
assert np.allclose(big[0], P[0]), "sumar una constante a todas las puntuaciones no debe cambiar el resultado"
`,
    solucion: `import numpy as np

def softmax(Z):
    E = np.exp(Z - Z.max(axis=1, keepdims=True))
    return E / E.sum(axis=1, keepdims=True)`
  },
  {
    id: 'descenso', titulo: '4. Descenso de gradiente', enunciado: 'Minimiza $f(x) = (x-3)^2 + 1$ por descenso de gradiente. Parte de `x0`, da `pasos` pasos con tasa de aprendizaje `lr` y devuelve la lista con todos los valores de $x$ (incluido el inicial).',
    starter: `def descenso(x0, lr, pasos):
    xs = [x0]
    # tu código aquí: f'(x) = 2 (x - 3)
    return xs
`,
    tests: `xs = descenso(0.0, 0.1, 50)
assert len(xs) == 51, "la lista debe tener pasos + 1 valores"
assert abs(xs[1] - 0.6) < 1e-12, "el primer paso desde x = 0 con lr = 0.1 debe llevar a 0.6"
assert abs(xs[-1] - 3.0) < 1e-3, "con lr = 0.1 debería converger a 3"
div = descenso(0.0, 1.1, 30)
assert abs(div[-1]) > 100, "con lr = 1.1 el método debe divergir (cada paso se aleja más)"
`,
    solucion: `def descenso(x0, lr, pasos):
    xs = [x0]
    for _ in range(pasos):
        x = xs[-1]
        xs.append(x - lr * 2 * (x - 3))
    return xs`
  },
  {
    id: 'neurona', titulo: '5. Retropropagación en una neurona', enunciado: 'Una neurona calcula $a = \\sigma(\\mathbf{w}\\cdot\\mathbf{x} + b)$ y la pérdida es $L = (a - y)^2$. Devuelve $\\partial L/\\partial \\mathbf{w}$ y $\\partial L/\\partial b$ aplicando la regla de la cadena.\n\nPista: $\\partial L/\\partial a = 2(a-y)$, $\\partial a/\\partial z = a(1-a)$, $\\partial z/\\partial \\mathbf{w} = \\mathbf{x}$.',
    starter: `import numpy as np

def gradientes_neurona(x, w, b, y):
    """x, w: vectores; b, y: números. Devuelve (dw, db)."""
    # tu código aquí
    return np.zeros_like(w), 0.0
`,
    tests: `import numpy as np
x = np.array([1.0, -0.5]); w = np.array([0.8, 0.4]); b = 0.1; y = 1.0
dw, db = gradientes_neurona(x, w, b, y)
L = lambda w_, b_: (1 / (1 + np.exp(-(w_ @ x + b_))) - y) ** 2
eps = 1e-6
num = np.array([(L(w + eps * np.eye(2)[i], b) - L(w - eps * np.eye(2)[i], b)) / (2 * eps) for i in range(2)])
assert np.allclose(dw, num, atol=1e-7), "dw no coincide con el gradiente numérico"
assert abs(db - (L(w, b + eps) - L(w, b - eps)) / (2 * eps)) < 1e-7, "db no coincide con el gradiente numérico"
`,
    solucion: `import numpy as np

def gradientes_neurona(x, w, b, y):
    a = 1 / (1 + np.exp(-(w @ x + b)))
    dz = 2 * (a - y) * a * (1 - a)   # dL/da * da/dz
    return dz * x, dz`
  },
  {
    id: 'kmeans', titulo: '6. Un paso de k-means', enunciado: 'Implementa una iteración de k-means: asigna cada punto al centroide más cercano y recalcula cada centroide como la media de sus puntos. Si un centroide se queda sin puntos, déjalo donde estaba.',
    starter: `import numpy as np

def paso_kmeans(X, centroides):
    """X: (n, d); centroides: (k, d). Devuelve (asignaciones (n,), nuevos_centroides (k, d))."""
    # tu código aquí
    return np.zeros(len(X), dtype=int), centroides.copy()
`,
    tests: `import numpy as np
X = np.array([[0.0, 0.0], [0.0, 1.0], [5.0, 5.0], [6.0, 5.0]])
C = np.array([[1.0, 1.0], [4.0, 4.0], [100.0, 100.0]])
asig, C2 = paso_kmeans(X, C)
assert list(asig) == [0, 0, 1, 1], "asignaciones incorrectas"
assert np.allclose(C2[0], [0.0, 0.5]) and np.allclose(C2[1], [5.5, 5.0]), "los centroides deben ser la media de sus puntos"
assert np.allclose(C2[2], [100.0, 100.0]), "un centroide sin puntos no debe moverse"
assert np.allclose(C, [[1, 1], [4, 4], [100, 100]]), "no modifiques el arreglo de entrada"
`,
    solucion: `import numpy as np

def paso_kmeans(X, centroides):
    dist = ((X[:, None, :] - centroides[None, :, :]) ** 2).sum(axis=2)
    asig = dist.argmin(axis=1)
    nuevos = centroides.copy()
    for j in range(len(centroides)):
        if np.any(asig == j):
            nuevos[j] = X[asig == j].mean(axis=0)
    return asig, nuevos`
  },
  {
    id: 'tamano-conv', titulo: '7. Tamaño de salida de una convolución', enunciado: 'Devuelve el tamaño de salida de una convolución con entrada de lado `n`, filtro de lado `k`, stride `s` y padding `p`: $\\left\\lfloor \\dfrac{n + 2p - k}{s} \\right\\rfloor + 1$.',
    starter: `def tamano_salida(n, k, s=1, p=0):
    # tu código aquí
    return n
`,
    tests: `assert tamano_salida(28, 3) == 26
assert tamano_salida(28, 3, p=1) == 28, "con padding 1 y filtro 3 el tamaño se conserva"
assert tamano_salida(32, 5, s=2, p=2) == 16
assert tamano_salida(7, 3, s=2) == 3
assert isinstance(tamano_salida(7, 3, s=2), int), "debe devolver un entero"
`,
    solucion: `def tamano_salida(n, k, s=1, p=0):
    return (n + 2 * p - k) // s + 1`
  },
  {
    id: 'conv2d', titulo: '8. Convolución 2D', enunciado: 'Implementa la operación que usan las CNN (correlación cruzada, sin voltear el filtro), sin padding y con stride 1: en cada posición, la suma de los productos elemento a elemento entre el filtro y el trozo de imagen que cubre.',
    starter: `import numpy as np

def conv2d(imagen, filtro):
    """imagen: (H, W); filtro: (k, k). Devuelve (H-k+1, W-k+1)."""
    H, W = imagen.shape
    k = filtro.shape[0]
    salida = np.zeros((H - k + 1, W - k + 1))
    # tu código aquí
    return salida
`,
    tests: `import numpy as np
img = np.arange(16, dtype=float).reshape(4, 4)
assert np.allclose(conv2d(img, np.ones((2, 2))), [[10, 14, 18], [26, 30, 34], [42, 46, 50]]), "resultado incorrecto con un filtro de unos"
borde = np.array([[0, 0, 1, 1]] * 4, dtype=float)
sobel = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], dtype=float)
assert np.allclose(conv2d(borde, sobel), [[4, 4], [4, 4]]), "el filtro de Sobel debe responder al borde vertical"
assert conv2d(np.zeros((6, 5)), np.ones((3, 3))).shape == (4, 3), "forma de salida incorrecta"
`,
    solucion: `import numpy as np

def conv2d(imagen, filtro):
    H, W = imagen.shape
    k = filtro.shape[0]
    salida = np.zeros((H - k + 1, W - k + 1))
    for i in range(H - k + 1):
        for j in range(W - k + 1):
            salida[i, j] = np.sum(imagen[i:i + k, j:j + k] * filtro)
    return salida`
  },
  {
    id: 'residuo', titulo: '9. El residuo de una PINN', enunciado: 'La ecuación de decaimiento es $u\'(t) + \\lambda u(t) = 0$. Dados los valores de una función candidata `u` en los instantes `t`, devuelve el **residuo** $r = u\' + \\lambda u$ en cada instante (aproxima $u\'$ con `np.gradient`) y la pérdida física, que es la media de $r^2$.\n\nSi `u` es la solución exacta $e^{-\\lambda t}$, la pérdida debe ser casi 0.',
    starter: `import numpy as np

def perdida_fisica(u, t, lam):
    """u, t: arreglos del mismo tamaño. Devuelve (residuo, perdida)."""
    # tu código aquí
    return np.zeros_like(u), 0.0
`,
    tests: `import numpy as np
t = np.linspace(0, 2, 2001)
r, L = perdida_fisica(np.exp(-1.5 * t), t, 1.5)
assert r.shape == t.shape, "el residuo debe tener un valor por instante"
assert L < 1e-6, "para la solución exacta la pérdida física debe ser casi 0"
r2, L2 = perdida_fisica(np.exp(-1.5 * t), t, 3.0)
assert L2 > 0.05, "si el parámetro lambda es incorrecto, la pérdida debe ser claramente mayor que 0"
r3, L3 = perdida_fisica(np.ones_like(t), t, 2.0)
assert np.allclose(r3, 2.0) and abs(L3 - 4.0) < 1e-9, "para u = 1 el residuo es lambda y la pérdida lambda al cuadrado"
`,
    solucion: `import numpy as np

def perdida_fisica(u, t, lam):
    r = np.gradient(u, t) + lam * u
    return r, np.mean(r ** 2)`
  }
];
