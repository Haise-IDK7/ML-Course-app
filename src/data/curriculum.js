// Plan de estudios. Cada lección tiene su texto en src/content/<id>.md.
// «lecturas» apunta a capítulos concretos de los libros de referencia (ver src/data/resources.js para las claves).
export const MODULES = [
  { id: 'm0', titulo: 'Bienvenida', desc: 'Cómo está organizado el curso, qué necesitas saber antes y cómo estudiar con él.', lecturas: [],
    lecciones: [['m0-l1', 'Cómo usar este curso', 8]] },
  { id: 'm1', titulo: 'Fundamentos matemáticos y Python', desc: 'Lo mínimo de álgebra lineal, cálculo y probabilidad para entender todo lo demás, y NumPy para ponerlo en código.',
    lecturas: [['mml', 'caps. 2, 5 y 6'], ['goodfellow', 'caps. 2-4'], ['d2l', 'cap. 2'], ['bishop', 'caps. 2-3']],
    lecciones: [['m1-l1', 'Vectores, matrices y tensores', 14], ['m1-l2', 'Derivadas, gradiente y regla de la cadena', 16], ['m1-l3', 'Probabilidad y estadística mínimas', 14], ['m1-l4', 'NumPy en lo esencial', 15]] },
  { id: 'm2', titulo: 'Qué es el machine learning', desc: 'Qué significa que una máquina aprenda, los tipos de aprendizaje y el problema central: generalizar a datos nuevos.',
    lecturas: [['geron', 'caps. 1-2'], ['goodfellow', 'cap. 5'], ['islp', 'cap. 2'], ['prince', 'caps. 1-2 y 8']],
    lecciones: [['m2-l1', 'IA, machine learning y deep learning', 10], ['m2-l2', 'Los tipos de aprendizaje', 12], ['m2-l3', 'El flujo de un proyecto de ML', 12], ['m2-l4', 'Generalización: subajuste y sobreajuste', 18]] },
  { id: 'm3', titulo: 'Aprendizaje supervisado', desc: 'Aprender de ejemplos con respuesta: regresión, clasificación, los modelos clásicos y cómo medir si funcionan.',
    lecturas: [['islp', 'caps. 3-6, 8 y 9'], ['geron', 'cap. 3 y los de entrenamiento de modelos, árboles y ensambles'], ['bishop', 'caps. 4-5'], ['esl', 'caps. 3, 4 y 7']],
    lecciones: [['m3-l1', 'Regresión lineal y descenso de gradiente', 20], ['m3-l2', 'Clasificación: regresión logística y softmax', 18], ['m3-l3', 'k-NN, árboles, ensambles y SVM', 18], ['m3-l4', 'Métricas y validación', 18], ['m3-l5', 'Regularización y preparación de datos', 14]] },
  { id: 'm4', titulo: 'Aprendizaje no supervisado', desc: 'Encontrar estructura cuando nadie da las respuestas: grupos, direcciones principales y puntos anómalos.',
    lecturas: [['islp', 'cap. 12'], ['geron', 'capítulos de reducción de dimensionalidad y de aprendizaje no supervisado'], ['esl', 'cap. 14'], ['prince', 'cap. 14']],
    lecciones: [['m4-l1', 'Agrupamiento: k-means y compañía', 18], ['m4-l2', 'Reducción de dimensionalidad: PCA, t-SNE y UMAP', 18], ['m4-l3', 'Densidad y detección de anomalías', 10]] },
  { id: 'm5', titulo: 'Semi-supervisado y auto-supervisado', desc: 'Cómo aprovechar montañas de datos sin etiquetar: la idea detrás de los modelos fundacionales actuales.',
    lecturas: [['chapelle', 'cap. 1: introducción y supuestos'], ['vanengelen', 'artículo completo'], ['goodfellow', 'cap. 15']],
    lecciones: [['m5-l1', 'Aprendizaje semi-supervisado', 20], ['m5-l2', 'Aprendizaje auto-supervisado', 16]] },
  { id: 'm6', titulo: 'Redes neuronales', desc: 'De una neurona a una red completa: activaciones, pérdidas y el algoritmo que lo hace posible, la retropropagación.',
    lecturas: [['nielsen', 'caps. 1-2'], ['prince', 'caps. 3-7'], ['goodfellow', 'cap. 6'], ['bishop', 'caps. 6-8'], ['d2l', 'caps. 3-5']],
    lecciones: [['m6-l1', 'De la neurona al perceptrón', 15], ['m6-l2', 'Funciones de activación', 12], ['m6-l3', 'El perceptrón multicapa', 18], ['m6-l4', 'Funciones de pérdida', 12], ['m6-l5', 'Retropropagación', 22], ['m6-l6', 'Una red desde cero en NumPy', 20]] },
  { id: 'm7', titulo: 'Deep learning en la práctica', desc: 'Qué hace falta para que una red profunda entrene bien: optimizadores, normalización, regularización y PyTorch.',
    lecturas: [['goodfellow', 'caps. 7-8 y 11'], ['prince', 'caps. 6-9 y 11'], ['geron', 'caps. 9-11'], ['d2l', 'caps. 6 y 12'], ['bishop', 'caps. 7 y 9']],
    lecciones: [['m7-l1', 'Qué cambia cuando la red es profunda', 12], ['m7-l2', 'Optimizadores y tasa de aprendizaje', 18], ['m7-l3', 'Inicialización, normalización y conexiones residuales', 16], ['m7-l4', 'Regularización en redes profundas', 14], ['m7-l5', 'PyTorch esencial', 20]] },
  { id: 'm8', titulo: 'Redes convolucionales (CNN)', desc: 'La arquitectura que enseñó a las máquinas a ver: convolución, pooling, arquitecturas históricas y modernas.',
    lecturas: [['goodfellow', 'cap. 9'], ['prince', 'caps. 10-11'], ['d2l', 'caps. 7-8'], ['geron', 'cap. 12'], ['bishop', 'cap. 10'], ['cs231n', 'notas de CNN']],
    lecciones: [['m8-l1', 'Por qué convoluciones', 12], ['m8-l2', 'La operación de convolución', 20], ['m8-l3', 'Pooling, campo receptivo y arquitectura', 16], ['m8-l4', 'De LeNet a ConvNeXt y los Vision Transformers', 16], ['m8-l5', 'Una CNN en PyTorch y transferencia de aprendizaje', 20]] },
  { id: 'm9', titulo: 'Secuencias, atención y Transformers', desc: 'Cómo procesan texto y series las redes: de las recurrentes a la atención y los modelos de lenguaje.',
    lecturas: [['prince', 'cap. 12'], ['bishop', 'cap. 12'], ['d2l', 'caps. 9-11'], ['goodfellow', 'cap. 10'], ['raschka', 'caps. 2-4']],
    lecciones: [['m9-l1', 'Redes recurrentes: RNN, LSTM y GRU', 12], ['m9-l2', 'Atención y Transformers', 20], ['m9-l3', 'Modelos de lenguaje y modelos fundacionales', 14]] },
  { id: 'm10', titulo: 'Modelos generativos', desc: 'Redes que crean datos nuevos: autoencoders, GAN y los modelos de difusión que generan imágenes.',
    lecturas: [['prince', 'caps. 15-18'], ['bishop', 'caps. 17-20'], ['goodfellow', 'caps. 14 y 20'], ['geron', 'capítulo de autoencoders, GAN y difusión']],
    lecciones: [['m10-l1', 'Autoencoders y VAE', 12], ['m10-l2', 'GAN, difusión y flow matching', 14]] },
  { id: 'm11', titulo: 'PINN y aprendizaje automático científico', desc: 'Redes que respetan las leyes de la física: cómo resolver ecuaciones diferenciales con una función de pérdida.',
    lecturas: [['raissi', 'artículo original'], ['karniadakis', 'revisión'], ['wang-guide', 'guía práctica'], ['brunton', 'capítulo de ML informado por la física (2.ª ed.)'], ['toscano', 'revisión reciente']],
    lecciones: [['m11-l1', 'Ecuaciones diferenciales en diez minutos', 12], ['m11-l2', 'La idea de una PINN', 22], ['m11-l3', 'Resolver una EDP y problemas inversos', 18], ['m11-l4', 'Implementación en PyTorch', 22], ['m11-l5', 'Por qué fallan las PINN y cómo entrenarlas bien', 18], ['m11-l6', 'Más allá: operadores neuronales, KAN y modelos fundacionales', 14]] },
  { id: 'm12', titulo: 'Cierre y siguientes pasos', desc: 'El tercer gran paradigma (aprendizaje por refuerzo), buenas prácticas, ética y cómo seguir aprendiendo.',
    lecturas: [['sutton', 'caps. 1, 3 y 6'], ['prince', 'caps. 19-21'], ['geron', 'cap. 19']],
    lecciones: [['m12-l1', 'Aprendizaje por refuerzo en una lección', 12], ['m12-l2', 'Buenas prácticas, ética y siguientes pasos', 12]] }
].map((m, n) => ({ ...m, n, lecciones: m.lecciones.map(([id, titulo, min]) => ({ id, titulo, min })) }));

export const LESSONS = MODULES.flatMap((m) => m.lecciones.map((l) => ({ ...l, mod: m })));
export const lessonById = (id) => LESSONS.find((l) => l.id === id);
export const moduleById = (id) => MODULES.find((m) => m.id === id);
export const neighbors = (id) => { const i = LESSONS.findIndex((l) => l.id === id); return [LESSONS[i - 1], LESSONS[i + 1]]; };
export const moduleProgress = (m, done) => m.lecciones.filter((l) => done[l.id]).length / m.lecciones.length;
