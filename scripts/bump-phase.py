"""Advance only live module references, test evidence directories and package name.
Run after the preceding phase's acceptance gate and immutable ZIP checkpoint.
"""
from pathlib import Path
import re,sys
phase=sys.argv[1].lower();assert phase in ['fase3b','fase3c','fase3d','fase3e','fase3f']
for p in [Path('app.js'),Path('plancha.js'),Path('index.html'),*Path('src').glob('*.js'),*Path('tests').glob('*.mjs'),*Path('tests').glob('*.py')]:
 s=p.read_text();s=re.sub(r'fase3[a-f]-20261110',phase+'-20261110',s)
 if p.name=='bootstrap.js':s=re.sub(r"release:'fase3[a-f]'",f"release:'{phase}'",s)
 if p.parent.name=='tests':s=re.sub(r'docs/evidence/fase3[a-f]',f'docs/evidence/{phase}',s);s=re.sub(r'FEP_EDITOR_PRO_FASE3[A-F]_',f'FEP_EDITOR_PRO_{phase.upper()}_',s)
 p.write_text(s)
p=Path('scripts/package.py');p.write_text(re.sub(r"default='FASE3[A-F]'",f"default='{phase.upper()}'",p.read_text()))
for sub in ['interface','compat/glitter']:(Path('docs/evidence')/phase/sub).mkdir(parents=True,exist_ok=True)
