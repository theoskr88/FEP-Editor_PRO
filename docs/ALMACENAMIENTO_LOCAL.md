# Contrato de almacenamiento local

La biblioteca usa `fep-editor-library`, versión 1, con stores `projects`, `catalog` y `settings`. La base histórica `fep-editor-documents` no se modifica ni elimina. No se emplea localStorage para imágenes o proyectos.

## Adaptador

`openProjectLibrary` entrega operaciones asíncronas: `get`, `catalog`, `summaries`, `list`, `create`, `save`, `rename`, `duplicate`, `remove`, `active`, `activate`, `history`, `restore`, `migrateLegacy`, `setting` y `close`. La implementación no depende del DOM. La validación estructural se puede inyectar; el editor prepara y decodifica todos los recursos antes de aplicar un documento importado o recuperado.

`createProjectSession` captura ID, copia inmutable y miniatura antes de encolar una escritura. Guarda la revisión esperada por proyecto; otra pestaña no puede reemplazar silenciosamente una revisión posterior. La cola de autoguardado confirma éxito exclusivamente después del compromiso de la transacción. Se solicita `durability: strict` en escrituras; navegadores sin esa opción conservan la transacción convencional. La prueba física de corte de energía no se ha realizado.

Para el futuro adaptador nativo se deben mantener esas garantías: documento, catálogo y revisión coherentes, sustitución atómica, rechazo de conflictos, historial limitado y validación antes de reemplazar. Un futuro sistema de archivos deberá escribir en temporal y confirmar de forma recuperable; no basta con devolver éxito al iniciar una escritura. No se ha implementado un plugin nativo en este cierre.

## Registros y compatibilidad

Documento: JSON nativo V1/V2, normalizado por el editor; `zoneSchema: 1` para zonas. Se conservan dimensiones físicas, capas, assets originales en data URL, diseños de caras inactivas y el documento libre asociado. No se serializan objetos HTMLImageElement (`img`).

Proyecto: `{id, document, digest, revision, backups, previous}`. Hash SHA-256 del documento serializado. Hasta tres respaldos validados; `previous` permite revertir a las entregas B1. Una recuperación conserva la versión sustituida en `quarantine`. Los registros B1 sin hash se validan y adquieren hash en su siguiente escritura. Los índices del historial pueden tener huecos si un respaldo está corrupto; la UI conserva el índice original al restaurar.

Catálogo: ID, nombre, tipo, producto, fechas y miniatura pequeña. Las tarjetas leen resúmenes y solo las miniaturas visibles. Veinticuatro tarjetas por página no representan un límite de proyectos. La cuota depende del navegador y dispositivo; nunca se eliminan proyectos automáticamente.

Respaldo portátil: `{format: 'fep-project', version: 1, name, digest, document}`. El hash cubre el documento, no es una firma ni cifrado. La importación valida el hash si existe, prepara imágenes y crea otro proyecto. Los JSON nativos anteriores siguen admitidos.

## Origen y actualización

IndexedDB pertenece al origen. `sublima.fepmarket.com`, `sublifep.pages.dev`, un preview y localhost no comparten proyectos automáticamente. Para cambiar de origen o pasar a una futura app nativa, exportar/importar respaldos. Una biblioteca vacía en otro origen no implica que se haya borrado la anterior.

La caché `fep-editor-app-*` solo contiene aplicación y recursos incluidos. El service worker nunca abre IndexedDB. El botón de actualización solicita un guardado confirmado y espera a que terminen exportaciones. No borrar datos del sitio para actualizar o revertir el código: desregistrar y limpiar exclusivamente la caché de aplicación si fuera necesario. Borrar los datos del navegador, desinstalar o perder el dispositivo exige un respaldo externo para recuperar el trabajo.

La activación puede recibir la revisión del documento preparado y debe rechazarla si ya cambió. El cambio del puntero comprueba la existencia del proyecto dentro de la transacción. La UI solo aplica el documento después de confirmar esa activación; ante un fallo de presentación suspende su autoguardado y conserva el registro válido. `restore` devuelve `{document, revision}` comprometidos; la versión válida reemplazada permanece en el historial para poder deshacer la recuperación.
