"""Assemble independently verified B1–B5 deliveries without changing application files."""
from pathlib import Path
from zipfile import ZipFile,ZIP_STORED
import hashlib,json
root=Path(__file__).resolve().parents[1];out=root/'entregables';items={}
for number in range(1,6):
 phase=f'CIERRE_B{number}';source=out/f'FEP_EDITOR_PRO_{phase}_FUENTE.zip';pages=out/f'FEP_EDITOR_PRO_{phase}_PAGES.zip'
 with ZipFile(source) as s,ZipFile(pages) as p:
  assert s.testzip() is None and p.testzip() is None
  gate=json.loads(s.read(f'docs/evidence/cierre-b{number}/gate.json'));assert gate['testedRuntimeSha256']==hashlib.sha256(pages.read_bytes()).hexdigest()
  for name in p.namelist():assert p.read(name)==s.read(name),(phase,name)
 items[f'B{number}/'+source.name]=source.read_bytes();items[f'B{number}/'+pages.name]=pages.read_bytes();items[f'INFORMES/CIERRE_B{number}.md']=(root/f'docs/CIERRE_B{number}.md').read_bytes()
 screenshots={1:['desktop-projects.png','mobile-projects.png'],2:['desktop-recovery.png','mobile-recovery.png'],3:['desktop-offline.png','mobile-offline.png'],4:['desktop-performance.png','mobile-performance.png'],5:['desktop-acceptance-product.png','mobile-acceptance-product.png','desktop-library-pagination.png','mobile-library-pagination.png','desktop-soak.png','mobile-soak.png']}
 for name in screenshots[number]:items[f'CAPTURAS/B{number}/'+name]=(root/f'docs/evidence/cierre-b{number}'/name).read_bytes()
items['INFORMES/ALMACENAMIENTO_LOCAL.md']=(root/'docs/ALMACENAMIENTO_LOCAL.md').read_bytes();items['INFORMES/RESUMEN_PRUEBAS_B5.json']=(root/'docs/evidence/cierre-b5/summary.json').read_bytes()
items['LEEME.txt']='''FEP Editor PRO — Cierre B completo

B5 es la entrega actual. B1, B2, B3 y B4 son entregas independientes y puntos de reversión.
Cada carpeta Bn contiene código fuente completo y ZIP Pages, verificados contra su gate y entre sí.
Los informes incluyen cambios, pruebas, límites y reversión; los ZIP fuente contienen evidencias detalladas.
Las capturas de cada etapa están en CAPTURAS. SHA256SUMS.txt permite verificar todos los archivos.

Para desarrollo, extraer FUENTE. Para Pages, extraer PAGES y conservar todos sus archivos en la raíz,
incluidos sw.js, offline-manifest.json y _headers cuando existan. No mezclar archivos entre versiones.
No se ha publicado en producción. No desplegar sin autorización.

Los proyectos son locales y pertenecen al origen del navegador. Exportar/importar respaldos para
cambiar de dominio o dispositivo. No borrar IndexedDB al actualizar o revertir.
No hay APK/IPA en esta entrega. Android/iOS físicos, integración nativa, primer arranque offline
nativo e impresión/plotter físicos siguen pendientes para los cierres correspondientes.
'''.encode()
items['SHA256SUMS.txt']=('\n'.join(hashlib.sha256(data).hexdigest()+'  '+name for name,data in sorted(items.items()))+'\n').encode()
archive=out/'FEP_EDITOR_PRO_CIERRE_B_COMPLETO.zip'
with ZipFile(archive,'w',ZIP_STORED) as z:
 for name,data in sorted(items.items()):z.writestr(name,data)
with ZipFile(archive) as z:
 assert z.testzip() is None
 for name,data in items.items():assert z.read(name)==data
assert archive.stat().st_size<100*1024*1024,'GitHub per-file limit'
sha=hashlib.sha256(archive.read_bytes()).hexdigest();sums=out/'SHA256SUMS.txt';lines=[line for line in sums.read_text().splitlines() if not line.endswith('  '+archive.name)];lines.append(sha+'  '+archive.name);sums.write_text('\n'.join(lines)+'\n');print('PASS B1–B5 source/runtime gates, archive CRC and byte checks:',archive.name,archive.stat().st_size,sha)
