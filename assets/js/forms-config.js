(function(){
  "use strict";
  // CAMBIAR SOLO ESTE VALOR cuando Render entregue la URL publica del backend.
  // Ejemplo: https://logistikos-form-api.onrender.com
  var API_BASE = "https://logistikos-form-api.onrender.com";
  API_BASE = API_BASE.replace(/\/$/, "");
  window.LOGISTIKOS_FORMS = {
    diagnostico: { endpoint: API_BASE ? API_BASE + "/api/diagnostico" : "", method: "POST" },
    webinar: { endpoint: API_BASE ? API_BASE + "/api/webinar" : "", method: "POST" },
    talento: { endpoint: API_BASE ? API_BASE + "/api/talento" : "", method: "POST" }
  };
})();
