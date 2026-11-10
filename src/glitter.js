// Stable particle layout: no random work or texture regeneration in the render loop.
export const palettes={pink:'#e88ac2',gold:'#d5ab42',silver:'#c9d1dc',blue:'#368cdb',multi:'#b97be0'};
export const GLITTER_SCHEMA=2;
const validColor=value=>typeof value==='string'&&/^#[0-9a-f]{6}$/i.test(value);
export function glitterSettings(value={}){
 value=value&&typeof value==='object'?value:{};
 const clamp=(v,min,max,fallback)=>Number.isFinite(Number(v))?Math.min(max,Math.max(min,Number(v))):fallback;
 let palette=Object.hasOwn(palettes,value.palette)||value.palette==='custom'?value.palette:'pink';
 const color=validColor(value.color)?value.color.toLowerCase():(palettes[palette]||palettes.pink);
 if(palette!=='multi'&&palette!=='custom'&&color!==palettes[palette])palette='custom';
 return {palette,color,size:clamp(value.size,1,8,3),intensity:clamp(value.intensity,0,100,65),finish:['gloss','satin','matte'].includes(value.finish)?value.finish:'gloss'};
}
// V1/V2 before glitterSchema=2 ignored color for named palettes. Preserve what
// those projects actually displayed; free colors become authoritative thereafter.
export function migrateLegacyGlitter(value={}){
 const old=value&&typeof value==='object'?value:{};
 return glitterSettings({...old,...(Object.hasOwn(palettes,old.palette)?{color:palettes[old.palette]}:{})});
}
export function glitterTextureSize({touch=false,deviceMemory=8,viewportWidth=1200}={}){
 return touch||deviceMemory<=4||viewportWidth<=640?{width:512,height:256,cacheEntries:4}:{width:1024,height:512,cacheEntries:8};
}
export function glitterMaterialProperties(settings){
 const s=glitterSettings(settings),roughness={gloss:.23,satin:.46,matte:.79}[s.finish];
 return {roughness,metalness:s.finish==='matte'?.18:.52,clearcoat:s.finish==='gloss'?.65:s.finish==='satin'?.2:0,clearcoatRoughness:s.finish==='gloss'?.18:.5,normalStrength:s.finish==='matte'?.22:.5};
}
const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
const shade=(channels,amount)=>`rgb(${channels.map(c=>Math.round(amount>=0?c+(255-c)*amount:c*(1+amount))).join(',')})`;
function polygon(ctx,points){ctx.beginPath();ctx.moveTo(...points[0]);for(let i=1;i<points.length;i++)ctx.lineTo(...points[i]);ctx.closePath()}
export function paintGlitter(ctx,width,height,settings,{material=false,map='color'}={}){
 const s=glitterSettings(settings),base=rgb(s.color),colors=Object.values(palettes).slice(0,4).map(rgb),normal=map==='normal',rough=map==='roughness';
 ctx.clearRect(0,0,width,height);ctx.save();ctx.scale(width/512,height/256);
 if(normal||rough||!material){ctx.fillStyle=normal?'rgb(128,128,255)':rough?'rgb(210,210,210)':s.color;ctx.fillRect(0,0,512,256)}
 let seed=1769;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const count=Math.min(6000,Math.round(8000/s.size)),strength=s.intensity/100,finish={gloss:1,satin:.7,matte:.4}[s.finish];
 for(let n=0;n<count;n++){
  // Consume the same RNG sequence for color, normals and roughness.
  const x=rand()*512,y=rand()*256,r=(.35+rand()**2*.95)*s.size,angle=rand()*Math.PI*2,tilt=rand()*Math.PI*2,slope=.15+rand()*.65,tone=rand(),alpha=.48+rand()*.48;
  const vertices=5+Math.floor(rand()*3),points=[];
  for(let k=0;k<vertices;k++){const a=angle+k/vertices*Math.PI*2,jitter=.6+rand()*.4;points.push([x+Math.cos(a)*r*jitter,y+Math.sin(a)*r*(.55+rand()*.45)*jitter])}
  const tint=s.palette==='multi'?colors[n%colors.length]:base;
  ctx.globalAlpha=normal||rough?strength:strength*(material?alpha:.35+alpha*.6);
  if(normal){const nx=Math.cos(tilt)*slope,ny=Math.sin(tilt)*slope,nz=Math.sqrt(1-slope*slope);ctx.fillStyle=`rgb(${Math.round((nx*.5+.5)*255)},${Math.round((ny*.5+.5)*255)},${Math.round((nz*.5+.5)*255)})`}
  else if(rough){const v=Math.round(40+(1-finish)*130+tone*45);ctx.fillStyle=`rgb(${v},${v},${v})`}
  else ctx.fillStyle=shade(tint,(tone-.5)*.75*finish);
  polygon(ctx,points);ctx.fill();
  if(!normal&&!rough){
   // A second facet and sparse small highlights give irregular flakes, not dots.
   ctx.fillStyle=shade(tint,.18+tone*.3*finish);polygon(ctx,[points[0],points[1],[x,y]]);ctx.fill();
   if(tone>.975){ctx.globalAlpha=strength*finish*.8;ctx.strokeStyle=shade(tint,.85);ctx.lineWidth=.2;ctx.beginPath();ctx.moveTo(x-r*.65,y);ctx.lineTo(x+r*.65,y);ctx.moveTo(x,y-r*.65);ctx.lineTo(x,y+r*.65);ctx.stroke()}
  }
 }
 ctx.restore();
}
