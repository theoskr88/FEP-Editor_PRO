# Cierre A · Experiencia y calidad visual

Base oficial `theoskr88/FEP-Editor_PRO`, última entrega funcional `ac9bedf` (ZONAS1). Rama `desarrollo/cierre-a-v1`. Se completa el Cierre A sobre el mismo editor y su formato de proyectos. No hay publicación en producción.

La decisión comercial queda registrada: aplicación local para Android/iPhone, pago único objetivo US$9,99 y promoción potencial US$6,99, sin suscripciones, cuentas obligatorias ni nube de proyectos. Este cierre no incorpora pagos, autenticación, servicios comerciales o empaquetado móvil. Los cierres B, C y D conservan su alcance propio.

## Auditoría inicial del ZIP ZONAS1

Se verificaron CRC, SHA-256 y todos los archivos contra el checkpoint de código `44f41d3`. El fuente contiene 736 archivos; el runtime coincide con el hash aceptado. Después se extrajo el ZIP Pages y se ejecutaron sus 30 comprobaciones reales de navegador sin sondas de auditoría, incluidas exportaciones, recuperación, GLB y planchas A2. No se detectó corrupción o mezcla de módulos.

- Fuente: `ea745e05c1bafa61cf622a97da5c6a72bd089a6304fd8b8c50f9847283f83713`.
- Pages: `49d063115dcd3871216684b68bc72c29d69a70827c33ad6f2ab3c68584a3a1f2`.

[Integridad y evidencias de auditoría](evidence/cierre-a/auditoria-zonas1/). Ambos ZIP anteriores permanecen intactos en `entregables/`.

## Zonas y modelos

Se mantienen las cuatro zonas de polera y ambos lados del cojín. Sus GLB/glTF se regeneraron con el escritor compartido y conservaron exactamente sus bytes; sus seis documentos, capas, medidas, exportaciones y video se probaron de nuevo.

La bolsa incorpora frente y reverso independientes, inicialmente de 28×30 cm, sobre un cuerpo curvo de referencia de 36×41 cm, con fuelles, abertura superior, dobladillos y asas abiertas. La libreta incorpora portada y contraportada de 15×21 cm, sobre tapas de referencia de 17×23 cm, con esquinas redondeadas, borde, bloque de páginas y catorce anillas metálicas. Las medidas de cada zona siguen siendo editables y se conservan al copiar o exportar.

Los modelos son originales CC0, generados por `scripts/accessory-models.py`, con triángulos indexados, normales, UV y respaldo glTF con buffer incrustado. Los GLB nuevos pesan aproximadamente 280 y 332 KiB. La tapa posterior invierte U para que el texto se lea correctamente desde fuera. La impresión forma parte del mapa de la superficie, sin planos rectangulares delante del producto. Papel y anillas tienen materiales propios; la trama de los textiles utiliza filtrado y mipmaps para reducir aliasing al alejar o girar el modelo.

Los ocho productos históricos y el panel de referencia permanecen disponibles. La taza y el vaso reciben acabado cerámico/protector más coherente; el arte sobre sus colores utiliza alfa, eliminando el fondo blanco artificial de la franja. El glitter físico conserva sus mapas, reflejos y máscara separada. La posición de 270° permanece intacta. La cámara **Zona impresa** encuadra el diseño moviendo la cámara; no cambia el ángulo de impresión ni el PNG.

Cambiar los cm de una zona actualiza su mapa sin descargar y reconstruir el modelo. La placa calibrada sigue reconstruyendo la escala de su superficie cuando corresponde. El sistema de capas, herramientas, selección, historial y proyecto continúa compartido con el editor existente.

## Biblioteca comercial

Ocho ambientes principales: Estudio fotográfico, Mesa de madera, Mármol, Escritorio moderno, Cafetería, Ambiente textil, Minimalista y Estudio degradado. Original, Taller creativo y Vitrina comercial conservan sus identificadores para los proyectos anteriores.

Los fondos son geometría de ciclorama curvo alrededor del producto, con superficies y objetos originales generados localmente. Madera, mármol, tejido, libros, plumas, jarrones y accesorios se construyen sin fotografías externas ni servicios de IA. La cámara ve perspectiva y oclusiones reales; los objetos reciben la misma iluminación y sombras. El suelo se coloca a partir del límite inferior del producto, con separación de apoyo de 0,006 unidades del visor.

Se añaden iluminación Suave/Neutra/Dramática, intensidad de sombra de apoyo y suavidad. Los controles anteriores de color, exposición, materiales, sombras y cámara siguen disponibles. Las sombras de apoyo se componen en el suelo; el sombreado del propio modelo responde a las luces. Se mantienen PMREM/RoomEnvironment de Three bajo MIT y recursos locales. El mapa de sombras usa 2048 en escritorio y 1024 en móvil emulado; no se afirma rendimiento certificado en teléfonos físicos.

## Exportación y separación

Los escenarios, objetos, luces, sombras y color físico del producto no se incorporan al arte. PNG/JPEG/PDF/SVG, espejo, ZIP de zonas y planchas mantienen su ruta 2D. PNG de zonas conserva transparencia; JPEG/PDF se componen sobre blanco. Las líneas de corte siguen siendo trazados y las fotos permanecen únicamente en los gráficos imprimibles.

La rasterización de producción utiliza contextos 2D separados del render GPU. Se comprueba igualdad binaria del PNG al recorrer las ocho escenas y después de fotografías HD. La fotografía individual, las vistas por cara y el video capturan el visor completo y su escena, restaurando los controles al terminar. Las planchas conservan los cm, el espejo por trabajo, sangrado, marcas y PDF multipágina a tamaño físico.

Se conservan guardado local, JSON, respaldo anterior, todos los documentos de zonas y el documento de Diseño libre. Los proyectos históricos de bolsa/libreta migran a la primera cara sin perder sus capas o medidas; el reverso comienza vacío. El importador también valida recursos de las caras ocultas antes de reemplazar un proyecto.

## Fallos encontrados y resolución

- El ayudante de capturas desde un commit tenía el límite de salida de `git show` en 1 MiB, insuficiente para Three y los contornos de fuente. Se amplió a 16 MiB y se repitieron las capturas desde ZONAS1. El ZIP entregado no tenía ese problema.
- Al extraer el escritor GLB compartido faltaba su importación de `math`. Se corrigió antes de generar los modelos y se verificó reproducibilidad de los textiles anteriores.
- Dos ejecuciones de pruebas terminaron con código 137 al comparar binarios PNG con diferencias. Se cambió el diagnóstico a SHA-256 y se aislaron los archivos: solo variaban dos píxeles de antialiasing del texto en un nivel de color después de render HD. La producción se aisló en contextos 2D y los recorridos posteriores pasan con PNG idénticos. Los logs iniciales y el diagnóstico se conservan.
- Una comprobación móvil consultó el modelo durante una recarga por el cambio de medidas. Se espera el estado listo y se evita la recarga innecesaria de GLB en zonas: solo se actualizan los mapas. Se repitió la suite completa de accesorios con 32 casos aprobados.

[Resultados completos](CIERRE_A_PRUEBAS.md) · [Comparativas y galería](CIERRE_A_COMPARATIVAS.md) · [Reversión](CIERRE_A_REVERSION.md).

## Límites y cierres pendientes

Los modelos y escenas son referencias paramétricas estilizadas, con mejoras verificables de volumen, materiales y mapeado; no se presentan como escaneos fotogramétricos ni como calibración física de un fabricante. Tallaje, tejido, color final, impresoras/plotters y teléfonos/tabletas físicos requieren validación posterior.

Los recursos del runtime se distribuyen localmente y las pruebas bloquean dependencias externas. La comprobación integral offline, gestor de proyectos y optimización en equipos modestos corresponden al Cierre B. Capacitor/integración nativa, localización completa, instalables y dispositivos físicos corresponden al Cierre C. Tiendas, compra única, firma, fichas y distribución cerrada corresponden a C/D. No se agregaron temperaturas ni herramientas experimentales de plotter.

## Paquetes

El ZIP fuente incluye todo el código, pruebas, recursos, licencias, documentación y evidencia del Cierre A. Para mantener un paquete fuente manejable, las evidencias de fases anteriores permanecen en Git y sus ZIP originales; no se borran del repositorio ni se modifican esos paquetes. Pages incluye solo el runtime estático. Ambos paquetes se verifican por CRC, contenido y SHA-256. Para reproducir la auditoría histórica se usa el repositorio con historial y los ZIP ZONAS1 preservados.
