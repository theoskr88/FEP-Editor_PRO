import {evidencePath} from './evidence.mjs';
// Exercise actual download buttons, then decode their files (PDF's embedded JPEG).
import {start} from './harness.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const h=await start(),p=h.page,results=[];
async function download(id,mirror){await p.locator('#mirrorModeIndividual').setChecked(mirror);const event=p.waitForEvent('download');await p.locator('#'+id).click();const file=await event;return fs.readFile(await file.path())}
function pdfImage(pdf){const start=pdf.indexOf(Buffer.from('/Subtype /Image')),stream=pdf.indexOf(Buffer.from('stream\n'),start),header=pdf.subarray(start,stream).toString();assert(start>0&&stream>start);const n=Number(header.match(/\/Length (\d+)/)[1]);return pdf.subarray(stream+7,stream+7+n)}
try{
 await p.locator('#widthCm').fill('20');await p.locator('#widthCm').dispatchEvent('change');await p.locator('#heightCm').fill('9');await p.locator('#heightCm').dispatchEvent('change');await p.locator('#textValue').fill('HOLA');await p.locator('#fontSize').fill('160');await p.locator('#addText').click();
 const texture=await p.evaluate(()=>window.__audit.texture());
 for(const [id,type]of [['exportPrint','image/png'],['exportJpg','image/jpeg'],['exportPDF','application/pdf']]){
  let normal=await download(id,false),mirror=await download(id,true);
  if(type==='application/pdf'){const text=normal.toString('latin1');assert.match(text,/\/MediaBox \[0 0 566.92913 255.11811\]/);normal=pdfImage(normal);mirror=pdfImage(mirror)}
  const mime=type==='application/pdf'?'image/jpeg':type;
  const metrics=await p.evaluate(async({normal,mirror,mime})=>{const decode=async base64=>{const image=new Image();image.src=`data:${mime};base64,${base64}`;await image.decode();const c=document.createElement('canvas');c.width=image.naturalWidth;c.height=image.naturalHeight;const x=c.getContext('2d');x.drawImage(image,0,0);return {w:c.width,h:c.height,d:x.getImageData(0,0,c.width,c.height).data}};const a=await decode(normal),b=await decode(mirror);let mismatch=0,ink=0,exact=0;for(let y=0;y<a.h;y++)for(let x=0;x<a.w;x++){const i=(y*a.w+x)*4,j=(y*a.w+a.w-1-x)*4;const left=a.d[i]<128,right=b.d[j]<128;if(left||right)ink++;if(left!==right)mismatch++;for(let c=0;c<4;c++)if(a.d[i+c]!==b.d[j+c])exact++}return{w:a.w,h:a.h,ink,mismatch,exact}}, {normal:normal.toString('base64'),mirror:mirror.toString('base64'),mime});
  assert.equal(metrics.w,2362);assert.equal(metrics.h,1063);assert(metrics.ink>1000);assert(metrics.mismatch/metrics.ink<.03,`${type}: mirrored glyph geometry mismatch`);if(type==='image/png')assert.equal(metrics.exact,0);assert.equal(await p.evaluate(()=>window.__audit.texture()),texture);results.push({type,passed:true,...metrics});console.log('PASS actual file mirror',type,metrics);
 }
 assert.deepEqual(h.errors,[]);assert.deepEqual(h.external,[]);
}finally{await h.close();await fs.writeFile(evidencePath('glitter/print-files.json'),JSON.stringify({passed:results.length,results},null,2)+'\n')}
