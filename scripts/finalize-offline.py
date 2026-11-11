"""Finalize a content-addressed local runtime before tests, never during deployment."""
from pathlib import Path
import re,hashlib,json
root=Path(__file__).resolve().parents[1]
files=[root/'index.html',root/'app.js',root/'plancha.js']+sorted(p for folder in ['src','vendor'] for p in (root/folder).rglob('*') if p.is_file())
textfiles=[p for p in files if p.suffix in ['.html','.js','.css'] and p.parent.name!='vendor']
pattern=r'(?:cierre-[ab]\d?-20261111|fep-[a-f0-9]{16}|FEP_BUILD_TOKEN)'
canonical={p:re.sub(pattern,'FEP_BUILD_TOKEN',p.read_text()) for p in textfiles}
worker=re.sub(pattern,'FEP_BUILD_TOKEN',(root/'sw.js').read_text());worker=re.sub(r"MANIFEST_DIGEST='[^']+'","MANIFEST_DIGEST='FEP_MANIFEST_DIGEST'",worker)
hash=hashlib.sha256(worker.encode());hash.update((root/'scripts/offline-legacy.json').read_bytes())
for p in sorted(files):hash.update(str(p.relative_to(root)).encode());hash.update(canonical[p].encode() if p in canonical else p.read_bytes())
build='fep-'+hash.hexdigest()[:16]
for p,s in canonical.items():p.write_text(s.replace('FEP_BUILD_TOKEN',build))
(root/'sw.js').write_text(worker.replace('FEP_BUILD_TOKEN',build))
manifest={'build':build,'legacy':json.loads((root/'scripts/offline-legacy.json').read_text()),'files':[{'path':str(p.relative_to(root)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(files)]}
encoded=json.dumps(manifest,indent=2)+'\n';(root/'offline-manifest.json').write_text(encoded);(root/'sw.js').write_text((root/'sw.js').read_text().replace('FEP_MANIFEST_DIGEST',hashlib.sha256(encoded.encode()).hexdigest()))
print('Offline runtime:',build,len(files),'verified local assets')
