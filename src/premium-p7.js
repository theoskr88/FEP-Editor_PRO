// P7 — Mobile-first presentation only; reuses the proven editor inputs and actions.
const make=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text)el.textContent=text;return el};
export function initPremiumP7({get,notify}){
 const panel=get('panel-scene');
 if(!panel)return;
 const heading=panel.querySelector('.panel-heading');
 const tabs=make('div','p7-scene-tabs');tabs.id='p7SceneTabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Herramientas del mockup');
 const sections={};
 const definitions=[['background','Fondo'],['camera','Vistas'],['export','Exportar'],['advanced','Avanzado']];
 for(const [key,label] of definitions){
   const section=make('section','p7-scene-section');section.id='p7Scene'+key;
   section.dataset.p7Scene=key;section.hidden=key!=='background';
   sections[key]=section;
   const button=make('button','p7-scene-tab',label);button.type='button';button.dataset.sceneTab=key;button.setAttribute('role','tab');button.setAttribute('aria-selected',String(key==='background'));
   button.setAttribute('aria-controls',section.id);button.tabIndex=key==='background'?0:-1;
   button.addEventListener('click',()=>show(key));
   tabs.append(button);
 }
 function show(key){
   for(const [id,section] of Object.entries(sections))section.hidden=id!==key;
   for(const button of tabs.querySelectorAll('button')){const active=button.dataset.sceneTab===key;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1}
   panel.scrollTop=0;
 }
 tabs.addEventListener('keydown',e=>{
   if(!['ArrowRight','ArrowLeft'].includes(e.key))return;
   const nodes=[...tabs.querySelectorAll('button')],i=nodes.indexOf(document.activeElement);
   if(i<0)return;e.preventDefault();const next=nodes[(i+(e.key==='ArrowRight'?1:-1)+nodes.length)%nodes.length];next.focus();show(next.dataset.sceneTab);
 });
 // Relocate existing elements rather than cloning them: all handlers and state stay intact.
 const photo=get('sceneBackgroundPhoto')?.closest('.control-card');
 const background=get('viewerBackground')?.closest('.control-card');
 const preset=get('scenePreset')?.closest('label');
 const visualTip=make('p','p7-scene-explainer','La fotografía queda detrás del producto en el mockup. El archivo imprimible permanece limpio.');
 sections.background.append(visualTip);
 if(photo)sections.background.append(photo);
 if(preset)sections.background.append(preset);
 if(background)sections.background.append(background);
 const cameraTools=get('cameraTools');
 const instructions=cameraTools?.nextElementSibling?.nextElementSibling;
 if(cameraTools){cameraTools.open=true;sections.camera.append(cameraTools)}
 const cameraChoice=get('sceneCamera')?.closest('label');
 if(cameraChoice)sections.camera.append(cameraChoice);
 const capture=get('exportMockup')?.closest('.control-card');
 if(capture)sections.export.append(capture);
 const exportOptions=get('sceneExport');
 if(exportOptions){exportOptions.open=false;sections.export.append(exportOptions)}
 const advanced=get('mockupTools');
 if(advanced){advanced.open=true;sections.advanced.append(advanced)}
 const guideInfo=get('sceneStatus');
 if(guideInfo)sections.advanced.append(guideInfo);
 if(instructions?.classList?.contains('hint'))sections.camera.append(instructions);
 if(heading)heading.after(tabs);else panel.prepend(tabs);
 for(const [key] of definitions)panel.append(sections[key]);
 // Preserve old floating-panel controls; only the scene tool content is grouped.
 // A stable link allows users to jump to the actual photograph background flow.
 const jump=get('p6FloatToggle');
 if(jump){jump.textContent='Vista 3D';jump.title='Mostrar u ocultar el mini visor tridimensional'}
 const appHeading=document.querySelector('.brand small');
 if(appHeading)appHeading.textContent='DISEÑO Y SUBLIMACIÓN';
 const saveStatus=get('autosaveStatus');
 if(saveStatus)saveStatus.setAttribute('aria-label','Estado de guardado del proyecto');
 return {show};
}
