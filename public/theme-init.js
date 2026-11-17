// Aplica el tema guardado antes de pintar, para evitar parpadeo.
(function () {
  var t = 'light';
  try {
    var s = JSON.parse(localStorage.getItem('mlc:v1') || '{}');
    t = s.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  } catch (e) { /* almacenamiento no disponible: tema claro */ }
  document.documentElement.dataset.theme = t;
})();
