const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css', '.js':'text/javascript', '.png':'image/png', '.pdf':'application/pdf', '.zip':'application/zip', '.xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
(async()=>{
  const missing=[], errors=[];
  const server=http.createServer((req,res)=>{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()) { res.writeHead(404);res.end();return; }
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'msedge',headless:true});
  try {
    const context=await browser.newContext({acceptDownloads:true,reducedMotion:'reduce'});
    await context.route('https://fonts.googleapis.com/**',r=>r.abort());
    await context.route('https://fonts.gstatic.com/**',r=>r.abort());
    const page=await context.newPage();
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)missing.push(r.url());});
    await page.goto(base);
    assert.equal(await page.locator('#app').getAttribute('data-view'),'tpl-home');
    assert.equal(await page.evaluate(()=>window.LOGISTIKOS_DOWNLOAD_DATA),undefined);
    const reports=[];
    const output=path.join(root,'docs/previews');fs.mkdirSync(output,{recursive:true});
    for(const [width,route,name] of [[1440,'/','home-desktop'],[390,'/','home-mobile'],[390,'/fundae','calculator-mobile']]) {
      await page.setViewportSize({width,height:900});await page.goto(base+'/#'+route);
      await page.screenshot({path:path.join(output,name+'.png')});
      reports.push({width,route,documentWidth:await page.evaluate(()=>document.documentElement.scrollWidth)});
    }
    await page.setViewportSize({width:1440,height:900});await page.goto(base+'/#/rrhh');
    await page.locator('#app input').fill('test@example.invalid');
    await page.getByRole('button',{name:'Recibir el kit RRHH completo'}).click();
    for(const link of await page.locator('[data-dl]').all()) {
      const name=await link.getAttribute('data-dl');
      const [dl]=await Promise.all([page.waitForEvent('download'),link.click()]);
      assert.equal(await dl.failure(),null);
      assert(fs.readFileSync(await dl.path()).equals(fs.readFileSync(path.join(root,'kit-rrhh',name))));
    }
    assert.equal(await page.evaluate(()=>window.LOGISTIKOS_DOWNLOAD_DATA),undefined,'HTTP must not load the base64 compatibility bundle');
    assert.deepEqual(missing,[]);assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(root,'docs/verificacion-http.json'),JSON.stringify({missing,errors,downloads:7,lazyBundleNotLoaded:true,previews:reports},null,2));
    console.log('HTTP: assets loaded; 7 downloads verified; local compatibility bundle not requested.');
  } finally {await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
