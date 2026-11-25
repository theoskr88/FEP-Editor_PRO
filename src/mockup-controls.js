import {createSceneLibrary} from './mockup-scenes.js?v=fep-6a4c2734f7b31778';
import {imageInfo} from './assets.js?v=fep-6a4c2734f7b31778';
import {normalizePhoto} from './photo-import-mobile.js?v=fep-6a4c2734f7b31778';
import {normalizeMockup,MOCKUP_PRESETS,CAMERA_PRESETS,LIGHT_STYLES,PREMIUM_FINISHES} from './mockup-settings.js?v=fep-6a4c2734f7b31778';
export function createMockupControls({state,context,patch,notify}){
 const get=id=>document.getElementById(id);let library,environment,pending,owner;const normalMaps=new Map(),floorMaps=new Map();let photoTexture=null,photoKey=null,photoRequest=0,photoPending=Promise.resolve();
 for(const[id,preset]of Object.entries(MOCKUP_PRESETS)){const old=[...get('scenePreset').options].find(o=>o.value===id);if(old)old.textContent=preset.name;else get('scenePreset').append(new Option(preset.name,id))}
 if(![...get('sceneCamera').options].some(o=>o.value==='print'))get('sceneCamera').append(new Option('Zona impresa','print'));
 for(const [id,label] of [['right','Lateral derecho'],['back','Posterior']]){
  if(![...get('sceneCamera').options].some(o=>o.value===id))get('sceneCamera').append(new Option(label,id));
 }
 const finishSelector=document.createElement('select');
 finishSelector.id='premiumFinish';finishSelector.setAttribute('aria-label','Acabado visual de los materiales 3D');
 for(const [id,finish] of Object.entries(PREMIUM_FINISHES))finishSelector.append(new Option(finish.name,id));
 const finishLabel=document.createElement('label');
 finishLabel.textContent='Acabado premium del producto';
 finishLabel.append(finishSelector);
 const materialBody=get('sceneTexture').closest('.accordion-body');
 if(materialBody)materialBody.prepend(finishLabel);
 const hint=document.createElement('p');hint.className='hint';
 hint.textContent='Solo cambia la apariencia del modelo 3D; no modifica los colores del diseño ni los archivos de impresión.';
 finishLabel.after(hint);
 finishSelector.onchange=()=>run(()=>patch({premiumFinish:finishSelector.value}));
 const pieces=document.createElement('div');pieces.className='control-card';
 const pieceTitle=document.createElement('h3');pieceTitle.textContent='Personalización por pieza · tazas';
 const pieceToggleLabel=document.createElement('label');pieceToggleLabel.className='check-line';
 const pieceToggle=document.createElement('input');pieceToggle.type='checkbox';pieceToggle.id='pieceColorsEnabled';
 pieceToggleLabel.append(pieceToggle,document.createTextNode(' Activar colores independientes'));
 const pieceInputs={};pieces.append(pieceTitle,pieceToggleLabel);
 for(const [key,label] of [['handle','Asa'],['rim','Borde'],['interior','Interior']]){
  const line=document.createElement('label');line.textContent=label;
  const input=document.createElement('input');input.type='color';input.id='pieceColor_'+key;
  pieceInputs[key]=input;line.append(input);pieces.append(line);
  input.oninput=()=>run(()=>patch({pieceColors:{...state().pieceColors,[key]:input.value}}));
 }
 const pieceHint=document.createElement('p');pieceHint.className='hint';
 pieceHint.textContent='Se aplica al modelo de taza, no a la imagen ni al archivo para impresión.';
 pieces.append(pieceHint);
 if(materialBody)materialBody.append(pieces);
 pieceToggle.onchange=()=>run(()=>patch({pieceColorsEnabled:pieceToggle.checked}));

 get('sceneLighting').onchange=()=>run(()=>{const style=get('sceneLighting').value;if(style==='custom')patch({lightStyle:style});else patch({...LIGHT_STYLES[style],lightStyle:style})});
 const run=fn=>{try{fn()}catch(error){notify(error.message)}};
 get('scenePreset').onchange=()=>run(()=>{const id=get('scenePreset').value,p=MOCKUP_PRESETS[id];patch({preset:id,lightStyle:'custom',background:p.background,floor:p.floor,key:p.key,fill:p.fill,ambient:p.ambient,exposure:1,shadows:id!=='original'})});
 const photoWrap=document.createElement('div');photoWrap.className='control-card';
 const photoTitle=document.createElement('h3');photoTitle.textContent='Fotografía de presentación';
 const photoFit=document.createElement('select');photoFit.id='scenePhotoFit';photoFit.setAttribute('aria-label','Ajuste de la fotografía de fondo');
 photoFit.append(new Option('Rellenar fondo · recortar','cover'),new Option('Mostrar fotografía completa','contain'));
 const photoFitLabel=document.createElement('label');photoFitLabel.textContent='Encuadre al importar (vuelve a cargar la foto para cambiarlo)';photoFitLabel.append(photoFit);
 const photoInput=document.createElement('input');photoInput.type='file';photoInput.accept='image/png,image/jpeg,image/webp';photoInput.id='sceneBackgroundPhoto';
 const photoLabel=document.createElement('label');photoLabel.textContent='Elegir fotografía del teléfono';photoLabel.append(photoInput);
 const photoEnabled=document.createElement('input');photoEnabled.type='checkbox';photoEnabled.id='scenePhotoEnabled';
 const photoEnabledLabel=document.createElement('label');photoEnabledLabel.className='check-line';photoEnabledLabel.append(photoEnabled,document.createTextNode(' Mostrar fotografía como fondo'));
 const photoClear=document.createElement('button');photoClear.type='button';photoClear.textContent='Quitar fotografía';photoClear.id='scenePhotoClear';
 const photoHint=document.createElement('p');photoHint.className='hint';
 photoHint.textContent='Solo aparece detrás del producto en el mockup 3D. No modifica el diseño que se imprime.';
 const photoPreview=document.createElement('img');photoPreview.id='scenePhotoPreview';photoPreview.className='p7-photo-preview';photoPreview.alt='Vista previa de la fotografía usada en el mockup';photoPreview.hidden=true;
 const photoStatus=document.createElement('p');photoStatus.id='scenePhotoStatus';photoStatus.className='hint';photoStatus.setAttribute('role','status');photoStatus.textContent='Todavía no hay una fotografía de fondo.';
 photoWrap.append(photoTitle,photoHint,photoFitLabel,photoLabel,photoPreview,photoStatus,photoEnabledLabel,photoClear);
 const backdropAnchor=get('sceneBackground').closest('label');
 if(backdropAnchor)backdropAnchor.after(photoWrap);
 photoFit.onchange=()=>run(()=>patch({backgroundPhotoFit:photoFit.value}));
 photoEnabled.onchange=()=>run(()=>patch({backgroundPhotoEnabled:photoEnabled.checked}));
 photoClear.onclick=()=>run(()=>{photoInput.value='';patch({backgroundPhoto:null,backgroundPhotoEnabled:false})});
 photoInput.onchange=async()=>{
  const file=photoInput.files?.[0];photoInput.value='';if(!file)return;
  try{
   // A phone photo can be 12–50+ MP. Normalize before strict decoding.
   // The original stays untouched; only a small local presentation JPEG is stored.
   photoStatus.textContent='Preparando fotografía para el mockup…';
   const prepared=await normalizePhoto(file);
   const info=imageInfo(new Uint8Array(await prepared.arrayBuffer()));
   if(info.pixels>4_000_000)throw Error('No se pudo reducir la fotografía a un tamaño seguro');
   const url=URL.createObjectURL(prepared);
   let img;
   try{img=new Image();img.src=url;await img.decode()}
   finally{URL.revokeObjectURL(url)}
   const width=1280,height=720,canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
   const ctx=canvas.getContext('2d');if(!ctx)throw Error('No se pudo preparar el fondo');
   const fit=photoFit.value==='contain'?'contain':'cover';
   const scale=(fit==='contain'?Math.min:Math.max)(width/img.naturalWidth,height/img.naturalHeight);
   const w=img.naturalWidth*scale,h=img.naturalHeight*scale;
   if(fit==='contain'){ctx.fillStyle=state().background;ctx.fillRect(0,0,width,height)}
   ctx.drawImage(img,(width-w)/2,(height-h)/2,w,h);
   const jpeg=canvas.toDataURL('image/jpeg',.77);canvas.width=canvas.height=1;img.src='';
   if(jpeg.length>2_500_000)throw Error('El fondo excede el límite de tamaño');
   patch({backgroundPhoto:jpeg,backgroundPhotoEnabled:true,backgroundPhotoFit:fit});
   photoStatus.textContent='Fotografía adaptada y aplicada al fondo del mockup. Revisa ahora el visor 3D.';
   notify('Foto de presentación aplicada: abre el visor 3D para comprobarla.');
  }catch(error){photoStatus.textContent='Error de fotografía: '+error.message;notify('No se pudo usar el fondo: '+error.message)}
 };

 for(const[id,key]of [['sceneBackground','background'],['sceneFloor','floor'],['sceneKey','key'],['sceneFill','fill'],['sceneAmbient','ambient'],['sceneExposure','exposure'],['sceneShadowStrength','shadowStrength'],['sceneShadowSoftness','shadowSoftness'],['sceneTexture','bodyTexture'],['sceneCamera','camera'],['scenePhotoWidth','photoWidth'],['sceneVideoFps','videoFps'],['sceneVideoSeconds','videoSeconds'],['sceneVideoHeight','videoHeight']])get(id).onchange=()=>run(()=>patch({...(['key','fill','ambient'].includes(key)?{lightStyle:'custom'}:{}),[key]:get(id).type==='range'||get(id).type==='number'||['photoWidth','videoFps','videoHeight'].includes(key)?Number(get(id).value):get(id).value},{camera:key==='camera'}));
 get('sceneShadows').onchange=()=>patch({shadows:get('sceneShadows').checked});get('sceneCustomSurface').onchange=()=>patch({roughness:get('sceneCustomSurface').checked?Number(get('sceneRoughness').value):null});get('sceneRoughness').onchange=()=>patch({roughness:Number(get('sceneRoughness').value)});
 get('viewerBackground').addEventListener('change',()=>patch({background:get('viewerBackground').value}));
 function texture(THREE,key,normal){const cache=normal?normalMaps:floorMaps;if(cache.has(key))return cache.get(key);const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),image=x.createImageData(128,128);for(let y=0;y<128;y++)for(let px=0;px<128;px++){const i=(y*128+px)*4,n=Math.sin(px*12.9898+y*78.233)*43758.5453,noise=(n-Math.floor(n)-.5);if(normal){const weave=key==='fabric'?Math.sin(px*Math.PI/4)*15:noise*12;image.data[i]=128+weave;image.data[i+1]=128+(key==='fabric'?Math.sin(y*Math.PI/4)*15:noise*9);image.data[i+2]=255}else{const wood=key==='table'?Math.sin(y*.4+px*.03)*12+noise*4:(px%32<2||y%32<2?-25:noise*5);image.data[i]=170+wood;image.data[i+1]=145+wood;image.data[i+2]=115+wood}image.data[i+3]=255}x.putImageData(image,0,0);const t=new THREE.CanvasTexture(c);if(!normal)t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(normal?4:3,normal?4:3);cache.set(key,t);return t}
 async function ensureEnvironment(){const c=context();if(environment||pending||!c.renderer)return pending;pending=(async()=>{try{get('sceneStatus').dataset.state='loading';get('sceneStatus').textContent='Preparando iluminación de estudio…';const {RoomEnvironment}=await import('../vendor/RoomEnvironment.js?v=fep-6a4c2734f7b31778');const generator=new c.THREE.PMREMGenerator(c.renderer),source=new RoomEnvironment();environment=generator.fromScene(source,.04).texture;source.dispose();generator.dispose();if(state().preset!=='original')c.scene.environment=environment;c.renderer.render(c.scene,c.camera);get('sceneStatus').dataset.state='ready';get('sceneStatus').textContent=state().preset==='original'?'Presentación original':'Escenario listo · materiales y sombras en vivo'}catch(error){get('sceneStatus').dataset.state='fallback';get('sceneStatus').textContent='Iluminación directa disponible; entorno de estudio no disponible'}finally{pending=null}})();return pending}
 function applyPhotoBackground(c,s,THREE){
  if(!s.backgroundPhotoEnabled||!s.backgroundPhoto){++photoRequest;photoKey=null;if(photoTexture){photoTexture.dispose();photoTexture=null}return;}
  if(photoKey===s.backgroundPhoto&&photoTexture){
   c.scene.background=photoTexture;return;
  }
  if(photoKey===s.backgroundPhoto)return; // photo is loading
  const id=++photoRequest,url=s.backgroundPhoto;
  photoKey=url;
  const previous=photoTexture;photoTexture=null;
  if(previous)previous.dispose();
  const textureLoader=new THREE.TextureLoader();
  photoPending=new Promise(resolve=>textureLoader.load(url,loaded=>{
   if(id!==photoRequest||!state().backgroundPhotoEnabled||state().backgroundPhoto!==url){loaded.dispose();resolve();return}
   loaded.colorSpace=THREE.SRGBColorSpace;
   photoTexture=loaded;
   if(c.scene===owner)c.scene.background=loaded;
   photoStatus.textContent='Fondo fotográfico activo en el visor 3D.';
   c.renderer.render(c.scene,c.camera);
   resolve();
  },undefined,()=>{
   if(id===photoRequest){photoKey=null;photoStatus.textContent='No se pudo renderizar la fotografía. Prueba con otro JPG.';notify('No se pudo cargar el fondo fotográfico; se conserva el color original')}
   resolve();
  }));
 }
 function sync(){const s=state();photoFit.value=s.backgroundPhotoFit;photoEnabled.checked=s.backgroundPhotoEnabled;
  photoPreview.hidden=!s.backgroundPhoto;if(photoPreview.getAttribute('src')!==(s.backgroundPhoto||''))photoPreview.src=s.backgroundPhoto||'';
  if(!s.backgroundPhoto)photoStatus.textContent='Todavía no hay una fotografía de fondo.';
  else if(!s.backgroundPhotoEnabled)photoStatus.textContent='Foto guardada pero desactivada: activa «Mostrar fotografía».';photoEnabled.disabled=!s.backgroundPhoto;photoClear.disabled=!s.backgroundPhoto;finishSelector.value=s.premiumFinish;
 pieceToggle.checked=s.pieceColorsEnabled;
 for(const [key,input] of Object.entries(pieceInputs)){input.value=s.pieceColors[key];input.disabled=!s.pieceColorsEnabled}
 const product=document.getElementById('product')?.value;
 pieces.hidden=!['mug','mug_enamel'].includes(product);
const values={scenePreset:s.preset,sceneLighting:s.lightStyle,sceneShadowStrength:s.shadowStrength,sceneShadowSoftness:s.shadowSoftness,sceneBackground:s.background,sceneFloor:s.floor,sceneKey:s.key,sceneFill:s.fill,sceneAmbient:s.ambient,sceneExposure:s.exposure,sceneTexture:s.bodyTexture,sceneCamera:s.camera,scenePhotoWidth:s.photoWidth,sceneVideoFps:s.videoFps,sceneVideoSeconds:s.videoSeconds,sceneVideoHeight:s.videoHeight,sceneRoughness:s.roughness??.5};for(const[id,value]of Object.entries(values))if(document.activeElement!==get(id))get(id).value=value;get('sceneShadows').checked=s.shadows;get('sceneCustomSurface').checked=s.roughness!==null;get('sceneRoughness').disabled=s.roughness===null;
  const selector=get('viewerBackground');if(![...selector.options].some(o=>o.value===s.background)){let option=selector.querySelector('[data-custom]');if(!option){option=document.createElement('option');option.dataset.custom='true';option.textContent='Personalizado';selector.append(option)}option.value=s.background}selector.value=s.background;
 }
 function refresh({camera=false}={}){
  sync();const c=context(),s=state(),THREE=c.THREE;if(!THREE||!c.scene||!c.renderer)return;
  if(owner!==c.scene){library?.dispose();owner=c.scene;library=createSceneLibrary(THREE);c.scene.add(library.root)}library.apply(s,c.modelRoot);
  const lights=c.scene.children.filter(o=>o.isLight),directional=lights.filter(o=>o.isDirectionalLight),ambient=lights.find(o=>o.isHemisphereLight);if(ambient)ambient.intensity=s.ambient;directional.forEach((light,i)=>{light.intensity=i?s.fill:s.key;light.castShadow=s.shadows&&i===0;light.shadow.mapSize.set(navigator.maxTouchPoints?1024:2048,navigator.maxTouchPoints?1024:2048);light.shadow.bias=-.00015;light.shadow.normalBias=.008;light.shadow.radius=s.shadowSoftness;light.shadow.camera.near=.1;light.shadow.camera.far=25;light.shadow.camera.updateProjectionMatrix()});c.renderer.shadowMap.enabled=s.shadows;c.renderer.shadowMap.type=THREE.PCFShadowMap;c.renderer.toneMapping=s.preset==='original'?(s.exposure===1?THREE.NoToneMapping:THREE.LinearToneMapping):THREE.ACESFilmicToneMapping;c.renderer.toneMappingExposure=s.exposure;c.scene.background=new THREE.Color(s.background);applyPhotoBackground(c,s,THREE);c.scene.environment=s.preset==='original'?null:environment||null;c.scene.environmentIntensity=.55;if(s.preset!=='original'){if(environment){get('sceneStatus').dataset.state='ready';get('sceneStatus').textContent='Escenario listo · materiales y sombras en vivo'}else ensureEnvironment()}else{get('sceneStatus').dataset.state='ready';get('sceneStatus').textContent='Presentación original'}
  c.modelRoot?.traverse(mesh=>{if(!mesh.isMesh)return;mesh.castShadow=s.shadows;mesh.receiveShadow=s.shadows;for(const m of(Array.isArray(mesh.material)?mesh.material:[mesh.material])){if(!m.isMeshStandardMaterial||m.userData.glitterSurface||m.map===c.texture||m.map===c.physicalArtTexture)continue;if(!m.userData.fepBase)m.userData.fepBase={roughness:m.roughness,metalness:m.metalness,normalMap:m.normalMap,normalScale:m.normalScale.clone()};const base=m.userData.fepBase,next=s.bodyTexture==='none'?base.normalMap:texture(THREE,s.bodyTexture,true);if(!!next!==!!m.normalMap)m.needsUpdate=true;m.normalMap=next;const finish=PREMIUM_FINISHES[s.premiumFinish]||PREMIUM_FINISHES.original;m.roughness=s.roughness??finish.roughness??base.roughness;m.metalness=finish.metalness??base.metalness;m.normalScale.copy(base.normalScale);if(s.bodyTexture!=='none')m.normalScale.setScalar(.12)}});
  if(camera){if(s.camera==='print'&&c.focusPrint)c.focusPrint();else c.camera.position.set(...CAMERA_PRESETS[s.camera]);c.controls.target.set(0,0,0);c.controls.update();c.fitView?.()}c.renderer.render(c.scene,c.camera);
 }
 return {refresh,sync,ready:()=>Promise.all([pending||Promise.resolve(),photoPending]).then(()=>{})};
}
