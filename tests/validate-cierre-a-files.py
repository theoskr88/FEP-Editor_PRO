"""Independent decoders: real accessory videos/PDFs and actual older project validator."""
from pathlib import Path
from zipfile import ZipFile
import subprocess,json,hashlib,tempfile,re
root=Path('docs/evidence/cierre-a');results=[]
for product in ['shirt','cushion','tote','notebook']:
 p=root/f'{product}-360.webm';r=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-select_streams','v:0','-show_entries','stream=width,height,nb_read_frames,avg_frame_rate','-show_entries','format=duration','-of','json',str(p)]));s=r['streams'][0];assert int(s['nb_read_frames'])==45 and s['avg_frame_rate']=='15/1';assert abs(float(r['format']['duration'])-3)<1/15+.002;hashes=[]
 for view,t in [('front','0'),('back','1.5')]:
  frame=subprocess.check_output(['ffmpeg','-v','error','-ss',t,'-i',str(p),'-frames:v','1','-f','image2pipe','-vcodec','png','-']);(root/f'{product}-video-{view}.png').write_bytes(frame);hashes.append(hashlib.sha256(frame).hexdigest())
 assert hashes[0]!=hashes[1];results.append(dict(name=product+' video',passed=True,frames=45,fps=15,size=[s['width'],s['height']],sha256=hashlib.sha256(p.read_bytes()).hexdigest()));print('PASS decoded 360:',product)
for product,pages in [('tote',2),('notebook',1)]:
 p=root/f'{product}-consolidado.pdf';info=subprocess.check_output(['pdfinfo',str(p)],text=True);assert re.search(r'Pages:\s+'+str(pages)+r'\b',info);assert '841.89 x 1190.55' in info;results.append(dict(name=product+' PDF',passed=True,pages=pages,pdfinfo=info));print('PASS physical A3 PDF:',product)
with tempfile.TemporaryDirectory(prefix='fep-rollback-',dir='/tmp') as d:
 temp=Path(d);runtime=temp/'old';runtime.mkdir()
 with ZipFile('entregables/FEP_EDITOR_PRO_ZONAS1_PAGES.zip') as z:z.extractall(runtime)
 (runtime/'package.json').write_text('{"type":"module"}')
 for product in ['tote','notebook']:
  with ZipFile(root/f'desktop-{product}-print.zip') as z:raw=z.read('proyecto-completo.json')
  data=json.loads(raw);data['mockup'].update(preset='cafe',camera='print');source=temp/(product+'.json');source.write_text(json.dumps(data));out=temp/(product+'-compatible');subprocess.run(['python3','scripts/rollback-zonas1.py',str(source),'--out',str(out)],check=True,capture_output=True)
  assert (out/'ORIGINAL_CIERRE_A.json').read_bytes()==source.read_bytes()
  code="import {normalizeProject} from "+json.dumps((runtime/'src/project.js').as_uri())+";import fs from 'node:fs';const d=JSON.parse(fs.readFileSync(process.argv[1]));const v=normalizeProject(d).data;if(v.elements.length!==d.elements.length)throw Error('Layer loss');"
  for name in ['proyecto-activo.json',product+'-front.json',product+'-back.json']:subprocess.run(['node','--input-type=module','-e',code,str(out/name)],check=True,capture_output=True)
  assert json.loads((out/(product+'-back.json')).read_text())['width']==data['productZones'][product]['zones']['back']['width'];results.append(dict(name=product+' backwards-compatible backup',passed=True,validator='actual unmodified ZONAS1 project.js',facesPreserved=True,originalUntouched=True));print('PASS rollback with actual ZONAS1 validator:',product)
(root/'files-validation.json').write_text(json.dumps(dict(passed=len(results),results=results,physicalPrintingTested=False),indent=2)+'\n')
