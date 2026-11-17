// Banco de preguntas por lección. q(): opción múltiple (a = índice de la correcta). n(): respuesta numérica con tolerancia.
// Los textos admiten Markdown en línea y fórmulas entre $...$.
const q = (text, o, a, e) => ({ q: text, o, a, e });
const n = (text, num, tol, e) => ({ q: text, num, tol, e });

export const QUIZ = {
  'm0-l1': [
    q('Según la lección, ¿cómo conviene usar un laboratorio interactivo?', ['Mover los controles al azar hasta ver algo interesante', 'Predecir qué va a pasar antes de mover el control y luego comprobarlo', 'Leer solo el pie y saltarse el experimento', 'Usarlo únicamente después de aprobar el examen'], 1, 'Comprometerte con una predicción y contrastarla es lo que fija el concepto; equivocarse en la predicción es parte del aprendizaje.'),
    q('¿Qué estrategia de estudio consolida mejor lo aprendido?', ['Releer la lección varias veces el mismo día', 'Subrayar todo el texto', 'Recordar activamente y repartir el repaso en varios días', 'Estudiar todo el módulo de una sentada'], 2, 'Recuperación activa y repaso espaciado: por eso existen los exámenes y las tarjetas.')
  ],
  'm1-l1': [
    n('Calcula el producto punto de $\\mathbf{w} = (2, -1, 3)$ y $\\mathbf{x} = (1, 4, 2)$.', 4, 0.001, '$2\\cdot1 + (-1)\\cdot4 + 3\\cdot2 = 2 - 4 + 6 = 4$.'),
    q('Una matriz $W$ tiene forma $(4, 3)$ y se multiplica por un vector $\\mathbf{x}$ de 3 elementos. ¿Qué forma tiene $W\\mathbf{x}$?', ['Un escalar', 'Un vector de 3 elementos', 'Un vector de 4 elementos', 'Una matriz $(4, 3)$'], 2, 'Cada una de las 4 filas hace un producto punto con $\\mathbf{x}$: salen 4 números, uno por neurona.'),
    q('Una imagen en color de 32×32 píxeles se representa como…', ['un vector de 32 elementos', 'una matriz de 32×32', 'un tensor de 3 ejes: alto, ancho y 3 canales', 'un escalar'], 2, 'Tres matrices apiladas (rojo, verde y azul): un tensor de 3 ejes.'),
    q('Si dos vectores son perpendiculares, su producto punto es…', ['máximo', 'cero', 'negativo', 'igual al producto de sus normas'], 1, '$\\mathbf{a}\\cdot\\mathbf{b} = \\lVert\\mathbf{a}\\rVert\\lVert\\mathbf{b}\\rVert\\cos\\theta$ y $\\cos 90° = 0$.')
  ],
  'm1-l2': [
    q('En un punto, la derivada de la pérdida respecto a un peso es positiva. Para reducir la pérdida hay que…', ['aumentar el peso', 'disminuir el peso', 'dejarlo igual', 'cambiarle el signo'], 1, 'Derivada positiva: subir el peso sube la pérdida. Se mueve en sentido contrario.'),
    n('Sea $L = (wx - y)^2$ con $x = 3$, $y = 2$, $w = 1$. ¿Cuánto vale $\\partial L/\\partial w$?', 6, 0.001, '$u = wx - y = 1$; $dL/du = 2u = 2$; $\\partial u/\\partial w = x = 3$; producto: $6$.'),
    q('¿Qué indica el gradiente de una función?', ['El valor mínimo de la función', 'La dirección en la que la función crece más deprisa', 'La dirección en la que la función decrece más deprisa', 'El número de variables'], 1, 'Apunta cuesta arriba; para minimizar se usa su opuesto.'),
    q('Al encadenar 10 funciones cuyas derivadas valen 0.25 cada una, la derivada total es aproximadamente…', ['2.5', '0.25', '$10^{-6}$', '$10^{6}$'], 2, '$0.25^{10} \\approx 9.5\\times10^{-7}$: el origen del desvanecimiento del gradiente.')
  ],
  'm1-l3': [
    q('Un clasificador de spam estima…', ['$P(\\text{texto} \\mid \\text{spam})$', '$P(\\text{spam} \\mid \\text{texto})$', '$P(\\text{spam})$', '$P(\\text{texto})$'], 1, 'La probabilidad de la clase sabiendo los datos observados.'),
    q('Si se supone que el objetivo es la predicción más ruido gaussiano, máxima verosimilitud equivale a minimizar…', ['la entropía cruzada', 'el error absoluto', 'el error cuadrático medio', 'la exactitud'], 2, 'Ruido gaussiano → error cuadrático. Probabilidades de clase → entropía cruzada.'),
    q('En una distribución normal, aproximadamente ¿qué fracción de los valores está a menos de 2 desviaciones estándar de la media?', ['50 %', '68 %', '95 %', '99.9 %'], 2, 'El 68 % a menos de $1\\sigma$ y el 95 % a menos de $2\\sigma$.')
  ],
  'm1-l4': [
    q('En NumPy, `X @ W.T` con `X` de forma `(4, 3)` y `W` de forma `(2, 3)` devuelve un arreglo de forma…', ['`(4, 2)`', '`(2, 4)`', '`(4, 3)`', 'da error'], 0, '`W.T` es `(3, 2)`; `(4, 3) @ (3, 2)` da `(4, 2)`: 4 ejemplos por 2 neuronas.'),
    q('¿Qué hace `X.mean(axis=0)` en una matriz de datos con un ejemplo por fila?', ['La media de cada fila', 'La media de cada columna (característica)', 'La media de todos los elementos', 'Ordena las filas'], 1, '`axis=0` recorre las filas y deja una media por columna.'),
    q('¿Para qué se fija la semilla del generador aleatorio?', ['Para que el código sea más rápido', 'Para obtener siempre los mismos números aleatorios y poder reproducir un experimento', 'Para evitar el sobreajuste', 'Para usar la GPU'], 1, 'Sin semilla fija no puedes saber si una mejora viene de tu cambio o del azar.')
  ],
  'm2-l1': [
    q('¿Cuál es la relación correcta?', ['Deep learning contiene a machine learning', 'Machine learning y deep learning no se solapan', 'IA contiene a machine learning, que contiene a deep learning', 'IA es un subconjunto de deep learning'], 2, 'Cada campo es un subconjunto del anterior.'),
    q('¿Qué significa «entrenar» un modelo?', ['Escribir a mano sus reglas', 'Buscar los valores de sus parámetros que dan buenas predicciones', 'Elegir el lenguaje de programación', 'Recoger más datos'], 1, 'Un modelo es una función con parámetros; entrenar es ajustarlos.'),
    q('¿Qué añade el deep learning respecto al ML clásico?', ['No necesita datos', 'Aprende también las características, directamente de los datos en bruto', 'Siempre es mejor en datos tabulares', 'No usa parámetros'], 1, 'Las capas aprenden una jerarquía de características; en tablas, los árboles suelen seguir siendo mejores.')
  ],
  'm2-l2': [
    q('Tienes 1 000 000 de fotos sin etiquetar y 300 etiquetadas por un experto. ¿Qué paradigma describe el problema?', ['Supervisado', 'No supervisado', 'Semi-supervisado', 'Por refuerzo'], 2, 'Pocas etiquetas y muchos datos sin etiquetar.'),
    q('Predecir el precio de una vivienda a partir de sus características es…', ['clasificación', 'regresión', 'agrupamiento', 'reducción de dimensionalidad'], 1, 'La salida es un número continuo.'),
    q('En el aprendizaje auto-supervisado, las etiquetas…', ['las pone un experto', 'no existen ni se usan', 'se fabrican a partir del propio dato, por ejemplo ocultando una parte', 'son recompensas'], 2, 'Se oculta parte del dato y se predice; así se entrenan los modelos de lenguaje.'),
    q('¿De dónde procede la señal de aprendizaje en una PINN pura?', ['De etiquetas humanas', 'De cuánto incumple la red una ecuación diferencial conocida', 'De recompensas', 'De grupos de datos'], 1, 'La pérdida mide el residuo de la ecuación; no hacen falta datos etiquetados.')
  ],
  'm2-l3': [
    q('¿Para qué sirve el conjunto de validación?', ['Para ajustar los pesos', 'Para elegir hiperparámetros y comparar modelos', 'Para dar el resultado final', 'Para aumentar los datos'], 1, 'Entrenamiento: parámetros. Validación: hiperparámetros. Prueba: estimación final, una sola vez.'),
    q('Estandarizas todas las características usando la media de TODOS los datos y después divides en entrenamiento y prueba. ¿Qué has cometido?', ['Sobreajuste', 'Fuga de datos', 'Subajuste', 'Nada incorrecto'], 1, 'El conjunto de prueba ha influido en el preprocesado. Hay que dividir primero.'),
    q('La tasa de aprendizaje es…', ['un parámetro que se aprende', 'un hiperparámetro que se elige', 'una métrica', 'una etiqueta'], 1, 'Se fija antes de entrenar y se elige con validación.')
  ],
  'm2-l4': [
    q('Error de entrenamiento 2 %, error de validación 25 %. Diagnóstico:', ['Subajuste', 'Sobreajuste', 'Buen ajuste', 'Fuga de datos'], 1, 'Mucha diferencia entre ambos errores: el modelo memoriza.'),
    q('Error de entrenamiento 30 %, error de validación 31 %. ¿Qué conviene probar?', ['Más regularización', 'Un modelo más flexible o mejores características', 'Menos datos', 'Parada temprana'], 1, 'Ambos errores altos: subajuste. Hace falta más capacidad.'),
    q('Aumentar la flexibilidad del modelo, en general…', ['sube el sesgo y baja la varianza', 'baja el sesgo y sube la varianza', 'baja ambos', 'no cambia ninguno'], 1, 'Es el compromiso sesgo-varianza.'),
    q('¿Cuál de estos remedios NO reduce el sobreajuste?', ['Conseguir más datos', 'Añadir regularización', 'Aumentar el grado del polinomio', 'Usar un modelo más simple'], 2, 'Más grado es más flexibilidad: empeora el sobreajuste.')
  ],
  'm3-l1': [
    n('Con $w = 2$, $\\partial L/\\partial w = 4$ y tasa de aprendizaje $\\eta = 0.1$, ¿cuál es el nuevo valor de $w$ tras un paso de descenso de gradiente?', 1.6, 0.001, '$w \\leftarrow 2 - 0.1\\cdot4 = 1.6$.'),
    q('Entrenas y la pérdida crece sin control. La causa más probable es…', ['una tasa de aprendizaje demasiado alta', 'una tasa de aprendizaje demasiado baja', 'pocos datos', 'demasiadas épocas'], 0, 'Los pasos se pasan de largo del mínimo y cada vez se alejan más.'),
    q('¿Qué es una época?', ['Un paso de actualización', 'Una pasada completa por todos los datos de entrenamiento', 'Un lote de datos', 'El número de capas'], 1, 'Una época contiene tantos pasos como lotes haya.'),
    q('¿Por qué se usa el descenso de gradiente estocástico en lugar de calcular el gradiente con todos los datos?', ['Porque es exacto', 'Porque cada paso es mucho más barato y el ruido resulta tolerable e incluso útil', 'Porque no necesita tasa de aprendizaje', 'Porque no usa derivadas'], 1, 'Estimar el gradiente con un lote pequeño permite muchos más pasos por unidad de cómputo.')
  ],
  'm3-l2': [
    n('La clase real es 1 y el modelo le asigna probabilidad 0.5. ¿Cuánto vale la entropía cruzada de ese ejemplo? (dos decimales)', 0.69, 0.01, '$-\\ln 0.5 = 0.693$.'),
    q('La frontera de decisión de una regresión logística es…', ['una curva cualquiera', 'lineal (una recta en 2D)', 'un círculo', 'no existe'], 1, 'Corresponde a $\\mathbf{w}\\cdot\\mathbf{x} + b = 0$.'),
    q('¿Qué garantiza la softmax?', ['Que la clase correcta tenga probabilidad 1', 'Que las salidas estén entre 0 y 1 y sumen 1', 'Que los logits sean positivos', 'Que no haya sobreajuste'], 1, 'Convierte puntuaciones cualesquiera en una distribución de probabilidad.'),
    q('¿Por qué la entropía cruzada es adecuada para clasificar?', ['Porque castiga con dureza los errores cometidos con mucha confianza', 'Porque ignora las probabilidades', 'Porque es más rápida que sumar', 'Porque no necesita etiquetas'], 0, '$-\\ln p$ crece sin límite cuando $p \\to 0$.')
  ],
  'm3-l3': [
    q('En k-NN, usar $k = 1$ produce un modelo con…', ['sesgo alto y varianza baja', 'sesgo bajo y varianza alta', 'sesgo y varianza bajos', 'frontera lineal'], 1, 'Cada punto decide su entorno: frontera muy irregular, muy sensible al ruido.'),
    q('¿Qué reduce principalmente un bosque aleatorio respecto a un solo árbol?', ['El sesgo', 'La varianza', 'El número de datos', 'El tiempo de predicción'], 1, 'Promediar muchos árboles poco correlacionados reduce la varianza.'),
    q('¿Cómo construye su modelo el boosting?', ['Entrena árboles independientes y promedia', 'Añade árboles uno tras otro, cada uno corrigiendo los errores de los anteriores', 'Busca el máximo margen', 'Vota entre vecinos'], 1, 'Es un ensamble secuencial; reduce sobre todo el sesgo.'),
    q('Para datos en forma de tabla de tamaño medio, ¿cuál suele ser el punto de partida recomendable?', ['Una CNN', 'Un Transformer entrenado desde cero', 'Boosting sobre árboles', 'Una PINN'], 2, 'Los ensambles de árboles son la referencia práctica en datos tabulares.')
  ],
  'm3-l4': [
    n('Un modelo obtiene VP = 30, FP = 10, FN = 20. ¿Cuál es su precisión? (dos decimales)', 0.75, 0.005, 'Precisión $= VP/(VP+FP) = 30/40 = 0.75$.'),
    n('Con los mismos valores (VP = 30, FP = 10, FN = 20), ¿cuál es la exhaustividad? (dos decimales)', 0.6, 0.005, 'Exhaustividad $= VP/(VP+FN) = 30/50 = 0.60$.'),
    q('El 1 % de las transacciones son fraude. Un modelo que siempre responde «no es fraude» tiene…', ['99 % de exactitud y 0 % de exhaustividad', '1 % de exactitud', '99 % de exhaustividad', '50 % de exactitud'], 0, 'Acierta todos los negativos y no detecta ningún positivo: la exactitud engaña.'),
    q('Al subir el umbral de decisión, en general…', ['sube la exhaustividad y baja la precisión', 'sube la precisión y baja la exhaustividad', 'suben ambas', 'no cambia nada'], 1, 'El modelo se vuelve más exigente para decir «positivo».'),
    q('¿Cuántas veces debe usarse el conjunto de prueba?', ['En cada época', 'Cada vez que se cambia un hiperparámetro', 'Una sola vez, al final', 'Nunca'], 2, 'Si se usa para decidir, deja de ser una estimación honesta.')
  ],
  'm3-l5': [
    q('¿Qué efecto tiene la regularización L1 que no tiene la L2?', ['Encoge los pesos', 'Pone muchos pesos exactamente a cero', 'Aumenta la varianza', 'Elimina el sesgo'], 1, 'L1 selecciona características; L2 encoge sin anular.'),
    q('Al aumentar mucho $\\lambda$ en una regresión regularizada, el modelo tiende a…', ['sobreajustar', 'subajustar', 'no cambiar', 'divergir'], 1, 'La penalización domina y el modelo se vuelve demasiado simple.'),
    q('¿Con qué datos se calculan la media y la desviación para estandarizar?', ['Con todos', 'Solo con los de entrenamiento', 'Solo con los de prueba', 'Con los de validación'], 1, 'Y se aplican tal cual a validación y prueba; lo contrario es fuga de datos.')
  ],
  'm4-l1': [
    q('¿Cuáles son los dos pasos que alterna k-means?', ['Derivar y actualizar', 'Asignar cada punto al centroide más cercano y mover cada centroide a la media de sus puntos', 'Fusionar y dividir grupos', 'Proyectar y reconstruir'], 1, 'Cada paso reduce la inercia o la deja igual.'),
    q('¿Por qué la inercia por sí sola no sirve para elegir $k$?', ['Porque no se puede calcular', 'Porque siempre baja al aumentar $k$', 'Porque siempre sube', 'Porque depende de las etiquetas'], 1, 'Con $k = n$ vale 0; hay que buscar el «codo» u otro criterio.'),
    q('Tus datos forman dos anillos concéntricos. ¿Qué algoritmo es más adecuado?', ['k-means', 'DBSCAN', 'Regresión lineal', 'PCA'], 1, 'DBSCAN agrupa por densidad y encuentra formas arbitrarias; k-means supone grupos redondos.'),
    q('Ejecutas k-means dos veces y obtienes grupos distintos. ¿Por qué?', ['Hay un error en el código', 'El resultado depende de la posición inicial de los centroides', 'Los datos cambiaron', 'k-means es supervisado'], 1, 'Solo garantiza un mínimo local; por eso se usan k-means++ y varios reinicios.')
  ],
  'm4-l2': [
    q('La primera componente principal es la dirección…', ['de mínima varianza', 'de máxima varianza de los datos', 'que mejor separa las clases', 'del eje x'], 1, 'Y equivale a la que hace mínimo el error de reconstrucción.'),
    q('Las componentes principales son…', ['los centroides', 'los vectores propios de la matriz de covarianza', 'las etiquetas', 'las filas de los datos'], 1, 'Sus valores propios son la varianza en cada dirección.'),
    q('En un mapa t-SNE, dos grupos aparecen muy separados. ¿Qué puedes concluir?', ['Que están muy lejos en el espacio original', 'Nada fiable sobre la distancia entre grupos', 'Que son clases distintas con seguridad', 'Que PCA daría lo mismo'], 1, 't-SNE conserva vecindarios locales; las distancias entre grupos lejanos no son interpretables.'),
    q('¿Qué hay que hacer siempre antes de aplicar PCA?', ['Añadir ruido', 'Centrar los datos (y estandarizar si las escalas difieren)', 'Etiquetar los datos', 'Barajar las columnas'], 1, 'Sin centrar, la primera componente apunta hacia la media; sin escalar, domina la variable de números más grandes.')
  ],
  'm4-l3': [
    q('En detección de anomalías por reconstrucción, un dato es sospechoso si…', ['se reconstruye muy bien', 'su error de reconstrucción es alto', 'tiene etiqueta', 'está cerca de la media'], 1, 'El modelo solo sabe reconstruir lo que se parece a lo normal.'),
    q('¿Por qué casi nunca se plantea la detección de anomalías como clasificación supervisada?', ['Porque es ilegal', 'Porque hay muy pocos ejemplos de anomalías y cambian con el tiempo', 'Porque no hay datos normales', 'Porque las redes no clasifican'], 1, 'Se aprende lo normal y se marca lo que se aleja.')
  ],
  'm5-l1': [
    q('El supuesto de agrupamiento afirma que…', ['todos los datos están etiquetados', 'la frontera de decisión debería pasar por zonas de baja densidad', 'los datos no tienen estructura', 'las clases están equilibradas'], 1, 'Los puntos de un mismo grupo comparten clase; cortar un grupo denso es mala idea.'),
    q('¿Qué es una pseudo-etiqueta?', ['Una etiqueta incorrecta puesta por un humano', 'La predicción del propio modelo sobre un dato sin etiquetar, usada como etiqueta cuando la confianza es alta', 'Una etiqueta aleatoria', 'El centroide de un grupo'], 1, 'Es la base del autoentrenamiento y de FixMatch.'),
    q('En el programa de la lección, el autoentrenamiento no mejoró a la línea base supervisada. ¿Cuál es la explicación?', ['Había demasiadas etiquetas', 'Sesgo de confirmación: las pseudo-etiquetas erróneas refuerzan los errores del modelo', 'El código tenía un error', 'Los datos no tenían estructura'], 1, 'Un clasificador flojo propaga sus propios errores; la propagación por grafo sí aprovechó la estructura.'),
    q('FixMatch entrena al modelo para que…', ['prediga lo mismo en una versión con aumento fuerte que la pseudo-etiqueta obtenida con aumento débil', 'ignore los datos sin etiquetar', 'reconstruya la imagen', 'agrupe los datos con k-means'], 0, 'Combina pseudo-etiquetas con umbral de confianza y regularización de consistencia.')
  ],
  'm5-l2': [
    q('¿Cuál de estas es una tarea pretexto?', ['Clasificar tumores con etiquetas de un médico', 'Ocultar una palabra de una frase y predecirla', 'Calcular la exactitud', 'Elegir k en k-means'], 1, 'La «etiqueta» sale del propio texto.'),
    q('En el aprendizaje contrastivo, la red aprende a…', ['dar representaciones parecidas a dos vistas del mismo dato y distintas a las de datos diferentes', 'reconstruir píxeles', 'predecir recompensas', 'minimizar la inercia'], 0, 'Las vistas se generan con aumento de datos.'),
    q('¿Qué es una «sonda lineal»?', ['Entrenar toda la red desde cero', 'Congelar la red preentrenada y entrenar solo un clasificador lineal sobre sus representaciones', 'Un tipo de optimizador', 'Una función de activación'], 1, 'Mide la calidad de las representaciones y es la adaptación más barata.')
  ],
  'm6-l1': [
    n('Una neurona con pesos $\\mathbf{w} = (2, -1)$ y sesgo $b = 0.5$ recibe $\\mathbf{x} = (1, 3)$. ¿Cuánto vale $z = \\mathbf{w}\\cdot\\mathbf{x} + b$?', -0.5, 0.001, '$2\\cdot1 + (-1)\\cdot3 + 0.5 = -0.5$.'),
    q('¿Por qué una sola neurona no puede calcular XOR?', ['Porque le faltan datos', 'Porque XOR no es separable con una línea recta', 'Porque necesita una GPU', 'Porque la sigmoide no es derivable'], 1, 'Una neurona divide el plano con una recta; XOR necesita dos.'),
    q('Geométricamente, el vector de pesos $\\mathbf{w}$ de una neurona es…', ['paralelo a la frontera de decisión', 'perpendicular a la frontera de decisión', 'el centro de los datos', 'irrelevante'], 1, 'Apunta hacia el lado en que la neurona se activa.'),
    q('¿Qué aportan las neuronas ocultas en la solución de XOR?', ['Más velocidad', 'Una nueva representación en la que el problema sí es separable linealmente', 'Más datos', 'Menos parámetros'], 1, 'Es la idea central: las capas intermedias transforman los datos.')
  ],
  'm6-l2': [
    q('¿Qué ocurre si una red de 10 capas no tiene funciones de activación?', ['Aprende más rápido', 'Equivale a una sola capa lineal', 'No se puede calcular', 'Se convierte en una CNN'], 1, 'La composición de funciones lineales es lineal.'),
    q('¿Por qué ReLU alivia el desvanecimiento del gradiente?', ['Porque su derivada es 1 para $z > 0$', 'Porque su derivada es 0.25', 'Porque está acotada entre 0 y 1', 'Porque es periódica'], 0, 'El gradiente atraviesa la neurona activa sin encogerse.'),
    q('¿Por qué no se usa ReLU en una PINN con una ecuación de segundo orden?', ['Porque es lenta', 'Porque su segunda derivada es cero y los términos como $u_{xx}$ desaparecerían', 'Porque no admite entradas negativas', 'Porque satura'], 1, 'Hace falta una activación suave: tanh, SiLU o seno.'),
    n('¿Cuál es el valor máximo de la derivada de la sigmoide? (dos decimales)', 0.25, 0.005, '$\\sigma\'(z) = \\sigma(1-\\sigma)$, máxima en $z = 0$: $0.5\\cdot0.5 = 0.25$.')
  ],
  'm6-l3': [
    n('¿Cuántos parámetros tiene una capa densa con 10 entradas y 4 neuronas (pesos más sesgos)?', 44, 0.001, '$10\\cdot4 = 40$ pesos y 4 sesgos.'),
    q('El teorema de aproximación universal garantiza que…', ['el descenso de gradiente encuentra los pesos óptimos', 'existen pesos con los que una red de una capa oculta suficientemente ancha aproxima cualquier función continua', 'la red generaliza bien', 'bastan 10 neuronas'], 1, 'Habla de existencia, no de cómo encontrar los pesos ni de generalización.'),
    q('¿Qué ventaja tiene la profundidad frente a una sola capa muy ancha?', ['Ninguna', 'Compone características y, para muchas funciones, necesita muchas menos neuronas', 'Elimina la necesidad de datos', 'Evita usar activaciones'], 1, 'Cada capa construye sobre la anterior.'),
    n('Red de la lección: $W^{(1)} = \\begin{pmatrix}1 & -1\\\\ 0.5 & 2\\end{pmatrix}$, $\\mathbf{b}^{(1)} = (0, -1)$, ReLU, $W^{(2)} = (2, -1)$, $b^{(2)} = 0.5$. ¿Cuál es la salida para $\\mathbf{x} = (1, 1)$?', -1, 0.001, '$\\mathbf{z}^{(1)} = (0, 1.5)$; ReLU: $(0, 1.5)$; salida $= 2\\cdot0 - 1.5 + 0.5 = -1$.')
  ],
  'm6-l4': [
    n('Una red recién inicializada clasifica entre 10 clases. ¿Qué pérdida de entropía cruzada cabe esperar aproximadamente? (dos decimales)', 2.3, 0.02, 'Reparte la probabilidad por igual: $-\\ln(1/10) = \\ln 10 = 2.30$.'),
    q('¿Por qué la exactitud no se usa como función de pérdida?', ['Porque es demasiado lenta', 'Porque es una función a escalones: su gradiente es 0 casi en todas partes', 'Porque no mide aciertos', 'Porque necesita GPU'], 1, 'Sin gradiente útil, el descenso de gradiente no puede avanzar.'),
    q('En PyTorch, `nn.CrossEntropyLoss` espera recibir…', ['probabilidades tras una softmax', 'logits (sin softmax)', 'etiquetas one-hot como salida de la red', 'la exactitud'], 1, 'La softmax va incluida dentro de la pérdida, por estabilidad numérica.')
  ],
  'm6-l5': [
    q('En la pasada hacia atrás, ¿qué hace un nodo de suma con el gradiente que recibe?', ['Lo divide entre dos', 'Lo copia a sus dos entradas', 'Lo multiplica por la otra entrada', 'Lo anula'], 1, 'La derivada de una suma respecto a cada sumando es 1.'),
    q('¿Y un nodo de producto $c = a\\cdot b$?', ['Lo copia', 'Envía a cada entrada el gradiente multiplicado por la otra entrada', 'Lo suma', 'Lo eleva al cuadrado'], 1, '$\\partial c/\\partial a = b$ y $\\partial c/\\partial b = a$.'),
    q('¿Cuánto cuesta una pasada hacia atrás completa, aproximadamente?', ['Una pasada hacia delante por cada parámetro', 'Lo mismo que una pasada hacia delante', 'El cuadrado del número de parámetros', 'Nada'], 1, 'Por eso es viable entrenar redes de millones de parámetros.'),
    q('El gradiente de la pérdida respecto a un peso es…', ['el error de la neurona de destino por la activación de la neurona de origen', 'la suma de todos los pesos', 'siempre positivo', 'la tasa de aprendizaje'], 0, '$\\partial L/\\partial W^{(l)} = \\boldsymbol{\\delta}^{(l)}\\mathbf{a}^{(l-1)\\top}$.'),
    q('¿Qué da la diferenciación automática?', ['Derivadas aproximadas por diferencias finitas', 'Derivadas exactas, también respecto a las entradas de la red', 'Solo la pérdida', 'Los hiperparámetros óptimos'], 1, 'Registra las operaciones y aplica la regla de la cadena; es lo que hace posibles las PINN.')
  ],
  'm6-l6': [
    q('¿Por qué no se inicializan todos los pesos a cero?', ['Porque es más lento', 'Porque todas las neuronas de una capa calcularían lo mismo y recibirían el mismo gradiente', 'Porque produce `nan`', 'Porque no cabe en memoria'], 1, 'Hay que romper la simetría con valores aleatorios.'),
    q('Con softmax y entropía cruzada, el gradiente respecto a los logits es…', ['$P - Y$ (predicción menos objetivo)', '$Y - P^2$', 'siempre 1', '$\\ln P$'], 0, 'La misma forma simple que en la regresión lineal y logística.'),
    q('¿Cómo se comprueba que una retropropagación escrita a mano es correcta?', ['Mirando si la pérdida es positiva', 'Comparando los gradientes con los obtenidos por diferencias finitas', 'Aumentando la tasa de aprendizaje', 'No se puede comprobar'], 1, 'Si coinciden en 5 o 6 cifras, la implementación es correcta.')
  ],
  'm7-l1': [
    q('¿Qué tres factores hicieron viable el deep learning a partir de 2012?', ['Datos masivos, GPU y mejoras algorítmicas', 'Nuevos lenguajes de programación', 'Ordenadores cuánticos', 'La invención de la retropropagación ese año'], 0, 'La retropropagación es de los años ochenta; lo nuevo fue la confluencia de esos tres factores.'),
    q('La pérdida de entrenamiento baja pero la de validación sube. ¿Qué ocurre?', ['Subajuste', 'Sobreajuste', 'Tasa de aprendizaje baja', 'Todo va bien'], 1, 'La red empieza a memorizar.'),
    q('¿Qué comprueba la prueba de «sobreajustar un lote»?', ['Que la red generaliza', 'Que el modelo, la pérdida y el bucle funcionan: una red sana memoriza 16 ejemplos', 'Que hay suficientes datos', 'Que la GPU funciona'], 1, 'Si no puede memorizar un lote pequeño, hay un error antes de cualquier entrenamiento largo.')
  ],
  'm7-l2': [
    q('¿Qué hace el momento?', ['Aumenta la tasa de aprendizaje indefinidamente', 'Acumula una velocidad con los gradientes recientes: amortigua las oscilaciones y acelera en direcciones constantes', 'Elimina la necesidad de gradientes', 'Normaliza las activaciones'], 1, 'Como una bola pesada que rueda por el valle.'),
    q('¿Qué añade Adam al momento?', ['Dropout', 'Un tamaño de paso propio para cada parámetro, según la magnitud de sus gradientes', 'Conexiones residuales', 'Más capas'], 1, 'Combina momento con el reescalado de RMSProp.'),
    q('¿Para qué sirve el calentamiento (*warmup*)?', ['Para enfriar la GPU', 'Para empezar con una tasa de aprendizaje baja mientras se estabilizan las estadísticas del optimizador', 'Para aumentar los datos', 'Para evaluar el modelo'], 1, 'Después se suele aplicar un decaimiento.'),
    q('La pérdida da `nan` de repente. ¿Qué técnica ayuda directamente?', ['Recorte de gradientes', 'Más épocas', 'Lotes más pequeños', 'Quitar la validación'], 0, 'Limita la norma del gradiente antes de actualizar; también conviene bajar la tasa de aprendizaje.')
  ],
  'm7-l3': [
    q('¿Qué inicialización corresponde a capas con ReLU?', ['Ceros', 'He / Kaiming', 'Xavier / Glorot', 'Unos'], 1, 'Su varianza $2/n_{\\text{ent}}$ compensa que ReLU anula la mitad de las activaciones.'),
    q('¿Por qué una conexión residual facilita entrenar redes profundas?', ['Porque elimina parámetros', 'Porque la derivada incluye un «+1» que da al gradiente un camino directo', 'Porque sustituye a la activación', 'Porque reduce los datos necesarios'], 1, '$\\partial\\mathbf{y}/\\partial\\mathbf{x} = \\partial F/\\partial\\mathbf{x} + 1$.'),
    q('¿Qué normalización usan los Transformers?', ['Por lotes', 'Por capas', 'Ninguna', 'Min-max'], 1, 'No depende del tamaño del lote y se comporta igual al entrenar y al evaluar.'),
    q('Evalúas un modelo con BatchNorm sin llamar a `modelo.eval()`. ¿Qué pasa?', ['Nada', 'Usa las estadísticas del lote en lugar de las acumuladas y los resultados son erráticos', 'Se borran los pesos', 'Entrena más rápido'], 1, 'BatchNorm y dropout se comportan distinto en entrenamiento y en evaluación.')
  ],
  'm7-l4': [
    q('¿Cuándo actúa el dropout?', ['Solo durante la evaluación', 'Solo durante el entrenamiento', 'Siempre', 'Nunca en redes profundas'], 1, 'Al evaluar se usan todas las neuronas.'),
    q('¿Qué pesos se conservan con la parada temprana?', ['Los de la última época', 'Los de la época con menor pérdida de validación', 'Los iniciales', 'Un promedio de todos'], 1, 'Se detiene cuando la validación deja de mejorar durante «paciencia» épocas.'),
    q('¿Cuál es un aumento de datos INCORRECTO para reconocer dígitos?', ['Desplazar la imagen dos píxeles', 'Variar ligeramente el brillo', 'Girar la imagen 180°', 'Añadir un poco de ruido'], 2, 'Un 6 girado 180° es un 9: la transformación cambia la etiqueta.'),
    q('Según la lección, ¿qué conviene conseguir antes de añadir regularización?', ['Que la red subajuste', 'Que la red sea capaz de sobreajustar', 'Que la pérdida sea `nan`', 'Que no haya validación'], 1, 'Confirma que tiene capacidad y que el código funciona; después se regulariza.')
  ],
  'm7-l5': [
    q('¿En qué orden van los pasos del bucle de entrenamiento en PyTorch?', ['backward, forward, step, zero_grad, pérdida', 'forward, pérdida, zero_grad, backward, step', 'step, forward, pérdida, backward', 'zero_grad, step, forward, backward'], 1, 'Predicción, pérdida, borrar gradientes, retropropagar y actualizar.'),
    q('¿Qué ocurre si olvidas `optimizador.zero_grad()`?', ['Nada', 'Los gradientes se acumulan paso tras paso', 'Los pesos se ponen a cero', 'El modelo pasa a modo evaluación'], 1, 'PyTorch suma los gradientes nuevos a los existentes.'),
    q('¿Para qué sirve `create_graph=True` en `torch.autograd.grad`?', ['Para dibujar la red', 'Para que la derivada forme parte del grafo y se pueda derivar otra vez y retropropagar', 'Para usar la GPU', 'Para guardar el modelo'], 1, 'Es imprescindible en una PINN.')
  ],
  'm8-l1': [
    q('¿Qué dos ideas definen una capa convolucional?', ['Conectividad local y pesos compartidos', 'Dropout y momento', 'Atención y normalización', 'Recurrencia y memoria'], 0, 'Cada neurona mira una ventana pequeña y el mismo filtro se aplica en todas las posiciones.'),
    q('¿Qué significa que la convolución sea equivariante a la traslación?', ['Que la salida no cambia nunca', 'Que si la entrada se desplaza, la salida se desplaza igual', 'Que solo funciona con imágenes centradas', 'Que gira la imagen'], 1, 'Un filtro detecta su patrón esté donde esté.'),
    q('¿Por qué una CNN necesita muchos menos parámetros que un MLP para una imagen?', ['Porque usa menos capas', 'Porque sus filtros son pequeños y se reutilizan en toda la imagen', 'Porque ignora los colores', 'Porque no tiene sesgos'], 1, 'Los parámetros no dependen del tamaño de la imagen.')
  ],
  'm8-l2': [
    n('Entrada de 32×32, filtro de 5×5, stride 1, sin padding. ¿Cuál es el lado de la salida?', 28, 0.001, '$(32 + 0 - 5)/1 + 1 = 28$.'),
    n('Entrada de 28×28, filtro de 3×3, stride 2, padding 1. ¿Cuál es el lado de la salida?', 14, 0.001, '$\\lfloor(28 + 2 - 3)/2\\rfloor + 1 = 13 + 1 = 14$.'),
    n('¿Cuántos parámetros tiene una capa convolucional con 3 canales de entrada y 8 filtros de 3×3 (con sesgos)?', 224, 0.001, '$8\\times(3\\cdot3\\cdot3 + 1) = 8\\times28 = 224$.'),
    q('¿De dónde salen los valores de los filtros en una CNN?', ['Los diseña un experto', 'Se aprenden por retropropagación', 'Son siempre filtros de Sobel', 'Se copian de la imagen'], 1, 'Se inicializan al azar y se ajustan como cualquier otro peso.'),
    q('Un filtro que resta la columna izquierda de la derecha da salida cero en una zona de la imagen. Esa zona es…', ['un borde vertical', 'uniforme en horizontal', 'muy brillante', 'una esquina'], 1, 'El filtro detecta cambios, no brillo: donde no hay cambio, da 0.')
  ],
  'm8-l3': [
    n('Aplica max-pooling 2×2 al bloque $\\begin{pmatrix}3 & 1\\\\ 7 & 2\\end{pmatrix}$. ¿Qué valor resulta?', 7, 0.001, 'El máximo del bloque.'),
    q('Al avanzar por una CNN típica…', ['sube la resolución y baja el número de canales', 'baja la resolución y sube el número de canales', 'ambos suben', 'ambos bajan'], 1, 'Menos «dónde», más «qué».'),
    q('¿Qué es el campo receptivo de una neurona?', ['El número de filtros', 'La región de la imagen de entrada que influye en su valor', 'El tamaño del lote', 'La tasa de aprendizaje'], 1, 'Crece con la profundidad: por eso las capas profundas detectan objetos grandes.'),
    q('¿Cuántos parámetros aprende una capa de max-pooling?', ['Tantos como píxeles', 'Cuatro', 'Ninguno', 'Depende del stride'], 2, 'Es una operación fija.')
  ],
  'm8-l4': [
    q('¿Qué innovación de ResNet permitió redes de más de 100 capas?', ['Filtros de 11×11', 'Conexiones residuales', 'Eliminar las activaciones', 'Usar sigmoides'], 1, 'Dan al gradiente un camino directo.'),
    q('¿En qué situación suele ganar una CNN a un Vision Transformer entrenado desde cero?', ['Con miles de millones de imágenes', 'Con pocos datos', 'Nunca', 'Solo en texto'], 1, 'Su sesgo inductivo (localidad, equivarianza) le permite aprender con menos datos.'),
    q('¿Qué mostró ConvNeXt?', ['Que las CNN están obsoletas', 'Que una CNN modernizada con decisiones de diseño de los Transformers puede igualarlos', 'Que el pooling es imprescindible', 'Que ReLU es mejor que GELU'], 1, 'Parte de la ventaja atribuida a la atención venía de recetas de entrenamiento y detalles de diseño.'),
    q('¿Qué red ganó ImageNet en 2012 e inició la era del deep learning?', ['LeNet-5', 'AlexNet', 'ResNet', 'VGG'], 1, 'Con un error top-5 del 15.3 % frente al 26.2 % del segundo.')
  ],
  'm8-l5': [
    q('¿Qué forma de tensor espera `nn.Conv2d`?', ['(alto, ancho)', '(lote, alto, ancho, canales)', '(lote, canales, alto, ancho)', '(canales, lote)'], 2, 'Por eso los dígitos se reorganizan a `(-1, 1, 8, 8)`.'),
    q('Tienes 200 imágenes por clase. ¿Qué estrategia es más razonable?', ['Entrenar una ResNet-152 desde cero', 'Usar una red preentrenada, congelarla y entrenar solo una capa final nueva', 'No usar redes', 'Entrenar sin validación'], 1, 'Extracción de características: la opción adecuada con pocos datos.'),
    q('En el ajuste fino de toda la red, la tasa de aprendizaje debe ser…', ['mucho más alta que al entrenar desde cero', 'baja, para no destruir lo aprendido', 'cero', 'aleatoria'], 1, 'Típicamente entre $10^{-5}$ y $10^{-4}$.')
  ],
  'm9-l1': [
    q('¿Qué resume el estado oculto de una RNN?', ['La imagen de entrada', 'Lo visto de la secuencia hasta ese momento', 'Las etiquetas', 'Los hiperparámetros'], 1, 'Se actualiza en cada paso con los mismos pesos.'),
    q('¿Por qué una RNN simple no aprende dependencias largas?', ['Porque no tiene pesos', 'Porque el gradiente se desvanece al retropropagar por muchos pasos de tiempo', 'Porque solo admite imágenes', 'Porque no usa activaciones'], 1, 'Se multiplica muchas veces por la misma matriz y por la derivada de tanh.'),
    q('¿Qué limitación de las RNN resuelven los Transformers?', ['Que necesitan datos', 'Que el cálculo es secuencial y no se puede paralelizar dentro de la secuencia', 'Que usan gradientes', 'Que tienen pocas capas'], 1, 'La atención procesa todos los tokens a la vez.')
  ],
  'm9-l2': [
    q('En la autoatención, ¿con qué se compara la consulta de un token?', ['Con los valores de los demás', 'Con las claves de todos los tokens, mediante un producto punto', 'Con las etiquetas', 'Con la posición'], 1, 'Los pesos resultantes ponderan los valores.'),
    q('¿Para qué sirve la codificación posicional?', ['Para reducir parámetros', 'Para que el modelo conozca el orden de los tokens, que la atención por sí sola ignora', 'Para normalizar', 'Para acelerar la GPU'], 1, 'Sin ella, barajar la frase daría las mismas salidas barajadas.'),
    q('¿Qué hace la máscara causal?', ['Oculta tokens al azar', 'Impide que un token atienda a los que vienen después', 'Elimina la softmax', 'Duplica las cabezas'], 1, 'Imprescindible en los modelos que generan texto.'),
    q('El coste de la autoatención respecto a la longitud $n$ de la secuencia crece como…', ['$n$', '$n\\log n$', '$n^2$', 'constante'], 2, 'Cada token se compara con todos los demás.'),
    n('Dos tokens tienen puntuaciones de atención 0 y 0 antes de la softmax. ¿Qué peso recibe cada uno?', 0.5, 0.001, 'Puntuaciones iguales dan pesos iguales, y deben sumar 1.')
  ],
  'm9-l3': [
    q('¿Con qué tarea se preentrena un modelo de lenguaje tipo GPT?', ['Clasificar frases etiquetadas', 'Predecir el siguiente token', 'Traducir con supervisión humana', 'Agrupar documentos'], 1, 'Es aprendizaje auto-supervisado: el objetivo es el propio texto desplazado.'),
    q('¿Qué es una «alucinación»?', ['Un error de sintaxis', 'Texto plausible pero falso que el modelo afirma con seguridad', 'Un fallo de la GPU', 'Una temperatura alta'], 1, 'El modelo genera lo probable, no lo verificado.'),
    q('¿Qué hace la generación aumentada con recuperación (RAG)?', ['Reentrena el modelo cada vez', 'Busca documentos relevantes y los añade al texto de entrada antes de responder', 'Reduce el vocabulario', 'Elimina la atención'], 1, 'Permite usar información reciente o privada y reduce errores de hecho.')
  ],
  'm10-l1': [
    q('¿Qué minimiza un autoencoder?', ['La entropía cruzada con etiquetas', 'El error de reconstrucción entre la entrada y su salida', 'La inercia', 'La recompensa'], 1, 'No necesita etiquetas: el objetivo es la propia entrada.'),
    q('¿Por qué un autoencoder corriente no sirve para generar datos nuevos?', ['Porque no tiene decodificador', 'Porque su espacio latente es irregular: un código al azar suele caer en una zona sin sentido', 'Porque es lineal', 'Porque necesita etiquetas'], 1, 'El VAE lo resuelve regularizando el espacio latente.'),
    q('¿Qué añade la pérdida de un VAE a la de reconstrucción?', ['Un término que acerca las distribuciones latentes a una normal estándar', 'Un discriminador', 'Recompensas', 'Decaimiento de pesos obligatorio'], 0, 'La divergencia KL mantiene el espacio latente continuo y sin huecos.')
  ],
  'm10-l2': [
    q('En una GAN, el generador se entrena para…', ['clasificar imágenes', 'engañar al discriminador', 'reconstruir la entrada', 'quitar ruido'], 1, 'Y el discriminador, para distinguir reales de falsas.'),
    q('¿Qué predice la red de un modelo de difusión durante el entrenamiento (formulación DDPM)?', ['La clase de la imagen', 'El ruido que se añadió al dato', 'El siguiente token', 'La recompensa'], 1, 'Es una regresión con error cuadrático: estable.'),
    q('¿Cuál es el principal inconveniente de la difusión clásica frente a una GAN?', ['El entrenamiento inestable', 'Generar requiere muchas pasadas por la red', 'La poca variedad', 'Que no admite texto'], 1, 'Decenas o cientos de pasos; la destilación y el flow matching lo reducen.')
  ],
  'm11-l1': [
    q('¿Qué es una ecuación diferencial?', ['Una ecuación cuya incógnita es un número', 'Una ecuación cuya incógnita es una función y que la relaciona con sus derivadas', 'Una desigualdad', 'Una función de pérdida'], 1, 'Resolverla es encontrar la función.'),
    q('La ecuación del calor $u_t = \\alpha u_{xx}$ es…', ['una EDO', 'una EDP', 'una ecuación algebraica', 'una condición de frontera'], 1, 'La incógnita depende de $x$ y de $t$ y aparecen derivadas parciales.'),
    q('¿Por qué hacen falta condiciones iniciales y de frontera?', ['Para acelerar el cálculo', 'Porque sin ellas la ecuación tiene infinitas soluciones', 'Porque lo exige PyTorch', 'Para reducir el ruido'], 1, 'Seleccionan una única solución.'),
    q('Para un problema directo estándar en pocas dimensiones, ¿qué suele ser más rápido y preciso hoy?', ['Una PINN', 'Un método numérico clásico bien implementado', 'Un modelo de lenguaje', 'k-means'], 1, 'Las PINN complementan a esos métodos en otros escenarios; no los sustituyen.')
  ],
  'm11-l2': [
    q('¿Qué es el residuo en una PINN?', ['El error de clasificación', 'La ecuación diferencial, con todo en un lado, evaluada con la red y sus derivadas', 'La diferencia entre dos épocas', 'El ruido de los datos'], 1, 'Si la red fuera la solución exacta, valdría 0.'),
    q('¿Qué necesita un punto de colocación?', ['Una medición de la solución', 'Nada: solo ser un punto del dominio donde evaluar el residuo', 'Una etiqueta de clase', 'Un vecino'], 1, 'Por eso se pueden usar tantos como se quiera.'),
    q('En una PINN se deriva respecto a dos cosas distintas. ¿Cuáles?', ['Respecto a la entrada (para el residuo) y respecto a los pesos (para entrenar)', 'Respecto a las etiquetas y al lote', 'Respecto al tiempo solamente', 'Respecto a la tasa de aprendizaje'], 0, 'La pérdida contiene derivadas de la red, y entrenar requiere derivar esa pérdida.'),
    q('En el laboratorio, la red entrenada solo con 10 mediciones falla fuera de ellas. ¿Por qué?', ['Tiene pocas neuronas', 'Nada le dice cómo debe comportarse donde no hay datos', 'La tasa de aprendizaje era alta', 'Usaba tanh'], 1, 'La ecuación aporta esa información en los puntos de colocación.'),
    q('Una pérdida física muy baja garantiza que la solución es correcta. ¿Verdadero o falso?', ['Verdadero', 'Falso'], 1, 'El residuo solo se evalúa en puntos concretos, y si las condiciones no se cumplen es la solución de otro problema. Hay que validar.')
  ],
  'm11-l3': [
    q('Para la ecuación del calor, ¿qué datos del interior del dominio necesita la PINN?', ['Miles de mediciones', 'Ninguno: bastan la ecuación, la condición inicial y las de frontera', 'Uno por punto de colocación', 'Etiquetas de clase'], 1, 'Lo comprobaste en el laboratorio.'),
    q('¿Qué son las condiciones «duras»?', ['Términos de la pérdida con peso alto', 'Una construcción de la salida que cumple las condiciones exactamente, valga lo que valga la red', 'Condiciones difíciles de derivar', 'Datos sin ruido'], 1, 'Eliminan términos de la pérdida y el problema de equilibrarlos.'),
    q('En un problema inverso con una PINN, el parámetro desconocido de la ecuación…', ['se fija a mano', 'se declara como variable entrenable y se optimiza junto con los pesos', 'se ignora', 'se estima con k-means'], 1, 'Aparece dentro del residuo, y solo su valor correcto hace el residuo pequeño.'),
    q('Con $u_\\theta(x,t) = \\sin(\\pi x) + t\\,x(1-x)N_\\theta(x,t)$, ¿cuánto vale $u_\\theta$ en $x = 1$?', ['$N_\\theta$', '$\\sin(\\pi) + 0 = 0$', '1', 'Depende de $t$'], 1, '$\\sin\\pi = 0$ y el factor $(1-x)$ anula el segundo término: la condición de frontera se cumple siempre.')
  ],
  'm11-l4': [
    q('¿Por qué los puntos de colocación se crean con `requires_grad=True`?', ['Para moverlos durante el entrenamiento', 'Porque hay que derivar la salida de la red respecto a ellos', 'Para guardarlos en disco', 'Para normalizarlos'], 1, 'Sin eso, autograd no registra la dependencia respecto a la entrada.'),
    q('En el programa del oscilador, ¿por qué se divide el residuo por $k$?', ['Para que sea negativo', 'Para dejarlo en una escala comparable a la del término de datos', 'Para acelerar la GPU', 'Porque lo exige PyTorch'], 1, 'Sin escalar, su cuadrado dominaría la pérdida: es una adimensionalización sencilla.'),
    q('¿Qué tres cosas hay que cambiar para adaptar el código a otra ecuación?', ['El optimizador, la semilla y el lote', 'Las entradas y salidas de la red, la función del residuo y las condiciones', 'Solo la tasa de aprendizaje', 'El sistema operativo'], 1, 'El resto del bucle es idéntico.'),
    q('¿Para qué se remuestrean los puntos de colocación en cada paso?', ['Para gastar más memoria', 'Para que la red no pueda sobreajustar un conjunto fijo de puntos', 'Para cambiar la ecuación', 'No sirve de nada'], 1, 'Así el residuo se controla en todo el dominio.')
  ],
  'm11-l5': [
    q('¿Qué es el sesgo espectral?', ['Un error de medición', 'La tendencia de las redes a aprender primero las componentes suaves y muy despacio las oscilaciones rápidas', 'Un tipo de regularización', 'Un optimizador'], 1, 'Por eso los frentes abruptos y las altas frecuencias son difíciles.'),
    q('Tu PINN tiene un residuo muy bajo pero no cumple las condiciones de frontera. ¿Qué problema es?', ['Sesgo espectral', 'Términos de la pérdida desequilibrados', 'Sobreajuste clásico', 'Falta de datos'], 1, 'Remedios: pesos adaptativos o condiciones duras.'),
    q('¿Qué hacen las características de Fourier?', ['Cambian el optimizador', 'Pasan la entrada por senos y cosenos de varias frecuencias antes de la red', 'Eliminan la pérdida física', 'Reducen el número de capas'], 1, 'Mitigan el sesgo espectral.'),
    q('Según las comparaciones rigurosas citadas, para problemas directos en pocas dimensiones…', ['las PINN son siempre más rápidas', 'los métodos clásicos como elementos finitos suelen ser más rápidos y precisos', 'no se puede comparar', 'ambos fallan'], 1, 'Y muchas ventajas publicadas se medían contra referencias débiles.'),
    q('¿En qué tipo de problema aportan más las PINN?', ['Clasificación de imágenes', 'Problemas inversos con mediciones dispersas', 'Ordenar listas', 'Problemas directos sencillos en 1D'], 1, 'También en alta dimensión y con ecuaciones parcialmente conocidas.')
  ],
  'm11-l6': [
    q('¿Qué aprende un operador neuronal?', ['Una única solución', 'La correspondencia entre funciones: de condiciones o parámetros a la solución', 'Una clasificación', 'Una política'], 1, 'Resuelve un caso nuevo con una sola pasada.'),
    q('¿Qué necesita un operador neuronal que una PINN pura no necesita?', ['Una activación suave', 'Muchos datos: soluciones generadas con un solver', 'Diferenciación automática', 'Condiciones de frontera'], 1, 'Su coste se paga al generar datos y entrenar; después es casi instantáneo.'),
    q('Según las comparaciones citadas, las redes KAN frente a los MLP…', ['son mejores en todo', 'no muestran una ventaja general; destacan sobre todo en fórmulas simbólicas', 'no se pueden entrenar', 'son más rápidas siempre'], 1, 'Son una línea de investigación activa, no un reemplazo establecido.'),
    q('¿Por qué tres vías puede entrar el conocimiento físico en un modelo?', ['Los datos, la pérdida y la arquitectura', 'El lote, la época y la semilla', 'La GPU, la CPU y la memoria', 'Solo por la pérdida'], 0, 'Operadores (datos), PINN (pérdida) y diseños como las condiciones duras o las CNN (arquitectura).')
  ],
  'm12-l1': [
    q('¿Qué intenta maximizar un agente de aprendizaje por refuerzo?', ['La recompensa inmediata', 'La recompensa acumulada a largo plazo', 'La exactitud', 'El número de acciones'], 1, 'Por eso a veces conviene una acción con poca recompensa inmediata.'),
    n('$Q(s,a) = 4$; el agente recibe $r = 2$ y el mejor valor del estado siguiente es 10. Con $\\gamma = 0.5$ y $\\alpha = 0.5$, ¿cuál es el nuevo $Q(s,a)$?', 5.5, 0.001, 'Objetivo $= 2 + 0.5\\cdot10 = 7$; nuevo valor $= 4 + 0.5(7 - 4) = 5.5$.'),
    q('¿Qué es el dilema exploración-explotación?', ['Elegir entre CPU y GPU', 'Decidir entre probar acciones nuevas o repetir las que mejor han funcionado', 'Elegir el tamaño del lote', 'Separar entrenamiento y prueba'], 1, 'Sin explorar no se descubre nada mejor; sin explotar no se aprovecha lo aprendido.')
  ],
  'm12-l2': [
    q('Un modelo no funciona. Según la lección, ¿qué conviene sospechar primero?', ['La arquitectura', 'Un error en los datos o en el código', 'La marca de la GPU', 'El número de capas'], 1, 'Después, fugas o mala evaluación; luego hiperparámetros básicos; la arquitectura, al final.'),
    q('¿Por qué hay que medir el rendimiento por subgrupos y no solo de media?', ['Para tener más cifras', 'Porque un buen promedio puede ocultar un mal rendimiento en un grupo concreto', 'Porque lo exige NumPy', 'Para entrenar más rápido'], 1, 'Es una comprobación básica de equidad.'),
    q('¿Qué hace reproducible un experimento?', ['Usar la red más grande', 'Código versionado, versiones de librerías, semillas y datos documentados', 'Ejecutarlo una sola vez', 'No anotar los cambios'], 1, 'Un resultado que no se puede reproducir no es un resultado.')
  ]
};
