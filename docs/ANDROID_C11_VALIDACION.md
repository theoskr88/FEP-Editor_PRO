# FEP Editor PRO Android C1.1 — validación pendiente

Rama: `desarrollo/android-cierre-c`.
La versión web aprobada en Cloudflare NO se ha modificado.

## Cambios incluidos
- Guardado de PNG/PDF/SVG/JSON mediante el selector de documentos Android; web mantiene descarga.
- Botones de cámara y galería mediante Capacitor Camera; las fotografías usan el mismo pipeline y presupuesto de capas de imagen.
- Alternativa para video 360° en MP4/H.264 con MediaCodec local cuando WebM/MediaRecorder no están disponibles en Android WebView. Renderiza fotogramas reales del visor.
- Superficies de madera, mármol y tejido rediseñadas y eliminación de utilería geométrica de la mayoría de escenas.
- Dependencias y plugins Android empaquetados mediante GitHub Actions; sin servicios externos en tiempo de uso.

## Pendientes obligatorios antes de aprobar
1. CI completamente verde con APK válida y SHA-256.
2. Prueba de guardado PNG con ACTION_CREATE_DOCUMENT y lectura del archivo desde Archivos.
3. Cámara real, orientación EXIF, galería y persistencia después de cerrar.
4. MP4 reproducible con giro completo y audio ausente por diseño; verificar decodificador H.264 real, duración y diferentes productos.
5. Calidad de escenas y memoria de GPU en teléfonos de gama baja; el rediseño sigue siendo procedimental, no una biblioteca fotográfica.
6. Compatibilidad y rendimiento de todos los formatos y exportación de zonas múltiples.
7. Confirmar que no se eliminaron proyectos ni se cambiaron sus esquemas.

La ejecución de GitHub Actions garantiza solo compilación, NO las pruebas en hardware.
Los proyectos se guardan localmente y la desinstalación borra los datos internos; exportar respaldos antes de sustituir o desinstalar.
No publicar en Google Play hasta completar pruebas y firma comercial.
