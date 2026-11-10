// JPEG page streams in a physical PDF page box. No printer driver scaling.
export function pdfPrintJob(pages,wCm,hCm){
 if(!pages.length||pages.length>20||![wCm,hCm].every(v=>Number.isFinite(v)&&v>0))throw Error('Trabajo PDF no válido');
 const enc=new TextEncoder(),parts=[],offsets=[0];let length=0;const put=s=>{const b=typeof s==='string'?enc.encode(s):s;parts.push(b);length+=b.byteLength};
 const object=(id,head,data)=>{offsets[id]=length;put(`${id} 0 obj\n${head}`);if(data){put('\nstream\n');put(data);put('\nendstream')}put('\nendobj\n')};
 const pt=n=>Number((n/2.54*72).toFixed(6)),w=pt(wCm),h=pt(hCm);put('%PDF-1.4\n%FEP print job\n');object(1,'<< /Type /Catalog /Pages 2 0 R >>');object(2,`<< /Type /Pages /Count ${pages.length} /Kids [${pages.map((_,i)=>`${3+i*3} 0 R`).join(' ')}] >>`);
 for(let i=0;i<pages.length;i++){const p=pages[i],id=3+i*3,b=p.jpeg instanceof Uint8Array?p.jpeg:new Uint8Array(p.jpeg);if(!b.length||p.width<1||p.height<1)throw Error('Página JPEG no válida');const commands=enc.encode(`q\n${w} 0 0 ${h} 0 0 cm\n/Im0 Do\nQ\n`);object(id,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Resources << /XObject << /Im0 ${id+1} 0 R >> >> /Contents ${id+2} 0 R >>`);object(id+1,`<< /Type /XObject /Subtype /Image /Width ${p.width} /Height ${p.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${b.length} >>`,b);object(id+2,`<< /Length ${commands.length} >>`,commands)}
 const xref=length;put(`xref\n0 ${offsets.length}\n0000000000 65535 f \n`);for(let i=1;i<offsets.length;i++)put(`${String(offsets[i]).padStart(10,'0')} 00000 n \n`);put(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);return new Blob(parts,{type:'application/pdf'});
}
