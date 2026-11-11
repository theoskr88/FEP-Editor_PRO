// Playwright 1.58 waitForFunction treats an async predicate's Promise as truthy
// before its value is available. Poll async browser APIs explicitly instead.
export async function pollPage(page,predicate,arg,timeout=60000){const until=Date.now()+timeout;let last;while(Date.now()<until){last=await page.evaluate(predicate,arg);if(last)return last;await new Promise(resolve=>setTimeout(resolve,100))}throw Error('Browser condition did not become true: '+String(predicate).slice(0,160)+'; last='+JSON.stringify(last))}
