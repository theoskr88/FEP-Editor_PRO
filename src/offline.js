const status=document.getElementById('offlineStatus'),update=document.getElementById('offlineUpdate');
const show=text=>{if(status)status.textContent=text};
if('serviceWorker'in navigator&&/^https?:$/.test(location.protocol)){
 try{const registration=await navigator.serviceWorker.register(new URL('../sw.js',import.meta.url),{updateViaCache:'none'});const waiting=()=>{if(registration.waiting){update.hidden=false;show('Actualización lista. Guarda y aplica cuando termines.')}};
 const observe=()=>{const worker=registration.installing;if(worker)worker.addEventListener('statechange',()=>{if(worker.state==='installed'){waiting();if(!registration.waiting)show('Aplicación disponible sin conexión')}if(worker.state==='redundant')show('No se completó la caché. La versión anterior y tus proyectos se conservan.')})};registration.addEventListener('updatefound',observe);observe();waiting();
 navigator.serviceWorker.ready.then(()=>{if(!registration.waiting)show('Aplicación disponible sin conexión')});
 update.onclick=async()=>{update.disabled=true;try{const saved=await window.__fepFlushForUpdate?.();if(saved!==true)throw Error('No se pudo confirmar el guardado. Exporta un respaldo antes de actualizar.');const worker=registration.waiting;if(!worker){show('No hay actualización pendiente');return}show('Aplicando actualización…');navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload(),{once:true});worker.postMessage({type:'ACTIVATE_UPDATE'})}catch(error){show(error.message)}finally{update.disabled=false}};
 }catch(error){show('Offline no disponible: '+error.message)}
}else show('Recursos locales incluidos; la caché web requiere HTTPS y un navegador compatible.');
