# Resultados · Fase 3A

Fase 2D se aprobó localmente **antes** de incorporar funciones nuevas. Su puerta de pruebas está en [fase2d/gate.json](evidence/fase2d/gate.json), su código y paquetes en `5cfce87` y sus resultados en [RESULTADOS_FASE2D.md](RESULTADOS_FASE2D.md). Base de 3A: ese punto de consolidación. Rama: `desarrollo/interfaz-fase2b`. Sin despliegues.

Entorno: Node 24, Python 3 y Chromium Linux con WebGL SwiftShader. Escritorio, móvil emulado y degradación sin WebGL. No se consideran realizados ensayos de impresora ni dispositivos físicos.

| Suite | Resultado final |
|---|---:|
| Unidades | 55 aprobadas |
| Arranque | 8 escenarios positivos; 4 fallos provocados reproducidos |
| Regresiones básicas | 3 |
| Navegador de compatibilidad | 29 |
| Fiabilidad y recuperación | 16 |
| Glitter e impresión | 33 UI + 3 archivos PNG/JPEG/PDF descargados y decodificados |
| Interfaz | 24 |
| Stickers | 27 |
| Consolidación de capas y resize | 5 |
| Diseño libre | 27: 9 escritorio, 9 móvil emulado, 9 sin WebGL |
| Recuperación libre con Three lento y APIs antiguas | 2 |
| Límites de proporción y exportación | 2 |
| ZIP Pages extraído, sin sondas de prueba | 19 comprobaciones |

Las cantidades mezclan unidades y escenarios; no son una certificación comercial. Las fuentes verificables están en [evidence/fase3a](evidence/fase3a/): `unit-final.txt`, `boot.json`, `compat/`, `interface/`, `stickers-browser.json`, `consolidation.json`, `free-browser.json`, `free-recovery.json`, `free-limits.json` y `package.json`.

## Verificación de Diseño libre

La pantalla inicial y el menú Proyecto → Inicio permiten elegir ambos modos en el mismo editor. Los proyectos recuperados abren directamente en su modo. Se comprueba A4, A3 y Carta, orientación, entrada en mm/pulgadas y formato personalizado sin alterar las medidas al cambiar de unidad. Las configuraciones inválidas se rechazan sin sustituir el documento.

Textos, imagen PNG, sticker y figura editable comparten capas, historial y guardado. La prueba gira y alinea una elipse, comprueba Undo/Redo y mueve la capa con zoom 150 %. Las ayudas visuales no cambian el raster; los archivos de salida tampoco contienen selección, reglas, cuadrícula ni guías.

Se descargan PNG/JPEG/PDF de 10×8 cm: PNG de 1181×945 píxeles a 300 ppp con alfa cero en una zona vacía; JPEG con fondo blanco; PDF con MediaBox `283.46457 × 226.77165` puntos. El PNG reflejado coincide píxel a píxel con el reflejo del resultado completo. El mismo diseño entra en la plancha con medidas 10×8 cm y se descarga la hoja real.

El ZIP estático se extrae y sirve directamente. Se prueban las seis pestañas del flujo Producto, taza renderizada, texto, glitter, 60 stickers, persistencia y edición móvil. En móvil se cambia a Diseño libre, se añade una figura y se descarga A3 horizontal: cabecera PNG de **4961×3508 píxeles**. Sin errores JavaScript, archivos ausentes ni peticiones externas.

Se recupera un proyecto libre antes de que termine la carga artificialmente lenta de Three.js, con ResizeObserver y otras APIs ausentes. Al pasar a Producto, el canvas del visor recupera tamaño útil y se comprueban píxeles reales de la taza. También se prueba proporción 100:1 para figuras/stickers y que un documento de 100×100 cm no asigne un raster superior a 40 megapíxeles: la exportación muestra el límite y Guardar JSON sigue funcionando.

## Fallos y ajustes durante la validación

- La primera superposición SVG conservaba el atributo `hidden`, porque SVG no tiene la misma propiedad HTML `hidden`. Se corrigió usando `toggleAttribute`; las pruebas comprueban que reglas y cuadrícula estén presentes y visibles, además de su exclusión del arte.
- Una espera por el texto transitorio «Proyecto cargado» agotó el tiempo tras cambiar de modo. Una sincronización 3D automática podía sustituir ese mensaje. Se hizo silenciosa esa sincronización y la prueba verifica el estado importado.
- La primera repetición de fiabilidad se detuvo al restaurar un respaldo tras una copia dañada: la nueva pantalla inicial interceptaba el menú. Se añadió el mensaje de recuperación fallida y el recorrido usa el botón real Continuar antes de Restaurar. Se conservan las aserciones de recuperación y se repite la suite completa. El fallo inicial permanece en `tasks.txt`; la repetición está en `regressions-final.txt`.
- Se reforzó la inicialización del visor oculto y su ajuste explícito al volver a Producto, incluyendo el caso sin ResizeObserver. El recorrido con Three lento comprueba el resultado en escritorio y móvil.
- La inserción inicial de figuras y stickers se limita proporcionalmente en páginas extremas para que produzca capas válidas al guardar y reabrir.

## Capturas y límites

[Inicio en escritorio](evidence/fase3a/desktop-start.png) · [Diseño libre en escritorio](evidence/fase3a/desktop-free-design.png) · [Inicio móvil](evidence/fase3a/mobile-start.png) · [Diseño libre móvil](evidence/fase3a/mobile-free-design.png) · [Sin WebGL](evidence/fase3a/noWebGL-free-design.png).

La producción publicada no se ha inspeccionado: el proxy del entorno impide conectar con `sublima.fepmarket.com` y `sublifep.pages.dev`. No es un 403 observado en el origen. Impresión física, teléfonos reales, calibración comercial 3D y software de corte siguen pendientes. No se exporta SVG/DXF ni se promete texto convertido a curvas.

[Modificaciones, límites de las herramientas y reversión](DISENO_LIBRE_FASE3A.md).
