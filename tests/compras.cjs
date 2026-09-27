// Compras is approved and uses the public route. Browser dependencies may come from NODE_PATH.
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const output=path.join(root,'docs/compras-previews');
fs.mkdirSync(output,{recursive:true});
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({reducedMotion:'reduce'});
  const errors=[],report=[];
  page.on('pageerror',e=>errors.push(e.message));
  try {
    await page.goto(pathToFileURL(path.join(root,'index.html')).href+'#/area/compras');
    await page.locator('.cp-page').waitFor();
    const old=fs.readFileSync(path.join(root,'tests/fixtures/compras-before.html'),'utf8');
    const preserved=await page.evaluate(html=>{
      const doc=new DOMParser().parseFromString(html,'text/html');
      const normalize=s=>s.replace(/\s+/g,' ').trim();
      const current=normalize(document.querySelector('.cp-page').textContent);
      const leaves=[...doc.body.querySelectorAll('*')].filter(el=>!el.children.length && normalize(el.textContent));
      // Column labels are now repeated within each program; sections keep their content.
      return leaves.filter(el=>!['PROGRAMA','HORAS','MODALIDAD','NIVEL','INDICADOR'].includes(normalize(el.textContent))).map(el=>normalize(el.textContent)).filter(s=>!current.includes(s));
    },old);
    assert.deepEqual(preserved,[],'Original leaf content missing');
    assert.equal(await page.locator('.cp-program').count(),6);
    assert.equal(await page.locator('.cp-standards li').count(),4);
    assert.equal(await page.locator('.cp-audience>span').count(),5);
    const themeBefore=await page.evaluate(()=>document.documentElement.dataset.theme);
    await page.locator('[data-theme-toggle]').first().click();
    assert.notEqual(await page.evaluate(()=>document.documentElement.dataset.theme),themeBefore);
    for(const width of [1920,1440,1024,768,390,320]) {
      await page.setViewportSize({width,height:1000});
      for(const theme of ['dark','light']) {
        await page.evaluate(t=>{if(document.documentElement.dataset.theme!==t)document.querySelector("[data-theme-toggle]").click();},theme);
        await page.evaluate(()=>document.fonts.ready);
        const result=await page.evaluate(()=>({width:document.documentElement.scrollWidth,h1:getComputedStyle(document.querySelector('.cp-page h1')).fontSize,overflow:[...document.querySelectorAll('.cp-page *')].filter(el=>{
          if(!el.getClientRects().length || el.closest('details:not([open])') && !el.closest('summary'))return false;
          const r=el.getBoundingClientRect();return r.width>0&&(r.left < -1 || r.right>innerWidth+1);
        }).map(el=>el.className)}));
        assert.equal(result.width,width);assert.deepEqual(result.overflow,[]);
        report.push({width,theme,...result});
        if([1440,390].includes(width))await page.screenshot({path:path.join(output,`${theme}-${width}.png`),fullPage:true});
      }
    }
    await page.setViewportSize({width:1440,height:1000});
    for(const summary of await page.locator('.cp-page details summary').all()) {
      await summary.focus();
      const before=await summary.evaluate(el=>el.parentElement.open);
      await page.keyboard.press('Enter');
      assert.equal(await summary.evaluate(el=>el.parentElement.open),!before);
    }
    await page.getByRole('link',{name:'Explorar programas'}).click();
    assert.equal(await page.evaluate(()=>location.hash),'#/area/compras');
    const position=await page.locator('#programas').evaluate(el=>el.getBoundingClientRect().top);
    assert(position>=0 && position<200,'Program anchor scroll');
    // Test the unchanged production router (file:// compatibility).
    for(const area of ['comercio-internacional','liderazgo','ia-datos']) {
      await page.goto(pathToFileURL(path.join(root,'index.html')).href+'#/area/'+area);
      await page.waitForFunction(()=>location.hash==='#/programas');
      assert.equal(await page.locator('a[href="#/area/'+area+'"]').count(),0);
    }
    await page.goto(pathToFileURL(path.join(root,'index.html')).href+'#/area/supply-chain');
    await page.locator('.sc-page').waitFor();
    assert(await page.locator('a[href="#/area/compras"]').count()>0);
    await page.locator('.sc-other-grid a[href="#/area/compras"]').click();
    await page.locator('.cp-page').waitFor();
    assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({contentPreserved:true,keyboard:true,comprasActive:true,pendingRoutesBlocked:3,errors,report},null,2));
    console.log('Compras: original content preserved; 12 viewport/theme checks; keyboard, anchors, active route and 3 blocked routes passed.');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
