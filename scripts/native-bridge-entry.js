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
    name=safeName(name);
    // ACTION_CREATE_DOCUMENT writes to user-selected storage; no broad storage permissions.
    if(blob.size<=30*1024*1024){
      return Files.saveFile({name,mime:mimeOf(name),data:await base64(blob)});
    }
    // Larger documents: share through Android's Files app or Drive.
    const path='fep-'+Date.now()+'-'+name;
    await Filesystem.writeFile({path,data:await base64(blob),directory:Directory.Cache});
    const uri=await Filesystem.getUri({path,directory:Directory.Cache});
    return Share.share({title:'Guardar '+name,url:uri.uri,dialogTitle:'Guardar o compartir'});
  },
  async photo(source='camera'){
    if(!isNative)throw Error('Solo Android');
    const result=await Camera.getPhoto({source:source==='camera'?CameraSource.Camera:CameraSource.Photos,
      resultType:CameraResultType.DataUrl,quality:95,allowEditing:false,correctOrientation:true});
    if(!result.dataUrl)throw Error('No se recibió una imagen');
    const response=await fetch(result.dataUrl);
    return new File([await response.blob()],source==='camera'?'fotografia.jpg':'galeria.jpg',{type:response.headers.get('content-type')||'image/jpeg'});
  },
  video:{
    start:opts=>Video.start(opts),
    frame:opts=>Video.frame(opts),
    finish:async()=>{const result=await Video.finish();await Share.share({title:'Video 360° FEP',url:result.uri,dialogTitle:'Guardar o compartir MP4'});return result},
    cancel:()=>Video.cancel()
  }
};
