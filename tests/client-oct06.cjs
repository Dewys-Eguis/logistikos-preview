// Standalone regression checks: no legacy backup and no real form submissions.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const original = p => execFileSync('git', ['show', 'HEAD:' + p], { cwd: root, encoding: 'utf8' });
const norm = s => s.replace(/\r\n/g, '\n');
const report = { routes: [], forms: [], errors: [], missing: [], screenshots: [] };
const output = process.env.LOGISTIKOS_TEST_OUTPUT || fs.mkdtempSync(path.join(os.tmpdir(), 'logistikos-oct06-qa-'));
fs.mkdirSync(output, { recursive: true });

function sourceChecks() {
  for (const p of ['pages/aviso-legal.html', 'pages/politica-privacidad.html', 'pages/politica-cookies.html', 'pages/manifest.json', 'assets/css/legal.css', 'assets/js/cookies-consent.js', 'assets/js/forms.js', 'assets/js/forms-config.js', 'assets/js/diagnostico.js', 'assets/js/webinar.js', 'form-api/server.js', 'form-api/package.json']) {
    assert.equal(norm(read(p)), norm(original(p)), 'Protected source: ' + p);
  }
  for (const file of fs.readdirSync(path.join(root, 'pages')).filter(f => f.endsWith('.html'))) {
    const p = 'pages/' + file;
    assert.deepEqual(norm(read(p)).match(/<form\b[\s\S]*?<\/form>/g), norm(original(p)).match(/<form\b[\s\S]*?<\/form>/g), 'Preserved forms: ' + p);
  }
  assert(!/<p\b[^>]*>(?:(?!<\/p>)[\s\S])*<figure/.test(read('pages/diagnostico.html')));
  const context = vm.createContext({});
  vm.runInContext(read('assets/js/calculator.js'), context);
  const previous = vm.createContext({});
  vm.runInContext(original('assets/js/calculator.js'), previous);
  let cases = 0;
  for (const plantilla of [1, 5, 6, 9, 10, 49, 50, 249, 250, 1000]) {
    for (const modo of ['pres', 'live', 'hib', 'tele']) for (const nivel of ['bas', 'sup']) {
      const state = { plantilla, modo, nivel, salario: 28000, consumido: 100, participantes: 10, horas: 20 };
      const clean = value => JSON.parse(JSON.stringify(value, (key, v) => key === 'courseOptions' ? undefined : v));
      assert.deepEqual(clean(context.getCalculatorValues.call({ state }, [])), clean(previous.getCalculatorValues.call({ state }, [])));
      cases++;
    }
  }
  const calc = context.getCalculatorValues.call({ state: { plantilla: 80, salario: 28000, consumido: 0, participantes: 10, horas: 20, modo: 'pres', nivel: 'sup' } }, []);
  assert.equal(calc.bonifLabel, '2600 €');
  assert.equal(calc.courseOptions.filter(c => c.label.startsWith('Universitario')).length, 6);
  assert(calc.courseOptions.slice(0, 6).every(c => c.label.endsWith('(25 h)')));
  report.calculator = { equivalentCases: cases, control: calc.bonifLabel };
}

(async () => {
  sourceChecks();
  const baselineHTML = original('index.html');
  const server = http.createServer((req, res) => {
    const name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (name === '/baseline.html') { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(baselineHTML); return; }
    const file = path.resolve(root, '.' + (name === '/' ? '/index.html' : name));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
    const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  let browser, page;
  try {
    browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    // Network isolation: only this local static server and mocked form responses.
    let formStatus = 200;
    const submissions = [];
    await context.route('**/*', async route => {
      const req = route.request();
      if (req.url().startsWith(base + '/api/')) {
        submissions.push({ url: req.url(), payload: req.postDataJSON() });
        await route.fulfill({ status: formStatus, contentType: 'application/json', body: JSON.stringify(formStatus === 200 ? { ok: true, id: 'mock-only' } : { error: 'Simulated failure' }) });
      } else if (req.url().startsWith(base) && req.method() === 'GET') await route.continue();
      else await route.abort();
    });
    page = await context.newPage();
    await page.clock.setFixedTime(new Date('2026-10-06T12:00:00Z'));
    page.on('pageerror', e => report.errors.push(e.message));
    page.on('response', r => { if (r.url().startsWith(base) && !r.url().includes('/api/') && r.status() >= 400) report.missing.push(r.url()); });
    const manifest = JSON.parse(read('pages/manifest.json'));
    const routeOf = id => id === 'tpl-home' ? '/' : id.startsWith('tpl-area-') ? '/area/' + id.slice(9) : '/' + id.slice(9);
    const go = async route => {
      await page.goto(base + '/#' + route);
      await page.waitForSelector('#app > *');
    };
    for (const width of [1440, 1024, 390, 320]) {
      await page.setViewportSize({ width, height: 950 });
      for (const entry of manifest) {
        console.log('Checking', width, entry.id);
        await go(routeOf(entry.id));
        assert.equal(await page.locator('#app').getAttribute('data-view'), entry.id === 'tpl-page-radar' ? 'tpl-page-al-dia' : entry.id);
        if (await page.locator('[data-cookie-banner]:visible').count()) await page.locator('[data-cookie-reject]').click();
        const photos = page.locator('#app img[src*="/fotos/"]');
        for (const img of await photos.all()) {
          // Existing decorative photo containers can float continuously.
          await img.evaluate(el => { el.loading = 'eager'; el.scrollIntoView({ behavior: 'instant', block: 'center' }); });
          await page.waitForFunction(src => [...document.images].some(img => img.src === src && img.complete && img.naturalWidth > 0), await img.evaluate(el => el.src), { timeout: 10000 });
          const data = await img.evaluate(el => ({ natural: [el.naturalWidth, el.naturalHeight], declared: [Number(el.getAttribute('width')), Number(el.getAttribute('height'))], hidden: !!el.closest('[aria-hidden="true"]'), alt: el.alt, hero: !!el.closest('.hero-photo'), rect: el.getBoundingClientRect().toJSON() }));
          assert.deepEqual(data.natural, data.declared);
          assert(data.hero || (data.alt && !data.hidden), 'Accessible photo ' + entry.file);
          assert(data.rect.width > 0 && data.rect.right <= width + 1 && data.rect.left >= -1, 'Photo bounds ' + entry.file + ' @' + width);
        }
        await page.evaluate(() => window.scrollTo(0, 600));
        await page.waitForTimeout(30);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        const result = { route: routeOf(entry.id), width, photos: await photos.count(), overflow };
        report.routes.push(result);
        if (overflow > 1) {
          await page.goto(base + '/baseline.html#' + routeOf(entry.id));
          result.baselineOverflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
          assert(overflow <= result.baselineOverflow, `New overflow ${entry.file} @${width}: ${overflow}, baseline ${result.baselineOverflow}`);
        }
      }
    }
    console.log('92 route/viewport checks passed');
    await page.setViewportSize({ width: 1440, height: 1000 });
    await go('/');
    assert.equal(await page.locator('[data-country-picker]').count(), 0);
    assert.equal(await page.locator('[data-count="573"]').innerText(), '573');
    assert.equal(await page.locator('[data-count="60"]').innerText(), '60');
    assert.equal(await page.locator('.hero-coordinate,[data-hero-visual],.hero-grid,.hero-aura').count(), 0);
    assert.equal(await page.locator('.hero-photo').evaluate(el => getComputedStyle(el).animationName), 'none');
    assert.equal(await page.locator('.wordmark-logo').count(), 3);
    assert.equal(await page.locator('a[data-r="webinar"]').first().innerText(), 'Eventos');
    await go('/quienes-somos');
    assert.equal(await page.locator('[data-about-count="573"]').innerText(), '573');
    assert.equal(await page.locator('[data-about-count="60"]').innerText(), '60');
    await go('/area/supply-chain');
    const scrum = page.locator('details.sc-program').filter({ hasText: 'Agile Project Management' });
    await scrum.locator('summary').click();
    assert(await scrum.evaluate(el => el.open));
    await go('/programas');
    for (const term of ['Scrum', 'Agile']) {
      await page.locator('#program-query').fill(term);
      await page.waitForTimeout(250);
      assert.match(await page.locator('#program-results').innerText(), /Agile Project Management y Scrum/);
    }
    await go('/fundae');
    assert.equal(await page.locator('option').filter({ hasText: /^Universitario/ }).count(), 6);
    await go('/webinar');
    assert.match(await page.title(), /Eventos/);
    await go('/talento-internacional');
    assert.equal(await page.locator('#itinerarios .talent-steps article').count(), 2);
    assert.equal(await page.locator('.talent-faq-list details').count(), 6);
    assert(!/extranjeras|POR CONFIRMAR|pendiente de confirmación/.test(await page.locator('#app').innerText()));

    // Cookie preferences: reject, persist, opt in, then configure selectively.
    await context.clearCookies(); await go('/'); await page.reload();
    await page.locator('[data-cookie-reject]').click();
    await page.reload();
    assert.equal(await page.locator('[data-cookie-banner]').isVisible(), false);
    assert.deepEqual(await page.evaluate(() => window.LOGISTIKOS_CONSENT), { necessary: true, analytics: false, marketing: false });
    await context.clearCookies(); await page.reload();
    await page.locator('[data-cookie-accept]').click();
    assert.deepEqual(await page.evaluate(() => window.LOGISTIKOS_CONSENT), { necessary: true, analytics: true, marketing: true });
    await page.locator('[data-cookie-settings]').click();
    await page.locator('[data-cookie-marketing]').uncheck();
    await page.locator('[data-cookie-save]').click();
    await page.reload();
    assert.deepEqual(await page.evaluate(() => window.LOGISTIKOS_CONSENT), { necessary: true, analytics: true, marketing: false });
    report.cookies = 'reject/persist/accept/configure passed';

    for (const [route, key, selector, statusSelector] of [
      ['/diagnostico?tema=compras', 'diagnostico', '[data-diagnostic-form]', '[data-diagnostic-status]'],
      ['/webinar', 'webinar', '[data-webinar-form]', '[data-webinar-status]'],
      ['/talento-internacional', 'talento', '#talent-form', '#talent-form-status'],
    ]) {
      await go(route);
      if (key === 'webinar') await page.locator('[data-webinar-register]:enabled').first().click();
      const form = page.locator(selector);
      await form.evaluate(el => {
        for (const input of el.querySelectorAll('input[required],textarea[required],select[required]')) {
          if (input.type === 'checkbox') continue;
          input.value = input.tagName === 'SELECT' ? [...input.options].find(o => o.value).value : input.type === 'email' ? 'qa@example.invalid' : input.type === 'number' ? '2' : input.type === 'tel' ? '600000000' : 'Prueba simulada';
        }
      });
      const before = submissions.length;
      await form.locator('button[type="submit"]').click();
      assert.equal(submissions.length, before, 'Consent is required');
      await form.locator('[name="privacidad"]').check();
      assert.equal(await form.locator('[name="comunicaciones"]').isChecked(), false);
      await form.locator('button[type="submit"]').click();
      assert.match(await page.locator(statusSelector).innerText(), /Falta/i);
      assert.equal(submissions.length, before);
      await page.evaluate(({ key, base }) => { window.LOGISTIKOS_FORMS[key].endpoint = base + '/api/' + key; }, { key, base });
      formStatus = 500;
      await form.locator('button[type="submit"]').click();
      await page.waitForFunction(s => document.querySelector(s).textContent.includes('No hemos podido'), statusSelector);
      assert.equal(await form.locator('button[type="submit"]').isEnabled(), true);
      assert.equal(submissions.at(-1).payload.privacidad, 'aceptada');
      assert(!('comunicaciones' in submissions.at(-1).payload));
      await form.locator('[name="comunicaciones"]').check();
      formStatus = 200;
      await form.locator('button[type="submit"]').click();
      if (key === 'diagnostico') {
        await page.locator('[data-diagnostic-success]').waitFor({ state: 'visible' });
        assert.match(submissions.at(-1).payload.origen, /Compras/);
      } else await page.waitForFunction(s => document.querySelector(s).textContent.includes('enviada correctamente'), statusSelector);
      assert.equal(submissions.at(-1).payload.comunicaciones, 'si');
      assert.equal(submissions.length, before + 2);
      report.forms.push({ key, requiredConsent: true, missingEndpoint: true, simulatedErrorAndSuccess: true });
    }

    await page.emulateMedia({ reducedMotion: 'no-preference' });
    for (const [route, attribute] of [['/', 'data-count'], ['/quienes-somos', 'data-about-count']]) {
      await go(route); await page.reload();
      for (const value of ['573', '60']) {
        const selector = `[${attribute}="${value}"]`;
        await page.locator(selector).evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
        await page.waitForFunction(({ selector, value }) => document.querySelector(selector).textContent === value, { selector, value });
      }
    }
    report.animatedCounters = '573 and 60 reached on Home and About with motion enabled';
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const width of [1440, 390]) for (const theme of ['dark', 'light']) {
      await page.setViewportSize({ width, height: 1000 }); await go('/');
      await page.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
      const file = path.join(output, `home-${width}-${theme}.png`);
      await page.screenshot({ path: file }); report.screenshots.push(file);
      if (width === 390) {
        await page.locator('[data-navigation-open]').click();
        assert.equal(await page.locator('#architecture-menu').evaluate(el => el.open), true);
        const menu = path.join(output, `menu-${theme}.png`);
        await page.screenshot({ path: menu }); report.screenshots.push(menu);
        await page.locator('[data-navigation-close]').click();
      }
    }
    for (const route of ['/webinar', '/talento-internacional', '/diagnostico', '/area/compras', '/area/ia-datos']) {
      await page.setViewportSize({ width: 390, height: 1000 }); await go(route);
      await page.evaluate(() => document.documentElement.dataset.theme = 'dark');
      await page.evaluate(() => window.scrollTo(0, 0));
      const file = path.join(output, route.replaceAll('/', '-') + '.png');
      await page.screenshot({ path: file, fullPage: true }); report.screenshots.push(file);
    }
    assert.deepEqual(report.errors, []); assert.deepEqual(report.missing, []);
    report.simulatedRequests = submissions.length;
    console.log('Content, cookies, menus, protected sources and 6 mocked form requests passed.');
  } finally {
    if (page && !page.isClosed()) await page.screenshot({ path: path.join(output, 'last-screen.png') }).catch(() => {});
    fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
    console.log('QA output: ' + output);
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
