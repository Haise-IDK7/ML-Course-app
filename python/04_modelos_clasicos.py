"""Comparar modelos clásicos con validación cruzada y evaluar el mejor en el conjunto de prueba."""
import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier

# Datos reales incluidos en scikit-learn: 569 tumores, 30 características, 2 clases
X, y = load_breast_cancer(return_X_y=True)
print("forma de X:", X.shape, "  clases:", np.bincount(y))

# 1) Apartar el conjunto de prueba ANTES de cualquier decisión
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=0)

# 2) Candidatos. El escalado va dentro del pipeline para que se ajuste solo con
#    los datos de entrenamiento de cada partición (así se evita la fuga de datos).
modelos = {
    "regresión logística": make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)),
    "k-NN (k = 5)": make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=5)),
    "árbol de decisión": DecisionTreeClassifier(max_depth=4, random_state=0),
    "bosque aleatorio": RandomForestClassifier(n_estimators=200, random_state=0),
    "gradient boosting": GradientBoostingClassifier(random_state=0),
    "SVM (kernel RBF)": make_pipeline(StandardScaler(), SVC(probability=True, random_state=0)),
}

# 3) Comparar con validación cruzada de 5 bloques, solo sobre entrenamiento
print("\nexactitud en validación cruzada (media ± desviación):")
resultados = {}
for nombre, modelo in modelos.items():
    notas = cross_val_score(modelo, X_tr, y_tr, cv=5)
    resultados[nombre] = notas.mean()
    print(f"  {nombre:22s} {notas.mean():.3f} ± {notas.std():.3f}")

# 4) Reentrenar el mejor con todo el entrenamiento y medir UNA vez en prueba
mejor = max(resultados, key=resultados.get)
modelo = modelos[mejor].fit(X_tr, y_tr)
pred = modelo.predict(X_te)
print(f"\nmejor modelo: {mejor}")
print("matriz de confusión (filas = clase real, columnas = predicha):")
print(confusion_matrix(y_te, pred))
print(classification_report(y_te, pred, target_names=["maligno", "benigno"], digits=3))
print(f"AUC-ROC en prueba: {roc_auc_score(y_te, modelo.predict_proba(X_te)[:, 1]):.3f}")
