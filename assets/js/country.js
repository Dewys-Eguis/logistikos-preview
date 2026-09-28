(function () {
  "use strict";

  // Selector visual de país. Por ahora no modifica contenido, rutas ni preferencias.
  function closePickers(except) {
    document.querySelectorAll("[data-country-picker]").forEach((picker) => {
      if (picker === except) return;
      picker.dataset.open = "false";
      const trigger = picker.querySelector("[data-country-trigger]");
      const menu = picker.querySelector("[data-country-menu]");
      if (trigger) trigger.setAttribute("aria-expanded", "false");
      if (menu) menu.hidden = true;
    });
  }

  function togglePicker(picker) {
    if (!picker) return;
    const trigger = picker.querySelector("[data-country-trigger]");
    const menu = picker.querySelector("[data-country-menu]");
    if (!trigger || !menu) return;

    const willOpen = picker.dataset.open !== "true";
    closePickers(picker);
    picker.dataset.open = willOpen ? "true" : "false";
    trigger.setAttribute("aria-expanded", willOpen ? "true" : "false");
    menu.hidden = !willOpen;
  }

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest?.("[data-country-trigger]");
    if (trigger) {
      event.preventDefault();
      togglePicker(trigger.closest("[data-country-picker]"));
      return;
    }

    const option = event.target.closest?.("[data-country-value]");
    if (option) {
      // Visual solamente: no cambia país, contenido, rutas ni almacenamiento.
      event.preventDefault();
      closePickers();
      return;
    }

    if (!event.target.closest?.("[data-country-picker]")) closePickers();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const open = document.querySelector('[data-country-picker][data-open="true"]');
      if (open) {
        const trigger = open.querySelector("[data-country-trigger]");
        closePickers();
        trigger?.focus();
      }
    }
  });
})();
