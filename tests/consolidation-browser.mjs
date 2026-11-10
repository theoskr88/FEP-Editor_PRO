import {start} from './harness.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const results=[];
for(const mobile of [false,true]){
 const h=await start({mobile,autoNavigate:false}),p=h.page,mode=mobile?'mobile':'desktop';
 try{
 const elements=Array.from({length:75},(_,i)=>({type:'text',text:i===74?'Nombre largo '.repeat(60):'Capa '+i,x:.5,y:.5,color:'#1249ff',size:24}));
 await p.locator('#projectFile').setInputFiles({name:'many-layers.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({version:2,elements}))});await p.waitForFunction(()=>document.querySelectorAll('.layer-row').length===75);await p.locator('#tab-layers').click();
 await p.locator('#layerList').evaluate(n=>n.scrollTop=n.scrollHeight);await p.getByRole('button',{name:'Seleccionar capa Capa 0',exact:true}).click();
 const bottom=await p.locator('#layerList').evaluate(n=>n.scrollTop);assert(bottom>1000);
 await p.locator('#layerOpacity').fill('70');await p.locator('#layerOpacity').dispatchEvent('change');assert.equal(await p.locator('#layerList').evaluate(n=>n.scrollTop),bottom);
 if(mobile)await p.locator('#closeTools').click();await p.locator('#designCanvas').click();await p.locator('#tab-layers').click();if(!mobile)await p.locator('#tab-layers').click();
 await p.waitForFunction(()=>{const n=document.getElementById('layerList'),row=n.querySelector('[data-selected=true]');return row&&row.getBoundingClientRect().top>=n.getBoundingClientRect().top&&row.getBoundingClientRect().bottom<=n.getBoundingClientRect().bottom+1});
 assert.equal(await p.locator('.layer-row').count(),75);assert(await p.locator('#layerList').evaluate(n=>n.clientHeight>=75));assert(await p.locator('#layerSelectionSummary').evaluate(n=>n.scrollWidth>n.clientWidth));
 await p.locator('#layerList').evaluate(n=>n.scrollTop=800);const scroll=await p.locator('#layerList').evaluate(n=>n.scrollTop);await p.evaluate(()=>window.dispatchEvent(new Event('resize')));assert.equal(await p.locator('#layerList').evaluate(n=>n.scrollTop),scroll);
 await p.locator('#toolsDock').evaluate(n=>Promise.all(n.getAnimations().map(a=>a.finished)));assert.equal(await p.locator('#toolsDock').getAttribute('data-open'),'true');assert(await p.locator('.layer-inspector').isVisible());await p.screenshot({path:`docs/evidence/fase3c/${mode}-layers-75.png`});results.push({mode,name:'75 layers: stable scroll, canvas selection revealed, long title bounded',passed:true});
 if(!mobile){await p.setViewportSize({width:1024,height:600});await p.waitForFunction(()=>document.getElementById('layerList').clientHeight>=96);await p.locator('#layerList').evaluate(n=>n.scrollTop=n.scrollHeight);await p.getByRole('button',{name:'Seleccionar capa Capa 0',exact:true}).click();assert(await p.locator('.layer-inspector').isVisible());await p.screenshot({path:'docs/evidence/fase3c/compact-layers-75.png'});results.push({mode:'1024x600',name:'layer list retains a usable scrolling area on short desktop',passed:true});await p.setViewportSize({width:1500,height:980})}
 const sticker={type:'sticker',stickerId:'cloud-soft',x:.5,y:.5,widthFrac:.3,heightFrac:.5,color:'#e6eef9',outlineColor:'#52697e',outlineWidth:1.5,rotation:0,flipX:false,flipY:false,shadow:false};
 await p.locator('#projectFile').setInputFiles({name:'resize.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({version:2,elements:[sticker]}))});await p.waitForFunction(()=>window.__audit.snapshot().elements.length===1);await p.locator('.layer-select').click();if(mobile)await p.locator('#closeTools').click();const box=await p.locator('#designCanvas').boundingBox();await p.mouse.move(box.x+box.width*.65,box.y+box.height*.75);await p.mouse.down();await p.mouse.move(box.x+box.width*8,box.y+box.height*8);await p.mouse.up();
 const layer=await p.evaluate(async()=>{const data=window.__audit.snapshot();const {validateProject}=await import('./src/project.js');validateProject(data);return data.elements[0]});assert(layer.widthFrac<=3&&layer.heightFrac<=3);assert(layer.widthFrac>.3);results.push({mode,name:'pointer resize remains valid for JSON and recovery',passed:true});assert.deepEqual(h.errors,[]);
 }finally{await h.close()}
}
await fs.writeFile('docs/evidence/fase3c/consolidation.json',JSON.stringify({passed:results.length,results},null,2)+'\n');console.log(results);
