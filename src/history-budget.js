// Only disposable undo snapshots are evicted. Current documents are never trimmed.
export function trimUndoMemory({documents=[],buckets=[],maxPerBucket=40,maxSnapshots=80,maxPixels=32_000_000,maxNodes=1_000_000}){
 const queues=[...new Set(buckets)].filter(Boolean),current=[...new Set(documents)].filter(Boolean);let removed=0;
 for(const q of queues)while(q.length>maxPerBucket){q.shift();removed++}
 const measure=()=>{const images=new Set();let pixels=0,nodes=0;for(const list of [...current,...queues.flat()])for(const e of list){if(e.img&&!images.has(e.data)){images.add(e.data);pixels+=e.img.naturalWidth*e.img.naturalHeight}for(const path of e.paths||[])nodes+=path.length}return{pixels,nodes,snapshots:queues.reduce((n,q)=>n+q.length,0)}};
 let usage=measure();while(usage.snapshots>maxSnapshots||usage.pixels>maxPixels||usage.nodes>maxNodes){const q=queues.filter(q=>q.length).sort((a,b)=>b.length-a.length)[0];if(!q)break;q.shift();removed++;usage=measure()}return{removed,...usage};
}
