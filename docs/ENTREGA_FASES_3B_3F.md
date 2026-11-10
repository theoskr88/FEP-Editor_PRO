# Entrega secuencial · Fases 3B a 3F

Base oficial `theoskr88/FEP-Editor_PRO`, Fase 3A `5b56756`. Una sola aplicación y rama de desarrollo `desarrollo/interfaz-fase2b`. Cada fase se implementó después del cierre de aceptación y los paquetes de la anterior. No se modificó FEP Market ni se publicaron versiones en producción.

| Fase | Implementación | Pruebas y capturas | Paquetes y punto de reversión |
|---|---|---|---|
| 3B | [Vector/SVG, fuentes, booleanos y contornos](VECTOR_FASE3B.md) | [Resultados](RESULTADOS_FASE3B.md) | `FASE3B` · checkpoint `ec00383` · volver a `5b56756` |
| 3C | [Perfiles y GLB/glTF propios](CATALOGO_FASE3C.md) | [Resultados](RESULTADOS_FASE3C.md) | `FASE3C` · checkpoint `463b1ac` · volver a `ec00383` |
| 3D | [Tipografía, patrones, máscaras, stickers y plantillas](CREATIVO_FASE3D.md) | [Resultados](RESULTADOS_FASE3D.md) | `FASE3D` · checkpoint `c4c1906` · volver a `463b1ac` |
| 3E | [Escenas, materiales, fotografía HD y video](MOCKUPS_FASE3E.md) | [Resultados](RESULTADOS_FASE3E.md) | `FASE3E` · checkpoint `f525eb4` · volver a `c4c1906` |
| 3F | [Distribución, calidad, sangrado y PDF multipágina](IMPRESION_FASE3F.md) | [Resultados](RESULTADOS_FASE3F.md) | `FASE3F` · volver a `f525eb4` |

Cada par de ZIP `FUENTE`/`PAGES` permanece en [entregables](../entregables/), con [SHA-256](../entregables/SHA256SUMS.txt). Fuente incluye código versionado, pruebas, documentación, recursos con licencia y evidencia acumulada hasta su fase; excluye `node_modules`, cachés y otros ZIP. Pages incluye únicamente archivos ejecutables estáticos, con `index.html` en la raíz. El paquete de una fase posterior incluye las funciones anteriores, y los paquetes anteriores se conservan sin regenerarlos.

## Evidencia de aceptación

Las cinco fases pasan los mismos 20 recorridos críticos de escritorio y móvil: inicio, navegación, diseño libre, productos y sincronización real 2D/3D, capas, stickers, glitter, autoguardado/JSON, PNG/JPEG/PDF físicos, espejo exacto, planchas, corte SVG sin fotografías y video 360° descargado y decodificado. Se agregan pruebas específicas por fase y pruebas del ZIP real extraído sin ayudantes. Los archivos `docs/evidence/fase3*/gate.json` identifican base y hash del paquete estático probado. Las unidades avanzan de 61 a 81 pruebas.

La geometría vectorial se importa y reexporta con Inkscape; PDF multipágina se abre y rasteriza con Poppler; video se analiza con ffprobe/ffmpeg. Las fallas iniciales y sus correcciones se describen en cada informe, con logs conservados. Una verificación local no equivale a aprobación de hardware o producción.

## Pendientes transversales

- Plotters e impresoras físicos, controladores y dispositivos móviles reales. No se declara compatibilidad universal con plotters; SVG de corte contiene trazados, no fotografías incrustadas.
- Calibración física y visual comercial de perfiles/materiales. Se conservan los ocho productos y se añade un panel GLB/glTF propio CC0; no se incluyen modelos sin licencia ni se afirma calibración de una pieza fabricada.
- Persistencia de trabajos de plancha, fuentes/idiomas sin contornos disponibles, metadatos EXIF adicionales y diferencias de tipografías de sistema. El informe de cada fase precisa límites y alternativas.
- Sitios `sublima.fepmarket.com` y `sublifep.pages.dev`: el proxy del entorno impide establecer la conexión (CONNECT 403 antes del origen). El error previo de export de glitter está corregido y cubierto en pruebas locales; no se atribuye un estado actual al sitio público sin acceder a él.
- Seguimiento de mantenimiento de webm-muxer fijado localmente bajo MIT, ya sustituido por otro proyecto por su autor. La ruta MediaRecorder continúa probada como alternativa; su cadencia depende del rendimiento del navegador.

No hay autenticación, pagos, suscripciones, IA de pago, temperaturas de sublimación ni taza mágica. No hay publicación automática desde estos paquetes. Antes de una publicación autorizada se debe respaldar el JSON, seleccionar un paquete completo, verificar su SHA-256 y conservar el anterior para reversión.
