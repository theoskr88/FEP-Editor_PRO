# Fase 3B · vectores y plotters

Base oficial: Fase 3A `5b56756`. Mismo repositorio, rama y motor. No se sustituye el editor ni se cambia su almacén. Sin despliegue. El ZIP 3A se conserva para reversión.

## Funciones

Diseño → Vector y plotter convierte figuras en trazados cerrados editables. Se pueden mover nodos mediante sus coordenadas locales, dividir un segmento y eliminar nodos, con Undo/Redo, arrastre, escala, capas, miniatura y guardado. Las elipses y las curvas de fuente se aproximan con segmentos; no se ofrecen manejadores Bézier en esta fase. El original queda oculto al convertir, disponible en Capas.

Los operandos A y B pueden ser figuras o trazados. Unir, A−B e Intersectar operan sobre sus rellenos mediante Clipper. Se crea un resultado sin borrar los operandos; el resultado vacío se informa y conserva el documento. Agujeros y anillos interiores usan regla evenodd. Coordenadas de geometría a 0,0001 cm para operaciones; no se garantiza tolerancia de mecanizado a partir de la aproximación de curvas.

Offset de corte acepta −20 a 20 mm. Genera una capa con destino **solo corte**, visible como línea magenta en el lienzo y excluida de PNG/JPEG/PDF, texturas 3D y planchas. El destino se puede cambiar explícitamente. Se conserva visibilidad y bloqueo; ocultar una capa la excluye de SVG. Las fotografías y glitter imprimible siguen siendo raster y no se convierten automáticamente en líneas.

Imprimir → SVG ofrece documento mixto y solo corte. El documento mixto contiene grupos separados `print` y `cut`, con dimensiones físicas en mm y viewBox correspondiente. Figuras y trazados se exportan como paths; stickers básicos usan sus paths locales. Las imágenes y glitter se incluyen como imágenes PNG **solo en el grupo imprimible**, marcadas como raster. El SVG de corte no contiene imágenes ni texto sin convertir. El espejo horizontal del trabajo se aplica al resultado completo con traslación del ancho físico y escala −1.

El texto latino usa contornos locales de **FEP Outline Sans**, derivada de Liberation Sans Bold (SIL OFL 1.1). La conversión explícita admite hasta 120 caracteres y rechaza glifos no disponibles; puede variar respecto a Arial. En el SVG mixto los textos compatibles se convierten; los demás conservan texto vivo y dependen de fuentes del programa receptor. Un texto no convertido nunca se presenta como línea de corte. Revisar apariencia en el software de destino.

## Arquitectura y recursos

`src/vector.js`: geometría, Clipper, contornos de fuente y SVG. `src/vector-controls.js`: controles sobre el documento existente. El nuevo tipo `vector` conserva paths, transformaciones, color y destino en el mismo JSON V2. Los documentos anteriores siguen abriendo. Datos inválidos se rechazan antes de sustituir el estado. Máximo 32768 nodos por capa, 200000 por documento; el historial conserva hasta 40 estados y se reduce cuando supera el presupuesto de nodos o imágenes.

Clipper 6.4.2 / port 6.4.2.2 se incluye localmente bajo Boost, con atribución JSBN y su licencia. Los contornos de fuente y su licencia OFL están en vendor; `scripts/font-outlines.py` permite regenerarlos desde fonts-liberation. No se hace una solicitud a una fuente ni servicio remoto en ejecución. No se usan servicios pagos.

## Validación y límites

Las pruebas analíticas comparan áreas de unión/resta/intersección con rectángulos conocidos, offset con agujeros, geometría física y espejo. El navegador descarga los SVG reales en escritorio, móvil emulado y sin WebGL. Inkscape 1.4 importa esos archivos, mide grupos en mm, comprueba espejo y reexporta SVG plano. Sus resultados están en `docs/evidence/fase3b/svg-validation.json` y `inkscape-log.txt`.

**No se declara compatibilidad universal con plotters.** Inkscape es la herramienta compatible utilizada; no se ha realizado un corte físico ni probado drivers/modelos concretos. El programa de corte puede interpretar grupos, unidades y estilos de forma diferente. Tampoco se añaden DXF, auto trazado de fotografías ni operaciones con trayectorias abiertas.

Los filtros SVG se expresan con primitivas SVG 1.1 para evitar la advertencia de Inkscape sobre feDropShadow. La primera prueba de booleanos encontró operandos A/B iguales por selección conservada; se mejoró la elección predeterminada de B y el test selecciona operandos reales distintos. No se alteraron las áreas esperadas de las operaciones. La instalación inicial de npm no pudo escribir su caché de usuario; se repitió con caché local de workspace. Estos fallos no se presentan como aprobaciones.

## Reversión

Descargar JSON y PNG normal antes de retroceder. Restaurar el paquete completo `FEP_EDITOR_PRO_FASE3A_PAGES.zip` o el commit `5b56756` en otro perfil/puerto durante la revisión. 3A no reconoce capas vector: conservar JSON 3B para reabrir en 3B; para transferir el aspecto, importar el PNG normal aplanado (los contornos de corte quedan aparte en SVG). No borrar IndexedDB ni mezclar archivos de fases. Producción requiere autorización y no se ha desplegado.
