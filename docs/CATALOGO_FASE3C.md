# Fase 3C · catálogo modular

Base aceptada: Fase 3B `ec00383`. Se mantiene el motor de producto, el lienzo y los ocho modelos anteriores. No se despliega.

`src/product-profiles.js` concentra IDs estables, dimensiones imprimibles en cm, tipo de recurso, variantes y calibración. Los ocho perfiles originales conservan sus IDs y dimensiones. Se añade `panel100`, una placa propia de 100×100×3 mm en GLB 2.0 y glTF JSON autocontenidos, sin imágenes ni recursos externos. Su geometría procede de `scripts/panel-model.py`, dedicada CC0, con atribución/procedencia en vendor. GLTFLoader y BufferGeometryUtils son de Three 0.170.0 bajo su licencia MIT existente.

El cuerpo del GLB usa metros. Una malla `Printable` separada tiene UV [0,1] y comparte la textura del editor. Un factor de visualización ajusta el modelo a la cámara sin modificar medidas del proyecto ni de las exportaciones. El área imprimible se puede reducir con Ancho/Alto: la malla se escala físicamente dentro del soporte. Un área mayor muestra un aviso y el visor se limita al cuerpo; no se anuncia una ampliación física del producto.

Las variantes Original, Mate, Brillante y Metal ajustan materiales de cuerpo sin modificar el arte. El color sigue en el selector existente. Los materiales glitter mantienen su motor y parámetros; la variante genérica no sobreescribe sus materiales físicos. Producto, variante, color y medidas se guardan en el mismo JSON V2 e IndexedDB. Los proyectos antiguos reciben variante Original.

La carga de GLB es asíncrona, local y con tiempo límite; si falla el binario, intenta el glTF JSON local con su buffer embebido. Ambos recursos son propios y se prueban. Una respuesta de un producto que ya no está seleccionado se descarta y libera. Durante carga o fallo de modelo se desactivan mockup/video, pero el diseño y exportación 2D permanecen disponibles. Se puede volver a los modelos originales. No se aceptan catálogos remotos ni recursos sin licencia.

## Verificación

Pruebas específicas: nueve perfiles con los ocho IDs originales; estructura GLB binaria; límites exactos del cuerpo y UV; superficie vinculada a la textura actual; actualización de píxeles reales tras importar una imagen; escala 1×0,8 al reducir el alto de 10 a 8 cm; color y material reales; guardado/recarga; cambios rápidos de producto; GLB inválido y retorno a taza. Escritorio y móvil emulado.

El primer recorrido detectó que el material guardaba una referencia de textura creada antes de terminar el GLB. Una actualización concurrente del lienzo la dejaba obsoleta y la imagen no aparecía. Se corrige vinculando la textura vigente al adjuntar el recurso. Se conserva y repite la prueba de píxeles; no se sustituye por una mera comprobación de canvas existente.

La aceptación crítica de esta fase repite en escritorio y móvil inicio, pestañas, todos los perfiles, sincronización 2D/3D, capas, stickers, glitter físico e imprimible, autoguardado/JSON, PNG/JPEG/PDF, espejo píxel a píxel, plancha, SVG de corte y video 360° descargado y decodificado. El ZIP extraído carga también el GLB local. Se conservan las suites extensas previas y se ejecuta además arranque, recuperación con APIs antiguas y consolidación.

**Calibración digital, no certificación de fabricación:** el soporte y su zona imprimible coinciden con las dimensiones del archivo. No se ha medido una placa física ni se certifican consumibles, tolerancias, materiales comerciales o impresoras. Se conserva esa validación como pendiente explícito. Los ocho modelos anteriores mantienen sus límites de calibración ya documentados.

## Reversión

Conservar JSON y PNG normal. Restaurar la entrega completa 3B (`ec00383`) en otro perfil/puerto para revisión. Los documentos de los ocho productos siguen abriendo; 3B no conoce la placa y normaliza ese ID a taza, por lo que debe conservarse el JSON 3C para recuperar su perfil. Las capas y medidas del diseño no se eliminan. No borrar almacenamiento ni mezclar archivos de fases. Sin despliegue ni publicación de producción.
