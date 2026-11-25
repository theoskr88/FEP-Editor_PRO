// P8+P9 — Workflow refinements, using existing editor actions (no project schema changes).
// Safe for offline Android and desktop; never moves the WebGL canvas in the DOM.
export function initIntegratedWorkspace({get,notify}){
 const canvas=get('canvasPanel'),view=get('viewPanel'),workspace=document.querySelector('.editor-workspace');
 if(!canvas||!view||!workspace)return;
 const actions=document.createElement('div');actions.className='p89-view-actions';actions.setAttribute('aria-label','Modo de visualización');
 const modes=[['both','Diseño + 3D'],['design','Ampliar 2D'],['mockup','Ampliar 3D']];
 let mode='both';
 function setMode(next){
  if(!['both','design','mockup'].includes(next))return;
  // Never hide a product from the actual editor data or change selection/history.
  workspace.dataset.p89View=next;mode=next;
  for(const button of actions.querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.mode===next));
  // Focus modes only change presentation; never open tools or alter the document.
  if(next!=='both'&&get('toolsDock')?.dataset.open==='true')get('closeTools')?.click();
  window.__fepUI?.refresh?.();
  window.dispatchEvent(new Event('resize'));
 }
 for(const [id,label] of modes){const b=document.createElement('button');b.type='button';b.dataset.mode=id;b.className='p89-view-btn';b.textContent=label;b.setAttribute('aria-pressed',String(id==='both'));b.onclick=()=>setMode(id);actions.append(b)}
 // Buttons above the workspace avoid hiding a control behind the bottom drawer.
 const header=canvas.querySelector('.workspace-heading');
 header?.after(actions);
 const exit=document.createElement('button');exit.type='button';exit.className='p89-exit-focus';exit.textContent='Volver a diseño + 3D';exit.hidden=true;
 exit.onclick=()=>setMode('both');workspace.append(exit);
 const originalSetMode=setMode;
 function syncExit(){exit.hidden=mode==='both'}
 actions.addEventListener('click',syncExit);
 exit.addEventListener('click',syncExit);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&mode!=='both'){originalSetMode('both');syncExit()}});
 const focusButton=document.createElement('button');focusButton.type='button';focusButton.className='p89-focus-button';focusButton.textContent='Pantalla de trabajo';focusButton.title='Pantalla de trabajo: lienzo y mockup, sin paneles abiertos';
 focusButton.onclick=()=>{
  if(get('toolsDock')?.dataset.open==='true')get('closeTools')?.click();
  originalSetMode('both');syncExit();
  canvas.scrollIntoView({block:'start',behavior:'smooth'});
 };
 view.querySelector('.workspace-heading')?.append(focusButton);
 // Real-time visibility uses the already implemented resync3D on every edit.
 const status=document.createElement('p');status.className='p89-sync-hint';status.textContent='Edición y producto sincronizados en vivo · gira y amplía el modelo con los dedos.';
 view.querySelector('.workspace-heading')?.after(status);
 const camera=get('sceneCamera');
 const quick=document.createElement('div');quick.className='p89-camera-quick';quick.setAttribute('aria-label','Vistas rápidas del producto');
 const presets=[['front','Frente'],['hero','Tres cuartos'],['print','Área impresa'],['top','Superior']];
 for(const [id,label] of presets){
  const b=document.createElement('button');b.type='button';b.textContent=label;
  b.onclick=()=>{if(!camera)return;camera.value=id;camera.dispatchEvent(new Event('change',{bubbles:true}));get('viewPanel')?.scrollIntoView({block:'nearest',behavior:'smooth'})};
  quick.append(b);
 }
 get('panel-scene')?.querySelector('[data-p7-scene="camera"]')?.prepend(quick);
 const scenePreset=get('scenePreset');
 const scenePresets=document.createElement('div');scenePresets.className='p89-scene-presets';scenePresets.setAttribute('aria-label','Escenarios rápidos');
 for(const [id,label] of [['studio','Estudio blanco'],['premiumWarm','Cálido'],['premiumCool','Editorial'],['commercial','Comercial']]){
  const b=document.createElement('button');b.type='button';b.textContent=label;
  b.onclick=()=>{if(!scenePreset)return;scenePreset.value=id;scenePreset.dispatchEvent(new Event('change',{bubbles:true}))};
  scenePresets.append(b);
 }
  get('panel-scene')?.querySelector('[data-p7-scene="background"]')?.prepend(scenePresets);
 const studio=document.createElement('button');studio.type='button';studio.id='p89StudioReady';studio.className='p89-studio-btn';studio.textContent='Preparar foto comercial · Estudio Pro';
 studio.title='Iluminación suave, ángulo tres cuartos y captura HD; no altera el archivo de impresión';
 studio.onclick=()=>{
  const lighting=get('sceneLighting'),quality=get('scenePhotoWidth');
  if(scenePreset){scenePreset.value='premiumWarm';scenePreset.dispatchEvent(new Event('change',{bubbles:true}))}
  if(lighting){lighting.value='softbox';lighting.dispatchEvent(new Event('change',{bubbles:true}))}
  if(camera){camera.value='hero';camera.dispatchEvent(new Event('change',{bubbles:true}))}
  if(quality){quality.value='1920';quality.dispatchEvent(new Event('change',{bubbles:true}))}
  notify('Estudio Pro listo. Revisa el producto y exporta desde Escena → Exportar.');
 };
 get('panel-scene')?.querySelector('[data-p7-scene="background"]')?.prepend(studio);
 return {setMode};
}
