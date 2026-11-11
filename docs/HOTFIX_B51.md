# FEP Editor PRO — Hotfix B5.1

Base oficial: B5, commit `601ae80`. Rama de trabajo: `desarrollo/hotfix-b5-1`. Fecha: 11 de noviembre de 2026. **Sin despliegue en producción y sin comenzar Cierre C.**

## Resultado

Se conserva el editor, los formatos de proyecto y sus herramientas. Se corrigen la recuperación del arranque offline y la presentación de Mis proyectos. No se abre ni elimina IndexedDB desde el service worker; tampoco se borran proyectos o respaldos. La migración probada conserva documentos, IDs, nombres, hashes y respaldos de veintiún proyectos por perfil antiguo.

## Alcance de la investigación del sitio publicado

El proxy del entorno rechazó la conexión a `https://sublima.fepmarket.com/` con **CONNECT 403**. No fue una respuesta de diagnóstico de Cloudflare ni del editor. No se inspeccionó el perfil real del usuario, sus extensiones o sus cachés. Por tanto, **no se declara demostrada la causa concreta de ese Chrome**.

Sí se reprodujo un defecto real de B5 que encaja con la diferencia entre un perfil nuevo y uno instalado: retirar `src/bootstrap.js` de su caché de aplicación impide inicializar el editor, incluso con red disponible y después de cerrar y abrir Chrome. B5 devolvía 503 sin recuperar el recurso de la red. B5 también servía el contenido cacheado sin revalidar su hash. Se preservó el fallo inicial y se probó la corrección sobre esa misma instalación persistente, con IndexedDB existente; no se sustituyó por un perfil limpio para dar por resuelta la migración.

## Corrección de caché, arranque y actualizaciones

- El manifiesto completo queda fijado por SHA-256 dentro del worker. La identidad de versión incluye código, recursos y catálogo de compatibilidad; cambiar ese catálogo produce otra caché. No se muta una versión en el sitio.
- Cada respuesta de aplicación se comprueba antes de servir: hash y MIME ejecutable para JavaScript, CSS y HTML. Una respuesta ausente, corrupta o con MIME incorrecto se recupera online únicamente si corresponde exactamente a esa versión. No se sirve un módulo de otra versión para tapar el fallo.
- Si la recuperación exacta no es posible sin red, aparece un diagnóstico y una acción de reintento. La lógica de recuperación del HTML funciona aunque falte el bootstrap. No hay recargas automáticas en bucle ni borrado de datos del sitio.
- La instalación utiliza una caché provisional y verifica todos los recursos antes de confirmar la versión. Una descarga interrumpida o un recurso de otro despliegue rechaza esa instalación y conserva la anterior.
- Se incluyen verificadores de las entregas oficiales B3, B4 y B5. Las cachés posteriores incorporan su manifiesto y su huella para identificar recursos de pestañas anteriores. Las cachés antiguas se conservan; se retiró la limpieza basada en una inferencia insegura de la URL de los clientes.
- Una instalación antigua dañada puede ceder el control a una reparación íntegramente verificada, sin navegar ni cerrar pestañas con trabajo abierto. Una instalación sana espera la actualización explícita y un guardado confirmado. El reintento espera instalación/activación cuando corresponde.
- El estado offline se verifica; no se anuncia una caché íntegra si faltan recursos. Los errores de inicialización siguen visibles con la ruta del recurso o el estado de los módulos. El historial y las medidas de los proyectos no cambian.

La retención conservadora de cachés usa espacio adicional de aplicación. No se libera espacio eliminando proyectos. La primera visita web sigue necesitando una descarga completa; una caché incompleta no puede inventar recursos cuando no hay conexión.

## Mis proyectos

Tarjetas de altura natural con miniatura amplia, nombre completo con salto de línea, tipo y fecha. Si una versión antigua no tiene miniatura, se muestra un marcador legible en lugar de una imagen rota. Abrir proyecto ocupa todo el ancho; Renombrar, Duplicar, Exportar y Recuperar respaldo forman dos columnas. Eliminar tiene una fila y tratamiento visual separados y conserva la confirmación.

Búsqueda y orden tienen etiquetas visibles, controles cómodos y distribución adaptable. La capacidad indica uso y cuota total, sin confundir cuota con espacio libre. Se conservan paginación, búsqueda, orden, creación/importación y las seis operaciones. Los botones tienen al menos 44 px de alto, texto multilínea y foco visible; cada artículo identifica su proyecto para lectores de pantalla.

## Pruebas y evidencias

Los resultados completos están en `docs/evidence/cierre-b51/`; `summary.json` y `gate.json` identifican los controles y el ZIP Pages realmente probado.

- Google Chrome oficial **157.0.8103.50**, Linux, headless, con perfiles de disco persistentes. Se cierran procesos y se reutilizan los perfiles. No son pruebas solo de incógnito ni del estado en memoria de una página.
- B5 exacto procede del ZIP oficial con SHA-256 `4a0fb109eef6f73b45d53e00f97546d7064633c22b062e0d8084167d7bca37cf`. El fixture se entrega para repetir las instalaciones antiguas sin depender de un directorio temporal preparado a mano.
- Perfil nuevo de B5.1, cierre/reapertura offline e IndexedDB existente; B5 sano y B5 con caché dañada; recurso ausente, JavaScript corrupto, MIME incorrecto, manifiesto y HTML corruptos; diagnóstico sin red y recuperación posterior; actualización sin pérdida de veintiún proyectos; negativa a actualizar sin guardado confirmado; pestaña B5 anterior conservando sus recursos verificados.
- Nombres de cien caracteres, incluidos segmentos sin espacios. Capturas antes/después a **320, 375, 768 y 1440 px**, de la cabecera y de las tarjetas. Se miden desbordamientos, intersecciones y altura táctil; además se ejecutan las seis acciones en los cuatro tamaños, con recuperación y confirmación real de eliminación.
- Regresión completa de B: las 28 suites principales y las ocho suplementarias, incluidas cuotas, interrupciones, recuperación, 24 arranques, proyectos, capas, todas las zonas, glitter, stickers, diseño libre, vectoriales, archivos PNG/JPEG/PDF/SVG, espejo, planchas, escenas, fotografías y video decodificado. Se repiten los recorridos críticos también en Google Chrome, además de Chromium.
- Dos ensayos continuos de aproximadamente cinco minutos con medición de heap tras GC y recursos de Three.js. Son ensayos automatizados, no pruebas térmicas o de memoria de teléfonos físicos.
- Validación de SVG real en Inkscape, incluyendo offset y espejo geométrico. El ZIP Pages se extrae y se prueba como sitio estático, verificando los archivos efectivamente entregados.

### Incidencias del propio ensayo

Se detectó una espera asíncrona incorrecta: en Playwright 1.58 una Promise podía aceptarse como condición verdadera antes de confirmar su resultado. Se sustituyó por sondeo explícito de APIs asíncronas y se añadió una prueba unitaria que exige reintentar los valores falsos. Los intentos anteriores no se atribuyen a un defecto de Chrome. También se corrigió el servidor de ensayo para entregar los bytes originales del manifiesto firmado por hash, sin reserializar JSON. El informe final solo acepta repeticiones completas con esas correcciones.

## Límites y pendientes

No se validó el estado real del sitio publicado ni se desplegó el hotfix. Tras autorizar su instalación, falta contrastar el perfil real que presentó el problema. Las capturas y pruebas son de Chrome/Chromium Linux y móvil emulado; Android/iOS físicos, Safari y hardware de impresión/plotter siguen pendientes. No se generaron APK/IPA ni se incorporaron funciones comerciales, cuentas, pagos o suscripciones.

## Reproducción

Desde el repositorio con Node, Python y Chromium: `npm ci`, `npm test`, `node tests/hotfix-b51-browser.mjs`, `node tests/hotfix-b51-actions.mjs`, `python3 scripts/audit-b5.py`. Para Google Chrome, establecer `FEP_CHROMIUM` en la ruta de su ejecutable antes de esos comandos. Los ensayos suplementarios y las herramientas Inkscape/Poppler se mantienen en las instrucciones del Cierre B. El navegador de prueba no se incluye en el código ni en Pages.

Tras editar runtime o compatibilidad: `python3 scripts/finalize-offline.py`, repetir controles y `npm run package -- --phase CIERRE_B51`. El paquete no regenera silenciosamente archivos después de ser probados.

## Instalación y recuperación, sin borrar proyectos

El ZIP Pages debe sustituir el paquete completo, incluyendo `sw.js`, `offline-manifest.json` y `_headers`; no mezclar módulos entre entregas. Esta tarea no ha hecho esa publicación.

Después de una instalación autorizada, una pestaña B5 que ya esté bloqueada puede necesitar una recarga adicional tras verificarse el worker nuevo. Si la UI funciona, guardar o exportar antes de recargar. Si no funciona y el navegador aún no comprueba la actualización, se puede solicitar únicamente `navigator.serviceWorker.getRegistration().then(r=>r?.update())` desde la consola y volver a abrir la página tras terminar la instalación. Esto no borra datos. No usar «Borrar datos del sitio», no eliminar IndexedDB y no desinstalar para diagnosticar este problema.

## Reversión

Conservar los respaldos portátiles y el ZIP B5 anterior. Volver al paquete completo B5 del commit `601ae80` o a ese commit en una copia limpia del código. Los documentos V1/V2 y las bases siguen siendo compatibles. La reversión debe mantener el mismo origen para encontrar los proyectos existentes; otro dominio no comparte IndexedDB.

Si se necesita retirar el worker B5.1 durante una reversión manual, cerrar primero las pestañas después de confirmar sus guardados, desregistrar **solo el service worker del editor** y, si fuera necesario, retirar **solo** las cachés con prefijo `fep-editor-app-`. No borrar IndexedDB, respaldos ni los datos globales del sitio. B5 conserva los defectos documentados, por lo que esta reversión es una contingencia, no la solución recomendada para una caché dañada. No publicar ninguna versión sin autorización.

## Cierre verificado de la entrega

- 121 pruebas unitarias aprobadas, cero fallos.
- 36 suites de regresión de Cierre B aprobadas: 28 principales y ocho suplementarias.
- Chrome: seis reproducciones del defecto B5 y doce escenarios B5.1 aprobados; las seis operaciones del gestor aprobadas en cada uno de los cuatro anchos; veinte comprobaciones adicionales del recorrido crítico.
- ZIP Pages extraído: 32 comprobaciones aprobadas. Build `fep-6a4c2734f7b31778`.
- SHA-256 del ZIP Pages: `35dda2d8680108446d0f4530a313730ad0e0ce5be5cde45ded1e931eeeec876c`.

El paquete COMPLETO reúne fuente, Pages, este informe, resumen y puerta de aceptación, capturas antes/después de los cuatro anchos y B5 Pages para reversión. Sus sumas están en SHA256SUMS.txt. Las capturas `after-*-card.png` muestran la tarjeta completa; las `before-*.png` y `after-*.png` muestran la comparación de interfaz y cabecera. El código fuente contiene todas las evidencias y los ensayos reproducibles.
