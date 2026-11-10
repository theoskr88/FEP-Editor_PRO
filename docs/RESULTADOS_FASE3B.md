# Resultados · Fase 3B

Base `5b56756`. Chromium Linux, escritorio y móvil emulado, SwiftShader; Inkscape 1.4 para SVG. No se ha desplegado ni probado un plotter físico.

| Suite | Aprobadas |
|---|---:|
| Unidades | 61 |
| Arranque | 8 positivas y 4 fallos reproducidos deliberadamente |
| Regresiones básicas | 3 |
| Navegador previo | 29 |
| Fiabilidad y recuperación | 16 |
| Glitter y archivos de impresión | 33 UI + 3 archivos decodificados |
| Interfaz | 24 |
| Stickers | 27 |
| Diseño libre | 27 |
| Consolidación, recuperación lenta y límites | 5 + 2 + 2 |
| Vector en escritorio/móvil/sin WebGL | 15 |
| Aceptación crítica en escritorio y móvil, incluyendo video en ambos | 20 |
| Validación externa Inkscape | 5 |
| Paquete Pages extraído | 20 comprobaciones |

Evidencias: [fase3b](evidence/fase3b/), `tasks.txt`, `vector-final.txt`, `vector-browser.json`, `svg-validation.json` e `inkscape-log.txt`. SVG reales descargados: [impresión](evidence/fase3b/print.svg), [corte](evidence/fase3b/cut.svg), [corte reflejado](evidence/fase3b/cut-mirror.svg), y sus reexportaciones planas por Inkscape.

Se comparan áreas booleanas analíticas, agujeros de la O, offset con huecos, espejo y escala. El grupo de corte mide 44,1×40,1 mm incluyendo un trazo de 0,1 mm, resultado del offset de 2 mm sobre una figura de 40×36 mm. El reflejo cumple x+x_reflejado+ancho=200 mm. El corte no contiene imágenes ni texto vivo y no modifica el raster imprimible ni la textura 3D.

Se conservan inicio, navegación, modo libre, ocho productos, capas, stickers, glitter físico/imprimible, autoguardado, JSON, PNG/JPEG/PDF, espejo, planchas y video 360° con decodificación. La prueba de ZIP usa archivos extraídos y no inyecta código en la aplicación; exporta también SVG de corte desde móvil emulado.

Fallos encontrados: la selección inicial de operandos conservaba A=B; se corrigió la elección predeterminada y el test usa controles para elegir dos capas distintas. Inkscape advertía sobre feDropShadow; se reemplazó por filtros SVG 1.1 y se repitió su validación. La caché de npm del usuario no era escribible; se utilizó caché local. No se han rebajado las áreas ni las tolerancias esperadas.

[Captura escritorio](evidence/fase3b/desktop-vector-clean.png) · [Captura móvil](evidence/fase3b/mobile-vector-clean.png) · [Render por Inkscape](evidence/fase3b/inkscape-print.png).

Pendientes: plotter físico y software/drivers específicos, dispositivos reales, impresión física e inspección de dominios publicados (bloqueados por el proxy del entorno). No se declara compatibilidad universal. [Informe técnico y reversión](VECTOR_FASE3B.md).
