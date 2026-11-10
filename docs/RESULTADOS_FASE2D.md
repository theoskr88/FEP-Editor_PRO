# Resultados · Fase 2D

Base `fadca4c` · rama `desarrollo/interfaz-fase2b`. Chromium Linux, WebGL SwiftShader y móvil emulado. Sin despliegue.

| Comando | Aprobadas |
|---|---:|
| `npm test` | 50 |
| `npm run test:boot` | 8 escenarios positivos; 4 fallos reproducidos intencionalmente |
| `npm run test:regressions` | 3 |
| `npm run test:browser` | 29 |
| `npm run test:reliability` | 16 |
| `npm run test:glitter` | 33 recorridos + 3 archivos descargados y decodificados |
| `npm run test:interface` | 24 |
| `npm run test:stickers` | 27 |
| `npm run test:consolidation` | 5 |
| `npm run test:package` | 16 comprobaciones del ZIP extraído |

Evidencias completas: [fase2d](evidence/fase2d/), incluido `tasks.txt`, JSON de cada suite, `consolidation-log.txt` y `package-log.txt`. Las cantidades no son una certificación de impresión comercial.

Las pruebas de regresión verifican los ocho productos, pestañas, texto/imagen/stickers, glitter imprimible y físico separados, historia, medidas, 270°, autoguardado y respaldo, importación atómica, espejo real, PNG/JPEG/PDF a 300 ppp, plancha y video 360° con decodificación. La prueba del paquete sirve archivos reales extraídos, sin inyección de código de diagnóstico.

## Hallazgos

- Se reprodujo una lista de capas con **altura cero a 1024×600**. Se compactó el inspector y se reservó un área desplazable mínima; el recorrido de 75 capas comprueba ese tamaño además de escritorio grande y móvil.
- El tirador permitía dimensiones mayores que las admitidas por JSON. Se limitó el gesto conservando proporción; el proyecto resultante pasa el validador.
- La selección desde lienzo y tras ordenar se revela dentro de la lista sin modificar el scroll en redibujos corrientes. Los nombres largos ya no expanden el inspector.
- Se ajustó la captura móvil para esperar a que finalice la transición CSS del panel; una captura previa mostraba el panel todavía fuera de pantalla. No se ocultó ni forzó el DOM para tomar la captura.
- La restauración de respaldo espera al renderizador de stickers antes de sustituir el documento.

[Escritorio con 75 capas](evidence/fase2d/desktop-layers-75.png) · [1024×600](evidence/fase2d/compact-layers-75.png) · [Móvil](evidence/fase2d/mobile-layers-75.png).

Pendientes: inspección de los dominios públicos (bloqueados por el proxy del entorno), impresión física y dispositivos reales. No se declara realizada ninguna de esas pruebas. [Cambios y reversión](CONSOLIDACION_FASE2D.md).
