"""Validate actual exported cut paths in Inkscape, not a raster SVG wrapper."""
from pathlib import Path
import os,subprocess,json,struct,re,xml.etree.ElementTree as ET
root=Path(__file__).resolve().parents[1];phase=re.search(r"release:'([^']+)'",(root/'src/bootstrap.js').read_text())[1];out=root/'docs/evidence'/phase;source=out/'cut-mirror.svg';env=dict(os.environ,INKSCAPE_PROFILE_DIR='/workspace/.cache/inkscape-b5',XDG_CACHE_HOME='/workspace/.cache');results=[]
def run(*args):return subprocess.check_output(['inkscape',str(source),*args],env=env,stderr=subprocess.PIPE).decode()
def check(name,condition):assert condition,name;results.append({'name':name,'passed':True})
ns={'s':'http://www.w3.org/2000/svg'};xml=ET.parse(source).getroot();check('physical cut SVG contains paths without embedded photographs or text objects',len(xml.findall('.//s:path',ns))>0 and not xml.findall('.//s:image',ns) and not xml.findall('.//s:text',ns))
plain=out/'cut-inkscape.svg';run('--export-plain-svg','--export-type=svg','--export-filename='+str(plain));parsed=ET.parse(plain).getroot();check('Inkscape imports and resaves editable physical 200 x 90 mm SVG',parsed.get('width')=='200mm' and parsed.get('height')=='90mm' and len(parsed.findall('.//s:path',ns))>0)
png=out/'cut-inkscape.png';run('--export-type=png','--export-dpi=96','--export-filename='+str(png));check('Inkscape raster validation uses correct physical page dimensions',struct.unpack('>II',png.read_bytes()[16:24])==(756,340))
pdf=out/'cut-inkscape.pdf';run('--export-type=pdf','--export-filename='+str(pdf));text=subprocess.check_output(['pdfinfo',str(pdf)]).decode();m=re.search(r'Page size:\s+([\d.]+) x ([\d.]+)',text);check('Inkscape PDF retains the physical page at scale',m and abs(float(m[1])-200/25.4*72)<.02 and abs(float(m[2])-90/25.4*72)<.02)
bounds=[float(v) for v in run('--query-id=cut','--query-x','--query-y','--query-width','--query-height').split()];x,y,w,h=bounds;check('actual editable cut bounds remain inside the physical sheet',w>0 and h>0 and x>=-.1 and y>=-.1 and x+w<=756.1 and y+h<=340.1)
(out/'svg-roundtrip-validation.json').write_text(json.dumps({'tool':subprocess.check_output(['inkscape','--version'],env=env).decode().strip(),'results':results,'passed':len(results),'physicalPlotterTested':False},indent=2)+'\n');print('PASS Inkscape',len(results),'checks')
