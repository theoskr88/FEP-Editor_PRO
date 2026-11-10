# Fase 3A · Diseño libre

Se comenzó después de aprobar la puerta local de Fase 2D, conservada en el commit `5cfce87` y en sus ZIP fuente/Pages. [Resultados de consolidación](RESULTADOS_FASE2D.md). Se mantiene el repositorio, la rama de desarrollo y el editor existentes. No se implementan Fase 3B ni fases posteriores. Sin despliegues ni cambios a FEP Market.

## Uso y comportamiento

En una sesión sin documento guardado, la pantalla inicial ofrece **Personalizar producto 3D** y **Crear diseño libre**. Si hay un proyecto recuperable, se abre directamente en su modo guardado. Proyecto → Inicio permite volver a las dos opciones; cambiar de modo conserva las capas. Un documento vacío que entra por primera vez a Diseño libre comienza en A4 vertical y sin espejo. Un documento con arte conserva sus medidas y se presenta como personalizado. No se borra el proyecto al elegir una opción.

Diseño libre ocupa el espacio del lienzo existente; el visor 3D permanece en el flujo Producto. Las pestañas y herramientas son compartidas. La primera pestaña se llama Página en modo libre y Producto en el otro modo. En móvil se conservan la barra inferior y los paneles desplegables.

Página admite A4 (21×29,7 cm), A3 (29,7×42 cm), Carta (21,59×27,94 cm), formato personalizado y orientación vertical/horizontal. Los valores internos siguen en centímetros; se pueden introducir y mostrar centímetros, milímetros o pulgadas. Cambiar la unidad no cambia las medidas. El rango heredado del documento es 1–100 cm por lado; exportar a 300 ppp mantiene el límite de 40 megapíxeles para evitar asignaciones excesivas. A4 y A3 están dentro de ese límite.

El fondo puede ser blanco o transparente. PNG conserva alfa; JPEG y PDF componen el fondo transparente sobre blanco. El PDF mantiene MediaBox en unidades físicas y contiene el raster de impresión, como antes; no se presenta como un PDF vectorial de corte.

Reglas, cuadrícula y guías se superponen en el DOM y no forman parte del lienzo exportable. La cuadrícula tiene separación configurable en la unidad elegida. Las guías se añaden numéricamente en horizontal/vertical, se eliminan individualmente o en conjunto y se guardan con el documento; máximo 40. No se ofrece ajuste magnético ni arrastre de guías. Una guía fuera de la página tras cambiar el formato conserva su posición física y puede eliminarse desde la lista.

El zoom de 25–400 % amplía la vista ajustada al espacio disponible; **100 % significa ajustar a la vista**, no tamaño físico del monitor. Las barras de desplazamiento permiten recorrer la página ampliada. Ajustar vuelve a 100 % y al inicio. Zoom, reglas y guías no cambian los píxeles de exportación.

## Herramientas compartidas

Se conservan textos, fotografías, 60 stickers, capas, miniaturas, opacidad, orden, visibilidad, bloqueo e historial. Diseño → Formas y alineación añade rectángulo, elipse, triángulo y estrella. Son primitivas editables trazadas directamente en Canvas, con ancho/alto en cm, relleno, contorno y rotación. Participan también en selección, arrastre, tamaño, historial, JSON, autoguardado, textura 3D y exportaciones del motor existente.

Alinear coloca una capa desbloqueada en izquierda, centro horizontal, derecha, arriba, centro vertical o abajo respecto al lienzo. Los límites geométricos consideran la rotación de las formas. No introduce selección múltiple ni operaciones booleanas.

La inicialización del visor usa dimensiones positivas aun cuando esté oculto. Al volver a Producto se ajusta explícitamente su tamaño; la recuperación de un documento libre antes de terminar Three.js también se prueba sin ResizeObserver.

El glitter imprimible sigue siendo una capa. El material físico permanece fuera del PNG y puede configurarse para el producto. Los botones de mockup y video se desactivan en Diseño libre y vuelven a estar disponibles al entrar a Producto con visor operativo; la posición aprobada de 270° se conserva.

## Guardado y compatibilidad

El mismo JSON V2 e IndexedDB conservan `mode`, `freeDesign` (unidad, formato, fondo, cuadrícula, reglas, guías y zoom) y capas `shape`. Los documentos V1/V2 anteriores se normalizan a Producto con configuración de página predeterminada y conservan el arte. Configuración de página inválida, IDs de stickers desconocidos o formas inválidas se rechazan antes de sustituir el documento.

No se crea un segundo almacén ni otro editor. La plancha sigue siendo transitoria, como en fases anteriores. Las preferencias de página se guardan pero, igual que las dimensiones previas, no forman parte del historial de capas; Undo/Redo se aplica a cambios de elementos.

## Archivos y arquitectura

`app.js` sigue coordinando el documento, render, historial, 3D y exportación. `src/free-design.js` contiene unidades, formatos, validación y geometría; `src/free-controls.js` conecta los controles con ese motor. `src/interface.js` adapta el encuadre y zoom; `project.js` valida los campos nuevos. No hay framework, aplicación paralela, backend ni servicios de pago nuevos.

Los módulos y CSS llevan la revisión `fase3a-20261110` y se incluyen íntegros en Pages. Se mantiene `_headers` para revalidación. El empaquetador permite `--phase FASE2D` o `--phase FASE3A`; debe ejecutarse desde el commit de cada fase, porque la opción solo nombra el paquete y no cambia el código.

## Reversión

1. Descargar JSON y PNG normal antes de retroceder. Conservarlos fuera de IndexedDB. No borrar almacenamiento del navegador.
2. Para revisar la versión anterior, usar el commit `5cfce87` o el ZIP completo `entregables/FEP_EDITOR_PRO_FASE2D_PAGES.zip` en otro puerto/perfil/origen. Está conservado y validado.
3. Fase 2D no reconoce capas `shape` ni las herramientas de Diseño libre. Conservar los JSON nuevos para reabrir en 3A. Si se necesita llevar el aspecto a 2D, importar el PNG normal: queda aplanado. Un JSON sin formas conserva sus capas en 2D, pero pierde las preferencias nuevas de página; hacer siempre respaldo primero.
4. No mezclar archivos entre fases ni hacer push forzado. Una reversión de producción requiere autorización expresa; no se ha realizado ningún despliegue.

## Pendientes explícitos

Pruebas en dispositivos físicos, impresora real y verificación de las URLs públicas siguen pendientes. Los dominios publicados están bloqueados por la política de red del entorno. No se certifica integración con software de corte. SVG real, DXF, texto a curvas, trazados y operaciones booleanas pertenecen a Fase 3B y no se anuncian como disponibles. Se mantienen pendientes de fases posteriores la calibración comercial del 3D, modelos profesionales, agrupación/selección múltiple y guardado de planchas.

[Resultados y capturas de esta fase](RESULTADOS.md).
