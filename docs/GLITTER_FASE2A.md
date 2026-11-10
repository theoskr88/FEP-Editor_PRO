# Fase 2A — glitter por capas y material de producto

Base oficial comprobada: rama `consolidacion/fase-1`, commit `60c27819008984db124046cec669a8c87f24c9c3`. El ZIP fuente de Fase 1 coincidía byte a byte con sus archivos versionados. Rama de esta entrega: `mejora/glitter-fase2a`. No se creó otro editor, no se tocó FEP Market y no hubo despliegues.

## Uso y decisión de interfaz

Todos los controles permanecen en la columna izquierda. Un único selector **Ajustar** distingue dos destinos con una frase y una miniatura:

- **Glitter imprimible (capa):** paletas rápidas Rosado/Dorado/Plateado/Azul/Multicolor y selector libre **Color del glitter**. Elegir Dorado sincroniza el selector a `#d5ab42`; moverlo a `#1249FF` cambia inmediatamente a Personalizado y muestra azul en la miniatura. La capa seleccionada cambia solo con **Aplicar a capa seleccionada**, si está desbloqueada. Las demás capas y el material físico se conservan. **Añadir glitter al arte imprimible** crea una capa por debajo de texto e imágenes usando la miniatura actual.
- **Glitter del producto (solo mockup):** elegir Glitter en Acabado del producto activa este destino. Los controles actualizan el material de taza/vaso 3D sin modificar el arte plano. Aplicar a capa queda deshabilitado; se puede volver al modo imprimible explícitamente.
- Seleccionar una capa glitter carga sus parámetros en el borrador imprimible, sin cambiar el material físico. **Restablecer parámetros** afecta al destino actual: en modo imprimible, solo el borrador hasta Aplicar; en modo material, actualiza el mockup. Valores iniciales: rosado, partícula 3, intensidad 65 y brillante.
- La opacidad, ocultación, bloqueo, duplicación y orden siguen en Capas. Undo/Redo registra la aplicación a capas, sin aplicar cambios a las demás. El historial de materiales sigue fuera del Undo de capas de Fase 1; se conserva mediante JSON, autoguardado y versión anterior.

Si se usa Añadir glitter mientras se ajusta el material, esa acción explícita copia los parámetros visibles a una capa nueva y cambia al modo imprimible; no hornea el mockup en el PNG. No se añaden efectos ajenos ni el acabado antiguo de calor.

## Color y migración

El documento JSON sigue en **versión 2**, con lectura V1/V2. Se conservan los campos `palette`, `color`, `size`, `intensity`, `finish`; se añade `glitterSchema: 2` para identificar la semántica nueva. `glitter` guarda el material físico; `glitterDraft` guarda el borrador imprimible; `glitterMode` guarda el destino activo; cada capa conserva su `glitter` independiente.

Antes de esta entrega, una paleta Dorado ignoraba su campo color, incluso si el JSON contenía rosado o azul. `migrateLegacyGlitter()` mantiene el **color que se veía**: normaliza ese tinte ignorado al dorado efectivo. Personalizado conserva su color libre y Multicolor sigue siendo multicolor. Se aplica al material y a cada capa al preparar la importación, antes de tocar el documento abierto. Desde `glitterSchema: 2`, un color libre distinto al acceso rápido es Personalizado y manda sobre la paleta. La migración es idempotente y tiene pruebas V1/V2; la migración del acabado de calor a normal sigue activa.

JSON, IndexedDB, estado de guardado y restauración anterior conservan ambos destinos, incluso cuando la miniatura pendiente tiene otro color que la capa aplicada. Importación atómica, límites de activos y medidas de Fase 1 permanecen.

## Render y rendimiento

- Polígonos de 5–7 vértices, proporciones y radios variables, una segunda faceta y pocos destellos finos. No se usan rectángulos como partículas. Semilla fija 1769: el patrón no salta al redibujar ni gira aleatoriamente con la cámara.
- Mapas de color, normales y rugosidad con la misma distribución. `MeshPhysicalMaterial` combina acabado, metalicidad moderada, clearcoat y normales; la iluminación y la cámara cambian los reflejos. No se recalculan partículas por fotograma.
- Los cambios de material se agrupan con requestAnimationFrame y se aplican a los materiales existentes; no se reconstruye la geometría por mover un deslizador. La miniatura y las capas usan una caché LRU, reutilizada por lienzo, textura y exportaciones.
- Mapas del mockup: 1024×512 en escritorio, 512×256 con entrada táctil, viewport estrecho o memoria declarada de 4 GB o menos. No se multiplican por el DPR de Retina. Cinco superficies raster compartidas (color, normales, rugosidad, arte transparente y máscara) equivalen aproximadamente a 10 MiB RGBA en escritorio o 2,5 MiB en móvil antes de copias/mipmaps de GPU.
- Las capas imprimibles usan mosaicos fijos 1024×512, para no cambiar su raster base al pasar de móvil a escritorio. Caché limitada a 8 entradas en escritorio y 4 en móvil (16 y 8 MiB RGBA); al expulsar un mosaico se libera su superficie. Son límites de estos recursos, no de toda la pestaña. Activos de imagen, canvas de exportación y memoria del navegador tienen costes adicionales.
- El material físico usa el arte del mockup con fondo transparente y una máscara inversa de cobertura. Fotos y texto quedan encima del revestimiento; el glitter físico no los recubre. Una capa imprimible opaca cubre el revestimiento en su área. El lienzo y las exportaciones siguen usando su fondo y sus capas habituales, sin material físico.
- Cámara frontal `(0,1,5.7)`, 270° iniciales, geometría y luces normales conservadas. Solo el acabado glitter cambia de material. El botón Ver elemento seleccionado y la rotación libre mantienen su función. Sin WebGL funcionan composición, glitter imprimible y exportaciones 2D; el mockup no se promete en ese caso.

## Archivos modificados

- `src/glitter.js`: color, migración, partículas, tamaños y propiedades de material.
- `src/glitter-cache.js` y `src/glitter-controls.js`: caché acotada y controlador de destinos/miniatura/reset.
- `src/project.js`: migración y normalización explícitas, con esquema JSON compatible.
- `app.js`: integración de arte transparente/máscara y materiales; persistencia de ambos destinos. Se protegió el cambio de fondo del visor cuando WebGL no está disponible.
- `index.html`: controles aditivos en herramientas, miniatura y texto de modo; sin rediseño general.
- `tests/core.test.mjs`, `tests/glitter-browser.mjs`, `tests/print-files.mjs`, `tests/reliability-browser.mjs`, `tests/harness.mjs`, `tests/package-browser.mjs`: pruebas de color real, aislamiento, archivos exportados y video con material activo.
- `package.json` y `scripts/package.py`: tarea adicional de pruebas y nombres de paquetes Fase 2A.
- README, informes y capturas en `docs/evidence/fase2/`.

## Límites de la simulación

Es una mejora del prototipo, no medición óptica ni simulación físicamente exacta de purpurina. No hay entorno HDR ni refracción por microgeometría real. Brillante/satinado/mate se aproximan con parámetros PBR; el acabado mate tiene destellos menores. La misma distribución se reutiliza en las superficies de la geometría original, incluidas zonas que todavía requieren calibración. Multicolor mezcla tonos discretos; no reproduce todas las distribuciones comerciales.

El glitter imprimible es color raster: una impresora de sublimación corriente no produce por sí misma escamas reflectantes. El tono del material en 3D varía con luz y gestión de color; no se promete un RGB visual exacto en cada reflejo. Las fotografías comerciales, pruebas físicas y revisión humana de acabado siguen pendientes. Las pruebas móviles son Chromium con viewport táctil, sin iPhone/Android físicos ni Safari. Headless comprueba preparación de la hoja e invocación de impresión con un espía en la frontera nativa; no comprueba el diálogo del sistema ni una impresora real.

## Paquetes y reversión

`npm run package` genera `FEP_EDITOR_PRO_FASE2A_PAGES.zip` (index.html en raíz, sin build ni CDN obligatorio) y `FEP_EDITOR_PRO_FASE2A_FUENTE.zip` (código, pruebas y documentación, sin cachés ni paquetes generados). Se guardan en `entregables/` después de validar el ZIP extraído mediante HTTP estático. No se publica a Cloudflare.

Para volver a la última versión funcional, conservar primero el JSON descargado y usar `consolidacion/fase-1` en `60c27819008984db124046cec669a8c87f24c9c3`, o sus ZIP de Fase 1 conservados en `entregables/`. No sobrescribir main ni hacer reset forzado de ramas compartidas. Si se integró Fase 2A, revertir sus commits con nuevos commits. Probar desde otro origen/puerto para aislar IndexedDB; no borrar datos del navegador como paso automático. Los colores libres nuevos se guardan como Personalizado y siguen siendo legibles en Fase 1, pero esa versión no conserva el borrador/destino separados y vuelve a su patrón rectangular anterior. Cualquier despliegue exige aprobación explícita.
