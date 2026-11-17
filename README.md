# Curso ML

Curso interactivo en español para entender, desde los fundamentos, el **machine learning**, las **redes neuronales**, el **deep learning**, las **redes convolucionales (CNN)** y las **redes informadas por la física (PINN)**. Es una aplicación de escritorio (Windows, Linux, macOS) que también funciona en el navegador.

## Descargar

| Sistema | Archivo | Qué es |
|---|---|---|
| **Windows** | [**Curso-ML-Instalador.exe**](https://github.com/Haise-IDK7/ML-Course-app/releases/latest/download/Curso-ML-Instalador.exe) | Instalador: crea el acceso directo en el menú Inicio |
| **Windows** | [Curso-ML-Portable.exe](https://github.com/Haise-IDK7/ML-Course-app/releases/latest/download/Curso-ML-Portable.exe) | Portable: se ejecuta con doble clic, sin instalar |
| Linux | [Curso-ML.AppImage](https://github.com/Haise-IDK7/ML-Course-app/releases/latest/download/Curso-ML.AppImage) | Dale permiso de ejecución y ábrelo |
| macOS | [Curso-ML.dmg](https://github.com/Haise-IDK7/ML-Course-app/releases/latest/download/Curso-ML.dmg) | Arrastra la app a Aplicaciones |

Los enlaces apuntan siempre a la última versión publicada en [Releases](https://github.com/Haise-IDK7/ML-Course-app/releases).

**En Windows:** descarga el instalador, ábrelo y sigue los pasos. Como el archivo no está firmado digitalmente, Windows mostrará el aviso «Windows protegió su PC»: pulsa **Más información** y luego **Ejecutar de todas formas**. Tu progreso se guarda en tu equipo y se conserva al actualizar.

## Qué incluye

- **48 lecciones en 13 módulos**, con cada término definido la primera vez que aparece, ejemplos resueltos paso a paso y un resumen al final.
- **18 laboratorios interactivos** que funcionan sin conexión: descenso de gradiente, sobreajuste, k-NN, métricas y curva ROC, k-means, PCA, propagación de etiquetas, una neurona, funciones de activación, una red neuronal que entrena en vivo, retropropagación paso a paso, optimizadores, convolución celda a celda, mapas de características de una CNN, autoatención, y dos PINN que se entrenan en el navegador (oscilador amortiguado y ecuación del calor).
- **12 programas Python** probados (NumPy, scikit-learn, PyTorch). Los que no usan PyTorch se ejecutan y editan dentro de la app.
- **Evaluación:** 176 preguntas con explicación, examen por módulo, examen final, 9 retos de código con corrección automática y tarjetas de repaso espaciado.
- **Glosario** de 154 términos con su nombre en inglés y definiciones emergentes dentro de las lecciones.
- **Guías en PDF** de cada módulo (`public/pdf/`), **biblioteca** de libros, cursos, videos y artículos, buscador, apuntes por lección, tema claro y oscuro, y seguimiento del progreso con copia de seguridad.

### Plan de estudios

| Módulo | Tema |
|---|---|
| 0 | Bienvenida |
| 1 | Fundamentos matemáticos y Python |
| 2 | Qué es el machine learning |
| 3 | Aprendizaje supervisado |
| 4 | Aprendizaje no supervisado |
| 5 | Semi-supervisado y auto-supervisado |
| 6 | Redes neuronales |
| 7 | Deep learning en la práctica |
| 8 | Redes convolucionales (CNN) |
| 9 | Secuencias, atención y Transformers |
| 10 | Modelos generativos |
| 11 | PINN y aprendizaje automático científico |
| 12 | Aprendizaje por refuerzo, buenas prácticas y siguientes pasos |

## Cómo usarla

### Opción A: descargar el instalador

Usa los enlaces de la sección [Descargar](#descargar). Es la forma recomendada: no necesitas instalar nada más.

Los instaladores los genera el flujo **App de escritorio** de GitHub Actions cada vez que se publica una etiqueta `vX.Y.Z`, y quedan adjuntos a esa versión en Releases.

### Opción B: ejecutarla desde el código

Necesitas [Node.js](https://nodejs.org/) 20 o posterior.

```bash
git clone https://github.com/Haise-IDK7/ML-Course-app.git
cd ML-Course-app
npm install
npm run desktop      # compila y abre la app de escritorio
```

Para generar tú mismo el instalador de Windows: `npm run dist:win` (el resultado queda en `release/`).

### Opción C: en el navegador

```bash
npm run dev          # servidor de desarrollo en http://localhost:5173
```

El flujo **Versión web** publica la app en GitHub Pages en cada cambio de `main`. Actívalo una vez en *Settings > Pages > Source: GitHub Actions*. Desde Chrome o Edge se puede instalar como aplicación (PWA) y usar sin conexión.

## Qué necesita conexión a internet

| Función | Sin conexión |
|---|---|
| Lecciones, laboratorios, exámenes, glosario, PDF | Sí |
| Ejecutar Python dentro de la app | No la primera vez: descarga el intérprete (Pyodide) y los paquetes; después quedan en caché |
| Videos | No: son de YouTube |

## El código Python

Está en `python/`. Para ejecutarlo en tu PC:

```bash
cd python
pip install -r requirements.txt
python 11_pinn_oscilador.py
```

Probado con Python 3.13, NumPy 2.5, scikit-learn 1.9, Matplotlib 3.11 y PyTorch 2.15. Los programas `09` a `12` usan PyTorch y solo se ejecutan así; no necesitan GPU y tardan menos de un minuto.

## Desarrollo

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga |
| `npm run build` | Compila a `dist/` |
| `npm test` | Pruebas numéricas y de integridad del contenido |
| `npm run pdf` | Regenera las guías PDF (necesita Chrome o Chromium) |
| `npm run desktop` | Compila y abre la app con Electron |
| `npm run dist` | Genera el instalador para tu sistema |

### Estructura

```
src/content/      una lección por archivo Markdown (m6-l5.md = módulo 6, lección 5)
src/data/         plan de estudios, glosario, preguntas, retos y bibliografía
src/labs/         un archivo por laboratorio interactivo
src/lib/          red neuronal y motor de PINN escritos a mano, sin dependencias
src/core/         render de Markdown, glosario emergente, ejecución de Python, diagramas
src/views/        pantallas de la app
python/           programas del curso
electron/         proceso principal de la app de escritorio
scripts/          generación de los PDF
tests/            pruebas
```

### Añadir o editar una lección

1. Edita o crea `src/content/<id>.md`. Si es nueva, añádela en `src/data/curriculum.js`.
2. Además de Markdown y fórmulas (`$...$`, `$$...$$`), dispones de:
   - recuadros: `::: def Título`, `::: idea`, `::: ojo`, `::: ejemplo`, `::: reciente`, `::: resumen`, cerrados con `:::`;
   - `@lab(id)` para insertar un laboratorio, `@fig(id | pie)` para un diagrama, `@py(archivo.py)` para un programa (añade `| norun` si usa PyTorch) y `@video(idDeYouTube | título | autor)`.
3. Añade sus preguntas en `src/data/quiz.js` y ejecuta `npm test`: comprueba que todo lo referenciado existe y que las fórmulas son válidas.

## Cómo se verificó

- Los gradientes de la red neuronal y del motor de PINN de los laboratorios se comparan con diferencias finitas (`tests/lib.test.mjs`).
- Las soluciones de los retos de código se ejecutan contra sus pruebas, y se comprueba que la plantilla sin completar falla.
- Una prueba en navegador real abre todas las pantallas, lecciones y laboratorios y falla ante cualquier error de JavaScript (`tests/smoke_browser.py`).
- Todos los programas de `python/` se ejecutaron; las cifras que citan las lecciones son las de esas ejecuciones.

## Fuentes

El contenido se apoya en los libros de texto de referencia y en los artículos originales; la lista completa, con enlaces a las ediciones abiertas, está en la sección **Biblioteca** de la app y en `src/data/resources.js`. Entre ellos: *Deep Learning* (Goodfellow, Bengio y Courville), *Understanding Deep Learning* (Prince), *Deep Learning: Foundations and Concepts* (Bishop y Bishop), *Dive into Deep Learning* (Zhang y otros), *Hands-On Machine Learning with Scikit-Learn and PyTorch* (Géron), *An Introduction to Statistical Learning* (James y otros), y para PINN, Raissi y otros (2019), Karniadakis y otros (2021) y Wang y otros (2023).

Los recuadros «Estado del arte» reflejan la situación a noviembre de 2026 y envejecen rápido.

## Licencia

MIT. Consulta `LICENSE`.
