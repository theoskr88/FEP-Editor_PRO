import {normalizeProject} from './project.js';
import {ASSET_LIMITS,decodeImageData,enforceDocumentBudget,imageInfo} from './assets.js';
export async function prepareProject(input){
 const result=normalizeProject(input),cache=new Map();let pixels=0,encoded=0;
 // Preflight the entire document before decoding its first asset.
 for(const e of result.data.elements)if(e.type==='image'){
  const comma=e.data.indexOf(',');let raw;try{raw=atob(e.data.slice(comma+1))}catch{throw Error('Datos de imagen corruptos en el proyecto')}
  if(raw.length>ASSET_LIMITS.bytes)throw Error('Máximo 10 MiB por imagen');
  const info=imageInfo(Uint8Array.from(raw,c=>c.charCodeAt(0)));pixels+=info.pixels;encoded+=e.data.length;
  if(pixels>ASSET_LIMITS.totalPixels||encoded>ASSET_LIMITS.projectBytes)throw Error('El documento supera 32 megapíxeles o 30 MB de imágenes');
 }
 for(const e of result.data.elements)if(e.type==='image'){
  if(!cache.has(e.data))cache.set(e.data,await decodeImageData(e.data));e.img=cache.get(e.data).img;
 }
 enforceDocumentBudget(result.data.elements);return result;
}
