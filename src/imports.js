import {allProjectLayers} from './zones.js?v=fep-1a3de09befbf814e';
import {normalizeProject} from './project.js?v=fep-1a3de09befbf814e';
import {ASSET_LIMITS,decodeImageData,enforceDocumentBudget,imageInfo} from './assets.js?v=fep-1a3de09befbf814e';
export async function prepareProject(input){
 const result=normalizeProject(input),cache=new Map(),layers=allProjectLayers(result.data);
 if(layers.some(e=>e.type==='sticker')){const {getSticker}=await import('./stickers.js?v=fep-1a3de09befbf814e');for(const e of layers)if(e.type==='sticker'){const definition=getSticker(e.stickerId);if(!definition)throw Error('Sticker no disponible en esta biblioteca: '+e.stickerId);e.stickerName=definition.name;if(e.label&&!definition.textBox)throw Error('Este sticker no admite texto dentro de forma')}}let pixels=0,encoded=0;
 // Preflight the entire document before decoding its first asset.
 for(const e of layers)if(e.type==='image'){
  const comma=e.data.indexOf(',');let raw;try{raw=atob(e.data.slice(comma+1))}catch{throw Error('Datos de imagen corruptos en el proyecto')}
  if(raw.length>ASSET_LIMITS.bytes)throw Error('Máximo 10 MiB por imagen');
  const info=imageInfo(Uint8Array.from(raw,c=>c.charCodeAt(0)));pixels+=info.pixels;encoded+=e.data.length;
  if(pixels>ASSET_LIMITS.totalPixels||encoded>ASSET_LIMITS.projectBytes)throw Error('El documento supera 32 megapíxeles o 30 MB de imágenes');
 }
 for(const e of layers)if(e.type==='image'){
  if(!cache.has(e.data))cache.set(e.data,await decodeImageData(e.data));e.img=cache.get(e.data).img;
 }
 enforceDocumentBudget(layers);return result;
}
