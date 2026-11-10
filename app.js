import {paintGlitter,glitterSettings} from './src/glitter.js';
import {validateProject} from './src/project.js';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
const $ = x=>document.getElementById(x); const canvas=$('designCanvas'),ctx=canvas.getContext('2d');
let dragStart=null,gestureHistory=false;
let elements=[],selected=-1,dragging=false,resizing=false,resizeStart=null,history=[],redoStack=[],meshGroup,texture,renderer,scene,camera,controls,animRequest,renderQueued=false;
// Lienzo exclusivo para texturas: nunca contiene bordes de selección.
const textureCanvas=document.createElement('canvas');
const textureCtx=textureCanvas.getContext('2d');
const notify=s=>{$('notice').textContent=s};
const dimensions={mug:[20,8.5],tumbler:[23,21],shirt:[30,35],tote:[28,30],notebook:[15,21],mousepad:[22,18],cushion:[28,28],keychain:[4,4]};
function setDimForProduct(){let p=$('product').value, d=dimensions[p];if(!d)return;
  if(p==='mug'||p==='tumbler')setPrintRotation(DEFAULT_PRINT_ROTATION_DEG);$('widthCm').value=d[0];$('heightCm').value=d[1]; updateDimensions(); buildModel();focusDesignFront()}
function updateDimensions(){let w=+($('widthCm').value)||20,h=+($('heightCm').value)||8.5;w=Math.max(1,Math.min(100,w));h=Math.max(1,Math.min(100,h));$('widthCm').value=w;$('heightCm').value=h;canvas.width=Math.min(1200,Math.round(4096*w/h));canvas.height=Math.round(canvas.width*h/w);
textureCanvas.width=canvas.width;textureCanvas.height=canvas.height;
$('canvasWrap').style.aspectRatio=`${w} / ${h}`;
$('resolution').textContent=`${w} × ${h} cm`;draw();updateImageControls()}
function addHistory(){history.push(JSON.stringify(elements.map(e=>({...e,img:undefined}))));if(history.length>40)history.shift();redoStack=[]}
function restore(s){elements=JSON.parse(s);for(const e of elements)if(e.type==='image'){e.img=new Image();e.img.onload=()=>{draw();requestAnimationFrame(()=>resync3D());};e.img.src=e.data}selected=-1;draw();if($('selectedTextStatus'))refreshSelectedLabel();updateImageControls()}
function undo(){if(!history.length)return;redoStack.push(JSON.stringify(elements.map(e=>({...e,img:undefined}))));restore(history.pop())}
function redo(){if(!redoStack.length)return;history.push(JSON.stringify(elements.map(e=>({...e,img:undefined}))));restore(redoStack.pop())}
function getImage(e){if(!e.img && e.data){e.img=new Image();e.img.onload=()=>{draw();requestAnimationFrame(()=>resync3D());};e.img.src=e.data}return e.img}

// Compatibilidad: las imágenes guardadas en V0.5 solo tenían scale.
function imageFractions(e){
  const im=getImage(e);
  const ratio=(im?.naturalWidth&&im?.naturalHeight)?im.naturalHeight/im.naturalWidth:1;
  const fw=Number.isFinite(e.widthFrac)?e.widthFrac:(Number(e.scale)||.38);
  const fh=Number.isFinite(e.heightFrac)?e.heightFrac:fw*canvas.width/canvas.height*ratio;
  return {fw,fh,ratio};
}
function imageCm(e){const {fw,fh}=imageFractions(e);return {w:fw*(Number($('widthCm').value)||20),h:fh*(Number($('heightCm').value)||8.5)}}
function updateImageControls(){
  const e=elements[selected],panel=$('imageSizePanel');
  panel.hidden=e?.type!=='image';
  if(e?.type!=='image')return;
  const cm=imageCm(e);
  $('imageWidthCm').value=cm.w.toFixed(2);
  $('imageHeightCm').value=cm.h.toFixed(2);
  $('imageSelectedStatus').textContent='Imagen seleccionada · ajusta las medidas en centímetros'+(cm.w>(Number($('widthCm').value)||20)||cm.h>(Number($('heightCm').value)||8.5)?' · aviso: excede el lienzo y se recortará al exportar':'');
}
function setImageSize(w,h){
  const e=elements[selected];if(e?.type!=='image'||e.locked)return;
  const cw=Number($('widthCm').value)||20,ch=Number($('heightCm').value)||8.5;
  const ww=Number(w),hh=Number(h);
  if(!Number.isFinite(ww)||!Number.isFinite(hh)||ww<=0||hh<=0||ww>cw*3||hh>ch*3){notify('Ingresa dimensiones positivas dentro del rango permitido.');return;}
  addHistory();e.widthFrac=ww/cw;e.heightFrac=hh/ch;
  delete e.scale;draw();updateImageControls();notify('Dimensiones de la imagen actualizadas.');
}
$('imageWidthCm').addEventListener('change',()=>{
  const e=elements[selected];if(e?.type!=='image'||e.locked)return;
  const w=Number($('imageWidthCm').value),old=imageCm(e);
  setImageSize(w,$('keepImageRatio').checked?w*old.h/old.w:Number($('imageHeightCm').value));
});
$('imageHeightCm').addEventListener('change',()=>{
  const e=elements[selected];if(e?.type!=='image'||e.locked)return;
  const h=Number($('imageHeightCm').value),old=imageCm(e);
  setImageSize($('keepImageRatio').checked?h*old.w/old.h:Number($('imageWidthCm').value),h);
});

function paintDesign(target,width,height){
  target.clearRect(0,0,width,height);
  target.fillStyle='#ffffff';target.fillRect(0,0,width,height);
  for(let i=0;i<elements.length;i++){
    const e=elements[i];if(e.visible===false)continue;target.save();target.globalAlpha=e.opacity??1;
    if(e.type==='glitter'){const tile=document.createElement('canvas');tile.width=1024;tile.height=512;paintGlitter(tile.getContext('2d'),tile.width,tile.height,e.glitter);target.drawImage(tile,0,0,width,height);target.restore();continue;}
    target.translate(e.x*width,e.y*height);
    if(e.type==='text'){
      target.font=`bold ${e.size*width/canvas.width}px Arial`;
      target.textAlign='center';target.textBaseline='middle';target.fillStyle=e.color;
      target.fillText(e.text,0,0,width*.9);
    }else{
      const im=getImage(e);
      if(im?.complete&&im.naturalWidth){
        const {fw,fh}=imageFractions(e);let w=fw*width,h=fh*height;
        target.drawImage(im,-w/2,-h/2,w,h);
      }
    }
    target.restore();
  }
}
function draw(){
  refreshLayers();
  paintDesign(ctx,canvas.width,canvas.height);
  // El borde punteado es interfaz de edición y no forma parte del diseño.
  if(selected>=0){
    const b=bounds(elements[selected]);ctx.save();ctx.strokeStyle='#0c91a3';
    ctx.lineWidth=3;ctx.setLineDash([9,7]);ctx.strokeRect(b.x,b.y,b.w,b.h);
    if(elements[selected]?.type==='image'){ctx.setLineDash([]);ctx.fillStyle='#0c91a3';ctx.fillRect(b.x+b.w-9,b.y+b.h-9,18,18);ctx.strokeStyle='#fff';ctx.strokeRect(b.x+b.w-9,b.y+b.h-9,18,18)}
    ctx.restore();
  }
  paintDesign(textureCtx,textureCanvas.width,textureCanvas.height);
  updateTexture();
  if($('mirrorPreview'))refreshIndividualPreview();
}
function bounds(e){if(!e)return{x:0,y:0,w:0,h:0};let w,h;if(e.type==='glitter')return{x:0,y:0,w:canvas.width,h:canvas.height};if(e.type==='text'){ctx.font=`bold ${e.size}px Arial`;w=Math.min(ctx.measureText(e.text).width,canvas.width*.9);h=e.size*1.25}else{let im=getImage(e);const f=imageFractions(e);w=f.fw*canvas.width;h=f.fh*canvas.height}return {x:e.x*canvas.width-w/2,y:e.y*canvas.height-h/2,w,h}}
function pos(ev){const r=canvas.getBoundingClientRect(),scale=Math.min(r.width/canvas.width,r.height/canvas.height),w=canvas.width*scale,h=canvas.height*scale;return{x:(ev.clientX-r.left-(r.width-w)/2)/scale,y:(ev.clientY-r.top-(r.height-h)/2)/scale}}
canvas.addEventListener('pointerdown',ev=>{
  if(dragging||resizing)return;const p=pos(ev);resizing=false;resizeStart=null;gestureHistory=false;
  // El cuadro inferior derecho cambia el tamaño de una imagen seleccionada.
  if(selected>=0&&elements[selected]?.type==='image'&&!elements[selected].locked){
    const b=bounds(elements[selected]);const hit=15*canvas.width/Math.max(1,canvas.getBoundingClientRect().width);
    if(Math.abs(p.x-(b.x+b.w))<=hit&&Math.abs(p.y-(b.y+b.h))<=hit){
      resizing=true;resizeStart={x:p.x,y:p.y,w:b.w,h:b.h};
      canvas.setPointerCapture(ev.pointerId);return;
    }
  }
  selected=-1;
  for(let i=elements.length-1;i>=0;i--){
    if(elements[i].visible===false||elements[i].locked)continue;const b=bounds(elements[i]);if(p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h){selected=i;break}
  }
  if(selected>=0){dragStart={px:p.x,py:p.y,x:elements[selected].x,y:elements[selected].y,pointerId:ev.pointerId};dragging=true;canvas.setPointerCapture(ev.pointerId)}
  loadSelectedTextIntoInputs();updateImageControls();draw();
});
canvas.addEventListener('pointermove',ev=>{
  const p=pos(ev);
  if(!dragging&&!resizing)return;
  if(dragging&&ev.pointerId!==dragStart.pointerId)return;
  if(!gestureHistory){addHistory();gestureHistory=true;}
  if(resizing&&selected>=0){
    const e=elements[selected];const old=resizeStart;
    let w=Math.max(8,old.w+2*(p.x-old.x));let h=Math.max(8,old.h+2*(p.y-old.y));
    if($('keepImageRatio').checked){const factor=Math.max(.02,w/old.w);w=old.w*factor;h=old.h*factor}
    e.widthFrac=w/canvas.width;e.heightFrac=h/canvas.height;delete e.scale;
    draw();updateImageControls();return;
  }
  if(!dragging||selected<0)return;
  elements[selected].x=Math.max(0,Math.min(1,dragStart.x+(p.x-dragStart.px)/canvas.width));
  elements[selected].y=Math.max(0,Math.min(1,dragStart.y+(p.y-dragStart.py)/canvas.height));draw();
});
function stopCanvasInteraction(){dragging=false;resizing=false;resizeStart=null;updateImageControls()}
canvas.addEventListener('pointerup',stopCanvasInteraction);
canvas.addEventListener('pointercancel',stopCanvasInteraction);
canvas.addEventListener('wheel',ev=>{
  if(selected<0||elements[selected].locked||elements[selected].type==='glitter')return;ev.preventDefault();addHistory();
  const e=elements[selected],k=ev.deltaY<0?1.08:.92;
  if(e.type==='text')e.size=Math.max(12,Math.min(500,e.size*k));
  else {
    const f=imageFractions(e);e.widthFrac=Math.max(.005,Math.min(3,f.fw*k));
    e.heightFrac=Math.max(.005,Math.min(3,f.fh*k));delete e.scale;
    updateImageControls();
  }
  draw();
},{passive:false});
$('addText').onclick=()=>{addHistory();elements.push({type:'text',text:$('textValue').value||'Texto',color:$('textColor').value,size:+$('fontSize').value,x:.5,y:.5});selected=elements.length-1;refreshSelectedLabel();updateImageControls();draw();focusDesignFront()};
// Los controles son un borrador: escribir nunca modifica automáticamente otra capa.
function refreshSelectedLabel(){
  const e=elements[selected];
  $('selectedTextStatus').textContent=e?.type==='text'
    ? `Texto seleccionado: ${e.text}` : 'Ningún texto seleccionado';
}
function loadSelectedTextIntoInputs(){
  const e=elements[selected];
  if(e?.type==='text'){
    $('textValue').value=e.text;
    $('textColor').value=e.color;
    $('fontSize').value=String(Math.round(e.size));
  }
  refreshSelectedLabel();
}
$('applyText').onclick=()=>{
  const e=elements[selected];
  if(e?.type!=='text') {notify('Selecciona primero un texto del lienzo para editarlo.');return;}
  addHistory();
  e.text=$('textValue').value;
  e.color=$('textColor').value;
  e.size=+$('fontSize').value;
  draw(); refreshSelectedLabel();
  notify('Cambios aplicados únicamente al texto seleccionado.');
};
$('imageFile').onchange=ev=>{const file=ev.target.files?.[0];if(!file)return;if(file.size>10*1024*1024){notify('Máximo 10 MB por imagen');return}const reader=new FileReader();reader.onload=()=>{let im=new Image();im.onload=()=>{addHistory();elements.push({type:'image',data:reader.result,img:im,scale:.38,x:.5,y:.5});selected=elements.length-1;refreshSelectedLabel();updateImageControls();draw();requestAnimationFrame(()=>resync3D({resetView:true,selectedObject:true}))};im.src=reader.result};reader.readAsDataURL(file);ev.target.value=''};
$('delete').onclick=()=>{if(selected>=0){addHistory();elements.splice(selected,1);selected=-1;refreshSelectedLabel();updateImageControls();draw()}};
$('clear').onclick=()=>{addHistory();elements=[];selected=-1;refreshSelectedLabel();updateImageControls();draw()};$('undo').onclick=undo;$('redo').onclick=redo;
$('rotationDeg').addEventListener('input',e=>setPrintRotation(e.target.value));
$('rotationReset').onclick=()=>setPrintRotation(DEFAULT_PRINT_ROTATION_DEG);
$('rotateMinus').onclick=()=>setPrintRotation(printRotationDeg-5);
$('rotatePlus').onclick=()=>setPrintRotation(printRotationDeg+5);
$('rotationViewFront').onclick=focusDesignFront;
$('rotationNumber').addEventListener('change',e=>setPrintRotation(e.target.value));
$('widthCm').onchange=()=>{updateDimensions();buildModel()};$('heightCm').onchange=updateDimensions;$('product').onchange=()=>{setDimForProduct();updateRotationToolbar();syncFinishUI()};
$('save').onclick=()=>{const out={version:2,glitter:readGlitterControls(),product:$('product').value,color:$('productColor').value,width:+$('widthCm').value,height:+$('heightCm').value,printRotationDeg,mirrorMode:getMirrorMode(),finishMode,magicHeat,elements:elements.map(({img,...e})=>e)};saveBlob(new Blob([JSON.stringify(out)],{type:'application/json'}),'proyecto-estudio3d.json')};
$('load').onclick=()=>$('projectFile').click();$('projectFile').onchange=async ev=>{try{const f=ev.target.files[0];if(!f)return;if(f.size>30_000_000)throw Error('Proyecto demasiado grande');const data=validateProject(JSON.parse(await f.text()));applyGlitterControls(data.glitter);$('product').value=dimensions[data.product]?data.product:'mug';$('productColor').value=data.color||'#ffffff';finishMode=['standard','glitter','magic'].includes(data.finishMode)?data.finishMode:'standard';magicHeat=Number.isFinite(data.magicHeat)?Math.max(0,Math.min(100,data.magicHeat)):0;$('finishMode').value=finishMode;$('magicHeat').value=magicHeat;updateMagicCoating();syncFinishUI();$('mirrorModeIndividual').checked=data.mirrorMode!=='normal' && data.mirrorMode!=='none' && data.mirrorPrint!==false;refreshIndividualPreview();$('widthCm').value=data.width||20;$('heightCm').value=data.height||8.5;history=[];redoStack=[];printRotationDeg=Number.isFinite(Number(data.printRotationDeg)) && data.printRotationDeg!==undefined ? ((Number(data.printRotationDeg)%360)+360)%360 : DEFAULT_PRINT_ROTATION_DEG;$('rotationDeg').value=String(printRotationDeg);$('rotationValue').textContent=`${Math.round(printRotationDeg)}°`;
  if($('rotationNumber'))$('rotationNumber').value=String(Math.round(printRotationDeg));restore(JSON.stringify(data.elements));updateDimensions();buildModel();focusDesignFront();updateRotationToolbar();notify('Proyecto cargado')}catch(e){notify('No se pudo abrir el proyecto: '+e.message)}};
function saveBlob(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),2000)}
// Reflejo REAL: toda la imagen ya rasterizada, no invierte el orden del texto.
function mirrorFinishedImage(source){
  const output=document.createElement('canvas');
  output.width=source.width;output.height=source.height;
  const context=output.getContext('2d');
  context.save();
  context.translate(output.width,0);
  context.scale(-1,1);
  context.drawImage(source,0,0);
  context.restore();
  return output;
}
function getMirrorMode(){return $('mirrorModeIndividual').checked ? 'espejo' : 'normal'}
function renderToExportCanvas(mode='normal'){
  const source=document.createElement('canvas');
  const w=Math.round(+$('widthCm').value/2.54*300),h=Math.round(+$('heightCm').value/2.54*300);
  if(w*h>40e6)throw Error('Área demasiado grande para este dispositivo');
  source.width=w;source.height=h;
  paintDesign(source.getContext('2d'),w,h);
  return mode==='espejo' ? mirrorFinishedImage(source) : source;
}
function refreshIndividualPreview(){
  const preview=$('mirrorPreview');if(!preview)return;
  const w=400,h=Math.max(75,Math.min(360,Math.round(w*(Number($('heightCm').value)||9)/(Number($('widthCm').value)||20))));
  const source=document.createElement('canvas');source.width=w;source.height=h;
  paintDesign(source.getContext('2d'),w,h);
  const result=getMirrorMode()==='espejo'?mirrorFinishedImage(source):source;
  preview.width=w;preview.height=h;
  preview.getContext('2d').drawImage(result,0,0);
  $('mirrorModeStatus').textContent=getMirrorMode()==='espejo'?'ESPEJO ACTIVADO · reflejo real de todos los píxeles':'NORMAL · sin espejo';
}

// Exportaciones a escala física exacta. Canvas.toBlob() sin metadatos
// normalmente declara 96 dpi: insertamos pHYs de 300 ppp en el PNG.
const PRINT_DPI=300;
const cmPrint=()=>({w:Number($('widthCm').value)||20,h:Number($('heightCm').value)||8.5});
const canvasBlob=(c,type,quality)=>new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(Error('No se pudo generar el archivo')),type,quality));
function crc32(arr){let crc=0xffffffff;for(let i=0;i<arr.length;i++){crc^=arr[i];for(let j=0;j<8;j++)crc=(crc>>>1)^((crc&1)?0xedb88320:0)}return (crc^0xffffffff)>>>0}
function pngWithDpi(buffer,dpi=300){
  const source=new Uint8Array(buffer),head=[137,80,78,71,13,10,26,10];
  if(!head.every((x,i)=>source[i]===x))throw Error('No se obtuvo un PNG válido');
  const ppm=Math.round(dpi/0.0254),phy=new Uint8Array(21),v=new DataView(phy.buffer);
  v.setUint32(0,9);phy.set([112,72,89,115],4);v.setUint32(8,ppm);v.setUint32(12,ppm);phy[16]=1;v.setUint32(17,crc32(phy.subarray(4,17)));
  // Elimina fragmentos pHYs anteriores para evitar declaraciones contradictorias.
  const chunks=[];let pos=8;
  while(pos+12<=source.length){const dv=new DataView(buffer,pos);const len=dv.getUint32(0);const end=pos+12+len;if(end>source.length)throw Error('PNG incompleto');const id=String.fromCharCode(...source.subarray(pos+4,pos+8));if(id!=='pHYs')chunks.push(source.subarray(pos,end));pos=end;if(id==='IEND')break}
  const total=8+chunks.reduce((n,c)=>n+c.length,0)+phy.length;
  const dest=new Uint8Array(total);dest.set(source.subarray(0,8));let ix=8;
  chunks.forEach((chunk,i)=>{dest.set(chunk,ix);ix+=chunk.length;if(i===0){dest.set(phy,ix);ix+=phy.length}});
  return new Blob([dest],{type:'image/png'});
}
function jpegWithDpi(buffer,dpi=300){
  const a=new Uint8Array(buffer.slice(0));
  if(a[0]!==0xff||a[1]!==0xd8)throw Error('JPEG inválido');
  let i=2;
  while(i+4<a.length){if(a[i]!==0xff)break;const marker=a[i+1];if(marker===0xda||marker===0xd9)break;const len=(a[i+2]<<8)+a[i+3];if(len<2||i+2+len>a.length)break;
    if(marker===0xe0 && String.fromCharCode(...a.subarray(i+4,i+9))==='JFIF\0'){
      a[i+11]=1; // Unidades: dpi (pulgadas)
      a[i+12]=(dpi>>8)&255;a[i+13]=dpi&255;
      a[i+14]=(dpi>>8)&255;a[i+15]=dpi&255;
      return new Blob([a],{type:'image/jpeg'});
    }
    i+=len+2;
  }
  // La mayoría de navegadores generan un APP0 JFIF. Si no existe, lo insertamos.
  const app0=new Uint8Array([255,224,0,16,74,70,73,70,0,1,1,1,(dpi>>8)&255,dpi&255,(dpi>>8)&255,dpi&255,0,0]);
  return new Blob([a.subarray(0,2),app0,a.subarray(2)],{type:'image/jpeg'});
}
// PDF independiente del diálogo de impresión: tamaño de página = tamaño del lienzo.
async function pdfAtPhysicalSize(canvas,wCm,hCm){
  const jpg=new Uint8Array(await (await canvasBlob(canvas,'image/jpeg',.98)).arrayBuffer());
  const pageW=(wCm*72/2.54).toFixed(5),pageH=(hCm*72/2.54).toFixed(5);
  const enc=new TextEncoder(),parts=[];let length=0,offsets=[0];
  const append=x=>{let b=typeof x==='string'?enc.encode(x):x;parts.push(b);length+=b.length};
  const obj=(id,body)=>{offsets[id]=length;append(`${id} 0 obj\n${body}\nendobj\n`)};
  append('%PDF-1.4\n%\xD3\xE4\xF5\xFA\n');
  obj(1,'<< /Type /Catalog /Pages 2 0 R >>');
  obj(2,'<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  obj(3,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
  offsets[4]=length;append(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`);append(jpg);append('\nendstream\nendobj\n');
  const commands=`q\n${pageW} 0 0 ${pageH} 0 0 cm\n/Im0 Do\nQ\n`;
  obj(5,`<< /Length ${enc.encode(commands).length} >>\nstream\n${commands}endstream`);
  const startxref=length;append('xref\n0 6\n0000000000 65535 f \n');for(let k=1;k<=5;k++)append(String(offsets[k]).padStart(10,'0')+' 00000 n \n');
  append(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`);
  return new Blob(parts,{type:'application/pdf'});
}
$('exportPrint').onclick=async()=>{
  try{const {w,h}=cmPrint();const canvas=renderToExportCanvas(getMirrorMode());const blob=await canvasBlob(canvas,'image/png');
    saveBlob(pngWithDpi(await blob.arrayBuffer()),`impresion_${w}x${h}cm_${getMirrorMode()}_300ppp.png`);
    notify(`PNG generado: ${w} × ${h} cm a 300 ppp (${canvas.width} × ${canvas.height} píxeles).`);
  }catch(e){notify('Error PNG: '+e.message)}
};
let baseMat,modelRoot,modelUVs=[];
// Efectos no destructivos: se visualizan exclusivamente en el modelo 3D.
let finishMode='standard', magicHeat=0;
const glitterCanvas=document.createElement('canvas'); glitterCanvas.width=512;glitterCanvas.height=256;
const glitterCtx=glitterCanvas.getContext('2d');
// Brillos deterministas, sin aleatorizar cada fotograma ni alterar la impresión.
paintGlitter(glitterCtx,512,256,glitterSettings(),{material:true});
const glitterTexture=new THREE.CanvasTexture(glitterCanvas);glitterTexture.colorSpace=THREE.SRGBColorSpace;glitterTexture.flipY=true;
const magicCanvas=document.createElement('canvas');magicCanvas.width=512;magicCanvas.height=256;
const magicCtx=magicCanvas.getContext('2d');
const magicTexture=new THREE.CanvasTexture(magicCanvas);magicTexture.flipY=true;
function updateMagicCoating(){
  const g=magicCtx,w=magicCanvas.width,h=magicCanvas.height;
  g.clearRect(0,0,w,h);
  const reveal=Math.max(0,Math.min(1,magicHeat/100));
  if(reveal<1){
    const edge=reveal*w;
    const band=Math.max(8,w*.08);
    g.fillStyle='rgba(8,12,18,0.96)';g.fillRect(edge+band/2,0,w-edge,h);
    const grad=g.createLinearGradient(Math.max(0,edge-band/2),0,Math.min(w,edge+band/2),0);
    grad.addColorStop(0,'rgba(8,12,18,0)');grad.addColorStop(1,'rgba(8,12,18,0.96)');
    g.fillStyle=grad;g.fillRect(Math.max(0,edge-band/2),0,band,h);
    // En frío toda la capa exterior permanece oscura.
    if(reveal===0){g.fillStyle='rgba(8,12,18,0.96)';g.fillRect(0,0,w,h)}
  }
  magicTexture.needsUpdate=true;
}
updateMagicCoating();
function syncFinishUI(){
 const p=$('product').value;
 $('finishMode').querySelector('option[value="magic"]').disabled=p!=='mug';
 if(p!=='mug'&&finishMode==='magic'){finishMode='standard';$('finishMode').value=finishMode}
 $('magicHeatRow').hidden=finishMode!=='magic';
 $('magicHeatValue').textContent=`${magicHeat} % · ${magicHeat===0?'fría':magicHeat===100?'caliente':'transición'}`;
}
$('finishMode').onchange=e=>{finishMode=e.target.value;syncFinishUI();buildModel()};
$('magicHeat').oninput=e=>{magicHeat=Number(e.target.value);$('magicHeatValue').textContent=`${magicHeat} % · ${magicHeat===0?'fría':magicHeat===100?'caliente':'transición'}`;updateMagicCoating();};
function selectedImageForFit(){const e=elements[selected];if(!e||e.type!=='image'){notify('Selecciona una imagen en el lienzo para usar esta herramienta.');return null}const im=getImage(e);if(!im?.naturalWidth){notify('La imagen todavía está cargando.');return null}return {e,im}}
function quickFit(mode){const item=selectedImageForFit();if(!item)return;const {e,im}=item;addHistory();const sourceRatio=im.naturalWidth/im.naturalHeight;const areaRatio=canvas.width/canvas.height;
 if(mode==='center'){e.x=.5;e.y=.5}
 else{const cover=mode==='cover';let fw=cover?Math.max(1,areaRatio/sourceRatio):Math.min(1,areaRatio/sourceRatio); // width fraction computed below from target aspect
 // En ajuste: nunca cortar; al llenar: cubrir todo el lienzo conservando proporción.
 fw=cover?Math.max(1,sourceRatio/areaRatio):Math.min(1,sourceRatio/areaRatio);
 const fh=fw*areaRatio/sourceRatio;
 e.widthFrac=fw;e.heightFrac=fh;delete e.scale;e.x=.5;e.y=.5;
 }
 draw();updateImageControls();resync3D();notify(mode==='center'?'Imagen centrada':'Imagen ajustada sobre la zona imprimible');}
$('quickCenter').onclick=()=>quickFit('center');$('quickContain').onclick=()=>quickFit('contain');$('quickCover').onclick=()=>quickFit('cover');

// Franja de impresión: su ancho ocupa una porción conocida del perímetro.
// Son valores de geometría para el prototipo y deben calibrarse por modelo real.
const circumferenceCm={mug:26,tumbler:25.5};
let printArc=0;
const DEFAULT_PRINT_ROTATION_DEG=270;
let printRotationDeg=DEFAULT_PRINT_ROTATION_DEG;
function setPrintRotation(value){
  printRotationDeg=((Number(value)||0)%360+360)%360;
  $('rotationDeg').value=String(Math.round(printRotationDeg));
  $('rotationValue').textContent=`${Math.round(printRotationDeg)}°`;
  if($('rotationNumber'))$('rotationNumber').value=String(Math.round(printRotationDeg));
  if(modelRoot && ($('product').value==='mug'||$('product').value==='tumbler')) {
    buildModel();
    // El control gira el diseño sobre la taza; NO modifica la orientación de la cámara.
    // Así la vista conserva la posición original incluso con el arte en 270°.
  }
}
function updateRotationToolbar(){
  const enabled=['mug','tumbler'].includes($('product').value);
  $('rotationToolbar').hidden=!enabled;
}
// Orienta la cámara hacia el CENTRO de la franja imprimible.
// El desplazamiento del arte no altera el lienzo ni el PNG de impresión.
// Vista inicial ORIGINAL de la taza: cámara fija frente al producto.
// Independiente del ángulo de impresión (que por defecto continúa en 270°).
function focusDesignFront(){
  if(!camera || !controls || !renderer || !scene) return;
  camera.position.set(0,1,5.7);
  controls.target.set(0,0,0);
  controls.update();
  renderer.render(scene,camera);
}
function focusPrintEdge(edge){
  if(!camera || !controls) return;
  const theta=(edge==='start' ? -printArc/2 : printArc/2)+THREE.MathUtils.degToRad(printRotationDeg);
  const radius=5.7;
  camera.position.set(radius*Math.sin(theta),1,radius*Math.cos(theta));
  controls.target.set(0,0,0);
  controls.update();
}

function init3D(){const node=$('viewer');scene=new THREE.Scene();scene.background=new THREE.Color('#17253a');camera=new THREE.PerspectiveCamera(40,node.clientWidth/430,.1,100);camera.position.set(0,1,5.7);renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.setSize(node.clientWidth,430);node.appendChild(renderer.domElement);renderer.domElement.addEventListener('webglcontextlost',ev=>{ev.preventDefault();notify('Se interrumpió el motor gráfico. Puedes recargar la página después de guardar tu proyecto.');});renderer.domElement.addEventListener('webglcontextrestored',()=>{requestAnimationFrame(()=>resync3D());});controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=2.5;controls.maxDistance=11;scene.add(new THREE.HemisphereLight(0xffffff,0x65738a,2));let light=new THREE.DirectionalLight(0xffffff,2.8);light.position.set(2,4,5);scene.add(light);let light2=new THREE.DirectionalLight(0xffffff,1);light2.position.set(-3,2,-4);scene.add(light2);texture=new THREE.CanvasTexture(textureCanvas);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=THREE.ClampToEdgeWrapping;texture.wrapT=THREE.ClampToEdgeWrapping;texture.flipY=true;texture.needsUpdate=true;buildModel();function animate(){animRequest=requestAnimationFrame(animate);controls.update();renderer.render(scene,camera)}animate();window.addEventListener('resize',()=>{let w=node.clientWidth;camera.aspect=w/430;camera.updateProjectionMatrix();renderer.setSize(w,430)})}
function addGeo(geo,mat,x=0,y=0,z=0,rotateX=0){let o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.rotation.x=rotateX;modelRoot.add(o);return o}
function buildModel(){if(!scene)return;if(modelRoot){scene.remove(modelRoot);modelRoot.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)for(const material of(Array.isArray(o.material)?o.material:[o.material]))material.dispose()})}modelRoot=new THREE.Group();scene.add(modelRoot);let c=$('productColor').value,plain=new THREE.MeshStandardMaterial({color:c,roughness:.5,metalness:.04,side:THREE.DoubleSide});let printMat=new THREE.MeshStandardMaterial({map:texture,roughness:.65,side:THREE.FrontSide});window.printMat=printMat;let p=$('product').value;
if(p==='mug'||p==='tumbler'){let r=p==='mug'?.93:.66,h=p==='mug'?2.05:3;// Cuerpo completo sin arte: evita repetir el archivo en toda la taza.
if(p==='mug'){
  // Taza 11 oz de paredes lisas, base discreta y labio delgado (foto de referencia).
  // Perfil interior hueco, sin anillo superior grueso ni voladizos.
  const profile=[
    [0,-h/2+.095],[r*.78,-h/2+.095],[r*.94,-h/2+.075],
    [r*.985,-h/2+.045],[r,-h/2+.09],
    [r,-h/2+.20],[r,h/2-.065],
    [r-.004,h/2-.020],[r-.022,h/2],
    [r-.046,h/2+.002],[r-.072,h/2-.022],
    [r-.090,h/2-.065],[r-.090,-h/2+.17],
    [r-.13,-h/2+.12],[0,-h/2+.12]
  ];
  addGeo(new THREE.LatheGeometry(profile.map(([x,y])=>new THREE.Vector2(x,y)),160),plain);
}else{
  addGeo(new THREE.CylinderGeometry(r,r,h,128,1,true),plain);
}
const widthCm=Number($('widthCm').value)||dimensions[p][0];
printArc=Math.min(Math.PI*1.94,Math.PI*2*widthCm/circumferenceCm[p]);
// El lienzo corresponde únicamente a la superficie imprimible.
const printSurface=addGeo(
  new THREE.CylinderGeometry(r+.009,r+.009,h-.30,128,1,true,-printArc/2,printArc),
  printMat
);
printSurface.rotation.y=THREE.MathUtils.degToRad(printRotationDeg);
// Segunda superficie puramente decorativa: jamás se usa para exportar arte plano.
if(finishMode==='glitter'){
 const glossMat=new THREE.MeshStandardMaterial({map:glitterTexture,bumpMap:glitterTexture,bumpScale:.025,transparent:true,opacity:1,roughness:({gloss:.16,satin:.45,matte:.8})[readGlitterControls().finish],metalness:.65,depthWrite:false,side:THREE.FrontSide});
 const sparkles=addGeo(new THREE.CylinderGeometry(r+.024,r+.024,h-.29,128,1,true,-printArc/2,printArc),glossMat);
 sparkles.rotation.y=THREE.MathUtils.degToRad(printRotationDeg);
 printMat.roughness=.28;printMat.metalness=.06;
}
if(finishMode==='magic'&&p==='mug'){
 const coatMat=new THREE.MeshBasicMaterial({map:magicTexture,transparent:true,depthWrite:false,side:THREE.FrontSide});
 const coat=addGeo(new THREE.CylinderGeometry(r+.026,r+.026,h-.29,128,1,true,-printArc/2,printArc),coatMat);
 coat.rotation.y=THREE.MathUtils.degToRad(printRotationDeg);
}
// Indicadores de ambos límites: quedan fuera del PNG para impresión.
if($('showGuides').checked) for (const theta of [-printArc/2+THREE.MathUtils.degToRad(printRotationDeg),printArc/2+THREE.MathUtils.degToRad(printRotationDeg)]) {
  const points=[];
  for(let i=0;i<=20;i++){
    const yy=-(h-.30)/2+i*(h-.30)/20;
    points.push(new THREE.Vector3((r+.019)*Math.sin(theta),yy,(r+.019)*Math.cos(theta)));
  }
  const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:0x21bad0}));
  modelRoot.add(line);
}
if(p==='mug'){
  // Asa clásica en forma de D suavemente ovalada, unida a la cara derecha.
  const handlePath=new THREE.CatmullRomCurve3([
    new THREE.Vector3(r-.015,h*.345,0),
    new THREE.Vector3(r+.19,h*.39,0),
    new THREE.Vector3(r+.52,h*.34,0),
    new THREE.Vector3(r+.68,h*.16,0),
    new THREE.Vector3(r+.71,0,0),
    new THREE.Vector3(r+.68,-h*.17,0),
    new THREE.Vector3(r+.53,-h*.34,0),
    new THREE.Vector3(r+.21,-h*.38,0),
    new THREE.Vector3(r-.015,-h*.345,0)
  ],false,'centripetal');
  addGeo(new THREE.TubeGeometry(handlePath,100,.106,20,false),plain);
}else{
  addGeo(new THREE.CylinderGeometry(r,r,.08,96),plain,0,-h/2,0);
  addGeo(new THREE.CylinderGeometry(.77,.7,.14,96),new THREE.MeshStandardMaterial({color:'#cbd5df',metalness:.4,roughness:.35}),0,h/2+.09,0)
}}
else if(p==='shirt'){
  // Polera frontal mejorada con mangas, hombros, cuello hueco y espesor visible.
  const shape=new THREE.Shape();
  [[-1.04,-1.5],[1.04,-1.5],[1.00,.80],[1.50,.57],[1.88,1.17],[1.22,1.56],[.63,1.39],[.40,1.28],[-.40,1.28],[-.63,1.39],[-1.22,1.56],[-1.88,1.17],[-1.50,.57],[-1.00,.80]].forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));
  shape.closePath();
  // Cuello curvado con hueco real en la silueta.
  const collarHole=new THREE.Path();
  collarHole.absellipse(0,1.36,.39,.19,0,Math.PI*2,true,0);
  shape.holes.push(collarHole);
  const fabric=new THREE.MeshStandardMaterial({color:c,roughness:.94,metalness:0,side:THREE.DoubleSide});
  const body=addGeo(new THREE.ExtrudeGeometry(shape,{depth:.10,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.035,bevelThickness:.025,curveSegments:20}),fabric,0,0,-.08);
  // La impresión se presenta como un parche plano provisional sobre el pecho.
  addGeo(new THREE.PlaneGeometry(1.76,1.88),printMat,0,-.25,.096);
  // Borde de cuello con costura discreta.
  const neck=addGeo(new THREE.TorusGeometry(.32,.042,10,42,Math.PI),new THREE.MeshStandardMaterial({color:c,roughness:.9}),0,1.37,.055);
  neck.scale.y=.58;
}
else if(p==='tote'){
  const cloth=new THREE.MeshStandardMaterial({color:c,roughness:.93,side:THREE.DoubleSide});
  addGeo(new THREE.BoxGeometry(2.65,2.55,.22),cloth,0,-.25,0);
  addGeo(new THREE.PlaneGeometry(2.32,2.12),printMat,0,-.29,.125);
  for(let x of [-.71,.71]){
    const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(x-.20,.94,.04),new THREE.Vector3(x-.16,1.58,.04),new THREE.Vector3(x+.15,1.59,.04),new THREE.Vector3(x+.20,.94,.04)]);
    addGeo(new THREE.TubeGeometry(curve,24,.07,8,false),cloth);
  }
}
else if(p==='notebook'){
  addGeo(new THREE.BoxGeometry(2.15,3,.15),plain);
  addGeo(new THREE.PlaneGeometry(1.98,2.91),printMat,.07,0,.085);
  for(let y=-1.25;y<=1.25;y+=.24){addGeo(new THREE.TorusGeometry(.095,.025,6,20),new THREE.MeshStandardMaterial({color:'#9daec1',metalness:.7,roughness:.2}),-1.1,y,.15)}
}
else if(p==='mousepad'){
  const mat=new THREE.MeshStandardMaterial({color:c,roughness:.93,side:THREE.DoubleSide});
  const geo=new THREE.BoxGeometry(3.1,.065,2.28);addGeo(geo,mat,0,0,0);
  addGeo(new THREE.PlaneGeometry(3.02,2.2),printMat,0,.038,0,-Math.PI/2);
  modelRoot.rotation.x=-.65;
}
else if(p==='cushion'){
  const cloth=new THREE.MeshStandardMaterial({color:c,roughness:1,side:THREE.DoubleSide});
  const cush=addGeo(new THREE.BoxGeometry(2.55,2.55,.4,8,8,3),cloth);
  const pos=cush.geometry.attributes.position;
  for(let i=0;i<pos.count;i++){
    let x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
    const bulge=Math.max(0,(1-Math.pow(x/1.35,4))*(1-Math.pow(y/1.35,4)));
    pos.setZ(i,z+Math.sign(z)*.12*bulge);
  }
  pos.needsUpdate=true;cush.geometry.computeVertexNormals();
  addGeo(new THREE.PlaneGeometry(2.23,2.23),printMat,0,0,.34);
}
else if(p==='keychain'){
  const ring=new THREE.MeshStandardMaterial({color:'#c2ccd9',metalness:.8,roughness:.26});
  addGeo(new THREE.CylinderGeometry(1,1,.12,80),plain,0,0,0,Math.PI/2);
  addGeo(new THREE.CircleGeometry(.96,80),printMat,0,0,.072);
  addGeo(new THREE.TorusGeometry(.19,.047,12,32),ring,0,1.18,0);
  addGeo(new THREE.TorusGeometry(.38,.075,12,42),ring,0,1.66,0);
}
$('productColor').oninput=()=>{buildModel()};notify('Modelo cargado · V0.9.1 · Taza cerámica mejorada')}
// V0.8.2: recargar los pixels en GPU tras cambios del editor.
let lastCanvasRevision=0;
// V0.8.4: crear un objeto de textura nuevo para cada revision del lienzo.
// Algunos controladores WebGL mantienen la version anterior del canvas cuando
// cambia su tamaño o cuando se descargan imagenes nuevas. Evitamos ese estado.
let refreshFrame=0;
let lastTextureResolution='';
function refreshTextureNow(){
  refreshFrame=0;
  if(!scene || !renderer || !textureCanvas.width || !textureCanvas.height)return;
  const previous=texture;
  const current=new THREE.CanvasTexture(textureCanvas);
  current.colorSpace=THREE.SRGBColorSpace;
  current.wrapS=THREE.ClampToEdgeWrapping;
  current.wrapT=THREE.ClampToEdgeWrapping;
  current.flipY=true;
  current.needsUpdate=true;
  texture=current;
  if(modelRoot)modelRoot.traverse(o=>{
    if(!o.isMesh)return;
    for(const m of (Array.isArray(o.material)?o.material:[o.material])){
      if(m && m.map===previous){m.map=current;m.needsUpdate=true;}
    }
  });
  if(previous && previous!==current)previous.dispose();
  lastTextureResolution=`${textureCanvas.width}x${textureCanvas.height}`;
  renderer.render(scene,camera);
}
function updateTexture(){
  lastCanvasRevision++;
  if(texture)texture.needsUpdate=true;
  if(scene && renderer && !refreshFrame){
    refreshFrame=requestAnimationFrame(refreshTextureNow);
  }
}
function resync3D({resetView=false, selectedObject=false}={}){
  if(!texture || !renderer || !scene) return;
  // La textura se pinta desde todas las capas, nunca desde el cuadro de seleccion.
  paintDesign(textureCtx,textureCanvas.width,textureCanvas.height);
  refreshTextureNow();
  // Reasignar el mapa a cada superficie de impresión (sin reconstruir geometrías).
  if(modelRoot) modelRoot.traverse(o=>{
    if(!o.isMesh)return;
    const mats=Array.isArray(o.material)?o.material:[o.material];
    for(const m of mats){if(m?.map===texture){m.map=texture;m.needsUpdate=true;}}
  });
  if(resetView){
    if(selectedObject && elements[selected] && ['mug','tumbler'].includes($('product').value)){
      const x=Math.max(0,Math.min(1,Number(elements[selected].x)||0.5));
      const angle=THREE.MathUtils.degToRad(printRotationDeg)+(0.5-x)*printArc;
      camera.position.set(5.7*Math.sin(angle),1,5.7*Math.cos(angle));
      controls.target.set(0,0,0);controls.update();
    }else{focusDesignFront();}
  }
  renderer.render(scene,camera);
  notify('Diseño 3D sincronizado · '+elements.length+' capas');
}
$('resync3D').onclick=()=>resync3D({resetView:true});
$('viewSelected3D').onclick=()=>resync3D({resetView:true,selectedObject:true});

$('viewStart').onclick=()=>focusPrintEdge('start');
$('viewEnd').onclick=()=>focusPrintEdge('end');
$('resetCam').onclick=focusDesignFront;
$('viewDesign').onclick=focusDesignFront;
$('exportMockup').onclick=()=>{
  resync3D();
  const show=$('showGuides').checked;
  if(show){$('showGuides').checked=false;buildModel()}
  renderer.render(scene,camera);
  renderer.domElement.toBlob(b=>{if(b)saveBlob(b,'mockup-3d.png');else notify('No se pudo exportar el mockup');if(show){$('showGuides').checked=true;buildModel()}requestAnimationFrame(()=>resync3D());},'image/png');
};

// V0.8: herramientas de exportación y presentación sin servidor ni pagos.
$('viewerBackground').addEventListener('change',e=>scene.background=new THREE.Color(e.target.value));
$('showGuides').addEventListener('change',()=>buildModel());
$('exportJpg').addEventListener('click',async()=>{
  try{const {w,h}=cmPrint(),c=renderToExportCanvas(getMirrorMode()),raw=await canvasBlob(c,'image/jpeg',.97);
    saveBlob(jpegWithDpi(await raw.arrayBuffer()),`impresion_${w}x${h}cm_${getMirrorMode()}_300ppp.jpg`);
    notify(`JPEG generado: ${w} × ${h} cm a 300 ppp (${c.width} × ${c.height} píxeles).`);
  }catch(e){notify('Error JPEG: '+e.message)}
});
$('exportPDF').addEventListener('click',async()=>{
  try{const {w,h}=cmPrint(),c=renderToExportCanvas(getMirrorMode());
    saveBlob(await pdfAtPhysicalSize(c,w,h),`impresion_${w}x${h}cm_${getMirrorMode()}_escala-real.pdf`);
    notify(`PDF generado con página de ${w} × ${h} cm. Imprimir al 100 %, sin ajustar a página.`);
  }catch(e){notify('Error PDF: '+e.message)}
});
// Video local: registra el propio WebGL canvas, sin enviar fotos al servidor.
let recording=false;
$('exportVideo').addEventListener('click',async()=>{
  if(recording)return;
  const surface=renderer?.domElement;
  if(!surface?.captureStream || !window.MediaRecorder){notify('Este navegador no admite grabación de video del lienzo 3D.');return}
  const type=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));
  if(!type){notify('El navegador no soporta WebM. Prueba Chrome o Edge en computador.');return}
  recording=true;
  const button=$('exportVideo');button.disabled=true;button.textContent='Grabando giro…';
  const show=$('showGuides').checked;
  if(show){$('showGuides').checked=false;buildModel()}
  const start=camera.position.clone();const target=controls.target.clone();const rel=start.clone().sub(target);
  const radius=Math.sqrt(rel.x*rel.x+rel.z*rel.z),angle0=Math.atan2(rel.x,rel.z),seconds=6;
  let stream,recorder,frames=[],started=0;
  try{
    stream=surface.captureStream(30);
    recorder=new MediaRecorder(stream,{mimeType:type,videoBitsPerSecond:4500000});
    recorder.ondataavailable=e=>{if(e.data?.size)frames.push(e.data)};
    recorder.onstop=()=>{if(frames.length)saveBlob(new Blob(frames,{type}),'mockup-giro-360.webm');else notify('Video vacío; inténtalo de nuevo.');stream.getTracks().forEach(t=>t.stop());};
    controls.enabled=false;controls.enableDamping=false;recorder.start(300);
    await new Promise(resolve=>{
      const frame=now=>{
        if(!started)started=now;
        const p=Math.min(1,(now-started)/(seconds*1000));const angle=angle0+Math.PI*2*p;
        camera.position.set(target.x+radius*Math.sin(angle),start.y,target.z+radius*Math.cos(angle));
        camera.lookAt(target);renderer.render(scene,camera);
        if(p<1)requestAnimationFrame(frame);else resolve();
      };requestAnimationFrame(frame);
    });
    await new Promise(resolve=>{recorder.addEventListener('stop',resolve,{once:true});recorder.stop()});
    notify('Video WebM generado. Revisa la descarga.');
  }catch(e){notify('No se pudo grabar: '+e.message);try{if(recorder?.state==='recording')recorder.stop()}catch{}}
  finally{if(stream)stream.getTracks().forEach(t=>t.stop());camera.position.copy(start);controls.target.copy(target);controls.enabled=true;controls.enableDamping=true;controls.update();if(show){$('showGuides').checked=true;buildModel()}recording=false;button.disabled=false;button.textContent='Grabar giro 360° (WebM)';requestAnimationFrame(()=>resync3D());}
});

updateDimensions();try{init3D()}catch(error){scene=null;renderer=null;notify('Visor 3D no disponible. El editor y la impresión 2D siguen disponibles.')}syncFinishUI();updateRotationToolbar();focusDesignFront();

// API interna de impresión: la plancha recibe el arte limpio y los codificadores de 300 ppp.
const savedMirrorMode=localStorage.getItem('estudio-mirror-mode');
$('mirrorModeIndividual').checked=savedMirrorMode!=='normal' && savedMirrorMode!=='none';
$('mirrorModeIndividual').addEventListener('change',()=>{localStorage.setItem('estudio-mirror-mode',getMirrorMode());refreshIndividualPreview()});
$('refreshMirrorPreview').onclick=refreshIndividualPreview;
requestAnimationFrame(refreshIndividualPreview);
window.__estudioPrintAPI={renderToExportCanvas, cmPrint, pngWithDpi, jpegWithDpi, pdfAtPhysicalSize, saveBlob};

for(const id of ['delete','applyText','quickCenter','quickContain','quickCover']){
 const button=$(id),handler=button.onclick;if(handler)button.onclick=ev=>{if(elements[selected]?.locked){notify('La capa está bloqueada.');return}handler(ev)};
}

function readGlitterControls(){return glitterSettings({palette:$('glitterPalette').value,color:$('glitterColor').value,size:+$('glitterSize').value,intensity:+$('glitterIntensity').value,finish:$('glitterFinish').value})}
function applyGlitterControls(value){const s=glitterSettings(value);for(const [id,key]of [['glitterPalette','palette'],['glitterColor','color'],['glitterSize','size'],['glitterIntensity','intensity'],['glitterFinish','finish']])$(id).value=s[key];paintGlitter(glitterCtx,512,256,s,{material:true});glitterTexture.needsUpdate=true;}
for(const id of ['glitterPalette','glitterColor','glitterSize','glitterIntensity','glitterFinish'])$(id).onchange=()=>{applyGlitterControls(readGlitterControls());buildModel()};
$('applyGlitterLayer').onclick=()=>{const e=elements[selected];if(e?.type!=='glitter'||e.locked){notify('Selecciona una capa glitter desbloqueada.');return}addHistory();e.glitter=readGlitterControls();draw()};
$('addGlitterLayer').onclick=()=>{addHistory();elements.unshift({type:'glitter',x:.5,y:.5,locked:true,glitter:readGlitterControls()});selected=0;draw();notify('Glitter simulado añadido al arte imprimible, debajo del diseño.');};
function refreshLayers(){
 const list=$('layerList');if(!list)return;list.replaceChildren();
 for(let i=elements.length-1;i>=0;i--){const e=elements[i],row=document.createElement('div');row.className='btnrow';
 const choose=document.createElement('button');choose.textContent=(selected===i?'✓ ':'')+(e.type==='text'?e.text.slice(0,24):e.type==='glitter'?'Glitter imprimible':'Imagen');choose.onclick=()=>{selected=i;if(e.type==='glitter')applyGlitterControls(e.glitter);loadSelectedTextIntoInputs();updateImageControls();draw()};row.append(choose);
 for(const [key,label] of [['visible','Visible'],['locked','Bloquear']]){const lab=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=key==='visible'?e.visible!==false:!!e.locked;input.setAttribute('aria-label',label+' '+i);input.onchange=()=>{addHistory();e[key]=input.checked;draw()};lab.append(input,document.createTextNode(label));row.append(lab)}list.append(row);
 }
 $('layerOpacity').value=String(Math.round((elements[selected]?.opacity??1)*100));
}
$('layerOpacity').onchange=ev=>{const e=elements[selected];if(!e||e.locked)return;addHistory();e.opacity=Number(ev.target.value)/100;draw()};
$('layerDuplicate').onclick=()=>{const e=elements[selected];if(!e)return;addHistory();elements.splice(selected+1,0,JSON.parse(JSON.stringify({...e,img:undefined})));selected++;draw()};
for(const [id,delta] of [['layerUp',1],['layerDown',-1]])$(id).onclick=()=>{const i=selected,j=i+delta;if(i<0||j<0||j>=elements.length||elements[i].locked)return;addHistory();[elements[i],elements[j]]=[elements[j],elements[i]];selected=j;draw()};
