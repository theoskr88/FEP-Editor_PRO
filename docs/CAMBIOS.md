# Fase 2A — glitter

La entrega actual parte de Fase 1 en `60c2781`, en rama `mejora/glitter-fase2a`. Cambios de color, material, compatibilidad, pruebas y procedimiento de reversión: [GLITTER_FASE2A.md](GLITTER_FASE2A.md). Resultados actuales: [RESULTADOS.md](RESULTADOS.md). Sin despliegues.

---

# Consolidación Fase 1

Base verificada: `0b5633e000f6062300ac3f6e75f9768249a14b55`, rama remota `auditoria/editor-v095`. Rama de trabajo: `consolidacion/fase-1`. No se incorporó la primera entrega alternativa de este chat; se preservó fuera del checkout antes de usar la base autorizada. Sin despliegues.

## Cambios

- Eliminados del producto la opción antigua de revelado por calor, controles, texturas, materiales y handlers. La lectura V1/V2 migra ese acabado a normal, elimina su parámetro antiguo y muestra un aviso sin borrar el arte. Se conservan ocho categorías.
- Importación preparada fuera del documento: validar, verificar dimensiones en cabeceras y decodificar todos los activos antes de aplicar un proyecto. JSON, imagen corrupta y límites de memoria generan errores sin reemplazar el documento. Una importación de proyecto se rechaza si el usuario cambió el documento mientras se preparaba. Una importación posterior invalida la anterior pendiente.
- IndexedDB guarda documento 2D, imágenes embebidas, materiales/glitter, medidas, producto, ángulo, espejo y preferencias de visor/proporción. Guardado diferido 700 ms; indicador accesible de guardando/guardado/error. Al abrir se valida y decodifica la copia antes de recuperarla. Actual y anterior se guardan en una sola transacción; una copia idéntica no desplaza el respaldo. Restaurar intercambia el documento con el respaldo mediante un nuevo guardado.
- Los controles se habilitan después de intentar recuperar la copia. Un fallo del almacenamiento deja disponible la edición y JSON; nunca se promete persistencia en ese caso. La copia actual dañada se conserva hasta una modificación real o restauración explícita.
- Historial de capas comparte imágenes decodificadas en memoria en vez de serializar base64 en cada movimiento. Se limita a 40 estados y 32 MP de activos únicos entre documento/historial; puede descartar estados antiguos antes para respetar ese presupuesto.
- Glitter imprimible nuevo desbloqueado y editable; el orden impide subirlo por encima de texto e imágenes. Material físico sigue solo en el visor. Corregido el signo del ángulo al pulsar Ver elemento seleccionado para apuntar al elemento real de la superficie; no cambia la cámara inicial. Geometrías, iluminación, cámara frontal `(0,1,5.7)` y posición inicial 270° conservadas.
- Dependencias de Three.js/OrbitControls 0.170.0 locales con licencia MIT. No se requiere CDN para abrir la versión estática. Mejorado scroll de herramientas móvil y foco visible sin rehacer la interfaz.

## Límites y recuperación

Máximo 10 MiB por imagen, 8192 px por lado, 16 MP por activo, 32 MP acumulados y 30 MB de datos codificados por documento. JSON de entrada: 30 MB; 500 capas; dimensiones 1–100 cm; exportación conserva límite previo de 40 MP. No hay reducción automática de resolución ni de centímetros: si excede, se rechaza. Los límites contienen asignaciones RGBA (16 MP ≈ 64 MB), no garantizan rendimiento igual en todos los dispositivos.

El autoguardado es local al origen y perfil del navegador; no sigue al ZIP ni a otra dirección, dispositivo o puerto. No es sincronización en nube. Un cierre forzado puede perder cambios de los últimos 700 ms o una transacción sin terminar. Se intenta vaciar la cola al ocultar/cerrar la página, sin garantía del navegador. Descargar JSON sigue siendo la copia transportable. No usar varias pestañas para editar el mismo documento simultáneamente: la última escritura prevalece. La plancha no se persiste en esta iteración. El historial deshacer conserva solo capas, no parámetros de producto; la recuperación del documento completo es independiente.

## Reversión

1. Descargar el JSON actual y conservar ambos ZIP entregados. La copia IndexedDB nueva no se convierte automáticamente para versiones anteriores.
2. Para revisar o servir la última base funcional sin tocar ramas compartidas: usar la rama existente `auditoria/editor-v095` o crear una rama desde el commit completo `0b5633e000f6062300ac3f6e75f9768249a14b55`, con el checkout limpio. Ejecutar `npm ci` y las pruebas indicadas en README.
3. En una revisión Git, revertir los commits de `consolidacion/fase-1` mediante nuevos commits si se necesita deshacer la integración. No usar reset forzado ni sobrescribir main.
4. Ningún paso de reversión publica a Cloudflare. Cualquier despliegue requiere aprobación explícita. Usar otro origen local para comparar sin compartir el autoguardado con la base.

Estado: prototipo validado con Chromium; no versión comercial calibrada ni certificación de impresión física.
