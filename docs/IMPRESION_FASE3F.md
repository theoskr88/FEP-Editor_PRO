# Fase 3F · Trabajos de impresión

Base aceptada: `f525eb4` (3E). Se amplía la plancha existente, su lienzo y sus exportaciones; no se introduce otra aplicación ni se cambia el documento del editor. Las piezas procedentes del diseño actual conservan sus centímetros y excluyen las capas de corte y el glitter físico.

## Distribución y dimensiones

El distribuidor trabaja en centímetros con rectángulos libres, orden por tamaño y elección de espacio residual. Crea hasta 20 hojas de un mismo formato con hasta 500 piezas; permite girar 90° opcionalmente, conservando las medidas y la rotación anterior. No reduce piezas para hacerlas caber ni promete una distribución matemáticamente óptima. Si una pieza no cabe o excede los límites, no se aplica ninguna de las posiciones propuestas.

Se conservan papel A4/A3/Carta/Oficio/personalizado, orientación, posiciones manuales, arrastre, duplicación, giro y eliminación. Se añaden copias por lote (1–100 adicionales), selección de hoja y PDF de todo el trabajo. Las piezas se seleccionan y arrastran solo en la hoja visible. Después de eliminar piezas puede haber huecos o una hoja vacía intermedia; **Ordenar automáticamente** vuelve a compactar el trabajo.

El margen se mide desde el papel hasta el espacio reservado completo. El sangrado de 0–10 mm extiende los píxeles del borde hacia fuera: el arte central no cambia de tamaño. Las marcas usan trazos de 0,2 mm, segmentos de 3 mm y distancia de 1 mm desde el sangrado. El distribuidor reserva ese espacio más la separación entre piezas. La comprobación bloquea exportación por desbordamiento, superposición o separación insuficiente; los cambios manuales nunca escalan automáticamente el diseño.

## Calidad y salida

El panel de verificación muestra errores y avisos, con contador visible incluso cerrado. Calcula la resolución efectiva a partir de píxeles originales, centímetros y giro, y avisa por debajo de aproximadamente 300 ppp. Una imagen sin densidad física declarada se incorpora a 300 ppp con advertencia persistente; modificar sus centímetros actualiza la resolución efectiva. PNG pHYs y JPEG JFIF leen ambos ejes por separado. No se interpretan unidades EXIF/TIFF adicionales; verificar manualmente los centímetros cuando el archivo solo incluya esos metadatos.

Las imágenes externas se inspeccionan antes de decodificar: PNG/JPEG, 25 MiB por archivo, 11812 píxeles por lado, 40 megapíxeles por imagen y 80 megapíxeles distintos por trabajo. Las copias comparten la misma imagen. Los límites originales de imágenes del editor no se amplían. Cada hoja de salida tiene un máximo de 40 megapíxeles a 300 ppp y el PDF completo un máximo de 100 MB. Las páginas se rasterizan y comprimen secuencialmente; no se mantienen todos los lienzos de página a la vez. Los controles de plancha se bloquean durante la generación para evitar cambios a mitad del archivo.

PNG y JPEG conservan metadatos de 300 ppp. PDF de hoja visible y diálogo nativo siguen disponibles. El PDF multipágina incluye un MediaBox físico exacto por página y JPEG de alta calidad a 300 ppp: es un archivo de impresión raster, no un archivo vectorial de corte. Las dimensiones raster se redondean al píxel más próximo (hasta medio píxel de diferencia); el tamaño físico del PDF es independiente de ese redondeo. El espejo se configura por trabajo y se aplica una sola vez al lienzo final, incluidas las marcas; es independiente del espejo individual del editor. PNG/JPEG/Imprimir usan la hoja visible y **PDF todas las hojas** exporta el trabajo completo.

La plancha es temporal, igual que antes: el autoguardado y JSON del editor conservan el diseño, no la distribución del trabajo. Descargar el PDF antes de cerrar; la persistencia de trabajos queda pendiente. No hay servicio de impresión ni selección automática de impresoras. Al imprimir se debe elegir papel correcto, escala 100 % y verificar márgenes físicos; el controlador puede aplicar opciones adicionales.

## Validación y fallos

[Resultados y evidencias](RESULTADOS_FASE3F.md). Durante la implementación, una inserción de interfaz también alcanzó el control de separación de patrones y duplicó tres identificadores. Se eliminó la inserción fuera de la plancha y se repitieron las pruebas de interfaz con comprobación de identificadores únicos. Otra prueba asumía altura inicial de 9 cm cuando el producto original abre en 8,5 cm: se configuraron explícitamente 20×9 cm antes de comprobar su conservación.

La primera validación externa del PDF exigía píxeles negros neutros a 72 ppp: el texto es azul y las marcas finas quedan suavizadas. Se separó la comprobación de contenido oscuro de las marcas grises, conservando las pruebas de importación sin errores y dimensiones físicas. El PDF abierto y rasterizado se adjunta como evidencia. Las pruebas de navegador verifican sangrado rojo/azul y marcas negras a 300 ppp, espejo completo sin diferencias, PDF de tres páginas, metadatos con densidades distintas y edición posterior.

Pendientes: impresión y plotter físicos, dispositivos móviles reales, calibración de margen/color/resolución por impresora y comprobación de los sitios publicados bloqueados por el proxy. No se declara compatibilidad universal con plotters ni se presenta fotografía como contorno de corte.

## Reversión

Conservar los ZIP de la Fase 3E y descargar el JSON del diseño y PDF del trabajo antes de revertir. Restaurar el contenido completo del paquete `FASE3E_PAGES` o trabajar desde `f525eb4` en una rama de recuperación. No mezclar módulos de fases distintas; limpiar caché del origen si es necesario. IndexedDB y JSON del editor mantienen su formato; la plancha temporal no se migra. Este procedimiento no publica ni borra datos automáticamente.
