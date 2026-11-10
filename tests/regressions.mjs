import {start,tick} from './harness.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const h=await start(),p=h.page,results=[];
try{
 await p.locator('#addText').click();
 await p.locator('#designCanvas').scrollIntoViewIfNeeded();const r=await p.locator('#designCanvas').boundingBox();const x=r.x+r.width/2+10,y=r.y+r.height/2;
 await p.mouse.click(x,y);await p.locator('#undo').click();await p.locator('#redo').click();await p.mouse.click(x,y);
 const before=await p.evaluate(()=>window.__audit.state());await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x+10,y);await p.mouse.up();const after=await p.evaluate(()=>window.__audit.state());assert.ok(Math.abs((after.elements[0].x-before.elements[0].x)-10/r.width)<.002);results.push('drag preserves grab offset');
 const exportArt=()=>p.evaluate(()=>window.__estudioPrintAPI.renderToExportCanvas().toDataURL());
 const plain=await exportArt();await p.locator('#finishMode').selectOption('glitter');await p.locator('#glitterPalette').selectOption('gold');await tick(p);assert.equal(await exportArt(),plain);results.push('export raster excludes physical glitter');
 await p.locator('#glitterSize').fill('6');await p.locator('#glitterSize').dispatchEvent('change');await p.locator('#glitterIntensity').fill('85');await p.locator('#glitterIntensity').dispatchEvent('change');await p.locator('#glitterFinish').selectOption('satin');await p.locator('#addGlitterLayer').click();assert.notEqual(await exportArt(),plain);results.push('export raster includes printable glitter');
 await p.locator('#addText').click();await p.locator('#designCanvas').scrollIntoViewIfNeeded();await p.screenshot({path:'docs/evidence/editor-glitter.png',fullPage:true});
 assert.deepEqual(h.errors,[]);console.log(results);await fs.writeFile('docs/evidence/regressions.json',JSON.stringify({passed:results.length,results},null,2)+'\n');
}finally{await h.close()}
