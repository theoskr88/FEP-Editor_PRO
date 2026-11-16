import test from 'node:test';
import assert from 'node:assert/strict';
import {fitDimensions} from '../src/photo-import-mobile.js';
test('Foto Android de 48 MP se escala sin deformar ni exceder presupuesto',()=>{
 const r=fitDimensions(8000,6000);
 assert.ok(r.width<=2048&&r.height<=2048);
 assert.ok(r.width*r.height<=4000000);
 assert.ok(Math.abs(r.width/r.height-4/3)<.002);
});
test('Fotografía chica no pierde resolución innecesaria',()=>{
 assert.deepEqual(fitDimensions(1200,800),{width:1200,height:800});
});
test('Imagen inválida informa problema antes de agregar capa',()=>{
 assert.throws(()=>fitDimensions(0,123),/dimensiones/);
});
