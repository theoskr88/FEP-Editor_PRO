// Deterministic texture generator shared by printable layers and the 3D material.
export const palettes={pink:'#e88ac2',gold:'#d5ab42',silver:'#c9d1dc',blue:'#368cdb',multi:'#b97be0'};
export function glitterSettings(value={}){
 const clamp=(v,min,max,fallback)=>Number.isFinite(Number(v))?Math.min(max,Math.max(min,Number(v))):fallback;
 return {palette:(Object.hasOwn(palettes,value.palette)||value.palette==='custom')?value.palette:'pink',color:/^#[0-9a-f]{6}$/i.test(value.color||'')?value.color:'#e88ac2',size:clamp(value.size,1,8,3),intensity:clamp(value.intensity,0,100,65),finish:['gloss','satin','matte'].includes(value.finish)?value.finish:'gloss'};
}
export function paintGlitter(ctx,width,height,settings,{material=false}={}){
 const s=glitterSettings(settings),colors=Object.values(palettes).slice(0,4);
 ctx.clearRect(0,0,width,height);ctx.save();ctx.scale(width/512,height/256);
 const color=s.palette==='custom'?s.color:palettes[s.palette];
 if(!material){ctx.fillStyle=color;ctx.fillRect(0,0,512,256)}
 let seed=1769;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 const count=Math.round(5500/s.size),intensity=s.intensity/100*({gloss:1,satin:.7,matte:.4})[s.finish];
 for(let n=0;n<count;n++){
  const x=rand()*512,y=rand()*256,r=(.15+rand()*.6)*s.size;
  ctx.globalAlpha=intensity*(.25+rand()*.75);
  ctx.fillStyle=s.palette==='multi'?colors[n%colors.length]:(n%3===0?'#ffffff':color);
  ctx.fillRect(x,y,r,r);
 }
 ctx.restore();
}
