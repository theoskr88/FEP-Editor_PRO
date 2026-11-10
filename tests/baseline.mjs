import {start,tick,fixtureImage} from './harness.mjs';
import fs from 'node:fs/promises';
const h=await start({baseline:true}),p=h.page,report={source:'Original ZIP V0.9.5, unchanged',observations:{}};
try{
 report.observations.startup=await p.evaluate(()=>!!window.__estudioPrintAPI);
 await p.locator('#addText').click();await p.locator('#addText').click();await p.locator('#undo').click();let before=await p.evaluate(()=>window.__audit.state());
 await p.locator('#designCanvas').scrollIntoViewIfNeeded();let r=await p.locator('#designCanvas').boundingBox();await p.mouse.click(r.x+r.width/2,r.y+r.height/2);let after=await p.evaluate(()=>window.__audit.state());
 report.observations.selectionClearsRedo={before:before.redo,after:after.redo};
 before=after;await p.mouse.move(r.x+r.width/2+10,r.y+r.height/2);await p.mouse.down();await p.mouse.move(r.x+r.width/2+20,r.y+r.height/2);await p.mouse.up();after=await p.evaluate(()=>window.__audit.state());
 report.observations.dragOffset={expected:10/r.width,actual:after.elements[0].x-before.elements[0].x};
 await p.locator('#finishMode').selectOption('glitter');await p.locator('#addText').click();await tick(p);report.observations.glitterAfterEditing=await p.evaluate(()=>window.__audit.materials());
 const old=await p.evaluate(()=>window.__audit.state());await p.locator('#projectFile').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({product:'shirt',width:20,height:8.5,elements:[null]}))});await p.waitForTimeout(100);report.observations.invalidImport={beforeProduct:old.product,stateAfter:await p.evaluate(()=>window.__audit.state())};
 await p.reload();await p.waitForFunction(()=>window.__estudioPrintAPI);
 await p.locator('#openPrintSheet').click();await p.locator('#sheetImportInput').setInputFiles({name:'synthetic.png',mimeType:'image/png',buffer:await fixtureImage(p)});await p.waitForFunction(()=>window.__sheetAudit.state().length===1);
 await p.locator('#sheetW').fill('4');await p.locator('#sheetW').dispatchEvent('change');await p.locator('#sheetH').fill('2');await p.locator('#sheetH').dispatchEvent('change');await p.locator('#sheetRotate').click();await p.locator('#sheetMirrorMode').uncheck();
 report.observations.sheetRotation=await p.evaluate(()=>{const c=window.__sheetAudit.canvas(),s=window.__sheetAudit.state()[0],scale=c.width/Number(document.getElementById('sheetPageW').value),x=c.getContext('2d');const at=(a,b)=>[...x.getImageData(Math.round((s.x+s.w*a)*scale),Math.round((s.y+s.h*b)*scale),1,1).data];return{size:[s.w,s.h],topLeft:at(.25,.25),topRight:at(.75,.25),bottomLeft:at(.25,.75)}});
 report.pageErrors=h.errors;report.externalRequests=h.external;await p.screenshot({path:'docs/evidence/original-v095.png',fullPage:true});
 await fs.writeFile('docs/evidence/baseline.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report.observations,null,2));
}finally{await h.close();}
