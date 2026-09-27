const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(
  path.resolve(root, "../backups/original-20260926/Logistikos_web/index.html"),
  "utf8",
);
const original = [...source.matchAll(/<script>([\s\S]*?)<\/script>/g)][2][1];
const baseline = vm.createContext({});
vm.runInContext(
  "class DCLogic { constructor(props){ this.props=props; } setState(p){ Object.assign(this.state,p); } }\n" +
    original +
    "\nvar subject = new MainComponent({});",
  baseline,
);
const next = vm.createContext({});
vm.runInContext(
  fs.readFileSync(path.join(root, "assets/js/calculator.js"), "utf8") +
    fs.readFileSync(path.join(root, "assets/js/courses.js"), "utf8"),
  next,
);
const states = [];
for (const plantilla of [1, 5, 6, 9, 10, 49, 50, 249, 250, 1000])
  for (const modo of ["pres", "live", "hib", "tele"])
    for (const nivel of ["bas", "sup"])
      states.push({ plantilla: String(plantilla), modo, nivel });
states.push(
  { plantilla: "", salario: "", horas: "", participantes: "" },
  { plantilla: "-2", salario: "-1", horas: "-1" },
  { salario: "0" },
  { consumido: "999999" },
  { participantes: "0" },
  { horas: "0" },
);
const fields = [
  "plantilla",
  "salario",
  "consumido",
  "participantes",
  "horas",
  "tramo",
  "pctLabel",
  "cofinLabel",
  "creditoLabel",
  "disponibleLabel",
  "bonifLabel",
  "calcLabel",
  "usoLabel",
  "courseOptions",
];
for (const overrides of states) {
  baseline.overrides = overrides;
  vm.runInContext(
    "subject = new MainComponent({}); Object.assign(subject.state,overrides); var result = subject.renderVals();",
    baseline,
  );
  next.subject = {
    props: {},
    state: JSON.parse(JSON.stringify(baseline.subject.state)),
    setState(p) {
      Object.assign(this.state, p);
    },
  };
  const result = vm.runInContext(
    "getCalculatorValues.call(subject,getCourseValues.call(subject).data)",
    next,
  );
  for (const key of fields)
    assert.equal(
      JSON.stringify(result[key]),
      JSON.stringify(baseline.result[key]),
      key + " " + JSON.stringify(overrides),
    );
}
console.log(
  `${states.length} calculator scenarios match the original, including all workforce boundaries and modes.`,
);
