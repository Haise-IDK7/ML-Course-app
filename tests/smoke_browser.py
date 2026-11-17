"""Prueba de humo en un navegador real: abre todas las rutas y laboratorios y falla si hay errores de JavaScript.

Uso:  npm run build && npx vite preview --port 4173 &   y luego   python tests/smoke_browser.py [carpeta_capturas]
Requiere: pip install playwright  (usa el Chrome del sistema).
"""
import json
import re
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:4173/"
ROOT = Path(__file__).resolve().parent.parent
shots = Path(sys.argv[1]) if len(sys.argv) > 1 else None

labs = re.findall(r"\{ id: '([\w-]+)', titulo", (ROOT / "src/labs/index.js").read_text(encoding="utf8"))
lessons = re.findall(r"\['(m\d+-l\d+)',", (ROOT / "src/data/curriculum.js").read_text(encoding="utf8"))
routes = ["", "labs", "evaluacion", "examen/final", "retos", "tarjetas", "glosario", "biblioteca", "progreso"]
errors = []

with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome", headless=True)
    page = browser.new_page(viewport={"width": 1320, "height": 900})
    page.on("pageerror", lambda e: errors.append(f"pageerror @ {page.url}: {e}"))
    page.on("console", lambda m: errors.append(f"console.{m.type} @ {page.url}: {m.text}") if m.type == "error" and "ERR_" not in m.text and "Failed to load resource" not in m.text else None)

    def go(path, wait=350):
        page.goto(BASE + "#/" + path)
        page.wait_for_timeout(wait)

    def shot(name):
        if shots:
            shots.mkdir(parents=True, exist_ok=True)
            page.screenshot(path=str(shots / f"{name}.png"))

    go("", 900); shot("inicio")
    for r in routes[1:]:
        go(r); shot(r.replace("/", "-"))
    for lid in lessons:
        go(f"leccion/{lid}", 500)
        missing = page.locator("text=todavía no tiene contenido").count() + page.locator("text=no encontrad").count()
        if missing:
            errors.append(f"contenido o recurso faltante en {lid}")
        bad_math = page.locator(".katex-error").count()
        if bad_math:
            errors.append(f"{bad_math} fórmula(s) con error de KaTeX en {lid}")
    go("leccion/m11-l2", 800); shot("leccion")
    for lab in labs:
        go(f"lab/{lab}", 500)
        if page.locator("canvas").count() == 0:
            errors.append(f"el laboratorio {lab} no dibujó ningún lienzo")
        for b in page.locator(".lab-panel button").all():   # pulsar todos los botones una vez
            b.click(); page.wait_for_timeout(60)
        for s in page.locator(".lab-panel input[type=range]").all():   # mover cada deslizador a sus extremos
            lo, hi = s.get_attribute("min"), s.get_attribute("max")
            for v in (hi, lo):
                s.evaluate("(el, v) => { el.value = v; el.dispatchEvent(new Event('input')); }", v)
                page.wait_for_timeout(40)
        for sel in page.locator(".lab-panel select").all():   # probar cada opción
            for opt in sel.locator("option").all():
                sel.select_option(opt.get_attribute("value")); page.wait_for_timeout(60)
        page.wait_for_timeout(500); shot(f"lab-{lab}")
    page.keyboard.press("Control+k"); page.keyboard.type("gradiente"); page.wait_for_timeout(200); shot("buscador")
    if page.locator(".palette li a").count() == 0:
        errors.append("el buscador no devolvió resultados para «gradiente»")
    browser.close()

print(json.dumps({"rutas": len(routes), "lecciones": len(lessons), "laboratorios": len(labs), "errores": errors}, ensure_ascii=False, indent=1))
sys.exit(1 if errors else 0)
