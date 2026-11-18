import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeMockup,MOCKUP_PRESETS,CAMERA_PRESETS,PREMIUM_FINISHES} from '../src/mockup-settings.js';

test('Acabado premium mantiene comportamiento anterior por defecto',()=>{
 const state=normalizeMockup();
 assert.equal(state.premiumFinish,'original');
 assert.equal(PREMIUM_FINISHES.original.roughness,null);
 assert.equal(PREMIUM_FINISHES.original.metalness,null);
});
test('El nuevo acabado se conserva al serializar y restaurar proyecto',()=>{
 const source=normalizeMockup({premiumFinish:'porcelain',preset:'premiumWarm',camera:'right'});
 const restored=normalizeMockup(JSON.parse(JSON.stringify(source)));
 assert.equal(restored.premiumFinish,'porcelain');
 assert.equal(restored.preset,'premiumWarm');
 assert.equal(restored.camera,'right');
});
test('Presets y vistas son independientes de la impresión',()=>{
 for(const id of ['premiumWarm','premiumCool'])assert.ok(MOCKUP_PRESETS[id]);
 for(const id of ['right','back'])assert.equal(CAMERA_PRESETS[id].length,3);
 for(const [name,finish] of Object.entries(PREMIUM_FINISHES)){
  assert.equal(normalizeMockup({premiumFinish:name}).premiumFinish,name);
  if(name!=='original'){
   assert.ok(finish.roughness>=0&&finish.roughness<=1);
   assert.ok(finish.metalness>=0&&finish.metalness<=1);
  }
 }
 assert.throws(()=>normalizeMockup({premiumFinish:'desconocido'}),/Escenario/);
});
