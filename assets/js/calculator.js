"use strict";
function getCalculatorValues(data) {
  // ---- Calculadora FUNDAE ----
  const st = this.state;
  const num = (v, d) => {
    const n = parseFloat(v);
    return isFinite(n) && n >= 0 ? n : d;
  };
  const eur = (v) => Math.round(v).toLocaleString("es-ES") + " €";
  const plantilla = Math.max(1, Math.round(num(st.plantilla, 1)));
  const salario = num(st.salario, 0);
  const consumido = num(st.consumido, 0);
  const participantes = Math.max(0, Math.round(num(st.participantes, 0)));
  const horas = num(st.horas, 0);
  let pct, cof, tramo;
  if (plantilla <= 5) {
    pct = 1;
    cof = 0;
    tramo = "1 a 5 personas";
  } else if (plantilla <= 9) {
    pct = 1;
    cof = 0.05;
    tramo = "6 a 9 personas";
  } else if (plantilla <= 49) {
    pct = 0.75;
    cof = 0.1;
    tramo = "10 a 49 personas";
  } else if (plantilla <= 249) {
    pct = 0.6;
    cof = 0.2;
    tramo = "50 a 249 personas";
  } else {
    pct = 0.5;
    cof = 0.4;
    tramo = "250 o más personas";
  }
  let credito = plantilla * salario * 0.007 * pct;
  if (plantilla <= 5) credito = Math.max(credito, 420);
  const disponible = Math.max(0, credito - consumido);
  const presMod = st.nivel === "bas" ? 9 : 13;
  const modMod = (m) => (m === "tele" ? 7.5 : presMod);
  const modulo = modMod(st.modo);
  const bonif = participantes * horas * modulo;
  const cubierto = Math.min(bonif, disponible);
  const usoPct = disponible > 0 ? bonif / disponible : 0;
  const w = (x) => Math.max(0, Math.min(100, x * 100)).toFixed(1) + "%";
  const barWidth = w(usoPct);
  const barClass =
    "calc-bar " + (usoPct > 1 ? "calc-bar--accent" : "calc-bar--blue");
  let usoLabel;
  if (disponible <= 0)
    usoLabel =
      "No queda crédito disponible este año: podemos planificar la formación con cargo al crédito del próximo ejercicio.";
  else if (usoPct > 1)
    usoLabel =
      "Supera tu crédito disponible en " +
      eur(bonif - disponible) +
      ". Podemos ajustar horas, grupos o repartirlo en dos ejercicios.";
  else
    usoLabel =
      "Consume el " +
      Math.round(usoPct * 100) +
      " % de tu crédito disponible. Te quedarían " +
      eur(disponible - bonif) +
      ".";
  const modeDefs = [
    { id: "pres", label: "Presencial" },
    { id: "live", label: "Online Live" },
    { id: "hib", label: "Híbrida" },
    { id: "tele", label: "Teleformación" },
  ];
  const segBase = "legacy-484 ";
  const segOn = "legacy-485 ";
  const segOff = "legacy-486 ";
  const modes = modeDefs.map((m) => ({
    ...m,
    className: segBase + (st.modo === m.id ? segOn : segOff),
    pick: () => this.setState({ modo: m.id }),
  }));
  const levels = [
    { id: "sup", label: "Superior · técnico y mandos (13 €/h)" },
    { id: "bas", label: "Básico · operativo (9 €/h)" },
  ].map((l) => ({
    ...l,
    className: segBase + (st.nivel === l.id ? segOn : segOff),
    pick: () => this.setState({ nivel: l.id }),
  }));
  const cmpDefs = [
    { label: "Presencial", m: "pres" },
    { label: "Online Live", m: "live" },
    { label: "Teleformación", m: "tele" },
  ];
  const cmpMax = participantes * horas * presMod || 1;
  const compare = cmpDefs.map((c) => {
    const v = participantes * horas * modMod(c.m);
    return {
      label: c.label,
      amount: eur(v),
      barWidth: w(v / cmpMax),
      barClass:
        "calc-bar " +
        (c.m === st.modo || (st.modo === "hib" && c.m !== "tele")
          ? "calc-bar--accent"
          : "calc-bar--blue"),
    };
  });

  const catalog = [];
  data.forEach((d) =>
    d.courses.forEach((c) =>
      catalog.push({
        label: d.name + " · " + c.title + " (" + c.hours + ")",
        hours: parseFloat(c.hours),
        mode: c.mode,
      }),
    ),
  );
  [
    ["IA en el trabajo: productividad con inteligencia artificial", "live"],
    ["Logística integral: cómo funciona la cadena de suministro", "live"],
    ["Liderazgo, comunicación y trabajo en equipo", "live"],
    ["Mejora continua y productividad: Lean en la empresa", "live"],
    ["Competencias digitales y datos para la toma de decisiones", "live"],
    ["Sostenibilidad y logística responsable", "live"],
  ].forEach((u) =>
    catalog.push({
      label: "Universitario · " + u[0] + " (25 h)",
      hours: 25,
      mode: u[1],
    }),
  );
  const modeFromLabel = (m) =>
    m === "Presencial"
      ? "pres"
      : m === "Online Live"
        ? "live"
        : m === "Híbrida"
          ? "hib"
          : m;
  const courseOptions = catalog
    .map((c, i) => ({ value: String(i), label: c.label }))
    .concat([{ value: "otra", label: "Otra formación (introduce las horas)" }]);
  const onCourse = (e) => {
    const v = e.target.value;
    if (v === "otra") {
      this.setState({ courseIdx: "otra" });
      return;
    }
    const c = catalog[Number(v)];
    if (c)
      this.setState({
        courseIdx: v,
        horas: String(c.hours),
        modo: modeFromLabel(c.mode),
      });
  };
  const calc = {
    plantilla: st.plantilla,
    salario: st.salario,
    consumido: st.consumido,
    participantes: st.participantes,
    horas: st.horas,
    onPlantilla: (e) => this.setState({ plantilla: e.target.value }),
    onSalario: (e) => this.setState({ salario: e.target.value }),
    onConsumido: (e) => this.setState({ consumido: e.target.value }),
    onParticipantes: (e) => this.setState({ participantes: e.target.value }),
    onHoras: (e) => this.setState({ horas: e.target.value, courseIdx: "otra" }),
    courseIdx: st.courseIdx,
    courseOptions,
    onCourse,
    modes,
    levels,
    compare,
    tramo,
    pctLabel: Math.round(pct * 100) + " %",
    cofinLabel: Math.round(cof * 100) + " %",
    creditoLabel: eur(credito),
    disponibleLabel: eur(disponible),
    bonifLabel: eur(cubierto),
    calcLabel:
      participantes +
      " participantes × " +
      horas +
      " h × " +
      modulo.toLocaleString("es-ES") +
      " €/h" +
      (bonif > cubierto ? " · limitado a tu crédito disponible" : ""),
    barWidth,
    barClass,
    usoLabel,
  };

  return calc;
}
