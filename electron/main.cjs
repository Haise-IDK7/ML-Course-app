// Proceso principal de la app de escritorio. Sirve la carpeta dist/ con un protocolo propio (app://curso/),
// de modo que el origen es estable y el progreso guardado no se pierde entre ejecuciones.
const { app, BrowserWindow, protocol, net, shell, session } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const DIST = path.join(__dirname, '..', 'dist');
const ORIGIN = 'app://curso';

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true, allowServiceWorkers: true } }
]);

function createWindow() {
  const win = new BrowserWindow({
    width: 1360, height: 900, minWidth: 720, minHeight: 520,
    backgroundColor: '#f3f5f8',
    title: 'Curso ML',
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
  });

  // Enlaces externos: en el navegador del sistema. Los PDF del curso: en una ventana propia.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(ORIGIN)) return { action: 'allow', overrideBrowserWindowOptions: { width: 1000, height: 860, autoHideMenuBar: true } };
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith(ORIGIN)) { e.preventDefault(); if (/^https?:/.test(url)) shell.openExternal(url); } });

  win.loadURL(`${ORIGIN}/index.html`);

  // Modo de comprobación para CI: carga la app, cuenta los módulos y sale.
  if (process.env.MLC_SMOKE) {
    win.webContents.once('did-finish-load', async () => {
      const n = await win.webContents.executeJavaScript("new Promise(r => setTimeout(() => r(document.querySelectorAll('.route li').length), 1500))");
      console.log(`SMOKE modulos=${n}`);
      app.exit(n > 0 ? 0 : 1);
    });
  }
}

app.whenReady().then(() => {
  protocol.handle('app', (request) => {
    const { pathname } = new URL(request.url);
    const file = path.normalize(path.join(DIST, decodeURIComponent(pathname === '/' ? '/index.html' : pathname)));
    if (!file.startsWith(DIST)) return new Response('Ruta no permitida', { status: 403 });
    return net.fetch(pathToFileURL(file).toString());
  });

  // YouTube exige que el reproductor incrustado se identifique con una cabecera Referer.
  session.defaultSession.webRequest.onBeforeSendHeaders({ urls: ['https://*.youtube.com/*', 'https://*.youtube-nocookie.com/*'] }, (details, callback) => {
    details.requestHeaders.Referer = 'https://haise-idk7.github.io/';
    callback({ requestHeaders: details.requestHeaders });
  });

  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
