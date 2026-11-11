# B2 — Guardado seguro y recuperación

Base de reversión: entrega B1 `508bc56`. Sin despliegue.

## Protección local

Cada documento nuevo y cada respaldo portátil incorporan SHA-256. Se valida la estructura y el hash antes de abrir o sustituir un documento. Los proyectos B1 sin hash se validan y adquieren hash en su siguiente escritura; los JSON V1/V2 siguen admitidos. Los recursos originales y todas las zonas permanecen dentro del documento.

Documento, miniatura y metadatos se escriben en una sola transacción. Guardado aparece solo después de `transaction.oncomplete`; cuota, interrupción o conflicto entre pestañas producen Error. Una revisión optimista impide sobrescribir cambios de otra pestaña. Los guardados en cola conservan su proyecto de destino y una copia inmutable.

Se conservan hasta tres respaldos por proyecto, elegibles por fecha mediante Recuperar respaldo. La restauración valida antes de modificar y retiene una copia de cuarentena de la versión sustituida. Un documento corrupto bloquea su autoguardado: no se reemplaza con el lienzo de inicio. Los proyectos nunca se eliminan para liberar espacio.

La migración del almacenamiento antiguo se confirma atómicamente, con marcador idempotente, catálogo y proyecto activo. La base antigua se mantiene intacta. Exportar en Mis proyectos crea un respaldo portátil con nombre, documento, recursos y hash; importar verifica y crea un proyecto nuevo.

## Pruebas y fallo resuelto

Pruebas unitarias y de navegador: cuota simulada, aborto durante escritura, conservación exacta del último registro y catálogo, indicador de error, recarga, historial, corrupción de hash, recuperación explícita y migración heredada. Regresión del gestor, veinte recorridos críticos de escritorio/móvil y ZIP estático extraído. Véanse resultados y capturas en `docs/evidence/cierre-b2`.

El primer ensayo de interrupción encontró un segundo aborto sobre una transacción ya terminada. Se protegió esa ruta; la repetición no produjo excepciones ni pérdida de datos.

## Límites y pendientes

IndexedDB no protege frente a borrado manual de datos del sitio, desinstalación o daño físico del dispositivo: conservar respaldos externos. Tres respaldos no son un historial ilimitado. Los hashes detectan cambios accidentales; no son firmas de autor. Persisten límites preventivos por documento. Offline y rendimiento se validan en B3/B4; dispositivos e impresión físicos pendientes.

## Reversión

Exportar los proyectos modificados. Volver al ZIP B1 o al commit `508bc56`, manteniendo IndexedDB: B1 lee `document` y `previous` de los registros nuevos. Los campos de integridad e historial se ignoran en B1, por lo que se pierde la protección de B2 mientras se usa esa versión, pero no se necesita borrar proyectos. Mantener los ZIP anteriores y no desplegar sin autorización.
