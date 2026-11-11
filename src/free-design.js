import {gradientFill} from './creative.js?v=cierre-b2-20261111';
// Shared physical units and native vector primitives. No alternate editor or raster SVG export.
export const PAGE_PRESETS={A4:[21,29.7],A3:[29.7,42],Carta:[21.59,27.94]};
export const UNIT_CM={cm:1,mm:.1,in:2.54};
export const SHAPE_NAMES={rectangle:'Rectángulo',ellipse:'Elipse',triangle:'Triángulo',star:'Estrella'};
export const fromCm=(value,unit)=>value/UNIT_CM[unit];
export const toCm=(value,unit)=>value*UNIT_CM[unit];
export function normalizeFreeDesign(input={}){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Configuración de página inválida');
 const data={preset:'A4',unit:'cm',background:'white',rulers:true,grid:false,gridStepCm:1,zoom:100,guides:[],...input};
 if(!['A4','A3','Carta','custom'].includes(data.preset)||!Object.hasOwn(UNIT_CM,data.unit)||!['white','transparent'].includes(data.background))throw Error('Formato, unidad o fondo inválido');
 if(typeof data.rulers!=='boolean'||typeof data.grid!=='boolean'||!Number.isFinite(data.gridStepCm)||data.gridStepCm<.1||data.gridStepCm>25||!Number.isFinite(data.zoom)||data.zoom<25||data.zoom>400)throw Error('Cuadrícula o zoom fuera de rango');
 if(!Array.isArray(data.guides)||data.guides.length>40||data.guides.some(g=>!g||!['x','y'].includes(g.axis)||!Number.isFinite(g.cm)||g.cm<0||g.cm>100))throw Error('Guías inválidas');
 return {...data,guides:data.guides.map(g=>({axis:g.axis,cm:g.cm}))};
}
export function pageSize(preset,orientation='portrait'){
 if(!Object.hasOwn(PAGE_PRESETS,preset))throw Error('Formato de página no disponible');const [w,h]=PAGE_PRESETS[preset];return orientation==='landscape'?{w:h,h:w}:{w,h};
}
export function rulerTicks(cm,unit,pixels){
 const length=fromCm(cm,unit),target=length*40/Math.max(1,pixels),base=10**Math.floor(Math.log10(Math.max(target,.00001))),step=[1,2,5,10].map(n=>n*base).find(n=>n>=target),ticks=[];
 for(let i=0;i*step<=length&&i<500;i++)ticks.push({value:Number((i*step).toPrecision(8)),fraction:i*step/length});return ticks;
}
export function validateShape(layer){
 if(!Object.hasOwn(SHAPE_NAMES,layer.shape)||!/^#[0-9a-f]{6}$/i.test(layer.color)||!/^#[0-9a-f]{6}$/i.test(layer.outlineColor))throw Error('Figura o color inválido');
 for(const key of ['widthFrac','heightFrac'])if(!Number.isFinite(layer[key])||layer[key]<=0||layer[key]>3)throw Error('Tamaño de figura inválido');
 if(!Number.isFinite(layer.rotation)||Math.abs(layer.rotation)>3600||!Number.isFinite(layer.outlineWidth)||layer.outlineWidth<0||layer.outlineWidth>8)throw Error('Transformación de figura inválida');return layer;
}
export function shapeBounds(e,width,height){const w=e.widthFrac*width,h=e.heightFrac*height,a=e.rotation*Math.PI/180,bw=Math.abs(w*Math.cos(a))+Math.abs(h*Math.sin(a)),bh=Math.abs(w*Math.sin(a))+Math.abs(h*Math.cos(a));return{x:e.x*width-bw/2,y:e.y*height-bh/2,w:bw,h:bh}}
export function paintShape(ctx,e,width,height){
 ctx.save();ctx.translate(e.x*width,e.y*height);ctx.rotate(e.rotation*Math.PI/180);ctx.scale(e.widthFrac*width/120,e.heightFrac*height/90);ctx.beginPath();
 if(e.shape==='ellipse')ctx.ellipse(0,0,60,45,0,0,Math.PI*2);
 else if(e.shape==='triangle'){ctx.moveTo(0,-45);ctx.lineTo(60,45);ctx.lineTo(-60,45);ctx.closePath()}
 else if(e.shape==='star'){for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?.44:1;const x=Math.cos(a)*60*r,y=Math.sin(a)*45*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath()}
 else ctx.rect(-60,-45,120,90);
 ctx.fillStyle=gradientFill(ctx,e,120,90);ctx.fill();if(e.outlineWidth>0){ctx.strokeStyle=e.outlineColor;ctx.lineWidth=e.outlineWidth;ctx.lineJoin='round';ctx.stroke()}ctx.restore();
}
export function alignedPosition(bounds,width,height,action){
 const dx=action==='left'?-bounds.x:action==='centerX'?width/2-bounds.x-bounds.w/2:action==='right'?width-bounds.x-bounds.w:0;
 const dy=action==='top'?-bounds.y:action==='centerY'?height/2-bounds.y-bounds.h/2:action==='bottom'?height-bounds.y-bounds.h:0;
 return {dx:dx/width,dy:dy/height};
}
