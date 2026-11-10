# Resultados · Fase 3D

Base `463b1ac`, aceptada antes de iniciar 3D. Chromium Linux, SwiftShader y móvil emulado. Sin despliegues.

| Pruebas | Aprobadas |
|---|---:|
| Unidades | 68 |
| Aceptación crítica escritorio y móvil, incluido video en ambos | 20 |
| Texto curvo, tipografía, degradados, recorte, máscara, patrón, plantillas y recuperación | 15 |
| Stickers: 80 elementos, capas, archivos, espejo y 3D | 27 |
| Vector/SVG, nodos, booleanos y contornos | 15 |
| Inkscape: dimensiones, offset, espejo y SVG plano | 5 |
| GLB/glTF, materiales, recuperación y fallos | 4 |
| ZIP estático extraído | 22 comprobaciones |

La aceptación crítica repite inicio, seis pestañas, los nueve perfiles (ocho anteriores conservados), modo libre, capas, imágenes/stickers, glitter separado, autoguardado/JSON, PNG/JPEG/PDF con medidas, espejo completo píxel a píxel, plancha, corte SVG sin fotografías y video 360° descargado/decodificado en escritorio y móvil. Las suites extensas anteriores permanecen disponibles.

Los recorridos creativos cambian píxeles reales, verifican recorte/máscara conservando el PNG original, parámetros físicos de patrón, nueve capas nativas procedentes de tres plantillas y recuperación idéntica. Se descargan PNG/JPEG/PDF/SVG y se verifica el espejo del resultado con los efectos. Las líneas de corte siguen siendo paths y los efectos raster del SVG están identificados solo como impresión.

[Logs y JSON](evidence/fase3d/) · [Escritorio](evidence/fase3d/desktop-creative.png) · [Móvil](evidence/fase3d/mobile-creative.png) · [Catálogo de 80](evidence/fase3d/catalog-80.png).

Fallos iniciales y límites están documentados en el [informe técnico y reversión](CREATIVO_FASE3D.md). Quedan pendientes impresora/plotter físicos, dispositivos reales y URLs publicadas bloqueadas por el proxy. No se certifica uniformidad de fuentes de sistema entre equipos ni calidad comercial de fabricación.
