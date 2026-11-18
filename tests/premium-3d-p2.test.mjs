import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeMockup} from '../src/mockup-settings.js';
import {profileById,isWrappedProduct,isMugProduct} from '../src/product-profiles.js';

test('P2 conserva escena P1 sin colores por piezas',()=>{
 const settings=normalizeMockup({premiumFinish:'porcelain',camera:'back'});
 assert.equal(settings.pieceColorsEnabled,false);
 assert.equal(settings.premiumFinish,'porcelain');
 assert.equal(settings.camera,'back');
});
test('P2 conserva los tres colores al guardar y recuperar JSON',()=>{
 const settings=normalizeMockup({pieceColorsEnabled:true,pieceColors:{handle:'#af23de',rim:'#1199aa',interior:'#eedddd'},premiumFinish:'matte'});
 const restored=normalizeMockup(JSON.parse(JSON.stringify(settings)));
 assert.equal(restored.pieceColorsEnabled,true);
 assert.deepEqual(restored.pieceColors,settings.pieceColors);
 assert.equal(restored.premiumFinish,'matte');
});
test('P2 exige colores hexadecimales y rechaza datos corruptos',()=>{
 assert.throws(()=>normalizeMockup({pieceColors:{handle:'red'}}),/Color de pieza/);
 assert.throws(()=>normalizeMockup({pieceColorsEnabled:'true'}),/Personalización/);
});
test('P2 registra dos modelos originales como tazas con el mismo ancho imprimible base',()=>{
 for(const id of ['mug_enamel','mug_heart']){
  assert.ok(profileById(id));
  assert.ok(isMugProduct(id));
  assert.ok(isWrappedProduct(id));
  assert.deepEqual(profileById(id).printCm,[20,8.5]);
  assert.equal(profileById(id).calibration,'visual; confirmar dimensiones del producto físico');
 }
 assert.equal(isWrappedProduct('tumbler'),true);
 assert.equal(isMugProduct('tumbler'),false);
});

test('Fondo fotográfico es offline, compacto y persistente',()=>{
 const mockJpeg='data:image/jpeg;base64,'+Buffer.from([255,216,255,217]).toString('base64');
 const settings=normalizeMockup({backgroundPhoto:mockJpeg,backgroundPhotoEnabled:true,pieceColorsEnabled:true});
 const restored=normalizeMockup(JSON.parse(JSON.stringify(settings)));
 assert.equal(restored.backgroundPhoto,mockJpeg);
 assert.equal(restored.backgroundPhotoEnabled,true);
 assert.throws(()=>normalizeMockup({backgroundPhoto:'https://example.com/photo.jpg',backgroundPhotoEnabled:true}),/Fondo fotográfico/);
 assert.equal(normalizeMockup().backgroundPhotoEnabled,false);
});
