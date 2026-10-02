from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent

LEGAL_BLOCK = '''
          <div class="legal-form-consent" data-legal-consent>
            <label class="legal-check legal-check--required">
              <input type="checkbox" name="privacidad" value="aceptada" required>
              <span>He leído y acepto la <a href="#/politica-privacidad">Política de privacidad</a>. <b aria-hidden="true">*</b></span>
            </label>
            <label class="legal-check">
              <input type="checkbox" name="comunicaciones" value="si">
              <span>Quiero recibir información sobre formaciones, webinars y eventos de Logístikos.</span>
            </label>
            <p class="legal-basic-info"><strong>Información básica sobre protección de datos.</strong> Responsable: Javier Fernández Díez de los Ríos (Logístikos). Finalidad: atender tu solicitud y, si lo autorizas, enviarte información de nuestras formaciones. Legitimación: tu consentimiento. Destinatarios: no se ceden datos a terceros salvo obligación legal. Derechos: acceso, rectificación, supresión y otros, escribiendo a <a href="mailto:formacion@logistikos.es">formacion@logistikos.es</a>. Más información en nuestra <a href="#/politica-privacidad">Política de privacidad</a>.</p>
          </div>
'''

CSS_MARKER = "/* LOGISTIKOS_FORMULARIOS_LEGALES_COMPLETO */"
CSS_BLOCK = r'''

/* LOGISTIKOS_FORMULARIOS_LEGALES_COMPLETO */
.legal-form-consent[data-legal-consent]{
  grid-column:1/-1;
  width:100%;
  box-sizing:border-box;
  margin:18px 0 10px;
  padding:18px 20px;
  border:1px solid rgba(148,163,184,.18);
  background:linear-gradient(135deg,rgba(10,26,51,.78),rgba(6,17,35,.7));
  box-shadow:inset 3px 0 0 rgba(255,122,26,.82);
}
.legal-check{
  display:grid!important;
  grid-template-columns:18px minmax(0,1fr);
  gap:11px;
  align-items:start;
  margin:0 0 12px!important;
  color:#c5d0e1!important;
  font-size:13px!important;
  line-height:1.55!important;
  cursor:pointer;
}
.legal-check:last-of-type{margin-bottom:14px!important}
.legal-check input[type="checkbox"]{
  appearance:auto!important;
  width:16px!important;
  height:16px!important;
  min-width:16px!important;
  margin:3px 0 0!important;
  padding:0!important;
  accent-color:#ff7a1a;
  cursor:pointer;
}
.legal-check a{color:#ff9a50!important;text-decoration:underline;text-underline-offset:3px}
.legal-check a:hover{color:#ffb47d!important}
.legal-check b{color:#ff7a1a;font-weight:800}
.legal-basic-info{
  margin:0!important;
  padding-top:13px;
  border-top:1px solid rgba(148,163,184,.12);
  color:#8594aa!important;
  font-size:11px!important;
  line-height:1.65!important;
}
.legal-basic-info strong{color:#aebbd0!important}
.legal-basic-info a{color:#aab7ca!important;text-decoration:underline;text-underline-offset:3px}
.diagnostic-form .legal-form-consent,
.webinar-form .legal-form-consent,
.talent-form .legal-form-consent,
.rrhh-formmodal__form .legal-form-consent{grid-column:1/-1!important}
@media(max-width:640px){
  .legal-form-consent[data-legal-consent]{padding:16px;margin-top:15px}
  .legal-check{font-size:12px!important;gap:10px}
  .legal-basic-info{font-size:10.5px!important}
}
'''


def path(rel):
    p = ROOT / rel
    if not p.exists():
        raise FileNotFoundError(f"No se encontró {rel}. Coloca este script en la raíz de Logistikos_FINAL_GITHUB.")
    return p


def read(rel):
    p = path(rel)
    return p, p.read_text(encoding="utf-8")


def write(p, text):
    p.write_text(text, encoding="utf-8", newline="")


def remove_legal_block(text):
    return re.sub(r'\s*<div class="legal-form-consent"[^>]*>.*?</div>\s*', '\n', text, flags=re.S)


def remove_old_webinar_consent(text):
    text = re.sub(r'\s*<label class="webinar-consent"[^>]*>.*?</label>\s*', '\n', text, flags=re.S)
    return text


def insert_before_regex(text, pattern, block, label):
    m = re.search(pattern, text, flags=re.S | re.M)
    if not m:
        raise RuntimeError(f"No se encontró el punto de inserción en {label}")
    indent = re.match(r"[ \t]*", m.group(0)).group(0)
    normalized = "\n".join((indent + line if line.strip() else line) for line in block.strip("\n").splitlines()) + "\n"
    return text[:m.start()] + normalized + text[m.start():]


def ensure_layout_css():
    p, html = read("pages/layout.html")
    if 'assets/css/legal.css' not in html:
        marker = '<link rel="stylesheet" href="assets/css/diagnostico.css" />'
        if marker not in html:
            raise RuntimeError("No se encontró dónde enlazar assets/css/legal.css en pages/layout.html")
        html = html.replace(marker, marker + '\n    <link rel="stylesheet" href="assets/css/legal.css" />', 1)
        write(p, html)
        print("[OK] Layout: legal.css enlazado")
    else:
        print("[OK] Layout: legal.css ya estaba enlazado")


def patch_diagnostico():
    p, html = read("pages/diagnostico.html")
    html = remove_legal_block(html)
    html = insert_before_regex(
        html,
        r'^[ \t]*<div class="diagnostic-form-status"[^>]*></div>',
        LEGAL_BLOCK,
        "pages/diagnostico.html",
    )
    html = re.sub(
        r'<p class="diagnostic-form-note">.*?</p>',
        '<p class="diagnostic-form-note">La aceptación de la política de privacidad es obligatoria para enviar la solicitud.</p>',
        html,
        count=1,
        flags=re.S,
    )
    write(p, html)
    print("[OK] Diagnóstico / Contacto: privacidad obligatoria + comunicaciones opcionales + información básica")


def patch_webinar():
    p, html = read("pages/webinar.html")
    html = remove_old_webinar_consent(html)
    html = remove_legal_block(html)
    html = insert_before_regex(
        html,
        r'^[ \t]*<div class="webinar-form-actions">',
        LEGAL_BLOCK,
        "pages/webinar.html",
    )
    write(p, html)
    print("[OK] Webinar: consentimiento antiguo sustituido por bloque legal completo")


def patch_talento():
    p, html = read("pages/talento-internacional.html")
    html = remove_legal_block(html)
    html = insert_before_regex(
        html,
        r'^[ \t]*<div class="talent-form-footer">',
        LEGAL_BLOCK,
        "pages/talento-internacional.html",
    )
    html = re.sub(
        r'<p class="talent-form-note">.*?</p>',
        '<p class="talent-form-note">La aceptación de la política de privacidad es obligatoria para enviar la solicitud.</p>',
        html,
        count=1,
        flags=re.S,
    )
    write(p, html)
    print("[OK] Talento Internacional: bloque legal completo")


def patch_rrhh():
    p = ROOT / "pages/rrhh.html"
    if not p.exists():
        print("[INFO] RRHH: no existe pages/rrhh.html; se omite")
        return
    html = p.read_text(encoding="utf-8")
    html = remove_legal_block(html)
    pattern = r'^[ \t]*<div class="rrhh-formmodal__status"[^>]*></div>'
    if re.search(pattern, html, flags=re.M):
        html = insert_before_regex(html, pattern, LEGAL_BLOCK, "pages/rrhh.html")
        write(p, html)
        print("[OK] Kit RRHH: privacidad obligatoria antes de abrir WhatsApp")
    else:
        print("[INFO] RRHH: no se encontró formulario modal; se omite")


def patch_css():
    p = ROOT / "assets/css/legal.css"
    p.parent.mkdir(parents=True, exist_ok=True)
    css = p.read_text(encoding="utf-8") if p.exists() else "/* Logístikos · legal */\n"
    if CSS_MARKER in css:
        css = css.split(CSS_MARKER)[0].rstrip() + "\n"
    css = css.rstrip() + CSS_BLOCK + "\n"
    write(p, css)
    print("[OK] CSS: bloque legal responsive y uniforme")


def patch_backend():
    p, js = read("form-api/server.js")

    if "function consentOk(value)" not in js:
        anchor = "function escapeHtml(value) {"
        helper = '''function consentOk(value) {\n  const normalized = text(value, 50).toLowerCase();\n  return ["aceptada", "aceptado", "si", "sí", "on", "true", "1", "accepted"].includes(normalized);\n}\n\n'''
        if anchor not in js:
            raise RuntimeError("No se encontró el punto para añadir consentOk() en form-api/server.js")
        js = js.replace(anchor, helper + anchor, 1)

    start = js.find("function diagnosticMessage(data) {")
    mid1 = js.find("function webinarMessage(data) {")
    mid2 = js.find("function talentMessage(data) {")
    end = js.find("async function sendEmail(message) {")
    if min(start, mid1, mid2, end) < 0 or not (start < mid1 < mid2 < end):
        raise RuntimeError("No se pudieron localizar las funciones de formularios en form-api/server.js")

    diag = '''function diagnosticMessage(data) {\n  const replyTo = email(data.email);\n  const required = ["nombre", "cargo", "empresa", "plantilla", "email", "problema"];\n  if (required.some((key) => !text(data[key]))) return { error: "Faltan campos obligatorios." };\n  if (!consentOk(data.privacidad)) return { error: "Debes aceptar la Politica de privacidad." };\n  if (!replyTo) return { error: "El correo electronico no es valido." };\n  return {\n    subject: `[Logistikos] Nuevo reto · ${text(data.empresa, 120)}`,\n    replyTo,\n    html: emailShell("Nuevo reto recibido", "Cuentanos tu reto · informe diagnostico en 24 h", [\n      row("Nombre y apellidos", data.nombre),\n      row("Cargo", data.cargo),\n      row("Empresa", data.empresa),\n      row("Plantilla", data.plantilla),\n      row("Email", data.email),\n      row("Telefono", data.telefono || "No indicado"),\n      row("Problema / reto", data.problema),\n      row("Origen", data.origen || "Diagnostico gratuito web Logistikos"),\n      row("Politica de privacidad", "Aceptada"),\n      row("Comunicaciones comerciales", consentOk(data.comunicaciones) ? "Autorizadas" : "No autorizadas"),\n    ]),\n  };\n}\n\n'''

    webinar = '''function webinarMessage(data) {\n  const replyTo = email(data.email);\n  const required = ["webinar", "nombre", "apellido1", "telefono", "empresa", "cargo", "email"];\n  if (required.some((key) => !text(data[key]))) return { error: "Faltan campos obligatorios." };\n  if (!consentOk(data.privacidad || data.consentimiento)) return { error: "Debes aceptar la Politica de privacidad." };\n  if (!replyTo) return { error: "El correo electronico no es valido." };\n  return {\n    subject: `[Logistikos] Inscripcion webinar · ${text(data.webinar, 140)}`,\n    replyTo,\n    html: emailShell("Nueva inscripcion a webinar", text(data.webinar, 200), [\n      row("Webinar", data.webinar),\n      row("Nombre", [data.nombre, data.apellido1, data.apellido2].filter(Boolean).join(" ")),\n      row("DNI / documento", data.dni),\n      row("Telefono", data.telefono),\n      row("Empresa", data.empresa),\n      row("Cargo", data.cargo),\n      row("Direccion personal", data.direccion),\n      row("Poblacion", data.poblacion),\n      row("Provincia", data.provincia),\n      row("Codigo postal", data.cp),\n      row("Email", data.email),\n      row("Politica de privacidad", "Aceptada"),\n      row("Comunicaciones comerciales", consentOk(data.comunicaciones) ? "Autorizadas" : "No autorizadas"),\n    ]),\n  };\n}\n\n'''

    talent = '''function talentMessage(data) {\n  const required = ["empresa", "puesto", "personas", "ubicacion", "turnos", "contacto"];\n  if (required.some((key) => !text(data[key]))) return { error: "Faltan campos obligatorios." };\n  if (!consentOk(data.privacidad)) return { error: "Debes aceptar la Politica de privacidad." };\n  const contactEmail = email(data.contacto);\n  return {\n    subject: `[Logistikos] Talento Internacional · ${text(data.empresa, 120)}`,\n    replyTo: contactEmail || undefined,\n    html: emailShell("Nueva solicitud de Talento Internacional", "Necesidad de cobertura de vacantes", [\n      row("Empresa", data.empresa),\n      row("Puesto", data.puesto),\n      row("Numero de personas", data.personas),\n      row("Ubicacion", data.ubicacion),\n      row("Turnos", data.turnos),\n      row("Contacto", data.contacto),\n      row("Politica de privacidad", "Aceptada"),\n      row("Comunicaciones comerciales", consentOk(data.comunicaciones) ? "Autorizadas" : "No autorizadas"),\n    ]),\n  };\n}\n\n'''

    js = js[:start] + diag + webinar + talent + js[end:]
    write(p, js)
    print("[OK] Backend: valida privacidad y registra consentimiento/comunicaciones en los emails")


def verify():
    checks = [
        ("pages/diagnostico.html", 'name="privacidad"', 'name="comunicaciones"'),
        ("pages/webinar.html", 'name="privacidad"', 'name="comunicaciones"'),
        ("pages/talento-internacional.html", 'name="privacidad"', 'name="comunicaciones"'),
    ]
    for rel, a, b in checks:
        _, t = read(rel)
        if a not in t or b not in t:
            raise RuntimeError(f"Verificación fallida en {rel}")
    _, server = read("form-api/server.js")
    if "consentOk(data.privacidad" not in server:
        raise RuntimeError("Verificación fallida en form-api/server.js")
    print("[OK] Verificación final superada")


print("Revisando y corrigiendo TODOS los formularios propios de Logístikos...")
ensure_layout_css()
patch_diagnostico()
patch_webinar()
patch_talento()
patch_rrhh()
patch_css()
patch_backend()
verify()
print("\nFORMULARIOS LEGALES CORREGIDOS CORRECTAMENTE")
print("Ahora ejecuta: npm run build")
print("Después revisa: Diagnóstico/Contacto, Webinar, Talento Internacional y Kit RRHH.")
print("Nota: Agendar reunión abre Calendly; su consentimiento debe configurarse dentro de Calendly.")
