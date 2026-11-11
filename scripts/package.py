#!/usr/bin/env python3
"""Build two local ZIPs without deploying or including development caches."""
import argparse,hashlib,subprocess,re
from package_manifest import source_files
from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
root=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--out',default='/workspace/deliverables');p.add_argument('--phase',default=re.search(r"release:'([^']+)'",(root/'src/bootstrap.js').read_text())[1].upper().replace('-','_'),choices=['FASE2D','FASE3A','FASE3B','FASE3C','FASE3D','FASE3E','FASE3F','ZONAS1','CIERRE_A','CIERRE_B1','CIERRE_B2','CIERRE_B3','CIERRE_B4','CIERRE_B5','CIERRE_B51']);args=p.parse_args()
out=Path(args.out).resolve();out.mkdir(parents=True,exist_ok=True)
runtime=['index.html','app.js','plancha.js','_headers']+([name for name in ['sw.js','offline-manifest.json'] if (root/name).exists()])+[str(p.relative_to(root)) for folder in ['src','vendor'] for p in (root/folder).rglob('*') if p.is_file()]
source=source_files(subprocess.check_output(['git','ls-files','-z'],cwd=root).decode().strip('\0').split('\0'),args.phase)
for name,files in [(f'FEP_EDITOR_PRO_{args.phase}_PAGES.zip',runtime),(f'FEP_EDITOR_PRO_{args.phase}_FUENTE.zip',source)]:
 with ZipFile(out/name,'w',ZIP_DEFLATED) as archive:
  for file in sorted(files):archive.write(root/file,file)
 with ZipFile(out/name) as archive:assert archive.testzip() is None
 print(name,hashlib.sha256((out/name).read_bytes()).hexdigest())
