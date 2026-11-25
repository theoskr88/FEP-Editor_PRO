import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {zipFiles} from '../src/zip-store.js';
import {readFepLibraryZip,crc32} from '../src/zip-read.js';

const digest='a'.repeat(64);
const mk=()=>({
 manifest:{format:'fep-library',version:1,count:2,projects:[
  {name:'Taza prueba',file:'proyectos/proyecto_001.json',digest},
  {name:'Agenda',file:'proyectos/proyecto_002.json',digest}
 ]},
 files:[
  {name:'proyectos/proyecto_001.json',data:JSON.stringify({format:'fep-project',version:1,name:'Taza prueba',digest,document:{elements:[]}})},
  {name:'proyectos/proyecto_002.json',data:JSON.stringify({format:'fep-project',version:1,name:'Agenda',digest,document:{elements:[]}})}
 ]
});
test('P8+P9: importación ZIP comprueba archivos sin perder nombres ni datos',async()=>{
 const {manifest,files}=mk();
 const blob=await zipFiles([{name:'manifest.json',data:JSON.stringify(manifest)},...files]);
 const decoded=await readFepLibraryZip(blob);
 assert.equal(decoded.manifest.count,2);
 assert.equal(decoded.files.size,3);
 assert.equal(JSON.parse(decoded.files.get('proyectos/proyecto_001.json')).name,'Taza prueba');
 assert.equal(crc32(new Uint8Array([65])),0xd3d99e8b);
});
test('P8+P9: descarta ZIP con alteraciones CRC sin escribir proyectos',async()=>{
 const {manifest,files}=mk();const blob=await zipFiles([{name:'manifest.json',data:JSON.stringify(manifest)},...files]);
 const b=new Uint8Array(await blob.arrayBuffer());const nameLen=new DataView(b.buffer).getUint16(26,true),extraLen=new DataView(b.buffer).getUint16(28,true);b[30+nameLen+extraLen+5]^=1;
 await assert.rejects(()=>readFepLibraryZip(b.buffer),/corrupto|inválido|ZIP/);
});
test('P8+P9: no acepta ZIP incompatible ni índice malicioso',async()=>{
 const {manifest,files}=mk();
 for(const changed of [{...manifest,format:'extraño'}, {...manifest,projects:[{...manifest.projects[0],file:'../../secreto.json'},manifest.projects[1]]}]){
  const zip=await zipFiles([{name:'manifest.json',data:JSON.stringify(changed)},...files]);
  await assert.rejects(()=>readFepLibraryZip(zip),/incompatible|inválido/);
 }
});
test('P8+P9: modos 2D/3D, escenas, color y velocidad se accionan localmente',()=>{
 const js=fs.readFileSync('src/premium-p8p9.js','utf8'),css=fs.readFileSync('src/interface.css','utf8');
 for(const value of ['Diseño + 3D','Ampliar 2D','Ampliar 3D','Preparar foto comercial','sceneVideoSeconds','pieceColor_','sceneCamera','premiumWarm','softbox'])assert(js.includes(value),value);
 assert(js.includes('dispatchEvent(new Event'));
 assert(css.includes('data-p89-view=design'));
 assert(css.includes('data-p89-view=mockup'));
 assert(!js.includes('fetch('));
});
test('P8+P9: respaldo ZIP se importa sin pisar proyectos existentes',()=>{
 const app=fs.readFileSync('app.js','utf8'),manager=fs.readFileSync('src/project-manager.js','utf8');
 assert(app.includes("readFepLibraryZip(file)"));
 assert(app.includes("projectLibrary.create(prepared.data"));
 assert(app.includes("projectLibrary.remove(id)"));
 assert(app.includes("validateProject(raw.document)"));
 assert(manager.includes('projectsImportZip'));
 assert(manager.includes('projectsZipFile'));
 assert(manager.includes('importLibraryZip(f)'));
});

test('P8+P9 cierre: no exportar ZIP que no sea restaurable y comprobar firma debug',()=>{
 const app=fs.readFileSync('app.js','utf8'),workflow=fs.readFileSync('.github/workflows/android-editor.yml','utf8');
 assert(app.includes('backupBytes>100*1024*1024'));
 assert(app.includes('2*enc.encode(file.name).byteLength'));
 assert(app.includes('const archive=await zipFiles(files)'));
 assert(workflow.includes('debug-signing-fingerprint.txt'));
 assert(workflow.includes('Debug certificate SHA256'));
});

test('P8+P9 logotipo oficial: splash web y recursos Android usan imagen original sin alterar proyectos',()=>{
 const index=fs.readFileSync('index.html','utf8');
 const script=fs.readFileSync('scripts/android-native/generate-brand-assets.py','utf8');
 const workflow=fs.readFileSync('.github/workflows/android-editor.yml','utf8');
 assert(index.includes('fepOfficialLaunch'));
 assert(index.includes('./src/brand/logo-fep-editor-pro.png'));
 assert(index.includes('setTimeout(remove,1550)'));
 assert(script.includes('src/brand/logo-fep-editor-pro.png'));
 assert(script.includes('fep_official_foreground.png'));
 assert(script.includes('drawable-land'));
 assert(workflow.includes('Pillow==11.3.0'));
 assert(workflow.includes('Official FEP Editor PRO PNG missing'));
});
