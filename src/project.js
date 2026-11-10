// Validate before changing any live editor state. Legacy V1 remains readable.
export function validateProject(data){
 if(!data||typeof data!=='object'||![undefined,1,2].includes(data.version)||!Array.isArray(data.elements)||data.elements.length>500)throw Error('Formato o número de capas inválido');
 for(const key of ['width','height'])if(data[key]!==undefined&&(!Number.isFinite(data[key])||data[key]<1||data[key]>100))throw Error('Dimensiones fuera de 1–100 cm');
 for(const e of data.elements){
  if(!e||!['text','image','glitter'].includes(e.type)||!Number.isFinite(e.x)||!Number.isFinite(e.y)||Math.abs(e.x)>10||Math.abs(e.y)>10)throw Error('Capa inválida');
  if(e.type==='text'&&(typeof e.text!=='string'||e.text.length>1000||!Number.isFinite(e.size)||e.size<=0||e.size>500))throw Error('Texto inválido');
  if(e.type==='image'&&(typeof e.data!=='string'||e.data.length>15_000_000||!/^data:image\/(png|jpeg|webp);base64,/.test(e.data)))throw Error('Imagen no compatible');
  for(const key of ['widthFrac','heightFrac','scale'])if(e[key]!==undefined&&(!Number.isFinite(e[key])||e[key]<=0||e[key]>3))throw Error('Tamaño de imagen inválido');
  if(e.opacity!==undefined&&(!Number.isFinite(e.opacity)||e.opacity<0||e.opacity>1))throw Error('Opacidad inválida');
 }
 return data;
}
