import {PRODUCT_PROFILES} from './product-profiles.js?v=fep-6a4c2734f7b31778';
// Premium P6: pure presentation; never alter project data or renderer state directly.
const glyph=id=>({mug:'☕',mug_enamel:'☕',tumbler:'🥤',shirt:'👕',tote:'👜',notebook:'📓',mousepad:'▭',cushion:'▣',keychain:'◉',panel100:'▦'})[id]||'▢';
export function initPremiumP6({get,notify}){
 const select=get('product'),panel=get('panel-product');
 if(!select||!panel)return;
 const picker=document.createElement('div');picker.id='p6ProductCards';picker.className='p6-product-cards';picker.setAttribute('role','group');picker.setAttribute('aria-label','Selección visual de productos');
 const cards=[];
 for(const product of PRODUCT_PROFILES){
  const button=document.createElement('button');button.type='button';button.className='p6-product-card';button.dataset.product=product.id;
  const glyphSpan=document.createElement('span'),info=document.createElement('span'),title=document.createElement('strong'),size=document.createElement('small');
  glyphSpan.className='p6-product-icon';glyphSpan.textContent=glyph(product.id);
  title.textContent=product.name;size.textContent=product.printCm.join(' × ')+' cm';info.append(title,size);button.append(glyphSpan,info);
  button.onclick=()=>{if(select.value===product.id)return;select.value=product.id;select.dispatchEvent(new Event('change',{bubbles:true}))};
  picker.append(button);cards.push(button);
 }
 const firstLabel=select.closest('label');firstLabel?.after(picker);
 const refresh=()=>{for(const button of cards){const active=button.dataset.product===select.value;button.setAttribute('aria-pressed',String(active));button.classList.toggle('active',active)}};
 select.addEventListener('change',refresh);refresh();

 const wrap=get('canvasWrap'),canvasPanel=get('canvasPanel'),header=canvasPanel?.querySelector('.workspace-heading');
 if(wrap&&header){
  const guides=document.createElement('div');guides.className='p6-guides';guides.id='p6Guides';guides.hidden=true;
  const center=document.createElement('span');center.className='p6-guide-center';center.textContent='Centro imprimible';
  const edge=document.createElement('span');edge.className='p6-guide-side';edge.textContent='Verificar asa';
  guides.append(center,edge);wrap.append(guides);
  const toggle=document.createElement('button');toggle.id='p6GuidesToggle';toggle.type='button';toggle.className='p6-heading-action';toggle.textContent='Guías físicas';toggle.setAttribute('aria-pressed','false');header.append(toggle);
  const sync=()=>{guides.classList.toggle('is-mug',['mug','mug_enamel'].includes(select.value));edge.hidden=!['mug','mug_enamel'].includes(select.value)};
  toggle.onclick=()=>{guides.hidden=!guides.hidden;toggle.setAttribute('aria-pressed',String(!guides.hidden))};
  select.addEventListener('change',sync);sync();
 }
 const view=get('viewPanel'),viewer=get('viewer');
 if(view&&header&&viewer){
  const floatToggle=document.createElement('button');floatToggle.type='button';floatToggle.id='p6FloatToggle';floatToggle.className='p6-heading-action';floatToggle.textContent='Mini visor 3D';floatToggle.setAttribute('aria-pressed','false');header.append(floatToggle);
  const close=document.createElement('button');close.type='button';close.className='p6-float-close';close.textContent='Cerrar mini visor';view.prepend(close);
  const off=()=>{view.classList.remove('p6-floating');floatToggle.setAttribute('aria-pressed','false');window.dispatchEvent(new Event('resize'))};
  floatToggle.onclick=()=>{if(window.innerWidth>900){notify('El mini visor se utiliza en pantallas pequeñas');return}if(view.classList.contains('p6-floating'))off();else{view.classList.add('p6-floating');floatToggle.setAttribute('aria-pressed','true');window.dispatchEvent(new Event('resize'))}};
  close.onclick=off;window.addEventListener('resize',()=>{if(window.innerWidth>900&&view.classList.contains('p6-floating'))off()});
 }
 return {refresh};
}
