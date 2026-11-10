// Legacy workflow tests now navigate the real UI instead of assuming every tool
// is simultaneously visible. This never unhides DOM or changes editor state.
export function withToolNavigation(page){
 const actions=new Set(['click','tap','fill','selectOption','setInputFiles','check','uncheck','setChecked','dispatchEvent','scrollIntoViewIfNeeded','screenshot']);
 async function reveal(locator){await locator.waitFor({state:'attached'});const target=await locator.evaluate(node=>({panel:node.closest('[data-tool-panel]')?.dataset.toolPanel,sheet:!!node.closest('#sheetOverlay'),workspace:!!node.closest('#canvasPanel,#viewPanel'),details:[...function*(n){for(let p=n.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS'&&!p.open)yield p.id}(node)].reverse()}));
  if(target.panel){const needs=await page.evaluate(tool=>document.getElementById('panel-'+tool).hidden||(matchMedia('(max-width:900px)').matches&&document.getElementById('toolsDock').dataset.open!=='true'),target.panel);if(needs)await page.locator('#tab-'+target.panel).click()}
  if(target.workspace&&await page.evaluate(()=>matchMedia('(max-width:900px)').matches&&document.getElementById('toolsDock').dataset.open==='true'))await page.locator('#closeTools').click();
  for(const id of target.details){if(id&&!(await page.locator('#'+id).evaluate(n=>n.open)))await page.locator('#'+id+'>summary').click()}
 }
 const cache=new WeakMap();
 function wrap(locator){if(cache.has(locator))return cache.get(locator);const proxy=new Proxy(locator,{get(target,key){const value=target[key];if(typeof value!=='function')return value;if(actions.has(key))return async(...args)=>{await reveal(target);return value.apply(target,args)};return(...args)=>{if(key==='getByRole'&&args[0]==='checkbox'&&/^Visible |^Bloquear /.test(args[1]?.name||''))args[1]={...args[1],includeHidden:true};const out=value.apply(target,args);return out&&typeof out.evaluate==='function'&&typeof out.click==='function'?wrap(out):out}}});cache.set(locator,proxy);return proxy}
 return new Proxy(page,{get(target,key){const value=target[key];if(typeof value!=='function')return value;return(...args)=>{if(key==='getByRole'&&args[0]==='checkbox'&&/^Visible |^Bloquear /.test(args[1]?.name||''))args[1]={...args[1],includeHidden:true};const out=value.apply(target,args);return out&&typeof out.evaluate==='function'&&typeof out.click==='function'?wrap(out):out}}});
}
