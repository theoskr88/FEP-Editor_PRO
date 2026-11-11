# B3 — Funcionamiento offline verificable

Base: entrega B2 `617b1de`. Sin despliegue ni integración nativa.

## Implementación

Se incluyen todos los módulos, modelos GLB/glTF, stickers, fuentes vectoriales, codificadores y escenas necesarios en el paquete local. Las fuentes de interfaz usan alternativas del sistema; no hay carga de Google Fonts, CDN ni servicios de IA. El manifiesto enumera cada recurso con SHA-256.

La versión se identifica por el contenido del runtime. El service worker instala todos los recursos en una caché nueva, verifica sus hashes y solo entonces puede activarse. Una descarga parcial o un despliegue mezclado rechaza la instalación y conserva la aplicación anterior. La actualización espera y requiere el botón Aplicar actualización, que confirma primero el guardado local.

Los módulos tienen versión explícita; cada página también fija su versión antes de ejecutar módulos para resolver importaciones sin query. Las pestañas anteriores conservan sus recursos mientras están abiertas, incluso cuando otra pestaña actualiza. No se sustituye un archivo antiguo ausente por otro de versión distinta. Se mantienen la versión actual, una anterior y las utilizadas por pestañas abiertas; la limpieza solo afecta cachés de aplicación, nunca proyectos IndexedDB.

`python3 scripts/finalize-offline.py` debe ejecutarse después de modificar el runtime y antes de probar/empaquetar. Genera un identificador determinista y manifiesto. Empaquetar no modifica los archivos probados. En Pages se extrae el contenido del ZIP en la raíz y se conserva `_headers`; no se ha publicado.

## Evidencia

`tests/offline-browser.mjs` utiliza HTTP real y service workers, sin interceptar peticiones ni inyectar controles de prueba en la aplicación. Desactiva la red del contexto y recarga; prueba modelos, diez zonas, escenas, glitter, stickers, diseño libre, guardado, PNG/JPEG/PDF/SVG, planchas, mockup y video. Simula una actualización incompleta, una actualización válida y conservación de proyectos. Se repite en escritorio y móvil emulado. La regresión general y el ZIP estático se comprueban por separado. Resultados y capturas en `docs/evidence/cierre-b3`.

## Límites

La versión web necesita una primera descarga completa mediante HTTPS/localhost. El estado Disponible sin conexión aparece después de completar la instalación; el almacenamiento del navegador puede ser eliminado por el usuario o sistema. Los proyectos siguen requiriendo respaldo portátil. Si el navegador no ofrece service workers, el editor funciona online y lo indica.

El ZIP incluye recursos locales para el futuro empaquetado móvil; no equivale a una aplicación nativa ni a un APK/IPA. Primer arranque offline tras instalar una aplicación móvil y pruebas físicas Android/iOS corresponden al Cierre C y están pendientes. No se afirma que una visita web sin descarga previa funcione sin Internet.

## Reversión

Exportar respaldos. Volver al ZIP B2 o commit `617b1de` en un entorno de prueba. Para retirar también el comportamiento offline, desregistrar únicamente el service worker del editor y eliminar cachés cuyo nombre comienza `fep-editor-app-`; no borrar datos del sitio ni IndexedDB. En dispositivos de usuarios una reversión de runtime debe distribuirse como otra versión completa del mecanismo offline y aplicarse explícitamente, sin mezclar archivos. Conservar B1/B2 y no desplegar sin autorización.

## Incidencia del recorrido automatizado

El primer recorrido offline solicitó el PNG de la plancha antes de finalizar la conversión asíncrona de la imagen añadida y agotó el tiempo de descarga. Se corrigió la prueba para esperar la selección de la pieza y organizar la hoja antes de descargar. No se ocultó el fallo ni se consideró un pase por sintaxis. El resultado válido es la ejecución completa registrada en `offline-browser.json`.

La prueba adicional con dos pestañas encontró un defecto real: `Client.url` no siempre refleja el cambio de URL mediante History API, por lo que una solicitud sin query podía tomar recursos de la versión nueva. Se corrigió la resolución usando también la versión del referente; se versionaron explícitamente el import map y la dependencia BufferGeometryUtils. Una solicitud cuya versión no pueda identificarse se rechaza en vez de mezclar archivos. Se volvió a generar el manifiesto y se repitieron el recorrido offline, las regresiones y el ZIP sobre los bytes finales.
