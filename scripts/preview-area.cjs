// Local static server: serves the public build without route exceptions.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml'};
const server = http.createServer((req,res) => {
  const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file = path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if (!file.startsWith(root+path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',types[path.extname(file)] || 'application/octet-stream');
  res.setHeader('Cache-Control','no-store');
  fs.createReadStream(file).pipe(res);
});
server.listen(Number(process.env.PORT || 4173),'127.0.0.1',()=>console.log(`Revisión local: http://127.0.0.1:${server.address().port}/#/area/transporte`));
