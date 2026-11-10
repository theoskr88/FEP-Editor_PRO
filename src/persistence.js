const DB='fep-editor-documents',STORE='documents';
export function openDocumentStore(indexedDB=globalThis.indexedDB){
 return new Promise((resolve,reject)=>{let settled=false;const timer=setTimeout(()=>{settled=true;reject(Error('IndexedDB no respondió; puedes editar y guardar JSON'))},5000),fail=error=>{clearTimeout(timer);settled=true;reject(error)};if(!indexedDB){fail(Error('IndexedDB no disponible'));return}const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE);r.onerror=()=>fail(r.error);r.onblocked=()=>fail(Error('Cierra otras pestañas del editor para habilitar el guardado'));r.onsuccess=()=>{const db=r.result;if(settled){db.close();return}settled=true;clearTimeout(timer);db.onversionchange=()=>db.close();resolve({
  read(key='current'){return new Promise((ok,bad)=>{const tx=db.transaction(STORE,'readonly'),q=tx.objectStore(STORE).get(key);q.onsuccess=()=>ok(q.result);q.onerror=()=>bad(q.error)})},
  write(document){return new Promise((ok,bad)=>{const tx=db.transaction(STORE,'readwrite'),store=tx.objectStore(STORE),r=store.get('current');let changed=false,failure;r.onsuccess=()=>{try{const old=r.result;if(old&&JSON.stringify(old.document)===JSON.stringify(document))return;if(old)store.put(old,'previous');store.put({document,savedAt:Date.now()},'current');changed=true}catch(error){failure=error;tx.abort()}};tx.oncomplete=()=>ok(changed);tx.onabort=()=>bad(failure||tx.error||Error('No se pudo guardar'));tx.onerror=()=>{};})},close:()=>db.close()
 })}});
}
export function createAutosave({store,snapshot,status,delay=700}){
 let timer,revision=0,queue=Promise.resolve();
 function flush(){clearTimeout(timer);const ownRevision=++revision;let document;try{document=snapshot()}catch(error){status('error',error);return Promise.resolve(false)}status('saving');
  queue=queue.catch(()=>{}).then(()=>store.write(document)).then(()=>{if(ownRevision===revision)status('saved');return true},error=>{status('error',error);return false});return queue;
 }
 return {schedule(){++revision;clearTimeout(timer);status('saving');timer=setTimeout(flush,delay)},flush,cancel(){clearTimeout(timer)}};
}
