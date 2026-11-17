"""Semi-supervisado: qué se gana usando los datos sin etiquetar cuando hay muy pocas etiquetas."""
import numpy as np
from sklearn.datasets import load_digits
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.semi_supervised import LabelSpreading, SelfTrainingClassifier

X, y = load_digits(return_X_y=True)
X = X / 16.0                                             # píxeles a [0, 1]
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, stratify=y, random_state=0)

rng = np.random.default_rng(0)
N_ETIQUETAS = 40                                         # solo 40 de ~1250 ejemplos tienen etiqueta
con_etiqueta = rng.choice(len(y_tr), size=N_ETIQUETAS, replace=False)
y_parcial = np.full(len(y_tr), -1)                       # -1 significa «sin etiqueta» en scikit-learn
y_parcial[con_etiqueta] = y_tr[con_etiqueta]
print(f"entrenamiento: {len(y_tr)} ejemplos, {N_ETIQUETAS} etiquetados ({N_ETIQUETAS / len(y_tr):.1%})\n")


def base():
    return make_pipeline(StandardScaler(), LogisticRegression(max_iter=2000))


# 1) Línea base supervisada: ignora todo lo que no tiene etiqueta
sup = base().fit(X_tr[con_etiqueta], y_tr[con_etiqueta])
print(f"supervisado con {N_ETIQUETAS} etiquetas:           {sup.score(X_te, y_te):.3f}")

# 2) Autoentrenamiento: pseudo-etiqueta lo que predice con confianza >= 0.9 y reentrena
auto = SelfTrainingClassifier(base(), threshold=0.9).fit(X_tr, y_parcial)
n_pseudo = int((auto.transduction_ != -1).sum()) - N_ETIQUETAS
print(f"autoentrenamiento (+{n_pseudo} pseudo-etiquetas):  {auto.score(X_te, y_te):.3f}")

# 3) Propagación de etiquetas por un grafo de vecinos
prop = LabelSpreading(kernel="knn", n_neighbors=7, alpha=0.2).fit(X_tr, y_parcial)
print(f"propagación de etiquetas (grafo k-NN):     {prop.score(X_te, y_te):.3f}")

# 4) Techo: lo que se lograría si TODOS los datos estuvieran etiquetados
techo = base().fit(X_tr, y_tr)
print(f"supervisado con todas las etiquetas:       {techo.score(X_te, y_te):.3f}")

sin = y_parcial == -1
print(f"\nexactitud de las etiquetas propagadas a los datos sin etiquetar: {np.mean(prop.transduction_[sin] == y_tr[sin]):.3f}")
