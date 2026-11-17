// Android WebView functional diagnostic via Chrome DevTools Protocol.
// Uses the APK itself in the emulator; no mocked import/export logic.
// In case CDP is unavailable, fail with collected evidence, not a false PASS.
import { chromium } from 'playwright-core';
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';

const output='emulator-evidence';
mkdirSync(output,{recursive:true});
const evidence={checkedAt:new Date().toISOString(),tests:[]};
const record=(name,status,details={})=>{evidence.tests.push({name,status,...details});writeFileSync(output+'/functional-results.json',JSON.stringify(evidence,null,2));};
const adb=(...args)=>execFileSync('adb',args,{encoding:'utf8',timeout:30000});
function assert(condition,message){if(!condition)throw new Error(message)}
let browser;
try{
  const pid=adb('shell','pidof','com.fep.editorpro').trim().split(/\s+/)[0];
  assert(/^\d+$/.test(pid),'FEP Editor no está ejecutándose');
  const endpoints=adb('shell','cat','/proc/net/unix');
  const matches=[...endpoints.matchAll(/@(webview_devtools_remote_\d+)/g)].map(m=>m[1]);
  const name=matches.find(s=>s.endsWith('_'+pid))||matches[0];
  assert(name,'WebView DevTools no está disponible; revisar build debug');
  adb('forward','tcp:9222','localabstract:'+name);
  browser=await chromium.connectOverCDP('http://127.0.0.1:9222',{timeout:30000});
  const pages=browser.contexts().flatMap(c=>c.pages());
  const page=pages.find(p=>p.url().includes('localhost')||p.url().includes('capacitor'))||pages[0];
  assert(page,'No se encontró página de FEP Editor en WebView');
  evidence.webview={url:page.url(),title:await page.title()};
  record('android_webview_connection','PASS',evidence.webview);
  const boot=await page.evaluate(()=>({
    startVisible:!!document.querySelector('#startScreen')?.open,
    canvas:!!document.querySelector('#designCanvas'),
    layerCount:document.querySelector('#layerCount')?.textContent,
    native:window.FEP_NATIVE?.isNative,
    cameraPlugin:typeof window.FEP_NATIVE?.photo,
    savePlugin:typeof window.FEP_NATIVE?.saveBlob,
    exportMockup:!!document.getElementById('exportMockup'),
    renderReady:document.getElementById('profileStatus')?.dataset.state
  }));
  writeFileSync(output+'/webview-state.json',JSON.stringify(boot,null,2));
  assert(boot.canvas,'Lienzo 2D no disponible');
  assert(boot.native===true,'El editor no detectó Android nativo');
  assert(boot.cameraPlugin==='function'&&boot.savePlugin==='function','Puente de cámara o archivos no disponible');
  record('android_bridge_and_editor','PASS',boot);
  const countBefore=await page.evaluate(()=>document.getElementById('layerCount')?.textContent||'');
  await page.evaluate(async()=>{
    const canvas=document.createElement('canvas');canvas.width=320;canvas.height=240;
    const cx=canvas.getContext('2d');
    cx.fillStyle='#fbf7ef';cx.fillRect(0,0,320,240);
    cx.fillStyle='#c64242';cx.fillRect(55,45,190,155);
    cx.fillStyle='#2558a8';cx.font='bold 42px sans-serif';cx.fillText('FEP',90,115);
    const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Canvas PNG falló')),'image/png'));
    const file=new File([blob],'fep-imagen-prueba.png',{type:'image/png'});
    const change=new DataTransfer();change.items.add(file);
    const input=document.getElementById('imageFile');
    if(!input)throw Error('Selector de imagen ausente');
    input.files=change.files;
    input.dispatchEvent(new Event('change',{bubbles:true}));
  });
  await page.waitForFunction(()=>/\b1\s+capa/.test(document.getElementById('layerCount')?.textContent||''),null,{timeout:20000});
  const result=await page.evaluate(()=>({
    label:document.getElementById('layerCount')?.textContent,
    layerItems:document.querySelectorAll('#layerList > *').length,
    canvasWidth:document.getElementById('designCanvas')?.width
  }));
  assert(result.label!==countBefore,'No se añadió la imagen como nueva capa');
  record('png_image_import_as_layer','PASS',result);
  await page.screenshot({path:output+'/functional-import.png',fullPage:false});
  // Verify re-render and basic 3D presence, without claiming hardware export success.
  const graphics=await page.evaluate(()=>({
    canvas:document.querySelectorAll('canvas').length,
    profileStatus:document.getElementById('profileStatus')?.dataset.state,
    viewerCanvas:!!document.querySelector('#viewer canvas, #threeContainer canvas, #preview3D canvas'),
    uploadNotification:document.querySelector('[role="status"]')?.textContent?.slice(0,160)
  }));
  record('graphics_state_after_import',graphics.profileStatus==='failed'?'FAIL':'PASS',graphics);
  if(graphics.profileStatus==='failed')throw Error('El producto 3D no terminó de cargar');
  // Prepare a real PNG through the same canvas serialization path.
  const exported=await page.evaluate(async()=>{
    const c=document.getElementById('designCanvas');
    const blob=await new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(Error('Exportación PNG falló')),'image/png'));
    const bytes=new Uint8Array(await blob.arrayBuffer());
    return {size:bytes.length,png:bytes.length>8&&[137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n)};
  });
  assert(exported.png&&exported.size>100,'El lienzo generó un PNG vacío o inválido');
  record('webview_png_serialization','PASS',exported);
  record('native_file_save','PENDING',{reason:'Requiere automatizar selector Android y relectura del archivo'});
  record('native_camera','PENDING',{reason:'Requiere automatizar cámara virtual y retorno de imagen'});
  record('mp4_360','PENDING',{reason:'Requiere prueba de guardado MP4 y reproducción con Android'});
  console.log('FUNCTIONAL RESULTS',JSON.stringify(evidence.tests));
}catch(error){
  record('diagnostic_failure','FAIL',{message:String(error?.stack||error)});
  console.error('FUNCTIONAL TEST FAILED',error);
  process.exitCode=1;
}finally{
  await browser?.close().catch(()=>{});
  try{adb('forward','--remove','tcp:9222')}catch{}
}
