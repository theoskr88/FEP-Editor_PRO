> Informe histórico de Fase 1. Las suites actuales pueden actualizar las rutas antiguas de capturas; el ZIP de Fase 1 en entregables conserva la evidencia original.

# Resultados — consolidación Fase 1

Base: `0b5633e000f6062300ac3f6e75f9768249a14b55`, rama `auditoria/editor-v095`. Trabajo: `consolidacion/fase-1`. Entorno Linux con Node 24, Python 3 y Chromium `/usr/bin/chromium`, WebGL mediante SwiftShader. Fecha de revisión: 10 de noviembre de 2026. No hubo despliegues.

## Línea base y verificación posterior

| Comando | Antes | Después | Alcance |
|---|---:|---:|---|
| `npm ci` | Instalación correcta | Dependencias sin cambios | Three 0.170.0 y playwright-core 1.58.2, lockfile conservado |
| `npm test` | 18 aprobadas | 25 aprobadas | Validación, límites, migración, guardado diferido y orden de escrituras |
| `npm run test:regressions` | 3 aprobadas | 3 aprobadas | Arrastre sin salto y separación de ambas modalidades glitter |
| `npm run test:browser` | 29 aprobadas | 29 aprobadas | Escritorio, viewport táctil y sin WebGL; capas, JSON, glitter y rotación real de plancha |
| `npm run test:reliability` | No existía | 16 escenarios aprobados | Persistencia, recuperación, importación, impresión, WebGL, video y móvil |
| `npm run test:package` | No existía | 1 escenario, 7 verificaciones | ZIP extraído servido con HTTP estático, sin inyectar módulos de pruebas ni solicitar CDN |

Estos números describen escenarios y pruebas, no herramientas terminadas ni certificación comercial. Los comandos fallan con código de salida no nulo ante una aserción fallida; los informes de cada ejecución se guardan al terminar. Un intento inicial de la nueva prueba usó nombres de botones incorrectos y terminó por timeout; se corrigió el selector de prueba y se ejecutó completa. No se ocultó ni deshabilitó ninguna aserción para aprobar.

## Evidencia funcional

- Migración de JSON V1 con acabado antiguo: ocho productos conservados, arte intacto, acabado normal, aviso no bloqueante; sin controles/handlers/material de revelado por calor.
- Importación PNG/JPEG/WebP decodificada antes de añadir capas. Imagen corrupta, cabecera de 50000 px y proyecto con un activo válido seguido de otro corrupto no cambian el documento. No se redimensionan automáticamente los activos.
- Cambiar tamaño de imagen, añadir texto, glitter y posición: recuperación exacta del snapshot, incluidos los parámetros del producto, al recargar el mismo origen. Un campo de medida a medio escribir no invalida el documento guardado. Se comprueban copia anterior, copia actual dañada, cuota agotada y almacenamiento deshabilitado. Guardar JSON sigue funcionando cuando falla IndexedDB.
- Texto `HOLA`: cada canal de cada píxel de la salida espejo coincide con su posición horizontalmente reflejada. El lienzo/textura y el raster del visor mantienen la orientación normal al alternar espejo.
- PNG: dimensiones en píxeles de 20×9 cm a 300 ppp y pHYs=11811 píxeles/metro; JPEG: unidades JFIF en pulgadas y 300×300 ppp; PDF: MediaBox=20×9 cm convertido a puntos. No se confunde generación de archivo con prueba física.
- Plancha: dos artes de 20×9 cm caben en A4 con margen 0,5 cm y separación 0,3 cm, sin variar medidas; colisión y salida de márgenes se rechazan. Espejo verificado píxel a píxel sobre la hoja completa una sola vez. La prueba previa verifica rojo/azul tras rotación de 90°.
- Textura de taza: el texto editado cambia tanto el canvas como los píxeles WebGL renderizados. Tras exportar PNG, reabrir JSON, generar video y volver a editar, conserva la asignación de textura. PNG mockup con contenido y WebM con datos, decodificación y dimensiones de video válidas. La prueba no certifica calidad comercial de cada fotograma.
- Cámara frontal, iluminación y geometrías iniciales conservadas; 270° por defecto. A ese ángulo un elemento puede estar en la cara lateral/posterior: Ver elemento seleccionado permite verlo sin cambiar el ángulo del arte. Se corrigió el signo usado por ese botón para apuntar al elemento real.
- Viewport táctil 390×844: botones de texto, lienzo y vista frontal alcanzables con tap y scroll; herramientas con scroll independiente y foco visible. No hay dispositivos físicos conectados.

## Archivos de evidencia

- Antes: `evidence/fase1-baseline/browser.json` y `regressions.json`; el código exacto de base permanece en Git. `evidence/original-v095.png` corresponde al diagnóstico histórico anterior, no a una nueva ejecución de ese diagnóstico.
- Después: `evidence/browser.json`, `regressions.json`, `fase1-reliability.json` y `fase1-package.json` (incluye SHA-256 del ZIP de Pages probado).
- Escritorio, arte 2D, espejo y cámara frontal: `evidence/fase1-desktop-2d-3d.png`.
- Diseño visto sobre la taza: `evidence/fase1-design-on-product.png`.
- Plancha: `evidence/fase1-plancha.png`.
- Móvil: `evidence/fase1-mobile.png`; también se conservan capturas de la suite anterior.

## Entregas y límites

`scripts/package.py` genera ZIP de Pages con index.html en la raíz, app.js, plancha.js, src/ y vendor/, y ZIP de fuente con pruebas/documentación. Excluye node_modules, .git, cachés y paquetes generados. El ZIP estático fue extraído y probado con sus propias rutas; no solo con `node --check`. Los paquetes de esta rama se guardan en `entregables/` para permitir descarga desde GitHub privado.

Pendientes: impresora real y tolerancias físicas de sublimación; calibración comercial de UV/materiales/modelos; revisión humana de la apariencia comercial; Safari/iOS/Android físicos; carga prolongada y memoria en dispositivos de gama baja. La prueba automatizada móvil no equivale a compatibilidad física. No se añadió agrupación, selección múltiple, nuevos productos o efectos, backend, autenticación, pagos ni infraestructura remota. La plancha no se autoguarda. Almacenamiento local compartido entre pestañas: la última escritura prevalece; usar una sola pestaña por documento. Ver límites de memoria y reversión en CAMBIOS.md.

Estado: **prototipo validado en este entorno**, listo para revisión; no versión comercial certificada ni publicación a producción.
