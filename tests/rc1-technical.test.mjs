import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {zipFiles} from '../src/zip-store.js';
import {readFepLibraryZip} from '../src/zip-read.js';

async function backup(){
 const digest='a'.repeat(64);
 const manifest={format:'fep-library',version:1,count:1,projects:[{name:'Taza',file:'proyectos/proyecto_001.json',digest}]};
 return zipFiles([
  {name:'manifest.json',data:JSON.stringify(manifest)},
  {name:'proyectos/proyecto_001.json',data:JSON.stringify({format:'fep-project',version:1,name:'Taza',digest,document:{version:2,elements:[]}})}
 ]);
}
test('RC1 verifies EOCD and supports lazy entry-level reading compatible with previous ZIPs',async()=>{
 const zip=await backup();
 const {manifest,files,readText}=await readFepLibraryZip(zip,{lazy:true});
 assert.equal(manifest.count,1);
 assert.equal(files.size,2);
 assert.equal(typeof files.get('proyectos/proyecto_001.json'),'object');
 assert.equal(JSON.parse(await readText('proyectos/proyecto_001.json')).name,'Taza');
});
test('RC1 rejects missing EOCD, truncated central directory and mismatched counts',async()=>{
 const b=new Uint8Array(await (await backup()).arrayBuffer());
 const cut=b.slice(0,-22);
 await assert.rejects(()=>readFepLibraryZip(cut.buffer),/ZIP incompleto|EOCD/);
 const modified=b.slice();
 const eocd=modified.length-22;
 new DataView(modified.buffer).setUint16(eocd+10,3,true);
 await assert.rejects(()=>readFepLibraryZip(modified.buffer),/EOCD|directorio/i);
 const withoutCentral=b.slice(0,b.findIndex((v,i)=>i>30&&new DataView(b.buffer).getUint32(i,true)===0x02014b50)+10);
 await assert.rejects(()=>readFepLibraryZip(withoutCentral.buffer),/ZIP incompleto|directorio/i);
});
test('RC1 avoids loading the full ZIP blob in lazy mode',async()=>{
 const zip=await backup();let fullRead=false,reads=0;
 const guard={
  size:zip.size,
  arrayBuffer:async()=>{fullRead=true;throw Error('Prohibited full read')},
  slice:(a,b)=>{reads++;return zip.slice(a,b)}
 };
 const result=await readFepLibraryZip(guard,{lazy:true});
 assert.equal(fullRead,false);
 assert(reads>5);
 assert.equal(result.manifest.count,1);
});
test('RC1 prevents a blank free design canvas and restores 2D+3D mode',()=>{
 const src=fs.readFileSync('src/premium-p8p9.js','utf8');
 const css=fs.readFileSync('src/interface.css','utf8');
 assert(src.includes("document.body.dataset.mode==='free'&&next==='mockup'"));
 assert(src.includes("attributeFilter:['data-mode']"));
 assert(css.includes('body[data-mode="free"] .p89-view-actions{display:none!important}'));
 assert(css.includes('body[data-mode="free"] .editor-workspace #canvasPanel{display:block!important}'));
});
test('RC1 preserves old projects on interrupted ZIP restore through IndexedDB journal',()=>{
 const project=fs.readFileSync('src/projects.js','utf8');
 const app=fs.readFileSync('app.js','utf8');
 for(const term of ['beginLibraryRestore','createRestored','finishLibraryRestore','rollbackLibraryRestore','pendingLibraryRestore'])assert(project.includes(term));
 assert(app.includes("projectLibrary=await openProjectLibrary()"));
 assert(app.includes("if(await projectLibrary.setting('pendingLibraryRestore'))"));
 assert(app.includes("await projectLibrary.rollbackLibraryRestore()"));
});
test('RC1 uses approved-only splash and displays real print resolution',()=>{
 const native=fs.readFileSync('scripts/android-native/generate-brand-assets.py','utf8');
 const html=fs.readFileSync('index.html','utf8');
 const sheet=fs.readFileSync('plancha.js','utf8');
 assert(native.includes('for splash in splashes:'));
 assert(!native.includes('png_bytes(512)'));
 assert(native.includes('Falta el logotipo oficial'));
 assert(html.includes('brand-mark"><img src="./src/brand/Logotipo FEP Editor Pro con Cubo Dorado.png"'));
 assert(sheet.includes("const actualPpp=sheetDpi(w,h)"));
 assert(sheet.includes("el('sheetPng').textContent"));
 assert(sheet.includes("el('sheetJpg').textContent"));
});
