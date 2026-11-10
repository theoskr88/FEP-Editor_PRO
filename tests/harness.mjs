import http from 'node:http';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright-core';
export const root=fileURLToPath(new URL('../',import.meta.url));
export async function start({baseline=false,mobile=false,noWebGL=false}={}){
 const source=baseline?'/workspace/editor-reference-v095':root;
 const appProbe=`\nwindow.__audit={state:()=>({elements:elements.map(e=>e?JSON.parse(JSON.stringify({...e,img:undefined})):null),selected,history:history.length,redo:redoStack.length,width:canvas.width,height:canvas.height,product:$('product').value}),materials:()=>{let design=0,glitter=0,magic=0;modelRoot?.traverse(o=>{for(const m of(o.material?(Array.isArray(o.material)?o.material:[o.material]):[])){if(m.map===texture)design++;if(m.map===glitterTexture)glitter++;if(m.map===magicTexture)magic++}});return{design,glitter,magic}},texture:()=>textureCanvas.toDataURL()};`;
 const sheetProbe=`\nwindow.__sheetAudit={state:()=>items.map(({img,...i})=>({...i})),canvas:()=>fullCanvas()};`;
 const server=http.createServer(async(req,res)=>{try{let p=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(p==='/')p='/index.html';if(!/^\/(index.html|app.js|plancha.js|src\/[A-Za-z0-9_.-]+\.js)$/.test(p)){res.writeHead(404);res.end();return;}let data=baseline?execFileSync('git',['show','175591e:'+p.slice(1)],{cwd:root}):await fs.readFile(path.join(source,p));if(p==='/app.js')data=Buffer.from(data+appProbe);if(p==='/plancha.js')data=Buffer.from(data+sheetProbe);res.setHeader('Content-Type',p.endsWith('.html')?'text/html':'text/javascript');res.end(data);}catch{res.writeHead(404);res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.FEP_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const context=await browser.newContext(mobile?{viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1}:{viewport:{width:1500,height:980}});const page=await context.newPage();const errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));
 await context.route('**/*',async route=>{let u=new URL(route.request().url());if(u.origin===origin)return route.continue();const prefix='/npm/three@0.170.0/';if(u.hostname==='cdn.jsdelivr.net'&&u.pathname.startsWith(prefix)){
  const p=u.pathname.slice(prefix.length);if(!p.includes('..')){try{return route.fulfill({contentType:'text/javascript',body:await fs.readFile(path.join(root,'node_modules/three',p))});}catch{}}
 }external.push(u.origin);return route.abort();});
 if(noWebGL)await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(name,...args){return /webgl/.test(name)?null:get.call(this,name,...args);};});
 await page.goto(origin);await page.waitForFunction(()=>window.__sheetAudit);if(!noWebGL)await page.waitForFunction(()=>window.__estudioPrintAPI&&window.__audit);
 return {page,context,errors,external,origin,close:async()=>{await browser.close();await new Promise(r=>server.close(r));}};
}
export const tick=p=>p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
export async function fixtureImage(page){const data=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=80;c.height=40;const x=c.getContext('2d');x.fillStyle='red';x.fillRect(0,0,40,40);x.fillStyle='blue';x.fillRect(40,0,40,40);return c.toDataURL().split(',')[1];});return Buffer.from(data,'base64');}
