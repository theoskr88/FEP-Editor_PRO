# Reversión · primera entrega de zonas

1. Descargar el **JSON completo** del editor y, para cada producto, el ZIP de todas las zonas. Descargar PDF/PNG de la plancha si corresponde; la plancha es temporal.
2. Conservar estos archivos originales sin abrirlos y sobrescribirlos en versiones anteriores. La Fase 3F muestra solamente la cara activa de un proyecto nuevo; no conoce la edición de todas las caras y un nuevo guardado desde 3F no conserva esa función. Las imágenes y el JSON original permiten volver a esta entrega sin perder las caras.
3. Restaurar el paquete completo `FEP_EDITOR_PRO_FASE3F_PAGES.zip`, conservado sin cambios en `entregables/`, o crear una rama local desde `4b78e28`. No mezclar `src`, `vendor`, `app.js`, `plancha.js` o `index.html` de entregas distintas.
4. Para comprobar localmente: extraer el ZIP anterior en otro directorio de prueba, servirlo con Python HTTP y abrirlo en un perfil/origen separado. El código fuente completo anterior también está disponible en `FEP_EDITOR_PRO_FASE3F_FUENTE.zip`.
5. Si se autoriza posteriormente una publicación, reemplazar el conjunto estático completo, verificar su SHA-256 y limpiar la caché de recursos del origen si fuese necesario. Esta entrega no ejecuta esa publicación ni borra IndexedDB.

Para regresar a las zonas múltiples, restaurar el paquete completo de esta entrega y abrir el JSON original respaldado. La migración desde los proyectos históricos de una sola cara es automática y se prueba en escritorio y móvil.
