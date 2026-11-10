> Fase 2B reorganiza la presentación sin sustituir el editor. Ver [INTERFAZ_FASE2B.md](INTERFAZ_FASE2B.md) y [RESULTADOS.md](RESULTADOS.md). El contenido inferior conserva el contexto anterior.

> Actualización Fase 2A: color, destinos independientes, caché y material glitter se describen en [GLITTER_FASE2A.md](GLITTER_FASE2A.md); resultados actuales en [RESULTADOS.md](RESULTADOS.md). La tabla inferior conserva contexto de Fase 1.

# Auditoría del editor existente

## Procedencia y alcance

Repositorio correcto: `theoskr88/FEP-Editor_PRO` (privado). La base recibida es `ESTUDIO_3D_ZIP_B_V095.zip`, SHA256 `bc02399f826118d1d3e808b4233ca36f15d42f023659598bc1d24feda6909ea7`. Contiene index.html, app.js, plancha.js e INSTRUCCIONES_ZIP_B.txt. El commit `175591e` conserva esos cuatro archivos sin cambios. Las instrucciones antiguas de publicación del ZIP son documentación de referencia; no se ejecutaron.

Esta intervención corrige defectos reproducidos y agrega un primer tramo de capas y glitter solicitado. No completa toda la hoja de ruta ni certifica calidad comercial, impresión real, iPhone o Android nativos.

## Inventario técnico

| Área / herramientas | Estado y evidencia |
|---|---|
| Lienzo 2D y textura limpia | Funcionales; canvas de textura separado de la selección. Sigue el fondo blanco del original: exportación con transparencia de fondo pendiente. |
| Texto | Añadir, editar, color, tamaño, mover y borrar funcionan. Arial en negrita; faltan tipografías, curva, espaciado, contorno y estilos. |
| Imágenes PNG/JPEG/WebP | Importación, proporción, medidas cm, arrastre, rueda, centrado, contener y cubrir existentes. Falta validación de decodificación, límites de píxeles y aviso de resolución fuente insuficiente. |
| Selección y transformación | Selección individual; corregido salto por pérdida del punto de agarre. Sin rotación individual, multiselección ni alineación entre objetos. Mapeo de puntero corregido para object-fit. |
| Capas | Añadida lista, visibilidad, bloqueo, duplicación, orden y opacidad. Texto, imagen y glitter; fondo blanco implícito. Sin grupos, capas de figuras o efectos independientes. |
| Historial | Hasta 40 estados de capas, con activos compartidos y presupuesto total de 32 MP. Corregido borrado de Rehacer al seleccionar. No incluye todavía tamaño/producto/acabados/cámara/plancha. |
| Guardado local | JSON V2/V1 más autoguardado IndexedDB recuperable, versión anterior y preparación atómica de activos. La plancha no se persiste. Ver CAMBIOS.md. |
| Zoom / táctil | Controles Orbit 3D y puntero 2D existentes. No hay zoom/pan 2D, selección múltiple táctil ni prueba física en teléfono. |
| Glitter imprimible | Nuevo fondo por capa determinista con cinco paletas, color personalizado, tamaño, intensidad y acabado. Parte del arte plano. |
| Glitter físico | Material Standard con mapa y relieve aproximado; responde a luces y movimiento. Taza/vaso únicamente. No se exporta al arte de sublimación. |
| Acabado antiguo de calor | Retirado en consolidación Fase 1; proyectos antiguos migrados a normal con aviso y arte conservado. |
| Modelos | Ocho geometrías originales: taza, vaso, polera, bolsa, libreta, mousepad, cojín y llavero. No equivalen a modelos calibrados ni GLB comerciales. |
| Giro y zona imprimible | Ángulo de arte sobre taza/vaso y guías conservados. No es rotación de una capa ni calibración física de UV. |
| Exportación | PNG/JPEG con metadatos 300 ppp y PDF raster con medidas físicas. Límite 40 millones de píxeles conservado. No convierte fotos pequeñas en alta resolución real. |
| Espejo | Reflejo de raster completo existente; no altera el orden de caracteres. Verificación en impresora/sublimación pendiente. |
| Planchas | Papeles, medidas, margen, separación, copias, orden automático, colisión, exportación e impresión existentes. Corregida rotación real de píxeles. Sin historial/guardado propio ni anidación óptima. |
| Mockup PNG / WebM | Conservados. Generación PNG y WebM comprobada en Chromium con WebGL; Safari y dispositivos físicos pendientes. |
| Patrones / máscaras / sombras / degradados | No existen herramientas dedicadas. Reutilizar el render por capa en lugar de abrir otro editor. |
| Escenarios / plantillas comerciales | Pendientes. La escena actual es fondo y luces fijas. |

## Problemas ordenados por gravedad

1. **Alta — importación inválida corrompe el documento:** `[null]` cambiaba producto e invalidaba elementos antes de avisar. Reproducido en baseline.json. Corregida validación previa, límites de archivo/capas/dimensiones y rechazo de imágenes remotas. Pendiente decodificar todas las imágenes antes de confirmar una carga, para garantizar atomicidad de activos corruptos.
2. **Alta — rotación de plancha deformaba impresión:** intercambiaba medidas sin girar píxeles. Corregido giro con transformación del canvas; prueba rojo/azul distingue orientación de estiramiento.
3. **Alta — sincronización 3D reemplazaba glitter/mágica:** cualquier material con mapa recibía el diseño. Corregido: se sustituye únicamente la referencia a la textura anterior del arte. Prueba verifica mapa glitter después de editar.
4. **Alta — pérdida de trabajo al cerrar:** hay guardado JSON manual; no autoguardado ni persistencia de plancha. Pendiente, prioritario en motor sólido.
5. **Media — selección eliminaba Rehacer y arrastre saltaba:** reproducidos y corregidos; checkpoint al mover, posición relativa al punto de agarre. Gesto multitáctil simultáneo y resize multipuntero requieren más trabajo.
6. **Media — dimensiones extremas agotaban canvas:** preview ahora limitado a 4096 píxeles de alto y 1200 de ancho; rango 1–100 cm. Exportación conserva su límite independiente.
7. **Media — ausencia de WebGL interrumpía API de impresión:** se contiene fallo de inicialización, editor y plancha 2D siguen disponibles; prueba navegador con WebGL deshabilitado.
8. **Media — materiales antiguos retenidos:** se liberan materiales al reconstruir geometrías. Falta perfil prolongado de GPU y optimizar nueva textura por repintado.
9. **Media — historial incompleto:** parámetros de producto/medidas/acabado no son transacciones del documento; pendiente unificarlo antes de ampliar herramientas complejas.
10. **Media — exactitud comercial no comprobada:** UV, dimensiones reales, márgenes, impresión a 100 %, reflejos y dispositivos reales requieren pruebas físicas.

## Arquitectura recomendada, sobre la base actual

Mantener index.html y el layout aprobado. Extraer progresivamente funciones actuales sin duplicar motores:

- `app.js` conserva por ahora orquestación, eventos, historial, editor y escena. `paintDesign` será el renderer único de capas usado por lienzo, textura, exportación y planchas.
- `src/project.js` inicia validación del documento. Evolucionar a documento versionado con `layers`, IDs estables, unidades físicas, grupos, efectos y manifiesto de assets. Migraciones V1→V2 explícitas y pruebas de round-trip. No integrar Firestore/R2 todavía.
- `src/glitter.js` comparte generación determinista entre capa imprimible y material, con separación explícita del destino. No introducir brillo físico en render de impresión.
- Extraer después selección/gestos, comandos de historial, almacenamiento IndexedDB, exportadores físicos y escena/materiales. Cada extracción conserva contratos y pruebas antes de añadir herramientas.
- `plancha.js` continúa consumiendo la API de impresión existente. Evolucionar a documento local de hoja que referencia copias del arte, medidas y transformaciones; no rasterizar destructivamente al editar.
- Preparación futura de sincronización: assets por ID/contenido y referencias independientes del documento. Adaptadores de persistencia locales primero; futuros adaptadores remotos sin guardar funciones, objetos Image ni texturas GPU. El JSON actual sigue embebiendo imágenes para ser transportable; no constituye integración remota.

Reutilización de complejidad baja: opacidad/visibilidad/bloqueo, render limpio, unidades cm, exportadores y fitting. Media: patrón como capa con imagen fuente, repetición/espaciado/rotación; texto estilizado como renderer de capa; plantillas como documentos; sombras/gradientes como propiedades serializables. Máscaras no destructivas y grupos requieren primero comandos, IDs y transformaciones coherentes. Mockups calibrados aprovechan escena/luces y el mismo arte, con UV verificadas por producto.

## Plan de correcciones por etapas

1. **Motor sólido (prioridad):** completar IDs y selección múltiple/grupos, historial de todo el documento, autosave IndexedDB y recuperación, validación de imágenes, zoom/pan y gestos táctiles. Regresión de todas las herramientas anteriores en cada extracción.
2. **Herramientas profesionales:** máscaras/recortes/figuras, texto y efectos, patrones y precisión física; completar transparencia de fondo y pruebas de espejo/exportación con impresora. Mejorar calidad de glitter sin confundir simulación con material.
3. **Mockups:** primera taza calibrada, GLB/UV/materiales con referencias físicas; escenarios/iluminación/fondos editables. Mantener arte único para taza, botella, polera y demás productos.
4. **Diseño comercial y producción:** formatos/plantillas reutilizables sobre ese motor; persistencia de planchas, múltiples copias, espejo, preflight de resolución/medidas y salida a impresión. Sin un editor paralelo.

## Verificación y límites

Ver `evidence/baseline.json` para fallos del original, `evidence/browser.json` para resultados actuales y capturas originales/desktop/touch/noWebGL. Las sondas de estado se inyectan solo por el servidor de pruebas: no se añaden APIs de depuración al producto. Los tests verifican valores y píxeles, no solo la presencia de botones.

Se utiliza Chromium Linux con viewport escritorio y móvil/touch simulado. Esto no equivale a iOS/Safari ni Android físicos. Los reflejos son aproximación de shader estándar, pendientes de evaluación visual comercial. No se usaron Firebase Auth, R2, datos comerciales ni despliegues.
