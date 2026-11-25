// Premium P7.1 — editable typography presets using the existing offline font.
// The selected preset never alters a layer until the user presses Add or Apply.
export const TEXT_STYLES=Object.freeze({
 headline:{label:'Título destacado',size:100,color:'#173149'},
 subtitle:{label:'Subtítulo',size:64,color:'#3b5268'},
 elegant:{label:'Dedicatoria',size:76,color:'#8b5069'},
 signature:{label:'Nombre y firma',size:48,color:'#48666b'}
});
export function initTextPresets({get}){
 const details=get('textTools'),body=details?.querySelector('.accordion-body');
 if(!body)return;
 const label=document.createElement('label');label.className='p7-type-presets';label.textContent='Estilo de texto';
 const select=document.createElement('select');select.id='p7TextStyle';select.setAttribute('aria-label','Estilo inicial de texto');
 select.append(new Option('Personalizado','custom'));
 for(const [id,style]of Object.entries(TEXT_STYLES))select.append(new Option(style.label,id));
 const hint=document.createElement('small');hint.textContent='Elige un estilo y pulsa Añadir texto o Aplicar al seleccionado. No modifica capas automáticamente.';
 label.append(select,hint);
 const input=get('textValue')?.closest('label');
 if(input)input.after(label);else body.prepend(label);
 select.addEventListener('change',()=>{
  const preset=TEXT_STYLES[select.value];
  if(!preset)return;
  get('fontSize').value=String(preset.size);
  get('textColor').value=preset.color;
 });
 for(const id of ['fontSize','textColor'])get(id)?.addEventListener('input',()=>{select.value='custom'});
 return select;
}
