const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {pathToFileURL}=require('node:url');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),base=pathToFileURL(path.join(root,'index.html')).href;
const before=JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/simplification-before.json'),'utf8'));
const out=path.join(root,'docs/simplification-previews');fs.mkdirSync(out,{recursive:true});
(async()=>{
 for(const [file,hash]of Object.entries(before.files))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),hash,'Protected source changed: '+file);
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({reducedMotion:'reduce'}),errors=[],report=[];
 page.on('pageerror',e=>errors.push(e.message));
 const measure=()=>page.evaluate(()=>({width:innerWidth,height:document.documentElement.scrollHeight,visibleWords:document.querySelector('#app').innerText.trim().split(/\s+/).length}));
 async function overflow(label){
  const result=await page.evaluate(()=>({width:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('#app h1,#app h2,#app h3,#app p,#app summary,#app button')].filter(e=>{
   if(!e.checkVisibility({checkVisibilityCSS:true})||e.closest('[hidden],.home-sr-only'))return false;
   const r=e.getBoundingClientRect();return r.left< -1||r.right>innerWidth+1;
  }).map(e=>({tag:e.tagName,cls:e.className,text:e.textContent.slice(0,60)}))}));
  assert.equal(result.width,await page.evaluate(()=>innerWidth),label);assert.deepEqual(result.overflow,[],label);
 }
 try{
  for(const [name,reference]of Object.entries(before.pages)){
   await page.goto(base+'#'+reference.route);await page.locator('#app>*').first().waitFor();await page.evaluate(()=>document.fonts.ready);
   const unchanged=await page.evaluate(selectors=>Object.fromEntries(selectors.map(s=>[s,[...document.querySelectorAll(s)].map(e=>e.textContent.replace(/\s+/g,' ').trim())])),Object.keys(reference.protected));
   assert.deepEqual(unchanged,reference.protected,name+': program/condition/profile/figure removed');
   if(name==='formacion'){
    for(let i=0;i<6;i++){await page.locator('.formation-dept-btn').nth(i).click();assert.equal(await page.locator('.formation-panel').innerText(),reference.departments[i]);}
    await page.locator('.formation-dept-btn').first().click();
    assert.equal(await page.locator('.formation-area-links a').count(),6);
   }
   const reductions=[];
   for(const width of [320,390,768,1024,1440,1920]){
    await page.setViewportSize({width,height:1000});
    for(const theme of ['dark','light']){
     await page.evaluate(t=>{if(document.documentElement.dataset.theme!==t)document.querySelector('[data-theme-toggle]').click();},theme);
     await overflow(`${name} ${width} ${theme} closed`);
     if([390,1440].includes(width)){
      const current=await measure();const previous=reference.sizes.find(s=>s.width===width);
      assert(current.height<previous.height,name+' is not shorter');
      if(theme==='dark')reductions.push({width,before:previous,after:current,heightReductionPercent:Math.round(100*(1-current.height/previous.height)),visibleWordsReductionPercent:Math.round(100*(1-current.visibleWords/previous.visibleWords))});
      await page.waitForTimeout(350);await page.screenshot({path:path.join(out,`${name}-${theme}-${width}.png`),fullPage:true});
     }
     for(const detail of await page.locator('.content-detail').all()){
      const summary=detail.locator(':scope>summary');await summary.focus();await page.keyboard.press('Enter');assert(await detail.evaluate(e=>e.open));
     }
     await overflow(`${name} ${width} ${theme} expanded`);
     for(const detail of await page.locator('.content-detail').all()){await detail.locator(':scope>summary').focus();await page.keyboard.press('Enter');assert(!await detail.evaluate(e=>e.open));}
    }
   }
   report.push({name,reductions});
  }
  // Header, footer, Home hero and principal animation markup are unchanged after parsing.
  await page.goto(base+'#/');
  for(const [file,selectors]of [['pages/home.html',['.home-header','.home-hero','.home-manifesto']],['pages/layout.html',['.site-header','footer','#fab','#architecture-menu']]]){
   const original=execFileSync('git',['show','HEAD:'+file],{cwd:root,encoding:'utf8'});
   const actual=fs.readFileSync(path.join(root,file),'utf8');
   assert(await page.evaluate(({original,actual,selectors})=>{const parse=s=>new DOMParser().parseFromString(s,'text/html');const a=parse(original),b=parse(actual);return selectors.every(s=>a.querySelector(s).outerHTML===b.querySelector(s).outerHTML);},{original,actual,selectors}),file+' protected markup changed');
  }
  await page.setViewportSize({width:390,height:844});
  await page.locator('#home-solutions-detail>summary').click();
  for(const tab of await page.locator('.solution-tabs [role="tab"]').all()){await tab.focus();await page.keyboard.press('Enter');assert.equal(await tab.getAttribute('aria-selected'),'true');}
  for(const option of await page.locator('[data-roadmap]').all()){
   await option.click();const link=page.locator('[data-roadmap-link]');
   const href=await link.getAttribute('href');if(href)assert(['#/area/supply-chain','#/area/compras','#/area/transporte'].includes(href));else assert.equal(await link.getAttribute('aria-disabled'),'true');
  }
  await page.locator('#home-programs-detail>summary').click();await page.locator('[data-course-filter="transporte"]').click();assert.equal(await page.locator('.program-card:visible').count(),1);await page.locator('[data-course-filter="all"]').click();assert.equal(await page.locator('.program-card:visible').count(),6);
  await page.locator('.home-resource-card--fundae').click();await page.waitForFunction(()=>location.hash==='#/fundae');await page.locator('#fundae-calculadora').waitFor();
  for(const area of ['supply-chain','compras','transporte']){await page.goto(base+'#/area/'+area);await page.locator('#app .sc-btn').filter({hasText:'Ir a la calculadora'}).click();await page.waitForFunction(()=>location.hash==='#/fundae');}
  for(const area of ['comercio-internacional','liderazgo','ia-datos']){await page.goto(base+'#/area/'+area);await page.waitForFunction(()=>location.hash==='#/programas');assert.equal(await page.locator(`a[href="#/area/${area}"]`).count(),0);}
  // Motion still initializes when a progressive block opens in normal motion mode.
  await page.emulateMedia({reducedMotion:'no-preference'});await page.goto(base+'#/');await page.locator('#home-solutions-detail>summary').click();await page.locator('.solution-tabs').scrollIntoViewIfNeeded();await page.waitForTimeout(600);assert(await page.locator('.solutions-layout').evaluate(e=>e.classList.contains('is-visible')));
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({protectedSourcesUnchanged:true,programsAndCommercialDetailsPreserved:true,progressiveContentKeyboard:true,activeAreas:3,blockedAreas:3,errors,report},null,2));console.log(JSON.stringify(report,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
