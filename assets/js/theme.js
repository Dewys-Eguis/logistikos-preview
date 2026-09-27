"use strict";
(function () {
  const root = document.documentElement;

  function isLight() {
    return root.dataset.theme === "light";
  }

  function syncControls() {
    const light = isLight();
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.setAttribute("aria-pressed", String(light));
      button.setAttribute("aria-label", light ? "Cambiar a tema oscuro" : "Cambiar a tema claro");
      const label = button.querySelector(".theme-toggle-label");
      if (label) label.textContent = light ? "Oscuro" : "Claro";
    });
  }

  function setTheme(theme) {
    root.dataset.theme = theme;
    try { localStorage.setItem("logistikos-theme", theme); } catch (_) {}
    syncControls();
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-theme-toggle]");
    if (!button) return;
    setTheme(isLight() ? "dark" : "light");
  });

  document.addEventListener("DOMContentLoaded", syncControls);
  window.syncThemeControls = syncControls;
  window.addEventListener("pageshow", syncControls);
})();
