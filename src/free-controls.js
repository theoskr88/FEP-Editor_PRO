import {fromCm,toCm,pageSize,rulerTicks,SHAPE_NAMES} from './free-design.js?v=fase3c-20261110';
export function createFreeControls({state,settings,format,switchMode,insertShape,editShape,align,notify}){
 const get=id=>document.getElementById(id),dialog=get('startScreen');let guideSignature='',lastShape;
 function close(){dialog.close();document.getElementById('tab-product').focus()}
 get('openStart').onclick=()=>{get('startRecovery').textContent='Tu documento actual y sus capas se conservarán.';dialog.showModal()};
 get('resumeDesign').onclick=close;
 get('startProduct').onclick=()=>{switchMode('product');close()};get('startFree').onclick=()=>{switchMode('free');close()};
 dialog.addEventListener('cancel',()=>{});dialog.showModal();
 const apply=(fn)=>{try{fn()}catch(error){notify(error.message);sync()}};
 for(const[id,key]of [['pageUnit','unit'],['pageBackground','background'],['pageRulers','rulers'],['pageGrid','grid']])get(id).onchange=()=>apply(()=>settings({[key]:get(id).type==='checkbox'?get(id).checked:get(id).value}));
 get('pagePreset').onchange=()=>apply(()=>{const preset=get('pagePreset').value;if(preset==='custom')settings({preset});else format(pageSize(preset,get('pageOrientation').value),{preset})});
 get('pageOrientation').onchange=()=>apply(()=>{const {w,h}=state();format(get('pageOrientation').value==='landscape'?{w:Math.max(w,h),h:Math.min(w,h)}:{w:Math.min(w,h),h:Math.max(w,h)})});
 for(const[id,key]of [['pageWidth','w'],['pageHeight','h']])get(id).onchange=()=>apply(()=>{const s=state();format({w:s.w,h:s.h,[key]:toCm(Number(get(id).value),s.page.unit)},{preset:'custom'})});
 get('pageGridStep').onchange=()=>apply(()=>settings({gridStepCm:toCm(Number(get('pageGridStep').value),state().page.unit)}));
 const zoom=value=>settings({zoom:Math.max(25,Math.min(400,value))});get('pageZoom').oninput=()=>zoom(Number(get('pageZoom').value));get('pageZoomIn').onclick=()=>zoom(state().page.zoom+25);get('pageZoomOut').onclick=()=>zoom(state().page.zoom-25);get('pageZoomFit').onclick=()=>{zoom(100);get('canvasStage').scrollTo(0,0)};
 get('addPageGuide').onclick=()=>apply(()=>{const s=state();settings({guides:[...s.page.guides,{axis:get('guideAxis').value,cm:toCm(Number(get('guidePosition').value),s.page.unit)}]})});get('clearPageGuides').onclick=()=>settings({guides:[]});
 get('addShape').onclick=()=>insertShape(get('shapeKind').value,get('shapeColor').value);
 get('applyShape').onclick=()=>apply(()=>{const s=state();editShape({color:get('shapeColor').value,outlineColor:get('shapeOutline').value,outlineWidth:Number(get('shapeLine').value),rotation:Number(get('shapeRotation').value),widthFrac:Number(get('shapeWidth').value)/s.w,heightFrac:Number(get('shapeHeight').value)/s.h})});
 for(const b of document.querySelectorAll('[data-align]'))b.onclick=()=>align(b.dataset.align);
 function sync(){
  const s=state(),free=s.mode==='free',p=s.page;document.body.dataset.mode=s.mode;get('freePageTools').hidden=!free;get('pageZoomBar').hidden=!free;get('tab-product').querySelector('span').textContent=free?'Página':'Producto';
  get('resolution').textContent=free?`${Number(fromCm(s.w,p.unit).toFixed(3))} × ${Number(fromCm(s.h,p.unit).toFixed(3))} ${p.unit}`:`${s.w} × ${s.h} cm`;
  get('canvasPanel').querySelector('h2').textContent=free?'Diseño libre':'Diseño 2D';get('canvasPanel').querySelector('.workspace-caption').textContent=free?'Medidas reales · las ayudas visuales no se imprimen':'Arte limpio · el espejo se aplica solo al imprimir';
  for(const[id,value]of Object.entries({pagePreset:p.preset,pageUnit:p.unit,pageOrientation:s.w>s.h?'landscape':'portrait',pageWidth:Number(fromCm(s.w,p.unit).toFixed(5)),pageHeight:Number(fromCm(s.h,p.unit).toFixed(5)),pageBackground:p.background,pageGridStep:Number(fromCm(p.gridStepCm,p.unit).toFixed(5)),pageZoom:p.zoom})){if(document.activeElement!==get(id))get(id).value=value}
  get('pageGrid').checked=p.grid;get('pageRulers').checked=p.rulers;get('pageZoomValue').textContent=p.zoom+' %';
  const signature=JSON.stringify([p.guides,p.unit]);if(signature!==guideSignature){guideSignature=signature;const list=get('pageGuideList');list.replaceChildren();p.guides.forEach((g,i)=>{const button=document.createElement('button');button.type='button';button.textContent=`${g.axis==='x'?'Vertical':'Horizontal'} · ${Number(fromCm(g.cm,p.unit).toFixed(3))} ${p.unit} · eliminar`;button.onclick=()=>settings({guides:state().page.guides.filter((_,index)=>index!==i)});list.append(button)})}
  const layer=s.selected,shape=layer?.type==='shape';get('shapeEdit').hidden=!shape;get('applyShape').disabled=!!layer?.locked;
  if(shape&&layer!==lastShape){lastShape=layer;for(const[id,value]of Object.entries({shapeKind:layer.shape,shapeColor:layer.color,shapeOutline:layer.outlineColor,shapeLine:layer.outlineWidth,shapeRotation:layer.rotation,shapeWidth:Number((layer.widthFrac*s.w).toFixed(3)),shapeHeight:Number((layer.heightFrac*s.h).toFixed(3))}))get(id).value=value}else if(!shape)lastShape=null;
  renderOverlay();
 }
 function renderOverlay(){
  const s=state(),p=s.page,free=s.mode==='free',overlay=get('pageOverlay'),rx=get('pageRulerX'),ry=get('pageRulerY'),wrap=get('canvasWrap'),width=wrap.clientWidth,height=wrap.clientHeight;overlay.toggleAttribute('hidden',!free);rx.toggleAttribute('hidden',!free||!p.rulers);ry.toggleAttribute('hidden',!free||!p.rulers);if(!free||!width||!height)return;
  overlay.setAttribute('viewBox',`0 0 ${width} ${height}`);const lines=[];
  if(p.grid){for(let v=p.gridStepCm;v<s.w;v+=p.gridStepCm)lines.push(`<path d="M${v/s.w*width} 0V${height}"/>`);for(let v=p.gridStepCm;v<s.h;v+=p.gridStepCm)lines.push(`<path d="M0 ${v/s.h*height}H${width}"/>`)}
  const guides=p.guides.map(g=>g.axis==='x'?`<path d="M${g.cm/s.w*width} 0V${height}"/>`:`<path d="M0 ${g.cm/s.h*height}H${width}"/>`).join('');overlay.innerHTML=`<g stroke="#357695" stroke-opacity=".3" stroke-width=".6">${lines.join('')}</g><g stroke="#e865b6" stroke-width="1" stroke-dasharray="5 3">${guides}</g>`;
  rx.setAttribute('viewBox',`0 0 ${width} 22`);ry.setAttribute('viewBox',`0 0 30 ${height}`);
  rx.innerHTML=rulerTicks(s.w,p.unit,width).map(t=>`<path d="M${t.fraction*width} 17V22" stroke="#9ac4dd"/><text x="${t.fraction*width+2}" y="12" fill="#d3e7f4" font-size="10">${t.value}</text>`).join('');
  ry.innerHTML=rulerTicks(s.h,p.unit,height).map(t=>`<path d="M25 ${t.fraction*height}H30" stroke="#9ac4dd"/><text x="2" y="${t.fraction*height+11}" fill="#d3e7f4" font-size="9">${t.value}</text>`).join('');
 }
 window.__fepPageOverlay=renderOverlay;
 return {sync,ready(){get('startRecovery').textContent=state().storageFailed?'El guardado o la recuperación local no está disponible. Continúa para abrir un JSON o revisar el respaldo, si está disponible.':state().hasLayers?'Se recuperó el documento. Puedes continuarlo o cambiar de modo conservando sus capas.':'Elige un modo para empezar.'},renderOverlay};
}
