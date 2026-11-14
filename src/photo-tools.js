// FEP Editor PRO — Edición fotográfica local. No utiliza servicios externos.
// El recorte por borde solo está indicado para fondos relativamente uniformes.
export function removeUniformBackground(data,width,height,{tolerance=42}={}){
 if(!data||data.length!==width*height*4||width<1||height<1)throw Error('Imagen inválida');
 if(width*height>6000000)throw Error('Para quitar fondo usa una fotografía de hasta 6 megapíxeles');
 const tol=Math.max(10,Math.min(110,Number(tolerance)||42)),total=width*height;
 const corners=[0,width-1,(height-1)*width,total-1];
 const samples=corners.map(p=>[data[p*4],data[p*4+1],data[p*4+2]]);
 // Mediana robusta: el fondo suele estar presente en al menos 3 de las 4 esquinas.
 const median=a=>a.slice().sort((x,y)=>x-y)[1];
 const bg=[0,1,2].map(c=>median(samples.map(s=>s[c])));
 const mask=new Uint8Array(total),queue=new Uint32Array(total);
 let head=0,tail=0;const near=p=>{
   const i=p*4;
   if(data[i+3]<10)return true;
   const dr=data[i]-bg[0],dg=data[i+1]-bg[1],db=data[i+2]-bg[2];
   return Math.sqrt(dr*dr*.30+dg*dg*.59+db*db*.11)<=tol;
 };
 const visit=p=>{if(mask[p]||!near(p))return;mask[p]=1;queue[tail++]=p;};
 for(let x=0;x<width;x++){visit(x);visit((height-1)*width+x);}
 for(let y=0;y<height;y++){visit(y*width);visit(y*width+width-1);}
 while(head<tail){
   const p=queue[head++],x=p%width;
   if(x>0)visit(p-1);
   if(x+1<width)visit(p+1);
   if(p>=width)visit(p-width);
   if(p+width<total)visit(p+width);
 }
 let cleared=0;
 for(let p=0;p<total;p++)if(mask[p]){data[p*4+3]=0;cleared++;}
 return {removed:cleared,total,background:bg};
}
export function drawWatermark(ctx,width,height,options={}){
 if(!options.enabled)return;
 const alpha=Math.max(0,Math.min(1,Number(options.opacity??0.28)));
 const text=String(options.text||'').trim().slice(0,90);
 const logo=options.logo&&options.logo.complete&&options.logo.naturalWidth?options.logo:null;
 if((!text&&!logo)||alpha<=0)return;
 const position=['center','bottom-right','repeat'].includes(options.position)?options.position:'bottom-right';
 ctx.save();ctx.globalAlpha=alpha;
 const fontSize=Math.max(18,Math.round(width*.036));
 const padding=Math.round(width*.035);
 ctx.font=`600 ${fontSize}px system-ui,Arial,sans-serif`;
 ctx.textBaseline='middle';ctx.textAlign='center';
 const tileWidth=Math.min(width*.48,Math.max(fontSize*3,ctx.measureText(text).width+fontSize));
 const tileHeight=fontSize*2.7;
 function paint(cx,cy){
   if(logo){
     const factor=Math.min(tileWidth/logo.naturalWidth,tileHeight/logo.naturalHeight);
     const lw=logo.naturalWidth*factor,lh=logo.naturalHeight*factor;
     ctx.drawImage(logo,cx-lw/2,cy-lh/2,lw,lh);
   }else{
     ctx.lineWidth=Math.max(2,fontSize*.09);ctx.strokeStyle='rgba(0,0,0,.55)';
     ctx.fillStyle='#ffffff';ctx.strokeText(text,cx,cy,tileWidth);ctx.fillText(text,cx,cy,tileWidth);
   }
 }
 if(position==='center')paint(width/2,height/2);
 else if(position==='bottom-right')paint(width-padding-tileWidth/2,height-padding-tileHeight/2);
 else for(let y=tileHeight/2;y<height+tileHeight;y+=tileHeight*2.1)
   for(let x=tileWidth/2;x<width+tileWidth;x+=tileWidth*1.35)paint(x,y);
 ctx.restore();
}
