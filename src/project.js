import {normalizeZoneBank} from './zones.js?v=cierre-b2-20261111';
import {normalizeMockup} from './mockup-settings.js?v=cierre-b2-20261111';
import {validateCreative,validatePatternBudget} from './creative.js?v=cierre-b2-20261111';
import {profileById,profileVariant} from './product-profiles.js?v=cierre-b2-20261111';
import {validateVector} from './vector.js?v=cierre-b2-20261111';
import {normalizeFreeDesign,validateShape} from './free-design.js?v=cierre-b2-20261111';
import {glitterSettings,migrateLegacyGlitter,GLITTER_SCHEMA} from './glitter.js?v=cierre-b2-20261111';
// Validate before changing any live editor state. Legacy V1 remains readable.
export function validateProject(data){
 if(!data||typeof data!=='object'||![undefined,1,2].includes(data.version)||!Array.isArray(data.elements)||data.elements.length>500)throw Error('Formato o número de capas inválido');
 for(const key of ['width','height'])if(data[key]!==undefined&&(!Number.isFinite(data[key])||data[key]<1||data[key]>100))throw Error('Dimensiones fuera de 1–100 cm');
 for(const e of data.elements){
  if(e)validateCreative(e);
  if(!e||!['text','image','glitter','sticker','shape','vector'].includes(e.type)||!Number.isFinite(e.x)||!Number.isFinite(e.y)||Math.abs(e.x)>10||Math.abs(e.y)>10)throw Error('Capa inválida');
  if(e.type==='text'&&(typeof e.text!=='string'||e.text.length>1000||!Number.isFinite(e.size)||e.size<=0||e.size>500))throw Error('Texto inválido');
  if(e.type==='image'&&(typeof e.data!=='string'||e.data.length>15_000_000||!/^data:image\/(png|jpeg|webp);base64,/.test(e.data)))throw Error('Imagen no compatible');
  if(e.type==='sticker')validateStickerLayer(e);if(e.type==='shape')validateShape(e);if(e.type==='vector')validateVector(e);
  for(const key of ['widthFrac','heightFrac','scale'])if(e[key]!==undefined&&(!Number.isFinite(e[key])||e[key]<=0||e[key]>3))throw Error('Tamaño de imagen inválido');
  if(e.glitter!==undefined&&(!e.glitter||typeof e.glitter!=='object'||Array.isArray(e.glitter)))throw Error('Parámetros glitter inválidos');
  for(const key of ['visible','locked'])if(e[key]!==undefined&&typeof e[key]!=='boolean')throw Error('Estado de capa inválido');
  if(e.opacity!==undefined&&(!Number.isFinite(e.opacity)||e.opacity<0||e.opacity>1))throw Error('Opacidad inválida');
 }
 validatePatternBudget(data.elements,data.width||20,data.height||8.5);
 return data;
}

export function normalizeProject(input){
 validateProject(input);
 if(input.mode!==undefined&&!['product','free'].includes(input.mode))throw Error('Modo de documento inválido');normalizeFreeDesign(input.freeDesign);
 if(input.glitter!==undefined&&(!input.glitter||typeof input.glitter!=='object'||Array.isArray(input.glitter)))throw Error('Parámetros del material inválidos');
 if(input.glitterSchema!==undefined&&![1,GLITTER_SCHEMA].includes(input.glitterSchema))throw Error('Versión de parámetros glitter no compatible');
 if(input.glitterDraft!==undefined&&(!input.glitterDraft||typeof input.glitterDraft!=='object'||Array.isArray(input.glitterDraft)))throw Error('Borrador glitter inválido');
 const data=typeof structuredClone==='function'?structuredClone(input):JSON.parse(JSON.stringify(input)),warnings=[];
 const normalizeGlitter=input.glitterSchema===GLITTER_SCHEMA?glitterSettings:migrateLegacyGlitter;
 data.glitter=normalizeGlitter(data.glitter);data.glitterDraft=input.glitterSchema===GLITTER_SCHEMA?glitterSettings(data.glitterDraft??data.glitter):{...data.glitter};data.glitterMode=data.glitterMode==='material'?'material':'print';data.glitterSchema=GLITTER_SCHEMA;
 for(const e of data.elements)if(e.type==='glitter')e.glitter=normalizeGlitter(e.glitter);
 if(data.finishMode==='magic'){warnings.push('El acabado antiguo se sustituyó por normal; el diseño se conservó.');data.finishMode='standard'}
 delete data.magicHeat;
 data.mockup=normalizeMockup(data.mockup,data.viewerBackground);
 data.mode=data.mode||'product';data.freeDesign=normalizeFreeDesign(data.freeDesign);
 data.version=2;data.finishMode=['standard','glitter'].includes(data.finishMode)?data.finishMode:'standard';
 data.product=profileById(data.product)?data.product:'mug';data.profileVariant=profileVariant(data.profileVariant);
 data.width??=20;data.height??=8.5;
 if(data.width/data.height>100||data.width/data.height<.01)throw Error('Proporción inválida');
 data.color=/^#[0-9a-f]{6}$/i.test(data.color||'')?data.color:'#ffffff';
 data.printRotationDeg=Number.isFinite(data.printRotationDeg)?((data.printRotationDeg%360)+360)%360:270;
 data.mirrorMode=data.mirrorMode==='normal'||data.mirrorMode==='none'||data.mirrorPrint===false?'normal':'espejo';
 // A glitter background is always below artwork, preserving relative order.
 data.elements=[...data.elements.filter(e=>e.type==='glitter'),...data.elements.filter(e=>e.type!=='glitter')];
 if(data.freeDocument!==undefined){validateProject(data.freeDocument);data.freeDocument={width:data.freeDocument.width??data.width,height:data.freeDocument.height??data.height,elements:data.freeDocument.elements,freeDesign:normalizeFreeDesign(data.freeDocument.freeDesign)};for(const e of data.freeDocument.elements)if(e.type==='glitter')e.glitter=normalizeGlitter(e.glitter);if(data.mode==='free')data.freeDocument={width:data.width,height:data.height,elements:data.elements,freeDesign:data.freeDesign}}
 const bank=normalizeZoneBank(data,doc=>{validateProject(doc);for(const e of doc.elements)if(e.type==='glitter')e.glitter=normalizeGlitter(e.glitter)});if(Object.keys(bank).length){data.productZones=bank;data.zoneSchema=1}else{delete data.productZones;delete data.zoneSchema}
 return {data,warnings};
}

export function validateStickerLayer(e){
 if(e.stickerName!==undefined&&(typeof e.stickerName!=='string'||e.stickerName.length>80))throw Error('Nombre de sticker inválido');
 if(typeof e.stickerId!=='string'||!/^(cloud|bubble|decor|nature|label)-[a-z0-9-]{1,60}$/.test(e.stickerId))throw Error('Identificador de sticker inválido');
 for(const key of ['color','outlineColor'])if(typeof e[key]!=='string'||!/^#[0-9a-f]{6}$/i.test(e[key]))throw Error('Color de sticker inválido');
 for(const key of ['widthFrac','heightFrac'])if(!Number.isFinite(e[key])||e[key]<=0||e[key]>3)throw Error('Tamaño de sticker fuera de rango');
 if(!Number.isFinite(e.rotation)||Math.abs(e.rotation)>3600||!Number.isFinite(e.outlineWidth)||e.outlineWidth<0||e.outlineWidth>8)throw Error('Transformación o contorno de sticker inválido');
 for(const key of ['flipX','flipY','shadow'])if(typeof e[key]!=='boolean')throw Error('Estilo de sticker inválido');
 if(e.label!==undefined&&(!e.label||typeof e.label.text!=='string'||e.label.text.length>300||!Number.isFinite(e.label.size)||e.label.size<4||e.label.size>40||!/^#[0-9a-f]{6}$/i.test(e.label.color)))throw Error('Texto de sticker inválido');
 return e;
}
