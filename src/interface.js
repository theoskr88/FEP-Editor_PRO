// Presentation only: tabs, mobile drawer and viewport sizing. No document state.
export const TOOL_TABS=['product','design','layers','effects','scene','print'];
export function fitRectangle(width,height,ratio){if(!Number.isFinite(width)||!Number.isFinite(height)||!Number.isFinite(ratio)||ratio<=0||width<=0||height<=0)return {width:0,height:0};const w=Math.min(width,height*ratio);return {width:w,height:w/ratio}}
export function initInterface(root=document){
 const get=id=>root.getElementById(id),dock=get('toolsDock'),tabs=[...root.querySelectorAll('[role=tab][data-tool]')],media=matchMedia('(max-width:900px)');let active='product',open=false,frame=0;
 const closeSheet=()=>{if(!get('sheetOverlay').hidden)get('sheetClose').click()};
 function sync(){dock.dataset.open=String(open);dock.inert=media.matches&&!open;dock.setAttribute('aria-hidden',String(media.matches&&!open));for(const tab of tabs){const selected=tab.dataset.tool===active;tab.setAttribute('aria-selected',String(selected&&(!media.matches||open)));tab.setAttribute('aria-expanded',String(selected&&open));tab.tabIndex=selected?0:-1;get(tab.getAttribute('aria-controls')).hidden=!selected}get('mobilePanelTitle').textContent=tabs.find(t=>t.dataset.tool===active).textContent;}
 function activate(tool,{toggle=false,focus=false,keepSheet=false}={}){if(!TOOL_TABS.includes(tool))return;if(!keepSheet)closeSheet();open=media.matches?(toggle&&active===tool?!open:true):true;active=tool;sync();if(focus)tabs.find(t=>t.dataset.tool===tool).focus();}
 for(const tab of tabs){tab.addEventListener('click',()=>activate(tab.dataset.tool,{toggle:true}));tab.addEventListener('keydown',event=>{let i=TOOL_TABS.indexOf(tab.dataset.tool);if(event.key==='ArrowRight')i=(i+1)%tabs.length;else if(event.key==='ArrowLeft')i=(i+tabs.length-1)%tabs.length;else if(event.key==='Home')i=0;else if(event.key==='End')i=tabs.length-1;else return;event.preventDefault();activate(TOOL_TABS[i],{focus:true})})}
 get('closeTools').onclick=()=>{closeSheet();open=false;sync();tabs.find(t=>t.dataset.tool===active).focus()};
 root.addEventListener('keydown',event=>{if(event.key==='Escape'&&media.matches&&open){event.preventDefault();get('closeTools').click()}});
 for(const button of root.querySelectorAll('[data-open-tool]'))button.addEventListener('click',()=>{activate(button.dataset.openTool);if(button.dataset.designSection)get(button.dataset.designSection).open=true});
 root.addEventListener('toggle',event=>{const details=event.target;if(details.tagName!=='DETAILS'||!details.open||!details.name)return;for(const other of root.querySelectorAll(`details[name="${details.name}"]`))if(other!==details)other.open=false},true);
 root.addEventListener('click',event=>{const menu=get('projectMenu');if(!menu.contains(event.target))menu.open=false});
 get('projectMenu').addEventListener('click',event=>{if(event.target.closest('button'))get('projectMenu').open=false});
 const stage=get('canvasStage'),canvas=get('designCanvas'),wrap=get('canvasWrap');
 function refresh(){if(frame)return;frame=requestAnimationFrame(()=>{frame=0;const box=fitRectangle(Math.max(0,stage.clientWidth-50),Math.max(0,stage.clientHeight-64),canvas.width/canvas.height);wrap.style.width=box.width+'px';wrap.style.height=box.height+'px';get('productName').textContent=get('viewerProductName').textContent=get('product').selectedOptions[0]?.textContent||'Producto';});}
 new ResizeObserver(refresh).observe(stage);new MutationObserver(refresh).observe(canvas,{attributes:true,attributeFilter:['width','height']});
 new MutationObserver(()=>{if(!get('imageSizePanel').hidden)get('imageTools').open=true}).observe(get('imageSizePanel'),{attributes:true,attributeFilter:['hidden']});
 new MutationObserver(()=>{if(!get('sheetOverlay').hidden)activate('print',{keepSheet:true})}).observe(get('sheetOverlay'),{attributes:true,attributeFilter:['hidden']});
 media.addEventListener('change',()=>{open=!media.matches;sync();refresh()});sync();refresh();return {activate,refresh};
}
