const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");
const root = path.resolve(__dirname, "..");
const original = path.resolve(
  root,
  "../backups/original-20260926/Logistikos_web/index.html",
);
const routes = [
  "/programas",
  "/fundae",
  "/rrhh",
  "/radar",
  "/universitarios",
  "/quienes-somos",
  "/a-medida",
  "/al-dia",
  "/campus",
  "/area/comercio-internacional",
  "/area/compras",
  "/area/ia-datos",
  "/area/liderazgo",
  "/area/supply-chain",
  "/area/transporte",
  "/marca",
];
const props = [
  "display",
  "position",
  "gridTemplateColumns",
  "gridColumn",
  "flexDirection",
  "flexWrap",
  "gap",
  "padding",
  "margin",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "letterSpacing",
  "color",
  "backgroundColor",
  "borderTop",
  "borderRight",
  "borderBottom",
  "borderLeft",
  "width",
  "height",
  "maxWidth",
  "minHeight",
  "whiteSpace",
  "alignItems",
  "justifyContent",
  "textAlign",
  "textDecorationLine",
];
const snapshot = (page) =>
  page.evaluate(
    (props) => ({
      text: document.querySelector("#app").innerText,
      nodes: [
        ...document.querySelectorAll("header *, #app *, footer *, #fab *"),
      ].map((el) => {
        const css = getComputedStyle(el);
        return {
          tag: el.tagName,
          text: el.textContent.slice(0, 60),
          styles: Object.fromEntries(props.map((p) => [p, css[p]])),
        };
      }),
      overflow: [
        ...document.querySelectorAll("header *, #app *, footer *, #fab *"),
      ]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width && (r.right > innerWidth + 1 || r.left < -1);
        })
        .map((el) => ({
          tag: el.tagName,
          text: el.textContent.trim().slice(0, 60),
        })),
      images: [...document.querySelectorAll("#app img")].every(
        (im) => im.complete && im.naturalWidth > 0,
      ),
      unresolved: /\{\{/.test(document.querySelector("#app").innerHTML),
    }),
    props,
  );
async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images].map((im) => im.decode().catch(() => {})),
    );
  });
}
(async () => {
  const browser = await chromium.launch({
    headless: true,
    channel: process.env.BROWSER_CHANNEL || "msedge",
  });
  const context = await browser.newContext({
    reducedMotion: "reduce",
    acceptDownloads: true,
  });
  // Deterministic comparison without external font availability/network variance.
  await context.route("https://fonts.googleapis.com/**", (route) =>
    route.abort(),
  );
  await context.route("https://fonts.gstatic.com/**", (route) => route.abort());
  const before = await context.newPage(),
    after = await context.newPage();
  const errors = [];
  after.on("pageerror", (e) => errors.push(e.message));
  const report = { routes: [], differences: [], errors, interactions: [] };
  for (const width of [390, 768, 1440]) {
    await before.setViewportSize({ width, height: 900 });
    await after.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await before.goto(pathToFileURL(original).href + "#" + route);
      await after.goto(
        pathToFileURL(path.join(root, "index.html")).href + "#" + route,
      );
      await Promise.all([settle(before), settle(after)]);
      const a = await snapshot(before),
        b = await snapshot(after);
      assert.equal(b.text, a.text, `Content differs ${width} ${route}`);
      assert.equal(
        b.nodes.length,
        a.nodes.length,
        `DOM count differs ${route}`,
      );
      assert(b.images, `Broken image ${route}`);
      assert(!b.unresolved, `Unresolved template ${route}`);
      for (let i = 0; i < a.nodes.length; i++)
        for (const prop of props) {
          if (a.nodes[i].styles[prop] !== b.nodes[i].styles[prop])
            report.differences.push({
              width,
              route,
              index: i,
              tag: a.nodes[i].tag,
              text: a.nodes[i].text,
              prop,
              before: a.nodes[i].styles[prop],
              after: b.nodes[i].styles[prop],
            });
        }
      report.routes.push({
        width,
        route,
        originalOverflow: a.overflow.length,
        currentOverflow: b.overflow.length,
        overflow: b.overflow,
      });
    }
  }
  fs.writeFileSync(
    path.join(root, "docs/verificacion.json"),
    JSON.stringify(report, null, 2),
  );
  await after.goto(pathToFileURL(path.join(root, "index.html")).href + "#/");
  await after.locator('[data-roadmap="A3"]').click();
  assert.match(await after.locator("#app").innerText(), /LGK-A3/);
  await after.locator(".faq-list details").last().locator("summary").click();
  assert(
    await after
      .locator("#app details")
      .last()
      .evaluate((el) => el.open),
  );
  report.interactions.push("Home: 6-area selector and FAQ");
  await after.goto(
    pathToFileURL(path.join(root, "index.html")).href + "#/programas",
  );
  await after.locator("#app button").nth(1).click();
  assert.match(await after.locator("#app").innerText(), /kilómetros en vacío/);
  report.interactions.push("Department selector");
  await after.goto(
    pathToFileURL(path.join(root, "index.html")).href + "#/fundae",
  );
  const inputs = after.locator("#app input");
  await inputs.nth(0).fill("5");
  await inputs.nth(1).fill("0");
  assert.match(await after.locator("#app").innerText(), /420 €/);
  await inputs.nth(2).fill("99999");
  assert.match(
    await after.locator("#app").innerText(),
    /No queda crédito disponible/,
  );
  await inputs.nth(2).fill("0");
  await inputs.nth(1).fill("28000");
  await after.locator("#app select").selectOption("0");
  assert.equal(await inputs.nth(4).inputValue(), "12");
  await after
    .getByRole("button", { name: "Teleformación", exact: true })
    .click();
  assert.match(await after.locator("#app").innerText(), /7,5 €/);
  await inputs.nth(4).fill("8");
  assert.equal(await after.locator("#app select").inputValue(), "otra");
  assert.equal(await after.evaluate(() => document.activeElement?.value), "8");
  report.interactions.push(
    "FUNDAE: minimum credit, exhausted credit, course/individual hours, mode, focus",
  );
  await after.goto(
    pathToFileURL(path.join(root, "index.html")).href + "#/rrhh",
  );
  await after
    .getByRole("button", { name: "Recibir el kit RRHH completo" })
    .click();
  assert.match(await after.locator("#app").innerText(), /Introduce un email/);
  await after.locator("#app input").fill("prueba@example.invalid");
  await after
    .getByRole("button", { name: "Recibir el kit RRHH completo" })
    .click();
  assert.match(await after.locator("#app").innerText(), /Kit en camino/);
  for (const a of await after.locator("[data-dl]").all()) {
    const name = await a.getAttribute("data-dl");
    const [dl] = await Promise.all([after.waitForEvent("download"), a.click()]);
    assert.equal(dl.suggestedFilename(), name);
    assert.equal(await dl.failure(), null);
    assert(
      fs
        .readFileSync(await dl.path())
        .equals(fs.readFileSync(path.join(root, "kit-rrhh", name))),
    );
  }
  report.interactions.push(
    "Kit: invalid/valid email and seven byte-verified downloads",
  );
  await after.goto(
    pathToFileURL(path.join(root, "index.html")).href + "#/al-dia",
  );
  await after.locator("[data-subscribe]").click();
  assert.match(await after.locator("#sub-msg").innerText(), /Introduce/);
  await after.locator("#sub-email").fill("prueba@example.invalid");
  await after.locator("[data-subscribe]").click();
  assert.match(await after.locator("#sub-msg").innerText(), /Hecho/);
  report.interactions.push("Subscription prototype: invalid/valid email");
  await after.goto(
    pathToFileURL(path.join(root, "index.html")).href + "#/campus",
  );
  await after.locator("#login-form button").click();
  assert.match(await after.locator("#login-msg").innerText(), /Introduce/);
  await after.locator("#login-user").fill("demo");
  await after.locator("#login-pass").fill("test-only");
  await after.locator("#login-form button").click();
  assert.equal(await after.locator("#login-pass").inputValue(), "");
  assert.match(
    await after.locator("#login-msg").innerText(),
    /disponible en breve/,
  );
  report.interactions.push(
    "Campus prototype: validation and credential clearing",
  );
  await after.goto(
    pathToFileURL(path.join(root, "index.html")).href + "#/de-jefe-a-lider",
  );
  assert.equal(
    await after.locator("#app").getAttribute("data-view"),
    "tpl-area-liderazgo",
  );
  await after.goto(
    pathToFileURL(path.join(root, "index.html")).href + "#/s/areas",
  );
  assert.equal(
    await after.locator("#app").getAttribute("data-view"),
    "tpl-home",
  );
  await after.goto(
    pathToFileURL(path.join(root, "index.html")).href + "#/ruta-inexistente",
  );
  await after.waitForURL("**#/");
  await after.locator("#otro-perfil summary").click();
  await after.locator("[data-otro-send]").click();
  assert.match(
    await after.locator("#otro-msg").innerText(),
    /Escribe tu perfil/,
  );
  await after.locator("#otro-texto").fill("Gerente de pruebas");
  await after.evaluate(() => {
    window.open = (url) => {
      window.testWhatsApp = url;
      return null;
    };
  });
  await after.locator("[data-otro-send]").click();
  assert.match(
    await after.evaluate(() => decodeURIComponent(window.testWhatsApp)),
    /Gerente de pruebas/,
  );
  report.interactions.push(
    "Section/alias/unknown routes and Otro perfil WhatsApp URL (no external send)",
  );
  await after.addInitScript(() => {
    window.claude = {
      use: async (service) =>
        service === "sample"
          ? async () => ({ text: "Respuesta de prueba local" })
          : null,
    };
  });
  await after.reload();
  await after.locator("#ai-open").click();
  await after.locator("#ai-input").fill("Consulta de prueba");
  await after.locator("#ai-send").click();
  await after.getByText("Respuesta de prueba local", { exact: true }).waitFor();
  await after.keyboard.press("Escape");
  assert(await after.locator("#ai-panel").isHidden());
  report.interactions.push(
    "Assistant open/send/close with local stub; no live AI service called",
  );
  fs.writeFileSync(
    path.join(root, "docs/verificacion.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        views: report.routes.length,
        styleDifferences: report.differences.length,
        errors,
        interactions: report.interactions,
      },
      null,
      2,
    ),
  );
  await browser.close();
  assert.equal(errors.length, 0, "Browser errors");
  assert.equal(
    report.differences.length,
    0,
    "Presentation regressions; inspect docs/verificacion.json",
  );
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
