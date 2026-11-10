# Resultados de esta intervención

- Unitarias: **18/18**, `npm test`.
- Navegador: **29/29**, `npm run test:browser` (10 escritorio, 10 viewport táctil, 9 sin WebGL).
- Regresiones focalizadas: **3/3**, `npm run test:regressions`.
- Total: **50 comprobaciones aprobadas**. No equivalen a 50 herramientas terminadas.
- `git diff --check`: sin errores de espacios.
- Revisión por patrones de credenciales y archivos sensibles: 0 coincidencias; no es una auditoría de seguridad exhaustiva.

Las 3 regresiones comparan desplazamiento con el punto de agarre y raster de exportación: exclusión del glitter físico e inclusión del glitter imprimible. La prueba de plancha compara píxeles rojo/azul tras girar. Las pruebas de importación verifican que el estado completo no cambie con un documento inválido.

Evidencias JSON: `evidence/browser.json`, `evidence/regressions.json`, `evidence/baseline.json`. Capturas: `evidence/editor-glitter.png`, `evidence/desktop.png`, `evidence/touch.png`, `evidence/noWebGL.png` y `evidence/original-v095.png`. Las capturas de desktop/touch/noWebGL muestran la plancha durante las pruebas, no escenas de venta.

No se probaron impresoras reales, sublimación, Safari/iPhone/Android físicos, vídeo, rendimiento prolongado ni calibración comercial de modelos. La reacción visual del material usa iluminación Standard de Three.js y sigue siendo aproximada. Agrupación, selección múltiple, autoguardado y las herramientas profesionales pendientes están detalladas en AUDITORIA.md.

No se desplegó a Cloudflare ni a Google Cloud. No se integró Firebase Authentication, pagos ni almacenamiento remoto. La interfaz base y las herramientas originales se conservaron con controles aditivos; el original exacto permanece en el commit inicial.
