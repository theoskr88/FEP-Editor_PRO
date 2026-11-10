"""Verify complete source and tested Pages archives; retain previous phase bundles."""
from pathlib import Path
from zipfile import ZipFile
import sys,json,hashlib,subprocess,shutil
phase=sys.argv[1].upper();out=Path('/workspace/deliverables');evidence=Path('docs/evidence')/phase.lower();runtime=out/f'FEP_EDITOR_PRO_{phase}_PAGES.zip';source=out/f'FEP_EDITOR_PRO_{phase}_FUENTE.zip'
assert hashlib.sha256(runtime.read_bytes()).hexdigest()==json.loads((evidence/'package.json').read_text())['sha256']
files={p for p in subprocess.check_output(['git','ls-files','-z']).decode().strip('\0').split('\0') if not p.startswith('entregables/')}
with ZipFile(source) as z:
 assert z.testzip() is None and set(z.namelist())==files
 for name in files:assert z.read(name)==Path(name).read_bytes(),name
with ZipFile(runtime) as z:
 assert z.testzip() is None
 for name in z.namelist():assert z.read(name)==Path(name).read_bytes(),name
p=Path('entregables/SHA256SUMS.txt');lines=[line for line in p.read_text().splitlines() if phase+'_' not in line]
for kind in ['FUENTE','PAGES']:
 name=f'FEP_EDITOR_PRO_{phase}_{kind}.zip';shutil.copy2(out/name,Path('entregables')/name);lines.append(hashlib.sha256((out/name).read_bytes()).hexdigest()+'  '+name)
p.write_text('\n'.join(lines)+'\n');print('PASS source bytes, tested runtime SHA256 and ZIP CRC:',phase)
