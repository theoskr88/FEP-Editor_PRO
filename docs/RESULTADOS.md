# Resultados — Fase 2A: glitter

Base oficial: `60c27819008984db124046cec669a8c87f24c9c3`, rama `consolidacion/fase-1`; ZIP fuente verificado contra los archivos versionados. Rama actual: `mejora/glitter-fase2a`. Se conserva el mismo editor. Linux, Node 24, Python 3 y Chromium `/usr/bin/chromium` con SwiftShader. No hubo despliegues ni cambios en FEP Market.

## Tareas y evidencia

| Tarea | Resultado | Qué verifica |
|---|---:|---|
| `npm test` | 36 aprobadas | 25 previas más 11 de color, migración V1/V2, esquema nuevo, determinismo, geometría irregular, mapas y caché acotada |
| `npm run test:regressions` | 3 aprobadas | Arrastre, material excluido del raster, glitter imprimible incluido |
| `npm run test:browser` | 29 aprobadas | Capas, JSON, ocho productos, rotación real de plancha, escritorio/táctil/sin WebGL |
| `npm run test:reliability` | 16 escenarios aprobados | Importación atómica, persistencia/respaldo, medidas/espejo, WebGL, PNG mockup y WebM con material físico glitter activo |
| `npm run test:glitter` | 33 escenarios UI + 3 comprobaciones de archivos | Color y capa en tres modos; PNG/JPEG/PDF descargados realmente y decodificados |
| `npm run package` | Pendiente de empaquetado final | ZIP de Pages y ZIP fuente separados, sin despliegue |
| `npm run test:package` | Pendiente de ejecución | Se servirá el ZIP extraído sin instrumentación de pruebas |

Los escenarios de UI se ejecutan en escritorio 1500×980, viewport táctil 390×844 y escritorio con WebGL deshabilitado. Las 3 comprobaciones de archivos son en escritorio. Los resultados combinan pruebas y escenarios de integración; no equivalen a funciones terminadas o certificación comercial. No se deshabilitaron aserciones de las suites anteriores.

Log de tareas: `evidence/fase2/tasks.log`. Informes estructurados: `evidence/fase2/glitter-browser.json`, `evidence/fase2/print-files.json`, `evidence/browser.json`, `evidence/regressions.json`, `evidence/fase1-reliability.json`. La prueba del ZIP genera `evidence/fase2/package.json` con el SHA-256 exacto probado. Las suites conservan algunos nombres históricos de salida de Fase 1; corresponden a la ejecución actual. Para evidencia histórica exacta usar el ZIP de Fase 1 conservado.

## Prueba decisiva y aislamiento

- Seleccionar Dorado sincroniza el selector a `#d5ab42`. Cambiarlo a `#1249FF` activa Personalizado y el promedio de píxeles de la miniatura pasa a azul. Antes de Aplicar, el documento conserva ambas capas; después cambia solo la seleccionada. Undo/Redo conserva las demás. Comprobado en los tres modos de navegador.
- El material físico tiene su propio estado. Su cambio a azul produce píxeles azules en WebGL, sin cambiar los hashes de PNG/JPEG/PDF del arte. Sin WebGL se mantienen edición, miniatura y exportación 2D; no se afirma que el material se renderice allí.
- Los parámetros de material, borrador imprimible y capa aplicada pueden ser diferentes. Se conservan al guardar/abrir JSON y al recuperar IndexedDB, tanto en modo imprimible como en modo material. Aplicar queda deshabilitado al recuperar modo material.
- Ocultar, bloquear, duplicar, opacidad y Undo/Redo de glitter no cambian otra capa. Restablecer en cada destino no modifica el otro. Texto HOLA y fotografía sintética rojo/azul quedan por encima de la base y se comprueban sus píxeles en exportación. Una segunda imagen verde añadida tras exportar actualiza el arte y sigue asignada al material de impresión del modelo.
- La escena se puede girar sin regenerar mapas ni mosaicos de la caché. Se comprueban límites de resolución y entradas. El patrón imprimible se conserva al repintar y no incorpora aleatoriedad por fotograma.

## Impresión, medidas y video

- Los botones reales descargan PNG, JPEG y PDF normales y en espejo. Se decodifican los dos rasters de cada formato, incluido el JPEG incrustado en PDF. Para HOLA a 20×9 cm, cada posición se compara con su reflejo horizontal: PNG coincide en todos los canales; en JPEG/PDF se compara geometría de tinta con tolerancia del 3 % por compresión con pérdida. La ejecución final observó 0 píxeles de máscara discordantes en PNG, 16 sobre 80664 en JPEG y 12 sobre 80660 en PDF; las pequeñas diferencias de JPEG/PDF son compatibles con su compresión con pérdida.
- Se conservan 2362×1063 píxeles a 300 ppp para 20×9 cm; pHYs de PNG, JFIF de JPEG y MediaBox físico del PDF se comprueban en la suite de fiabilidad. La comparación geométrica no invierte solo el orden de los caracteres. La textura del editor y el visor no cambian al alternar espejo.
- Dos piezas de 20×9 cm caben en A4 con margen de 0,5 cm y separación 0,3 cm, sin escalado automático. Rotación real de píxeles, colisión, márgenes y espejo una sola vez siguen cubiertos. La nueva prueba abre la ventana de impresión, espera que se decodifique el PNG y comprueba la llamada a `window.print` con un espía. El diálogo nativo y la salida de impresora no están comprobados.
- PNG mockup y WebM se generan después de editar/reabrir; el video se prueba con material glitter activado y se decodifica con dimensiones positivas. Después se vuelve a editar para verificar la asignación de textura. No se certifican FPS ni calidad de cada fotograma, especialmente en dispositivos físicos.

## Capturas actuales

- `evidence/fase2/desktop-editor.png`: selector personalizado azul, miniatura, arte, espejo y diseño sobre taza. La cámara se giró para mostrar simultáneamente texto/foto; la posición inicial aprobada no cambió.
- `evidence/fase2/desktop-physical-blue.png`: producto azul sin capa glitter imprimible.
- `evidence/fase2/touch-editor.png` y `touch-physical-blue.png`: viewport móvil táctil.
- `evidence/fase2/noWebGL-editor.png`: composición utilizable sin WebGL.
- `evidence/fase2/plancha.png`: A4 con dos artes a escala.

Las imágenes cargadas son figuras sintéticas de prueba, no fotos de clientes. Los cambios y límites de implementación están en [GLITTER_FASE2A.md](GLITTER_FASE2A.md).

## Pendientes y alcance comercial

No se probaron impresoras reales, sublimación física, Safari/iOS/Android físicos ni rendimiento prolongado en teléfonos. La rugosidad, metalicidad y clearcoat son una aproximación PBR de la purpurina; no una calibración óptica. No hay HDR, microgeometría, refracción ni validación comercial de los modelos. El glitter imprimible sigue siendo color raster, no un material reflectante producido por una impresora corriente. El rendimiento comprobado es el de este entorno y viewport emulado.

Se conservan los límites de activos, autoguardado local, importación atómica y ocho productos. La plancha no se persiste; usar una sola pestaña por documento. No se añadieron cuentas, pagos, suscripciones, servicios remotos, modelos nuevos ni otros efectos. Estado: prototipo validado para revisión, no versión comercial certificada. Reversión a `60c2781` documentada, sin publicar a producción.
