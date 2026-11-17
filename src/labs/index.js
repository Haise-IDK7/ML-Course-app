// Registro de laboratorios interactivos. Cada uno vive en su archivo y se carga solo cuando hace falta.
import { h } from '../core/dom.js';

export const LABS = [
  { id: 'ajuste', titulo: 'Subajuste y sobreajuste', desc: 'Cambia el grado de un polinomio y mira cómo divergen el error de entrenamiento y el de prueba.', leccion: 'm2-l4' },
  { id: 'regresion-gd', titulo: 'Regresión lineal por descenso de gradiente', desc: 'Sigue la bajada por la superficie de pérdida y descubre qué pasa con una tasa de aprendizaje demasiado alta.', leccion: 'm3-l1' },
  { id: 'softmax', titulo: 'Softmax y entropía cruzada', desc: 'Convierte puntuaciones en probabilidades y mide cuánto «castiga» la pérdida un error confiado.', leccion: 'm3-l2' },
  { id: 'knn', titulo: 'k vecinos más cercanos', desc: 'Mueve k y observa cómo la frontera de decisión pasa de irregular a suave.', leccion: 'm3-l3' },
  { id: 'metricas', titulo: 'Umbral, matriz de confusión y curva ROC', desc: 'Desplaza el umbral de decisión y mira cómo se intercambian precisión y exhaustividad.', leccion: 'm3-l4' },
  { id: 'kmeans', titulo: 'k-means paso a paso', desc: 'Alterna asignación y actualización de centroides hasta que el algoritmo converge.', leccion: 'm4-l1' },
  { id: 'pca', titulo: 'PCA: la dirección de máxima varianza', desc: 'Gira un eje sobre una nube de puntos y encuentra la primera componente principal.', leccion: 'm4-l2' },
  { id: 'semi', titulo: 'Propagación de etiquetas', desc: 'Con solo unas pocas etiquetas, deja que la estructura de los datos haga el resto.', leccion: 'm5-l1' },
  { id: 'neurona', titulo: 'Una neurona artificial', desc: 'Ajusta pesos y sesgo y mira qué regiones del plano activa una sola neurona.', leccion: 'm6-l1' },
  { id: 'activaciones', titulo: 'Funciones de activación', desc: 'Compara cada función con su derivada y localiza dónde se satura.', leccion: 'm6-l2' },
  { id: 'red', titulo: 'Red neuronal en vivo', desc: 'Entrena un perceptrón multicapa en tu navegador y mira cómo dobla la frontera de decisión.', leccion: 'm6-l3' },
  { id: 'backprop', titulo: 'Retropropagación paso a paso', desc: 'Recorre el grafo de cómputo hacia delante y hacia atrás aplicando la regla de la cadena.', leccion: 'm6-l5' },
  { id: 'optimizadores', titulo: 'Carrera de optimizadores', desc: 'SGD, momento, RMSProp y Adam bajando por la misma superficie.', leccion: 'm7-l2' },
  { id: 'convolucion', titulo: 'La convolución, celda a celda', desc: 'Desliza un filtro sobre una imagen y calcula cada valor del mapa de características.', leccion: 'm8-l2' },
  { id: 'cnn', titulo: 'Qué ve una capa convolucional', desc: 'Dibuja un trazo y observa los mapas de características tras convolución, ReLU y pooling.', leccion: 'm8-l3' },
  { id: 'atencion', titulo: 'Autoatención en miniatura', desc: 'Mueve los vectores de las palabras y mira cómo cambian los pesos de atención.', leccion: 'm9-l2' },
  { id: 'pinn', titulo: 'PINN en vivo: oscilador amortiguado', desc: 'Compara una red entrenada solo con datos con otra que además debe cumplir la ecuación diferencial.', leccion: 'm11-l2' },
  { id: 'pinn-calor', titulo: 'PINN en vivo: ecuación del calor', desc: 'Resuelve una ecuación en derivadas parciales sin un solo dato en el interior del dominio.', leccion: 'm11-l3' }
];

const loaders = import.meta.glob('./lab-*.js');

export async function mountLab(root, id, { link = true } = {}) {
  const meta = LABS.find((l) => l.id === id);
  root.textContent = '';
  root.append(h('div', { class: 'lab-head' },
    h('span', { class: 'kind' }, 'Laboratorio'),
    h('h4', {}, meta ? meta.titulo : id),
    link && meta ? h('a', { href: `#/lab/${id}` }, 'Abrir en grande') : null));
  const load = loaders[`./lab-${id}.js`];
  if (!load) { root.append(h('p', { class: 'lab-foot' }, `Laboratorio «${id}» no encontrado.`)); return; }
  try { (await load()).default(root); }
  catch (err) { console.error(err); root.append(h('p', { class: 'lab-foot' }, `No se pudo cargar el laboratorio: ${err.message}`)); }
}
