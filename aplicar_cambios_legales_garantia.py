from pathlib import Path
import json
import re

ROOT = Path.cwd()


def require(rel):
    p = ROOT / rel
    if not p.exists():
        raise RuntimeError(f"No se encontro {rel}. Ejecuta este script dentro de Logistikos_FINAL_GITHUB.")
    return p


def read(rel):
    return require(rel).read_text(encoding="utf-8")


def write(rel, content):
    p = require(rel)
    p.write_text(content, encoding="utf-8")


def replace_once(text, old, new, label):
    if new in text:
        return text
    if old not in text:
        raise RuntimeError(f"No se encontro el punto esperado para: {label}")
    return text.replace(old, new, 1)

print("Aplicando cambios legales y Garantia 60 dias...")

# 0) Verificar archivos nuevos copiados
for rel in [
    "pages/aviso-legal.html",
    "pages/politica-privacidad.html",
    "pages/politica-cookies.html",
    "assets/css/legal.css",
    "assets/js/cookies-consent.js",
    "assets/docs/garantia-60-dias-logistikos.pdf",
]:
    require(rel)

# 1) Manifest: nuevas paginas fuera del menu principal
manifest_path = require("pages/manifest.json")
manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
entries = {
    "tpl-page-aviso-legal": "pages/aviso-legal.html",
    "tpl-page-politica-privacidad": "pages/politica-privacidad.html",
    "tpl-page-politica-cookies": "pages/politica-cookies.html",
}
ids = {item.get("id") for item in manifest}
for template_id, file_path in entries.items():
    if template_id not in ids:
        manifest.append({"id": template_id, "file": file_path})
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("[OK] Paginas legales registradas")

# 2) Layout: CSS, footer legal, JS cookies
layout = read("pages/layout.html")
if 'assets/css/legal.css' not in layout:
    layout = layout.replace(
        '    <link rel="stylesheet" href="assets/css/diagnostico.css" />',
        '    <link rel="stylesheet" href="assets/css/diagnostico.css" />\n    <link rel="stylesheet" href="assets/css/legal.css" />',
        1,
    )

old_footer = '<div class="site-footer-bottom"><span>© 2026 Logístikos</span><span class="footer-legal-pending">Aviso legal · Privacidad · Cookies <small>pendiente de textos definitivos</small></span><a href="mailto:formacion@logistikos.es?subject=Consulta%20legal%20o%20de%20privacidad">Consultas legales</a><a href="#top">Volver arriba ↑</a></div>'
new_footer = '<div class="site-footer-bottom"><span>© 2026 Logístikos</span><a href="#/aviso-legal">Aviso legal</a><a href="#/politica-privacidad">Política de privacidad</a><a href="#/politica-cookies">Política de cookies</a><button type="button" class="footer-cookie-settings" data-cookie-settings>Configurar cookies</button><a href="#top">Volver arriba ↑</a></div>'
if new_footer not in layout:
    if old_footer not in layout:
        # fallback if footer text has changed slightly
        layout, count = re.subn(r'<div class="site-footer-bottom">.*?</div>\s*</footer>', new_footer + '\n    </footer>', layout, count=1, flags=re.S)
        if count != 1:
            raise RuntimeError("No se pudo actualizar el pie legal en pages/layout.html")
    else:
        layout = layout.replace(old_footer, new_footer, 1)

if 'assets/js/cookies-consent.js' not in layout:
    layout = layout.replace(
        '    <script defer src="assets/js/diagnostico.js"></script>\n    <script defer src="assets/js/main.js"></script>',
        '    <script defer src="assets/js/diagnostico.js"></script>\n    <script defer src="assets/js/cookies-consent.js"></script>\n    <script defer src="assets/js/main.js"></script>',
        1,
    )
write("pages/layout.html", layout)
print("[OK] Footer, CSS legal y gestor de cookies")

# 3) Titulos de rutas legales
main = read("assets/js/main.js")
needle = '          diagnostico: "Diagnóstico gratuito",'
replacement = '          diagnostico: "Diagnóstico gratuito",\n          "aviso-legal": "Aviso legal",\n          "politica-privacidad": "Política de privacidad",\n          "politica-cookies": "Política de cookies",'
if '"aviso-legal": "Aviso legal"' not in main:
    if needle not in main:
        raise RuntimeError("No se encontro el mapa de titulos en assets/js/main.js")
    main = main.replace(needle, replacement, 1)
write("assets/js/main.js", main)
print("[OK] Rutas legales")

# 4) Garantia: texto profesional + naranja en todos los lugares relevantes
for rel in ["pages/a-medida.html", "pages/quienes-somos.html", "pages/partials/home-cases-faq.html"]:
    html = read(rel)
    html = re.sub(
        r'(<a class="guarantee-pdf-link"[^>]*>)Descargar PDF(\s*<span[^>]*>↗</span></a>)',
        r'\1Descargar garantía\2',
        html,
    )
    write(rel, html)
print("[OK] Garantia 60 dias: descarga y texto")

# 5) Diagnostico: privacidad obligatoria, comunicaciones opcional, informacion basica
path = "pages/diagnostico.html"
html = read(path)
legal_diag = '''          <div class="legal-form-consent" data-legal-consent>
            <label class="legal-check"><input type="checkbox" name="privacidad" value="aceptada" required><span>He leído y acepto la <a href="#/politica-privacidad">Política de privacidad</a>. *</span></label>
            <label class="legal-check"><input type="checkbox" name="comunicaciones" value="si"><span>Quiero recibir información sobre formaciones, webinars y eventos de Logístikos.</span></label>
            <p class="legal-basic-info"><strong>Información básica sobre protección de datos.</strong> Responsable: Javier Fernández Díez de los Ríos (Logístikos). Finalidad: atender tu solicitud y, si lo autorizas, enviarte información de nuestras formaciones. Legitimación: tu consentimiento. Destinatarios: no se ceden datos a terceros salvo obligación legal. Derechos: acceso, rectificación, supresión y otros, escribiendo a <a href="mailto:formacion@logistikos.es">formacion@logistikos.es</a>. Más información en nuestra <a href="#/politica-privacidad">Política de privacidad</a>.</p>
          </div>
'''
if 'data-legal-consent' not in html:
    marker = '          <div class="diagnostic-form-status" data-diagnostic-status aria-live="polite"></div>'
    if marker not in html:
        raise RuntimeError("No se encontro el punto legal del formulario de diagnostico")
    html = html.replace(marker, legal_diag + marker, 1)
# replace old vague note with a shorter operational note
html = html.replace('<p class="diagnostic-form-note">Sus datos se utilizarán únicamente para elaborar el diagnóstico y contactar con usted.</p>', '<p class="diagnostic-form-note">La aceptación de la política de privacidad es obligatoria para enviar la solicitud.</p>')
write(path, html)
print("[OK] Formulario diagnostico")

# 6) Webinar: sustituir consentimiento generico por bloque legal completo
path = "pages/webinar.html"
html = read(path)
legal_webinar = '''        <div class="legal-form-consent" data-legal-consent>
          <label class="legal-check"><input type="checkbox" name="privacidad" value="aceptada" required><span>He leído y acepto la <a href="#/politica-privacidad">Política de privacidad</a>. *</span></label>
          <label class="legal-check"><input type="checkbox" name="comunicaciones" value="si"><span>Quiero recibir información sobre formaciones, webinars y eventos de Logístikos.</span></label>
          <p class="legal-basic-info"><strong>Información básica sobre protección de datos.</strong> Responsable: Javier Fernández Díez de los Ríos (Logístikos). Finalidad: gestionar tu inscripción y, si lo autorizas, enviarte información de nuestras formaciones. Legitimación: tu consentimiento. Destinatarios: no se ceden datos a terceros salvo obligación legal. Derechos: acceso, rectificación, supresión y otros, escribiendo a <a href="mailto:formacion@logistikos.es">formacion@logistikos.es</a>. Más información en nuestra <a href="#/politica-privacidad">Política de privacidad</a>.</p>
        </div>'''
if 'data-legal-consent' not in html:
    old = '<label class="webinar-consent"><input type="checkbox" name="consentimiento" required><span>Acepto que Logístikos utilice estos datos para gestionar mi inscripción y enviarme la información de acceso.</span></label>'
    if old not in html:
        raise RuntimeError("No se encontro el consentimiento actual del webinar")
    html = html.replace(old, legal_webinar, 1)
write(path, html)
print("[OK] Formulario webinar")

# 7) Talento Internacional: también queda cubierto legalmente
path = "pages/talento-internacional.html"
html = read(path)
legal_talent = '''        <div class="legal-form-consent" data-legal-consent>
          <label class="legal-check"><input type="checkbox" name="privacidad" value="aceptada" required><span>He leído y acepto la <a href="#/politica-privacidad">Política de privacidad</a>. *</span></label>
          <label class="legal-check"><input type="checkbox" name="comunicaciones" value="si"><span>Quiero recibir información sobre formaciones, webinars y eventos de Logístikos.</span></label>
          <p class="legal-basic-info"><strong>Información básica sobre protección de datos.</strong> Responsable: Javier Fernández Díez de los Ríos (Logístikos). Finalidad: atender tu solicitud y, si lo autorizas, enviarte información de nuestras formaciones. Legitimación: tu consentimiento. Destinatarios: no se ceden datos a terceros salvo obligación legal. Derechos: acceso, rectificación, supresión y otros, escribiendo a <a href="mailto:formacion@logistikos.es">formacion@logistikos.es</a>. Más información en nuestra <a href="#/politica-privacidad">Política de privacidad</a>.</p>
        </div>
'''
if 'data-legal-consent' not in html:
    marker = '        <div class="talent-form-footer">'
    if marker not in html:
        raise RuntimeError("No se encontro el punto legal del formulario de Talento Internacional")
    html = html.replace(marker, legal_talent + marker, 1)
html = html.replace('<p class="talent-form-note">Al enviar, Logístikos recibirá los datos de tu solicitud para contactar contigo y revisar los siguientes pasos.</p>', '<p class="talent-form-note">La aceptación de la política de privacidad es obligatoria para enviar la solicitud.</p>')
write(path, html)
print("[OK] Formulario Talento Internacional")

# 8) Reforzar destino de Garantia 60 dias en header/footer actual
layout = read("pages/layout.html")
layout = layout.replace('href="#/a-medida#garantia">Garantía 60 días</a>', 'href="#/a-medida#garantia">Garantía 60 días</a>')
write("pages/layout.html", layout)

print("\nCAMBIOS APLICADOS CORRECTAMENTE")
print("Ahora ejecuta: npm run build")
print("Despues revisa las paginas legales, banner, formularios y la descarga de garantia antes de hacer git add.")
