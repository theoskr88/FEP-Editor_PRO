# Resultados · Fase 2C

Base Fase 2B `a8d6dcd`, rama existente `desarrollo/interfaz-fase2b`. Node 24, Python 3 y Chromium Linux con WebGL SwiftShader. Se prueba escritorio y móvil emulado; no dispositivos físicos. No se ha desplegado.

**El error comunicado de exportación `applyGlitterPreset` se reprodujo exactamente y el paquete corregido se prueba localmente. La desaparición del error en las URLs públicas está pendiente: el proxy del entorno bloquea ambos dominios antes de alcanzar Cloudflare.** Véanse diagnóstico y reversión en [FASE2C.md](FASE2C.md).

| Prueba | Resultado | Evidencia / alcance |
|---|---:|---|
| `npm test` | 50 aprobadas | Validación, glitter, proyectos, geometría y catálogo de 60 vectores |
| `npm run test:boot` | 8 escenarios positivos y 4 fallos reproducidos | [boot.json](evidence/fase2c/boot.json): escritorio, móvil, caché glitter antiguo sin revisión, APIs antiguas, módulo 3D inválido, biblioteca UI ausente, IndexedDB bloqueado y 2D durante carga 3D |
| `npm run test:regressions` | 3 aprobadas | Arrastre, glitter físico excluido y glitter imprimible incluido |
| `npm run test:browser` | 29 escenarios | [Compatibilidad](evidence/fase2c/compat/browser.json): texto, imagen, capas, importación, plancha, WebGL/táctil/sin WebGL |
| `npm run test:reliability` | 16 escenarios | Recuperación, archivos inválidos, espejo, medidas, mockup y video 360° decodificado con holográfico |
| `npm run test:glitter` | 33 UI + 3 archivos | Controles, recetas, color libre y PNG/JPEG/PDF normal/reflejado realmente descargados y decodificados |
| `npm run test:interface` | 24 escenarios | Seis pestañas, ambos visores en escritorio, panel móvil, miniaturas y plancha |
| `npm run test:stickers` | 27 escenarios | [stickers-browser.json](evidence/fase2c/stickers-browser.json): 9 en escritorio, 9 móvil emulado y 9 sin WebGL |
| `npm run test:package` | 16 comprobaciones aprobadas | ZIP Pages extraído, sin sondas inyectadas; arranque, 3D, pestañas, 60 stickers, persistencia y edición móvil |

Las cantidades mezclan unidades y escenarios, no son una certificación comercial. Las degradaciones sin WebGL y los módulos ausentes son fallos provocados deliberadamente, con 2D y diagnóstico disponibles; no se cuentan como errores inesperados aprobados.

## Comprobaciones de stickers

Los 60 paths producen píxeles reales en Canvas, además de la vista previa SVG. Se inserta al menos uno por categoría, cambia color/contorno/sombra, escala en cm, gira, voltea y edita texto asociado. Duplicar, ordenar, ocultar, bloquear, opacidad, borrar e historial conservan la independencia de capas.

La nube con HOLA se descarga y se compara con el reflejo del raster completo. Se comprueban actualización real de píxeles 3D, archivos PNG/JPEG/PDF y entrada en plancha con medidas. JSON y autoguardado recuperan el sticker y su texto; la importación inválida mantiene el documento. En escritorio se genera video 360° con stickers; la suite de fiabilidad también decodifica el video con material holográfico. El material físico no cambia el arte, y la capa glitter queda bajo los stickers.

## Fallos encontrados y corregidos durante el trabajo

- La primera aserción del catálogo exigía paths de más de 10 caracteres y rechazaba tallos válidos (`M60 83V10`, `M60 77V89`). Se sustituyó por validación de inicio de path y comprobación de píxeles de los 60 vectores en navegador.
- El servidor de reproducción de la base tenía un límite de buffer de git-show menor que Three.js y devolvía 404 artificial. Se aumentó a 8 MiB y se esperó el evento real pageerror. Las excepciones documentadas son las observadas tras corregir el servidor de pruebas.
- La revisión visual encontró una diagonal en el bocadillo redondo. Se corrigió el trazado integrado de su cola y se repitieron catálogo y pruebas.
- El usuario aportó posteriormente la excepción exacta de glitter. Se añadió su reproducción específica y un escenario de caché antigua; las referencias coherentes de revisión corrigen ese caso sin retirar acabados.

## Capturas

- [Escritorio: nube con texto](evidence/fase2c/desktop-cloud-hola.png)
- [Móvil emulado: herramientas](evidence/fase2c/mobile-cloud-hola.png)
- [Catálogo de 60 vectores](evidence/fase2c/catalog-60.png)
- [Transformaciones de stickers](evidence/fase2c/desktop-stickers.png)
- [Edición sin WebGL](evidence/fase2c/noWebGL-cloud-hola.png)
- Pruebas de pestañas, capas y plancha: [directorio de capturas de interfaz](evidence/fase2c/interface/).

Los límites de impresión física, dispositivos reales, persistencia de plancha, calibración comercial y verificación pública siguen documentados en FASE2C.md. Se conserva el informe anterior en [RESULTADOS_FASE2B.md](RESULTADOS_FASE2B.md).
