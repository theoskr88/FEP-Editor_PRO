// ZIP STORE-only reader for FEP backup archives; no network and no decompression.
// Validates local headers, each CRC-32, central directory and EOCD, with bounded
// per-entry reads to avoid allocating the whole archive in Android WebView.
const decoder=new TextDecoder('utf-8',{fatal:true});
export function crc32(bytes){let crc=0xffffffff;for(const b of bytes){crc^=b;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0)}return(crc^0xffffffff)>>>0}
const u16=(v,p)=>v.getUint16(p,true),u32=(v,p)=>v.getUint32(p,true);
const MAX_ENTRY=30*1024*1024;
export async function readFepLibraryZip(input,{maxBytes=100*1024*1024,maxFiles=100,lazy=false}={}){
 const array=input instanceof ArrayBuffer?new Uint8Array(input):ArrayBuffer.isView(input)?new Uint8Array(input.buffer,input.byteOffset,input.byteLength):null;
 const size=array?.byteLength??input?.size;
 if(!Number.isSafeInteger(size)||size>maxBytes||size<52)throw Error('Respaldo ZIP vacío o demasiado grande');
 const read=async(start,length)=>{
  if(!Number.isSafeInteger(start)||!Number.isSafeInteger(length)||start<0||length<0||start+length>size)throw Error('ZIP fuera de límites');
  return array?array.subarray(start,start+length):new Uint8Array(await input.slice(start,start+length).arrayBuffer());
 };
 const files=new Map(),records=[],names=new Set();let at=0,total=0;
 while(at+4<=size){
  const sig=new DataView((await read(at,4)).slice().buffer).getUint32(0,true);
  if(sig===0x02014b50)break;
  if(sig!==0x04034b50)throw Error('ZIP dañado: cabecera no válida');
  const h=new DataView((await read(at,30)).slice().buffer);
  const flags=u16(h,6),method=u16(h,8),crc=u32(h,14),compressed=u32(h,18),original=u32(h,22);
  const nameLen=u16(h,26),extra=u16(h,28),begin=at+30+nameLen+extra,end=begin+compressed;
  if(flags!==0||method!==0||compressed!==original)throw Error('El ZIP no es un respaldo local compatible');
  if(!nameLen||compressed>MAX_ENTRY||end>size||records.length>=maxFiles)throw Error('Archivo ZIP fuera de límites');
  const name=decoder.decode(await read(at+30,nameLen));
  if(!/^[a-zA-Z0-9_./-]+$/.test(name)||name.includes('..')||names.has(name))throw Error('Nombre o ruta ZIP no admitidos');
  total+=compressed;if(total>maxBytes)throw Error('La biblioteca supera el límite de seguridad');
  // CRC-check one entry at a time. Release temporary bytes before the next entry.
  const bytes=await read(begin,compressed);
  if(crc32(bytes)!==crc)throw Error('Archivo ZIP corrupto: '+name);
  if(!lazy)files.set(name,decoder.decode(bytes));
  else files.set(name,{offset:begin,length:compressed});
  names.add(name);records.push({name,crc,compressed,local:at});
  at=end;
 }
 if(records.length<2||!names.has('manifest.json'))throw Error('No es una biblioteca FEP válida');
 const centralStart=at;let centralCount=0;
 while(at+4<=size){
  const sig=new DataView((await read(at,4)).slice().buffer).getUint32(0,true);
  if(sig===0x06054b50)break;
  if(sig!==0x02014b50||at+46>size)throw Error('Directorio central ZIP incompleto');
  const h=new DataView((await read(at,46)).slice().buffer);
  if(u16(h,8)!==0||u16(h,10)!==0)throw Error('Compresión ZIP no compatible');
  const nameLen=u16(h,28),extra=u16(h,30),comment=u16(h,32),disk=u16(h,34);
  const next=at+46+nameLen+extra+comment;
  if(disk!==0||!nameLen||next>size||centralCount>=records.length)throw Error('Directorio central ZIP inválido');
  const name=decoder.decode(await read(at+46,nameLen)),expected=records[centralCount];
  if(name!==expected.name||u32(h,16)!==expected.crc||u32(h,20)!==expected.compressed||u32(h,24)!==expected.compressed||u32(h,42)!==expected.local)throw Error('Directorio central ZIP no coincide con archivos');
  at=next;centralCount++;
 }
 if(centralCount!==records.length||at+22>size)throw Error('ZIP incompleto: directorio central truncado');
 const eocd=new DataView((await read(at,22)).slice().buffer);
 if(u32(eocd,0)!==0x06054b50||u16(eocd,4)!==0||u16(eocd,6)!==0||u16(eocd,8)!==records.length||u16(eocd,10)!==records.length||u32(eocd,12)!==at-centralStart||u32(eocd,16)!==centralStart||at+22+u16(eocd,20)!==size)throw Error('ZIP incompleto: marcador final EOCD o índices incorrectos');
 const readText=async name=>{
  if(!files.has(name))throw Error('Archivo no incluido en el respaldo');
  if(!lazy)return files.get(name);
  const {offset,length}=files.get(name);
  return decoder.decode(await read(offset,length));
 };
 const manifest=JSON.parse(await readText('manifest.json'));
 if(manifest.format!=='fep-library'||manifest.version!==1||!Number.isInteger(manifest.count)||manifest.count<1||manifest.count>95||manifest.count!==manifest.projects?.length||manifest.count!==files.size-1)throw Error('Manifiesto de respaldo incompatible');
 const used=new Set();
 for(const entry of manifest.projects){
  if(typeof entry.name!=='string'||entry.name.length>200||typeof entry.file!=='string'||!/^proyectos\/proyecto_\d{3}\.json$/.test(entry.file)||used.has(entry.file)||!files.has(entry.file))throw Error('Índice del respaldo inválido');
  if(typeof entry.digest!=='string'||!/^[a-f0-9]{64}$/.test(entry.digest))throw Error('Hash de respaldo inválido');
  used.add(entry.file);
 }
 return {manifest,files,readText};
}
