"""Immutable input audit: both delivered archives against their source checkpoint."""
from pathlib import Path
from zipfile import ZipFile
import subprocess,hashlib,json
base='44f41d3';out=Path('docs/evidence/cierre-a/auditoria-zonas1');out.mkdir(parents=True,exist_ok=True);results=[]
tracked=set(subprocess.check_output(['git','ls-tree','-r','--name-only',base]).decode().splitlines());tracked={p for p in tracked if not p.startswith('entregables/')}
for kind in ['FUENTE','PAGES']:
 p=Path('entregables')/f'FEP_EDITOR_PRO_ZONAS1_{kind}.zip'
 with ZipFile(p) as z:
  assert z.testzip() is None
  if kind=='FUENTE':assert set(z.namelist())==tracked
  for name in z.namelist():assert z.read(name)==subprocess.check_output(['git','show',base+':'+name]),name
  results.append(dict(kind=kind,passed=True,files=len(z.namelist()),sha256=hashlib.sha256(p.read_bytes()).hexdigest()))
assert results[1]['sha256']==json.loads(subprocess.check_output(['git','show',base+':docs/evidence/zonas1/gate.json']))['testedRuntimeSha256']
(out/'integridad.json').write_text(json.dumps(dict(passed=2,base=base,results=results),indent=2)+'\n');print('PASS ZONAS1 source and Pages: CRC, SHA and all checkpoint bytes')
