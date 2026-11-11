# B5 — Auditoría y consolidación del Cierre B

Base: entrega B4 `2947356`. Rama `desarrollo/cierre-b-v1`. No se ha publicado ni iniciado el empaquetado nativo.

## Resultado y alcance

Se consolida la misma aplicación y sus proyectos V1/V2: gestor local, autoguardado, respaldos, caché offline, múltiples zonas, diseño libre, capas, stickers, glitter imprimible y material físico, vectores, impresión y mockups. No se añadieron productos, herramientas visuales, temperaturas, cuentas, nube, suscripciones ni servicios pagos. Se conserva el repositorio oficial y cada entrega B1–B4 con su código y ZIP.

Los resultados reproducibles, capturas y fallos iniciales están en [evidencia B5](evidence/cierre-b5). `summary.json` resume las ejecuciones finales; `gate.json` confirma los controles y el SHA-256 del ZIP Pages realmente probado. Las incidencias previas y las pruebas físicas pendientes no se convierten en aprobaciones por sintaxis.

## Correcciones finales

- Escrituras con durabilidad estricta cuando el navegador la admite, con fallback transaccional para motores anteriores.
- Confirmación de activación antes de presentar otro proyecto. Si falla el puntero activo, el diseño y vínculo anterior permanecen intactos. La activación comprueba que el destino siga existiendo y rechaza revisiones preparadas obsoletas. Abrir el proyecto ya activo no necesita reescribir su puntero; se recuperan punteros históricos sin entrada en el catálogo.
- La recuperación devuelve la revisión comprometida y conserva la versión válida reemplazada en el historial seleccionable. Así se puede deshacer una recuperación equivocada. Un documento corrupto permanece en cuarentena y no sustituye respaldos válidos.
- Estado explícito Abriendo proyecto para no reutilizar una confirmación anterior durante la importación. Mensaje de falta de espacio en español, preservando el proyecto abierto.
- Pruebas históricas adaptadas a la biblioteca actual y al refresco asíncrono, sin retirar verificaciones de assets, exportaciones o recuperación. Sus evidencias se escriben en B5 y no sobrescriben las entregas anteriores.

## Pruebas

- Pruebas unitarias de geometría, proyectos, recursos, presupuestos, persistencia, integridad, cuotas, abortos, migración atómica, recuperación y durabilidad/fallback.
- Veinticuatro arranques y recargas en escritorio/móvil, combinando CPU ralentizada, APIs antiguas, Three diferido y ausencia de WebGL. Se comprueba almacenamiento y recuperación, no solo que aparezca HTML.
- Veinte proyectos variados por formato; cuarenta respaldos reales descargados e importados mediante la UI. Cada recorrido termina con cuarenta y dos proyectos, verifica imágenes originales, zonas ocultas y dimensiones, y recorre la segunda página del catálogo.
- Cuota e interrupción durante escrituras, corrupción del documento y de respaldos, restauración explícita, migración V1 y conflictos en dos pestañas reales. Los diseños en conflicto se rescatan mediante JSON y conservan sus IDs de destino.
- Sin WebGL: diseño libre, imagen, sticker, vectores, cinco exportaciones, plancha y recarga funcionan; fotografía y video 3D permanecen deshabilitados.
- Dos recorridos continuos de unos cinco minutos, uno por formato, con cambios de producto/zona, imágenes, textos, escenas, glitter, guardados y recargas. Se mide heap tras GC mediante CDP y recursos Three.js. Se comparan además dos vueltas de cuarenta aperturas de proyectos por formato. Los detalles y tolerancias constan en los JSON, no se declaran pruebas térmicas físicas.
- Regresiones de las diez zonas, áreas físicas, alpha de impresión, copias, deshacer, capas, importaciones, glitter, vectoriales, tipografía, patrones, escenas, sincronización 2D/3D, PNG/JPEG/PDF/SVG, espejo píxel a píxel, planchas, fotografías HD, vistas múltiples y video real decodificado.
- SVG de corte auténtico validado en Inkscape 1.4: importación y regrabado como trazados, dimensiones 200 × 90 mm, raster de comprobación, PDF a escala y límites geométricos. No equivale a certificación universal de plotters.
- Offline con service worker real y red desactivada: recursos, diseños, todas las caras, exportaciones y video; actualización parcial rechazada y actualización completa conservando hashes de más de veinte proyectos y recursos de una pestaña anterior.
- ZIP Pages extraído y servido como sitio estático: se verifican dependencias, móvil, 3D, exportaciones, planchas y recursos locales sobre los archivos entregados.

## Incidencias documentadas

B2 encontró un doble aborto de transacción; B3 encontró mezcla de versiones en una pestaña anterior; B4 encontró superposición del menú móvil y completó la reasignación del modelo al volver de Diseño libre. Se corrigieron y repitieron sus pruebas antes de avanzar.

En B5, una prueba antigua esperaba el mensaje previo de importación; otra consultaba el botón 3D antes de que terminara la carga diferida. Se ajustaron las esperas, se hizo visible el estado de apertura y se conservan los registros iniciales. Los controles de puntero activo y reversión de una recuperación se ampliaron durante la revisión; se añadieron pruebas específicas.

El fallo aislado de inicialización observado durante una ejecución concurrente en B4 no se reprodujo en los veinticuatro arranques ni en los recorridos finales. No se atribuye a una causa que no se haya demostrado. Sigue siendo necesario comprobar almacenamiento bajo presión real en dispositivos físicos.

## Pendientes y límites

1. Android e iOS físicos: instalación, primer arranque completamente offline, importación/guardado/compartir nativos, límites de WKWebView/WebCodecs/MediaRecorder, segundo plano, interrupciones, permisos, almacenamiento lleno y pruebas prolongadas de memoria/temperatura. Corresponde al Cierre C; no hay APK/IPA ni se presenta la PWA como aplicación nativa.
2. Impresión y plotter físicos: escala final del controlador, color, márgenes y equipos reales. PDF/SVG/dimensiones se validaron digitalmente; no se declara compatibilidad universal.
3. El sitio web necesita una primera descarga completa para su caché offline. Una aplicación nativa futura deberá llevar esos recursos dentro del paquete y probarse sin precarga desde Internet.
4. IndexedDB pertenece al origen. Cambiar de dominio/preview o pasar a una app nativa requiere respaldos portátiles. Borrar datos del sitio o perder el dispositivo no permite recuperación sin respaldo externo. No existe almacenamiento remoto.
5. Cancelación cooperativa; JSON.parse, un render y canvas.toBlob no ofrecen aborto instantáneo. Los límites preventivos de memoria permanecen y no se rebaja calidad silenciosamente.

## Reproducción y entrega

`npm ci`, `npm test`; `python3 scripts/audit-b5.py` ejecuta secuencialmente las regresiones principales. Los recorridos suplementarios están en `tests/backup-census-browser.mjs`, `tests/no-webgl-browser.mjs`, `tests/conflict-browser.mjs`, `tests/activation-failure-browser.mjs`, `tests/soak-browser.mjs`, `tests/reliability-browser.mjs` y `tests/validate-svg.py`. Los últimos dos requieren las herramientas de navegador/documentos descritas en el entorno de pruebas. Las evidencias JSON y logs conservan los resultados concretos.

Después de cambiar el runtime: `python3 scripts/finalize-offline.py`, repetir las pruebas y `npm run package -- --phase CIERRE_B5`. Empaquetar no regenera silenciosamente los archivos probados. El ZIP Pages contiene los archivos en la raíz y `_headers`. No se ha desplegado.

## Reversión

Exportar los proyectos modificados. Utilizar el ZIP B4 o `git switch --detach 2947356` en una copia limpia del código. Mantener el origen y las bases IndexedDB: el esquema es compatible, no se necesita borrar proyectos. Una reversión distribuida por el actualizador offline debe llevar un runtime/manifiesto completo y otra versión verificada. Para una prueba manual, desregistrar únicamente el service worker del editor y borrar solo cachés `fep-editor-app-*`, nunca todos los datos del sitio. Al cambiar de origen, importar las copias portátiles. Conservar B1–B5 y solicitar autorización antes de publicar en producción.

## Cierre de la validación

Resultado final: **113 pruebas unitarias, 28 suites principales, 8 suites suplementarias y 32 controles del ZIP Pages aprobados**. Se incluyen 44 comprobaciones del recorrido de respaldos, 24 arranques y 12 recorridos offline/actualización. Los scripts son distintos conjuntos de comprobaciones y no se suman como si fueran funcionalidades únicas. El resumen y el gate enlazan los resultados con el hash del runtime entregado.

La última repetición offline observó un worker en espera no previsto en móvil. El servidor de prueba leía el workspace mutable mientras se aplicaban correcciones; se conservó el fallo, se fijó una copia inmutable de todos los recursos/manifiestos al iniciar el ensayo y se esperó el fin efectivo de la instalación. La repetición completa aprobó en ambos formatos. No se atribuye ese estado a una causa interna del navegador que no se haya capturado.

Se conservaron las cinco verificaciones originales de Inkscape (incluidos offset real y espejo geométrico) y se añadieron otras cinco de regrabado, raster y PDF a escala. Ambos informes se entregan. Los controles de grabado/corte físico siguen pendientes.
