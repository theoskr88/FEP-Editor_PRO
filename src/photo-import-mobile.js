// Normaliza fotografías tomadas por Android y archivos grandes antes del importador estricto.
// No altera el archivo de origen; se conserva transparencia de PNG/WebP cuando existe.
export function fitDimensions(width,height,maxSide=2048,maxPixels=4000000){
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<1||height<1)throw Error('Fotografía sin dimensiones válidas');
 const scale=Math.min(1,maxSide/Math.max(width,height),Math.sqrt(maxPixels/(width*height)));
 return {width:Math.max(1,Math.round(width*scale)),height:Math.max(1,Math.round(height*scale))};
}
export async function normalizePhoto(file){
 if(!file||file.size===0)throw Error('No se recibió una fotografía');
 if(file.size>90*1024*1024)throw Error('La fotografía supera 90 MB');
 let image,objectURL,bitmap;
 try{
  try{bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});image=bitmap}
  catch{
   objectURL=URL.createObjectURL(file);
   image=new Image();image.src=objectURL;await image.decode();
  }
  const width=image.width||image.naturalWidth,height=image.height||image.naturalHeight;
  const size=fitDimensions(width,height);
  const canvas=document.createElement('canvas');canvas.width=size.width;canvas.height=size.height;
  const context=canvas.getContext('2d');if(!context)throw Error('No se pudo preparar la fotografía');
  context.drawImage(image,0,0,size.width,size.height);
  const preserveAlpha=/image\/(png|webp)/i.test(file.type||'');
  let kind=preserveAlpha?'image/png':'image/jpeg',quality=.86;
  let output=await new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('No se pudo convertir la fotografía')),kind,quality));
  // Guardar dentro de límites locales incluso cuando la foto original exceda 10 MiB.
  if(output.size>9*1024*1024&&!preserveAlpha){
   quality=.7;output=await new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('No se pudo comprimir la fotografía')),kind,quality));
  }
  canvas.width=canvas.height=1;
  if(output.size>10*1024*1024)throw Error('La imagen ocupa más de 10 MiB después de la conversión');
  return new File([output],preserveAlpha?'imagen-normalizada.png':'fotografia-normalizada.jpg',{type:kind});
 }finally{bitmap?.close?.();if(objectURL)URL.revokeObjectURL(objectURL)}
}
