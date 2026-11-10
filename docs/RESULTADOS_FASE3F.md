# Resultados · Fase 3F

Base `f525eb4`, aceptada antes de iniciar 3F. Chromium Linux, SwiftShader, escritorio y móvil emulado; escenario adicional sin WebGL. Sin despliegues.

| Pruebas | Aprobadas |
|---|---:|
| Unidades, geometría, límites, resolución, metadatos y PDF | 81 |
| Aceptación crítica escritorio/móvil | 20 |
| Trabajos de impresión reales en ambos tamaños | 12 |
| Poppler: importación, MediaBox y rasterización del PDF descargado | 3 |
| Inicio y fallos de carga/APIs | 8 (más 4 reproducciones negativas) |
| Interfaz directa, escritorio/móvil/sin WebGL | 24 |
| ZIP Pages extraído y servido sin código de auditoría | 25 comprobaciones |

La aceptación crítica repite todos los productos, inicio y pestañas, diseño libre, capas, imágenes/stickers, glitter independiente, guardado/recuperación, PNG/JPEG/PDF, espejo real, planchas, SVG de corte sin fotos y video 360° descargado/decodificado en escritorio y móvil.

Los recorridos de impresión generan nueve piezas de 20×9 cm y un PDF de tres hojas A3, verifican sangrado de 1 mm, marcas, separación, identidad de tamaños, selección de página, PNG 3508×4961 y JPEG. El espejo de toda la hoja tiene cero diferencias de píxeles respecto al reflejo del PNG normal. Una imagen de baja resolución muestra aviso antes y después de exportar. Otra imagen usa densidades distintas X/Y para comprobar centímetros por eje. Una distribución imposible conserva todas las posiciones, y el editor sigue operativo después de exportar y cerrar la plancha.

[JSON y logs](evidence/fase3f/) · [Escritorio](evidence/fase3f/desktop-print.png) · [Móvil](evidence/fase3f/mobile-print.png) · [PDF real de tres páginas](evidence/fase3f/print-job.pdf) · [PDF rasterizado con Poppler](evidence/fase3f/print-pdf-page.png).

[Fallos, límites y reversión](IMPRESION_FASE3F.md). No se realizaron impresión física, uso de un plotter, pruebas en teléfonos físicos ni publicación en producción. Persistencia de trabajos de plancha y metadatos de densidad EXIF adicionales quedan pendientes.
