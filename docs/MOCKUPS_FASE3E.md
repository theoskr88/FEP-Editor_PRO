# Fase 3E · Escenas, fotografía y video

Base aceptada: `c4c1906` (3D). Se amplía el mismo visor y documento V2 mediante un bloque opcional `mockup`. Los proyectos anteriores reciben el escenario original y conservan el fondo anterior. No se publica ni cambia el motor del editor.

## Cambios

- Escenarios propios: original, estudio, mesa, taller y comercial. Geometría, madera, cuadrícula, normales de cerámica y tejido se generan localmente, sin recursos de terceros que requieran licencias adicionales.
- Luz principal, relleno, ambiente, exposición, sombras, fondo y suelo editables. Ambiente PMREM con RoomEnvironment de Three (MIT). Materiales con rugosidad y textura opcionales; se conservan el glitter físico, sus parámetros y la textura imprimible independiente.
- Cámaras original, frontal, presentación, lateral y superior. La posición original de 270° sigue disponible. La escena y sus parámetros se recuperan con el proyecto.
- Fotografía PNG de 1280, 1920 o 3840 píxeles de ancho, 16:9. Espera carga del modelo y ambiente, oculta guías, restaura tamaño de visor, cámara y controles, y permite seguir editando.
- Video a 15/24/30 fps, 3–12 segundos y altura máxima elegida de 720/1080. WebCodecs codifica una vuelta completa con tiempos de fotograma controlados; la cola se limita y los VideoFrame se cierran. Si el navegador no admite esa ruta, permanece MediaRecorder en tiempo real. Se restauran cámara, guías, controles, sombras y resolución tras éxito o error.
- Render bajo demanda para reducir consumo en reposo y captura sin render duplicado durante exportación. Las pruebas comparan el canvas visible, sin forzar un render desde el ayudante de auditoría.

`webm-muxer` 5.1.4 se distribuye localmente bajo MIT. Su autor lo ha sustituido por Mediabunny: es una dependencia fijada, sin red ni servicio pago, que requiere seguimiento de mantenimiento. No se promete la misma disponibilidad de codec en todos los navegadores; la alternativa se prueba con WebCodecs ausente.

## Validación y fallos resueltos

[Resultados y capturas](RESULTADOS_FASE3E.md). La primera prueba comparaba coordenadas de cámara con igualdad binaria: se ajustó a tolerancia numérica de 1e-9. El ensayo de carga demorada usaba 4 segundos y resultó dependiente de la carga de CPU: ahora retiene explícitamente la petición, comprueba que el editor 2D funciona y después la libera.

El video en tiempo real con el renderizador software produjo inicialmente solo tres fotogramas en tres segundos. La ruta de fotogramas controlados genera y decodifica 72 fotogramas a 24 fps, con vistas diferentes durante la vuelta. El contenedor dura 2,958 s porque termina en la marca del último fotograma, dentro de un fotograma respecto de 3 s. La alternativa MediaRecorder depende del rendimiento del dispositivo y no ofrece esa garantía de cadencia.

No cambian los píxeles del arte al modificar luz, escenario, cámara, material físico o calidad de video. Los límites del modelo GLB y la aproximación visual del glitter continúan vigentes. Escenarios estilizados; calibración fotográfica comercial, dispositivos reales y medición física pendientes. Las URLs públicas siguen sin comprobarse por el bloqueo del proxy del entorno, anterior al servidor de destino. No se ha desplegado.

## Reversión

Conservar los ZIP anteriores y exportar el proyecto JSON antes de cambiar de versión. Para volver a 3D, usar ambos paquetes `FASE3D` o el commit `c4c1906` en una rama de recuperación. Sustituir el contenido completo del directorio servido para evitar mezclar módulos; limpiar la caché del origen. Los campos nuevos opcionales pueden ser ignorados por la versión anterior: conservar el JSON original si se desea recuperar los ajustes de escena posteriormente. No borrar IndexedDB para una reversión normal. No se ejecuta ninguna publicación automática.
