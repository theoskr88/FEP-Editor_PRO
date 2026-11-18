# FEP Editor PRO — Estudio 3D Premium (fase P1)
Rama de trabajo: `desarrollo/estudio3d-premium-p1`
Base preservada: `desarrollo/android-cierre-c` (commit `482abe7a1b745d9e68f7d06048adcfbd55ed1d8f`)

## Alcance implementado de P1
- Acabados 3D: original, porcelana brillante, satinado suave, mate premium y metal cepillado.
- Iluminación adicional: estudio cálido y estudio editorial frío.
- Nuevas perspectivas: lateral derecho y posterior.
- Los parámetros se serializan en `mockupSettings` con valores por defecto retrocompatibles.
- Material y escena afectan solo al render 3D, no al diseño 2D ni al PDF/PNG imprimible.
- Sin descargas en tiempo de uso, sin cuenta ni nube.

## Control de riesgos
- No reemplazar ni borrar el repositorio, los proyectos ni las colecciones existentes.
- No publicar en Cloudflare ni trasladar cambios a la rama Android aprobada sin autorización.
- Los materiales originales y acabados se restablecen desde la configuración del modelo.
- La cámara, galerías, PNG, PDF, MP4, JSON y restauración siguen sujetos a pruebas de regresión.
- No reutilizar GLB, imágenes, texturas ni fragmentos de código de terceros sin licencia adecuada.

## Checklist de revisión
- [ ] Abrir proyecto guardado en la APK anterior y conservar todas las capas.
- [ ] Cambiar a «Estudio cálido premium»: iluminación cálida, producto visible.
- [ ] Cambiar a «Estudio editorial frío»: sombras y materiales visibles.
- [ ] Probar «Porcelana brillante», «Satinado suave», «Mate premium», «Metal cepillado».
- [ ] Volver a «Acabado original»: recuperar la apariencia inicial.
- [ ] Comprobar «Lateral derecho» y «Posterior» en el selector de cámara.
- [ ] Guardar proyecto, cerrar por completo y volver a abrir: acabado, escenario y cámara persisten.
- [ ] Exportar mockup PNG: coincide con la apariencia premium elegida.
- [ ] Exportar PNG de impresión y PDF: no contienen sombras ni fondo fotográfico.
- [ ] Comprobar cámara, varias fotos, MP4 360 y galería tras cambiar materiales.
- [ ] Probar sin Internet y comprobar respuesta del visor durante 10 minutos.

## Validación en teléfono — 18 de noviembre de 2026
**Estado: aprobado por pruebas manuales, 7/7 controles.**

El usuario confirmó: dos estudios premium; los cuatro acabados; reversión a acabado original; vistas derecha y posterior; guardar, cerrar y reabrir manteniendo ajustes; PNG y PDF sin alterar impresión; cámara, imágenes y video 360°.

**CI:** compilación Android Premium `44335004399` exitosa. El diagnóstico anterior `44335019259` marcó fallo al intentar verificar guardado inmediatamente después de importar; la app cargó en emulador y la importación pasó. Se corrigió exclusivamente el sincronismo y la información diagnóstica del test en commit `e4224fc7`, sin modificar el funcionamiento aprobado de la aplicación. Nueva verificación en GitHub Actions pendiente de resultado.

**Protección:** conservar rama `desarrollo/android-cierre-c` y no fusionar ni publicar automáticamente. Premium P1 queda aceptado por prueba física, no declarado publicado en producción.

## Pendiente para fases posteriores
- Nuevos productos GLB propios, con plantilla física calibrada y licencias verificadas.
- Biblioteca de fondos fotográficos originales y fotografía propia del usuario.
- Personalización segmentada de asa/borde/interior para las tazas que tengan mallas independientes.
- Presets profesionales de iluminación por categoría de producto.
- Optimización GPU de modelos, texturas y sombras con métricas de dispositivos reales.

Esta fase NO afirma que los modelos nuevos, fondos fotográficos, colores por pieza o recorte avanzado ya existan.
