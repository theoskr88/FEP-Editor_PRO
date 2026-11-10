"""Decode actual downloaded 360 files and compare front/back frames independently."""
from pathlib import Path
import subprocess,json,hashlib,re
phase=re.search("release:'([^']+)'",Path('src/bootstrap.js').read_text())[1];root=Path('docs/evidence')/phase;results=[]
for product in ['shirt','cushion']:
 p=root/(product+'-360.webm');r=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-select_streams','v:0','-show_entries','stream=width,height,nb_read_frames,avg_frame_rate','-show_entries','format=duration','-of','json',str(p)]));s=r['streams'][0];assert int(s['nb_read_frames'])==45;assert s['avg_frame_rate']=='15/1';assert abs(float(r['format']['duration'])-3)<1/15+.002;assert 0<s['height']<=720
 hashes=[]
 for name,t in [('front','0'),('back','1.5')]:
  b=subprocess.check_output(['ffmpeg','-v','error','-ss',t,'-i',str(p),'-frames:v','1','-f','image2pipe','-vcodec','png','-']);(root/f'{product}-video-{name}.png').write_bytes(b);hashes.append(hashlib.sha256(b).hexdigest())
 assert hashes[0]!=hashes[1];results.append(dict(product=product,passed=True,frames=45,fps=15,duration=r['format']['duration'],size=[s['width'],s['height']],frontBackSha256=hashes,sha256=hashlib.sha256(p.read_bytes()).hexdigest()));print('PASS decoded 45-frame complete orbit:',product)
(root/'zones-video-validation.json').write_text(json.dumps(dict(passed=len(results),results=results,hardwarePerformanceCertified=False),indent=2)+'\n')
