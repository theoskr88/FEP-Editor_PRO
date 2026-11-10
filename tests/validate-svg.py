"""Open actual browser downloads with Inkscape 1.4; assert physical geometry and mirror."""
from pathlib import Path
import subprocess,os,json,hashlib,xml.etree.ElementTree as ET
root=Path('docs/evidence/fase3c');env={**os.environ,'INKSCAPE_PROFILE_DIR':'/tmp/fep-inkscape','XDG_CACHE_HOME':'/tmp/fep-inkscape-cache'}
Path(env['INKSCAPE_PROFILE_DIR']).mkdir(exist_ok=True);Path(env['XDG_CACHE_HOME']).mkdir(exist_ok=True)
logs=[];boxes=[]
for name in ['cut.svg','cut-mirror.svg','print.svg']:
 tree=ET.parse(root/name);assert tree.getroot().attrib['width']=='200mm' and tree.getroot().attrib['height']=='90mm'
 if name.startswith('cut'):
  assert not tree.findall('.//{http://www.w3.org/2000/svg}image');assert not tree.findall('.//{http://www.w3.org/2000/svg}text')
 result=subprocess.run(['inkscape',str(root/name),'--query-all'],env=env,text=True,capture_output=True,check=True);logs.append(name+'\n'+result.stdout+'\n'+result.stderr)
 assert 'unknown type' not in result.stderr,result.stderr
 if name.startswith('cut'):
  row=next(line for line in result.stdout.splitlines() if line.startswith('cut,'));boxes.append([float(v)*25.4/96 for v in row.split(',')[1:]])
normal,mirror=boxes
assert abs(normal[2]-44.1)<.001 and abs(normal[3]-40.1)<.001,normal
assert abs(normal[0]+mirror[0]+normal[2]-200)<.001,boxes
assert all(abs(normal[i]-mirror[i])<.001 for i in [1,2,3]),boxes
for name in ['cut.svg','print.svg']:
 result=subprocess.run(['inkscape',str(root/name),'--export-plain-svg','--export-type=svg','--export-filename='+str(root/(name+'.inkscape.svg'))],env=env,text=True,capture_output=True,check=True);logs.append(result.stdout+'\n'+result.stderr);ET.parse(root/(name+'.inkscape.svg'))
subprocess.run(['inkscape',str(root/'print.svg'),'--export-type=png','--export-width=1200','--export-filename='+str(root/'inkscape-print.png')],env=env,text=True,capture_output=True,check=True)
(root/'inkscape-log.txt').write_text('\n'.join(logs));(root/'svg-validation.json').write_text(json.dumps({'passed':5,'tool':subprocess.check_output(['inkscape','--version'],env=env,text=True).strip(),'checks':['actual SVG imports successfully','200×90 mm physical page retained','cut has paths only, no raster or live text','2 mm offset gives 44.1×40.1 mm stroke bounds','mirror geometry matches about 200 mm page'],'normalBoundsMm':normal,'mirroredBoundsMm':mirror,'inputSha256':{name:hashlib.sha256((root/name).read_bytes()).hexdigest() for name in ['cut.svg','cut-mirror.svg','print.svg']},'hardwarePlotterTested':False,'universalCompatibilityClaimed':False},indent=2)+'\n')
print('PASS Inkscape: import, physical units, offset, mirror and plain SVG re-export')
