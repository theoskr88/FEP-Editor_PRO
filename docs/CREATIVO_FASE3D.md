# Fase 3D · diseño creativo

Base aceptada: Fase 3C `463b1ac`. Mismo motor y formato de proyectos; no se despliega ni se incorpora un editor paralelo.

Diseño → Diseño creativo aplica cambios a la capa seleccionada desbloqueada. Texto: Arial, Georgia y Courier New, peso normal/negrita, espaciado, arco de −160° a 160°, contorno y sombra. Las fuentes de sistema pueden variar entre dispositivos. El texto sigue siendo editable; las conversiones a FEP Outline Sans siguen siendo explícitas y pueden variar de tipografía. Sus contornos consideran ahora curva y espaciado.

Texto, figuras y trazados imprimibles admiten degradado lineal entre el color de la capa y un segundo color, con ángulo configurable. Las imágenes admiten recorte relativo no destructivo, máscara elíptica o de esquinas redondeadas, y patrón con tamaño físico del motivo, separación, giro y distribución en cuadrícula o alternada. El patrón ocupa inicialmente todo el lienzo y conserva el recurso original. Se puede deshacer la conversión y ajustar sus medidas como imagen. No se ofrece máscara de pincel libre ni editor de máscaras vectoriales arbitrarias.

Los patrones conservan dimensiones en cm y tienen un presupuesto conjunto de 4096 motivos. Se valida antes de aplicar, importar, cambiar dimensiones o duplicar/redimensionar una capa. No se reduce automáticamente el tamaño del motivo ni se bloquea el navegador para generar una densidad excesiva. Recortes/máscaras conservan los píxeles originales en el proyecto; exportación y 3D reciben la apariencia procesada.

La biblioteca crece de 60 a **80 stickers originales**, 16 por categoría, manteniendo todos los IDs previos. Se añaden nubes, bocadillos, ornamentos, naturaleza y marcos propios. No se usan bancos de recursos ni servicios de IA. Las tres plantillas (promoción editorial, agradecimiento y celebración personalizada) se insertan como figuras/textos independientes y editables; no borran el diseño abierto.

## Impresión, SVG y persistencia

Las ayudas de edición siguen fuera del arte. PNG/JPEG/PDF, planchas y mockups usan el mismo render del documento, incluyendo curvas, degradados y máscaras; el espejo afecta al raster completo. El glitter físico permanece separado del imprimible.

En el SVG mixto, las apariencias creativas que necesitan el render Canvas se incluyen como imágenes **explícitamente marcadas `raster-effects-print-only` en el grupo imprimible**. No se anuncian como trazados. La geometría de las capas sigue editable en el proyecto y sus contornos de corte permanecen paths, sin fotografías. Los SVG geométricos de 3B mantienen sus paths; no se presenta una apariencia rasterizada como vector de corte.

Se guardan tipografía, degradado, recorte, máscara y repetición en los mismos JSON/IndexedDB. Se validan tipos y límites antes de sustituir el proyecto. Historial clona los campos nuevos; no comparte matrices de recorte ni estilos entre versiones. Los proyectos anteriores sin estos campos mantienen su render original.

## Pruebas y hallazgos

68 unidades; 15 recorridos creativos (escritorio, móvil emulado y sin WebGL); aceptación crítica completa en escritorio/móvil; 27 escenarios de stickers, que renderizan realmente los 80; 15 de vector, 5 validaciones Inkscape, 4 de GLB/glTF y paquete estático. Se verifican píxeles de curvas/máscaras/patrones, conservación del recurso original, plantillas por capas, recuperación sin cambios, exportaciones y espejo exacto.

Las primeras unidades detectaron una ruta de importación incorrecta antes de probar el arranque; se corrigió. Las aserciones de catálogo se actualizaron de 60/12 a 80/16 por la ampliación real; se conservó la comprobación de todos los IDs antiguos y se amplió la prueba de píxeles. Se reforzó el presupuesto de patrones en las rutas de redimensionado para evitar documentos que luego no pudieran reabrirse. No se ocultaron esos fallos como pruebas aprobadas.

## Reversión y pendientes

Conservar JSON y PNG normal. Restaurar el paquete completo 3C (`463b1ac`) en otro perfil/puerto. 3C conserva los tipos base pero no representa los efectos nuevos y rechaza IDs de stickers añadidos; mantener el JSON 3D para editarlo en 3D. Para transferir su aspecto a una versión anterior, importar el PNG normal aplanado. Los SVG de corte se conservan aparte. No borrar IndexedDB ni mezclar archivos.

Pendientes: tipografías adicionales con contornos propios, composición tipográfica compleja/RTL, máscaras arbitrarias, más plantillas, dispositivos físicos, impresión y plotter reales. Los dominios publicados siguen sin inspeccionarse por la restricción de red. Las fotografías y recursos de prueba son generados localmente; no se certifica una integración universal con corte.
