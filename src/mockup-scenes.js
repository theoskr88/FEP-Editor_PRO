// Original procedural sets. Geometry, texture and light share one 3D space.
export const COMMERCIAL_SCENES=['studio','table','marble','desk','cafe','textile','minimal','gradient'];
export function createSceneLibrary(THREE){
 const root=new THREE.Group();root.name='FEP Scene Library';let current='';const groups=new Map(),textures=new Map();
 function surface(kind){
  if(textures.has(kind))return textures.get(kind);
  // Materiales locales tipo PBR: grano irregular, variaciones tonales y vetas no repetitivas.
  // Eliminar patrón de cuadrícula y tonos grises que parecían plástico.
  const lowMemory=Number(navigator.deviceMemory||8)<=4;const n=navigator.maxTouchPoints?(lowMemory?256:384):768,c=document.createElement('canvas');c.width=c.height=n;
  const x=c.getContext('2d'),image=x.createImageData(n,n),d=image.data;
  const fract=v=>v-Math.floor(v),noise=(px,py)=>fract(Math.sin(px*127.1+py*311.7)*43758.5453123);
  for(let y=0;y<n;y++)for(let px=0;px<n;px++){
   const i=(y*n+px)*4,rx=px/n,ry=y/n,seed=noise(Math.floor(px/4),Math.floor(y/4)),fine=noise(px, y),grain=noise(Math.floor(px/2),Math.floor(y/2));
   let red,green,blue;
   if(kind==='wood'){
     const warp=Math.sin(rx*38+ry*4)*.024+Math.sin(rx*10+ry*11)*.025;
     const streak=Math.sin((ry+warp)*145+Math.sin(rx*17)*1.5);
     const knots=Math.exp(-Math.pow((rx-.34)*18,2)-Math.pow((ry-.56)*12,2));
     const plank=Math.sin(rx*Math.PI*4)>.985?-18:0;
     const v=streak*12+(seed-.5)*12+(fine-.5)*5-knots*24+plank;
     red=160+v;green=117+v*.82;blue=78+v*.67;
   }else if(kind==='marble'){
     const flow=ry+Math.sin(rx*7+ry*12)*.047+Math.sin(rx*24-ry*11)*.013;
     const vein=Math.pow(Math.max(0,1-Math.abs(Math.sin(flow*38+Math.sin(rx*8)*2))),16);
     const hair=Math.pow(Math.max(0,1-Math.abs(Math.sin(flow*115+rx*13))),35);
     const v=237-68*vein-21*hair+(seed-.5)*6+(fine-.5)*3;
     red=v+3;green=v+2;blue=v;
   }else{
     const strandX=Math.sin(px*1.52)*5,strandY=Math.sin(y*1.53)*5;
     const v=(fine-.5)*9+grain*3+strandX+strandY;
     red=213+v;green=198+v;blue=179+v;
   }
   d[i]=Math.max(0,Math.min(255,red));d[i+1]=Math.max(0,Math.min(255,green));d[i+2]=Math.max(0,Math.min(255,blue));d[i+3]=255;
  }
  x.putImageData(image,0,0);const t=new THREE.CanvasTexture(c);
  t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;
  t.repeat.set(kind==='fabric'?3:kind==='wood'?2:1.5,kind==='fabric'?3:kind==='wood'?2:1.5);
  t.anisotropy=4;textures.set(kind,t);return t;
 }
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(16,16),new THREE.MeshStandardMaterial({roughness:.8}));ground.name='Surface';ground.rotation.x=-Math.PI/2;root.add(ground);
 const shadow=new THREE.Mesh(new THREE.PlaneGeometry(16,16),new THREE.ShadowMaterial({color:'#18202a',opacity:.65,depthWrite:false}));shadow.name='Contact shadow';shadow.rotation.x=-Math.PI/2;shadow.position.y=.001;shadow.receiveShadow=true;root.add(shadow);
 // A round cyclorama surrounds the set, so camera rotation does not reveal a flat backdrop edge.
 const positions=[],colors=[],indices=[],segments=96,rows=24;
 for(let j=0;j<=rows;j++){const t=j/rows;let radius,y;if(t<.6){const a=t/.6*Math.PI/2;radius=6+2*Math.sin(a);y=2-2*Math.cos(a)}else{radius=8;y=2+(t-.6)/.4*6}for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2;positions.push(radius*Math.sin(a),y,radius*Math.cos(a));colors.push(1,1,1)}}
 for(let j=0;j<rows;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+1,c=a+segments+1,d=c+1;indices.push(a,c,b,b,c,d)}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setIndex(indices);geometry.computeVertexNormals();const cyc=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide}));cyc.name='Curved cyclorama';root.add(cyc);
 const matte=color=>new THREE.MeshStandardMaterial({color,roughness:.75});
 function mesh(group,geo,mat,x,y,z,rotation=0){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.y=rotation;group.add(m);return m}
 function vase(group,x,z){const profile=[[.13,0],[.2,.04],[.23,.28],[.16,.52],[.09,.58],[.09,.63],[.07,.64],[.07,.57],[.12,.51]];mesh(group,new THREE.LatheGeometry(profile.map(p=>new THREE.Vector2(...p)),32),matte('#d2b9a0'),x,0,z);for(let i=0;i<4;i++){const stem=mesh(group,new THREE.CylinderGeometry(.008,.01,.65,6),matte('#75846b'),x+(i-1.5)*.055,.89,z);stem.rotation.z=(i-1.5)*.16;const leaf=mesh(group,new THREE.SphereGeometry(.1,12,8),matte('#85967a'),x+(i-1.5)*.1,1.03,z);leaf.scale.set(.6,1.8,.25)}}
 function books(group,x,z){for(let i=0;i<3;i++){const m=mesh(group,new THREE.BoxGeometry(1.05,.12,.68),matte(['#849b9a','#e5dbcd','#526574'][i]),x,.06+i*.12,z,.05*(i-1));m.rotation.z=0}const pen=mesh(group,new THREE.CylinderGeometry(.025,.025,.9,12),matte('#3e4c5b'),x+.1,.4,z+.1);pen.rotation.z=Math.PI/2;pen.rotation.y=.3}
 function cup(group,x,z){mesh(group,new THREE.CylinderGeometry(.36,.32,.035,40),matte('#ede4d9'),x,.018,z);const profile=[[.11,0],[.17,.02],[.2,.32],[.2,.36],[.177,.36],[.173,.06],[.11,.04]];mesh(group,new THREE.LatheGeometry(profile.map(p=>new THREE.Vector2(...p)),40),matte('#e9dfd0'),x,.035,z);const handle=mesh(group,new THREE.TorusGeometry(.1,.026,8,32),matte('#e9dfd0'),x+.23,.23,z);handle.scale.x=.8;mesh(group,new THREE.CircleGeometry(.17,32),new THREE.MeshStandardMaterial({color:'#5b3824',roughness:.28}),x,.36,z).rotation.x=-Math.PI/2}
 function props(id){if(groups.has(id))return groups.get(id);const g=new THREE.Group();g.name='Set '+id;if(id==='desk'){books(g,-2.5,-1.4);vase(g,2.7,-2)}if(id==='cafe'){cup(g,2.5,-1.7);books(g,-2.7,-2)}if(id==='marble'||id==='commercial')vase(g,2.8,-1.7);if(id==='textile'){for(let i=0;i<3;i++){const mat=matte(['#cbb9a6','#8faaa5','#e4d6c5'][i]);mat.map=surface('fabric');mesh(g,new THREE.BoxGeometry(1.15,.13,.8),mat,-2.6,.065+i*.13,-1.5,i*.045)}const roll=mesh(g,new THREE.CylinderGeometry(.22,.22,.9,32),matte('#b9c4b8'),2.6,.23,-1.6);roll.rotation.z=Math.PI/2}if(id==='minimal')mesh(g,new THREE.CylinderGeometry(.55,.55,.35,48),matte('#d5d6d4'),2.7,.175,-2);if(id==='workshop'){mesh(g,new THREE.BoxGeometry(1.1,.75,.9),matte('#8b9a9e'),-2.8,.375,-2);books(g,2.6,-2)}root.add(g);groups.set(id,g);return g}
 function apply(s,model){root.visible=s.preset!=='original'&&!(s.backgroundPhotoEnabled&&s.backgroundPhoto);const box=model?new THREE.Box3().setFromObject(model):null;root.position.set(0,box&&Number.isFinite(box.min.y)?box.min.y-.006:-1.1,0);const kind=['table','cafe','workshop'].includes(s.preset)?'wood':s.preset==='marble'?'marble':s.preset==='textile'?'fabric':null;const map=kind?surface(kind):null;if(ground.material.map!==map){ground.material.map=map;ground.material.needsUpdate=true}ground.material.color.set(map?'#ffffff':s.floor);ground.material.roughness=s.preset==='marble'?.26:kind==='wood'?.68:.9;shadow.visible=s.shadows;shadow.material.opacity=s.shadowStrength;
  const bottom=new THREE.Color(s.floor),top=new THREE.Color(s.background),attribute=geometry.attributes.color;for(let j=0;j<=rows;j++){const blend=s.preset==='gradient'?Math.min(1,j/rows*1.5):Math.min(1,j/rows*3),color=bottom.clone().lerp(top,blend);for(let i=0;i<=segments;i++)attribute.setXYZ(j*(segments+1)+i,color.r,color.g,color.b)}attribute.needsUpdate=true;
  if(current!==s.preset){for(const g of groups.values())g.visible=false;// Escenarios comerciales: evitar accesorios geométricos falsos; protagonismo del producto y el material.
  props(s.preset).visible=s.preset==='minimal';current=s.preset}root.traverse(o=>{if(o.isMesh&&o!==ground&&o!==shadow){o.castShadow=s.shadows;o.receiveShadow=s.shadows}});return{floorY:root.position.y,scene:s.preset,props:groups.get(current)?.children.length||0}}
 return{root,apply,dispose(){root.traverse(o=>{o.geometry?.dispose();if(o.material)o.material.dispose()});for(const t of textures.values())t.dispose()}};
}
