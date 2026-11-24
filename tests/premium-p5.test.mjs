import test from 'node:test';
import assert from 'node:assert/strict';
import {formatInstalledVersion} from '../src/premium-p5.js';
import {CREATIVE_TEMPLATES} from '../src/creative.js';
import {stickers,getSticker} from '../src/stickers.js';
import {normalizeProject} from '../src/project.js';
test('P5 displays the actual native application build without fabricating values',()=>{
 const value=formatInstalledVersion({id:'com.fep.editorpro',version:'0.9.5-p5',build:'1081'},'fep-1234567890abcdef');
 assert.deepEqual(value,{platform:'Android',appId:'com.fep.editorpro',version:'0.9.5-p5',build:'1081',assetBuild:'fep-1234567890abcdef'});
 const web=formatInstalledVersion(null,'unavailable');
 assert.equal(web.platform,'Navegador');assert.equal(web.assetBuild,'No disponible');assert.equal(web.build,'No aplicable');
});
test('P5 templates are editable, local and preserve existing artwork',()=>{
 const previous={type:'text',text:'Texto previo',size:50,x:.5,y:.5,color:'#000000'};
 for(const id of ['mugquote','birthday','business','baby']){
  const template=CREATIVE_TEMPLATES[id];assert(template&&template.name);
  const original=JSON.stringify(template);
  const doc=normalizeProject({version:2,elements:[previous,...structuredClone(template.elements)]}).data;
  assert.equal(doc.elements[0].text,'Texto previo');
  assert(doc.elements.slice(1).every(e=>['text','shape'].includes(e.type)));
  assert.equal(JSON.stringify(template),original);
 }
});
test('P5 original sticker IDs are searchable and remain embedded offline',()=>{
 const ids=['decor-gift','decor-balloon','decor-sunburst','decor-checkmark','nature-cactus','nature-cherry','label-price-tag','label-badge-round','label-banner-fork','label-circle-outline'];
 assert.equal(new Set(stickers.map(s=>s.id)).size,stickers.length);
 for(const id of ids){const s=getSticker(id);assert(s&&s.shapes.length);assert(!JSON.stringify(s).includes('http'))}
});
