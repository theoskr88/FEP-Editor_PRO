// Functional Android WebView checks over Chrome DevTools Protocol, no Playwright.
import {execFileSync} from 'node:child_process';
import {writeFileSync,mkdirSync} from 'node:fs';
const folder='emulator-evidence';mkdirSync(folder,{recursive:true});
const results={checks:[],started:new Date().toISOString()};
const record=(test,status,data={})=>{
 results.checks.push({test,status,...data});
 writeFileSync(folder+'/functional-results.json',JSON.stringify(results,null,2));
 console.log('FEP-FUNCTIONAL',test,status,JSON.stringify(data));
};
const adb=(...args)=>execFileSync('adb',args,{encoding:'utf8',timeout:30000});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let socket,sequence=1;const pending=new Map();
const command=(method,params={})=>new Promise((resolve,reject)=>{
 const id=sequence++,timeout=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method))},18000);
 pending.set(id,{resolve:value=>{clearTimeout(timeout);resolve(value)},reject:e=>{clearTimeout(timeout);reject(e)}});
 socket.send(JSON.stringify({id,method,params}));
});
async function connect(){
 const pid=adb('shell','pidof','com.fep.editorpro').trim().split(/\s+/)[0];
 if(!/^\d+$/.test(pid))throw Error('No se encontró proceso FEP Android');
 const matches=[...adb('shell','cat','/proc/net/unix').matchAll(/@(webview_devtools_remote_\d+)/g)].map(x=>x[1]);
 const channel=matches.find(x=>x.endsWith('_'+pid))||matches[0];
 if(!channel)throw Error('No hay socket de depuración WebView');
 adb('forward','tcp:9222','localabstract:'+channel);
 const pages=await fetch('http://127.0.0.1:9222/json/list').then(x=>x.json());
 const page=pages.find(x=>x.type==='page'&&(x.url.includes('localhost')||x.url.includes('capacitor')))||pages.find(x=>x.type==='page');
 if(!page?.webSocketDebuggerUrl)throw Error('No hay página WebView depurable');
 socket=new WebSocket(page.webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{
  const t=setTimeout(()=>reject(Error('CDP socket no conectó')),12000);
  socket.addEventListener('open',()=>{clearTimeout(t);resolve()},{once:true});
  socket.addEventListener('error',()=>{clearTimeout(t);reject(Error('CDP WebSocket falló'))},{once:true});
 });
 socket.addEventListener('message',e=>{
  let data;try{data=JSON.parse(e.data)}catch{return}
  const p=pending.get(data.id);if(!p)return;pending.delete(data.id);
  if(data.error)p.reject(Error(data.error.message));else p.resolve(data.result);
 });
 await command('Runtime.enable');
 record('webview_cdp','PASS',{url:page.url});
}
async function evalFn(fn){
 const r=await command('Runtime.evaluate',{expression:'('+fn.toString()+')()',awaitPromise:true,returnByValue:true});
 const error=r.exceptionDetails?.exception?.description||r.exceptionDetails?.text;
 if(error)throw Error('WebView JS: '+error);
 return r.result?.value;
}
async function until(fn,ms=22000){
 const start=Date.now();let last='';
 while(Date.now()-start<ms){
  try{const value=await fn();if(value)return value;last='No se cumple la condición'}catch(e){last=String(e.message)}
  await sleep(600);
 }
 throw Error('Tiempo agotado: '+last);
}
try{
 await connect();
 const ready=await until(()=>evalFn(()=>({
  canvas:!!document.getElementById('designCanvas'),
  count:document.getElementById('layerCount')?.textContent,
  native:window.FEP_NATIVE?.isNative===true,
  camera:typeof window.FEP_NATIVE?.photo==='function',
  files:typeof window.FEP_NATIVE?.saveBlob==='function'
 })).then(x=>x?.canvas&&x?.native?x:null));
 if(!ready.camera||!ready.files)throw Error('Puente Android de cámara o archivos ausente');
 record('bridge_and_editor','PASS',ready);
 const previous=ready.count;
 await evalFn(async()=>{
  const c=document.createElement('canvas');c.width=320;c.height=240;
  const x=c.getContext('2d');x.fillStyle='#fffaf1';x.fillRect(0,0,320,240);
  x.fillStyle='#cf3636';x.fillRect(40,35,230,170);
  x.fillStyle='#ffffff';x.font='bold 55px sans-serif';x.fillText('FEP',95,130);
  const blob=await new Promise((ok,fail)=>c.toBlob(b=>b?ok(b):fail(Error('Blob PNG vacío')),'image/png'));
  const dt=new DataTransfer();dt.items.add(new File([blob],'prueba-FEP.png',{type:'image/png'}));
  const input=document.getElementById('imageFile');
  if(!input)throw Error('Selector de imagen ausente');
  input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}));
  return {bytes:blob.size};
 });
 const imported=await until(()=>evalFn(()=>({
  count:document.getElementById('layerCount')?.textContent,
  rows:document.querySelectorAll('#layerList > *').length
 })).then(x=>x?.count!==previous&&x.rows>0?x:null));
 record('import_png_as_layer','PASS',imported);
 // Persist and verify the imported layer, close the Android process, and reopen.
 // Imported layers can render before IndexedDB/autosave has finished scheduling.
 // Wait until storage boot is complete; do not equate "UI rendered" with "ready to persist".
 const saveReady=await until(()=>evalFn(()=>({
  available:typeof window.__fepSaveAndVerify==='function',
  status:document.getElementById('autosaveStatus')?.textContent,
  buttonDisabled:document.getElementById('saveProjectNow')?.disabled
 })).then(x=>x?.available&&!x.buttonDisabled&&!/Recuperando|Guardando/.test(x.status||'')?x:null)),30000);
 record('project_save_ready','PASS',saveReady);
 const saved=await evalFn(async()=>({
  saved:await window.__fepSaveAndVerify(),
  status:document.getElementById('autosaveStatus')?.textContent,
  title:document.getElementById('autosaveStatus')?.title
 }));
 if(saved?.saved!==true)throw Error('No se verificó guardado de proyecto: '+JSON.stringify(saved));
 record('project_saved_and_verified','PASS',{count:imported.count});
 socket.close();
 await sleep(500);
 adb('forward','--remove','tcp:9222');
 adb('shell','am','force-stop','com.fep.editorpro');
 await sleep(900);
 adb('shell','am','start','-W','-n','com.fep.editorpro/.MainActivity');
 await sleep(12000);
 await connect();
 const restored=await until(()=>evalFn(()=>({
  count:document.getElementById('layerCount')?.textContent,
  status:document.getElementById('autosaveStatus')?.textContent,
  native:window.FEP_NATIVE?.isNative===true
 })).then(x=>x?.native&&x?.count===imported.count&&/Guardado/.test(x?.status||'')?x:null),35000);
 record('project_survives_android_force_stop_and_reopen','PASS',restored);
 const png=await evalFn(async()=>{
  const c=document.getElementById('designCanvas');
  const blob=await new Promise((ok,fail)=>c.toBlob(b=>b?ok(b):fail(Error('PNG vacío')),'image/png'));
  const bytes=new Uint8Array(await blob.arrayBuffer());
  return {size:blob.size,png:[137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b),width:c.width,height:c.height};
 });
 if(!png.png||png.size<100||png.width<2||png.height<2)throw Error('PNG de editor inválido');
 record('serialize_canvas_png','PASS',png);
 const state=await evalFn(()=>({
  profile:document.getElementById('profileStatus')?.dataset.state,
  canvases:document.querySelectorAll('canvas').length,
  watermark:!!document.getElementById('wmEnabled'),
  video:!!document.getElementById('exportVideo'),
  layers:document.getElementById('layerCount')?.textContent
 }));
 record('editor_after_import',state.profile==='failed'?'FAIL':'PASS',state);
 if(state.profile==='failed')throw Error('Modelo 3D falló');
 record('camera_photo','PENDING',{reason:'Requiere ejecutar captura real Android'});
 record('native_png_save','PENDING',{reason:'Requiere automatizar selector y relectura'});
 record('native_mp4','PENDING',{reason:'Requiere codificación y reproducción'});
}catch(error){
 record('diagnostic_failure','FAIL',{message:String(error.stack||error)});
 console.error('FUNCTIONAL TEST FAILED',error);
 process.exitCode=1;
}finally{
 socket?.close();
 try{adb('forward','--remove','tcp:9222')}catch{}
}
