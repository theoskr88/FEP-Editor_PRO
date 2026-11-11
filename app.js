import {openProjectLibrary,createProjectSession,cleanDocument,documentDigest} from './src/projects.js?v=fep-1a3de09befbf814e';
import {createProjectManager} from './src/project-manager.js?v=fep-1a3de09befbf814e';
import {zonesFor,emptyZones,zoneCanvasWidth,copyZoneLayers,allProjectLayers} from './src/zones.js?v=fep-1a3de09befbf814e';
import {createTextileMaps} from './src/textile-materials.js?v=fep-1a3de09befbf814e';
import {zipFiles} from './src/zip-store.js?v=fep-1a3de09befbf814e';
import {encodeVideoFrames} from './src/video-frames.js?v=fep-1a3de09befbf814e';
import {normalizeMockup} from './src/mockup-settings.js?v=fep-1a3de09befbf814e';
import {createMockupControls} from './src/mockup-controls.js?v=fep-1a3de09befbf814e';
import {validateCreative,validatePatternBudget,paintCreativeText,creativeTextBounds,paintCreativeImage,CREATIVE_TEMPLATES} from './src/creative.js?v=fep-1a3de09befbf814e';
import {createCreativeControls} from './src/creative-controls.js?v=fep-1a3de09befbf814e';
import {PRODUCT_PROFILES,PRODUCT_VARIANTS,profileById} from './src/product-profiles.js?v=fep-1a3de09befbf814e';
import {validateVector,shapePaths,physicalPaths,vectorFromPhysical,booleanPaths,offsetPaths,paintVector,vectorBounds,textToPaths,exportVectorSVG} from './src/vector.js?v=fep-1a3de09befbf814e';
import {createVectorControls} from './src/vector-controls.js?v=fep-1a3de09befbf814e';
import {getSticker} from './src/stickers.js?v=fep-1a3de09befbf814e';
import {normalizeFreeDesign,fromCm,pageSize,paintShape,shapeBounds,validateShape,alignedPosition} from './src/free-design.js?v=fep-1a3de09befbf814e';
import {createFreeControls} from './src/free-controls.js?v=fep-1a3de09befbf814e';
import {validateProject,validateStickerLayer} from './src/project.js?v=fep-1a3de09befbf814e';
import {createLayerList,layerName} from './src/layer-ui.js?v=fep-1a3de09befbf814e';
import {paintGlitter,glitterSettings,glitterTextureSize,glitterMaterialProperties,GLITTER_SCHEMA} from './src/glitter.js?v=fep-1a3de09befbf814e';
import {createGlitterCache} from './src/glitter-cache.js?v=fep-1a3de09befbf814e';
import {createGlitterControls} from './src/glitter-controls.js?v=fep-1a3de09befbf814e';
import {prepareProject} from './src/imports.js?v=fep-1a3de09befbf814e';
import {prepareImageFile,enforceDocumentBudget as enforceLayerBudget,ASSET_LIMITS} from './src/assets.js?v=fep-1a3de09befbf814e';
import {openDocumentStore,createAutosave} from './src/persistence.js?v=fep-1a3de09befbf814e';
let sceneSettings=normalizeMockup(),sceneController,photoBusy=false;
let materialVariant='original';
let THREE,OrbitControls,resizeViewer=()=>{};
let recovering=true,stickerController,stickerPainter,stickerGeometry,stickerReady;
if(!window.__fepUI){try{window.__fepUI=(await import('./src/interface.js?v=fep-1a3de09befbf814e')).initInterface()}catch{}}
const ui=window.__fepUI||{refresh(){}};
const $ = x=>document.getElementById(x); const canvas=$('designCanvas'),ctx=canvas.getContext('2d');
let dragStart=null,gestureHistory=false,importGeneration=0;
let documentWidth=20,documentHeight=8.5,editorMode='product',freeDesign=normalizeFreeDesign(),freeController,vectorController,creativeController;
let projectManager,projectLibrary,projectSession,projectSwitchBusy=false,projectRecoveryError=false,resetSaveFingerprint=()=>{};
let queueAutosave=()=>{},preferredGuides=$('showGuides').checked;
let freeDocument=null,freeSession=null,productZones={},zoneProduct=null,zoneBusy=false,textileMaps;
let elements=[],selected=-1,dragging=false,resizing=false,resizeStart=null,history=[],redoStack=[],meshGroup,texture,renderer,scene,camera,controls,animRequest,renderQueued=false;
// Lienzo exclusivo para texturas: nunca contiene bordes de selección.
const textureCanvas=document.createElement('canvas');
const textureCtx=textureCanvas.getContext('2d');
const glitterResolution=glitterTextureSize({touch:navigator.maxTouchPoints>0,deviceMemory:navigator.deviceMemory??8,viewportWidth:window.innerWidth});
const glitterTiles=createGlitterCache({width:1024,height:512,limit:glitterResolution.cacheEntries});
const notify=s=>{$('notice').textContent=s};
const dimensions=Object.fromEntries(PRODUCT_PROFILES.map(p=>[p.id,p.printCm]));
for(const profile of PRODUCT_PROFILES)if(![...$('product').options].some(o=>o.value===profile.id)){const option=document.createElement('option');option.value=profile.id;option.textContent=profile.name;$('product').append(option)}
for(const profile of PRODUCT_PROFILES)if(profile.multiZone)$('product').querySelector(`option[value=${profile.id}]`).textContent=profile.name;
for(const[id,v]of Object.entries(PRODUCT_VARIANTS)){const option=document.createElement('option');option.value=id;option.textContent=v.name;$('profileVariant').append(option)}
$('productColor').oninput=()=>{buildModel()};
$('profileVariant').onchange=()=>{materialVariant=$('profileVariant').value;buildModel();queueAutosave()};
function setDimForProduct(){++importGeneration;captureZone();let p=$('product').value, d=dimensions[p];if(!d)return;
  if(editorMode==='product'&&zonesFor(p).length){openZoneProduct(p);return}else if(zoneProduct){elements=copyElements();history=[];redoStack=[];zoneProduct=null;syncZoneUI()}if(p==='mug'||p==='tumbler')setPrintRotation(DEFAULT_PRINT_ROTATION_DEG);$('widthCm').value=d[0];$('heightCm').value=d[1]; updateDimensions(); buildModel();focusDesignFront();sceneController?.refresh({camera:true})}
function updateDimensions(){let w=+($('widthCm').value)||20,h=+($('heightCm').value)||8.5;w=Math.max(1,Math.min(100,w));h=Math.max(1,Math.min(100,h));try{validatePatternBudget(elements,w,h)}catch(error){$('widthCm').value=documentWidth;$('heightCm').value=documentHeight;notify(error.message);return false}$('widthCm').value=w;$('heightCm').value=h;documentWidth=w;documentHeight=h;canvas.width=Math.min(1200,Math.round(4096*w/h));canvas.height=Math.round(canvas.width*h/w);
textureCanvas.width=canvas.width;textureCanvas.height=canvas.height;
$('canvasWrap').style.aspectRatio=`${w} / ${h}`;
$('resolution').textContent=editorMode==='free'?`${Number(fromCm(w,freeDesign.unit).toFixed(3))} × ${Number(fromCm(h,freeDesign.unit).toFixed(3))} ${freeDesign.unit}`:`${w} × ${h} cm`;draw();updateImageControls()}
function initialLayerSize(fw,ratio){const fh=fw*canvas.width/canvas.height*ratio,factor=Math.min(1,3/fh);return {widthFrac:fw*factor,heightFrac:fh*factor}}
function copyElements(source=elements){return source.map(e=>({...e,...(e.glitter?{glitter:{...e.glitter}}:{}),...(e.label?{label:{...e.label}}:{}),...(e.paths?{paths:e.paths.map(r=>r.map(p=>[...p]))}:{}),...(e.gradient?{gradient:{...e.gradient}}:{}),...(e.typography?{typography:{...e.typography}}:{}),...(e.repeat?{repeat:{...e.repeat}}:{}),...(e.crop?{crop:[...e.crop]}:{})}))}
function trimHistory(){
 const pixels=()=>{const seen=new Set();let n=0;for(const list of [elements,...history,...redoStack])for(const e of list)if(e.type==='image'&&e.img&&!seen.has(e.data)){seen.add(e.data);n+=e.img.naturalWidth*e.img.naturalHeight}return n};
 const nodes=()=>[elements,...history,...redoStack].reduce((n,list)=>n+list.reduce((a,e)=>a+(e.paths?.reduce((b,r)=>b+r.length,0)||0),0),0);
 while(history.length+redoStack.length>40||pixels()>ASSET_LIMITS.totalPixels||nodes()>1_000_000){if(history.length)history.shift();else if(redoStack.length)redoStack.shift();else break}
}
function addHistory(){history.push(copyElements());redoStack=[];trimHistory()}
function restore(state){elements=copyElements(state);selected=-1;draw();refreshSelectedLabel();updateImageControls()}
function undo(){if(!history.length)return;redoStack.push(copyElements());restore(history.pop())}
function redo(){if(!redoStack.length)return;history.push(copyElements());restore(redoStack.pop())}
function getImage(e){if(!e.img && e.data){e.img=new Image();e.img.onload=()=>{draw();requestAnimationFrame(()=>resync3D());};e.img.src=e.data}return e.img}

// Compatibilidad: las imágenes guardadas en V0.5 solo tenían scale.
function imageFractions(e,referenceWidth=canvas.width,referenceHeight=canvas.height){
  const im=getImage(e);
  const ratio=(im?.naturalWidth&&im?.naturalHeight)?im.naturalHeight/im.naturalWidth:1;
  const fw=Number.isFinite(e.widthFrac)?e.widthFrac:(Number(e.scale)||.38);
  const fh=Number.isFinite(e.heightFrac)?e.heightFrac:fw*referenceWidth/referenceHeight*ratio;
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
function canResizeLayer(e,fw,fh){try{validatePatternBudget(elements.map(item=>item===e?{...item,widthFrac:fw,heightFrac:fh}:item),documentWidth,documentHeight);return true}catch(error){notify(error.message);return false}}
function setImageSize(w,h){
  const e=elements[selected];if(e?.type!=='image'||e.locked)return;
  const cw=Number($('widthCm').value)||20,ch=Number($('heightCm').value)||8.5;
  const ww=Number(w),hh=Number(h);
  if(!Number.isFinite(ww)||!Number.isFinite(hh)||ww<=0||hh<=0||ww>cw*3||hh>ch*3){notify('Ingresa dimensiones positivas dentro del rango permitido.');return;}
  if(!canResizeLayer(e,ww/cw,hh/ch))return;addHistory();e.widthFrac=ww/cw;e.heightFrac=hh/ch;
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

function paintDesign(target,width,height,{transparent=!!zoneProduct||(editorMode==='free'&&freeDesign.background==='transparent'),onlyLayer=null,source=elements,pageWidth=documentWidth,pageHeight=documentHeight,referenceWidth=canvas.width}={}){
  target.clearRect(0,0,width,height);
  if(!transparent){target.fillStyle='#ffffff';target.fillRect(0,0,width,height)}
  const sourceElements=onlyLayer?[onlyLayer]:source;
  for(let i=0;i<sourceElements.length;i++){
    const e=sourceElements[i];if(e.visible===false)continue;target.save();target.globalAlpha=e.opacity??1;
    if(e.type==='glitter'){const tile=glitterTiles.get(e.glitter);target.drawImage(tile,0,0,width,height);target.restore();continue;}
    if(e.type==='vector'){if(e.role!=='cut')paintVector(target,e,width,height);target.restore();continue;}
    if(e.type==='text'&&(e.typography||e.gradient)){paintCreativeText(target,e,width,height,referenceWidth);target.restore();continue;}
    if(e.type==='image'&&(e.repeat||e.crop||e.mask)){const f=imageFractions(e,referenceWidth,referenceWidth*pageHeight/pageWidth);paintCreativeImage(target,e,getImage(e),width,height,pageWidth,f.fw,f.fh);target.restore();continue;}
    if(e.type==='shape'){paintShape(target,e,width,height);target.restore();continue;}
    if(e.type==='sticker'){if(stickerPainter)stickerPainter(target,e,width,height);target.restore();continue;}
    target.translate(e.x*width,e.y*height);
    if(e.type==='text'){
      target.font=`bold ${e.size*width/referenceWidth}px Arial`;
      target.textAlign='center';target.textBaseline='middle';target.fillStyle=e.color;
      target.fillText(e.text,0,0,width*.9);
    }else{
      const im=getImage(e);
      if(im?.complete&&im.naturalWidth){
        const {fw,fh}=imageFractions(e,referenceWidth,referenceWidth*pageHeight/pageWidth);let w=fw*width,h=fh*height;
        target.drawImage(im,-w/2,-h/2,w,h);
      }
    }
    target.restore();
  }
}
function draw(){
  captureZone();syncZoneUI();syncTextileMaps();
  trimHistory();queueAutosave();
  refreshLayers();
  paintDesign(ctx,canvas.width,canvas.height);
  for(const e of elements)if(e.type==='vector'&&e.role==='cut'&&e.visible!==false)paintVector(ctx,e,canvas.width,canvas.height,{cutPreview:true});
  vectorController?.sync();creativeController?.sync();
  // El borde punteado es interfaz de edición y no forma parte del diseño.
  stickerController?.sync();freeController?.sync();
  if(selected>=0){
    const b=bounds(elements[selected]);ctx.save();ctx.strokeStyle='#0c91a3';
    ctx.lineWidth=3;ctx.setLineDash([9,7]);ctx.strokeRect(b.x,b.y,b.w,b.h);
    if(['image','sticker','shape','vector'].includes(elements[selected]?.type)){ctx.setLineDash([]);ctx.fillStyle='#0c91a3';ctx.fillRect(b.x+b.w-9,b.y+b.h-9,18,18);ctx.strokeStyle='#fff';ctx.strokeRect(b.x+b.w-9,b.y+b.h-9,18,18)}
    ctx.restore();
  }
  paintDesign(textureCtx,textureCanvas.width,textureCanvas.height);
  if(finishMode==='glitter'||['mug','tumbler'].includes($('product').value))updateGlitterArtwork();updateTexture();
  if($('mirrorPreview'))refreshIndividualPreview();
}
function bounds(e){if(e?.type==='text'&&(e.typography||e.gradient))return creativeTextBounds(ctx,e,canvas.width,canvas.height);if(e?.type==='vector')return vectorBounds(e,canvas.width,canvas.height);if(e?.type==='shape')return shapeBounds(e,canvas.width,canvas.height);if(e?.type==='sticker')return stickerGeometry.stickerBounds(e,canvas.width,canvas.height);if(!e)return{x:0,y:0,w:0,h:0};let w,h;if(e.type==='glitter')return{x:0,y:0,w:canvas.width,h:canvas.height};if(e.type==='text'){ctx.font=`bold ${e.size}px Arial`;w=Math.min(ctx.measureText(e.text).width,canvas.width*.9);h=e.size*1.25}else{let im=getImage(e);const f=imageFractions(e);w=f.fw*canvas.width;h=f.fh*canvas.height}return {x:e.x*canvas.width-w/2,y:e.y*canvas.height-h/2,w,h}}
function pos(ev){const r=canvas.getBoundingClientRect(),scale=Math.min(r.width/canvas.width,r.height/canvas.height),w=canvas.width*scale,h=canvas.height*scale;return{x:(ev.clientX-r.left-(r.width-w)/2)/scale,y:(ev.clientY-r.top-(r.height-h)/2)/scale}}
canvas.addEventListener('pointerdown',ev=>{
  if(dragging||resizing)return;const p=pos(ev);resizing=false;resizeStart=null;gestureHistory=false;
  // El cuadro inferior derecho cambia el tamaño de una imagen seleccionada.
  if(selected>=0&&['image','sticker','shape','vector'].includes(elements[selected]?.type)&&!elements[selected].locked){
    const b=bounds(elements[selected]);const hit=15*canvas.width/Math.max(1,canvas.getBoundingClientRect().width);
    if(Math.abs(p.x-(b.x+b.w))<=hit&&Math.abs(p.y-(b.y+b.h))<=hit){
      resizing=true;resizeStart={x:p.x,y:p.y,w:['sticker','shape','vector'].includes(elements[selected].type)?elements[selected].widthFrac*canvas.width:b.w,h:['sticker','shape','vector'].includes(elements[selected].type)?elements[selected].heightFrac*canvas.height:b.h};
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
    const limit=Math.min(1,3*canvas.width/w,3*canvas.height/h);if(!canResizeLayer(e,w*limit/canvas.width,h*limit/canvas.height))return;e.widthFrac=w*limit/canvas.width;e.heightFrac=h*limit/canvas.height;delete e.scale;
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
    const f=['shape','vector'].includes(e.type)?{fw:e.widthFrac,fh:e.heightFrac}:e.type==='sticker'?stickerGeometry.stickerFractions(e,canvas.width,canvas.height):imageFractions(e);const fw=Math.max(.005,Math.min(3,f.fw*k)),fh=Math.max(.005,Math.min(3,f.fh*k));if(!canResizeLayer(e,fw,fh))return;e.widthFrac=fw;
    e.heightFrac=fh;delete e.scale;
    updateImageControls();
  }
  draw();
},{passive:false});
$('addText').onclick=()=>{if(elements.length>=500){notify('Máximo 500 capas');return}addHistory();elements.push({type:'text',text:$('textValue').value||'Texto',color:$('textColor').value,size:+$('fontSize').value,x:.5,y:.5});selected=elements.length-1;refreshSelectedLabel();updateImageControls();draw();focusDesignFront()};
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
$('imageFile').onchange=async ev=>{
 const file=ev.target.files?.[0];ev.target.value='';if(!file)return;const generation=++importGeneration;
 try{const asset=await prepareImageFile(file);if(generation!==importGeneration)return;const e={type:'image',data:asset.data,img:asset.img,scale:.38,x:.5,y:.5};if(elements.length>=500)throw Error('Máximo 500 capas');enforceDocumentBudget([...elements,e]);addHistory();elements.push(e);selected=elements.length-1;refreshSelectedLabel();updateImageControls();draw();requestAnimationFrame(()=>resync3D({resetView:true,selectedObject:true}));notify('Imagen añadida.')}catch(error){notify('No se pudo abrir la imagen: '+error.message)}
};
$('delete').onclick=()=>{if(selected>=0){addHistory();elements.splice(selected,1);selected=-1;refreshSelectedLabel();updateImageControls();draw()}};
$('clear').onclick=()=>{addHistory();elements=[];selected=-1;refreshSelectedLabel();updateImageControls();draw()};$('undo').onclick=undo;$('redo').onclick=redo;
$('rotationDeg').addEventListener('input',e=>setPrintRotation(e.target.value));
$('rotationReset').onclick=()=>setPrintRotation(DEFAULT_PRINT_ROTATION_DEG);
$('rotateMinus').onclick=()=>setPrintRotation(printRotationDeg-5);
$('rotatePlus').onclick=()=>setPrintRotation(printRotationDeg+5);
$('rotationViewFront').onclick=focusDesignFront;
$('rotationNumber').addEventListener('change',e=>setPrintRotation(e.target.value));
$('widthCm').onchange=()=>{updateDimensions();if(!profileById($('product').value)?.multiZone)buildModel()};$('heightCm').onchange=()=>{updateDimensions();if(profileById($('product').value)?.kind==='glb'&&!profileById($('product').value)?.multiZone)buildModel()};$('product').onchange=()=>{setDimForProduct();updateRotationToolbar()};
const zoneHistories=new Map();
function captureZone(){if(!zoneProduct||editorMode!=='product')return;const g=productZones[zoneProduct];if(!g)return;g.zones[g.active]={width:documentWidth,height:documentHeight,elements};zoneHistories.set(zoneProduct+':'+g.active,{history,redoStack,selected})}
function captureFree(){if(editorMode==='free'&&(freeDocument||Object.keys(productZones).length)){freeDocument={width:documentWidth,height:documentHeight,elements,freeDesign:normalizeFreeDesign(freeDesign)};freeSession={history,redoStack,selected}}}
function serializeZoneBank(){return Object.fromEntries(Object.entries(productZones).map(([p,g])=>[p,{active:g.active,zones:Object.fromEntries(Object.entries(g.zones).map(([id,z])=>[id,{width:z.width,height:z.height,elements:copyElements(z.elements).map(({img,...e})=>e)}]))}]))}
function enforceDocumentBudget(candidate){const others=Object.entries(productZones).flatMap(([p,g])=>Object.entries(g.zones).filter(([id])=>!(zoneProduct===p&&id===g.active)).flatMap(([,z])=>z.elements));enforceLayerBudget([...candidate,...others,...(editorMode!=='free'&&freeDocument?freeDocument.elements:[])])}
function syncZoneUI(){const defs=zoneProduct?zonesFor(zoneProduct):[];if(!$('zoneBar'))return;$('zoneBar').hidden=!defs.length;$('zoneViews').hidden=!defs.length;for(const id of ['zoneTools','zonePrintTools'])$(id).hidden=!defs.length;if(!defs.length)return;const g=productZones[zoneProduct],select=$('zoneSelect');if(select.dataset.product!==zoneProduct){select.replaceChildren(...defs.map(z=>new Option(z.name,z.id)));select.dataset.product=zoneProduct}select.value=g.active;$('zoneCopyTarget').replaceChildren(...defs.filter(z=>z.id!==g.active).map(z=>new Option(z.name,z.id)));$('zoneActiveName').textContent=defs.find(z=>z.id===g.active).name;$('zoneSizeNote').textContent=`${documentWidth} × ${documentHeight} cm · capas independientes`;for(const id of ['zoneSelect','zoneCopy','zoneExportAll','zoneAddSheet'])$(id).disabled=zoneBusy||recovering;$('zoneViews').disabled=zoneBusy||recovering||!renderer||recording||photoBusy||['loading','failed'].includes($('profileStatus').dataset.state);const def=defs.find(z=>z.id===g.active);$('zoneWarning').textContent=documentWidth>def.surface[0]||documentHeight>def.surface[1]?'Aviso: el lienzo excede la superficie de este modelo; el mockup recorta el sobrante. Verifica las medidas.':'';}
function fitTextileView(){if(!renderer||!camera||!modelRoot?.children.length||!profileById($('product').value)?.multiZone)return;const sphere=new THREE.Box3().setFromObject(modelRoot).getBoundingSphere(new THREE.Sphere()),direction=camera.position.clone().sub(controls.target).normalize(),half=Math.min(THREE.MathUtils.degToRad(camera.fov/2),Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.aspect)),distance=sphere.radius/Math.sin(half)*1.06;controls.target.copy(sphere.center);camera.position.copy(sphere.center).addScaledVector(direction,distance);camera.lookAt(sphere.center);controls.update()}
function focusZone(){const def=zonesFor(zoneProduct).find(z=>z.id===productZones[zoneProduct]?.active);if(!def||!camera)return;camera.position.set(...def.camera);controls.target.set(0,0,0);controls.update();fitTextileView();renderer.render(scene,camera)}
function openZoneProduct(product,id){++importGeneration;const previous=zoneProduct;captureZone();const fresh=!productZones[product],g=productZones[product]??=emptyZones(product);if(fresh&&elements.length&&!previous)g.zones[g.active].elements=copyElements();if(id&&!zonesFor(product).some(z=>z.id===id))throw Error('Zona no disponible');g.active=id||g.active;zoneProduct=product;const z=g.zones[g.active];elements=z.elements;const past=zoneHistories.get(product+':'+g.active);history=past?.history||[];redoStack=past?.redoStack||[];selected=past?.selected??-1;$('widthCm').value=z.width;$('heightCm').value=z.height;documentWidth=z.width;documentHeight=z.height;updateDimensions();refreshSelectedLabel();syncZoneUI();if(previous!==product||!modelRoot?.children.length)buildModel();focusZone();updateRotationToolbar();queueAutosave();}
function paintZone(target,w,h,doc){paintDesign(target,w,h,{source:doc.elements,pageWidth:doc.width,pageHeight:doc.height,referenceWidth:zoneCanvasWidth(doc.width,doc.height),transparent:true})}
function syncTextileMaps(product=zoneProduct){if(!textileMaps||!product||!productZones[product])return;captureZone();textileMaps.update(product,productZones[product],$('productColor').value,paintZone)}
function renderZoneCanvas(doc,mirror=false){const c=document.createElement('canvas');c.width=Math.round(doc.width/2.54*300);c.height=Math.round(doc.height/2.54*300);if(c.width*c.height>40e6)throw Error('La zona supera 40 megapíxeles a 300 ppp');paintZone(c.getContext('2d',{willReadFrequently:true}),c.width,c.height,doc);return mirror?mirrorFinishedImage(c):c}
$('zoneSelect').onchange=()=>{if(!zoneBusy)openZoneProduct(zoneProduct,$('zoneSelect').value)};
$('zoneCopy').onclick=()=>{try{captureZone();const g=productZones[zoneProduct],target=g.zones[$('zoneCopyTarget').value],source=g.zones[g.active];if(!target)throw Error('Selecciona destino');const additions=copyZoneLayers(source,target,copyElements);if(target.elements.length+additions.length>500)throw Error('Máximo 500 capas por zona');const all=Object.values(productZones).flatMap(g=>Object.values(g.zones).flatMap(z=>z.elements));enforceLayerBudget([...all,...additions,...(freeDocument?freeDocument.elements:[])]);const candidate=[...target.elements,...additions];validateProject({width:target.width,height:target.height,elements:candidate});const key=zoneProduct+':'+$('zoneCopyTarget').value,past=zoneHistories.get(key)||{history:[],redoStack:[],selected:-1};past.history.push(copyElements(target.elements));if(past.history.length>40)past.history.shift();past.redoStack=[];zoneHistories.set(key,past);target.elements=candidate;syncTextileMaps();renderer?.render(scene,camera);queueAutosave();notify('Diseño copiado como capas independientes; medidas físicas conservadas')}catch(e){notify(e.message)}};
$('zoneExportAll').onclick=async()=>{if(zoneBusy||!zoneProduct)return;captureZone();zoneBusy=true;syncZoneUI();try{const product=zoneProduct,project=projectSnapshot(),mirror=getMirrorMode(),docs=Object.fromEntries(Object.entries(productZones[product].zones).map(([id,z])=>[id,{...z,elements:copyElements(z.elements)}])),files=[],manifest={product,dpi:300,mirror,zones:[]};for(const def of zonesFor(product)){const doc=docs[def.id],c=renderZoneCanvas(doc,mirror==='espejo'),raw=await canvasBlob(c,'image/png');files.push({name:def.id+'.png',data:pngWithDpi(await raw.arrayBuffer())});manifest.zones.push({id:def.id,widthCm:doc.width,heightCm:doc.height,filename:def.id+'.png'});c.width=c.height=1}files.push({name:'manifest.json',data:JSON.stringify(manifest,null,2)},{name:'proyecto-completo.json',data:JSON.stringify(project,null,2)});saveBlob(await zipFiles(files),product+'-zonas-impresion.zip');notify('Zonas exportadas · PNG transparentes a 300 ppp · sin escenario')}catch(e){notify('No se pudieron exportar las zonas: '+e.message)}finally{zoneBusy=false;syncZoneUI()}};
$('zoneAddSheet').onclick=async()=>{if(zoneBusy||!zoneProduct)return;captureZone();zoneBusy=true;syncZoneUI();try{const descriptors=zonesFor(zoneProduct).map(def=>({...productZones[zoneProduct].zones[def.id],elements:copyElements(productZones[zoneProduct].zones[def.id].elements),name:$('product').selectedOptions[0].textContent+' · '+def.name}));if(!window.__fepSheetAPI)throw Error('La plancha aún no está disponible');await window.__fepSheetAPI.addZones(descriptors);$('openPrintSheet').click();notify('Zonas añadidas a la plancha. Selecciona papel y ordena automáticamente.')}catch(e){notify(e.message)}finally{zoneBusy=false;syncZoneUI()}};

function projectSnapshot(){captureZone();captureFree();return {...(freeDocument?{freeDocument:{...freeDocument,elements:copyElements(freeDocument.elements).map(({img,...e})=>e)}}:{}),...(Object.keys(productZones).length?{zoneSchema:1,productZones:serializeZoneBank()}:{}),version:2,mode:editorMode,freeDesign:normalizeFreeDesign(freeDesign),glitterSchema:GLITTER_SCHEMA,glitter:glitterControls.material(),glitterDraft:glitterControls.draft(),glitterMode:glitterControls.mode(),product:$('product').value,color:$('productColor').value,profileVariant:materialVariant,mockup:normalizeMockup(sceneSettings),width:documentWidth,height:documentHeight,printRotationDeg,mirrorMode:getMirrorMode(),finishMode,viewerBackground:$('viewerBackground').value,showGuides:preferredGuides,keepImageRatio:$('keepImageRatio').checked,elements:elements.map(({img,...e})=>e)}}
function applyPreparedProject({data,warnings}){
 if(allProjectLayers(data).some(e=>e.type==='sticker')&&!stickerPainter)throw Error('El motor de stickers no está disponible; el documento abierto se conserva');
 zoneProduct=null;freeDocument=data.freeDocument||null;freeSession=null;zoneHistories.clear();productZones=data.productZones||{};
 sceneSettings=normalizeMockup(data.mockup,data.viewerBackground);sceneController?.sync();editorMode=data.mode;freeDesign=normalizeFreeDesign(data.freeDesign);document.body.dataset.mode=editorMode;freeController?.sync();
 glitterControls.restore({material:data.glitter,draft:data.glitterDraft,mode:data.glitterMode});$('product').value=data.product;materialVariant=data.profileVariant;$('profileVariant').value=materialVariant;$('productColor').value=data.color;finishMode=data.finishMode;$('finishMode').value=finishMode;
 $('mirrorModeIndividual').checked=data.mirrorMode==='espejo';$('widthCm').value=data.width;$('heightCm').value=data.height;
 elements=data.elements;if(editorMode==='free'&&freeDocument)freeDocument.elements=elements;if(editorMode==='product'&&zonesFor(data.product).length){zoneProduct=data.product;const g=productZones[zoneProduct]??=emptyZones(zoneProduct);g.zones[g.active]={width:data.width,height:data.height,elements};}syncZoneUI();selected=-1;history=[];redoStack=[];printRotationDeg=data.printRotationDeg;
 if(['#17253a','#e6eaf0','#ffffff'].includes(data.viewerBackground)){$('viewerBackground').value=data.viewerBackground;if(scene)scene.background=new THREE.Color(data.viewerBackground)}
 if(typeof data.showGuides==='boolean'){preferredGuides=data.showGuides;$('showGuides').checked=data.showGuides}if(typeof data.keepImageRatio==='boolean')$('keepImageRatio').checked=data.keepImageRatio;
 $('rotationDeg').value=String(printRotationDeg);$('rotationValue').textContent=`${Math.round(printRotationDeg)}°`;$('rotationNumber').value=String(Math.round(printRotationDeg));
 updateDimensions();refreshSelectedLabel();buildModel();focusDesignFront();updateRotationToolbar();queueAutosave();sceneController?.refresh({camera:true});if(zoneProduct)focusZone();notify(warnings.length?'Proyecto cargado. '+warnings.join(' '):'Proyecto cargado');
}
$('save').onclick=()=>saveBlob(new Blob([JSON.stringify(projectSnapshot())],{type:'application/json'}),'proyecto-estudio3d.json');
$('load').onclick=()=>$('projectFile').click();
$('projectFile').onchange=async ev=>{
 const f=ev.target.files?.[0];ev.target.value='';if(!f)return;if(projectManager){try{await projectManager.importProject(f)}catch(error){notify(error.message)}return;}const generation=++importGeneration,before=JSON.stringify(projectSnapshot());
 try{if(f.size>100_000_000)throw Error('Proyecto demasiado grande (máximo 100 MB para zonas)');let raw;try{raw=JSON.parse(await f.text())}catch{throw Error('El archivo no contiene JSON válido')}
 if(f.size>ASSET_LIMITS.projectBytes&&raw.zoneSchema!==1)throw Error('Proyecto de una zona demasiado grande (máximo 30 MB)');const prepared=await prepareProject(raw);if(allProjectLayers(prepared.data).some(e=>e.type==='sticker'))await deadline(stickerReady,8000,'No respondió el motor de stickers');if(generation!==importGeneration)return;if(JSON.stringify(projectSnapshot())!==before)throw Error('El documento cambió durante la importación; vuelve a abrir el archivo');applyPreparedProject(prepared)
 }catch(error){notify('No se pudo abrir el proyecto: '+error.message)}
};
function saveBlob(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),2000)}
// Reflejo REAL: toda la imagen ya rasterizada, no invierte el orden del texto.
function mirrorFinishedImage(source){
  const output=document.createElement('canvas');
  output.width=source.width;output.height=source.height;
  const context=output.getContext('2d',{willReadFrequently:true});
  context.save();
  context.translate(output.width,0);
  context.scale(-1,1);
  context.drawImage(source,0,0);
  context.restore();
  return output;
}
function zoneSuffix(){return zoneProduct?'-'+zoneProduct+'-'+productZones[zoneProduct].active:''}
function getMirrorMode(){return $('mirrorModeIndividual').checked ? 'espejo' : 'normal'}
function renderToExportCanvas(mode='normal'){
  const source=document.createElement('canvas');
  const w=Math.round(+$('widthCm').value/2.54*300),h=Math.round(+$('heightCm').value/2.54*300);
  if(w*h>40e6)throw Error('Área demasiado grande para este dispositivo');
  source.width=w;source.height=h;
  paintDesign(source.getContext('2d',{willReadFrequently:true}),w,h);
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
function whiteBackground(source){const c=document.createElement('canvas');c.width=source.width;c.height=source.height;const x=c.getContext('2d');x.fillStyle='#ffffff';x.fillRect(0,0,c.width,c.height);x.drawImage(source,0,0);return c}
const canvasBlob=(c,type,quality)=>new Promise((resolve,reject)=>(type==='image/jpeg'?whiteBackground(c):c).toBlob(b=>b?resolve(b):reject(Error('No se pudo generar el archivo')),type,quality));
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
function whiteCanvas(source){const c=document.createElement('canvas');c.width=source.width;c.height=source.height;const x=c.getContext('2d',{willReadFrequently:true});x.fillStyle='#ffffff';x.fillRect(0,0,c.width,c.height);x.drawImage(source,0,0);return c}
async function pdfAtPhysicalSize(canvas,wCm,hCm){
  const original=canvas;if(zoneProduct)canvas=whiteCanvas(canvas);
  const jpg=new Uint8Array(await (await canvasBlob(canvas,'image/jpeg',.98)).arrayBuffer());
  if(canvas!==original)canvas.width=canvas.height=1;
  const pageW=(wCm*72/2.54).toFixed(5),pageH=(hCm*72/2.54).toFixed(5);
  const enc=new TextEncoder(),parts=[];let length=0,offsets=[0];
  const append=x=>{let b=typeof x==='string'?enc.encode(x):x;parts.push(b);length+=b.length};
  const obj=(id,body)=>{offsets[id]=length;append(`${id} 0 obj\n${body}\nendobj\n`)};
  append('%PDF-1.4\n%\xD3\xE4\xF5\xFA\n');
  obj(1,'<< /Type /Catalog /Pages 2 0 R >>');
  obj(2,'<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  obj(3,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
  offsets[4]=length;append(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${original.width} /Height ${original.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`);append(jpg);append('\nendstream\nendobj\n');
  const commands=`q\n${pageW} 0 0 ${pageH} 0 0 cm\n/Im0 Do\nQ\n`;
  obj(5,`<< /Length ${enc.encode(commands).length} >>\nstream\n${commands}endstream`);
  const startxref=length;append('xref\n0 6\n0000000000 65535 f \n');for(let k=1;k<=5;k++)append(String(offsets[k]).padStart(10,'0')+' 00000 n \n');
  append(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`);
  return new Blob(parts,{type:'application/pdf'});
}
$('exportPrint').onclick=async()=>{
  try{const {w,h}=cmPrint(),zoneTag=zoneSuffix();const canvas=renderToExportCanvas(getMirrorMode());const blob=await canvasBlob(canvas,'image/png');
    saveBlob(pngWithDpi(await blob.arrayBuffer()),`impresion_${w}x${h}cm_${getMirrorMode()}${zoneTag}_300ppp.png`);
    notify(`PNG generado: ${w} × ${h} cm a 300 ppp (${canvas.width} × ${canvas.height} píxeles).`);
  }catch(e){notify('Error PNG: '+e.message)}
};
let baseMat,modelRoot,modelUVs=[];
// Efectos no destructivos: se visualizan exclusivamente en el modelo 3D.
let finishMode='standard';
function glitterSurface(){const c=document.createElement('canvas');c.width=glitterResolution.width;c.height=glitterResolution.height;return c}
function glitterCanvasTexture(c){if(!THREE)return {image:c};const t=new THREE.CanvasTexture(c);t.flipY=true;return t}
const glitterCanvas=glitterSurface(),glitterCtx=glitterCanvas.getContext('2d');
const glitterNormalCanvas=glitterSurface(),glitterRoughCanvas=glitterSurface();
const glitterMaskCanvas=glitterSurface(),physicalArtCanvas=glitterSurface();
let glitterTexture=glitterCanvasTexture(glitterCanvas);glitterTexture.colorSpace=THREE?.SRGBColorSpace;
let glitterNormalTexture=glitterCanvasTexture(glitterNormalCanvas),glitterRoughTexture=glitterCanvasTexture(glitterRoughCanvas);
let glitterMaskTexture=glitterCanvasTexture(glitterMaskCanvas),physicalArtTexture=glitterCanvasTexture(physicalArtCanvas);physicalArtTexture.colorSpace=THREE?.SRGBColorSpace;
let materialFrame=0,materialKey='',materialGenerations=0;
function updateGlitterArtwork(){
 const art=physicalArtCanvas.getContext('2d'),mask=glitterMaskCanvas.getContext('2d'),w=physicalArtCanvas.width,h=physicalArtCanvas.height;
 paintDesign(art,w,h,{transparent:true});physicalArtTexture.needsUpdate=true;
 mask.globalCompositeOperation='source-over';mask.clearRect(0,0,w,h);mask.drawImage(physicalArtCanvas,0,0);mask.globalCompositeOperation='source-in';mask.fillStyle='#000';mask.fillRect(0,0,w,h);mask.globalCompositeOperation='destination-over';mask.fillStyle='#fff';mask.fillRect(0,0,w,h);mask.globalCompositeOperation='source-over';glitterMaskTexture.needsUpdate=true;
}
function refreshGlitterMaterial(){
 materialFrame=0;const settings=glitterControls.material(),key=JSON.stringify(settings);if(key===materialKey)return;materialKey=key;materialGenerations++;
 for(const [canvas,map]of [[glitterCanvas,'color'],[glitterNormalCanvas,'normal'],[glitterRoughCanvas,'roughness']])paintGlitter(canvas.getContext('2d'),canvas.width,canvas.height,settings,{material:true,map});
 for(const texture of [glitterTexture,glitterNormalTexture,glitterRoughTexture])texture.needsUpdate=true;
 const props=glitterMaterialProperties(settings);
 modelRoot?.traverse(o=>{for(const m of(o.material?(Array.isArray(o.material)?o.material:[o.material]):[])){if(!m.userData.glitterSurface)continue;m.roughness=props.roughness;m.metalness=props.metalness;m.clearcoat=props.clearcoat;m.clearcoatRoughness=props.clearcoatRoughness;if((m.iridescence>0)!==(props.iridescence>0))m.needsUpdate=true;m.iridescence=props.iridescence||0;m.normalScale.setScalar(props.normalStrength);if(m.userData.glitterSurface==='body')m.color.set(settings.color)}});
 if(renderer&&scene&&!recording&&!photoBusy)renderer.render(scene,camera);
}
function queueGlitterMaterial(){if(!materialFrame)materialFrame=requestAnimationFrame(refreshGlitterMaterial)}
const glitterControls=createGlitterControls({preview:settings=>{const node=$('glitterPreview');node.getContext('2d').drawImage(glitterTiles.get(settings),0,0,node.width,node.height)},onMaterialChange:queueGlitterMaterial});
// Initial maps must exist before building the first model.
function initializeGlitterMaps(){const settings=glitterControls.material();for(const [canvas,map]of [[glitterCanvas,'color'],[glitterNormalCanvas,'normal'],[glitterRoughCanvas,'roughness']])paintGlitter(canvas.getContext('2d'),canvas.width,canvas.height,settings,{material:true,map});materialKey=JSON.stringify(settings);materialGenerations++}
initializeGlitterMaps();
$('finishMode').onchange=e=>{finishMode=e.target.value;if(finishMode==='glitter'){glitterControls.switchMode('material');updateGlitterArtwork()}buildModel()};
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
function focusPrintedSurface(){if(!camera||!controls)return;if(zoneProduct){focusZone();return}if(['mug','tumbler'].includes($('product').value)){const a=THREE.MathUtils.degToRad(printRotationDeg);camera.position.set(5.7*Math.sin(a),1,5.7*Math.cos(a));controls.target.set(0,0,0);controls.update();renderer.render(scene,camera)}else focusDesignFront()}
function focusPrintEdge(edge){
  if(!camera || !controls) return;
  const theta=(edge==='start' ? -printArc/2 : printArc/2)+THREE.MathUtils.degToRad(printRotationDeg);
  const radius=5.7;
  camera.position.set(radius*Math.sin(theta),1,radius*Math.cos(theta));
  controls.target.set(0,0,0);
  controls.update();
}

function init3D(){textileMaps=createTextileMaps(THREE);const node=$('viewer');scene=new THREE.Scene();scene.background=new THREE.Color('#17253a');camera=new THREE.PerspectiveCamera(40,Math.max(1,node.clientWidth)/Math.max(1,node.clientHeight),.1,100);camera.position.set(0,1,5.7);renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.setSize(Math.max(1,node.clientWidth),Math.max(1,node.clientHeight));node.appendChild(renderer.domElement);renderer.domElement.addEventListener('webglcontextlost',ev=>{ev.preventDefault();notify('Se interrumpió el motor gráfico. Puedes recargar la página después de guardar tu proyecto.');});renderer.domElement.addEventListener('webglcontextrestored',()=>{requestAnimationFrame(()=>resync3D());});controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=2.5;controls.maxDistance=11;controls.addEventListener('change',()=>{if(!recording&&!photoBusy&&scene&&editorMode==='product')renderer.render(scene,camera)});scene.add(new THREE.HemisphereLight(0xffffff,0x65738a,2));let light=new THREE.DirectionalLight(0xffffff,2.8);light.position.set(2,4,5);scene.add(light);let light2=new THREE.DirectionalLight(0xffffff,1);light2.position.set(-3,2,-4);scene.add(light2);texture=new THREE.CanvasTexture(textureCanvas);texture.colorSpace=THREE?.SRGBColorSpace;texture.wrapS=THREE.ClampToEdgeWrapping;texture.wrapT=THREE.ClampToEdgeWrapping;texture.flipY=true;texture.needsUpdate=true;buildModel();function animate(){animRequest=requestAnimationFrame(animate);if(!recording&&!photoBusy&&editorMode==='product')controls.update()}animate();const resize=()=>{if(recording||photoBusy)return;const w=node.clientWidth,h=node.clientHeight;if(w<1||h<1)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);renderer.render(scene,camera)};resizeViewer=resize;typeof ResizeObserver==='function'?new ResizeObserver(resize).observe(node):window.addEventListener('resize',resize)}
async function loadProductGLB(profile,root,bodyMaterial,printMaterial){
 try{const {GLTFLoader}=await import('./vendor/GLTFLoader.js?v=fep-1a3de09befbf814e');const loader=new GLTFLoader();let gltf;try{gltf=await deadline(loader.loadAsync(profile.url),15000,'No respondió el modelo GLB')}catch(error){if(!profile.gltfURL)throw error;gltf=await deadline(loader.loadAsync(profile.gltfURL),15000,'No respondió el modelo glTF de respaldo')}
  if(root!==modelRoot){gltf.scene.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of(Array.isArray(o.material)?o.material:[o.material]))m.dispose()});bodyMaterial.dispose();printMaterial.dispose();return}
  gltf.scene.scale.setScalar(profile.worldScale);printMaterial.map=texture;printMaterial.needsUpdate=true;let printMeshes=0;
  gltf.scene.traverse(mesh=>{if(!mesh.isMesh)return;const old=mesh.material;if(profile.multiZone){const def=zonesFor(profile.id).find(z=>z.mesh===mesh.name);mesh.material=textileMaps.material(profile.id,def?.id,$('productColor').value,mesh.name);const v=PRODUCT_VARIANTS[materialVariant];if(materialVariant!=='original'){mesh.material.roughness=v.roughness;mesh.material.metalness=v.metalness}if(def)printMeshes++;}else if(mesh.name===profile.printMesh){printMeshes++;mesh.material=printMaterial;mesh.scale.set(Math.min(1,documentWidth/profile.printCm[0]),Math.min(1,documentHeight/profile.printCm[1]),1)}else mesh.material=bodyMaterial;for(const material of(Array.isArray(old)?old:[old]))material.dispose()});
  if(!printMeshes)throw Error('El GLB no contiene su superficie imprimible');if(profile.multiZone&&printMeshes!==zonesFor(profile.id).length)throw Error('Faltan superficies de zona');root.add(gltf.scene);if(profile.multiZone){bodyMaterial.dispose();printMaterial.dispose();fitTextileView()}$('profileStatus').dataset.state='ready';$('profileStatus').textContent=profile.multiZone?'Vista 3D lista · '+printMeshes+' zonas de impresión':documentWidth>profile.printCm[0]||documentHeight>profile.printCm[1]?'Área solicitada mayor que la placa; el visor limita al tamaño físico. Revisa medidas.':'Modelo propio · 100 × 100 × 3 mm · calibración digital';resizeViewer();sceneController?.refresh();resync3D({silent:true});
 }catch(error){if(root===modelRoot){$('profileStatus').dataset.state='failed';$('profileStatus').textContent='No se pudo cargar el modelo: '+error.message;notify('Modelo no disponible; diseño y exportación 2D conservados')}}finally{update3DControls()}
}
function addGeo(geo,mat,x=0,y=0,z=0,rotateX=0){let o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.rotation.x=rotateX;modelRoot.add(o);return o}
function buildModel(){if(!scene)return;const profile=profileById($('product').value);$('profileStatus').dataset.state=profile?.kind==='glb'?'loading':'ready';$('profileStatus').textContent=profile?.kind==='glb'?'Cargando modelo 3D…':'Perfil original · medidas configurables';update3DControls();if(modelRoot){scene.remove(modelRoot);modelRoot.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)for(const material of(Array.isArray(o.material)?o.material:[o.material])){if(material.userData.ownedMap)material.map?.dispose();material.dispose()}})}modelRoot=new THREE.Group();scene.add(modelRoot);let c=$('productColor').value,p=$('product').value;const physical=finishMode==='glitter'&&['mug','tumbler'].includes(p),settings=glitterControls.material(),props=glitterMaterialProperties(settings);let plain=physical?new THREE.MeshPhysicalMaterial({color:settings.color,roughness:props.roughness,metalness:props.metalness,clearcoat:props.clearcoat,clearcoatRoughness:props.clearcoatRoughness,iridescence:props.iridescence||0,iridescenceIOR:1.3,iridescenceThicknessRange:[120,400],normalMap:glitterNormalTexture,normalScale:new THREE.Vector2(props.normalStrength,props.normalStrength),roughnessMap:glitterRoughTexture,side:THREE.DoubleSide}):new THREE.MeshPhysicalMaterial({color:c,roughness:p==='mug'?.24:p==='tumbler'?.32:.5,metalness:p==='tumbler'?.12:.015,clearcoat:['mug','tumbler'].includes(p)?.65:.1,clearcoatRoughness:.18,side:THREE.DoubleSide});if(physical)plain.userData.glitterSurface='body';const wrapped=['mug','tumbler'].includes(p);let printMat=new THREE.MeshPhysicalMaterial({map:physical||wrapped?physicalArtTexture:texture,transparent:physical||wrapped,depthWrite:!(physical||wrapped),roughness:wrapped?.28:.65,clearcoat:wrapped?.65:0,clearcoatRoughness:.18,side:THREE.FrontSide});window.printMat=printMat;const variant=PRODUCT_VARIANTS[materialVariant];if(!physical&&variant.roughness!==null){plain.roughness=variant.roughness;plain.metalness=variant.metalness}if(profile?.multiZone){productZones[p]??=emptyZones(p);syncTextileMaps(p)}if(profile?.kind==='glb'){loadProductGLB(profile,modelRoot,plain,printMat);return;}
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
 const glossMat=new THREE.MeshPhysicalMaterial({map:glitterTexture,normalMap:glitterNormalTexture,normalScale:new THREE.Vector2(props.normalStrength,props.normalStrength),roughnessMap:glitterRoughTexture,alphaMap:glitterMaskTexture,transparent:true,opacity:1,roughness:props.roughness,metalness:props.metalness,clearcoat:props.clearcoat,clearcoatRoughness:props.clearcoatRoughness,iridescence:props.iridescence||0,iridescenceIOR:1.3,iridescenceThicknessRange:[120,400],depthWrite:false,side:THREE.FrontSide});glossMat.userData.glitterSurface='overlay';
 const sparkles=addGeo(new THREE.CylinderGeometry(r+.024,r+.024,h-.29,128,1,true,-printArc/2,printArc),glossMat);
 sparkles.rotation.y=THREE.MathUtils.degToRad(printRotationDeg);
 // Artwork remains above the coating; the inverse alpha mask protects photos and text.
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
else if(p==='mousepad'){
  const mat=new THREE.MeshStandardMaterial({color:c,roughness:.93,side:THREE.DoubleSide});
  const geo=new THREE.BoxGeometry(3.1,.065,2.28);addGeo(geo,mat,0,0,0);
  addGeo(new THREE.PlaneGeometry(3.02,2.2),printMat,0,.038,0,-Math.PI/2);
  modelRoot.rotation.x=-.65;
}
else if(p==='keychain'){
  const ring=new THREE.MeshStandardMaterial({color:'#c2ccd9',metalness:.8,roughness:.26});
  addGeo(new THREE.CylinderGeometry(1,1,.12,80),plain,0,0,0,Math.PI/2);
  addGeo(new THREE.CircleGeometry(.96,80),printMat,0,0,.072);
  addGeo(new THREE.TorusGeometry(.19,.047,12,32),ring,0,1.18,0);
  addGeo(new THREE.TorusGeometry(.38,.075,12,42),ring,0,1.66,0);
}
if(materialVariant!=='original'&&!physical)modelRoot.traverse(o=>{for(const m of(o.material?(Array.isArray(o.material)?o.material:[o.material]):[]))if(m.isMeshStandardMaterial&&m.map!==texture&&m.map!==physicalArtTexture){m.roughness=variant.roughness;m.metalness=variant.metalness}});sceneController?.refresh();notify('Vista 3D lista · '+$('product').selectedOptions[0].textContent)}
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
  current.colorSpace=THREE?.SRGBColorSpace;
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
function resync3D({resetView=false, selectedObject=false,silent=false}={}){
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
      const angle=THREE.MathUtils.degToRad(printRotationDeg)+(x-0.5)*printArc;
      camera.position.set(5.7*Math.sin(angle),1,5.7*Math.cos(angle));
      controls.target.set(0,0,0);controls.update();
    }else{focusDesignFront();}
  }
  renderer.render(scene,camera);
  if(!silent)notify('Diseño 3D sincronizado · '+elements.length+' capas');
}
$('resync3D').onclick=()=>resync3D({resetView:true});
$('viewSelected3D').onclick=()=>resync3D({resetView:true,selectedObject:true});

$('viewStart').onclick=()=>focusPrintEdge('start');
$('viewEnd').onclick=()=>focusPrintEdge('end');
$('resetCam').onclick=focusDesignFront;
$('viewDesign').onclick=focusDesignFront;
async function waitForProduct(){const start=performance.now();while($('profileStatus').dataset.state==='loading'){if(performance.now()-start>32000)throw Error('No terminó la carga del producto');await new Promise(requestAnimationFrame)}if($('profileStatus').dataset.state==='failed')throw Error('Modelo no disponible')}
$('exportMockup').onclick=async()=>{
 if(!renderer||recording||photoBusy||editorMode==='free')return;photoBusy=true;update3DControls();const size=renderer.getSize(new THREE.Vector2()),ratio=renderer.getPixelRatio(),aspect=camera.aspect,show=$('showGuides').checked,enabled=controls.enabled;
 try{controls.enabled=false;if(show){$('showGuides').checked=false;buildModel()}await sceneController.ready();await waitForProduct();sceneController.refresh();const width=sceneSettings.photoWidth,height=Math.round(width*9/16);renderer.setPixelRatio(1);renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();renderer.render(scene,camera);const blob=await canvasBlob(renderer.domElement,'image/png');saveBlob(blob,`mockup-HD-${width}x${height}.png`);notify('Fotografía HD generada; el arte de impresión se conserva')}
 catch(error){notify('No se pudo exportar el mockup: '+error.message)}
 finally{renderer.setPixelRatio(ratio);renderer.setSize(size.x,size.y,false);camera.aspect=aspect;camera.updateProjectionMatrix();controls.enabled=enabled;if(show){$('showGuides').checked=true;buildModel()}photoBusy=false;resizeViewer();update3DControls();requestAnimationFrame(()=>resync3D({silent:true}))}
};

$('zoneViews').onclick=async()=>{if(!renderer||recording||photoBusy||zoneBusy||!zoneProduct)return;photoBusy=true;zoneBusy=true;update3DControls();const locked=[...document.querySelectorAll('button,input,select')].map(n=>[n,n.disabled]);for(const [n]of locked)n.disabled=true;const size=renderer.getSize(new THREE.Vector2()),ratio=renderer.getPixelRatio(),aspect=camera.aspect,position=camera.position.clone(),target=controls.target.clone(),enabled=controls.enabled,product=zoneProduct;try{controls.enabled=false;await waitForProduct();await sceneController.ready();const width=sceneSettings.photoWidth,height=Math.round(width*9/16),files=[];renderer.setPixelRatio(1);renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();for(const def of zonesFor(product)){camera.position.set(...def.camera);camera.lookAt(0,0,0);fitTextileView();renderer.render(scene,camera);files.push({name:def.id+'-mockup.png',data:await canvasBlob(renderer.domElement,'image/png')})}saveBlob(await zipFiles(files),product+'-vistas-HD.zip');notify('Vistas HD exportadas con todas las zonas diseñadas')}catch(error){notify('No se pudieron exportar las vistas: '+error.message)}finally{renderer.setPixelRatio(ratio);renderer.setSize(size.x,size.y,false);camera.aspect=aspect;camera.updateProjectionMatrix();camera.position.copy(position);controls.target.copy(target);controls.enabled=enabled;photoBusy=false;zoneBusy=false;for(const [n,disabled]of locked)n.disabled=disabled;controls.update();resizeViewer();update3DControls()}};

// V0.8: herramientas de exportación y presentación sin servidor ni pagos.
$('viewerBackground').addEventListener('change',e=>{if(scene)scene.background=new THREE.Color(e.target.value)});
$('showGuides').addEventListener('change',()=>{preferredGuides=$('showGuides').checked;buildModel()});
$('exportJpg').addEventListener('click',async()=>{
  try{const {w,h}=cmPrint(),c=renderToExportCanvas(getMirrorMode()),zoneTag=zoneSuffix(),output=zoneProduct?whiteCanvas(c):c,raw=await canvasBlob(output,'image/jpeg',.97);if(output!==c)output.width=output.height=1;
    saveBlob(jpegWithDpi(await raw.arrayBuffer()),`impresion_${w}x${h}cm_${getMirrorMode()}${zoneTag}_300ppp.jpg`);
    notify(`JPEG generado: ${w} × ${h} cm a 300 ppp (${c.width} × ${c.height} píxeles).`);
  }catch(e){notify('Error JPEG: '+e.message)}
});
$('exportPDF').addEventListener('click',async()=>{
  try{const {w,h}=cmPrint(),c=renderToExportCanvas(getMirrorMode()),zoneTag=zoneSuffix();
    saveBlob(await pdfAtPhysicalSize(c,w,h),`impresion_${w}x${h}cm_${getMirrorMode()}${zoneTag}_escala-real.pdf`);
    notify(`PDF generado con página de ${w} × ${h} cm. Imprimir al 100 %, sin ajustar a página.`);
  }catch(e){notify('Error PDF: '+e.message)}
});
// Video local: registra el propio WebGL canvas, sin enviar fotos al servidor.
let recording=false;
$('exportVideo').addEventListener('click',async()=>{
  if(recording||photoBusy)return;
  const surface=renderer?.domElement;
  if(!surface?.captureStream || !window.MediaRecorder){notify('Este navegador no admite grabación de video del lienzo 3D.');return}
  const type=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));
  if(!type){notify('El navegador no soporta WebM. Prueba Chrome o Edge en computador.');return}
  recording=true;controls.enabled=false;controls.enableDamping=false;
  const button=$('exportVideo');button.disabled=true;button.textContent='Grabando giro…';
  const show=$('showGuides').checked;
  if(show){$('showGuides').checked=false;buildModel()}
  const start=camera.position.clone();const target=controls.target.clone();const rel=start.clone().sub(target);
  const radius=Math.sqrt(rel.x*rel.x+rel.z*rel.z),angle0=Math.atan2(rel.x,rel.z),seconds=sceneSettings.videoSeconds,fps=sceneSettings.videoFps;
  const previousSize=renderer.getSize(new THREE.Vector2()),previousRatio=renderer.getPixelRatio(),previousAspect=camera.aspect,previousShadowAuto=renderer.shadowMap.autoUpdate;
  let stream,recorder,frames=[],started=0,lastFrame=-Infinity,track;
  try{
    await sceneController.ready();await waitForProduct();const maxHeight=sceneSettings.videoHeight,maxWidth=Math.round(maxHeight*16/9),factor=Math.min(1,maxWidth/surface.width,maxHeight/surface.height),vw=Math.max(1,Math.round(surface.width*factor)),vh=Math.max(1,Math.round(surface.height*factor));renderer.setPixelRatio(1);renderer.setSize(vw,vh,false);camera.aspect=vw/vh;camera.updateProjectionMatrix();
    renderer.shadowMap.needsUpdate=true;renderer.render(scene,camera);renderer.shadowMap.autoUpdate=false;
    let offline;try{offline=await encodeVideoFrames({canvas:surface,fps,seconds,render:p=>{const angle=angle0+Math.PI*2*p;camera.position.set(target.x+radius*Math.sin(angle),start.y,target.z+radius*Math.cos(angle));camera.lookAt(target);renderer.render(scene,camera)},progress:percent=>{button.textContent='Generando video · '+percent+' %'}})}catch(error){camera.position.copy(start);camera.lookAt(target);notify('Se utilizará la grabación compatible en tiempo real')}
    if(offline){saveBlob(offline,'mockup-giro-360.webm');notify('Video 360° generado con fotogramas completos');return}
    button.textContent='Grabando en tiempo real…';stream=surface.captureStream(fps);track=stream.getVideoTracks()[0];
    recorder=new MediaRecorder(stream,{mimeType:type,videoBitsPerSecond:3000000});
    recorder.ondataavailable=e=>{if(e.data?.size)frames.push(e.data)};
    recorder.onstop=()=>{if(frames.length)saveBlob(new Blob(frames,{type}),'mockup-giro-360.webm');else notify('Video vacío; inténtalo de nuevo.');stream.getTracks().forEach(t=>t.stop());};
    controls.enabled=false;controls.enableDamping=false;recorder.start(300);
    await new Promise(resolve=>{
      const frame=now=>{
        if(!started)started=now;
        const p=Math.min(1,(now-started)/(seconds*1000));const angle=angle0+Math.PI*2*p;if(now-lastFrame>=1000/fps||p===1){lastFrame=now;
        camera.position.set(target.x+radius*Math.sin(angle),start.y,target.z+radius*Math.cos(angle));
        camera.lookAt(target);renderer.render(scene,camera);}
        if(p<1)requestAnimationFrame(frame);else resolve();
      };requestAnimationFrame(frame);
    });
    await new Promise(resolve=>{recorder.addEventListener('stop',resolve,{once:true});recorder.stop()});
    notify('Video WebM generado. Revisa la descarga.');
  }catch(e){notify('No se pudo grabar: '+e.message);try{if(recorder?.state==='recording')recorder.stop()}catch{}}
  finally{if(stream)stream.getTracks().forEach(t=>t.stop());renderer.shadowMap.autoUpdate=previousShadowAuto;renderer.shadowMap.needsUpdate=true;renderer.setPixelRatio(previousRatio);renderer.setSize(previousSize.x,previousSize.y,false);camera.aspect=previousAspect;camera.updateProjectionMatrix();camera.position.copy(start);controls.target.copy(target);controls.enabled=true;controls.enableDamping=true;controls.update();if(show){$('showGuides').checked=true;buildModel()}recording=false;resizeViewer();update3DControls();button.textContent='Grabar giro 360° (WebM)';requestAnimationFrame(()=>resync3D());}
});

const renderLayerList=createLayerList({list:$('layerList'),getImage,getGlitterTile:value=>glitterTiles.get(value),getStickerRenderer:()=>stickerPainter,onSelect:index=>{selected=index;if(elements[index].type==='glitter')glitterControls.selectLayer(elements[index].glitter);loadSelectedTextIntoInputs();updateImageControls();draw()},onToggle:(index,key,value)=>{addHistory();elements[index][key]=value;draw()}});

freeController=createFreeControls({
 state:()=>({mode:editorMode,page:freeDesign,w:documentWidth,h:documentHeight,selected:elements[selected],hasLayers:elements.length>0,storageFailed:window.__fepBoot?.stages.storage.state==='failed'}),notify,
 settings:patch=>{freeDesign=normalizeFreeDesign({...freeDesign,...patch});draw();ui.refresh();queueAutosave()},
 format:(size,patch={})=>{if(!Number.isFinite(size.w)||!Number.isFinite(size.h)||size.w<1||size.h<1||size.w>100||size.h>100)throw Error('Las dimensiones deben estar entre 1 y 100 cm');freeDesign=normalizeFreeDesign({...freeDesign,...patch});$('widthCm').value=size.w;$('heightCm').value=size.h;updateDimensions();buildModel();ui.refresh()},
 switchMode:mode=>{if(recovering)return;++importGeneration;captureZone();captureFree();const previous=editorMode,restoringFree=mode==='free'&&!!zoneProduct&&!!freeDocument;if(mode==='free'&&zoneProduct){if(freeDocument){elements=copyElements(freeDocument.elements);freeDesign=normalizeFreeDesign(freeDocument.freeDesign);$('widthCm').value=freeDocument.width;$('heightCm').value=freeDocument.height;history=freeSession?.history||[];redoStack=freeSession?.redoStack||[];selected=freeSession?.selected??-1}else{elements=copyElements();history=[];redoStack=[]}zoneProduct=null}editorMode=mode;if(mode==='product'&&zonesFor($('product').value).length){openZoneProduct($('product').value);document.body.dataset.mode=mode;ui.refresh();queueAutosave();return}syncZoneUI();document.body.dataset.mode=mode;if(mode==='free'&&previous!=='free'&&!restoringFree&&!elements.length){const size=pageSize(freeDesign.preset==='custom'?'A4':freeDesign.preset);$('widthCm').value=size.w;$('heightCm').value=size.h;$('mirrorModeIndividual').checked=false}else if(mode==='free'&&previous!=='free'&&!restoringFree)freeDesign=normalizeFreeDesign({...freeDesign,preset:'custom'});updateDimensions();update3DControls();ui.refresh();requestAnimationFrame(()=>{resizeViewer();resync3D({silent:true})});queueAutosave()},
 insertShape:(shape,color)=>{if(recovering)return;if(elements.length>=500){notify('Máximo 500 capas');return}const layer={type:'shape',shape,color,outlineColor:'#163b62',outlineWidth:1,rotation:0,x:.5,y:.5,...initialLayerSize(.3,1)};validateShape(layer);addHistory();elements.push(layer);selected=elements.length-1;draw();updateImageControls();notify('Figura añadida')},
 editShape:patch=>{const layer=elements[selected];if(layer?.type!=='shape'||layer.locked)return;const next={...layer,...patch};validateShape(next);addHistory();elements[selected]=next;draw()},
 align:action=>{const layer=elements[selected];if(!layer||layer.locked||layer.type==='glitter'){notify('Selecciona una capa desbloqueada para alinear');return}const {dx,dy}=alignedPosition(bounds(layer),canvas.width,canvas.height,action);addHistory();layer.x+=dx;layer.y+=dy;draw()}
});
vectorController=createVectorControls({
 state:()=>({elements,selected,w:documentWidth,h:documentHeight,canvasWidth:canvas.width}),notify,
 commit:(layer,{replace=false,hideOriginal=false}={})=>{validateVector(layer);if(!replace&&elements.length>=500)throw Error('Máximo 500 capas');const candidate=replace?elements.map((e,i)=>i===selected?layer:e):[...elements,layer];enforceDocumentBudget(candidate);addHistory();if(hideOriginal&&elements[selected])elements[selected].visible=false;if(replace)elements[selected]=layer;else{elements.push(layer);selected=elements.length-1}draw()},
 exportSVG:cutOnly=>{const result=exportVectorSVG(projectSnapshot(),{cutOnly,mirror:getMirrorMode()==='espejo',canvasWidth:canvas.width,getSticker,getRaster:e=>{const c=document.createElement('canvas');c.width=canvas.width;c.height=canvas.height;paintDesign(c.getContext('2d'),c.width,c.height,{transparent:true,onlyLayer:{...e,opacity:1}});return c.toDataURL()}});saveBlob(new Blob([result.svg],{type:'image/svg+xml'}),cutOnly?'fep-corte.svg':'fep-impresion-corte.svg');notify('SVG con medidas físicas generado. '+(cutOnly?'Solo líneas de corte; imágenes excluidas.':'Gráficos imprimibles y corte en grupos separados.'))}
});
creativeController=createCreativeControls({state:()=>({elements,selected,w:documentWidth,h:documentHeight}),notify,
 apply:patch=>{const current=elements[selected];if(!current||current.locked)throw Error('Selecciona una capa desbloqueada');const next={...current,...patch};for(const key of ['gradient','typography','crop','mask','repeat'])if(next[key]===null)delete next[key];validateCreative(next);const list=elements.map((e,i)=>i===selected?next:e);validatePatternBudget(list,documentWidth,documentHeight);addHistory();elements[selected]=next;draw();updateImageControls()},
 template:id=>{const template=CREATIVE_TEMPLATES[id];if(!template)throw Error('Plantilla no disponible');const additions=JSON.parse(JSON.stringify(template.elements));if(elements.length+additions.length>500)throw Error('Máximo 500 capas');enforceDocumentBudget([...elements,...additions]);addHistory();elements.push(...additions);selected=elements.length-1;draw();notify('Plantilla añadida como capas editables; diseño anterior conservado')}
});
sceneController=createMockupControls({state:()=>sceneSettings,context:()=>({THREE,scene,renderer,camera,controls,modelRoot,texture,physicalArtTexture,fitView:fitTextileView,focusPrint:focusPrintedSurface}),notify,patch:(values,options={})=>{sceneSettings=normalizeMockup({...sceneSettings,...values});sceneController.refresh(options);queueAutosave()}});
updateDimensions();updateRotationToolbar();
async function startThree(){
 try{
  THREE=await deadline(import('three'),30000,'No terminó la carga de Three.js');({OrbitControls}=await deadline(import('three/addons/controls/OrbitControls.js'),15000,'No terminó la carga de OrbitControls'));
  glitterTexture=glitterCanvasTexture(glitterCanvas);glitterTexture.colorSpace=THREE.SRGBColorSpace;
  glitterNormalTexture=glitterCanvasTexture(glitterNormalCanvas);glitterRoughTexture=glitterCanvasTexture(glitterRoughCanvas);
  glitterMaskTexture=glitterCanvasTexture(glitterMaskCanvas);physicalArtTexture=glitterCanvasTexture(physicalArtCanvas);physicalArtTexture.colorSpace=THREE.SRGBColorSpace;
  updateGlitterArtwork();init3D();focusDesignFront();sceneController?.refresh({camera:true});$('liveStatus').textContent='En vivo';$('liveStatus').parentElement.dataset.state='ready';window.__fepBoot?.stage('three','ready');
 }catch(error){window.__fepBoot?.stage('three','failed',error);scene=null;renderer=null;$('viewerFallback').hidden=false;$('liveStatus').textContent='Solo 2D';$('liveStatus').parentElement.dataset.state='offline';notify('Visor 3D no disponible. El editor y la impresión 2D siguen disponibles.')}
 finally{update3DControls();stickerController?.sync();if(!stickerController&&$('stickerInsert'))$('stickerInsert').disabled=true}
}
function update3DControls(){syncZoneUI();for(const id of ['exportMockup','exportVideo']){$(id).disabled=!renderer||editorMode==='free'||recording||photoBusy||['loading','failed'].includes($('profileStatus').dataset.state);$(id).title=editorMode==='free'?'Disponible en Personalizar producto 3D':renderer?'':'Requiere visor 3D disponible'}}


// API interna de impresión: la plancha recibe el arte limpio y los codificadores de 300 ppp.
let savedMirrorMode;try{savedMirrorMode=localStorage.getItem('estudio-mirror-mode')}catch{}
$('mirrorModeIndividual').checked=savedMirrorMode!=='normal' && savedMirrorMode!=='none';
$('mirrorModeIndividual').addEventListener('change',()=>{try{localStorage.setItem('estudio-mirror-mode',getMirrorMode())}catch{}refreshIndividualPreview()});
$('refreshMirrorPreview').onclick=refreshIndividualPreview;
requestAnimationFrame(refreshIndividualPreview);
window.__estudioPrintAPI={renderZoneCanvas, renderToExportCanvas, cmPrint, pngWithDpi, jpegWithDpi, pdfAtPhysicalSize, saveBlob};

for(const id of ['delete','applyText','quickCenter','quickContain','quickCover']){
 const button=$(id),handler=button.onclick;if(handler)button.onclick=ev=>{if(elements[selected]?.locked){notify('La capa está bloqueada.');return}handler(ev)};
}

function readGlitterControls(){return glitterControls.current()}
$('applyGlitterLayer').onclick=()=>{const e=elements[selected];if(glitterControls.mode()!=='print'||e?.type!=='glitter'||e.locked){notify('Selecciona una capa glitter desbloqueada en modo imprimible.');return}addHistory();e.glitter=readGlitterControls();draw();notify('Glitter aplicado solo a la capa seleccionada.');};
$('addGlitterLayer').onclick=()=>{if(elements.length>=500){notify('Máximo 500 capas');return}const settings=readGlitterControls();addHistory();elements.unshift({type:'glitter',x:.5,y:.5,locked:false,glitter:settings});selected=0;glitterControls.selectLayer(settings);draw();notify('Glitter simulado añadido al arte imprimible, debajo del diseño.');};
function refreshLayers(){
 const list=$('layerList');if(!list)return;renderLayerList(elements,selected);
 const count=elements.length+' '+(elements.length===1?'capa':'capas');$('layerCount').textContent=$('canvasLayerCount').textContent=count;$('emptyLayers').hidden=elements.length>0;$('emptyDesignHint').hidden=elements.length>0;
 $('layerSelectionSummary').title=elements[selected]?layerName(elements[selected]):'';$('layerSelectionSummary').textContent=elements[selected]?layerName(elements[selected])+(elements[selected].locked?' · bloqueada':' · seleccionada'):'Selecciona una capa para editarla.';
 $('layerOpacity').value=String(Math.round((elements[selected]?.opacity??1)*100));ui.refresh();
}
$('layerOpacity').onchange=ev=>{const e=elements[selected];if(!e||e.locked)return;addHistory();e.opacity=Number(ev.target.value)/100;draw()};
$('layerDuplicate').onclick=()=>{const e=elements[selected];if(!e)return;try{if(elements.length>=500)throw Error('Máximo 500 capas');enforceDocumentBudget([...elements,e]);validatePatternBudget([...elements,e],documentWidth,documentHeight)}catch(error){notify(error.message);return}addHistory();elements.splice(selected+1,0,JSON.parse(JSON.stringify({...e,img:undefined})));selected++;draw()};
for(const [id,delta] of [['layerUp',1],['layerDown',-1]])$(id).onclick=()=>{const i=selected,j=i+delta;if(i<0||j<0||j>=elements.length||elements[i].locked||((elements[i].type==='glitter')!==(elements[j].type==='glitter')))return;addHistory();[elements[i],elements[j]]=[elements[j],elements[i]];selected=j;draw()};

window.__fepBoot?.enableDesign();stickerReady=loadStickers();startThree();update3DControls();

// Recovery completes before the editor accepts changes. No empty startup save.
const autosaveStatus=$('autosaveStatus');
function showSaveStatus(state,error){autosaveStatus.dataset.state=state;autosaveStatus.textContent=({saving:'Guardando…',saved:'Guardado en este navegador',error:'Error de guardado. Conserva un respaldo JSON.'})[state]||state;if(error){autosaveStatus.title=error.message;if(error.name==='QuotaExceededError')notify('Almacenamiento lleno. Se conservó el guardado anterior. Exporta un respaldo o libera espacio fuera del editor.')}else autosaveStatus.title=''}
let documentStore,autosave;
const startupControls=[...document.querySelectorAll('button,input,select')].filter(n=>!n.matches('[role=tab],[data-open-tool],#closeTools,#copyStartupReport')).map(node=>[node,node.disabled]);startupControls.forEach(([node])=>node.disabled=true);
try{
 projectLibrary=await openProjectLibrary();
 const thumbnail=()=>{const c=document.createElement('canvas');c.width=240;c.height=160;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,240,160);const scale=Math.min(240/textureCanvas.width,160/textureCanvas.height);x.drawImage(textureCanvas,(240-textureCanvas.width*scale)/2,(160-textureCanvas.height*scale)/2,textureCanvas.width*scale,textureCanvas.height*scale);return c.toDataURL('image/webp',.8)};
 projectSession=createProjectSession(projectLibrary,{thumbnail});documentStore=projectSession;
 if(!await projectLibrary.setting('legacyMigrated')){const legacy=await openDocumentStore();try{const entries=[];for(const key of ['previous','current']){const old=await legacy.read(key);if(old){try{const prepared=await prepareProject(old.document);entries.push({document:prepared.data,name:'Recuperado · '+(key==='current'?'último proyecto':'versión anterior')})}catch(error){notify('Se conservó un guardado anterior que no se pudo migrar: '+error.message)}}}await projectLibrary.migrateLegacy(entries)}finally{legacy.close()}}
 let freshLibrary=false;let active=await projectLibrary.active();if(!active){const list=await projectLibrary.list();if(list.length)active=list[0].id;else{active=await projectLibrary.create(projectSnapshot(),'Sin título',thumbnail());freshLibrary=true}}await projectSession.activate(active);
 let current,currentError;try{current=freshLibrary?null:await deadline(documentStore.read(),6000,'La lectura del guardado local no respondió')}catch(error){currentError=error}
 if(current||currentError){try{if(currentError)throw currentError;const prepared=await deadline(prepareProject(current.document),10000,'No terminó la recuperación de imágenes');if(allProjectLayers(prepared.data).some(e=>e.type==='sticker'))await deadline(stickerReady,8000,'No respondió el motor de stickers');applyPreparedProject(prepared);$('startScreen').close();showSaveStatus('saved')}catch(error){projectRecoveryError=true;window.__fepBoot?.stage('storage','failed',error);showSaveStatus('error',error);$('startScreen').close();notify('La copia actual no se pudo recuperar. Usa Restaurar versión anterior o abre un JSON; no se sobrescribió la copia.')}}
 else autosaveStatus.textContent='Autoguardado local activo';
 autosave=createAutosave({store:documentStore,snapshot:projectSnapshot,status:showSaveStatus});
 if(window.__fepBoot?.stages.storage.state!=='failed')window.__fepBoot?.stage('storage','ready');
 const assetIDs=new WeakMap();let nextID=0;const fingerprint=()=>{const state=projectSnapshot();const light=list=>list.map(({img,data,...e})=>{if(img&&!assetIDs.has(img))assetIDs.set(img,++nextID);return {...e,asset:img?assetIDs.get(img):null}});state.elements=light(elements);if(state.freeDocument)state.freeDocument.elements=light(freeDocument.elements);if(state.productZones)for(const[p,g]of Object.entries(productZones))for(const[id,z]of Object.entries(g.zones))state.productZones[p].zones[id].elements=light(z.elements);return JSON.stringify(state)};let observed=fingerprint();resetSaveFingerprint=()=>{observed=fingerprint()};queueAutosave=()=>{if(recovering||projectSwitchBusy||projectRecoveryError||!projectSession.id)return;const next=fingerprint();if(next!==observed){observed=next;autosave.schedule()}};
 for(const event of ['input','change','click'])document.addEventListener(event,()=>queueMicrotask(queueAutosave));
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&!projectSwitchBusy&&projectSession.id&&!projectRecoveryError)autosave.flush()});window.addEventListener('pagehide',()=>{if(!projectSwitchBusy&&projectSession.id&&!projectRecoveryError)autosave.flush()});

 const initialDocument=cleanDocument(projectSnapshot());initialDocument.elements=[];delete initialDocument.productZones;delete initialDocument.zoneSchema;delete initialDocument.freeDocument;
 const transition=async(fn)=>{if(projectSwitchBusy)throw Error('Espera al cambio de proyecto');projectSwitchBusy=true;recovering=true;++importGeneration;const controls=[...document.querySelectorAll('button,input,select')].filter(n=>!n.closest('#projectsDialog')).map(n=>[n,n.disabled]);controls.forEach(([n])=>n.disabled=true);try{if(projectSession.id&&!projectRecoveryError&&!await autosave.flush())throw Error('No se pudo guardar el proyecto actual. Exporta un respaldo antes de cambiar');autosave.cancel();return await fn()}finally{resetSaveFingerprint();recovering=false;projectSwitchBusy=false;controls.forEach(([n,v])=>n.disabled=v)}};
 const prepare=async raw=>{const p=await prepareProject(raw);if(allProjectLayers(p.data).some(e=>e.type==='sticker'))await stickerReady;return p};
 const open=async(id,removeId)=>transition(async()=>{if(removeId){await projectLibrary.remove(removeId);if(removeId!==projectSession.id)return;const list=await projectLibrary.list();id=list[0]?.id||null}if(!id){await projectSession.activate(null);showSaveStatus('Sin proyecto abierto');return}const record=await projectLibrary.get(id);if(!record)throw Error('Proyecto no encontrado');const prepared=await prepare(record.document);applyPreparedProject(prepared);await projectSession.activate(id);projectRecoveryError=false;window.__fepBoot?.stage('storage','ready');showSaveStatus('saved');$('startScreen').close()});
 const create=async name=>transition(async()=>{const prepared=await prepare(initialDocument);const id=await projectLibrary.create(prepared.data,name);applyPreparedProject(prepared);await projectSession.activate(id);projectRecoveryError=false;await autosave.flush();$('startScreen').showModal()});
 const importProject=async file=>{if(file.size>100000000)throw Error('El respaldo supera 100 MB');const raw=JSON.parse(await file.text());if(raw.digest&&raw.digest!==await documentDigest(raw.document))throw Error('El respaldo está dañado: no coincide su integridad');const prepared=await prepare(raw.format==='fep-project'?raw.document:raw);return transition(async()=>{const id=await projectLibrary.create(prepared.data,raw.format==='fep-project'?raw.name:file.name.replace(/\.json$/i,''));applyPreparedProject(prepared);await projectSession.activate(id);projectRecoveryError=false;await autosave.flush();$('startScreen').close()})};
 const exportProject=async id=>{if(id===projectSession.id&&!projectRecoveryError&&!await autosave.flush())throw Error('No se pudo guardar antes del respaldo');const [record,list]=await Promise.all([projectLibrary.get(id),projectLibrary.list()]);const name=list.find(p=>p.id===id)?.name||'Proyecto';saveBlob(new Blob([JSON.stringify({format:'fep-project',version:1,name,digest:await documentDigest(record.document),document:record.document})],{type:'application/json'}),name+'.json')};
 const recover=async id=>transition(async()=>{const entries=await projectLibrary.history(id);if(!entries.length)throw Error('No hay respaldos válidos para recuperar');const choice=prompt('Selecciona un respaldo (1–'+entries.length+'):\n'+entries.map((e,i)=>(i+1)+'. '+(e.savedAt?new Date(e.savedAt).toLocaleString():'Versión anterior')).join('\n'),'1');if(choice===null)return;const index=Number(choice)-1;if(!Number.isInteger(index)||!entries[index])throw Error('Respaldo no válido');const prepared=await prepare(entries[index].document);await projectLibrary.restore(id,entries[index].index);applyPreparedProject(prepared);await projectSession.activate(id);projectRecoveryError=false;window.__fepBoot?.stage('storage','ready');showSaveStatus('saved');$('startScreen').close()});
 projectManager=createProjectManager({library:projectLibrary,session:projectSession,open,create,importProject,exportProject,recover,notify});$('myProjects').onclick=()=>{projectManager.show();$('projectMenu').open=false};
 $('restorePrevious').onclick=()=>recover(projectSession.id).catch(error=>notify('No se pudo recuperar: '+error.message));

}catch(error){window.__fepBoot?.stage('storage','failed',error);showSaveStatus('error',error);$('restorePrevious').title='Almacenamiento local no disponible'}
finally{recovering=false;freeController?.ready();startupControls.forEach(([node,disabled])=>node.disabled=disabled);if(!autosave)$('restorePrevious').disabled=true;updateImageControls();glitterControls.switchMode(glitterControls.mode());update3DControls();stickerController?.sync();if(!stickerController&&$('stickerInsert'))$('stickerInsert').disabled=true}

function deadline(promise,ms,message){let timer;return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error(message)),ms)})]).finally(()=>clearTimeout(timer))}

async function loadStickers(){
 try{
  const [catalog,geometry]=await Promise.all([import('./src/stickers.js?v=fep-1a3de09befbf814e'),import('./src/sticker-renderer.js?v=fep-1a3de09befbf814e')]);stickerGeometry=geometry;stickerPainter=geometry.paintSticker;const uiModule=await import('./src/sticker-controls.js?v=fep-1a3de09befbf814e');
  stickerController=uiModule.createStickerControls({selected:()=>elements[selected],dimensions:cmPrint,busy:()=>recovering,notify,insert:definition=>{
   if(recovering)return;if(elements.length>=500){notify('Máximo 500 capas');return}
   const layer={type:'sticker',stickerId:definition.id,stickerName:definition.name,x:.5,y:.5,...initialLayerSize(.28,.75),color:'#e6eef9',outlineColor:'#52697e',outlineWidth:definition.shapes[0].stroke?1.5:0,rotation:0,flipX:false,flipY:false,shadow:false,...(definition.textBox?{label:{text:'',size:14,color:'#172b4d'}}:{})};validateStickerLayer(layer);addHistory();elements.push(layer);selected=elements.length-1;loadSelectedTextIntoInputs();updateImageControls();draw();requestAnimationFrame(()=>resync3D({resetView:true,selectedObject:true}));notify('Sticker añadido: '+definition.name)
  },commit:next=>{if(recovering)throw Error('Espera a que termine la recuperación');validateStickerLayer(next);addHistory();Object.assign(elements[selected],next);draw()}});
  $('stickerLibraryStatus').textContent='Biblioteca local · '+catalog.stickers.length+' elementos vectoriales';window.__fepBoot?.stage('stickers','ready');draw();return true;
 }catch(error){window.__fepBoot?.stage('stickers','failed',error);if($('stickerLibraryStatus'))$('stickerLibraryStatus').textContent='No se pudo cargar la biblioteca: '+error.message;if($('stickerInsert'))$('stickerInsert').disabled=true;return false}
}

// Called by the explicit offline update button, after durable local persistence.
window.__fepFlushForUpdate=()=>projectSwitchBusy||projectRecoveryError||!autosave?Promise.resolve(false):projectSession.id?autosave.flush():Promise.resolve(true);
