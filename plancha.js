/* Plancha de impresión — V0.9.0, independiente del visor 3D. */
const el=id=>document.getElementById(id);
const presets={A4:[21,29.7],Carta:[21.59,27.94],Oficio:[21.6,33],A3:[29.7,42]};
let items=[],selected=-1,drag=null,objectCount=0,previewScale=1;
const preview=el('sheetPreview'),pc=preview.getContext('2d');
const fmt=n=>Number(n.toFixed(2)).toLocaleString('es-CL');
const num=(id,fallback=0)=>Number.isFinite(Number(el(id).value))?Number(el(id).value):fallback;
const dims=()=>({w:num('sheetPageW',21),h:num('sheetPageH',29.7),margin:num('sheetMargin',.5),gap:num('sheetGap',.3)});
const msg=(m,isError=false)=>{el('sheetStatus').textContent=m;el('sheetStatus').className='sheet-help '+(isError?'sheet-bad':'sheet-good')};
function photo(blob,name,w,h){return new Promise((resolve,reject)=>{
 const url=URL.createObjectURL(blob),im=new Image();
 im.onload=()=>resolve({img:im,url,name,x:0,y:0,w,h,id:++objectCount});
 im.onerror=()=>{URL.revokeObjectURL(url);reject(Error('No se pudo abrir la imagen'))};im.src=url;
});}
function findSpace(item){const {w,h,margin,gap}=dims();const others=items.filter(i=>i!==item);
 // Colocación por filas conservando medidas, no cambia el tamaño del arte.
 let x=margin,y=margin,rowHeight=0;
 const packed=others.slice().sort((a,b)=>a.y-b.y||a.x-b.x);
 for(const placed of packed){
   if(x+item.w<=placed.x-gap && y+item.h<=h-margin)break;
   x=Math.max(x,placed.x+placed.w+gap);
   rowHeight=Math.max(rowHeight,placed.h);
   if(x+item.w>w-margin){x=margin;y+=rowHeight+gap;rowHeight=0;}
 }
 return {x,y};}
function selectItem(i){selected=i;const item=items[i];el('sheetSelectedName').textContent=item?item.name:'Ninguna';
 for(const [field,key] of [['sheetX','x'],['sheetY','y'],['sheetW','w'],['sheetH','h']]){el(field).disabled=!item;el(field).value=item?Number(item[key].toFixed(2)):'';}
 for(const id of ['sheetDuplicate','sheetRotate','sheetRemove'])el(id).disabled=!item;
 draw();}
function addItem(item){const position=findSpace(item);item.x=position.x;item.y=position.y;items.push(item);selectItem(items.length-1);
 const {w,h}=dims();if(item.x+item.w>w||item.y+item.h>h)msg('La pieza no cabe en esta hoja: usa un papel mayor u organiza las piezas.',true);else msg('Pieza añadida a la plancha: '+item.name);}
function paint(out,drawSelection=false){const {w,h,margin}=dims();const sx=out.canvas.width/w,sy=out.canvas.height/h;
 out.fillStyle='#ffffff';out.fillRect(0,0,out.canvas.width,out.canvas.height);
 if(drawSelection){out.strokeStyle='#d0d8df';out.lineWidth=1;out.setLineDash([5,5]);out.strokeRect(margin*sx,margin*sy,(w-2*margin)*sx,(h-2*margin)*sy);out.setLineDash([])}
 for(let i=0;i<items.length;i++){const v=items[i];out.save();out.translate((v.x+v.w/2)*sx,(v.y+v.h/2)*sy);out.rotate((v.turns||0)*Math.PI/2);const odd=(v.turns||0)%2;out.drawImage(v.img,-(odd?v.h:v.w)*sx/2,-(odd?v.w:v.h)*sy/2,(odd?v.h:v.w)*sx,(odd?v.w:v.h)*sy);out.restore();
   if(drawSelection){out.strokeStyle=i===selected?'#0e9daa':'#c1cbdd';out.lineWidth=i===selected?3:1;out.strokeRect(v.x*sx,v.y*sy,v.w*sx,v.h*sy)}
 }
}
function draw(){const {w,h}=dims();if(!w||!h)return;
 const max=950;previewScale=Math.min(max/w,max/h);preview.width=Math.max(1,Math.round(w*previewScale));preview.height=Math.max(1,Math.round(h*previewScale));paint(pc,true);
 el('sheetDimensions').textContent=`${fmt(w)} × ${fmt(h)} cm · ${items.length} pieza(s) · 300 ppp en archivo de salida`;
}
function fits(){const {w,h,margin}=dims();return items.every(v=>v.x>=margin-0.001&&v.y>=margin-0.001&&v.x+v.w<=w-margin+0.001&&v.y+v.h<=h-margin+0.001)}
function collision(){for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){
 const a=items[i],b=items[j];if(a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y)return true;
 }return false;}
function checkExport(){if(!items.length){msg('Añade al menos un diseño.',true);return false}if(!fits()){msg('Hay piezas fuera del área útil. Ajusta la posición o el papel.',true);return false}if(collision()){msg('Hay piezas superpuestas. Sepáralas antes de imprimir.',true);return false}return true}
function fullCanvas(){
  const {w,h}=dims(),W=Math.round(w/2.54*300),H=Math.round(h/2.54*300);
  if(W*H>40e6)throw Error('La hoja supera el límite seguro de 40 millones de píxeles');
  const normal=document.createElement('canvas');normal.width=W;normal.height=H;
  paint(normal.getContext('2d'),false);
  if(!el('sheetMirrorMode').checked)return normal;
  const reflected=document.createElement('canvas');reflected.width=W;reflected.height=H;
  const ctx=reflected.getContext('2d');ctx.translate(W,0);ctx.scale(-1,1);
  ctx.drawImage(normal,0,0);
  return reflected;
}
function download(blob,name){const api=window.__estudioPrintAPI;if(!api)throw Error('El editor todavía no terminó de cargar');api.saveBlob(blob,name)}
const blob=(c,type,quality)=>new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(Error('No pudo generarse el archivo')),type,quality));
async function exportFile(type){if(!checkExport())return;
 try{const api=window.__estudioPrintAPI,c=fullCanvas(),{w,h}=dims(),basename=`plancha_${w}x${h}cm_300ppp_${(el('sheetMirrorMode').checked?'espejo':'normal')}`;
  if(type==='png'){const raw=await blob(c,'image/png');download(api.pngWithDpi(await raw.arrayBuffer()),basename+'.png')}
  else if(type==='jpg'){const raw=await blob(c,'image/jpeg',.97);download(api.jpegWithDpi(await raw.arrayBuffer()),basename+'.jpg')}
  else download(await api.pdfAtPhysicalSize(c,w,h),basename+'.pdf');
  msg('Plancha exportada con las medidas y resolución configuradas.');
 }catch(e){msg('No se pudo exportar: '+e.message,true)}
}
function readDpi(buf,type){const bytes=new Uint8Array(buf);
 try{if(type==='image/png'&&bytes.length>33){let p=8,dv=new DataView(buf);while(p+12<bytes.length){let n=dv.getUint32(p),name=String.fromCharCode(...bytes.subarray(p+4,p+8));if(name==='pHYs'&&bytes[p+16]===1)return dv.getUint32(p+8)*.0254;p+=n+12;if(name==='IEND')break;}}
 if(type==='image/jpeg'){let p=2;while(p+4<bytes.length&&bytes[p]===255){const code=bytes[p+1],n=bytes[p+2]*256+bytes[p+3];if(code===0xda||!n)break;if(code===0xe0&&String.fromCharCode(...bytes.subarray(p+4,p+9))==='JFIF\0'){const units=bytes[p+11],xd=bytes[p+12]*256+bytes[p+13];return units===1?xd:units===2?xd*2.54:null;}p+=n+2;}}}catch{}return null}
async function addExternal(file){if(file.size>25*1024*1024)throw Error('El archivo supera 25 MB');const dpi=readDpi(await file.arrayBuffer(),file.type)||300;
 const obj=await photo(file,file.name,1,1);obj.w=obj.img.naturalWidth/dpi*2.54;obj.h=obj.img.naturalHeight/dpi*2.54;
 addItem(obj);if(!readDpi(await file.arrayBuffer(),file.type))msg('Imagen sin resolución física declarada: se asumieron 300 ppp. Puedes corregir sus cm manualmente.',true);}
// Un arte actual se incorpora directamente desde el editor original y conserva tamaño físico.
el('sheetAddCurrent').onclick=async()=>{try{const api=window.__estudioPrintAPI;if(!api)throw Error('Aún no está listo el editor');const {w,h}=api.cmPrint();const art=api.renderToExportCanvas();const b=await blob(art,'image/png');addItem(await photo(b,`Diseño actual ${w} × ${h} cm`,w,h));}catch(e){msg(e.message,true)}};
el('sheetImport').onclick=()=>el('sheetImportInput').click();
el('sheetImportInput').onchange=async e=>{for(const f of e.target.files||[]){if(!['image/png','image/jpeg'].includes(f.type)){msg('Solo se admiten PNG y JPEG',true);continue}try{await addExternal(f)}catch(err){msg(err.message,true)}}e.target.value=''};
el('openPrintSheet').onclick=()=>{el('sheetOverlay').hidden=false;document.body.style.overflow='hidden';draw()};
el('sheetClose').onclick=()=>{el('sheetOverlay').hidden=true;document.body.style.overflow='';};
el('sheetPaper').onchange=()=>{const v=el('sheetPaper').value;if(v!=='Personalizado'){let [w,h]=presets[v];if(el('sheetOrientation').value==='landscape')[w,h]=[h,w];el('sheetPageW').value=w;el('sheetPageH').value=h;}draw()};
el('sheetOrientation').onchange=()=>{const w=el('sheetPageW').value;el('sheetPageW').value=el('sheetPageH').value;el('sheetPageH').value=w;draw()};
for(const id of ['sheetPageW','sheetPageH','sheetMargin','sheetGap'])el(id).onchange=()=>{if(id==='sheetPageW'||id==='sheetPageH')el('sheetPaper').value='Personalizado';draw()};
for(const [id,key] of [['sheetX','x'],['sheetY','y'],['sheetW','w'],['sheetH','h']])el(id).onchange=()=>{if(selected<0)return;const n=num(id);if(!Number.isFinite(n)||(key==='w'||key==='h')&&n<=0)return;items[selected][key]=n;draw()};
el('sheetDuplicate').onclick=()=>{if(selected<0)return;const old=items[selected];const copy={...old,id:++objectCount,name:old.name+' (copia)',x:old.x+0.5,y:old.y+0.5};items.push(copy);selectItem(items.length-1)};
el('sheetRotate').onclick=()=>{if(selected<0)return;const v=items[selected];[v.w,v.h]=[v.h,v.w];v.turns=((v.turns||0)+1)%4;selectItem(selected)};
el('sheetRemove').onclick=()=>{if(selected<0)return;const removed=items.splice(selected,1)[0];if(!items.some(x=>x.url===removed.url))URL.revokeObjectURL(removed.url);selectItem(-1)};
el('sheetArrange').onclick=()=>{const {w,h,margin,gap}=dims();let x=margin,y=margin,rowH=0,count=0;
 for(const v of items){if(x+v.w>w-margin+1e-6){x=margin;y+=rowH+gap;rowH=0;}v.x=x;v.y=y;if(v.x+v.w<=w-margin&&v.y+v.h<=h-margin)count++;x+=v.w+gap;rowH=Math.max(rowH,v.h)}
 selectItem(selected);msg(count===items.length?'Todas las piezas caben, sin cambiar sus medidas.':`${count} de ${items.length} piezas caben. Usa papel mayor o reduce la cantidad.`,count!==items.length)};
function eventCm(e){const rect=preview.getBoundingClientRect(),{w,h}=dims();return {x:(e.clientX-rect.left)/rect.width*w,y:(e.clientY-rect.top)/rect.height*h}}
preview.addEventListener('pointerdown',e=>{const p=eventCm(e);let hit=-1;for(let i=items.length-1;i>=0;i--){let v=items[i];if(p.x>=v.x&&p.x<=v.x+v.w&&p.y>=v.y&&p.y<=v.y+v.h){hit=i;break}}selectItem(hit);if(hit>=0){drag={start:p,x:items[hit].x,y:items[hit].y};preview.setPointerCapture(e.pointerId)}});
preview.addEventListener('pointermove',e=>{if(!drag||selected<0)return;const p=eventCm(e),v=items[selected];v.x=Number((drag.x+p.x-drag.start.x).toFixed(2));v.y=Number((drag.y+p.y-drag.start.y).toFixed(2));selectItem(selected)});
preview.addEventListener('pointerup',()=>drag=null);preview.addEventListener('pointercancel',()=>drag=null);
el('sheetPng').onclick=()=>exportFile('png');el('sheetJpg').onclick=()=>exportFile('jpg');el('sheetPdf').onclick=()=>exportFile('pdf');
// Compatibilidad: el navegador negocia con impresoras disponibles en el dispositivo.
// No es posible seleccionar una impresora USB/Wi-Fi directamente desde un sitio público.
el('sheetPrint').onclick=async()=>{if(!checkExport())return;
 const popup=window.open('','_blank');if(!popup){msg('El navegador bloqueó la ventana de impresión; habilita ventanas emergentes.',true);return;}
 try{const c=fullCanvas(),{w,h}=dims(),data=c.toDataURL('image/png');
 popup.document.open();popup.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Plancha ${w} x ${h} cm</title><style>@page{size:${w}cm ${h}cm;margin:0}html,body{margin:0;padding:0;width:${w}cm;height:${h}cm}img{display:block;width:${w}cm;height:${h}cm;max-width:none;max-height:none}@media screen{body{background:#ddd;padding:15px}img{box-shadow:0 0 12px #666}}</style></head><body><img id="printImage" src="${data}" alt="Plancha lista para imprimir"><script>const img=document.getElementById('printImage');img.onload=()=>setTimeout(()=>window.print(),250);<\/script></body></html>`);popup.document.close();msg('Se abrió el diálogo de impresión. Selecciona impresora, tamaño de hoja y escala 100 %.');
 }catch(e){popup.close();msg('No se pudo preparar la impresión: '+e.message,true)}
};
selectItem(-1);draw();

el('sheetMirrorMode').checked=true;el('sheetMirrorMode').addEventListener('change',()=>msg('Espejo: '+(el('sheetMirrorMode').checked?'activado':'desactivado')+'. El lienzo sigue normal.'));
