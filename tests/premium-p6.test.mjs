import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateProject,normalizeProject} from '../src/project.js';
import {copyZoneLayers} from '../src/zones.js';
import {zipFiles} from '../src/zip-store.js';
import {CREATIVE_TEMPLATES} from '../src/creative.js';
import {PRODUCT_PROFILES} from '../src/product-profiles.js';

test('P6 accepts finite rotated photos, preserves old project defaults and rejects invalid degrees',()=>{
 const image={type:'image',data:'data:image/png;base64,aGVsbG8=',x:.5,y:.5,widthFrac:.5,heightFrac:.5};
 const base={version:2,width:20,height:8.5,elements:[image]};
 assert.equal(validateProject(base),base);
 assert.equal(normalizeProject(base).data.elements[0].rotation,undefined);
 assert.equal(normalizeProject({...base,elements:[{...image,rotation:-125}]}).data.elements[0].rotation,-125);
 for(const rotation of [181,-181,NaN,Infinity,'90'])assert.throws(()=>validateProject({...base,elements:[{...image,rotation}]}),/Rotación/);
});
test('P6 keeps physical image and text sizes when moving artwork to a multi-zone product',()=>{
 const source={width:20,height:8.5,elements:[{type:'image',x:.5,y:.5,widthFrac:.5,heightFrac:.4},{type:'text',text:'Capa',x:.5,y:.5,size:90}]};
 const target={width:30,height:35,elements:[]};
 const cloned=copyZoneLayers(source,target,items=>structuredClone(items));
 assert(Math.abs(cloned[0].widthFrac*target.width-.5*source.width)<1e-9);
 assert(Math.abs(cloned[0].heightFrac*target.height-.4*source.height)<1e-9);
 assert.equal(source.elements[0].widthFrac,.5);
 assert(cloned[1].size<source.elements[1].size);
});
test('P6 7 templates remain available, selectors are derived from catalogue',()=>{
 assert.equal(Object.keys(CREATIVE_TEMPLATES).length,7);
 const controls=fs.readFileSync('src/creative-controls.js','utf8');
 assert(controls.includes('Object.entries(CREATIVE_TEMPLATES)'));
 const shortcuts=fs.readFileSync('src/premium-p5.js','utf8');
 assert(shortcuts.includes("get('textTools').open=true"));
 assert(!shortcuts.includes("['Texto',()=>get('addText')?.click()]"));
});
test('P6 ZIP writer packages independent, locally recoverable files',async()=>{
 const zip=await zipFiles([{name:'manifest.json',data:JSON.stringify({format:'fep-library',version:1})},{name:'proyectos/proyecto_001.json',data:'{"document":{"elements":[]}}'}]);
 assert(zip.size>90);
 const view=new DataView(await zip.arrayBuffer());
 assert.equal(view.getUint32(0,true),0x04034b50);
});
test('P6 offline pipeline and release signing are explicit and opt-in',()=>{
 const builder=fs.readFileSync('scripts/build-mobile-web.py','utf8');
 assert(builder.includes('re.subn('));assert(builder.includes('fep-[a-f0-9]{16}'));
 const yaml=fs.readFileSync('.github/workflows/android-editor.yml','utf8');
 assert(yaml.includes('ANDROID_TEST_KEYSTORE_BASE64'));
 assert(yaml.includes('ANDROID_KEYSTORE_BASE64'));
 assert(yaml.includes('bundleRelease'));
 assert(yaml.includes('release/rc1-correcciones-tecnicas'));
 assert.equal(PRODUCT_PROFILES.length,10);
});
