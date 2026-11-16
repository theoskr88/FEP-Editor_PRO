# FEP Editor PRO — cierre Android y evolución 3D original
Fecha de referencia: 2026-11-16
Rama de trabajo: desarrollo/android-cierre-c

## Regla de publicación
No considerar una APK lista por pasar Gradle. Las cuatro funciones de Android deben producir artefactos legibles y conservar el documento local después de reiniciar la app.

## P0 — Android estable (bloqueante)
1. Instalación y arranque en emulador con screenshot, package dump y logcat.
2. Capturar foto: activar cámara, aceptar imagen, verificar nueva capa persistida, recuperar tras cierre.
3. Importar PNG/JPEG/WebP con y sin transparencia, foto grande y varias imágenes. Prohibido confirmar éxito sin crear la capa.
4. Exportar mockup PNG: seleccionar destino, reabrir desde almacenamiento, decodificar dimensiones y píxeles no vacíos; preservar marca de agua solo comercial.
5. Video 360: obtener MP4, validar contenedor/moov, duración, primer/último frame, visibilidad del diseño, apertura por reproductor Android.
6. Error visible y diagnosticable; sin archivos vacíos ni confirmaciones falsas.

## P1 — Escenarios fotográficos propios
Los recursos de referencia de terceros solo sirven para investigar capacidades. Crear recursos nuevos, propios o redistribuibles con licencia compatible.
- Modelos GLB originales de estudio, mesa, escritorio, cafetería y ambiente textil.
- Materiales PBR con mapas de albedo, rugosidad y normales coherentes, formatos compactos, iluminación PMREM/IBL y sombras de contacto.
- Presentaciones por producto: taza, vaso, polera, cojín, tote, libreta; comprobar escala, ubicación y cámara.
- Presupuestos móviles: memoria GPU, polígonos, texturas, mipmaps, 30 fps interactivos en dispositivo objetivo.
- Nunca hornear el escenario en el arte de impresión.

## P2 — Biblioteca y diseño
- Más modelos originales solo después de calibrar los actuales.
- Marcas de agua de texto/logotipo: vista previa, opacidad, posición, repetición y exportación protegida.
- Recorte de fondos: actual solución de color uniforme es básica; para personas y objetos complejos evaluar modelo local con licencia comercial verificada y opción manual.
- Plantillas originales y fuentes con licencias redistribuibles.

## Evidencias mínimas de cada entrega
- Commit, rama, ejecución GitHub Actions, hash SHA-256, APK.
- Prueba automatizada del build + emulador.
- Captura de cada flujo y archivos PNG/MP4 reales adjuntos.
- Pruebas físicas explícitas y pendientes señalados; no afirmar compatibilidad general sin ejecutarlas.
- Copia de seguridad de proyectos antes de actualizar.
