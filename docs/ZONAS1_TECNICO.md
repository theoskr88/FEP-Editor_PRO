# Zonas múltiples · Entrega 1: polera y cojín

Base oficial: `4b78e28`, Fase 3F, última versión publicada en la rama de desarrollo al comenzar. Rama de trabajo: `desarrollo/zonas-textiles-entrega1`. No se modifica producción ni FEP Market. Esta entrega abarca polera y cojín; bolsa/libreta y biblioteca ampliada de escenarios permanecen para las entregas siguientes.

## Diseño y compatibilidad

El mismo motor, herramientas, pestañas y lienzo de edición atienden el documento de la zona seleccionada. Cada zona conserva sus propias capas, medidas en cm e historial de deshacer/rehacer durante la sesión; cambiar de cara no combina capas ni reasigna la misma textura a todas las superficies. El selector queda visible junto al lienzo, también en móvil, y orienta el modelo hacia la cara elegida.

Polera: frente 30×35 cm, espalda 30×35 cm y mangas izquierda/derecha 12×10 cm. Cojín: lados A/B de 28×28 cm. Son valores iniciales editables, no certificación de una talla o pieza fabricada. Manga izquierda corresponde al lado izquierdo de quien viste la prenda. Las zonas de ambos productos permanecen guardadas al cambiar de producto o entrar en Diseño libre. Al pasar de un documento convencional a un producto de zonas por primera vez se conserva el diseño en la primera zona; al cambiar entre los dos productos de zonas se mantienen documentos separados.

**Copiar diseño a esa zona** añade copias profundas de las capas y no borra el destino. Mantiene las dimensiones físicas del contenido, ajustando fracciones y tamaño tipográfico al lienzo destino; la posición mantiene el anclaje relativo. Si se superan límites de capas, tamaño o estilo, no se aplica una copia parcial. La operación se puede deshacer desde la zona de destino.

El documento sigue siendo V2, con la extensión opcional `zoneSchema: 1`, `productZones` y el bloque opcional `freeDocument`. La raíz conserva una vista completa de la zona activa para compatibilidad con lectores de una zona. JSON V1/V2 antiguos de polera/cojín se migran a la primera cara, manteniendo dimensiones y capas; las restantes nacen vacías. El importador valida y prepara todos los documentos, incluidos imágenes y stickers de caras ocultas, antes de reemplazar el proyecto abierto. Un error en cualquier cara conserva el proyecto completo anterior.

Autoguardado, recuperación y respaldo anterior incluyen todas las caras y ambos productos. Diseño libre conserva además su documento, formato y capas al volver desde un producto de zonas; no se sustituyen por las de la cara activa. El historial de acciones es de sesión, igual que antes. El presupuesto global de imágenes decodificadas y nodos no se amplía (32 MP y 200000 nodos); se aplica al conjunto de documentos. Cada zona admite hasta 500 capas. Los cambios y huellas de textura usan identificadores de imagen para no serializar base64 en cada movimiento táctil. El JSON de zonas admite hasta 100 MB de entrada para el bloque de compatibilidad duplicado de la cara activa; el límite de documentos convencionales sigue siendo 30 MB y la decodificación se verifica antes de asignar imágenes.

## Modelos y materiales

Se sustituyen las geometrías y planos provisionales de polera/cojín por GLB originales, con respaldo glTF de buffer incrustado. `scripts/textile-models.py` genera los modelos de forma reproducible, en metros, con triángulos indexados, normales y UV. Ambos archivos GLB pesan menos de 500 kB. Licencia CC0-1.0 y procedencia en `vendor/textile-models-LICENSE.txt`; no se redistribuyen escaneos, fotografías o modelos ajenos.

La polera tiene torso delantero y trasero suavemente curvados, escote abierto, bordes y mangas tubulares con puños. El cojín tiene volumen acolchado, esquinas recogidas y borde. Cada zona imprime sobre la superficie de la tela, no sobre un plano flotante. Se compone el arte con transparencia en el mapa de toda esa superficie, con trama normal, rugosidad, luces y sombras compartidas. Las caras traseras tienen orientación U externa correcta. Las mangas tienen UV circunferencial por longitud de arco y axial física, con atlas de 48×22 cm para cubrir el contorno variable; se comprueba que una marca de 12 cm mida 12 cm sobre el arco digital, evitando el estiramiento de parametrizar una elipse por ángulos iguales. no comparten el archivo del frente.

El visor mantiene todas las texturas de las caras al mismo tiempo. Editar una zona actualiza su mapa y mantiene los demás. La región del documento se ubica proporcionalmente a sus cm dentro de la superficie. Si el usuario solicita dimensiones mayores que el cuerpo de referencia, se avisa y el visor recorta el sobrante, sin comprimir el diseño; los archivos de producción mantienen sus dimensiones solicitadas. Calibración con una prenda/cojín físico sigue pendiente.

La cámara ajusta el encuadre de los textiles a su volumen y relación de aspecto, conservando la dirección elegida. Se mantienen cámaras, escenarios, materiales, colores, luz, rugosidad, textura opcional y sombras de 3E, así como las variantes de material. Glitter físico de taza/vaso, posición de 270°, geometría de los otros siete perfiles y los ocho productos históricos permanecen disponibles.

## Producción y fotografías

- Los botones PNG/JPEG/PDF/SVG existentes trabajan sobre la zona visible y conservan el espejo configurado. PNG textil conserva alfa; JPEG/PDF se componen sobre blanco, sin volver negras las transparencias. Las líneas de corte y el material glitter físico no se rasterizan artificialmente en impresión.
- **Todas las zonas · ZIP** contiene PNG a 300 ppp, manifest con cm/espejo y un JSON completo que se puede abrir en el editor. Se incluyen todas las caras, también las vacías. Las dimensiones raster se redondean al píxel más próximo; nunca se incorporan escenario, sombras o color base del producto al arte.
- **Añadir todas a la plancha** incorpora copias de las caras con medidas independientes, en lote y con presupuesto verificado. La distribución, márgenes, sangrado, marcas, avisos, espejo de trabajo y PDF multipágina siguen siendo los de 3F. Se añade A2 (42×59,4 cm), porque 30×35 cm no cabe en A3 con márgenes sin reducir el arte. No se escalan piezas para hacerlas caber.
- **Varias vistas · ZIP fotografías HD** exporta un PNG 1920×1080 por cara (o el ancho HD configurado), incluyendo el resto de diseños y el escenario actual. Restaura cámara, controles, encuadre y resolución después de capturar. Se bloquean entradas durante la captura para evitar mezclar productos/escenas.
- El botón de fotografía y el video 360° existentes utilizan el modelo completo, con todas las caras texturizadas. Permanecen WebCodecs y la alternativa MediaRecorder. No se envían imágenes a servicios externos.

La plancha continúa siendo temporal: descargar el PDF antes de cerrar. La persistencia de trabajos de impresión no forma parte de esta entrega.

## Fallos encontrados y corregidos

1. El generador GLB inicial entregó índices como ternas al escritor de escalares: se corrigió el aplanado del buffer y se verifican índices, dimensiones, curvas y UV con unidades y carga real en navegador.
2. La curva del dobladillo producía UV ligeramente mayores que 1: se ajustó la parametrización conservando el contorno dentro de su región física.
3. Una primera entrada al cojín heredaba las capas de la polera recién editada: se separó la inicialización entre productos de zonas, sin eliminar el comportamiento de transferencia desde documentos convencionales ni la migración de archivos antiguos.
4. El encuadre oblicuo podía cortar una manga: se ajusta la distancia a la esfera del volumen y al campo de visión horizontal/vertical.
5. El fondo transparente podía convertirse en negro al generar JPEG/PDF: se compone explícitamente sobre blanco para estos formatos. El PNG conserva alfa.
6. Una carga de imagen que terminaba después de cambiar de cara podía insertarse en el documento nuevo. El cambio de zona/producto/modo invalida la generación pendiente; la prueba retrasa deliberadamente el decodificador y confirma el aislamiento en escritorio y móvil.
7. El primer intercambio de modos recuperaba la cara de producto, pero descartaba los cambios temporales de Diseño libre. Se conserva ese documento opcional en el mismo proyecto, se validan sus imágenes ocultas y se prueba A3 con dos capas al alternar y después de una recarga fría.
8. Una comparación unitaria de medidas usaba igualdad binaria para 3,5 cm: se usa tolerancia numérica de 1e-9. Un ensayo de rechazo de importación esperaba otro texto de error; se corrigió la espera, conservando la comprobación de que el documento no cambia.

[Pruebas y evidencias](ZONAS1_PRUEBAS.md) · [Comparativa visual](COMPARATIVA_ZONAS1.md) · [Reversión](ZONAS1_REVERSION.md).
