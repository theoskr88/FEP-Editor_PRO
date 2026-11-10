# Resultados · Fase 3E

Chromium Linux, escritorio y móvil emulado, renderizador SwiftShader. Base `c4c1906`, aceptada antes de iniciar 3E. Sin despliegues.

| Pruebas | Aprobadas |
|---|---:|
| Unidades | 72 |
| Inicio, APIs ausentes y errores de módulos | 8 (más 4 reproducciones negativas) |
| Aceptación crítica escritorio/móvil | 20 |
| Escenarios, materiales, fotografía HD, video y recuperación | 8 |
| MediaRecorder sin WebCodecs | 1 |
| Video real, ffprobe/ffmpeg: fotogramas, fps/duración, tamaño y cambio de vista | 4 |
| Catálogo GLB/glTF y recuperación/fallos | 4 |
| Diseño creativo, exportaciones y recuperación | 15 |
| ZIP Pages extraído y servido sin ayudantes | 24 comprobaciones |

La aceptación crítica incluye inicio, pestañas, todos los productos, diseño libre, capas, stickers, glitter separado, autoguardado/JSON, PNG/JPEG/PDF físicos, espejo real, plancha, corte SVG y video descargado/decodificado en ambos tamaños de pantalla. Los ensayos específicos prueban cinco escenarios, luz/cámara reales sobre el canvas visible, arte intacto, textura y rugosidad, glitter físico, PNG de 1920×1080, recuperación idéntica y edición después de exportar.

[JSON y logs](evidence/fase3e/) · [Escritorio](evidence/fase3e/desktop-mockup.png) · [Móvil](evidence/fase3e/mobile-mockup.png) · [Foto HD](evidence/fase3e/mockup-HD.png) · [Video verificado](evidence/fase3e/video-360.webm).

[Fallos corregidos, límites y reversión](MOCKUPS_FASE3E.md). Pendientes: dispositivos reales, rendimiento de captura en otros codecs/navegadores, calibración comercial, impresión/plotter físicos y comprobación del sitio publicado. No se certifica compatibilidad universal.
