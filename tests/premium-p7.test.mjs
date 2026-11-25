import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {normalizeMockup} from '../src/mockup-settings.js';

test('P7 photo background stays in native project schema and is not a printable layer',()=>{
 const base=normalizeMockup({});
 assert.equal(base.backgroundPhotoEnabled,false);
 const jpeg='data:image/jpeg;base64,'+'AAAA';
 const s=normalizeMockup({backgroundPhoto:jpeg,backgroundPhotoEnabled:true});
 assert.equal(s.backgroundPhoto,jpeg);
 assert.equal(s.backgroundPhotoEnabled,true);
 assert.equal(base.backgroundPhoto,null);
});

test('P7 removes the blocking cyclorama only while an actual photo is enabled',()=>{
 const scene=fs.readFileSync('src/mockup-scenes.js','utf8');
 assert.match(scene,/root\.visible=s\.preset!=='original'&&\!\(s\.backgroundPhotoEnabled&&s\.backgroundPhoto\)/);
 const controls=fs.readFileSync('src/mockup-controls.js','utf8');
 assert(controls.includes('c.scene.background=loaded'));
 assert(controls.includes('scenePhotoPreview'));
 assert(controls.includes('Fondo fotográfico activo en el visor 3D'));
 assert(controls.includes('photoRequest'));
});
test('P7 exposes focused scene navigation without cloning controls',()=>{
 const ux=fs.readFileSync('src/premium-p7.js','utf8');
 for(const label of ['Fondo','Vistas','Exportar','Avanzado'])assert(ux.includes(label));
 for(const id of ['sceneBackgroundPhoto','scenePreset','viewerBackground','cameraTools','sceneCamera','exportMockup','sceneExport','mockupTools'])assert(ux.includes(id));
 assert(ux.includes('sections.background.append(photo)'));
 assert(ux.includes('panel.scrollTop=0'));
 const app=fs.readFileSync('app.js','utf8');
 assert(app.includes('initPremiumP7({get:$,notify})'));
});
test('P7 mobile dock, canvas and accessibility keep real editor controls',()=>{
 const css=fs.readFileSync('src/interface.css','utf8');
 assert(css.includes('.p7-scene-tabs'));
 assert(css.includes('.p7-photo-preview'));
 assert(css.includes('.tools-dock[data-open=true]'));
 assert(css.includes('.canvas-stage{height:clamp(250px,40dvh,415px)'));
 const markup=fs.readFileSync('index.html','utf8');
 for(const id of ['designCanvas','viewPanel','toolsDock','scenePreset','exportMockup'])assert(markup.includes('id="'+id+'"'));
});

test('P7 accepts ordinary large phone photographs by normalizing before strict asset validation',()=>{
 const controls=fs.readFileSync('src/mockup-controls.js','utf8');
 const start=controls.indexOf('photoInput.onchange=async()=>');
 const finish=controls.indexOf('for(const[id,key]of',start);
 const path=controls.slice(start,finish);
 assert(path.includes('await normalizePhoto(file)'));
 assert(path.indexOf('await normalizePhoto(file)')<path.indexOf('imageInfo('));
 assert(!path.includes('file.size>12*1024*1024'));
 const normalize=fs.readFileSync('src/photo-import-mobile.js','utf8');
 assert(normalize.includes('fitDimensions(width,height)'));
 assert(normalize.includes('maxPixels=4000000'));
 assert(path.includes('backgroundPhotoEnabled:true'));
});
