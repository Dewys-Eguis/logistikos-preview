const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'docs/global-previews');
fs.mkdirSync(out,{recursive:true});
const base=pathToFileURL(path.join(root,'index.html')).href;
const routes=['/','/programas','/a-medida','/quienes-somos','/fundae','/rrhh','/universitarios','/al-dia','/area/supply-chain','/area/compras','/area/transporte','/campus'];
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({reducedMotion:'reduce'}),errors=[],report=[],footers=new Map();
 page.on('pageerror',e=>errors.push(e.message));
 try{
  for(const width of [320,375,390,430,768,900,1440]){
   await page.setViewportSize({width,height:900});
   for(const route of routes){
    await page.goto(base+'#'+route);await page.locator('#app>*').first().waitFor();await page.evaluate(()=>document.fonts.ready);
    for(const theme of ['dark','light']){
     await page.evaluate(t=>{if(document.documentElement.dataset.theme!==t)document.querySelector("[data-theme-toggle]").click();},theme);
     assert.equal(await page.locator('footer').count(),1,'One footer '+route);
     const state=await page.evaluate(()=>{
      const footer=document.querySelector('body>footer');
      const metrics=[footer,...footer.querySelectorAll('*')].map(e=>{const s=getComputedStyle(e);return [s.display,s.color,s.backgroundColor,s.fontSize,s.lineHeight,s.padding,s.gridTemplateColumns,e.getBoundingClientRect().width,e.getBoundingClientRect().height]});
      const overflow=[...document.querySelectorAll('#app h1,#app h2,#app h3,#app p,footer *')].filter(e=>{if(!e.getClientRects().length||e.closest('[hidden],details:not([open])'))return false;const r=e.getBoundingClientRect();return r.right>innerWidth+1||r.left<-1;}).map(e=>e.className);
      return {width:document.documentElement.scrollWidth,footer:metrics,overflow};
     });
     assert.equal(state.width,width,`${route} ${width} ${theme}: document overflow`);
     assert.equal(state.footer[0][2],'rgb(7, 11, 20)','Consistent dark footer closure');
     assert.deepEqual(state.overflow,[],`${route} ${width} ${theme}: text overflow`);
     const key=width+theme;if(!footers.has(key))footers.set(key,state.footer);else assert.deepEqual(state.footer,footers.get(key),`${route}: inconsistent footer ${key}`);
     assert(await page.locator('footer a[href="tel:+34696348047"]').count());
     assert(await page.locator('footer a[href="https://youtu.be/2Ji4mJ8o0eY"]').count());
     assert.equal(await page.locator('a[data-pending-href="#/area/compras"],a[href="#/area/compras"][aria-disabled="true"]').count(),0);
     assert(await page.locator('footer a[href="#/area/compras"]').count());
     assert(await page.locator('footer a[href="#/area/transporte"]').count());
     assert.equal(await page.locator('a[data-pending-href="#/area/transporte"],a[href="#/area/transporte"].is-pending-link').count(),0);
     for(const area of ['comercio-internacional','liderazgo','ia-datos']) assert.equal(await page.locator('a[href="#/area/'+area+'"]').count(),0);
     if(route==='/'){
      const boxes=await page.evaluate(()=>{const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right}};return {title:rect('#hero-title'),content:rect('.hero-content'),art:rect('.hero-logistics-art'),card:rect('.hero-stage-card'),cta:rect('.hero-content .home-actions'),wa:rect('#wa')}});
      if(width<=900){assert(boxes.title.top<260,'Early title');assert(boxes.art.top>=boxes.content.bottom-1,'Art follows content');assert(boxes.art.top-boxes.content.bottom<45,'No large gap');assert(boxes.card.left>=0&&boxes.card.right<=width,'Art card not clipped');assert(boxes.title.right<=width,'Title fits');assert(boxes.wa.top>=boxes.cta.bottom||boxes.wa.left>=boxes.cta.right,'WhatsApp does not cover CTA');}
      await page.waitForTimeout(350);await page.screenshot({path:path.join(out,`home-${theme}-${width}.png`)});
     }
     report.push({route,width,theme});
    }
   }
  }
  // Real animations: check the mobile entry transform at its start and finish.
  await page.emulateMedia({reducedMotion:'no-preference'});await page.setViewportSize({width:390,height:844});await page.goto(base+'#/');
  for(const delay of [0,1300]){if(delay)await page.waitForTimeout(delay);assert(await page.evaluate(()=>document.querySelector('.hero-logistics-art').getBoundingClientRect().top>=document.querySelector('.hero-content').getBoundingClientRect().bottom-1),'Animated art overlaps content');}
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const route of ['/','/programas','/area/compras','/area/transporte']){
   await page.goto(base+'#'+route);
   await page.locator('[data-navigation-open]:visible').click();assert(await page.locator('#architecture-menu').evaluate(e=>e.open));
   await page.locator('#architecture-menu .resource-toggle').click();assert(await page.locator('#resources-mobile').isVisible());
   await page.keyboard.press('Escape');await page.keyboard.press('Escape');assert(!await page.locator('#architecture-menu').evaluate(e=>e.open));
   const theme=await page.evaluate(()=>document.documentElement.dataset.theme);await page.locator('[data-theme-toggle]:visible').click();assert.notEqual(await page.evaluate(()=>document.documentElement.dataset.theme),theme);
   await page.locator('footer a[href="#top"]').click();assert.equal(await page.evaluate(()=>location.hash),'#'+route);assert.equal(await page.evaluate(()=>scrollY),0);
  }
  await page.setViewportSize({width:1440,height:1000});await page.goto(base+'#/programas');await page.locator('.site-nav .resource-toggle').click();assert(await page.locator('#resources-inner').isVisible());await page.keyboard.press('Escape');
  await page.locator('footer a[href="#/area/compras"]').click();await page.locator('.cp-page').waitFor();
  for(const [route,selector] of [
   ['/','.area-card[href="#/area/transporte"]'],
   ['/','.program-card a[href="#/area/transporte"]'],
   ['/area/compras','.cp-other-links a[href="#/area/transporte"]'],
   ['/area/supply-chain','.sc-other-grid a[href="#/area/transporte"]'],
   ['/al-dia','#app a[href="#/area/transporte"]'],
   ['/a-medida','footer a[href="#/area/transporte"]']
  ]){await page.goto(base+'#'+route);await page.locator(selector).first().click();await page.locator('.tr-page').waitFor();assert.equal(await page.evaluate(()=>location.hash),'#/area/transporte');}
  await page.goto(base+'#/programas');
  await page.locator('.formation-dept-btn').filter({hasText:'Tráfico y transporte'}).click();
  await page.locator('.formation-text-link[href="#/area/transporte"]').click();await page.locator('.tr-page').waitFor();
  for(const area of ['comercio-internacional','liderazgo','ia-datos']){await page.goto(base+'#/area/'+area);await page.waitForFunction(()=>location.hash==='#/programas');}
  await page.goto(base+'#/de-jefe-a-lider');await page.waitForFunction(()=>location.hash==='#/programas');
  for(const width of [390,1440]){await page.setViewportSize({width,height:1000});await page.goto(base+'#/area/compras');await page.locator('footer').screenshot({path:path.join(out,`footer-${width}.png`)});}
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({errors,checks:report.length,footerIdentical:true,comprasActive:true,transporteActive:true,pendingAreas:3,report},null,2));console.log('Global review passed: '+report.length+' route/width/theme checks; identical footer, mobile hero, menus, themes, navigation and public gating.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
