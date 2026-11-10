// Inspect dimensions BEFORE asking the browser to allocate a decoded bitmap.
export const ASSET_LIMITS={bytes:10*1024*1024,side:8192,pixels:16_000_000,totalPixels:32_000_000,projectBytes:30_000_000};
export function imageInfo(bytes){
 const b=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes),d=new DataView(b.buffer,b.byteOffset,b.byteLength);
 const str=(p,n)=>String.fromCharCode(...b.subarray(p,p+n));let width,height,type;
 if(b.length>=24&&str(0,8)==='\x89PNG\r\n\x1a\n'&&str(12,4)==='IHDR'){type='image/png';width=d.getUint32(16);height=d.getUint32(20)}
 else if(b.length>=4&&b[0]===255&&b[1]===216){type='image/jpeg';let p=2;while(p+4<=b.length){if(b[p++]!==255)throw Error('JPEG dañado');let marker=b[p++];while(marker===255)marker=b[p++];if(marker===0xda||marker===0xd9)break;if(marker===0x01||(marker>=0xd0&&marker<=0xd7))continue;const n=d.getUint16(p);if(n<2||p+n>b.length)throw Error('JPEG incompleto');if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)){if(n<8)throw Error('JPEG dañado');height=d.getUint16(p+3);width=d.getUint16(p+5);break}p+=n}}
 else if(b.length>=30&&str(0,4)==='RIFF'&&str(8,4)==='WEBP'){
  type='image/webp';let p=12;
  while(p+8<=b.length){const tag=str(p,4),n=d.getUint32(p+4,true),q=p+8;if(q+n>b.length)throw Error('WebP incompleto');
   if(tag==='VP8X'&&n>=10){if(b[q]&2)throw Error('No se admiten imágenes animadas');width=1+b[q+4]+(b[q+5]<<8)+(b[q+6]<<16);height=1+b[q+7]+(b[q+8]<<8)+(b[q+9]<<16);break}
   if(tag==='VP8 '&&n>=10&&str(q+3,3)==='\x9d\x01\x2a'){width=d.getUint16(q+6,true)&0x3fff;height=d.getUint16(q+8,true)&0x3fff;break}
   if(tag==='VP8L'&&n>=5&&b[q]===47){const bits=d.getUint32(q+1,true);width=(bits&0x3fff)+1;height=((bits>>>14)&0x3fff)+1;break}p=q+n+(n%2);
  }
 }
 if(!width||!height)throw Error('Imagen dañada o formato no admitido (PNG, JPEG o WebP)');
 if(width>ASSET_LIMITS.side||height>ASSET_LIMITS.side||width*height>ASSET_LIMITS.pixels)throw Error('Imagen demasiado grande: máximo 8192 px por lado y 16 megapíxeles');
 return {width,height,type,pixels:width*height};
}
export async function decodeImageData(data){
 if(typeof data!=='string'||data.length>Math.ceil(ASSET_LIMITS.bytes*4/3)+100)throw Error('Máximo 10 MiB por imagen');
 const match=/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]*={0,2})$/.exec(data);if(!match)throw Error('Datos de imagen no válidos');
 let raw;try{raw=atob(match[2])}catch{throw Error('Imagen corrupta')}
 if(raw.length>ASSET_LIMITS.bytes)throw Error('Máximo 10 MiB por imagen');
 const bytes=Uint8Array.from(raw,c=>c.charCodeAt(0)),info=imageInfo(bytes);if(info.type!==match[1])throw Error('El formato de la imagen no coincide con su contenido');
 const img=new Image();img.src=data;try{await img.decode()}catch{throw Error('No se pudo decodificar la imagen; el documento se conserva')}
 if(img.naturalWidth!==info.width||img.naturalHeight!==info.height){if(img.naturalWidth*img.naturalHeight!==info.pixels)throw Error('Dimensiones de imagen inconsistentes')}
 return {data,img,...info};
}
export async function prepareImageFile(file){
 if(!file||file.size>ASSET_LIMITS.bytes)throw Error('Máximo 10 MiB por imagen');
 const bytes=new Uint8Array(await file.arrayBuffer()),info=imageInfo(bytes);let raw='';for(let i=0;i<bytes.length;i+=32768)raw+=String.fromCharCode(...bytes.subarray(i,i+32768));
 return decodeImageData(`data:${info.type};base64,${btoa(raw)}`);
}
export function enforceDocumentBudget(elements){
 if(elements.reduce((n,e)=>n+(e.paths?.reduce((a,r)=>a+r.length,0)||0),0)>200000)throw Error('Máximo 200000 nodos por documento');
 // Count each layer because independent image elements may own decoded buffers.
 let pixels=0,bytes=0;for(const e of elements)if(e.type==='image'){const im=e.img;if(im)pixels+=im.naturalWidth*im.naturalHeight;bytes+=e.data.length}
 if(pixels>ASSET_LIMITS.totalPixels||bytes>ASSET_LIMITS.projectBytes)throw Error('El documento supera 32 megapíxeles o 30 MB de imágenes');
}
