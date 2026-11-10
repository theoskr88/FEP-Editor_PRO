import {glitterSettings,paintGlitter} from './glitter.js?v=fase2d-20261110';
// Small LRU, shared by 2D canvas, texture, preview and every export. No per-frame
// particle painting and no history-retained raster tiles.
export function createGlitterCache({width=1024,height=512,limit=8,createCanvas=()=>document.createElement('canvas')}={}){
 const entries=new Map();let generations=0;
 return {
  get(value){const s=glitterSettings(value),key=JSON.stringify(s);if(entries.has(key)){const tile=entries.get(key);entries.delete(key);entries.set(key,tile);return tile}const tile=createCanvas();tile.width=width;tile.height=height;paintGlitter(tile.getContext('2d'),width,height,s);generations++;entries.set(key,tile);while(entries.size>limit){const [key,old]=entries.entries().next().value;entries.delete(key);old.width=old.height=1}return tile},
  stats:()=>({entries:entries.size,generations,width,height,limit}),
  clear(){for(const tile of entries.values())tile.width=tile.height=1;entries.clear()}
 };
}
