"use strict";
const DOWNLOAD_FILES = [
  "KIT-01_Deteccion_necesidades_formativas.xlsx",
  "KIT-02_Plan_anual_formacion.xlsx",
  "KIT-03_Matriz_competencias_logistica.xlsx",
  "KIT-04_Checklist_documental_FUNDAE.pdf",
  "KIT-05_Registro_alfabetizacion_IA.xlsx",
  "KIT-06_Impacto_ROI_y_guia.zip",
  "Kit_RRHH_Logistikos.zip",
];
let localDownloadData;
function loadLocalDownloadData() {
  if (!localDownloadData)
    localDownloadData = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "assets/js/generated/download-data.js";
      script.onload = () => resolve(window.LOGISTIKOS_DOWNLOAD_DATA);
      script.onerror = () => {
        localDownloadData = null;
        script.remove();
        reject(new Error("Download data unavailable"));
      };
      document.head.appendChild(script);
    });
  return localDownloadData;
}
async function download(name) {
  if (!DOWNLOAD_FILES.includes(name)) {
    toast("Archivo no disponible.");
    return;
  }
  // Browsers do not reliably honor download for file:// URLs. Load the generated
  // compatibility payload only when needed; production uses real binary files.
  if (location.protocol === "file:" || window.claude?.use) {
    try {
      const files = await loadLocalDownloadData();
      const blob = new Blob([
        Uint8Array.from(atob(files[name]), (c) => c.charCodeAt(0)),
      ]);
      const service = window.claude?.use
        ? await window.claude.use("downloads")
        : null;
      if (service) {
        await service.save({ filename: name, data: blob });
        return;
      }
      const url = URL.createObjectURL(blob);
      saveDownload(url, name);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      toast("Descarga lista: " + name);
    } catch (error) {
      if (error.code === "declined") return;
      toast(
        error.code === "rate_limited"
          ? "Ya hay una descarga pendiente de confirmar."
          : "No se ha podido descargar el archivo.",
      );
    }
    return;
  }
  saveDownload("kit-rrhh/" + encodeURIComponent(name), name);
}
function saveDownload(url, name) {
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
function toast(message) {
  const node = document.getElementById("toast");
  node.textContent = message;
  node.classList.add("is-visible");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove("is-visible"), 3500);
}
