import {chromium} from 'playwright-core';
import {execFileSync} from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const archive=process.argv[2]||'/workspace/deliverables/FEP_EDITOR_PRO_FASE1_PAGES.zip',root=await fs.mkdtemp(path.join(os.tmpdir(),'fep-pages-'));
execFileSync('python3',['-m','zipfile','-e',archive,root]);
const server=http.createServer(async(req,res)=>{try{const name=new URL(req.url,'http://localhost').pathname;const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));if(!file.startsWith(root+path.sep))throw Error();res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.js')?'text/javascript':'text/plain');res.end(await fs.readFile(file))}catch{res.writeHead(404);res.end()}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({executablePath:process.env.FEP_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{const p=await browser.newPage(),errors=[],external=[],failed=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))failed.push(r.url())});await p.route('**/*',r=>{if(new URL(r.request().url()).origin===origin)return r.continue();external.push(r.request().url());return r.abort()});await p.goto(origin);await p.waitForFunction(()=>document.getElementById('autosaveStatus').textContent==='Autoguardado local activo');await p.locator('#addText').click();assert.equal(await p.locator('#layerList button').count(),1);assert.equal(await p.locator('#viewer canvas').count(),1);await p.waitForFunction(()=>document.getElementById('autosaveStatus').dataset.state==='saved');await p.reload();await p.waitForFunction(()=>document.querySelectorAll('#layerList button').length===1);assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.deepEqual(failed,[]);const sha256=createHash('sha256').update(await fs.readFile(archive)).digest('hex');const result={archive:path.basename(archive),sha256,passed:true,checks:['static imports from extracted ZIP','WebGL canvas','text editing','autosave across reload','no external requests','no missing dependencies','no JS errors']};await fs.writeFile('docs/evidence/fase1-package.json',JSON.stringify(result,null,2)+'\n');console.log(result)}finally{await browser.close();await new Promise(r=>server.close(r));await fs.rm(root,{recursive:true,force:true})}
