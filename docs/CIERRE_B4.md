# B4 — Rendimiento y recursos locales

Base de reversión: B3 `9f2d41d`. Sin despliegue.

## Cambios

Los cambios de proyecto liberan geometrías, materiales, texturas textiles y lienzos auxiliares del modelo anterior, vacían las listas de render y las teselas glitter reutilizables. Los modelos que terminan de cargar después de cambiar de proyecto mantienen su protección contra resultados obsoletos. Un proyecto de Diseño libre no vuelve a cargar geometría 3D oculta ni sube texturas de edición al GPU.

El historial mantiene un máximo global de 80 instantáneas, 40 por cola, 32 megapíxeles de imágenes únicas y un millón de nodos vectoriales. Solo se descartan instantáneas antiguas: nunca las capas actuales ni los proyectos. Se siguen aplicando los límites preventivos existentes al importar y exportar, sin reducir resolución silenciosamente.

Mis proyectos lee resúmenes sin documentos ni miniaturas completas, pagina 24 tarjetas y carga únicamente las miniaturas visibles. La página no limita el número de proyectos almacenados. Se muestra el uso y cuota reportados por el navegador. Duplicar el proyecto activo confirma antes su guardado para incluir los cambios pendientes.

Las importaciones muestran progreso y permiten cancelar entre decodificaciones sin alterar el proyecto abierto. El video permite cancelar tanto la codificación local como la grabación compatible; se cierran codificadores/pistas y se restaura cámara, tamaño e interfaz sin descargar un archivo parcial. Se bloquean cambios de proyecto y actualización de aplicación durante exportaciones activas.

## Pruebas

107 pruebas unitarias. Rendimiento en Chromium escritorio y móvil emulado: veinte proyectos con imágenes originales, distintos productos y zonas; dos vueltas por la interfaz real, cuarenta aperturas por dispositivo. Se comparan las geometrías/texturas del mismo proyecto entre vueltas y se verifica que los mapas textiles estén liberados al abrir Diseño libre. Mediciones completas en `desktop-memory.json` y `mobile-memory.json`; los tiempos son de este ejecutor con renderizado software, no promesas para teléfonos físicos.

Se comprueban duplicación inmediata, cancelación de video, cancelación de una importación de cien imágenes y conservación del documento abierto. Se repiten gestor, recuperación, veinte regresiones generales y el ZIP extraído. Evidencia y capturas en `docs/evidence/cierre-b4`.

## Incidencia y límites

Una primera prueba de cancelación, ejecutada simultáneamente con varias suites de navegador, encontró `autosave` sin inicializar en un arranque móvil. No se capturó en esa ejecución el motivo interno del fallo de almacenamiento, por lo que no se atribuye a una causa demostrada. La repetición con diagnóstico explícito del estado inicial aprobó en ambos formatos; B5 amplía las pruebas de arranque y uso prolongado. Se conserva el registro inicial.

La cancelación es cooperativa: una decodificación ya iniciada debe terminar antes de liberar su resultado. JSON.parse, render de un fotograma y canvas.toBlob no ofrecen aborto inmediato mediante estas APIs. Los indicadores no prometen cancelación instantánea en esas secciones. La memoria GPU se mide por recursos de Three.js; el heap reportado por Chromium es orientativo, no incluye toda la memoria del proceso. Dispositivos modestos físicos, iOS y pruebas térmicas prolongadas siguen pendientes.

## Reversión

Exportar respaldos y conservar los ZIP B1–B4. Volver al runtime B3 completo `9f2d41d`, regenerando su versión/manifiesto si se distribuye mediante el actualizador offline. El esquema de proyectos no cambia y no requiere borrar IndexedDB. Para deshabilitar la caché usar el procedimiento B3, eliminando solo cachés de aplicación. No desplegar sin autorización.

Se detectó y corrigió además una superposición real en móvil: el drawer de herramientas tenía mayor nivel que la cabecera y podía interceptar Restaurar versión anterior cuando el menú Proyecto crecía. La cabecera ahora permanece por encima, el menú tiene altura limitada y desplazamiento. La repetición de recuperación y gestor aprobó en ambos formatos. La prueba de eliminación también se ajustó para esperar el final del refresco asíncrono del catálogo antes de contar tarjetas. Los registros iniciales se conservan junto con los resultados finales.

En este ejecutor, las cuarenta aperturas tuvieron una mediana aproximada de 1,01 s en escritorio y 2,31 s en móvil emulado, con máximos de ocho texturas y veintiocho geometrías registradas. Las cifras incluyen la navegación real y no equivalen a uso de RAM total ni rendimiento de hardware móvil.

La auditoría del ahorro de memoria detectó que la vuelta desde un proyecto libre restaurado debía reconstruir el modelo si ya había sido liberado; también la inicialización diferida debía respetar el modo libre. Se alinearon ambas rutas y se añadió el recorrido sin ResizeObserver con carga 3D inmediata y retrasada en escritorio y móvil. El proyecto libre conserva el lienzo y el producto vuelve a mostrar geometría real al cambiar de modo.
