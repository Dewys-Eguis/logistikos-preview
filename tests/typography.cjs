// Visual audit: run with Playwright available in node_modules or NODE_PATH.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {pathToFileURL} = require('node:url');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'docs/typography-previews');
fs.mkdirSync(output, {recursive:true});
(async () => {
  const browser = await chromium.launch({channel:'msedge', headless:true});
  const page = await browser.newPage();
  const report = [];
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  try {
    for (const width of [1920,1440,1024,768,390]) {
      await page.setViewportSize({width,height:1000});
      for (const [name,route,scope] of [
        ['home','/','.home-view'], ['formacion','/programas','.formation-view'],
        ['empresas','/a-medida','.custom-page--companies']
      ]) {
        await page.goto(pathToFileURL(path.join(root,'index.html')).href + '#' + route);
        await page.locator(scope + ' h1').waitFor();
        await page.evaluate(() => document.fonts.ready);
        // Scroll through the page to let the existing reveal animations finish.
        await page.evaluate(async () => {
          for(let y=0;y<document.documentElement.scrollHeight;y+=750) {
            scrollTo({top:y,behavior:'instant'}); await new Promise(r=>setTimeout(r,100));
          }
          scrollTo({top:0,behavior:'instant'});
        });
        await page.waitForTimeout(800);
        const result = await page.evaluate(scope => {
          const h1 = document.querySelector(scope+' h1');
          const style = getComputedStyle(h1);
          const overflow = [...document.querySelectorAll(scope+' h1,'+scope+' h2,'+scope+' h3,'+scope+' p')].filter(el=>{
            if(!el.getClientRects().length || el.closest('[aria-hidden="true"],dialog:not([open]),[hidden],.home-sr-only')) return false;
            const r=el.getBoundingClientRect();
            return r.left < -1 || r.right > innerWidth+1 || el.scrollWidth > el.clientWidth+1;
          }).map(el=>({tag:el.tagName, text:el.textContent.trim().slice(0,90)}));
          return {size:style.fontSize,lineHeight:style.lineHeight,tracking:style.letterSpacing,
            fontLoaded:document.fonts.check('500 44px Archivo'),
            h2:[...new Set([...document.querySelectorAll(scope+' section h2')].map(el=>getComputedStyle(el).fontSize))],
            documentWidth:document.documentElement.scrollWidth,overflow};
        },scope);
        report.push({name,width,...result});
        await page.screenshot({path:path.join(output,`${name}-${width}.png`),fullPage:true});
        // Theme parity: same metrics in the other mode.
        await page.evaluate(()=>document.querySelector('[data-theme-toggle]').click());
        const alternate = await page.locator(scope+' h1').evaluate(el=>getComputedStyle(el).fontSize);
        assert.equal(alternate,result.size);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width);
        await page.evaluate(()=>document.querySelector('[data-theme-toggle]').click());
      }
    }
    fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({report,errors},null,2));
    for(const item of report) {
      assert.equal(item.documentWidth,item.width,JSON.stringify(item));
      assert.deepEqual(item.overflow,[],JSON.stringify(item));
      assert(item.fontLoaded,'Archivo not loaded');
    }
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify(report,null,2));
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
