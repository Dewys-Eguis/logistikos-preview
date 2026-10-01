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
      window.open(
        "https://wa.me/34696348047?text=" +
          encodeURIComponent(
            "Hola Logístikos, quiero recibir el Kit RRHH completo. Mi email de trabajo es: " + v,
          ),
        "_blank",
        "noopener",
      );
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
    msg.textContent = "Suscripción preparada. Se abrirá WhatsApp con tu email para confirmar el alta.";
    window.open(
      "https://wa.me/34696348047?text=" +
        encodeURIComponent(
          "Hola Logístikos, quiero suscribirme a Logístikos al día. Mi email de trabajo es: " + v,
        ),
      "_blank",
      "noopener",
    );
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
    m.dataset.tone = "error";
    m.textContent =
      "No hemos podido validar esas credenciales en esta vista. Revisa los datos o solicita ayuda a formacion@logistikos.es.";
  }
});

document.addEventListener("submit", async function (e) {
  if (!e.target || e.target.id !== "talent-form") return;
  e.preventDefault();
  var form = e.target;
  var status = document.getElementById("talent-form-status");
  var button = form.querySelector('button[type="submit"]');
  if (!form.checkValidity()) {
    status.textContent = "Completa los campos obligatorios para preparar la solicitud.";
    status.dataset.tone = "warning";
    form.reportValidity();
    return;
  }
  var config = window.LOGISTIKOS_FORMS && window.LOGISTIKOS_FORMS.talento;
  if (!config || !config.endpoint) {
    status.textContent = "Formulario preparado. Falta activar el servicio de envío.";
    status.dataset.tone = "warning";
    return;
  }
  var values = Object.fromEntries(new FormData(form).entries());
  if (button) button.disabled = true;
  status.textContent = "Enviando solicitud…";
  status.dataset.tone = "light";
  try {
    var response = await fetch(config.endpoint, {
      method: config.method || "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    var result = await response.json().catch(function () { return {}; });
    if (!response.ok) throw new Error(result.error || ("HTTP " + response.status));
    form.reset();
    status.textContent = "Solicitud enviada correctamente. Logístikos ha recibido los datos de tu necesidad.";
    status.dataset.tone = "light";
  } catch (error) {
    status.textContent = "No hemos podido enviar la solicitud. Inténtalo de nuevo.";
    status.dataset.tone = "warning";
  } finally {
    if (button) button.disabled = false;
  }
});
