import { Capacitor, registerPlugin } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

const Files = registerPlugin('FepFiles');
const Video = registerPlugin('FepVideo');
const isNative = Capacitor.isNativePlatform() && Capacitor.getPlatform()==='android';
const base64 = blob => new Promise((resolve,reject)=>{
  const reader=new FileReader();
  reader.onerror=()=>reject(reader.error || Error('No se pudo leer el archivo'));
  reader.onload=()=>resolve(String(reader.result).split(',')[1]);
  reader.readAsDataURL(blob);
});
const mimeOf=name=>name.endsWith('.png')?'image/png':name.endsWith('.jpg')?'image/jpeg':
 name.endsWith('.pdf')?'application/pdf':name.endsWith('.svg')?'image/svg+xml':
 name.endsWith('.webm')?'video/webm':name.endsWith('.mp4')?'video/mp4':
 name.endsWith('.zip')?'application/zip':name.endsWith('.json')?'application/json':'application/octet-stream';
const safeName=name=>String(name).replace(/[\\/\x00-\x1F]/g,'_').slice(0,120)||'fep-archivo';
window.FEP_NATIVE={
  isNative,
  async saveBlob(blob,name){
    if(!isNative)throw Error('Solo Android');
    if(!(blob instanceof Blob)||!blob.size)throw Error('Archivo vacío');
    if(blob.size>200*1024*1024)throw Error('Archivo superior a 200 MiB');
    name=safeName(name);
    // Stream 256 KiB chunks to Android to avoid Base64 of the entire project,
    // multi-megabyte JNI strings, and WebView OutOfMemoryError.
    const sessionResult=await Files.beginStream({name,mime:mimeOf(name)});
    if(!sessionResult?.session)throw Error('El sistema Android no devolvió sesión de guardado');
    const session=sessionResult.session;
    try{
      const step=256*1024;
      let written=0;
      for(let offset=0;offset<blob.size;offset+=step){
        const chunk=blob.slice(offset,Math.min(blob.size,offset+step));
        const result=await Files.appendStream({session,data:await base64(chunk)});
        written+=chunk.size;
        if(result?.bytesWritten!==written)throw Error('Escritura de bloque incompleta');
      }
      const finished=await Files.finishStream({session});
      if(finished?.bytes!==blob.size)throw Error('La verificación final no coincide');
      return finished;
    }catch(error){
      await Files.cancelStream({session}).catch(()=>{});
      throw error;
    }
  },
  async photo(source='camera'){
    if(!isNative)throw Error('Solo Android');
    const result=await Camera.getPhoto({
      source:source==='camera'?CameraSource.Camera:CameraSource.Photos,
      resultType:CameraResultType.Uri,quality:85,allowEditing:false,
      width:2048,height:2048,correctOrientation:true
    });
    if(!result.webPath)throw Error('La cámara no devolvió un archivo legible');
    const response=await fetch(result.webPath);
    if(!response.ok)throw Error('No se puede leer la fotografía capturada');
    const blob=await response.blob();
    if(!blob.size)throw Error('La cámara devolvió una imagen vacía');
    return new File([blob],source==='camera'?'fotografia.jpg':'galeria.jpg',{type:blob.type||'image/jpeg'});
  },
  video:{
    start:opts=>Video.start(opts),
    frame:opts=>Video.frame(opts),
    finish:()=>Video.finish(),
    cancel:()=>Video.cancel()
  }
};
