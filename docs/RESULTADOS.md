# Resultados · Fase 3C

Base aceptada: `ec00383` (3B). No se inició esta fase hasta cerrar su puerta de aceptación y conservar sus ZIP. Sin despliegues.

| Prueba | Aprobadas |
|---|---:|
| Unidades, incluidas geometría GLB, perfiles y variantes | 64 |
| Arranque, escritorio/móvil/APIs antiguas/fallos provocados | 8 positivas + 4 reproducciones deliberadas |
| Aceptación crítica escritorio y móvil | 20 |
| GLB/glTF, textura real, materiales, medidas, recuperación y fallos | 4 |
| Recuperación libre con Three lento y APIs antiguas | 2 |
| Consolidación de capas y resize | 5 |
| ZIP Pages extraído, incluido GLB y SVG de corte | 21 comprobaciones |

La aceptación crítica recorre todos los nueve perfiles, conservando los ocho IDs anteriores; comprueba inicio y seis pestañas, diseño libre, texto, imagen, stickers, capas (duplicado, opacidad, bloqueo, visibilidad, orden e historial), glitter físico excluido del arte, glitter imprimible incluido, JSON y autoguardado, PNG/JPEG/PDF, espejo de todos los píxeles, plancha a medidas reales y video 360° descargado y decodificado **en escritorio y móvil emulado**. También se descarga SVG de corte sin fotografías. Las suites extensas de las fases anteriores se conservan; esta fase ejecuta la aceptación crítica más las pruebas específicas y de arranque/recuperación.

Las pruebas específicas miden el cuerpo del GLB de 100×100×3 mm y sus UV [0,1], verifican textura vigente mediante píxeles renderizados, la malla Printable con escala 1×0,8 al reducir a 10×8 cm, color del material y metalness 0,75. Se comprueba recarga con variante y color, selección rápida, glTF JSON con buffer embebido como respaldo y fallo de ambos formatos sin impedir texto/exportación 2D.

El primer recorrido falló porque la imagen no actualizaba el modelo: una carga asíncrona conservaba una textura anterior. Se vinculó la textura actual al adjuntar el recurso y se repitió la aserción de píxeles. El fallo original queda en `profiles-log.txt` y la repetición en `profiles-final.txt`. No se considera suficiente que exista un canvas.

Evidencia: [fase3c](evidence/fase3c/), `unit-final.txt`, `boot.json`, `acceptance.json`, `profiles-browser.json`, `free-recovery.json`, `consolidation.json`, `package.json` y logs. [Escritorio](evidence/fase3c/desktop-profile.png) · [Móvil](evidence/fase3c/mobile-profile.png) · [Flujo Producto](evidence/fase3c/desktop-acceptance-product.png) · [Diseño libre](evidence/fase3c/desktop-acceptance-free.png).

La calibración es digital. **Pendientes:** medición del soporte físico, muestras e impresión real, dispositivos físicos, plotter y verificación de URLs públicas (bloqueadas por el proxy). No se afirma que el modelo sea una referencia certificada de fabricación. [Informe y reversión](CATALOGO_FASE3C.md).
