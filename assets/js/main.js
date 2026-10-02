"use strict";
// Shared state, hash routing and rendering lifecycle.

class MainComponent extends DCLogic {
  constructor(props) {
    super(props);
    this.state = {
      hr: "A1",
      kitEmail: "",
      kitSent: false,
      kitError: "",
      dept: "alm",
      plantilla: "80",
      salario: "28000",
      consumido: "0",
      courseIdx: "17",
      participantes: "12",
      horas: "20",
      modo: "hib",
      nivel: "sup",
    };
  }
  renderVals() {
    const courses = getCourseValues.call(this);
    return {
      ...courses,
      ...getCalculatorValues.call(this, courses.data),
      ...getFormValues.call(this),
      ...getHomeValues(courses),
    };
  }
}

(function () {
  "use strict";

  var AREANAMES = {
    "comercio-internacional": "Comercio Internacional",
    compras: "Compras y Category Management",
    "ia-datos": "IA, Datos y Digitalización",
    liderazgo: "Liderazgo y Gestión de Equipos",
    "supply-chain": "Supply Chain y Logística",
    transporte: "Transporte y Distribución",
  };
  var app = document.getElementById("app");
  var mainComp = new MainComponent({ accent: "#0219FC" });
  var current = null,
    pending = false;
  var cleanupHome = () => {};
  var cleanupFormacion = () => {};
  var cleanupNosotros = () => {};
  var cleanupTransporte = () => {};
  function keyed() {
    return app.querySelectorAll("input,select,textarea,details,button");
  }
  function render() {
    pending = false;
    var tplId = current.tpl,
      vals = mainComp.renderVals();
    var tpl = document.getElementById(tplId);
    if (!tpl) {
      location.replace("#/");
      return;
    }
    cleanupHome();
    cleanupHome = () => {};
    cleanupFormacion();
    cleanupFormacion = () => {};
    cleanupNosotros();
    cleanupNosotros = () => {};
    cleanupTransporte();
    cleanupTransporte = () => {};
    document.body.classList.toggle("is-home", tplId === "tpl-home");
    document.body.classList.toggle("is-programas", tplId === "tpl-page-programas");
    document.body.classList.toggle("is-a-medida", tplId === "tpl-page-a-medida");
    document.body.classList.toggle("is-nosotros", tplId === "tpl-page-quienes-somos");
    document.body.classList.toggle("is-fundae", tplId === "tpl-page-fundae");
    document.body.classList.toggle("is-rrhh", tplId === "tpl-page-rrhh");
    document.body.classList.toggle("is-universitarios", tplId === "tpl-page-universitarios");
    document.body.classList.toggle("is-al-dia", tplId === "tpl-page-al-dia");
    document.body.classList.toggle("is-supply-chain", tplId === "tpl-area-supply-chain");
    document.body.classList.toggle("is-campus", tplId === "tpl-page-campus");
    document.body.classList.toggle("is-talento-internacional", tplId === "tpl-page-talento-internacional");
    document.body.classList.toggle("is-webinar", tplId === "tpl-page-webinar");
    document.body.classList.toggle("is-diagnostico", tplId === "tpl-page-diagnostico");
    // remember focus and open details
    var olds = keyed(),
      ae = document.activeElement,
      focusIdx = -1,
      selS = null,
      selE = null,
      open = [];
    for (var i = 0; i < olds.length; i++) {
      if (olds[i] === ae) {
        focusIdx = i;
        try {
          selS = ae.selectionStart;
          selE = ae.selectionEnd;
        } catch (e) {}
      }
      if (olds[i].localName === "details" && olds[i].open) open.push(i);
    }
    var sameView = app.getAttribute("data-view") === tplId;
    var frag = document.createDocumentFragment();
    renderNodes(tpl.content.childNodes, vals, frag);
    app.replaceChildren(frag);
    app.setAttribute("data-view", tplId);
    if (window.syncThemeControls) syncThemeControls();
    if (tplId === "tpl-page-fundae") {
      app.querySelectorAll(".credit-choice").forEach(button => {
        button.setAttribute("aria-pressed", String(button.classList.contains("legacy-485")));
      });
    }
    wireLinks();
    disablePendingAreaLinks(app);
    disablePendingAreaLinks(document.querySelector("body > .site-header"));
    disablePendingAreaLinks(document.querySelector("body > footer"));
    if (tplId === "tpl-home") cleanupHome = HomePage.mount(app, mainComp);
    if (tplId === "tpl-page-programas" && window.FormacionPage) cleanupFormacion = FormacionPage.mount(app);
    if (tplId === "tpl-page-quienes-somos" && window.NosotrosPage) cleanupNosotros = NosotrosPage.mount(app);
    if (tplId === "tpl-area-transporte" && window.TransportePage) cleanupTransporte = TransportePage.mount(app);
    if (sameView) {
      var nw = keyed();
      open.forEach(function (i) {
        if (nw[i] && nw[i].localName === "details") nw[i].open = true;
      });
      if (focusIdx > -1 && nw[focusIdx]) {
        nw[focusIdx].focus({ preventScroll: true });
        try {
          if (selS != null) nw[focusIdx].setSelectionRange(selS, selE);
        } catch (e) {}
      }
    }
  }
  window.schedule = function () {
    if (!pending) {
      pending = true;
      queueMicrotask(function () {
        if (current) render();
      });
    }
  };
  function parse() {
    var h = location.hash || "#/",
      m;
    if (h.indexOf("#/radar") === 0) h = "#/al-dia";
    if (h.indexOf("#/de-jefe-a-lider") === 0 && PENDING_AREAS.has("#/area/liderazgo")) h = "#/area/liderazgo";
    if (Array.from(PENDING_AREAS).some(function (pending) { return h === pending || h.indexOf(pending + "#") === 0; })) {
      h = "#/programas";
      if (location.hash !== h) history.replaceState(null, "", h);
    }
    if ((m = h.match(/^#\/area\/([a-z-]+)/)))
      return { tpl: "tpl-area-" + m[1], key: "area", title: AREANAMES[m[1]], section: h.includes("#", 1) ? h.split("#")[2] : null };
    if (h.indexOf("#/de-jefe-a-lider") === 0)
      return {
        tpl: "tpl-area-liderazgo",
        key: "area",
        title: AREANAMES["liderazgo"],
        section: "de-jefe-a-lider",
      };
    if ((m = h.match(/^#\/s\/([a-z-]+)/)))
      return { tpl: "tpl-home", key: m[1], section: m[1] };
    if ((m = h.match(/^#\/([a-z-]+)/)))
      return {
        tpl: "tpl-page-" + m[1],
        key: m[1],
        section: h.includes("#", 1) ? h.split("#")[2] : null,
        title: {
          programas: "Por departamento",
          fundae: "Calculadora FUNDAE",
          rrhh: "Para RRHH",
          radar: "Radar 2026",
          universitarios: "Cursos universitarios",
          marca: "Tipografía",
          "quienes-somos": "Quiénes somos",
          "de-jefe-a-lider": "De jefe a líder",
          "a-medida": "Formación a medida",
          "al-dia": "Logístikos al día",
          campus: "Campus",
          "talento-internacional": "Talento Internacional",
          webinar: "Webinar · Jornadas empresariales",
          diagnostico: "Cuéntanos tu reto",
        }[m[1]],
      };
    return { tpl: "tpl-home", key: "home" };
  }
  function go() {
    var r = parse(),
      prevTpl = app.getAttribute("data-view");
    current = r;
    render();
    var target = r.section ? document.getElementById(r.section) : null;
    if (target) {
      for (var node = target; node && node !== app; node = node.parentElement) {
        if (node.tagName === "DETAILS") node.open = true;
      }
      target.scrollIntoView({ behavior: "instant", block: "start" });
      document.fonts.ready.then(function () {
        if (current === r && target.isConnected) target.scrollIntoView({ behavior: "instant", block: "start" });
      });
    } else if (prevTpl !== app.getAttribute("data-view") || !prevTpl) {
      window.scrollTo(0, 0);
    }
    document.title = r.title
      ? "Logístikos · " + r.title
      : "Logístikos · Formación, talento y transformación";
    document
      .querySelectorAll(".site-nav a, .home-desktop-nav a, .campus-link")
      .forEach(function (a) {
        if (a.getAttribute("data-r") === r.key)
          a.setAttribute("aria-current", "page");
        else a.removeAttribute("aria-current");
      });
  }
  var PENDING_AREAS = new Set();
  function disablePendingAreaLinks(root) {
    (root || document).querySelectorAll("a[href]").forEach(function (a) {
      var href = a.getAttribute("href") || "";
      if (!PENDING_AREAS.has(href)) return;
      a.dataset.pendingHref = href;
      a.removeAttribute("href");
      a.setAttribute("aria-disabled", "true");
      a.setAttribute("title", "Próximamente");
      a.classList.add("is-pending-link");
      var label = a.querySelector(".area-card-bottom > span:first-child");
      if (label) label.textContent = "Próximamente";
      var arrow = a.querySelector(".area-card-bottom b");
      if (arrow) arrow.textContent = "·";
    });
  }
  function wireLinks() {
    app.querySelectorAll("a[href]").forEach(function (a) {
      var href = a.getAttribute("href");
      if (/^https?:/.test(href)) {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener");
      }
    });
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a");
    if (!a) return;
    var dl = a.getAttribute("data-dl");
    if (dl) {
      e.preventDefault();
      download(dl);
      return;
    }
    var href = a.getAttribute("href") || "";
    if (href === "#top") { e.preventDefault(); scrollToTop(); return; }
    if (href.charAt(0) === "#" && href.charAt(1) !== "/") {
      e.preventDefault();
      var t = href.length > 1 ? document.getElementById(href.slice(1)) : null;
      if (href === "#contacto" && document.body.classList.contains("is-home")) t = document.getElementById("home-contacto");
      if (t) scrollToSection(t);
      else if (href.length > 1) {
        location.hash = "#/s/" + href.slice(1);
      } else if (href === "#top" || href === "#") scrollToTop();
    }
  });
  window.addEventListener("hashchange", go);
  disablePendingAreaLinks(document.querySelector("body > .site-header"));
  disablePendingAreaLinks(document.querySelector("body > footer"));
  go();
})();
