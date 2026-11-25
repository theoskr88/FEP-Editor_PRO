// Physical centimetres throughout. Packing never scales an original piece.
export const PRINT_LIMITS={items:500,pages:20,pixels:40_000_000,totalImagePixels:80_000_000};
const EPS=1e-6;
export function printSettings(input){
 const s={w:input.w,h:input.h,margin:input.margin??.5,gap:input.gap??.3,bleed:input.bleed??0,marks:!!input.marks,rotate:!!input.rotate};
 for(const k of ['w','h','margin','gap','bleed'])if(!Number.isFinite(s[k]))throw Error('Medidas de impresión no válidas');
 if(s.w<5||s.h<5||s.w>100||s.h>100||s.margin<0||s.gap<0||s.gap>5||s.bleed<0||s.bleed>1)throw Error('Revisa papel, margen, separación y sangrado (0–10 mm)');
 s.pad=s.bleed+(s.marks?.4:0);if(s.w-2*s.margin<=2*s.pad||s.h-2*s.margin<=2*s.pad)throw Error('No queda área útil con estos márgenes');
 if(Math.round(s.w/2.54*300)*Math.round(s.h/2.54*300)>PRINT_LIMITS.pixels)throw Error('La hoja supera 40 megapíxeles a 300 ppp');return s;
}
const overlaps=(a,b)=>a.x<b.x+b.w-EPS&&a.x+a.w>b.x+EPS&&a.y<b.y+b.h-EPS&&a.y+a.h>b.y+EPS;
function splitFree(rects,used){const out=[];for(const r of rects){if(!overlaps(r,used)){out.push(r);continue}if(used.x>r.x+EPS)out.push({...r,w:used.x-r.x});if(used.x+used.w<r.x+r.w-EPS)out.push({...r,x:used.x+used.w,w:r.x+r.w-used.x-used.w});if(used.y>r.y+EPS)out.push({...r,h:used.y-r.y});if(used.y+used.h<r.y+r.h-EPS)out.push({...r,y:used.y+used.h,h:r.y+r.h-used.y-used.h})}return out.filter((r,i)=>r.w>EPS&&r.h>EPS&&!out.some((b,j)=>j!==i&&(j<i||b.w>r.w+EPS||b.h>r.h+EPS)&&r.x>=b.x-EPS&&r.y>=b.y-EPS&&r.x+r.w<=b.x+b.w+EPS&&r.y+r.h<=b.y+b.h+EPS))}
export function packSheets(items,input){const s=printSettings(input);if(items.length>PRINT_LIMITS.items)throw Error('Máximo 500 piezas por trabajo');const pages=[],placed=Array(items.length);const newPage=()=>[{x:s.margin,y:s.margin,w:s.w-2*s.margin+s.gap,h:s.h-2*s.margin+s.gap}];
 const order=items.map((v,i)=>({v,i})).sort((a,b)=>Math.max(b.v.w,b.v.h)-Math.max(a.v.w,a.v.h)||b.v.w*b.v.h-a.v.w*a.v.h);
 for(const {v,i}of order){if(!Number.isFinite(v.w)||!Number.isFinite(v.h)||v.w<=0||v.h<=0)throw Error('Pieza sin medidas válidas');let best;
  const search=(page)=>{for(const r of pages[page])for(const turn of(s.rotate?[0,1]:[0])){const w=(turn?v.h:v.w)+2*s.pad+s.gap,h=(turn?v.w:v.h)+2*s.pad+s.gap;if(w>r.w+EPS||h>r.h+EPS)continue;const score=Math.min(r.w-w,r.h-h)+Math.max(r.w-w,r.h-h)*1e-4+page*1e-8;if(!best||score<best.score)best={page,r,w,h,turn,score}}};
  for(let p=0;p<pages.length;p++)search(p);if(!best){if(pages.length>=PRINT_LIMITS.pages)throw Error('El trabajo supera 20 hojas');pages.push(newPage());search(pages.length-1)}
  if(!best)throw Error(`La pieza ${i+1} no cabe con sus medidas, sangrado y marcas. Usa otro papel o permite girar.`);
  const {page,r,w,h,turn}=best;pages[page]=splitFree(pages[page],{x:r.x,y:r.y,w,h});placed[i]={...v,x:r.x+s.pad,y:r.y+s.pad,w:turn?v.h:v.w,h:turn?v.w:v.h,turns:((v.turns||0)+turn)%4,page};
 }return {items:placed,pages:pages.length};
}
export function printQuality(items,input){let s;try{s=printSettings(input)}catch(e){return {errors:[e.message],warnings:[],pages:0}}const errors=[],warnings=[];if(!items.length)errors.push('Añade al menos un diseño.');if(items.length>PRINT_LIMITS.items)errors.push('Máximo 500 piezas.');let maxPage=0;
 const bounds=v=>({x:v.x-s.pad,y:v.y-s.pad,w:v.w+2*s.pad,h:v.h+2*s.pad});
 items.forEach((v,i)=>{maxPage=Math.max(maxPage,v.page||0);if(![v.x,v.y,v.w,v.h].every(Number.isFinite)||v.w<=0||v.h<=0)errors.push(`Pieza ${i+1}: medidas inválidas`);const r=bounds(v);if(r.x<s.margin-EPS||r.y<s.margin-EPS||r.x+r.w>s.w-s.margin+EPS||r.y+r.h>s.h-s.margin+EPS)errors.push(`Pieza ${i+1}: fuera del área útil, incluido sangrado y marcas`);let pw=v.pixelW??v.img?.naturalWidth,ph=v.pixelH??v.img?.naturalHeight;if((v.turns||0)%2)[pw,ph]=[ph,pw];const dpi=Math.min(pw/v.w,ph/v.h)*2.54;if(Number.isFinite(dpi)&&dpi<299.5)warnings.push(v.adaptiveDpi?`Pieza ${i+1}: exportación reducida por memoria Android (${Math.round(dpi)} ppp; el tamaño físico se conserva, pero tendrá menos detalle que a 300 ppp).`:`Pieza ${i+1}: resolución insuficiente (${Math.round(dpi)} ppp; recomendado 300)`);if(v.assumedDpi)warnings.push(`Pieza ${i+1}: imagen sin resolución física declarada; se asumieron 300 ppp. Verifica sus cm.`)});
 for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){if((items[i].page||0)!==(items[j].page||0))continue;const a=bounds(items[i]),b=bounds(items[j]);a.w+=s.gap;a.h+=s.gap;b.w+=s.gap;b.h+=s.gap;if(overlaps(a,b))errors.push(`Piezas ${i+1} y ${j+1}: superposición o separación insuficiente`)}
 if(maxPage>=PRINT_LIMITS.pages)errors.push('Máximo 20 hojas');return {errors,warnings,pages:items.length?maxPage+1:0};
}
// Return both axes; physical pixels may have different X/Y density.
export function readPrintDpi(buffer,type){const b=new Uint8Array(buffer),d=new DataView(buffer);let x,y;try{if(type==='image/png'){for(let p=8;p+12<=b.length;){const n=d.getUint32(p);if(n>b.length-p-12)break;const name=String.fromCharCode(...b.subarray(p+4,p+8));if(name==='pHYs'&&n===9&&b[p+16]===1){x=d.getUint32(p+8)*.0254;y=d.getUint32(p+12)*.0254;break}p+=n+12;if(name==='IEND')break}}
 else if(type==='image/jpeg'){let p=2;while(p+4<=b.length&&b[p]===255){const code=b[p+1],n=d.getUint16(p+2);if(code===0xda||n<2||p+n+2>b.length)break;if(code===0xe0&&n>=16&&String.fromCharCode(...b.subarray(p+4,p+9))==='JFIF\0'){const unit=b[p+11],factor=unit===1?1:unit===2?2.54:0;x=d.getUint16(p+12)*factor;y=d.getUint16(p+14)*factor;break}p+=n+2}}}catch{}return Number.isFinite(x)&&Number.isFinite(y)&&x>0&&y>0&&x<=10000&&y<=10000?{x,y}:null;}
