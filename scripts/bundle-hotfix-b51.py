"""Bundle tested B5.1 source, Pages, comparison evidence and B5 rollback. Never deploy."""
from pathlib import Path
from zipfile import ZipFile,ZIP_STORED
import hashlib,json
root=Path(__file__).resolve().parents[1];out=root/'entregables';ev=root/'docs/evidence/cierre-b51';items={}
source=out/'FEP_EDITOR_PRO_CIERRE_B51_FUENTE.zip';pages=out/'FEP_EDITOR_PRO_CIERRE_B51_PAGES.zip'
with ZipFile(source) as s,ZipFile(pages) as p:
 assert s.testzip() is None and p.testzip() is None
 gate=json.loads(s.read('docs/evidence/cierre-b51/gate.json'))
 assert gate['testedRuntimeSha256']==hashlib.sha256(pages.read_bytes()).hexdigest()
 for name in p.namelist():assert p.read(name)==s.read(name),name
for path in [source,pages]:items[path.name]=path.read_bytes()
items['INFORME/HOTFIX_B51.md']=(root/'docs/HOTFIX_B51.md').read_bytes()
for name in ['summary.json','gate.json','hotfix-browser.json','actions-browser.json','profile-browser-info.json']:
 items['INFORME/'+name]=(ev/name).read_bytes()
for width in [320,375,768,1440]:
 for name in [f'before-{width}.png',f'after-{width}.png',f'after-{width}-card.png']:
  items['CAPTURAS/'+name]=(ev/name).read_bytes()
items['CAPTURAS/B5-missing-bootstrap.png']=(ev/'before-missing-bootstrap.png').read_bytes()
items['REVERSION/FEP_EDITOR_PRO_CIERRE_B5_PAGES.zip']=(root/'tests/fixtures/b5-pages.zip').read_bytes()
items['LEEME.txt']='''FEP Editor PRO — Hotfix B5.1

FUENTE: código completo, pruebas y evidencias. PAGES: paquete estático completo probado.
INFORME: modificaciones, límites, resultados y procedimiento de reversión.
CAPTURAS: antes/después en 320, 375, 768 y 1440 px; tarjetas completas después.
REVERSION: Pages B5 original (601ae80), conserva los defectos conocidos de B5.

No mezclar archivos entre versiones. No borrar IndexedDB, proyectos ni respaldos.
Antes de revertir, guardar todos los trabajos y seguir HOTFIX_B51.md.
Las cachés pertenecen al origen; cambiar de dominio requiere respaldos portátiles.
No se ha desplegado en producción ni iniciado Cierre C. No hay APK/IPA.
La causa concreta del perfil de producción no fue confirmada: acceso al dominio
bloqueado por el proxy. Las instalaciones antiguas y dañadas fueron reproducidas
y corregidas en perfiles persistentes de Google Chrome Linux; móvil emulado.
Dispositivos físicos, Safari e impresión física siguen pendientes.

SHA256SUMS.txt verifica cada contenido. No incluye datos de proyectos reales.
'''.encode()
items['SHA256SUMS.txt']=('\n'.join(hashlib.sha256(data).hexdigest()+'  '+name for name,data in sorted(items.items()))+'\n').encode()
archive=out/'FEP_EDITOR_PRO_CIERRE_B51_COMPLETO.zip'
with ZipFile(archive,'w',ZIP_STORED) as z:
 for name,data in sorted(items.items()):z.writestr(name,data)
with ZipFile(archive) as z:
 assert z.testzip() is None
 for name,data in items.items():assert z.read(name)==data
assert archive.stat().st_size<100*1024*1024
sha=hashlib.sha256(archive.read_bytes()).hexdigest();sums=out/'SHA256SUMS.txt'
lines=[line for line in sums.read_text().splitlines() if not line.endswith('  '+archive.name)];lines.append(sha+'  '+archive.name);sums.write_text('\n'.join(lines)+'\n')
print('PASS source/Pages identity, rollback, CRC and all bytes:',archive.name,archive.stat().st_size,sha)
