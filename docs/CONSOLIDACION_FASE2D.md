# Fase 2D · consolidación

Base oficial: `fadca4c861883203cfa45024ebf20337ac3bd396` (Fase 2C). Se conserva el repositorio y la rama de desarrollo `desarrollo/interfaz-fase2b`. La consulta de ramas remotas no mostró una corrección posterior del panel de capas. No se modifica FEP Market, ni se despliega.

## Correcciones

La lista existente ya desplazaba 60 capas sin comprimir las filas. Se completó la selección fuera de vista: seleccionar desde el lienzo, duplicar u ordenar revela la fila seleccionada **dentro de la lista**, sin desplazar la página ni los visores. Redibujar o cambiar opacidad conserva el desplazamiento manual. Los nombres largos se abrevian en el inspector y conservan su valor completo en el título; no consumen la altura disponible para las capas. Filas con altura mínima, encabezados e inspector mantienen sus espacios en escritorio y móvil.

En escritorio de 1024×600 la lista podía colapsar a cero píxeles por la altura del inspector. Se reserva un área desplazable mínima y se compactan los enlaces auxiliares y el encabezado en pantallas bajas.

Se detectó que el tirador de tamaño podía producir fracciones superiores al máximo admitido por el importador (3). El documento se exportaba, pero luego era rechazado al reabrir. Ahora el gesto limita ambas dimensiones conservando su proporción. La restauración del respaldo espera también al renderizador de stickers, como la apertura JSON y la recuperación inicial.

La revisión de archivos de esta entrega es `fase2d-20261110`, aplicada a las referencias locales. Se mantienen el bootstrap independiente, el diagnóstico y la revalidación de caché que corrigen la mezcla de módulos glitter. No hay borrado de IndexedDB ni migraciones destructivas.

## Validación

Los resultados finales y las capturas están en `docs/evidence/fase2d/`. El recorrido adicional de consolidación utiliza **75 capas** en escritorio y móvil: desplaza hasta el final, selecciona, cambia opacidad sin saltos, selecciona desde el lienzo, vuelve a Capas y comprueba que la fila esté visible. También usa un nombre de 720 caracteres y un resize de sticker fuera del lienzo, valida el JSON resultante y comprueba cero excepciones inesperadas.

Se repiten unidades, arranque, regresiones, fiabilidad, glitter, archivos de impresión, interfaz y stickers. El ZIP Pages se extrae y sirve directamente, sin inyección de sondas; se comprueban las pestañas, WebGL, persistencia y edición móvil. Las cantidades finales están en el informe de resultados de esta fase.

Los dominios públicos siguen fuera de la lista permitida de red del entorno. El error de exportación glitter comunicado en 2C está reproducido y probado localmente; la versión publicada no se ha inspeccionado y no se ha desplegado una corrección en producción. Impresión física y dispositivos reales permanecen pendientes. El móvil es Chromium emulado y el WebGL usa SwiftShader.

## Reversión

Guardar JSON y PNG normal antes de revertir. Usar el paquete completo `entregables/FEP_EDITOR_PRO_FASE2C_PAGES.zip` o el commit base `fadca4c` en otro puerto/perfil durante la revisión. Fase 2D no introduce un nuevo tipo de capa ni formato de documento; sus JSON son compatibles con 2C. Conservar el respaldo local y no borrar almacenamiento. Cualquier restauración de producción requiere autorización expresa.

## Puerta para Fase 3A

No se añaden funciones de Diseño libre hasta terminar todas las pruebas críticas de 2D y la prueba del paquete extraído. La entrega 2D queda conservada como punto de reversión independiente dentro del mismo historial del editor. Las limitaciones de red y pruebas físicas no se presentan como verificaciones realizadas.
