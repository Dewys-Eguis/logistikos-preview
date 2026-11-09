/**
 * Logístikos · Arquitectura de Analítica y Conversiones
 * 
 * Cumplimiento estricto de privacidad y cookies:
 * - Google Analytics 4 (GA4): requiere consentimiento de 'analytics'.
 * - LinkedIn Insight Tag y Meta Pixel: requieren consentimiento de 'marketing'.
 * - Ningún píxel o script se ejecuta sin el consentimiento previo del usuario.
 * 
 * CONFIGURACIÓN PENDIENTE (Completar con los IDs reales del cliente):
 */
(function () {
  "use strict";

  var CONFIG = {
    // Configura aquí los identificadores reales cuando sean suministrados por el cliente:
    GA4_MEASUREMENT_ID: "",      // Ej: "G-XXXXXXXXXX"
    LINKEDIN_PARTNER_ID: "",     // Ej: "1234567"
    META_PIXEL_ID: ""            // Ej: "123456789012345"
  };

  var initialized = {
    ga4: false,
    linkedin: false,
    meta: false
  };

  function getConsent() {
    return window.LOGISTIKOS_CONSENT || { necessary: true, analytics: false, marketing: false };
  }

  // Carga e inicialización de Google Analytics 4
  function initGA4() {
    if (initialized.ga4 || !CONFIG.GA4_MEASUREMENT_ID) return;
    var consent = getConsent();
    if (!consent.analytics) return;

    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(CONFIG.GA4_MEASUREMENT_ID);
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", CONFIG.GA4_MEASUREMENT_ID, {
      send_page_view: false // Gestionado por SPA router
    });

    initialized.ga4 = true;
  }

  // Carga e inicialización de LinkedIn Insight Tag
  function initLinkedIn() {
    if (initialized.linkedin || !CONFIG.LINKEDIN_PARTNER_ID) return;
    var consent = getConsent();
    if (!consent.marketing) return;

    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    window._linkedin_data_partner_ids.push(CONFIG.LINKEDIN_PARTNER_ID);

    var script = document.createElement("script");
    script.async = true;
    script.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
    document.head.appendChild(script);

    initialized.linkedin = true;
  }

  // Carga e inicialización de Meta Pixel
  function initMeta() {
    if (initialized.meta || !CONFIG.META_PIXEL_ID) return;
    var consent = getConsent();
    if (!consent.marketing) return;

    (function(f,b,e,v,n,t,s){
      if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)
    })(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');

    if (window.fbq) {
      window.fbq("init", CONFIG.META_PIXEL_ID);
    }

    initialized.meta = true;
  }

  function checkAndInitAll() {
    var consent = getConsent();
    if (consent.analytics) initGA4();
    if (consent.marketing) {
      initLinkedIn();
      initMeta();
    }
  }

  // Evento 1: Medición de page_view al navegar por hash routes
  function trackPageView(route) {
    var consent = getConsent();
    var currentPath = route || location.hash || "#/";
    var pageTitle = document.title || "Logístikos";

    // GA4
    if (initialized.ga4 && consent.analytics && typeof window.gtag === "function") {
      window.gtag("event", "page_view", {
        page_path: currentPath,
        page_title: pageTitle,
        page_location: location.href
      });
    }

    // Meta Pixel
    if (initialized.meta && consent.marketing && typeof window.fbq === "function") {
      window.fbq("track", "PageView");
    }

    // LinkedIn
    if (initialized.linkedin && consent.marketing && typeof window.lintrk === "function") {
      window.lintrk("track");
    }
  }

  // Evento 2: Formulario de diagnóstico enviado correctamente
  function trackDiagnosticSuccess(data) {
    var consent = getConsent();
    var topic = (data && (data.tema || data.origen)) || "general";

    // GA4
    if (initialized.ga4 && consent.analytics && typeof window.gtag === "function") {
      window.gtag("event", "generate_lead", {
        event_category: "Formulario",
        event_label: topic,
        value: 1
      });
    }

    // Meta Pixel
    if (initialized.meta && consent.marketing && typeof window.fbq === "function") {
      window.fbq("track", "Lead", {
        content_name: "Diagnóstico gratuito",
        content_category: topic
      });
    }

    // LinkedIn
    if (initialized.linkedin && consent.marketing && typeof window.lintrk === "function") {
      window.lintrk("track", { conversion_id: "diagnostic_lead" });
    }
  }

  // Evento 3: Clic en "Agendar reunión" (Calendly)
  function trackScheduleMeeting(source) {
    var consent = getConsent();
    var clickSource = source || "calendly_link";

    // GA4
    if (initialized.ga4 && consent.analytics && typeof window.gtag === "function") {
      window.gtag("event", "schedule_meeting", {
        event_category: "Conversión",
        event_label: clickSource
      });
    }

    // Meta Pixel
    if (initialized.meta && consent.marketing && typeof window.fbq === "function") {
      window.fbq("track", "Contact", {
        content_name: "Agendar reunión",
        content_category: clickSource
      });
    }

    // LinkedIn
    if (initialized.linkedin && consent.marketing && typeof window.lintrk === "function") {
      window.lintrk("track", { conversion_id: "schedule_meeting" });
    }
  }

  // Escuchar cambios de consentimiento
  document.addEventListener("logistikos:consent", function () {
    checkAndInitAll();
    trackPageView(location.hash);
  });

  // Escuchar navegación SPA por hash
  window.addEventListener("hashchange", function () {
    setTimeout(function () {
      trackPageView(location.hash);
    }, 50);
  });

  // Escuchar clics globales en botones / enlaces de "Agendar reunión" (Calendly)
  document.addEventListener("click", function (e) {
    var link = e.target.closest("a");
    if (!link) return;
    var href = link.getAttribute("href") || "";
    var text = (link.textContent || "").toLowerCase();
    if (href.indexOf("calendly.com") !== -1 || text.indexOf("agendar reunión") !== -1) {
      trackScheduleMeeting(link.getAttribute("data-source") || href || "calendly");
    }
  });

  // Intentar inicializar al cargar si ya había consentimiento previo guardado
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      checkAndInitAll();
      trackPageView(location.hash);
    });
  } else {
    checkAndInitAll();
    trackPageView(location.hash);
  }

  // Exponer API global
  window.LogistikosAnalytics = {
    config: CONFIG,
    trackPageView: trackPageView,
    trackDiagnosticSuccess: trackDiagnosticSuccess,
    trackScheduleMeeting: trackScheduleMeeting
  };
})();

