"use strict";
// Kit and subscription confirmations are prototype-only: no backend is connected.
function getFormValues() {
  const st = this.state;
  const kit = {
    kitEmail: st.kitEmail,
    kitSent: st.kitSent,
    kitPending: !st.kitSent,
    kitError: st.kitError,
    onKitEmail: (e) =>
      this.setState({ kitEmail: e.target.value, kitError: "" }),
    onKitSend: () => {
      const v = (st.kitEmail || "").trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) {
        this.setState({ kitError: "Introduce un email de trabajo válido." });
        return;
      }
      this.setState({ kitSent: true, kitError: "" });
    },
    onKitReset: () => this.setState({ kitSent: false, kitEmail: "" }),
  };
  return kit;
}
document.addEventListener("click", function (e) {
  var os = e.target.closest("[data-otro-send]");
  if (os) {
    var t = document.getElementById("otro-texto"),
      m = document.getElementById("otro-msg");
    var v = ((t && t.value) || "").trim();
    if (!v) {
      m.dataset.tone = "error";
      m.textContent = "Escribe tu perfil o lo que necesitas.";
      t.focus();
      return;
    }
    m.dataset.tone = "muted";
    m.textContent =
      "Te abrimos WhatsApp con tu mensaje para que te atendamos directamente.";
    window.open(
      "https://wa.me/34696348047?text=" +
        encodeURIComponent(
          "Hola, soy " + v + ". Me gustaría información sobre formación.",
        ),
      "_blank",
      "noopener",
    );
    return;
  }
  var sb = e.target.closest("[data-subscribe]");
  if (sb) {
    var em = document.getElementById("sub-email"),
      msg = document.getElementById("sub-msg");
    var v = ((em && em.value) || "").trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) {
      msg.textContent = "Introduce un email de trabajo válido.";
      msg.dataset.tone = "warning";
      em.focus();
      return;
    }
    msg.dataset.tone = "light";
    msg.textContent = "Hecho. Recibirás Logístikos al día en " + v + ".";
    em.value = "";
    return;
  }
});
document.addEventListener("submit", function (e) {
  if (e.target && e.target.id === "login-form") {
    e.preventDefault();
    var u = document.getElementById("login-user"),
      p = document.getElementById("login-pass"),
      m = document.getElementById("login-msg");
    if (!u.value.trim() || !p.value) {
      m.dataset.tone = "error";
      m.textContent = "Introduce tu usuario y tu contraseña.";
      (u.value.trim() ? p : u).focus();
      return;
    }
    p.value = "";
    m.dataset.tone = "ink";
    m.textContent =
      "El acceso al campus estará disponible en breve. Si necesitas entrar ahora, escríbenos a formacion@logistikos.es.";
  }
});

document.addEventListener("submit", function (e) {
  if (!e.target || e.target.id !== "talent-form") return;
  e.preventDefault();
  var form = e.target;
  var status = document.getElementById("talent-form-status");
  var required = Array.from(form.querySelectorAll("[required]"));
  var missing = required.find(function (field) { return !String(field.value || "").trim(); });
  if (missing) {
    status.textContent = "Completa los campos obligatorios para preparar la solicitud.";
    status.dataset.tone = "warning";
    missing.focus();
    return;
  }
  var values = Object.fromEntries(new FormData(form).entries());
  var body = [
    "Hola Logístikos, quiero consultar una necesidad de Talento Internacional:",
    "",
    "Empresa: " + values.empresa,
    "Puesto: " + values.puesto,
    "Número de personas: " + values.personas,
    "Ubicación: " + values.ubicacion,
    "Turnos: " + values.turnos,
    "Contacto: " + values.contacto,
    "",
    "Quedo atento/a para revisar los siguientes pasos."
  ].join("\n");
  status.textContent = "Solicitud preparada. Se abrirá WhatsApp con los datos de tu vacante.";
  status.dataset.tone = "light";
  window.open(
    "https://wa.me/34696348047?text=" + encodeURIComponent(body),
    "_blank",
    "noopener"
  );
});
