// Web Worker clásico: ejecuta Python con Pyodide (CPython compilado a WebAssembly).
// Pyodide y sus paquetes (NumPy, scikit-learn, Matplotlib) se descargan del CDN la primera vez; después el navegador los guarda en caché.
const VERSION = '314.0.8';
const BASE = `https://cdn.jsdelivr.net/pyodide/v${VERSION}/full/`;
let pyodide = null;
let booting = null;

const FIGS = `
def __mlc_figs():
    import sys
    if 'matplotlib' not in sys.modules:
        return []
    import io, base64
    import matplotlib.pyplot as plt
    out = []
    for n in plt.get_fignums():
        buf = io.BytesIO()
        plt.figure(n).savefig(buf, format='png', dpi=110, bbox_inches='tight')
        out.append(base64.b64encode(buf.getvalue()).decode())
    plt.close('all')
    return out
__mlc_figs()
`;

async function boot() {
  importScripts(BASE + 'pyodide.js');
  pyodide = await self.loadPyodide({ indexURL: BASE });
  pyodide.runPython(`
import os, warnings
os.environ['MPLBACKEND'] = 'AGG'
warnings.filterwarnings('ignore', message='.*non-interactive.*')
`);
}

self.onmessage = async (e) => {
  const { id, code, tests } = e.data;
  const post = (type, extra) => self.postMessage({ id, type, ...extra });
  try {
    if (!pyodide) {
      post('status', { text: 'Descargando Python (solo la primera vez, unos 10 MB)…' });
      booting ??= boot();
      await booting;
    }
    post('status', { text: 'Cargando paquetes…' });
    await pyodide.loadPackagesFromImports(code + '\n' + (tests || ''));
    post('status', { text: 'Ejecutando…' });
    pyodide.setStdout({ batched: (s) => post('out', { text: s + '\n' }) });
    pyodide.setStderr({ batched: (s) => post('out', { text: s + '\n' }) });
    const ns = pyodide.globals.get('dict')();
    await pyodide.runPythonAsync(code, { globals: ns });
    if (tests) await pyodide.runPythonAsync(tests, { globals: ns });
    const figs = pyodide.runPython(FIGS, { globals: ns });
    const images = figs.toJs();
    figs.destroy(); ns.destroy();
    post('done', { images });
  } catch (err) {
    post('error', { text: String(err && err.message ? err.message : err) });
  }
};
