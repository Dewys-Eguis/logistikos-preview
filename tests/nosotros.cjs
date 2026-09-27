const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {chromium} = require('playwright');
const root = path.resolve(__dirname,'..');
const fixture = require('./fixtures/nosotros-content.json');
const output = path.join(root,'docs/nosotros-previews');
const url = pathToFileURL(path.join(root,'index.html')).href;
fs.mkdirSync(output,{recursive:true});
const normalize = value => value.replace(/\s+/g,'');

async function revealPage(page) {
  await page.evaluate(async () => {
    for(let y=0;y<document.documentElement.scrollHeight;y+=650) {
      scrollTo({top:y,behavior:'instant'});
      await new Promise(resolve=>setTimeout(resolve,100));
    }
    scrollTo({top:0,behavior:'instant'});
  });
  await page.waitForTimeout(900);
}
async function chromeSnapshot(page) {
  return page.evaluate(() => [...document.querySelectorAll('body > header,body > header *,#wa,#wa *')].map(el=>{
    const s=getComputedStyle(el);
    return [el.tagName,el.getAttribute('class'),el.getAttribute('href'),el.textContent,
      ...['display','position','fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','color','backgroundColor','padding','margin','gap','border','width','height'].map(p=>s[p])];
  }));
}
(async()=>{
  const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'msedge'});
  const page=await browser.newPage();
  const errors=[],report=[];
  page.on('pageerror',e=>errors.push(e.message));
  try {
    await page.goto(url+'#/quienes-somos');
    assert.equal(await page.locator('html').getAttribute('data-theme'),'dark','Default theme');
    const text=normalize(await page.locator('.about-view').textContent());
    fixture.texts.forEach(value=>assert(text.includes(normalize(value)),'Missing original text: '+value));
    assert.deepEqual(await page.locator('.about-logo-grid img').evaluateAll(nodes=>nodes.map(el=>({src:el.getAttribute('src'),alt:el.alt}))),fixture.logos);
    await page.locator('.about-metrics').evaluate(el=>el.scrollIntoView({behavior:'instant',block:'center'}));
    await page.waitForTimeout(350);
    assert.notDeepEqual(await page.locator('[data-about-count]').allTextContents(),['20','20.000','4'],'Counters should progress');
    await page.waitForTimeout(1500);
    assert.deepEqual(await page.locator('[data-about-count]').allTextContents(),['20','20.000','4']);
    for(const width of [1920,1440,1024,768,390]) {
      await page.setViewportSize({width,height:1000});
      for(const theme of ['dark','light']) {
        if(await page.locator('html').getAttribute('data-theme')!==theme) await page.locator('.site-header [data-theme-toggle]').click();
        await page.evaluate(()=>document.fonts.ready);
        await revealPage(page);
        const result=await page.evaluate(()=>{
          const view=document.querySelector('.about-view');
          const style=el=>getComputedStyle(el);
          const headings=[...view.querySelectorAll('h1,h2,h3')].map(el=>({tag:el.tagName,size:style(el).fontSize,lineHeight:style(el).lineHeight}));
          const overflow=[...view.querySelectorAll('h1,h2,h3,p,dt,dd,a')].filter(el=>{
            const r=el.getBoundingClientRect();
            return r.width && (r.left < -1 || r.right > innerWidth+1 || el.scrollWidth>el.clientWidth+1);
          }).map(el=>({tag:el.tagName,text:el.textContent}));
          return {headings,overflow,documentWidth:document.documentElement.scrollWidth,
            fontLoaded:document.fonts.check('500 44px Archivo'),
            brokenImages:[...view.querySelectorAll('img')].filter(el=>!el.complete||!el.naturalWidth).map(el=>el.src),
            hiddenReveals:[...view.querySelectorAll('[data-about-reveal]')].filter(el=>style(el).opacity!=='1').length,
            viewBackground:style(view).backgroundColor,viewColor:style(view).color,
            buttonColor:style(view.querySelector('.about-button')).color};
        });
        assert.equal(result.documentWidth,width);
        assert.deepEqual(result.overflow,[]);
        assert.deepEqual(result.brokenImages,[]);
        assert.equal(result.hiddenReveals,0);
        assert(result.fontLoaded);
        assert.equal(result.buttonColor,'rgb(255, 255, 255)');
        const expectedHero=Math.max(44,Math.min(76,32+width*.031));
        for(const heading of result.headings) {
          const expected=heading.tag==='H1'?expectedHero:heading.tag==='H2'?Math.max(34,Math.min(60,width*.04)):Math.max(24,Math.min(30,22+width*.0055));
          assert(Math.abs(parseFloat(heading.size)-expected)<.02,JSON.stringify(heading));
        }
        const chrome=await chromeSnapshot(page);
        await page.evaluate(()=>{[...document.styleSheets].find(s=>s.href?.endsWith('/nosotros.css')).disabled=true;});
        assert.deepEqual(await chromeSnapshot(page),chrome,'Shared header/WhatsApp changed');
        await page.evaluate(()=>{[...document.styleSheets].find(s=>s.href?.endsWith('/nosotros.css')).disabled=false;});
        await page.waitForTimeout(900);
        await page.screenshot({path:path.join(output,theme+'-'+width+'.png'),fullPage:true});
        report.push({width,theme,...result,headerAndWhatsAppUnchanged:true});
      }
    }
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.waitForFunction(()=>!document.querySelector('.about-view').classList.contains('about-motion'));
    assert.equal(await page.locator('.about-view').evaluate(el=>el.classList.contains('about-motion')),false);
    await page.locator('.about-hero a[href="#nuestros-logistikos"]').click();
    assert(await page.locator('#nuestros-logistikos').evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.top<innerHeight;}));
    await page.locator('.about-final a').click();
    assert(await page.locator('#contacto').evaluate(el=>el.getBoundingClientRect().top<innerHeight));
    const theme=await page.locator('html').getAttribute('data-theme');
    await page.reload();
    assert.equal(await page.locator('html').getAttribute('data-theme'),theme,'Saved theme');
    assert.deepEqual(await page.locator('.about-metrics dd').allTextContents(),['20+','20.000+','4']);
    for(const route of ['/','/programas','/a-medida','/quienes-somos']) {
      await page.goto(url+'#'+route);
      await page.locator('#app h1').waitFor();
      assert(await page.locator('#app h1').innerText());
    }
    assert.equal(await page.locator('.site-nav [aria-current="page"]').getAttribute('href'),'#/quienes-somos');
    assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({report,errors,checks:[
      'Original text and all 12 logos preserved','10 viewport/theme combinations',
      'Global heading scale','No text overflow or missing images','Header and WhatsApp unaffected',
      'All scroll reveals visible','Counters progress and finish at original values','Reduced motion','Internal CTA anchors',
      'Theme persistence','Route transitions and active navigation'
    ]},null,2));
    console.log('Nosotros: 10 viewport/theme combinations passed; content, logos, shared chrome, motion, anchors and routing verified.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
