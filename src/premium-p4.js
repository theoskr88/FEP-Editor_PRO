// Premium P4. Pure geometry and print preflight; all measurements are local and offline.
export function snapCoordinate(value, guides=[0,.5,1], tolerance=.012){
 if(!Number.isFinite(value))throw Error('Posición inválida');
 const candidates=guides.filter(Number.isFinite).map(v=>({v,d:Math.abs(value-v)})).sort((a,b)=>a.d-b.d);
 return candidates.length&&candidates[0].d<=tolerance?candidates[0].v:value;
}
export function moveLayerPrecisely(layer,{xCm,yCm,widthCm,heightCm}){
 if(!layer||layer.locked||layer.type==='glitter')throw Error('Selecciona una capa editable.');
 if(![xCm,yCm,widthCm,heightCm].every(Number.isFinite)||widthCm<=0||heightCm<=0)throw Error('Medidas inválidas');
 return {...layer,x:Math.max(0,Math.min(1,xCm/widthCm)),y:Math.max(0,Math.min(1,yCm/heightCm))};
}
export function printPreflight({widthCm,heightCm,pixelBudget=4_000_000,images=[]}={}){
 if(!Number.isFinite(widthCm)||!Number.isFinite(heightCm)||widthCm<=0||heightCm<=0||!Number.isFinite(pixelBudget)||pixelBudget<=0)throw Error('Medidas de impresión inválidas');
 const pixelsAt300=widthCm*heightCm/(2.54*2.54)*90000;
 let dpi=Math.min(300,Math.floor(300*Math.sqrt(pixelBudget/pixelsAt300)));
 while(dpi>0&&Math.round(widthCm/2.54*dpi)*Math.round(heightCm/2.54*dpi)>pixelBudget)dpi--;
 const warnings=[];
 if(dpi<300)warnings.push('La resolución de salida se limitará a '+dpi+' ppp por memoria disponible.');
 for(const image of images){
  if(!image||!Number.isFinite(image.pixelW)||!Number.isFinite(image.pixelH)||!Number.isFinite(image.widthCm)||!Number.isFinite(image.heightCm)||image.widthCm<=0||image.heightCm<=0)continue;
  const cropW=Array.isArray(image.crop)&&Number.isFinite(image.crop[2])&&image.crop[2]>0&&image.crop[2]<=1?image.crop[2]:1;
  const cropH=Array.isArray(image.crop)&&Number.isFinite(image.crop[3])&&image.crop[3]>0&&image.crop[3]<=1?image.crop[3]:1;
  const effective=Math.min((image.pixelW*cropW)/image.widthCm,(image.pixelH*cropH)/image.heightCm)*2.54;
  if(effective<150)warnings.push('Imagen '+(image.name||'sin nombre')+': '+Math.round(effective)+' ppp efectivos. Riesgo de pixelación.');
  else if(effective<300)warnings.push('Imagen '+(image.name||'sin nombre')+': '+Math.round(effective)+' ppp efectivos (menos de 300).');
 }
 return {dpi,outputW:Math.round(widthCm/2.54*dpi),outputH:Math.round(heightCm/2.54*dpi),warnings,canExport:dpi>=90};
}
