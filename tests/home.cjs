const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const url=pathToFileURL(path.join(root,'index.html')).href;
(async()=>{
  const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'msedge'});
  try {
    const context=await browser.newContext({reducedMotion:'reduce'});
    const page=await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    const output=path.join(root,'docs/phase2-previews');fs.mkdirSync(output,{recursive:true});
    const report={widths:[],errors,checks:[]};
    for(const width of [390,430,768,1024,1440,1920]) {
      await page.setViewportSize({width,height:1000});await page.goto(url+'#/');
      await page.evaluate(()=>document.fonts.ready);
      const result=await page.evaluate(()=>{
        const visible=el=>!!(el.offsetWidth||el.offsetHeight||el.getClientRects().length)&&getComputedStyle(el).visibility!=='hidden';
        const overflow=[...document.querySelectorAll('.home-view *')].filter(el=>{
          if(!visible(el)||el.closest('[aria-hidden="true"],.partner-window,.home-menu:not([open])')||el.matches('svg,svg *,.home-sr-only,.home-skip,.hero-system,.hero-aura,.hero-grid,.area-art,.program-orbit,.news-art i,.cta-sphere,.solution-watermark'))return false;
          const r=el.getBoundingClientRect();return r.left< -1||r.right>innerWidth+1;
        }).map(el=>({tag:el.tagName,class:el.className,text:el.textContent.slice(0,60)}));
        return {documentWidth:document.documentElement.scrollWidth,viewport:innerWidth,overflow};
      });
      report.widths.push({width,...result});
      await page.screenshot({path:path.join(output,`home-${width}.png`)});
      if(width===1440)await page.screenshot({path:path.join(output,'home-full-desktop.png'),fullPage:true});
      if(width<1100) {
        await page.getByRole('button',{name:'Abrir menú',exact:true}).click();
        assert(await page.locator('#architecture-menu').isVisible());
        assert.equal(await page.locator('.home-header [data-navigation-open]').getAttribute('aria-expanded'),'true');
        await page.keyboard.press('Escape');
        assert(!(await page.locator('#architecture-menu').isVisible()));
      } else assert(!(await page.locator('.home-header [data-navigation-open]').isVisible()));
    }
    fs.writeFileSync(path.join(root,'docs/verificacion-home.json'),JSON.stringify(report,null,2));
    for(const viewport of report.widths){assert.equal(viewport.documentWidth,viewport.width);assert.deepEqual(viewport.overflow,[],`Overflow at ${viewport.width}`);}
    report.checks.push('No content overflow at all six requested widths; mobile menu opens and Escape closes');
    await page.setViewportSize({width:1440,height:1000});
    await page.locator('#home-solutions-detail > summary').click();
    const tabs=page.locator('[role=tab]');
    await tabs.nth(1).click();assert.equal(await tabs.nth(1).getAttribute('aria-selected'),'true');
    assert(await page.locator('#solution-talent').isVisible());
    await tabs.nth(1).focus();await page.keyboard.press('End');assert.equal(await tabs.last().getAttribute('aria-selected'),'true');
    await page.keyboard.press('Home');assert.equal(await tabs.first().getAttribute('aria-selected'),'true');
    assert.equal(await page.locator('[role=tabpanel]:visible').count(),1);
    report.checks.push('Solutions: mouse and keyboard tabs, focus, ARIA, only one visible panel');
    await page.locator('#home-programs-detail > summary').click();
    for(const filter of await page.locator('[data-course-filter]').all()){
      await filter.click();const id=await filter.getAttribute('data-course-filter');
      assert.equal(await page.locator('[data-course-area]:visible').count(),id==='all'?6:1);
    }
    await page.locator('[data-course-filter=all]').click();
    report.checks.push('All seven program filters reuse the existing catalog');
    await page.locator('#fundae a[href="#/fundae"]').first().click();
    await page.locator('#credit-employees').fill('5');await page.locator('#credit-employees').blur();
    await page.locator('#credit-salary').fill('0');await page.locator('#credit-salary').blur();
    assert.equal(await page.locator('#credit-annual').textContent(),'420 €');
    await page.locator('#credit-used').fill('500');await page.locator('#credit-used').blur();
    assert.equal(await page.locator('#credit-available').textContent(),'0 €');
    await page.goto(url+'#/');
    await page.locator('#home-solutions-detail > summary').click();
    report.checks.push('Dedicated FUNDAE calculator: minimum and consumed credit');
    for(const button of await page.locator('[data-roadmap]').all()){
      await button.click();assert.equal(await button.getAttribute('aria-pressed'),'true');
      const link=page.locator('[data-roadmap-link]');
      const href=await link.getAttribute('href');
      if(href)assert.match(href,/^#\/area\//);
      else assert.equal(await link.getAttribute('aria-disabled'),'true');
    }
    report.checks.push('All six roadmap examples, route and KPI update');
    const links=await page.locator('.home-view a').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')));
    const broken=[];
    for(const href of [...new Set(links.filter(x=>x&&x.startsWith('#')&&!x.startsWith('#/')))]){
      if(!await page.evaluate(id=>!!document.getElementById(id),href==='#contacto'?'home-contacto':href.slice(1)))broken.push(href);
    }
    assert.deepEqual(broken,[]);
    const internalRoutes=[...new Set(links.filter(x=>x&&x.startsWith('#/')))];
    for(const href of internalRoutes){await page.goto(url+href);assert(await page.locator('#app').innerText());assert(!/\{\{/.test(await page.locator('#app').innerHTML()));}
    report.checks.push(`${internalRoutes.length} distinct internal destinations and all local anchors resolve`);
    await page.goto(url+'#/');
    assert.equal(await page.locator('.partner-track ul:not([aria-hidden]) img').count(),12);
    assert.equal(await page.locator('.partner-track').first().evaluate(el=>getComputedStyle(el).animationName),'none');
    assert.equal(await page.locator('.manifesto-sticky').evaluate(el=>getComputedStyle(el).position),'static');
    report.checks.push('Reduced motion: no marquee, no sticky timeline, all content visible');
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.locator('#metodo').scrollIntoViewIfNeeded();await page.waitForTimeout(850);
    assert(await page.locator('.home-header').evaluate(el=>el.classList.contains('is-scrolled')));
    assert.equal(await page.locator('.partner-track').first().evaluate(el=>getComputedStyle(el).animationName),'home-marquee');
    report.checks.push('Motion: scrolled navbar, reveal lifecycle, active marquee');
    await page.emulateMedia({reducedMotion:'reduce'});
    assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(root,'docs/verificacion-home.json'),JSON.stringify(report,null,2));
    console.log(JSON.stringify(report,null,2));
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

