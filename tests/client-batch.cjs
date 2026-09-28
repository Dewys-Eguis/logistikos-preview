const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),base=pathToFileURL(path.join(root,'index.html')).href;
const before=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/client-batch-before.json'),'utf8'));
const out=path.join(root,'docs/client-batch-previews');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
const page=await browser.newPage({reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(base+'#/');
// Program source fields remain identical except the explicitly requested badge wording.
for(const [file,selector] of [['pages/area-supply-chain.html','.sc-program'],['pages/area-compras.html','.cp-program'],['pages/area-transporte.html','.tr-program']]){
const now=fs.readFileSync(path.join(root,file),'utf8');
const texts=await page.evaluate(({old,now,selector})=>{const extract=s=>Array.from(new DOMParser().parseFromString(s,'text/html').querySelectorAll(selector),x=>x.textContent.replace(/MÁS DEMANDADO/g,'PRIORIDAD 2026').replace(/\s+/g,' ').trim());return [extract(old),extract(now)]},{old:before[file],now,selector});
assert.equal(texts[0].length,6);assert.deepEqual(texts[0],texts[1]);}
assert.equal(fs.readFileSync(path.join(root,'assets/js/courses.js'),'utf8').replace(/\r/g,''),before['assets/js/courses.js'].replaceAll('Más demandado','Prioridad 2026'));
for(const route of ['/','/quienes-somos','/campus','/universitarios','/a-medida']){
for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});await page.goto(base+'#'+route);
for(const theme of ['dark','light']){
await page.evaluate(t=>{document.documentElement.dataset.theme=t;localStorage.setItem('logistikos-theme',t)},theme);
await page.evaluate(()=>document.fonts.ready);
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${route} ${width} ${theme} overflow`);
const text=await page.locator('#app').innerText();
assert(!/20\+ años|veinte años|20 años|formaciones al año|Executive Programs|PROGRAMA EXECUTIVE/i.test(text));
if(route==='/'){assert.equal(await page.locator('.partner-track,.home-partners').count(),0);assert(text.includes('[X]'));assert(text.includes('Pendiente de confirmación'));assert(text.includes('formaciones acumuladas'));assert.equal(await page.locator('#home-solutions-detail:not([open])').count(),1);}
if(route==='/quienes-somos'){assert.equal(await page.locator('.about-logo-grid,.about-monogram').count(),0);assert.equal(await page.locator('.about-direction-grid > .about-direction-copy').count(),1);const photo=page.locator('.about-director-photo');await photo.scrollIntoViewIfNeeded();await photo.evaluate(img=>img.decode());assert(await photo.evaluate(img=>img.getBoundingClientRect().width<=200));assert(text.includes('más de 1.500 profesionales formados'));}
if(route==='/campus'){assert(text.includes('Próximamente'));assert.equal(await page.locator('#app input,#app form,.campus-live-card').count(),0);assert(!text.includes('SESIÓN ACTIVA'));}
if(route==='/universitarios'){assert.equal(await page.locator('.uni-executive').count(),0);assert(await page.evaluate(source=>new DOMParser().parseFromString(source,'text/html').querySelector('#executive-programs-inactive').content.querySelectorAll('.uni-executive-card').length===2,fs.readFileSync(path.join(root,'pages/universitarios.html'),'utf8')));}
for(const detail of await page.locator('.guarantee-conditions').all()){await detail.evaluate(el=>{for(let p=el.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true});await detail.locator('summary').click();assert(await detail.locator('p').isVisible());assert.match(await detail.innerText(),/pendiente de confirmación/);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await detail.locator('summary').click();}
if([390,1440].includes(width)){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,`${route.slice(1)||'home'}-${theme}-${width}.png`),fullPage:true});}
}}}
assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({checks:40,errors,programs:'18 area programs and full catalog preserved, only authorized badge changes',campus:'coming soon',executive:'2 programs preserved in inert template'},null,2));console.log('Client batch passed: 40 route/viewport/theme combinations; guarantees, portrait, campus, Executive visibility, catalog and 18 area programs. No JavaScript errors or overflow.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
