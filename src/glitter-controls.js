import {glitterSettings,palettes,glitterPresets,applyGlitterPreset} from './glitter.js?v=fase2d-20261110';
export function createGlitterControls({get=id=>document.getElementById(id),preview,onMaterialChange=()=>{},onDraftChange=()=>{}}={}){
 let material=glitterSettings(),draft=glitterSettings(),mode='print';
 const ids=[['glitterPalette','palette'],['glitterColor','color'],['glitterSize','size'],['glitterIntensity','intensity'],['glitterFinish','finish']];
 const current=()=>({...(mode==='material'?material:draft)});
 function render(){const s=current();for(const [id,key]of ids)get(id).value=s[key];get('glitterMode').value=mode;get('glitterModeHint').textContent=mode==='material'?'Solo mockup 3D; el arte y las capas imprimibles quedan encima.':'Edita la miniatura y pulsa Aplicar a capa; el material del producto no cambia.';get('applyGlitterLayer').disabled=mode!=='print';get('glitterPreviewLabel').textContent=mode==='material'?'Glitter del producto (solo mockup)':'Glitter imprimible (capa)';for(const node of document.querySelectorAll('[data-glitter-preset]'))node.setAttribute('aria-pressed',String(node.dataset.glitterPreset===s.preset));const hint=get('glitterPresetHint');if(hint)hint.textContent=s.preset==='holographic'?(mode==='material'?'Interferencia de color aproximada en el material 3D.':'Simulación multicolor imprimible; no produce holografía física.'):s.preset?glitterPresets[s.preset].name+' · color y parámetros editables.':'Ajustes personalizados · aplica solo al destino seleccionado.';preview(s)}
 function setCurrent(value){if(mode==='material'){material=glitterSettings(value);onMaterialChange(material)}else{draft=glitterSettings(value);onDraftChange(draft)}render()}
 for(const [id,key]of ids){const node=get(id);node.addEventListener('input',()=>{const next={...current(),[key]:node.value};if(['size','intensity','finish'].includes(key)&&!['metallic','holographic'].includes(next.preset))delete next.preset;if(key==='color')next.palette='custom';if(key==='palette')next.color=palettes[node.value]||next.color;setCurrent(next)});node.addEventListener('change',()=>{const next={...current(),[key]:node.value};if(['size','intensity','finish'].includes(key)&&!['metallic','holographic'].includes(next.preset))delete next.preset;if(key==='color')next.palette='custom';if(key==='palette')next.color=palettes[node.value]||next.color;setCurrent(next)})}
 get('glitterMode').onchange=()=>{mode=get('glitterMode').value==='material'?'material':'print';render()};
 for(const button of document.querySelectorAll('[data-glitter-preset]'))button.onclick=()=>setCurrent(applyGlitterPreset(current(),button.dataset.glitterPreset));
 get('resetGlitter').onclick=()=>setCurrent(glitterSettings());
 render();
 return {
  current,material:()=>({...material}),draft:()=>({...draft}),mode:()=>mode,
  switchMode(value){mode=value==='material'?'material':'print';render()},
  selectLayer(value){mode='print';draft=glitterSettings(value);render()},
  restore(value){material=glitterSettings(value.material);draft=glitterSettings(value.draft??value.material);mode=value.mode==='material'?'material':'print';render();onMaterialChange(material)}
 };
}
