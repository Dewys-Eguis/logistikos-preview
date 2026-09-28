const {chromium}=require('playwright');const assert=require('node:assert/strict');const fs=require('fs');const {pathToFileURL}=require('url');const path=require('path');
const base=pathToFileURL(path.resolve('index.html')).href;
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));const report={};
try{
await page.goto(base+'#/programas');await page.waitForSelector('#program-query');
report.catalog=await page.locator('.formation-search-result').evaluateAll(nodes=>nodes.map(n=>({title:n.querySelector('h3').textContent,area:n.querySelector('p').textContent})));
assert(report.catalog.length>=42);
for(const area of ['supply-chain','compras','transporte','comercio-internacional','liderazgo','ia-datos']){
 await page.selectOption('#program-area',area);assert(await page.locator('.formation-search-result').count()>0);
 assert(await page.locator('#program-results a').count()>0);assert.equal(await page.locator('#program-results .formation-search-pending').count(),0);
}
await page.click('#program-clear');await page.fill('#program-query','ALMACEN');assert(await page.locator('.formation-search-result').count()>0);
await page.fill('#program-query','zzzzzz');assert.equal(await page.locator('.formation-search-result').count(),0);await page.click('#program-clear');
for(const route of ['/programas','/al-dia','/','/quienes-somos']){for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});await page.goto(base+'#'+route);for(const theme of ['dark','light']){await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),route+' '+width+' '+theme);}}}
for(const area of ['comercio-internacional','liderazgo','ia-datos']){await page.goto(base+'#/area/'+area);await page.waitForSelector('.ap-page');assert.equal(await page.locator('#app').getAttribute('data-view'),'tpl-area-'+area);}
await page.goto(base+'#/al-dia');assert.equal(await page.locator('[data-radar-topic]').count(),3);assert.equal(await page.locator('.alday-feed-grid .alday-update-card').count(),11);
for(const route of ['/','/quienes-somos']){await page.goto(base+'#'+route);const selector=route==='/'?'[data-count]':'[data-about-count]';const all=await page.locator(selector).allTextContents();for(const value of ['130','1.160','20.000','4'])assert(all.includes(value),value);}
await page.emulateMedia({reducedMotion:'no-preference'});await page.reload();await page.waitForSelector('[data-about-count]');const count=page.locator('[data-about-count="1160"]');assert.equal(await count.textContent(),'0');await count.scrollIntoViewIfNeeded();await page.waitForTimeout(350);const mid=Number((await count.textContent()).replaceAll('.',''));assert(mid>0&&mid<1160);await page.waitForTimeout(1300);assert.equal(await count.textContent(),'1.160');await page.goto(base+'#/programas');await page.goto(base+'#/quienes-somos');assert.equal(await count.textContent(),'1.160');
await page.reload();await page.waitForSelector('[data-about-count]');await count.scrollIntoViewIfNeeded();await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('[data-about-count="1160"]').textContent==='1.160');assert.equal(await count.textContent(),'1.160');
await page.goto(base+'#/programas');await page.setViewportSize({width:1440,height:1000});await page.locator('.formation-search').scrollIntoViewIfNeeded();fs.mkdirSync('docs/search-radar-check',{recursive:true});await page.screenshot({path:'docs/search-radar-check/desktop.png'});await page.setViewportSize({width:390,height:844});await page.evaluate(()=>document.documentElement.dataset.theme='light');await page.screenshot({path:'docs/search-radar-check/mobile-light.png'});
assert.deepEqual(errors,[]);report.errors=errors;report.checks='Search, six filters, accents, empty state, active routes, counters, reduced motion, route revisits, 320/390/768/1440px dark/light overflow passed';fs.writeFileSync('docs/search-radar-check/results.json',JSON.stringify(report,null,2));console.log(report.checks);console.log('Indexed '+report.catalog.length+' programs');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
