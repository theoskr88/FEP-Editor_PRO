import {shapePaths,physicalPaths,vectorFromPhysical,booleanPaths,offsetPaths,textToPaths} from './vector.js?v=fase3e-20261110';
export function createVectorControls({state,commit,exportSVG,notify}){
 const get=id=>document.getElementById(id);let optionsKey='',lastLayer;
 const run=fn=>{try{fn()}catch(error){notify(error.message)}};
 const selected=()=>{const s=state(),e=s.elements[s.selected];if(!e||e.locked)throw Error('Selecciona una capa desbloqueada');return [s,e]};
 const clone=e=>JSON.parse(JSON.stringify(e));
 get('vectorConvert').onclick=()=>run(()=>{const [s,e]=selected();commit(vectorFromPhysical(physicalPaths(e,s.w,s.h),s.w,s.h,{color:e.color}),{hideOriginal:true});notify('Figura convertida en segmentos editables; original conservado oculto')});
 get('vectorText').onclick=()=>run(()=>{const [s,e]=selected();if(e.type!=='text')throw Error('Selecciona texto');commit(vectorFromPhysical(textToPaths(e,s.w,s.h,s.canvasWidth),s.w,s.h,{color:e.color,...(e.gradient?{gradient:{...e.gradient}}:{})}),{hideOriginal:true});notify('Texto convertido a contornos de FEP Outline Sans')});
 for(const button of document.querySelectorAll('[data-vector-op]'))button.onclick=()=>run(()=>{const s=state(),a=Number(get('vectorA').value),b=Number(get('vectorB').value);if(a===b||!s.elements[a]||!s.elements[b])throw Error('Elige dos operandos distintos');commit(vectorFromPhysical(booleanPaths(physicalPaths(s.elements[a],s.w,s.h),physicalPaths(s.elements[b],s.w,s.h),button.dataset.vectorOp),s.w,s.h,{color:s.elements[a].color}));notify('Resultado vectorial creado; operandos conservados')});
 get('vectorCreateCut').onclick=()=>run(()=>{const [s,e]=selected();commit(vectorFromPhysical(offsetPaths(physicalPaths(e,s.w,s.h),Number(get('vectorOffset').value)/10),s.w,s.h,{role:'cut',color:'#ff00aa'}));notify('Contorno creado: solo corte, excluido del PNG y del mockup')});
 function nodeSelection(){const [s,e]=selected();if(e.type!=='vector')throw Error('Selecciona un trazado editable');const ring=Math.max(0,Math.min(e.paths.length-1,Number(get('vectorRing').value)-1)),index=Math.max(0,Math.min(e.paths[ring].length-1,Number(get('vectorNode').value)-1));if(!Number.isInteger(ring)||!Number.isInteger(index))throw Error('Índice de nodo inválido');return{s,e,ring,index}}
 get('vectorApplyNode').onclick=()=>run(()=>{const {e,ring,index}=nodeSelection(),next=clone(e);next.paths[ring][index]=[Number(get('vectorNodeX').value),Number(get('vectorNodeY').value)];commit(next,{replace:true})});
 get('vectorAddNode').onclick=()=>run(()=>{const {e,ring,index}=nodeSelection(),next=clone(e),r=next.paths[ring],a=r[index],b=r[(index+1)%r.length];r.splice(index+1,0,[(a[0]+b[0])/2,(a[1]+b[1])/2]);commit(next,{replace:true})});
 get('vectorDeleteNode').onclick=()=>run(()=>{const {e,ring,index}=nodeSelection();if(e.paths[ring].length<=3)throw Error('Un contorno necesita al menos tres nodos');const next=clone(e);next.paths[ring].splice(index,1);commit(next,{replace:true})});
 get('vectorRole').onchange=()=>run(()=>{const [s,e]=selected();if(e.type!=='vector')throw Error('Selecciona un trazado');commit({...clone(e),role:get('vectorRole').value},{replace:true})});
 get('vectorRing').onchange=get('vectorNode').onchange=()=>{lastLayer=null;sync()};
 get('exportSVG').onclick=()=>run(()=>exportSVG(false));get('exportCutSVG').onclick=()=>run(()=>exportSVG(true));
 function sync(){const s=state(),e=s.elements[s.selected],active=e?.type==='vector';get('vectorNodeEdit').hidden=!active;
  const candidates=s.elements.map((e,i)=>({e,i})).filter(({e})=>['shape','vector'].includes(e.type)),key=candidates.map(({e,i})=>i+':'+e.type+':'+e.role).join('|');
  if(key!==optionsKey){optionsKey=key;for(const id of ['vectorA','vectorB']){const control=get(id),value=control.value;control.replaceChildren();for(const{e,i}of candidates){const option=document.createElement('option');option.value=i;option.textContent=`Capa ${i+1} · ${e.type==='shape'?'Figura':e.role==='cut'?'Corte':'Trazado'}`;control.append(option)}if([...control.options].some(o=>o.value===value))control.value=value;else if(id==='vectorB'&&candidates.length>1)control.value=candidates[1].i}if(candidates.length>1&&get('vectorA').value===get('vectorB').value)get('vectorB').value=candidates.find(c=>String(c.i)!==get('vectorA').value).i}
  get('vectorStatus').textContent=active?`${e.paths.length} contornos · ${e.paths.reduce((n,r)=>n+r.length,0)} nodos · ${e.role==='cut'?'solo corte':'imprimible'}`:'Selecciona una figura, texto o trazado';
  if(active&&e!==lastLayer){lastLayer=e;const ring=Math.max(0,Math.min(e.paths.length-1,Number(get('vectorRing').value)-1||0)),index=Math.max(0,Math.min(e.paths[ring].length-1,Number(get('vectorNode').value)-1||0));get('vectorRing').value=ring+1;get('vectorNode').value=index+1;get('vectorNodeX').value=e.paths[ring][index][0];get('vectorNodeY').value=e.paths[ring][index][1];get('vectorRole').value=e.role}else if(!active)lastLayer=null;
 }
 return{sync};
}
