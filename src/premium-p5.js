// Premium P5: presentation and release information only. Does not modify projects.
export function formatInstalledVersion(info,buildToken){
 const native=info&&typeof info==='object'&&typeof info.id==='string';
 return {
  platform:native?'Android':'Navegador',
  appId:native?info.id:'Versión web local',
  version:native?String(info.version||'No disponible'):'Versión web',
  build:native?String(info.build||'No disponible'):'No aplicable',
  assetBuild:typeof buildToken==='string'&&/^fep-[a-f0-9]{16}$/.test(buildToken)?buildToken:'No disponible'
 };
}
export function initPremiumP5({get,ui,notify}){
 const menu=get('projectMenu')?.querySelector('div');
 const aboutButton=document.createElement('button');
 aboutButton.type='button';aboutButton.id='p5AboutButton';aboutButton.textContent='Acerca de · versión y respaldo';
 menu?.append(aboutButton);

 const dialog=document.createElement('dialog');
 dialog.id='p5AboutDialog';dialog.className='p5-about-dialog';
 dialog.innerHTML='<div class="p5-dialog-top"><h2>FEP Editor PRO</h2><button type="button" id="p5AboutClose" aria-label="Cerrar">Cerrar</button></div><p>Premium P6 · revisión de auditoría</p><dl id="p5VersionFields"></dl><p class="p5-important">Los proyectos se guardan en este dispositivo. Antes de desinstalar o cambiar la firma de la APK, guarda una copia JSON y comprueba que se haya descargado.</p><div class="p5-dialog-actions"><button type="button" id="p5Backup">Guardar respaldo JSON</button><button type="button" id="p5Import">Restaurar desde JSON</button></div><p class="hint">El respaldo JSON corresponde al proyecto actual. Para respaldar varios proyectos, utiliza Exportar biblioteca ZIP desde Mis proyectos. No se han integrado pagos ni seguimiento en línea.</p>';
 document.body.append(dialog);
 const close=get('p5AboutClose'),backup=get('p5Backup'),restore=get('p5Import');
 close.onclick=()=>dialog.close();
 backup.onclick=()=>{dialog.close();get('save')?.click()};
 restore.onclick=()=>{dialog.close();get('load')?.click()};
 dialog.addEventListener('click',ev=>{if(ev.target===dialog)dialog.close()});
 aboutButton.onclick=async()=>{
  const rows=get('p5VersionFields');rows.replaceChildren();
  const buildToken=document.querySelector('meta[name="fep-build"]')?.content||'';
  let info;
  try{info=await window.FEP_NATIVE?.getAppInfo?.()}catch(error){notify('No se pudo leer la versión nativa: '+error.message)}
  const details=formatInstalledVersion(info,buildToken);
  for(const [label,value] of [['Plataforma',details.platform],['Versión instalada',details.version],['Compilación Android',details.build],['Identificador',details.appId],['Paquete de recursos',details.assetBuild]]){
   const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;rows.append(dt,dd);
  }
  if(!dialog.open)dialog.showModal();
 };
 const panel=get('panel-design'),heading=panel?.querySelector('.panel-heading');
 if(panel){
  const shortcuts=document.createElement('nav');shortcuts.id='p5QuickActions';shortcuts.className='p5-shortcuts';shortcuts.setAttribute('aria-label','Acciones rápidas de diseño');
  const entries=[
   ['Fotografía',()=>get('imageFile')?.click()],
   ['Texto',()=>{get('textTools').open=true;get('textValue')?.focus()}],
   ['Stickers',()=>{get('stickerTools').open=true;get('stickerLibrary').open=true;get('stickerSearch')?.focus()}],
   ['Plantillas',()=>{get('creativeTools').open=true;get('creativeTemplate')?.focus()}],
   ['Capas',()=>ui.activate?.('layers')]
  ];
  for(const [label,run] of entries){const button=document.createElement('button');button.type='button';button.textContent=label;button.onclick=run;shortcuts.append(button)}
  heading?.after(shortcuts);
 }
 return {aboutButton,dialog};
}
