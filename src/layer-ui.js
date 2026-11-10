// Layer presentation, reusing rows and small canvas thumbnails. Document actions
// stay in app.js; selecting or painting a thumbnail never modifies the design.
export function layerName(layer){return layer.type==='text'?(layer.text||'Texto vacío'):layer.type==='glitter'?'Glitter imprimible':layer.type==='sticker'?(layer.stickerName||'Sticker'):'Imagen'}
export function paintLayerThumbnail(canvas,layer,{image,tile,stickerPaint}={}){
 const ctx=canvas.getContext('2d'),size=48;canvas.width=canvas.height=size;
 for(let y=0;y<size;y+=8)for(let x=0;x<size;x+=8){ctx.fillStyle=(x/8+y/8)%2?'#dbe3e9':'#f5f8fb';ctx.fillRect(x,y,8,8)}
 ctx.save();ctx.globalAlpha=layer.opacity??1;
 if(layer.type==='sticker'&&stickerPaint){stickerPaint(ctx,{...layer,x:.5,y:.5,widthFrac:.9,heightFrac:.68,rotation:0,shadow:false},48,48)}
 else if(layer.type==='glitter'&&tile)ctx.drawImage(tile,0,0,size,size);
 else if(layer.type==='image'&&image?.naturalWidth){const scale=40/Math.max(image.naturalWidth,image.naturalHeight),w=image.naturalWidth*scale,h=image.naturalHeight*scale;ctx.drawImage(image,(size-w)/2,(size-h)/2,w,h)}
 else if(layer.type==='text'){ctx.fillStyle=layer.color||'#172b4d';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 14px sans-serif';const text=layer.text.slice(0,24);const width=ctx.measureText(text).width;ctx.font=`bold ${Math.min(18,14*40/Math.max(1,width))}px sans-serif`;ctx.fillText(text,24,24,44)}
 ctx.restore();
}
export function createLayerList({list,getImage,getGlitterTile,onSelect,onToggle,getStickerRenderer=()=>null}){
 const imageIDs=new WeakMap();let imageID=0,lastSelection=null,lastIndex=-1,pendingReveal=false;
 function revealSelection(){if(!pendingReveal||!list.clientHeight)return;const row=list.querySelector('[data-selected=true]');if(!row)return;const top=row.offsetTop-list.firstElementChild.offsetTop,bottom=top+row.offsetHeight;if(top<list.scrollTop)list.scrollTop=top;else if(bottom>list.scrollTop+list.clientHeight)list.scrollTop=bottom-list.clientHeight;pendingReveal=false;}
 if(typeof ResizeObserver==='function')new ResizeObserver(revealSelection).observe(list);else document.addEventListener('click',()=>{if(pendingReveal)requestAnimationFrame(revealSelection)});
 const svg=path=>`<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg>`;
 function newRow(){const row=document.createElement('div');row.className='layer-row';row.setAttribute('role','listitem');const select=document.createElement('button');select.className='layer-select';const thumb=document.createElement('canvas');thumb.setAttribute('aria-hidden','true');const copy=document.createElement('span');copy.className='layer-copy';copy.append(document.createElement('strong'),document.createElement('small'));select.append(thumb,copy);row.append(select);
 for(const [key,title,path]of [['visible','Visible','M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0'],['locked','Bloquear','M6 10h12v11H6zM8 10V6a4 4 0 0 1 8 0v4']]){const label=document.createElement('label');label.className='layer-toggle';label.title=title;const check=document.createElement('input');check.type='checkbox';check.dataset.key=key;label.append(check);label.insertAdjacentHTML('beforeend',svg(path));row.append(label)}return row}
 return function render(elements,selected){if(elements[selected]!==lastSelection||selected!==lastIndex){lastSelection=elements[selected];lastIndex=selected;pendingReveal=selected>=0;}while(list.children.length>elements.length)list.lastElementChild.remove();for(let position=0;position<elements.length;position++){
  const index=elements.length-1-position,layer=elements[index],row=list.children[position]||list.appendChild(newRow()),button=row.querySelector('button'),canvas=button.querySelector('canvas'),name=layerName(layer),image=layer.type==='image'?getImage(layer):null;
  if(image&&!imageIDs.has(image))imageIDs.set(image,++imageID);const signature=JSON.stringify({type:layer.type,text:layer.text,color:layer.color,opacity:layer.opacity,glitter:layer.glitter,sticker:layer.type==='sticker'?{id:layer.stickerId,fill:layer.color,outline:layer.outlineColor,line:layer.outlineWidth,label:layer.label,flipX:layer.flipX,flipY:layer.flipY}:null,image:image?imageIDs.get(image):0,width:image?.naturalWidth||0});
  if(row.dataset.preview!==signature){paintLayerThumbnail(canvas,layer,{image,tile:layer.type==='glitter'?getGlitterTile(layer.glitter):null,stickerPaint:getStickerRenderer()});row.dataset.preview=signature}
  row.dataset.selected=String(index===selected);row.dataset.visible=String(layer.visible!==false);button.setAttribute('aria-pressed',String(index===selected));button.setAttribute('aria-label','Seleccionar capa '+name);button.querySelector('strong').textContent=name;button.querySelector('small').textContent=(layer.type==='text'?'Texto':layer.type==='image'?'Imagen':layer.type==='sticker'?'Sticker vectorial':'Base imprimible')+(layer.locked?' · bloqueada':'');button.onclick=()=>onSelect(index);
  for(const input of row.querySelectorAll('input')){const key=input.dataset.key;input.checked=key==='visible'?layer.visible!==false:!!layer.locked;input.setAttribute('aria-label',(key==='visible'?'Visible ':'Bloquear ')+index);input.onchange=()=>onToggle(index,key,input.checked)}
 }if(pendingReveal)requestAnimationFrame(revealSelection);};
}
