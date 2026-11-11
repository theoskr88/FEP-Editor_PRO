# B1 — Mis proyectos

Base: Cierre A `4507641`. Rama: `desarrollo/cierre-b-v1`. Sin despliegue.

## Cambios

Biblioteca local IndexedDB con catálogo ligero separado de documentos completos; interfaz de repositorio independiente del DOM, preparada para un adaptador de archivos nativo. No hay límite de número de proyectos: la capacidad depende de la cuota del dispositivo. Permanecen los límites preventivos por documento del editor.

Mis proyectos permite crear, abrir, buscar, ordenar, renombrar, duplicar, eliminar con confirmación y exportar/importar respaldos portátiles. Se muestran miniatura, tipo y fecha. Las imágenes originales, diseños libres y zonas inactivas se conservan en el JSON. Los guardados en cola capturan una copia y el identificador del proyecto antes de comenzar: cambiar de proyecto no redirige una escritura anterior.

El guardado anterior `fep-editor-documents` se conserva intacto. Una migración al primer inicio importa las versiones válidas en `fep-editor-library`. Los archivos JSON anteriores continúan admitidos; importar crea otro proyecto y no destruye el abierto. El estado Guardado corresponde a la finalización de la transacción IndexedDB.

## Verificación

Resultados reproducibles y capturas en `docs/evidence/cierre-b1`: pruebas unitarias, gestor de proyectos en Chromium escritorio y móvil emulado, recorrido crítico de regresión y ejecución del ZIP Pages extraído. Las pruebas del repositorio incluyen veinte proyectos y retención de recursos originales. No se han probado dispositivos físicos ni impresión física.

## Pendientes de las siguientes etapas

B2: historial recuperable, integridad, conflictos entre pestañas y simulación de cuota/interrupción. B3: actualización atómica offline. B4: memoria y carga prolongada. B5: auditoría integrada. IndexedDB pertenece al origen del navegador; borrar los datos del sitio elimina proyectos. Se recomienda exportar copias portátiles. No se declara empaquetado móvil ni compatibilidad universal de plotters.

## Reversión

Guardar primero los proyectos nuevos mediante Exportar en Mis proyectos. Conservar esta entrega completa. Para volver al comportamiento previo usar los ZIP Cierre A o `git switch --detach 4507641` en una copia del repositorio. Cierre A lee su base original intacta, pero no la biblioteca nueva: los proyectos de B1 se abren allí mediante sus JSON nativos (el respaldo del gestor contiene el documento en la propiedad `document`). La reversión del código nunca exige borrar IndexedDB. No reemplazar archivos de producción sin autorización.
