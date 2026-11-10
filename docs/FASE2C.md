# Fase 2C · arranque y stickers

Base: `a8d6dcd8e788a4c05764f904baaf1b00a853f760` (Fase 2B). Se conserva la rama `desarrollo/interfaz-fase2b`, el mismo editor, sus seis pestañas y ocho productos. No se incorpora Taza mágica. No se ha desplegado en producción.

## Error de carga informado

El usuario proporcionó la excepción real:

```
Uncaught SyntaxError: The requested module './glitter.js' does not provide an export named 'applyGlitterPreset' (at glitter-controls.js:1:49)
```

`applyGlitterPreset` sí existe en el código aprobado de Fase 2B. La excepción demuestra que el módulo recibido por el navegador no ofrece el contrato requerido por el controlador. Es compatible con archivos de distintas versiones en la subida o caché; no permite distinguir esas dos causas sin inspeccionar las respuestas publicadas. No se elimina la función ni sus cuatro acabados para ocultar el fallo.

Se reprodujo la excepción exacta sirviendo el controlador aprobado con un módulo sin esa exportación. El nuevo paquete usa referencias coherentes con revisión `fase2c-20261110` en todo el grafo local de módulos de la aplicación y su CSS; `_headers` impide almacenar el HTML y exige revalidación de módulos. La prueba adicional sirve una versión antigua para la URL sin revisión: el editor nuevo arranca, renderiza el producto y exporta correctamente. En cada entrega futura que cambie módulos debe actualizarse la revisión de todas sus referencias. Una subida incompleta que también contenga archivos antiguos bajo la nueva URL sigue siendo inválida: sustituir el paquete entero.

El bootstrap independiente inicializa la navegación antes del motor; informa el archivo/excepción si falla un módulo. Three y OrbitControls locales se cargan después del editor 2D, con tiempo límite; un fallo 3D mantiene edición y exportación de arte disponibles y desactiva mockup/video. IndexedDB bloqueado tiene tiempo límite y no sobrescribe el documento que no se pudo recuperar. Se incorporan alternativas para ResizeObserver, media.addEventListener, Object.hasOwn, queueMicrotask y structuredClone. Las tres primeras excepciones se reprodujeron en la base sin modificar bajo APIs ausentes.

**Verificación pública pendiente:** `sublima.fepmarket.com` y `sublifep.pages.dev` no son accesibles desde este entorno: el proxy deniega el túnel CONNECT con 403 antes del servidor de origen. No es un HTTP 403 observado en Cloudflare. La configuración sigue restringida, sin esos dominios permitidos. No se ha comprobado el contenido ni las cabeceras de la versión publicada; el error reportado está reproducido y la corrección validada localmente. No se declara aprobada la desaparición del error en producción.

## Biblioteca y edición

60 vectores originales incluidos localmente: 12 nubes/pensamiento, 12 bocadillos/diálogo, 12 decorativos, 12 naturaleza y 12 etiquetas/marcos. No requieren red, imágenes generadas ni licencias de terceros. Three conserva su licencia en vendor.

Diseño → Stickers y decoración ofrece búsqueda sin distinción de acentos, categorías, grilla y vista previa antes de Insertar. Cada sticker es una capa independiente: selección, miniatura, posición, ancho/alto en cm, proporción, rotación, volteos horizontal/vertical, relleno si corresponde, contorno y sombra básica. Conserva duplicado, bloqueo, visibilidad, orden, opacidad e historial del motor existente.

Las formas compatibles admiten texto asociado centrado, tamaño y color. El texto se mueve y refleja con su sticker. Se conservan hasta 300 caracteres; el área recorta/abrevia visualmente el exceso. No es texto sobre trayectoria ni tipografía avanzada. El relleno está inhabilitado para formas de trazo abierto. El contorno y tamaño de texto usan unidades del vector interno.

Los paths se trazan con Canvas Path2D a la resolución de salida, sin raster intermedio. El resultado pasa por el mismo lienzo, textura 3D, PNG/JPEG/PDF y plancha. El espejo se aplica una sola vez al raster final, incluyendo el texto y la sombra. El glitter físico sigue excluido del arte imprimible; la capa glitter se coloca bajo los stickers.

Proyectos V1/V2 anteriores conservan lectura y migración. Los nuevos conservan stickerId, estilo y texto en JSON y autoguardado. IDs desconocidos o campos inválidos se rechazan antes de sustituir el documento. La carga del controlador visual de biblioteca es independiente de su renderizador: un proyecto guardado puede recuperarse aunque falte ese controlador.

## Paquete Pages y comprobación posterior autorizada

El ZIP Pages contiene `index.html` en raíz, app, plancha, `_headers`, src y vendor completos. Extraer/subir el contenido completo; no mezclar archivos de ZIP anteriores. No incluye node_modules ni requiere compilación. El ZIP fuente incluye scripts, pruebas, documentación y evidencia; instalar dependencias con npm ci.

Cuando se autorice desplegar, comprobar en una URL de preview primero: ambos dominios sirven la misma revisión, la respuesta de glitter.js contiene la exportación, MIME JavaScript correcto, pestañas operativas, taza visible y consola sin errores. Revisar reglas de caché personalizadas de la zona que puedan prevalecer sobre `_headers`. Si aún se sirve contenido anterior, invalidar solo caché de archivos del sitio; no borrar IndexedDB ni el almacenamiento del usuario. No se ejecutó ese despliegue ni invalidación.

## Reversión

1. Guardar JSON de Fase 2C y PNG **sin espejo** de cada diseño antes de retroceder. Conservarlos fuera del almacenamiento del navegador. La plancha no se autoguarda.
2. Para revisión local, abrir el commit `a8d6dcd` en otro directorio/worktree y servirlo en otro puerto/perfil; no ejecutar la versión antigua sobre el mismo origen con proyectos 2C guardados sin respaldo.
3. Tras autorización de despliegue, restaurar el despliegue anterior completo de Pages o el ZIP `entregables/FEP_EDITOR_PRO_FASE2B_PAGES.zip` conservado. No seleccionar archivos individuales ni forzar la historia de Git.
4. Fase 2B no reconoce capas sticker: los JSON 2C con stickers deben conservarse para reabrir en 2C. Como alternativa visual, importar en 2B el PNG normal guardado; queda aplanado y pierde edición por capas. No eliminar stickers silenciosamente ni borrar el documento local.
5. Verificar arranque, 3D, pestañas e importación del respaldo compatible en el entorno de reversión antes de cambiar producción.

## Límites y pendientes

- Falta verificar las URLs públicas y probar navegadores/dispositivos físicos; pruebas automatizadas usan Chromium Linux y móvil emulado, WebGL SwiftShader.
- No se certifica impresora física, diálogo nativo de impresión ni FPS de video en teléfonos reales.
- Se mantiene el alcance previo: sin agrupación/selección múltiple, calibración comercial nueva, guardado de plancha ni nuevos modelos.
- Las pruebas, fallos encontrados y capturas están en [RESULTADOS.md](RESULTADOS.md).
