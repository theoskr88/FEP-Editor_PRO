import {getSticker} from './stickers.js?v=cierre-b1-20261111';
const paths=new Map();
export function stickerFractions(e,canvasWidth,canvasHeight){const fw=e.widthFrac??.28,fh=e.heightFrac??fw*canvasWidth/canvasHeight*.75;return {fw,fh,ratio:.75}}
export function stickerBounds(e,width,height){const {fw,fh}=stickerFractions(e,width,height),w=fw*width,h=fh*height,a=(e.rotation||0)*Math.PI/180,bw=Math.abs(w*Math.cos(a))+Math.abs(h*Math.sin(a)),bh=Math.abs(w*Math.sin(a))+Math.abs(h*Math.cos(a));return{x:e.x*width-bw/2,y:e.y*height-bh/2,w:bw,h:bh}}
export function paintSticker(ctx,e,width,height){
 const definition=getSticker(e.stickerId);if(!definition)throw Error('Sticker no disponible: '+e.stickerId);
 const {fw,fh}=stickerFractions(e,width,height),w=fw*width,h=fh*height;
 ctx.save();ctx.translate(e.x*width,e.y*height);ctx.rotate((e.rotation||0)*Math.PI/180);ctx.scale((e.flipX?-1:1)*w/120,(e.flipY?-1:1)*h/90);ctx.translate(-60,-45);ctx.lineWidth=e.outlineWidth??1.5;ctx.lineJoin='round';ctx.lineCap='round';
 for(let i=0;i<definition.shapes.length;i++){
  const shape=definition.shapes[i];if(!paths.has(shape.d))paths.set(shape.d,new Path2D(shape.d));const p=paths.get(shape.d);
  if(e.shadow&&i===0){ctx.shadowColor='rgba(0,0,0,.3)';ctx.shadowBlur=Math.min(100,w/120*3);ctx.shadowOffsetX=w/120*2;ctx.shadowOffsetY=h/90*2}
  ctx.fillStyle=shape.fill==='color'?(e.color||'#e6eef9'):shape.fill==='accent'?'#a8c8e5':shape.fill==='white'?'#ffffff':shape.fill;
  if(shape.fill!=='none')ctx.fill(p);if((shape.stroke||i===0)&&(e.outlineWidth??1.5)>0){ctx.strokeStyle=e.outlineColor||'#52697e';ctx.stroke(p)}ctx.shadowColor='transparent';ctx.shadowBlur=ctx.shadowOffsetX=ctx.shadowOffsetY=0;
 }
 const label=e.label,box=definition.textBox;
 if(label?.text&&box){ctx.save();ctx.beginPath();ctx.rect(box.x,box.y,box.w,box.h);ctx.clip();const size=label.size||14;ctx.font=`bold ${size}px Arial`;ctx.fillStyle=label.color||'#172b4d';ctx.textAlign='center';ctx.textBaseline='middle';const lines=[];for(const paragraph of label.text.split('\n')){let line='';for(const word of paragraph.split(/\s+/)){const next=line?line+' '+word:word;if(line&&ctx.measureText(next).width>box.w-4){lines.push(line);line=word}else line=next}lines.push(line)}const count=Math.max(1,Math.min(lines.length,6,Math.floor(box.h/(size*1.15)))),visible=lines.slice(0,count);if(lines.length>count)visible[count-1]+='…';visible.forEach((line,i)=>ctx.fillText(line,box.x+box.w/2,box.y+box.h/2+(i-(count-1)/2)*size*1.15,box.w-4));ctx.restore()}
 ctx.restore();
}
