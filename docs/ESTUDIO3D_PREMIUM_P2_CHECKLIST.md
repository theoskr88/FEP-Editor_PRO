# FEP Editor PRO — Premium P2 / entrega inicial
Base validada en teléfono: `desarrollo/estudio3d-premium-p1`
Rama de trabajo: `desarrollo/estudio3d-premium-p2`

## Cambios implementados
- Taza esmaltada con borde coloreado: geometría procedural ORIGINAL. Borde azul de fábrica en previsualización; control configurable al activar colores por pieza.
- Taza con asa corazón: nueva geometría procedural ORIGINAL del asa. Se mantienen superficie y rotación imprimible heredadas de la taza 11 oz.
- Personalización visual por partes: interruptor específico; color hexadecimal del asa, borde e interior. Viene DESACTIVADA para no alterar proyectos P1 existentes.
- Guardado offline de parámetros en los ajustes del mockup y recuperación al abrir JSON/proyecto.
- No se modifican los píxeles del arte de impresión ni el PNG/PDF imprimible.
- Nuevos tests de regresión para valores por defecto, persistencia de colores, rechazo de datos inválidos y perfiles.
- No se incorporan modelos, texturas ni código del competidor.

## Advertencia técnica
Los dos perfiles son **prototipos visuales**: dimensiones de impresión 20 × 8,5 cm y circunferencia teórica de 26 cm heredadas de la taza 11 oz. No usar esta plantilla para impresión física ni afirmar compatibilidad industrial hasta calibrarla con un ejemplar real. La forma del asa corazón debe evaluarse en el teléfono y perfeccionarse.

## Checklist (una revisión)
- [ ] Abrir un proyecto P1 existente sin modificar sus colores ni capas.
- [ ] Seleccionar «Taza esmaltada»: aparece un borde independiente.
- [ ] Seleccionar «Taza · asa corazón»: asa reconocible, sin deformaciones.
- [ ] Activar colores independientes y elegir tres colores diferentes.
- [ ] Desactivar colores independientes: recupera la apariencia original.
- [ ] Cambiar material Premium P1: porcelana, satinado, mate y metal.
- [ ] Guardar proyecto, cerrar completamente y abrir: modelo y tres colores persisten.
- [ ] Exportar mockup PNG: muestra los cambios visuales.
- [ ] Exportar PNG/PDF de impresión: no incorpora borde, asa ni fondo.
- [ ] Probar cámara, galería, imágenes múltiples y MP4 360°.
- [ ] Usar modo avión: todas las opciones siguen locales.
- [ ] Comprobar fluidez y que la app no se cierre en 10 minutos.

## Pendiente en P2
- Calibración física de ambos productos.
- Nuevos modelos GLB originales y biblioteca de fondos fotográficos originales.
- Inspección visual completa de nuevo asa, rim e interior en Android.
- Regresión física de la versión candidata antes de integrar a P1.

No fusionar la rama nueva ni publicar en Cloudflare sin aprobación explícita.
