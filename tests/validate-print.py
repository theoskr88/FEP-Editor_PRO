"""Independent Poppler import of the PDF downloaded from the real print UI."""
from pathlib import Path
import subprocess,re,json,hashlib
from PIL import Image
phase=re.search("release:'([^']+)'",Path('src/bootstrap.js').read_text())[1];root=Path('docs/evidence')/phase;pdf=root/'print-job.pdf'
r=subprocess.run(['pdfinfo',str(pdf)],capture_output=True,text=True,check=True);assert not r.stderr;assert re.search(r'Pages:\s+3\b',r.stdout);m=re.search(r'Page size:\s+([\d.]+) x ([\d.]+) pts',r.stdout);assert m;assert abs(float(m[1])-29.7/2.54*72)<.01;assert abs(float(m[2])-42/2.54*72)<.01
out=root/'print-pdf-page';render=subprocess.run(['pdftoppm','-f','1','-singlefile','-r','72','-png',str(pdf),str(out)],capture_output=True,text=True,check=True);assert not render.stderr
im=Image.open(out.with_suffix('.png')).convert('RGB');assert im.size==(842,1191);pixels=list(im.get_flattened_data());assert sum(1 for p in pixels if max(p)<100)>1000;assert sum(1 for p in pixels if max(p)-min(p)<20 and max(p)<230)>100
(root/'print-validation.json').write_text(json.dumps({'passed':3,'checks':['Poppler opens three-page PDF without errors','physical A3 MediaBox within 0.01 point','first page rasterizes at 72 dpi with visible content and crop marks'],'sha256':hashlib.sha256(pdf.read_bytes()).hexdigest(),'pdfinfo':r.stdout,'physicalPrintingTested':False},indent=2)+'\n');print('PASS Poppler PDF import, A3 size and rasterization')
