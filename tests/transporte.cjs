// Start scripts/preview-area.cjs before running. NODE_PATH may supply Playwright.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'docs/transporte-previews');
fs.mkdirSync(out,{recursive:true});
const preview='http://127.0.0.1:4173/#/area/transporte';
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({reducedMotion:'reduce'}),errors=[],report=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(preview);await page.locator('.tr-page').waitFor();
  const old=fs.readFileSync(path.join(root,'tests/fixtures/transporte-before.html'),'utf8');
  const preservation=await page.evaluate(html=>{
   const doc=new DOMParser().parseFromString(html,'text/html');const normalize=s=>s.replace(/\s+/g,' ').trim();
   const current=normalize(document.querySelector('.tr-page').textContent);
   const missing=[...doc.body.querySelectorAll('*')].filter(e=>!e.children.length&&normalize(e.textContent)&&!['PROGRAMA','HORAS','MODALIDAD','NIVEL','INDICADOR'].includes(normalize(e.textContent))).map(e=>normalize(e.textContent)).filter(s=>!current.includes(s));
   const programs=[...doc.querySelectorAll('.legacy-379')].map((row,i)=>({original:[...row.children].slice(0,5).map(e=>normalize(e.textContent)),present:normalize(document.querySelectorAll('.tr-program')[i].textContent)}));
   return {missing,programs};
  },old);
  assert.deepEqual(preservation.missing,[]);for(const p of preservation.programs)for(const value of p.original)assert(p.present.includes(value),value);
  assert.equal(await page.locator('.tr-program').count(),6);assert.equal(await page.locator('.tr-standards li').count(),6);assert.equal(await page.locator('.tr-steps li').count(),4);assert.equal(await page.locator('.tr-audience>span').count(),5);
  for(const width of [320,375,390,430,768,900,1024,1440,1920]){
   await page.setViewportSize({width,height:1000});
   for(const theme of ['dark','light']){
    await page.evaluate(t=>{if(document.documentElement.dataset.theme!==t)document.querySelector("[data-theme-toggle]").click();},theme);await page.evaluate(()=>document.fonts.ready);
    const result=await page.evaluate(()=>({width:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('.tr-page *')].filter(e=>{if(!e.getClientRects().length||e.closest('[hidden],svg')||e.closest('details:not([open])')&&!e.closest('summary'))return false;const r=e.getBoundingClientRect();return r.right>innerWidth+1||r.left<-1;}).map(e=>e.className)}));
    assert.equal(result.width,width,`${theme} ${width}`);assert.deepEqual(result.overflow,[],`${theme} ${width}`);report.push({width,theme});
    if([390,1440].includes(width)){await page.waitForTimeout(350);await page.screenshot({path:path.join(out,`${theme}-${width}.png`),fullPage:true});}
   }
  }
  await page.setViewportSize({width:390,height:844});
  for(const category of ['operacion','costes','cumplimiento']){
   const filter=page.locator(`[data-transport-filter="${category}"]`);await filter.focus();await page.keyboard.press('Enter');assert.equal(await filter.getAttribute('aria-pressed'),'true');assert.equal(await page.locator('.tr-program:visible').count(),2);assert.equal(await page.locator('[data-transport-count]').textContent(),'2 programas');
   for(const summary of await page.locator('.tr-program:visible summary').all()){await summary.focus();const before=await summary.evaluate(e=>e.parentElement.open);await page.keyboard.press('Space');assert.equal(await summary.evaluate(e=>e.parentElement.open),!before);}
  }
  await page.getByRole('button',{name:'Todos',exact:true}).click();assert.equal(await page.locator('.tr-program:visible').count(),6);
  await page.locator('.tr-demand summary').click();assert(await page.locator('.tr-demand').evaluate(e=>e.open));
  await page.screenshot({path:path.join(out,'interaction-light-390.png'),fullPage:true});
  // No duplicate listeners after leaving/re-entering; filters start from the complete list.
  await page.locator('.tr-other-links a[href="#/area/compras"]').click();await page.locator('.cp-page').waitFor();
  await page.goto(preview);await page.getByRole('button',{name:'Operación',exact:true}).click();assert.equal(await page.locator('.tr-program:visible').count(),2);
  await page.getByRole('link',{name:'Explorar programas',exact:false}).first().click();assert.equal(await page.evaluate(()=>location.hash),'#/area/transporte');
  await page.getByRole('link',{name:'Hablar de vuestro reto'}).click();assert(await page.locator('footer').isVisible());
  await page.getByRole('link',{name:'Ir a la calculadora'}).click();await page.waitForFunction(()=>location.hash==='#/s/fundae');await page.locator('#home-credit').waitFor();
  // Assets are loaded over HTTP, the same relative paths GitHub Pages uses.
  const broken=[];await page.goto(preview);for(const image of await page.locator('img').all())if(!await image.evaluate(e=>e.complete&&e.naturalWidth>0))broken.push(await image.getAttribute('src'));assert.deepEqual(broken,[]);
  // Approved Transporte is reachable in the public build; the three other areas stay gated.
  await page.goto(pathToFileURL(path.join(root,'index.html')).href+'#/area/transporte');await page.locator('.tr-page').waitFor();
  for(const area of ['comercio-internacional','liderazgo','ia-datos']){await page.goto(pathToFileURL(path.join(root,'index.html')).href+'#/area/'+area);await page.waitForFunction(()=>location.hash==='#/programas');}
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({contentPreserved:true,programMetadataPreserved:true,filtersAndKeyboard:true,transporteActive:true,publicRoutesBlocked:3,errors,report},null,2));console.log('Transporte: original content and program metadata preserved; 18 responsive/theme checks; keyboard, filters, navigation and blocked public routes passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
