// Local repository. The interface is independent of the DOM and can be backed by a native filesystem.
export const cleanDocument=value=>JSON.parse(JSON.stringify(value,(key,value)=>key==='img'?undefined:value));
export function projectName(value){const name=String(value||'Sin título').trim().replace(/[\u0000-\u001f]/g,'').slice(0,100);return name||'Sin título'}
const identifier=()=>globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
export function openProjectLibrary(factory=globalThis.indexedDB){return new Promise((resolve,reject)=>{
 if(!factory)return reject(Error('IndexedDB no disponible'));const request=factory.open('fep-editor-library',1);let done=false;const timer=setTimeout(()=>{done=true;reject(Error('La biblioteca local no respondió'))},5000);
 request.onupgradeneeded=()=>{for(const name of ['projects','catalog','settings'])request.result.createObjectStore(name)};
 request.onerror=()=>{clearTimeout(timer);reject(request.error)};request.onblocked=()=>{clearTimeout(timer);reject(Error('Cierra otras pestañas para actualizar la biblioteca'))};
 request.onsuccess=()=>{clearTimeout(timer);const db=request.result;if(done){db.close();return}db.onversionchange=()=>db.close();
 const transaction=(names,mode,run)=>new Promise((ok,bad)=>{const tx=db.transaction(names,mode);let result,failure;const get=(store,key,then)=>{const r=tx.objectStore(store).get(key);r.onsuccess=()=>{try{then(r.result)}catch(e){failure=e;tx.abort()}}};try{run(tx,get,value=>{result=value})}catch(e){failure=e;tx.abort()}tx.oncomplete=()=>ok(result);tx.onabort=()=>bad(failure||tx.error||Error('No se pudo completar el guardado local'));tx.onerror=()=>{}});
 const read=(store,key)=>transaction([store],'readonly',(_,get,set)=>get(store,key,set));
 const meta=(id,name,document,thumbnail='',createdAt=Date.now())=>({id,name:projectName(name),mode:document.mode||'product',product:document.product||'',createdAt,modifiedAt:Date.now(),thumbnail:/^data:image\/(png|webp|jpeg);base64,/.test(thumbnail)&&thumbnail.length<120000?thumbnail:''});
 const api={
  get:id=>read('projects',id),active:()=>read('settings','active'),
  list:()=>transaction(['catalog'],'readonly',(tx,_,set)=>{const r=tx.objectStore('catalog').getAll();r.onsuccess=()=>set(r.result)}),
  activate:id=>transaction(['settings'],'readwrite',(tx)=>tx.objectStore('settings').put(id,'active')),
  create:async(document,name,thumbnail='')=>{document=cleanDocument(document);const id=identifier();await transaction(['projects','catalog'],'readwrite',tx=>{tx.objectStore('projects').add({id,document,revision:1},id);tx.objectStore('catalog').add(meta(id,name,document,thumbnail),id)});return id},
  save:async(id,document,thumbnail='')=>{document=cleanDocument(document);return transaction(['projects','catalog'],'readwrite',(tx,get,set)=>get('projects',id,old=>{if(!old)throw Error('El proyecto ya no existe; exporta el diseño para conservarlo');if(JSON.stringify(old.document)===JSON.stringify(document)){set(false);return}get('catalog',id,catalog=>{tx.objectStore('projects').put({id,document,previous:old.document,revision:old.revision+1},id);tx.objectStore('catalog').put({...meta(id,catalog.name,document,thumbnail,catalog.createdAt)},id);set(true)})}))},
  rename:(id,name)=>transaction(['catalog'],'readwrite',(tx,get)=>get('catalog',id,old=>{if(!old)throw Error('Proyecto no encontrado');tx.objectStore('catalog').put({...old,name:projectName(name),modifiedAt:Date.now()},id)})),
  duplicate:async id=>{const [record,list]=await Promise.all([api.get(id),api.list()]);if(!record)throw Error('Proyecto no encontrado');const m=list.find(p=>p.id===id);return api.create(record.document,m.name+' · copia',m.thumbnail)},
  remove:id=>transaction(['projects','catalog','settings'],'readwrite',(tx,get)=>{tx.objectStore('projects').delete(id);tx.objectStore('catalog').delete(id);get('settings','active',active=>{if(active===id)tx.objectStore('settings').put(null,'active')})}),
  setting:(key,value)=>value===undefined?read('settings',key):transaction(['settings'],'readwrite',tx=>tx.objectStore('settings').put(value,key)),
  close:()=>db.close()
 };resolve(api)};
})}
export function createProjectSession(library,{thumbnail=()=>''}={}){let activeId=null;return{
 get id(){return activeId},async activate(id){await library.activate(id);activeId=id},
 capture(document){if(!activeId)throw Error('Crea o abre un proyecto para guardar');return{id:activeId,document:cleanDocument(document),thumbnail:thumbnail()}},
 write:entry=>library.save(entry.id,entry.document,entry.thumbnail),
 async read(key='current'){if(!activeId)return;const record=await library.get(activeId);const document=key==='previous'?record?.previous:record?.document;return document?{document}:undefined}
}}
