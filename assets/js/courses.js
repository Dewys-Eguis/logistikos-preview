"use strict";
function getCourseValues() {
  const accent = this.props.accent ?? "#0219FC";
  const hot = "legacy-471 ";
  const blue = "legacy-481";
  const none = "legacy-472 ";
  const badgeClass = (b) =>
    b === "Más demandado" ? hot : b === "Nuevo 2026" ? blue : none;
  const D = "Más demandado",
    N = "Nuevo 2026",
    P = "Presencial",
    O = "Online Live",
    H = "Híbrida";

  const data = [
    {
      id: "alm",
      route: "#/area/supply-chain",
      num: "01",
      name: "Almacén e intralogística",
      short: "almacén",
      area: "A1 · A5",
      profiles:
        "jefes de almacén, jefes de turno, preparadores, responsables de SGA",
      pain: "errores de preparación, productividad por hora, roturas y exactitud de inventario en plena campaña.",
      courses: [
        {
          title:
            "Productividad en picking: métodos, SGA y cero errores de preparación",
          hours: "12 h",
          mode: P,
          badge: D,
        },
        {
          title: "Lean warehouse y 5S con gestión visual diaria",
          hours: "16 h",
          mode: P,
          badge: D,
        },
        {
          title: "Gemelo digital y automatización: cuándo invertir en robótica",
          hours: "16 h",
          mode: H,
          badge: N,
        },
        {
          title: "Inventario: ABC, recuentos cíclicos y exactitud de stock",
          hours: "8 h",
          mode: P,
          badge: "—",
        },
      ],
    },
    {
      id: "tra",
      route: "#/area/transporte",
      num: "02",
      name: "Tráfico y transporte",
      short: "tráfico",
      area: "A3 · A6",
      profiles: "jefes de tráfico, planificadores de rutas, gestores de flota",
      pain: "kilómetros en vacío, urgentes que disparan el coste, facturas de transportistas sin auditar e incidencias que nadie cierra.",
      courses: [
        {
          title: "Planificación de rutas y control del coste por kilómetro",
          hours: "16 h",
          mode: H,
          badge: D,
        },
        {
          title: "Agentes de IA para tráfico e incidencias",
          hours: "16 h",
          mode: O,
          badge: N,
        },
        {
          title: "Auditoría de facturas y negociación con transportistas",
          hours: "12 h",
          mode: H,
          badge: D,
        },
        {
          title: "Transporte sin papel: e-CMR, eFTI y POD digital",
          hours: "8 h",
          mode: O,
          badge: N,
        },
      ],
    },
    {
      id: "com",
      route: "#/area/compras",
      num: "03",
      name: "Compras y aprovisionamiento",
      short: "compras",
      area: "A2",
      profiles:
        "compradores, category managers, responsables de aprovisionamiento",
      pain: "decisiones por precio unitario, proveedores únicos y contratos que no aguantan subidas de aranceles o materias primas.",
      courses: [
        {
          title: "Negociación basada en el Coste Total de Adquisición (TCO)",
          hours: "16 h",
          mode: P,
          badge: D,
        },
        {
          title: "Riesgo de proveedor, aranceles y nearshoring",
          hours: "16 h",
          mode: H,
          badge: N,
        },
        {
          title: "Homologación y evaluación de proveedores con datos",
          hours: "12 h",
          mode: O,
          badge: "—",
        },
        {
          title: "IA aplicada a compras: comparar ofertas y revisar contratos",
          hours: "8 h",
          mode: O,
          badge: N,
        },
      ],
    },
    {
      id: "cex",
      route: "#/area/comercio-internacional",
      num: "04",
      name: "Comercio exterior y aduanas",
      short: "comercio exterior",
      area: "A4",
      profiles:
        "técnicos de export/import, responsables de aduanas, administración de ventas",
      pain: "retenciones en frontera, Incoterms mal asignados y nuevas obligaciones europeas que llegan sin preparar.",
      courses: [
        {
          title: "Incoterms® 2020 y documentación sin retenciones en frontera",
          hours: "12 h",
          mode: O,
          badge: D,
        },
        {
          title:
            "CBAM y EUDR: cumplimiento 2026 para importadores y exportadores",
          hours: "12 h",
          mode: O,
          badge: N,
        },
        {
          title: "OEA: cómo obtenerlo y mantenerlo",
          hours: "12 h",
          mode: H,
          badge: D,
        },
        {
          title: "Medios de cobro internacional y riesgo país",
          hours: "8 h",
          mode: O,
          badge: "—",
        },
      ],
    },
    {
      id: "pla",
      route: "#/area/supply-chain",
      num: "05",
      name: "Planificación y supply chain",
      short: "planificación",
      area: "A1 · A6",
      profiles: "planificadores de demanda, supply chain managers, analistas",
      pain: "roturas y sobrestock a la vez, previsiones en Excel y cada departamento mirando un dato distinto.",
      courses: [
        {
          title: "S&OP y previsión de demanda con machine learning",
          hours: "24 h",
          mode: H,
          badge: D,
        },
        {
          title: "Control tower y KPIs de supply chain con Power BI",
          hours: "20 h",
          mode: H,
          badge: D,
        },
        {
          title: "Dimensionamiento del stock de seguridad",
          hours: "12 h",
          mode: O,
          badge: "—",
        },
        {
          title: "Huella ISO 14083 y envases PPWR en la cadena",
          hours: "12 h",
          mode: O,
          badge: N,
        },
      ],
    },
    {
      id: "dir",
      route: "#/area/liderazgo",
      num: "06",
      name: "Mandos intermedios y dirección",
      short: "mandos",
      area: "A5 · A6",
      profiles: "jefes de turno, mandos intermedios, dirección de operaciones",
      pain: "mandos que apagan fuegos, equipos que dependen de la dirección para decidir y márgenes que se escapan en la cadena.",
      courses: [
        {
          title: "Liderazgo de primera línea en picos de actividad",
          hours: "20 h",
          mode: P,
          badge: D,
        },
        {
          title: "Alfabetización en IA para toda la plantilla (AI Act)",
          hours: "8 h",
          mode: O,
          badge: N,
        },
        {
          title: "Comunicación y feedback para jefes de turno",
          hours: "12 h",
          mode: P,
          badge: D,
        },
        {
          title: "Coste logístico total y defensa del margen",
          hours: "12 h",
          mode: H,
          badge: "—",
        },
      ],
    },
  ];

  const sel = this.state.dept;
  const tabBase = "legacy-473 ";
  const depts = data.map((d) => ({
    ...d,
    tabClass: tabBase + (d.id === sel ? "legacy-474 " : "legacy-475 "),
    pick: () => this.setState({ dept: d.id }),
  }));
  const found = data.find((d) => d.id === sel) || data[0];
  const cur = {
    ...found,
    courses: found.courses.map((c) => ({
      ...c,
      badgeClass: badgeClass(c.badge),
    })),
  };

  const onStyle = "legacy-476 ";
  const nextStyle = "legacy-477 ";
  const mktStyle = "legacy-478 ";
  const radar = [
    {
      date: "FEB 2025",
      status: "EXIGIBLE",
      statusClass: onStyle,
      name: "AI Act · alfabetización en IA",
      desc: "Quien usa sistemas de IA debe asegurar un nivel suficiente de formación en su plantilla.",
      code: "toda la plantilla",
    },
    {
      date: "ENE 2026",
      status: "EN VIGOR",
      statusClass: onStyle,
      name: "CBAM · fase definitiva",
      desc: "Importaciones de acero, aluminio, cemento, fertilizantes e hidrógeno con emisiones declaradas.",
      code: "comercio exterior",
    },
    {
      date: "12.08.2026",
      status: "EN VIGOR",
      statusClass: onStyle,
      name: "PPWR · envases y embalajes",
      desc: "Declaración de conformidad, restricciones de sustancias y primeras obligaciones de envase y embalaje.",
      code: "almacén y calidad",
    },
    {
      date: "30.12.2026",
      status: "PRÓXIMO",
      statusClass: nextStyle,
      name: "EUDR · deforestación",
      desc: "Diligencia debida y geolocalización de origen para medianas y grandes; pymes en junio de 2027.",
      code: "compras y comercio exterior",
    },
    {
      date: "EN CURSO",
      status: "DESPLIEGUE",
      statusClass: nextStyle,
      name: "eFTI y e-CMR",
      desc: "La documentación electrónica de transporte sustituye al papel ante autoridades y clientes.",
      code: "tráfico y administración",
    },
    {
      date: "YA",
      status: "MERCADO",
      statusClass: mktStyle,
      name: "ISO 14083 · huella del transporte",
      desc: "Grandes cargadores exigen emisiones por envío en licitaciones y reporting de Scope 3.",
      code: "transporte y comercial",
    },
  ];

  const hrData = [
    {
      id: "A1",
      label: "Almacén",
      area: "SUPPLY CHAIN",
      code: "LGK-A1",
      title: "Productividad en picking y cero errores de preparación",
      hours: "12 h · 3 sesiones",
      mode: "Presencial",
      trainer: "Dir. Operaciones en activo",
      kpi: "Menos errores por 1.000 líneas",
      href: "Area-supply-chain.dc.html",
      route: "#/area/supply-chain",
    },
    {
      id: "A2",
      label: "Compras",
      area: "COMPRAS",
      code: "LGK-A2",
      title: "Negociación basada en el Coste Total de Adquisición",
      hours: "16 h · 4 sesiones",
      mode: "Presencial",
      trainer: "Dir. Compras en activo",
      kpi: "Ahorro TCO anual medible",
      href: "Area-compras.dc.html",
      route: "#/area/compras",
    },
    {
      id: "A3",
      label: "Transporte",
      area: "TRANSPORTE",
      code: "LGK-A3",
      title: "Planificación de rutas y control del coste por kilómetro",
      hours: "16 h · 4 sesiones",
      mode: "Híbrida",
      trainer: "Jefe de Tráfico en activo",
      kpi: "Menor coste por kilómetro",
      href: "Area-transporte.dc.html",
      route: "#/area/transporte",
    },
    {
      id: "A4",
      label: "Comex",
      area: "COMERCIO INTERNACIONAL",
      code: "LGK-A4",
      title: "Incoterms® 2020 y documentación sin retenciones",
      hours: "12 h · 3 sesiones",
      mode: "Online Live",
      trainer: "Resp. Aduanas en activo",
      kpi: "Menos expedientes retenidos",
      href: "Area-comercio-internacional.dc.html",
      route: "#/area/comercio-internacional",
    },
    {
      id: "A5",
      label: "Liderazgo",
      area: "LIDERAZGO",
      code: "LGK-A5",
      title: "Liderazgo de primera línea en picos de actividad",
      hours: "20 h · 5 sesiones",
      mode: "Presencial",
      trainer: "Dir. Operaciones en activo",
      kpi: "Menos incidencias escaladas",
      href: "Area-liderazgo.dc.html",
      route: "#/area/liderazgo",
    },
    {
      id: "A6",
      label: "IA y datos",
      area: "IA Y DATOS",
      code: "LGK-A6",
      title: "Agentes de IA para tráfico e incidencias",
      hours: "16 h · 4 sesiones",
      mode: "Online Live",
      trainer: "Dir. Operaciones en activo",
      kpi: "Menos tiempo por incidencia",
      href: "Area-ia-datos.dc.html",
      route: "#/area/ia-datos",
    },
  ];
  const hrSel = this.state.hr;
  const hr = hrData.find((h) => h.id === hrSel) || hrData[0];
  const tabB = "legacy-479 ";
  const hrTabs = hrData.map((h) => ({
    label: h.label,
    pressed: h.id === hr.id ? "true" : "false",
    className: tabB + (h.id === hr.id ? "legacy-482" : "legacy-480 "),
    pick: () => this.setState({ hr: h.id }),
  }));
  return { accent, data, depts, cur, radar, hr, hrTabs, hrData };
}
