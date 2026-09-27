const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const fixture=require('./fixtures/fundae-before.json');
const source=fs.readFileSync(path.join(root,'assets/js/calculator.js'),'utf8');
assert.equal(crypto.createHash('sha256').update(source).digest('hex'),fixture.calculatorHash,'Calculator source changed');
const context=vm.createContext({});
vm.runInContext(source+fs.readFileSync(path.join(root,'assets/js/courses.js'),'utf8'),context);
function values(state) {
  context.subject={state:{...state},props:{},setState(p){Object.assign(this.state,p);}};
  return vm.runInContext('getCalculatorValues.call(subject,getCourseValues.call(subject).data)',context);
}
for(const scenario of fixture.scenarios) assert.deepEqual(JSON.parse(JSON.stringify(values(scenario.state))),scenario.values);
const initial={plantilla:'80',salario:'28000',consumido:'0',courseIdx:'17',participantes:'12',horas:'20',modo:'hib',nivel:'sup'};
const output=path.join(root,'docs/fundae-previews');
fs.mkdirSync(output,{recursive:true});
const url=pathToFileURL(path.join(root,'index.html')).href;
const normalize=s=>s.replace(/\s+/g,'');
const reports=[],errors=[];
async function measure(page) {
  return page.evaluate(()=>{
    const view=document.querySelector('.credit-view');
    const overflow=[...view.querySelectorAll('*')].filter(el=>{
      if(!el.getClientRects().length||el.tagName==='OPTION')return false;
      const r=el.getBoundingClientRect();
      return r.width&&(r.left < -1||r.right>innerWidth+1);
    }).map(el=>({tag:el.tagName,class:el.className}));
    return {documentWidth:document.documentElement.scrollWidth,overflow,
      bodyOverflow:getComputedStyle(document.body).overflowX,
      h1:getComputedStyle(view.querySelector('h1')).fontSize,
      inputFont:getComputedStyle(view.querySelector('input')).fontSize,
      selection:[...view.querySelectorAll('[aria-pressed="true"]')].map(el=>el.textContent.trim()),
      fontLoaded:document.fonts.check('500 44px Archivo')};
  });
}
(async()=>{
  const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'msedge'});
  const page=await browser.newPage({acceptDownloads:true,reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(e.message));
  try {
    await page.goto(url+'#/fundae');
    assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
    const text=normalize(await page.locator('.credit-view').textContent());
    for(const original of fixture.texts) assert(text.includes(normalize(original)),'Missing original copy: '+original);
    for(const width of [1920,1440,1024,768,390]) {
      await page.setViewportSize({width,height:1000});
      for(const theme of ['dark','light']) {
        if(await page.locator('html').getAttribute('data-theme')!==theme)await page.locator('.site-header [data-theme-toggle]').click();
        await page.evaluate(()=>document.fonts.ready);
        await page.waitForTimeout(350);
        const report=await measure(page);
        assert.equal(report.documentWidth,width,JSON.stringify(report));
        assert.deepEqual(report.overflow,[]);
        assert.equal(report.bodyOverflow,'visible','No masking of horizontal overflow');
        assert(report.fontLoaded);
        assert.equal(report.inputFont,'16px');
        assert(Math.abs(parseFloat(report.h1)-Math.max(44,Math.min(76,32+width*.031)))<.02);
        await page.screenshot({path:path.join(output,theme+'-'+width+'.png'),fullPage:true});
        await page.locator('.credit-calculator').screenshot({path:path.join(output,'calculator-'+theme+'-'+width+'.png')});
        reports.push({width,theme,...report});
      }
    }
    const ids={plantilla:'credit-employees',salario:'credit-salary',consumido:'credit-used',participantes:'credit-participants',horas:'credit-hours'};
    const modeLabels={pres:'Presencial',live:'Online Live',hib:'Híbrida',tele:'Teleformación'};
    async function checkState(state) {
      for(const [key,id] of Object.entries(ids))await page.locator('#'+id).fill(state[key]);
      await page.getByRole('button',{name:modeLabels[state.modo],exact:true}).click();
      await page.getByRole('button',{name:state.nivel==='sup'?'Superior · técnico y mandos (13 €/h)':'Básico · operativo (9 €/h)',exact:true}).click();
      const expected=values(state);
      assert.equal(await page.locator('#credit-annual').textContent(),expected.creditoLabel);
      assert.equal(await page.locator('#credit-available').textContent(),expected.disponibleLabel);
      assert.equal(await page.locator('#credit-bonus').textContent(),expected.bonifLabel);
      assert.equal(await page.locator('#credit-cofin').textContent(),expected.cofinLabel);
      assert.equal(await page.locator('#credit-formula').textContent(),expected.calcLabel);
      assert.equal(await page.locator('#credit-usage').textContent(),expected.usoLabel);
      assert.deepEqual(await page.locator('.credit-compare-amount').allTextContents(),JSON.parse(JSON.stringify(expected.compare.map(c=>c.amount))));
      assert.equal((await measure(page)).documentWidth,390);
    }
    for(const plantilla of ['1','5','6','9','10','49','50','249','250'])await checkState({...initial,plantilla});
    for(const modo of ['pres','live','hib','tele'])for(const nivel of ['bas','sup'])await checkState({...initial,modo,nivel});
    for(const patch of [{consumido:'999999'},{salario:'0'},{participantes:'0'},{horas:'0'},{plantilla:'',salario:'',horas:'',participantes:''},{salario:'999999999999',participantes:'99999999',horas:'99999999'}])await checkState({...initial,...patch});
    // Every course keeps its existing hours/mode mapping; labels remain intact.
    const catalog=values(initial).courseOptions;
    for(const option of catalog.filter(o=>o.value!=='otra')) {
      const result=values(initial);
      result.onCourse({target:{value:option.value}});
      const expected=context.subject.state;
      await page.locator('#credit-course').selectOption(option.value);
      assert.equal(await page.locator('#credit-hours').inputValue(),expected.horas);
      assert.equal(await page.getByRole('button',{name:modeLabels[expected.modo],exact:true}).getAttribute('aria-pressed'),'true');
    }
    await page.locator('#credit-hours').fill('21');
    assert.equal(await page.locator('#credit-course').inputValue(),'otra');
    await page.locator('#credit-participants').fill('1');
    await page.locator('#credit-participants').focus();
    await page.keyboard.press('End');
    await page.keyboard.type('2');
    assert.equal(await page.locator('#credit-participants').inputValue(),'12');
    assert.equal(await page.evaluate(()=>document.activeElement.id),'credit-participants');
    const [download]=await Promise.all([page.waitForEvent('download'),page.locator('[data-dl="KIT-04_Checklist_documental_FUNDAE.pdf"]').click()]);
    assert.equal(await download.failure(),null);
    assert(fs.readFileSync(await download.path()).equals(fs.readFileSync(path.join(root,'kit-rrhh/KIT-04_Checklist_documental_FUNDAE.pdf'))));
    await page.locator('.credit-example a').click();
    assert(await page.locator('#fundae-calculadora').evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.top<innerHeight;}));
    await page.locator('.credit-final a').click();
    assert(await page.locator('#contacto').evaluate(el=>el.getBoundingClientRect().top<innerHeight));
    const theme=await page.locator('html').getAttribute('data-theme');
    await page.reload();
    assert.equal(await page.locator('html').getAttribute('data-theme'),theme);
    for(const route of ['/','/programas','/a-medida','/quienes-somos','/fundae']) {
      await page.goto(url+'#'+route);
      await page.locator('#app h1').waitFor();
      assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('is-fundae')),route==='/fundae');
    }
    assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({reports,errors,
      calculatorSourceUnchanged:true,baselineScenarios:fixture.scenarios.length,
      uiScenarios:23,catalogOptions:catalog.length,
      checks:['original calculator copy','all modes/levels','band boundaries','exhausted credit','empty and large inputs',
        'catalog hour/mode selection','focus after re-render','PDF download','internal anchors','saved theme','route transitions']},null,2));
    console.log('FUNDAE: unchanged calculator source; 86 baseline scenarios; 10 responsive/theme combinations; inputs, catalog, PDF and routing passed.');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
