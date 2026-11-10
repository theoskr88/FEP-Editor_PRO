# Pruebas · zonas múltiples, entrega 1

Base `4b78e28`. Chromium Linux con SwiftShader; escritorio de 1500×980 y móvil emulado de 390×844. Las capturas comparativas anteriores se tomaron de la base 3F antes de editar; el ayudante permite repetirlas desde ese commit. No se prueban teléfonos ni impresoras físicos.

| Suite | Aprobadas |
|---|---:|
| Unidades y contratos de proyecto/modelos/ZIP | 89 |
| Aceptación crítica escritorio y móvil | 20 |
| Zonas: polera y cojín, escritorio y móvil | 26 |
| Transparencias florales, JPEG/PDF, importación atómica, fallback y sin WebGL | 15 |
| Migración de proyectos históricos y error de ambos formatos de modelo | 6 |
| Carrera de importación de imagen al cambiar de zona | 2 |
| Diseño libre A3: capas y formato tras alternar modos y recargar | 2 |
| Catálogo, GLB/glTF, materiales y recuperación anteriores | 4 |
| Interfaz directa escritorio, móvil y sin WebGL | 24 |
| Inicio y APIs/módulos ausentes | 8 (más 4 reproducciones negativas) |
| Regresión de impresión 3F | 12 |
| ffprobe/ffmpeg sobre los dos videos reales de textiles | 2 |
| Poppler: PDF consolidado de polera en dos hojas A2 | 1 |
| ZIP Pages extraído y servido sin sondas de auditoría | 30 comprobaciones |

Los JSON de resultados y logs están en [evidence/zonas1](evidence/zonas1/). `gate.json` identifica la base, resultados y hash del runtime exacto probado; el empaquetado verifica CRC y contenido del ZIP. El ZIP fuente contiene código, pruebas, modelos, licencias, informes y evidencia; Pages contiene solo el runtime estático.

## Qué se comprobó

- Seis documentos con medidas y capas independientes; caras vacías iniciales, textos distintos en frente/espalda/mangas y lados A/B, materiales UV separados y curvas reales de los modelos. Se comprueba que no se reutiliza la misma imagen en todas las caras.
- Copia aditiva entre caras, medidas físicas, separación de estilos y deshacer/rehacer por zona. Guardado automático, reapertura y JSON con recuperación idéntica de caras visibles y ocultas.
- Proyectos antiguos con texto, imagen, sticker y glitter se migran sin alterar capas ni dimensiones, en escritorio y móvil. Un archivo corrupto en una cara oculta deja intacto el proyecto abierto. La ausencia de GLB usa glTF incrustado; si ambos fallan se mantiene la edición por cara y la descarga PNG. Sin WebGL permanece el diseño 2D.
- Una flor PNG transparente se compone sobre la superficie curva: el mapa conserva exactamente `#c5d7cf` en regiones sin tinta, incluidas áreas dentro del rectángulo imprimible. No aparece un fondo blanco añadido artificialmente. Luz, sombras y rugosidad actúan sobre la misma tela y el arte. JPEG/PDF individual se componen sobre blanco y PNG mantiene alfa.
- ZIP de todas las zonas con CRC válido, manifest, PNG a 300 ppp y centímetros distintos por cara. Los archivos de impresión no cambian al seleccionar otro escenario. Las descargas individuales PNG/JPEG/PDF identifican producto/zona en el nombre.
- ZIP de vistas HD con un PNG de 1920×1080 por cara, imágenes diferentes y editor operativo tras la captura. Video real de cada textil descargado y decodificado en ambos tamaños de pantalla; análisis independiente de los archivos de escritorio: 45 fotogramas a 15 fps para 3 segundos, duración dentro de un fotograma y fotogramas frontal/posterior distintos. No es una certificación de rendimiento de hardware.
- Planchas consolidadas de cojín y polera con medidas originales. El runtime estático genera un PDF de dos hojas A2 con las cuatro zonas de polera y MediaBox de 1190,551181×1683,779528 puntos por hoja. Se mantiene la prueba 3F de sangrado, marcas, resolución, espejo exacto y PDF multipágina.
- La aceptación crítica conserva inicio, seis pestañas, perfiles de producto, sincronización 2D/3D, Diseño libre, capas, stickers, glitter físico/imprimible, autoguardado, PNG/JPEG/PDF, SVG de corte, espejo, planchas y video. La interfaz directa también comprueba ausencia de identificadores duplicados y errores JavaScript/shaders.

## Evidencia para revisar

[Comparación antes/después](COMPARATIVA_ZONAS1.md) · [Polera floral](evidence/zonas1/desktop-shirt-floral.png) · [Cojín floral](evidence/zonas1/desktop-cushion-floral.png) · [Móvil](evidence/zonas1/mobile-shirt-floral.png).

[ZIP real de impresión de polera](evidence/zonas1/desktop-shirt-print.zip) · [Vistas HD de polera](evidence/zonas1/desktop-shirt-views.zip) · [Video de polera](evidence/zonas1/shirt-360.webm) · [Video de cojín](evidence/zonas1/cushion-360.webm) · [Plancha de polera A2](evidence/zonas1/polera-zonas-A2.pdf).

## Pendientes y límites

- Calibración de talla, manga, tela, relleno, color y zona física sobre productos reales. Los GLB son referencias paramétricas originales, no escaneos fotogramétricos ni simulación de caída dinámica de tela.
- Impresoras/plotters físicos y dispositivos móviles reales; otros navegadores y codecs. No se declara compatibilidad universal con plotters.
- Si se supera la superficie digital de referencia, el mockup avisa y recorta; el archivo de impresión conserva sus cm. Un PNG de entrada que contenga un fondo blanco opaco lo conserva: se respeta su contenido, no se elimina automáticamente.
- La distribución de planchas continúa temporal. Antes de revertir se deben conservar el JSON completo y los ZIP de todas las caras.
- Bolsa/libreta multizona y nuevos escenarios (mármol, cafetería, ambiente textil, degradados y demás biblioteca solicitada) pertenecen a las siguientes entregas y no se han iniciado.
- No se inspecciona ni modifica el despliegue público desde esta entrega. No hay publicación en producción, temperaturas, autenticación, pagos o suscripciones.

[Informe técnico y fallos corregidos](ZONAS1_TECNICO.md) · [Procedimiento de reversión](ZONAS1_REVERSION.md).
