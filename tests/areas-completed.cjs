const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');const {chromium}=require('playwright');const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),base=pathToFileURL(path.join(root,'index.html')).href;
const baseline=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/areas-current-before.json'),'utf8'));
const out=path.join(root,'docs/areas-completed-check');fs.mkdirSync(out,{recursive:true});
const changed=new Set(['pages/area-comercio-internacional.html','pages/area-liderazgo.html','pages/area-ia-datos.html','pages/layout.html','pages/home.html','pages/al-dia.html','assets/js/main.js','assets/js/formacion.js']);
for(const [file,hash] of Object.entries(baseline.hashes)){if(!changed.has(file))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),hash,'Protected source changed: '+file);}
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));const report={preservedSources:true,areas:{},errors};
try{
 for(const [slug,original] of Object.entries(baseline.data)){
  await page.goto(base+'#/area/'+slug);await page.waitForSelector('.ap-page');assert.equal(await page.locator('#app').getAttribute('data-view'),'tpl-area-'+slug);
  assert.equal(await page.locator('#app h1').count(),1);assert.equal((await page.locator('#app h1').innerText()).replace(/\s+/g,' '),original.title);
  const current=await page.locator('.ap-program').evaluateAll(nodes=>nodes.map(n=>({title:n.querySelector('.ap-program-title').textContent,hours:n.querySelector('[data-program-hours]').textContent,mode:n.querySelector('[data-program-mode]').textContent,level:n.querySelector('[data-program-level]').textContent,kpi:n.querySelector('[data-program-kpi]').textContent,badge:n.querySelector('.ap-badge')?.textContent||'',flagship:!!n.querySelector('a[href="#de-jefe-a-lider"]')})));
  assert.deepEqual(current.sort((a,b)=>a.title.localeCompare(b.title)),[...original.programs].sort((a,b)=>a.title.localeCompare(b.title)),'Program data preserved: '+slug);
  const text=await page.locator('.ap-page').evaluate(n=>n.textContent.replace(/\s+/g,' ').trim());
  for(const value of [original.lead,original.claim,...original.audience,...original.steps,...original.norms,original.trainer,original.trainerChoice,...original.demand,...Object.values(original.funding),...original.problems.flatMap(p=>Object.values(p))]) assert(text.includes(value),slug+' lost content '+value);
  if(original.flagship){const f=original.flagship;for(const value of [f.lead,f.claim,...f.facts,...f.audience,...f.sessions.flatMap(s=>Object.values(s)),...f.metrics.flatMap(m=>Object.values(m)),f.fundingAmount])assert(text.includes(value),'Leadership lost '+value);}
  const image=page.locator('.ap-photo img');await image.evaluate(img=>img.decode());assert(await image.evaluate(img=>img.naturalWidth>0));
  const summary=page.locator('.ap-program').nth(1).locator('summary');await summary.focus();await page.keyboard.press('Enter');assert(await summary.evaluate(n=>n.parentElement.open));await page.keyboard.press('Enter');assert.equal(await summary.evaluate(n=>n.parentElement.open),false);
  await page.locator('.ap-topics a').last().click();const href=await page.locator('.ap-topics a').last().getAttribute('href');assert(await page.locator(href).evaluate(n=>n.open));
  for(const width of [320,390,768,1024,1440]){await page.setViewportSize({width,height:900});for(const theme of ['dark','light']){
   await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);await page.evaluate(()=>document.fonts.ready);
   await page.locator('.ap-page details').evaluateAll(nodes=>nodes.forEach(n=>n.open=true));
   const overflow=await page.evaluate(()=>({page:document.documentElement.scrollWidth>innerWidth+1,nodes:[...document.querySelectorAll('.ap-page *')].filter(n=>n.getBoundingClientRect().width&&n.getBoundingClientRect().right>innerWidth+1).map(n=>n.className)}));assert.deepEqual(overflow,{page:false,nodes:[]},slug+' '+width+' '+theme+' overflow');
   if([390,1440].includes(width)){await page.locator('.ap-page details').evaluateAll(nodes=>nodes.forEach(n=>n.open=n.classList.contains('ap-program')&&n===document.querySelector('.ap-program')));await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,slug+'-'+width+'-'+theme+'.png'),fullPage:true});await page.screenshot({path:path.join(out,slug+'-'+width+'-'+theme+'-hero.png')});}
  }}
  const anchors=await page.locator('.ap-page a[href^="#"]:not([href^="#/"])').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')));for(const href of anchors){if(href==='#contacto')continue;assert.equal(await page.locator(href).count(),1,slug+' missing anchor '+href);}
  await page.goto(base+'#/area/'+slug+'#program-1');await page.waitForSelector('.ap-page');assert(await page.locator('#program-1').evaluate(n=>n.open));assert(await page.locator('#program-1').evaluate(n=>{const r=n.getBoundingClientRect();return r.top>=0&&r.top<innerHeight;}));
  report.areas[slug]={programs:current.length,contentPreserved:true,viewports:[320,390,768,1024,1440],themes:['dark','light'],anchors:true,keyboard:true,image:true};
 }
 await page.goto(base+'#/de-jefe-a-lider');await page.waitForSelector('#de-jefe-a-lider');assert.equal(await page.locator('#app').getAttribute('data-view'),'tpl-area-liderazgo');
 await page.goto(base+'#/programas');await page.waitForSelector('#program-query');
 const prior=JSON.parse(fs.readFileSync(path.join(root,'docs/search-radar-check/results.json'),'utf8')).catalog;
 const titles=await page.locator('.formation-search-result h3').allTextContents();for(const p of prior)assert(titles.includes(p.title),'Search lost '+p.title);
 for(const slug of Object.keys(baseline.data)){await page.selectOption('#program-area',slug);assert.equal(await page.locator('#program-results .formation-search-pending').count(),0);assert(await page.locator('#program-results a').count()>0);await page.locator('#program-results a').first().click();await page.waitForSelector('[data-area="'+slug+'"]');await page.goto(base+'#/programas');}
 // Existing desktop navigation and the shared mobile menu both open all three areas.
 for(const width of [1440,390]){await page.setViewportSize({width,height:900});for(const slug of Object.keys(baseline.data)){
  await page.goto(base+'#/');if(width===390){await page.locator('[data-navigation-open]:visible').click();await page.locator('[aria-controls="formation-mobile"]').click();await page.locator('#formation-mobile a[href="#/area/'+slug+'"]').click();}
  else {await page.locator('[aria-controls="formation-home"]').click();await page.locator('#formation-home a[href="#/area/'+slug+'"]').click();}
  await page.waitForSelector('[data-area="'+slug+'"]');assert.equal(await page.locator('a[data-pending-href^="#/area/"]').count(),0);
 }}
 await page.goto(base+'#/al-dia');assert.equal(await page.locator('[data-radar-topic="Liderazgo"] a[href="#/area/liderazgo"]').count(),1);
 for(const slug of Object.keys(baseline.data)){await page.goto(base+'#/area/'+slug);await page.locator('.ap-actions a[href^="#/diagnostico?tema="]').first().click();await page.waitForFunction(()=>document.querySelector('#app').getAttribute('data-view')==='tpl-page-diagnostico');assert((await page.locator('[data-diagnostic-origin]').inputValue()).includes('·'),slug+' sin origen en el formulario');}
 await page.locator('[data-theme-toggle]:visible').first().click();const themeAfter=await page.locator('html').getAttribute('data-theme');await page.reload();assert.equal(await page.locator('html').getAttribute('data-theme'),themeAfter);await page.emulateMedia({reducedMotion:'no-preference'});await page.goto(base+'#/area/liderazgo');await page.locator('.ap-program summary').first().click();
 assert.deepEqual(errors,[]);report.searchPreserved=true;report.navigation=true;report.build='npm run build';fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
