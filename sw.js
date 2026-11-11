/* Atomic, verified application cache. Projects live only in IndexedDB. */
const BUILD='fep-f2922fbf7e7adae7',PREFIX='fep-editor-app-',CACHE=PREFIX+BUILD;
const root=new URL('./',self.location.href),url=file=>new URL(file,root).href;
self.addEventListener('install',event=>event.waitUntil((async()=>{
 if(await(await caches.open(CACHE)).match(url('__complete__')))return;
 try{const response=await fetch(url('offline-manifest.json'),{cache:'no-store'});if(!response.ok)throw Error('Manifest unavailable');const manifest=await response.json();if(manifest.build!==BUILD)throw Error('Deployment changed during installation');const cache=await caches.open(CACHE);
 for(const file of manifest.files){const response=await fetch(url(file.path),{cache:'no-store'});if(!response.ok)throw Error('Missing offline resource: '+file.path);const bytes=await response.clone().arrayBuffer(),hash=await crypto.subtle.digest('SHA-256',bytes),digest=[...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');if(digest!==file.sha256)throw Error('Mixed deployment: '+file.path);await cache.put(url(file.path),response)}
 await cache.put(url('__complete__'),new Response(BUILD));
 }catch(error){await caches.delete(CACHE);throw error}
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 // Keep old versions while old tabs use them, plus the previous complete version.
 const tabs=await self.clients.matchAll({includeUncontrolled:true}),pinned=new Set(tabs.map(t=>new URL(t.url).searchParams.get('fep-build')).filter(Boolean));
 const names=(await caches.keys()).filter(n=>n.startsWith(PREFIX));const previous=names.filter(n=>n!==CACHE).at(-1);
 for(const name of names)if(name!==CACHE&&name!==previous&&!pinned.has(name.slice(PREFIX.length)))await caches.delete(name);
 await self.clients.claim();
})()));
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')event.waitUntil((async()=>{if(await(await caches.open(CACHE)).match(url('__complete__')))await self.skipWaiting()})())});
self.addEventListener('fetch',event=>{
 const request=event.request,target=new URL(request.url);if(request.method!=='GET'||target.origin!==root.origin||!target.pathname.startsWith(root.pathname))return;
 if(request.mode==='navigate'){event.respondWith((async()=>{const response=await(await caches.open(CACHE)).match(url('index.html'));return response||fetch(request)})());return}
 if(!/\.(?:js|css|glb|gltf)$/.test(target.pathname)||target.pathname.endsWith('/sw.js'))return;
 event.respondWith((async()=>{let build=target.searchParams.get('v');const ref=new URL(request.referrer||root),referenceBuild=ref.searchParams.get('v')||ref.searchParams.get('fep-build');if(!/^fep-[a-f0-9]{16}$/.test(build||'')&&/^fep-[a-f0-9]{16}$/.test(referenceBuild||''))build=referenceBuild;if(!/^fep-[a-f0-9]{16}$/.test(build||'')){const client=event.clientId?await self.clients.get(event.clientId):null;build=client?new URL(client.url).searchParams.get('fep-build'):BUILD}if(!/^fep-[a-f0-9]{16}$/.test(build||''))return new Response('No se pudo identificar la versión del recurso. Guarda y recarga.',{status:503});const cache=await caches.open(PREFIX+build);const response=await cache.match(target.origin+target.pathname);return response||new Response('Esta versión del recurso no está disponible. Guarda tu proyecto y recarga.',{status:503,headers:{'Content-Type':'text/plain'}})})());
});
