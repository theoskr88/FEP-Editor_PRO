#!/usr/bin/env python3
"""Build two local ZIPs without deploying or including development caches."""
import argparse,hashlib,subprocess
from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
root=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--out',default='/workspace/deliverables');args=p.parse_args()
out=Path(args.out).resolve();out.mkdir(parents=True,exist_ok=True)
runtime=['index.html','app.js','plancha.js']+[str(p.relative_to(root)) for folder in ['src','vendor'] for p in (root/folder).rglob('*') if p.is_file()]
source=[p for p in subprocess.check_output(['git','ls-files','-z'],cwd=root).decode().strip('\0').split('\0') if not p.startswith('entregables/')]
for name,files in [('FEP_EDITOR_PRO_FASE2A_PAGES.zip',runtime),('FEP_EDITOR_PRO_FASE2A_FUENTE.zip',source)]:
 with ZipFile(out/name,'w',ZIP_DEFLATED) as archive:
  for file in sorted(files):archive.write(root/file,file)
 with ZipFile(out/name) as archive:assert archive.testzip() is None
 print(name,hashlib.sha256((out/name).read_bytes()).hexdigest())
