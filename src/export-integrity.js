// Strict, format-level integrity checks for Android document exports.
// These validate container structure; actual rendering is verified on device.
export function validatePngBytes(bytes){
 const b=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);
 const signature=[137,80,78,71,13,10,26,10];
 if(b.length<45||!signature.every((n,i)=>b[i]===n))throw Error('PNG inválido: encabezado');
 const d=new DataView(b.buffer,b.byteOffset,b.byteLength);
 let pos=8,ihdr=false,idat=false,done=false,chunkCount=0,width=0,height=0;
 while(pos+12<=b.length&&!done){
  const size=d.getUint32(pos),type=String.fromCharCode(...b.subarray(pos+4,pos+8));
  if(size>b.length-pos-12)throw Error('PNG incompleto: fragmento '+type);
  if(chunkCount===0&&type!=='IHDR')throw Error('PNG inválido: IHDR debe ir primero');
  if(type==='IHDR'){
   if(ihdr||size!==13)throw Error('PNG inválido: IHDR duplicado');
   width=d.getUint32(pos+8);height=d.getUint32(pos+12);
   if(!width||!height||width>16384||height>16384)throw Error('Dimensiones PNG inválidas');
   ihdr=true;
  }else if(type==='IDAT'){idat=true}
  else if(type==='IEND'){if(size!==0)throw Error('PNG inválido: IEND');done=true}
  pos+=12+size;chunkCount++;
  if(chunkCount>50000)throw Error('PNG con demasiados fragmentos');
 }
 if(!ihdr||!idat||!done||pos!==b.length)throw Error('PNG incompleto o con datos sobrantes');
 return {width,height,bytes:b.length};
}
export function validatePdfBytes(bytes){
 const b=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);
 if(b.length<150||String.fromCharCode(...b.subarray(0,5))!=='%PDF-')throw Error('PDF inválido: encabezado');
 const tail=new TextDecoder().decode(b.subarray(Math.max(0,b.length-1024)));
 if(!/startxref\s+\d+\s+%%EOF\s*$/.test(tail))throw Error('PDF inválido: falta referencia final');
 return {bytes:b.length};
}
