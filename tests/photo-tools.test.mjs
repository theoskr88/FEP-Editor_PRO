import test from 'node:test';
import assert from 'node:assert/strict';
import {removeUniformBackground,drawWatermark} from '../src/photo-tools.js';

test('Quita fondo blanco conectado al borde sin borrar objeto central',()=>{
  const w=10,h=10,pixels=new Uint8ClampedArray(w*h*4);
  for(let i=0;i<w*h;i++){pixels[i*4]=255;pixels[i*4+1]=255;pixels[i*4+2]=255;pixels[i*4+3]=255}
  for(let y=3;y<=6;y++)for(let x=3;x<=6;x++){const i=(y*w+x)*4;pixels[i]=40;pixels[i+1]=75;pixels[i+2]=110}
  const result=removeUniformBackground(pixels,w,h,{tolerance:25});
  assert.equal(result.removed,84);
  assert.equal(pixels[3],0);
  assert.equal(pixels[(4*w+4)*4+3],255);
});
test('No elimina un centro blanco aislado al borrar borde oscuro',()=>{
 const w=5,h=5,pixels=new Uint8ClampedArray(w*h*4);
 for(let i=0;i<w*h;i++){pixels[i*4]=25;pixels[i*4+1]=25;pixels[i*4+2]=25;pixels[i*4+3]=255}
 const p=(2*w+2)*4;pixels[p]=pixels[p+1]=pixels[p+2]=255;
 const result=removeUniformBackground(pixels,w,h,{tolerance:20});
 assert.equal(result.removed,24);assert.equal(pixels[p+3],255);
});
test('Marca de agua desactivada no altera el canvas',()=>{
 let calls=0;
 drawWatermark({save(){calls++}},1200,675,{enabled:false});
 assert.equal(calls,0);
});
