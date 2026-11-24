import {packSheets,printQuality,printSettings,readPrintDpi,PRINT_LIMITS} from './src/print-layout.js?v=fep-6a4c2734f7b31778';
import {pdfPrintJob} from './src/print-pdf.js?v=fep-6a4c2734f7b31778';
import {imageInfo} from './src/assets.js?v=fep-6a4c2734f7b31778';
/* Plancha de impresión — V0.9.0, independiente del visor 3D. */
const el=id=>document.getElementById(id);
const sheetPixelLimit=()=>window.FEP_NATIVE?.isNative?4_000_000:40_000_000;
const maxImagePixels=()=>window.FEP_NATIVE?.isNative?16_000_000:PRINT_LIMITS.totalImagePixels;
function sheetDpi(w,h){
 const pixelsAt300=w*h/(2.54*2.54)*90000;
 let dpi=Math.min(300,Math.floor(300*Math.sqrt(sheetPixelLimit()/pixelsAt300)));
 while(dpi>0&&Math.round(w/2.54*dpi)*Math.round(h/2.54*dpi)>sheetPixelLimit())dpi--;
 if(dpi<90)throw Error('La hoja supera el límite seguro de exportación en este dispositivo');
 return dpi;
}
const presets={A4:[21,29.7],Carta:[21.59,27.94],Oficio:[21.6,33],A3:[29.7,42],A2:[42,59.4]};
let items=[],selected=-1,drag=null,objectCount=0,previewScale=1,currentPage=0,exportBusy=false,disabledBefore=[];
const preview=el('sheetPreview'),pc=preview.getContext('2d');
const fmt=n=>Number(n.toFixed(2)).toLocaleString('es-CL');
const num=(id,fallback=0)=>Number.isFinite(Number(el(id).value))?Number(el(id).value):fallback;
const dims=()=>({w:num('sheetPageW',21),h:num('sheetPageH',29.7),margin:num('sheetMargin',.5),gap:num('sheetGap',.3),bleed:num('sheetBleed',0)/10,marks:el('sheetMarks').checked,rotate:el('sheetAutoRotate').checked});
const msg=(m,isError=false)=>{el('sheetStatus').textContent=m;el('sheetStatus').className='sheet-help '+(isError?'sheet-bad':'sheet-good')};
function photo(blob,name,w,h){return new Promise((resolve,reject)=>{
 const url=URL.createObjectURL(blob),im=new Image();
 im.onload=()=>resolve({img:im,url,name,x:0,y:0,w,h,page:currentPage,id:++objectCount});
 im.onerror=()=>{URL.revokeObjectURL(url);reject(Error('No se pudo abrir la imagen'))};im.src=url;
});}
function findSpace(item){const settings=printSettings(dims()),{margin,pad,gap,w,h}=settings;
 const others=items.filter(i=>i!==item&&(i.page||0)===currentPage);const xs=[margin+pad,...others.map(v=>v.x+v.w+2*pad+gap)],ys=[margin+pad,...others.map(v=>v.y+v.h+2*pad+gap)];
 for(const y of ys.sort((a,b)=>a-b))for(const x of xs.sort((a,b)=>a-b)){if(x+item.w+pad>w-margin+1e-6||y+item.h+pad>h-margin+1e-6)continue;const v={...item,x,y,page:currentPage};if(!printQuality([...others,v],settings).errors.length)return{x,y}}
 return{x:margin+pad,y:h+pad};}
function selectItem(i){selected=i;const item=items[i];el('sheetSelectedName').textContent=item?item.name:'Ninguna';
 for(const [field,key] of [['sheetX','x'],['sheetY','y'],['sheetW','w'],['sheetH','h']]){el(field).disabled=!item;el(field).value=item?Number(item[key].toFixed(4)):'';}
 for(const id of ['sheetDuplicate','sheetCopiesAdd','sheetRotate','sheetRemove'])el(id).disabled=!item;
 draw();}
function addItem(item){const unique=new Map(items.map(v=>[v.url,v.img.naturalWidth*v.img.naturalHeight]));if([...unique.values()].reduce((a,b)=>a+b,0)+item.img.naturalWidth*item.img.naturalHeight>maxImagePixels()){URL.revokeObjectURL(item.url);throw Error('El trabajo supera el límite seguro de imágenes de este dispositivo')}if(items.length>=PRINT_LIMITS.items){URL.revokeObjectURL(item.url);throw Error('Máximo 500 piezas por trabajo')}let position;try{position=findSpace(item)}catch(e){URL.revokeObjectURL(item.url);throw e}item.x=position.x;item.y=position.y;items.push(item);selectItem(items.length-1);
 const {w,h}=dims();if(item.x+item.w>w||item.y+item.h>h)msg('La pieza no cabe en esta hoja: usa un papel mayor u organiza las piezas.',true);else msg('Pieza añadida a la plancha: '+item.name);}
function paint(out,drawSelection=false,page=currentPage){const {w,h,margin,bleed,marks}=dims();const sx=out.canvas.width/w,sy=out.canvas.height/h;
 out.fillStyle='#ffffff';out.fillRect(0,0,out.canvas.width,out.canvas.height);
 if(drawSelection){out.strokeStyle='#d0d8df';out.lineWidth=1;out.setLineDash([5,5]);out.strokeRect(margin*sx,margin*sy,(w-2*margin)*sx,(h-2*margin)*sy);out.setLineDash([])}
 for(let i=0;i<items.length;i++){const v=items[i];if((v.page||0)!==page)continue;out.save();out.scale(sx,sy);out.translate(v.x+v.w/2,v.y+v.h/2);out.rotate((v.turns||0)*Math.PI/2);const odd=(v.turns||0)%2,lw=odd?v.h:v.w,lh=odd?v.w:v.h,iw=v.img.naturalWidth,ih=v.img.naturalHeight;
   // Extend border pixels outwards: core artwork keeps its original physical size.
   if(bleed>0){const xs=[[-lw/2-bleed,bleed,0,1],[-lw/2,lw,0,iw],[lw/2,bleed,iw-1,1]],ys=[[-lh/2-bleed,bleed,0,1],[-lh/2,lh,0,ih],[lh/2,bleed,ih-1,1]];for(let xi=0;xi<3;xi++)for(let yi=0;yi<3;yi++){if(xi===1&&yi===1)continue;const x=xs[xi],y=ys[yi];out.drawImage(v.img,x[2],y[2],x[3],y[3],x[0],y[0],x[1],y[1])}}
   out.drawImage(v.img,-lw/2,-lh/2,lw,lh);out.restore();
   if(marks){out.save();out.scale(sx,sy);out.strokeStyle='#000000';out.lineWidth=.02;out.lineCap='butt';out.beginPath();for(const x of[v.x,v.x+v.w])for(const y of[v.y,v.y+v.h]){const dx=x===v.x?-1:1,dy=y===v.y?-1:1;out.moveTo(x+dx*(bleed+.1),y);out.lineTo(x+dx*(bleed+.4),y);out.moveTo(x,y+dy*(bleed+.1));out.lineTo(x,y+dy*(bleed+.4))}out.stroke();out.restore()}
   if(drawSelection){out.strokeStyle=i===selected?'#0e9daa':'#c1cbdd';out.lineWidth=i===selected?3:1;out.strokeRect(v.x*sx,v.y*sy,v.w*sx,v.h*sy)}
 }

}
function draw(){const {w,h}=dims();try{printSettings(dims())}catch(e){msg(e.message,true);el('sheetQuality').textContent=e.message;el('sheetQualityPanel').querySelector('summary').textContent='Verificación · error de medidas';return;}const pages=Math.max(1,...items.map(v=>(v.page||0)+1));currentPage=Math.min(currentPage,pages-1);const pageSelect=el('sheetPage');pageSelect.replaceChildren(...Array.from({length:pages},(_,i)=>new Option(`Hoja ${i+1} de ${pages}`,i)));pageSelect.value=currentPage;
 const max=950;previewScale=Math.min(max/w,max/h);preview.width=Math.max(1,Math.round(w*previewScale));preview.height=Math.max(1,Math.round(h*previewScale));paint(pc,true);
 el('sheetDimensions').textContent=`${fmt(w)} × ${fmt(h)} cm · ${items.length} pieza(s) · resolución adaptativa (verifica exportación)`;const quality=printQuality(items,dims());el('sheetQualityPanel').querySelector('summary').textContent=`Verificación · ${quality.errors.length} error(es) · ${quality.warnings.length} aviso(s)`;el('sheetQualityPanel').dataset.state=quality.errors.length?'error':quality.warnings.length?'warning':'ready';el('sheetQuality').replaceChildren(...[...quality.errors,...quality.warnings].slice(0,30).map(text=>{const n=document.createElement('p');n.textContent=text;return n}));if(!quality.errors.length&&!quality.warnings.length)el('sheetQuality').textContent='Medidas y separación correctas · resolución de origen ≥ 300 ppp.';
}
function checkExport(){const quality=printQuality(items,dims());if(quality.errors.length){msg(quality.errors[0],true);return false}return true}
function fullCanvas(page=currentPage){
 const {w,h}=printSettings(dims()),dpi=sheetDpi(w,h),W=Math.round(w/2.54*dpi),H=Math.round(h/2.54*dpi);
 if(W*H>sheetPixelLimit())throw Error('La hoja supera el límite seguro de píxeles del dispositivo');
 const normal=document.createElement('canvas');normal.width=W;normal.height=H;
 try {
  const ctx=normal.getContext('2d',{willReadFrequently:true});
  if(!ctx)throw Error('No se pudo preparar el lienzo de impresión');
  paint(ctx,false,page);
  if(!el('sheetMirrorMode').checked)return {canvas:normal,dpi};
  const reflected=document.createElement('canvas');reflected.width=W;reflected.height=H;
  try {
   const x=reflected.getContext('2d',{willReadFrequently:true});
   if(!x)throw Error('No se pudo preparar el espejo de impresión');
   x.translate(W,0);x.scale(-1,1);x.drawImage(normal,0,0);
   return {canvas:reflected,dpi};
  }catch(e){reflected.width=reflected.height=1;throw e}
 }finally{
  if(el('sheetMirrorMode').checked)normal.width=normal.height=1;
 }
}
function download(blob,name){
 const api=window.__estudioPrintAPI;
 if(!api)throw Error('El editor todavía no terminó de cargar');
 return api.saveBlob(blob,name);
}
const blob=(c,type,quality)=>new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(Error('No pudo generarse el archivo')),type,quality));
async function exportFile(type){
 if(exportBusy||!checkExport())return;exportBusy=true;setExportButtons(true);
 let c=null;
 try{
  const api=window.__estudioPrintAPI,{w,h}=dims(),dpi=sheetDpi(w,h),base=`plancha_${w}x${h}cm_${dpi}ppp_${el('sheetMirrorMode').checked?'espejo':'normal'}`;
  let saved=false;
  if(type==='job'){
   const pages=[],count=Math.max(1,...items.map(v=>(v.page||0)+1));
   let bytes=0;
   for(let page=0;page<count;page++){
    const rendered=fullCanvas(page),pageCanvas=rendered.canvas;
    try{
     const jpeg=new Uint8Array(await (await blob(pageCanvas,'image/jpeg',.97)).arrayBuffer());
     bytes+=jpeg.byteLength;
     if(bytes>100e6)throw Error('El PDF supera 100 MB');
     pages.push({jpeg,width:pageCanvas.width,height:pageCanvas.height});
    }finally{pageCanvas.width=pageCanvas.height=1}
    msg(`Preparando PDF · hoja ${page+1}`);
    await new Promise(r=>setTimeout(r,0));
   }
   saved=await download(pdfPrintJob(pages,w,h),base+'_trabajo.pdf');
  }else{
   c=fullCanvas().canvas;
   if(type==='png'){
    const raw=await blob(c,'image/png');
    saved=await download(api.pngWithDpi(await raw.arrayBuffer(),dpi),base+'.png');
   }else if(type==='jpg'){
    const raw=await blob(c,'image/jpeg',.97);
    saved=await download(api.jpegWithDpi(await raw.arrayBuffer(),dpi),base+'.jpg');
   }else if(type==='pdf'){
    saved=await download(await api.pdfAtPhysicalSize(c,w,h),base+'.pdf');
   }else throw Error('Formato desconocido');
  }
  if(saved)msg(`Plancha guardada: ${w} × ${h} cm a ${dpi} ppp. Para imprimir usa escala 100 %.`);
  else msg('Guardado cancelado. No se creó un archivo.',true);
 }catch(e){msg('No se pudo exportar: '+e.message,true)}
 finally{if(c)c.width=c.height=1;exportBusy=false;setExportButtons(false)}
}
function setExportButtons(busy){if(busy){disabledBefore=[...el('sheetOverlay').querySelectorAll('input,select,button')].map(node=>[node,node.disabled]);for(const [node]of disabledBefore)node.disabled=true}else{for(const [node,disabled]of disabledBefore)node.disabled=disabled;disabledBefore=[]}}
async function addExternal(file){if(file.size>25*1024*1024)throw Error('El archivo supera 25 MB');const bytes=await file.arrayBuffer(),info=imageInfo(bytes,{side:11812,pixels:PRINT_LIMITS.pixels});if(info.type!==file.type)throw Error('El contenido de la imagen no coincide con su formato');const unique=new Map(items.map(v=>[v.url,v.img.naturalWidth*v.img.naturalHeight]));if([...unique.values()].reduce((a,b)=>a+b,0)+info.pixels>maxImagePixels())throw Error('El trabajo supera el límite seguro de imágenes');const declared=readPrintDpi(bytes,file.type),dpi=declared||{x:300,y:300};
 const obj=await photo(file,file.name,info.width/dpi.x*2.54,info.height/dpi.y*2.54);obj.assumedDpi=!declared;if(obj.img.naturalWidth===info.height&&obj.img.naturalHeight===info.width&&info.width!==info.height)[obj.w,obj.h]=[obj.h,obj.w];addItem(obj);if(obj.assumedDpi)msg('Imagen sin resolución física declarada: se asumieron 300 ppp. Verifica sus cm.',true);}
// Un arte actual se incorpora directamente desde el editor original y conserva tamaño físico.
el('sheetAddCurrent').onclick=async()=>{try{const api=window.__estudioPrintAPI;if(!api)throw Error('Aún no está listo el editor');const {w,h}=api.cmPrint();const art=api.renderToExportCanvas();const b=await blob(art,'image/png');addItem(await photo(b,`Diseño actual ${w} × ${h} cm`,w,h));}catch(e){msg(e.message,true)}};
el('sheetImport').onclick=()=>el('sheetImportInput').click();
el('sheetImportInput').onchange=async e=>{for(const f of e.target.files||[]){if(!['image/png','image/jpeg'].includes(f.type)){msg('Solo se admiten PNG y JPEG',true);continue}try{await addExternal(f)}catch(err){msg(err.message,true)}}e.target.value=''};
el('openPrintSheet').onclick=()=>{el('sheetOverlay').hidden=false;document.body.style.overflow='hidden';draw()};
el('sheetClose').onclick=()=>{el('sheetOverlay').hidden=true;document.body.style.overflow='';};
el('sheetPaper').onchange=()=>{const v=el('sheetPaper').value;if(v!=='Personalizado'){let [w,h]=presets[v];if(el('sheetOrientation').value==='landscape')[w,h]=[h,w];el('sheetPageW').value=w;el('sheetPageH').value=h;}draw()};
el('sheetOrientation').onchange=()=>{const w=el('sheetPageW').value;el('sheetPageW').value=el('sheetPageH').value;el('sheetPageH').value=w;draw()};
for(const id of ['sheetPageW','sheetPageH','sheetMargin','sheetGap','sheetBleed','sheetMarks','sheetAutoRotate'])el(id).onchange=()=>{if(id==='sheetPageW'||id==='sheetPageH')el('sheetPaper').value='Personalizado';draw()};
for(const [id,key] of [['sheetX','x'],['sheetY','y'],['sheetW','w'],['sheetH','h']])el(id).onchange=()=>{if(selected<0)return;const n=num(id);if(Math.abs(n)>100||!Number.isFinite(n)||(key==='w'||key==='h')&&n<=0)return;items[selected][key]=n;draw()};
el('sheetDuplicate').onclick=()=>{if(selected<0)return;if(items.length>=PRINT_LIMITS.items){msg('Máximo 500 piezas',true);return}const old=items[selected];const copy={...old,id:++objectCount,name:old.name+' (copia)',x:old.x+0.5,y:old.y+0.5};items.push(copy);selectItem(items.length-1)};
el('sheetRotate').onclick=()=>{if(selected<0)return;const v=items[selected];[v.w,v.h]=[v.h,v.w];v.turns=((v.turns||0)+1)%4;selectItem(selected)};
el('sheetRemove').onclick=()=>{if(selected<0)return;const removed=items.splice(selected,1)[0];if(!items.some(x=>x.url===removed.url))URL.revokeObjectURL(removed.url);selectItem(-1)};
el('sheetArrange').onclick=()=>{try{const result=packSheets(items,dims());items=result.items;if(selected>=0)currentPage=items[selected].page;selectItem(selected);msg(`${result.pages} hoja(s), sin cambiar las medidas de ninguna pieza.`)}catch(e){msg(e.message,true)}};
el('sheetPage').onchange=()=>{currentPage=num('sheetPage');selectItem(-1)};
el('sheetCopiesAdd').onclick=()=>{if(selected<0)return;const n=num('sheetCopies');if(!Number.isInteger(n)||n<1||n>100||items.length+n>PRINT_LIMITS.items){msg('Elige 1–100 copias adicionales, máximo 500 piezas',true);return}const source=items[selected];for(let i=0;i<n;i++)items.push({...source,id:++objectCount,name:source.name+' (copia)',x:source.x+.5,y:source.y+.5});selectItem(items.length-1);msg('Copias añadidas. Ordena automáticamente antes de exportar.')};
function eventCm(e){const rect=preview.getBoundingClientRect(),{w,h}=dims();return {x:(e.clientX-rect.left)/rect.width*w,y:(e.clientY-rect.top)/rect.height*h}}
preview.addEventListener('pointerdown',e=>{if(exportBusy)return;const p=eventCm(e);let hit=-1;for(let i=items.length-1;i>=0;i--){let v=items[i];if((v.page||0)!==currentPage)continue;if(p.x>=v.x&&p.x<=v.x+v.w&&p.y>=v.y&&p.y<=v.y+v.h){hit=i;break}}selectItem(hit);if(hit>=0){drag={start:p,x:items[hit].x,y:items[hit].y};preview.setPointerCapture(e.pointerId)}});
preview.addEventListener('pointermove',e=>{if(exportBusy||!drag||selected<0)return;const p=eventCm(e),v=items[selected];v.x=Number((drag.x+p.x-drag.start.x).toFixed(2));v.y=Number((drag.y+p.y-drag.start.y).toFixed(2));selectItem(selected)});
preview.addEventListener('pointerup',()=>drag=null);preview.addEventListener('pointercancel',()=>drag=null);
el('sheetPng').onclick=()=>exportFile('png');el('sheetJpg').onclick=()=>exportFile('jpg');el('sheetPdf').onclick=()=>exportFile('pdf');el('sheetPdfJob').onclick=()=>exportFile('job');
// Compatibilidad: el navegador negocia con impresoras disponibles en el dispositivo.
// No es posible seleccionar una impresora USB/Wi-Fi directamente desde un sitio público.
el('sheetPrint').onclick=async()=>{if(!checkExport())return;
 const popup=window.open('','_blank');if(!popup){msg('El navegador bloqueó la ventana de impresión; habilita ventanas emergentes.',true);return;}
 try{const {canvas:c,dpi}=fullCanvas(),{w,h}=dims(),data=c.toDataURL('image/png');c.width=c.height=1;
 popup.document.open();popup.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Plancha ${w} x ${h} cm</title><style>@page{size:${w}cm ${h}cm;margin:0}html,body{margin:0;padding:0;width:${w}cm;height:${h}cm}img{display:block;width:${w}cm;height:${h}cm;max-width:none;max-height:none}@media screen{body{background:#ddd;padding:15px}img{box-shadow:0 0 12px #666}}</style></head><body><img id="printImage" src="${data}" alt="Plancha lista para imprimir"><script>const img=document.getElementById('printImage');img.onload=()=>setTimeout(()=>window.print(),250);<\/script></body></html>`);popup.document.close();msg('Se abrió el diálogo de impresión. Selecciona impresora, tamaño de hoja y escala 100 %.');
 }catch(e){popup.close();msg('No se pudo preparar la impresión: '+e.message,true)}
};
selectItem(-1);draw();

el('sheetMirrorMode').checked=true;el('sheetMirrorMode').addEventListener('change',()=>msg('Espejo: '+(el('sheetMirrorMode').checked?'activado':'desactivado')+'. El lienzo sigue normal.'));

// Atomic batch from independent editor zones. Artwork only; no scene pixels.
window.__fepSheetAPI={async addZones(docs){if(exportBusy)throw Error('Espera a que termine la exportación');if(items.length+docs.length>PRINT_LIMITS.items)throw Error('Máximo 500 piezas');const unique=new Map(items.map(v=>[v.url,v.img.naturalWidth*v.img.naturalHeight])),pixels=docs.reduce((n,d)=>{const px=d.width*d.height/(2.54*2.54)*90000,limit=window.FEP_NATIVE?.isNative?4_000_000:40_000_000,dpi=Math.min(300,Math.floor(300*Math.sqrt(limit/px)));if(dpi<90)throw Error('La zona supera el límite seguro de exportación');return n+Math.round(d.width/2.54*dpi)*Math.round(d.height/2.54*dpi)},0);if([...unique.values()].reduce((a,b)=>a+b,0)+pixels>maxImagePixels())throw Error('El trabajo supera el límite seguro de imágenes');const prepared=[];exportBusy=true;setExportButtons(true);try{for(const doc of docs){const canvas=window.__estudioPrintAPI.renderZoneCanvas(doc),b=await blob(canvas,'image/png');canvas.width=canvas.height=1;prepared.push(await photo(b,doc.name,doc.width,doc.height))}for(const item of prepared){const p=findSpace(item);item.x=p.x;item.y=p.y;items.push(item)}selectItem(items.length-1);msg('Zonas incorporadas. Elige papel y ordena automáticamente.')}catch(e){for(const item of prepared)if(!items.includes(item))URL.revokeObjectURL(item.url);throw e}finally{exportBusy=false;setExportButtons(false)}}};
