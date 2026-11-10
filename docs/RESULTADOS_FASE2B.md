# Resultados — Fase 2B

Base aprobada: `1138d9864ed9a0f719ec5430dc6286005a503e43` de `mejora/glitter-fase2a`, verificada en local/remoto. Desarrollo: `desarrollo/interfaz-fase2b`. Node 24, Python 3, Chromium `/usr/bin/chromium` y WebGL mediante SwiftShader en este entorno Linux. Sin despliegues ni cambios en main/FEP Market.

## Verificación

| Comando | Resultado | Alcance |
|---|---:|---|
| `npm test` | 42 aprobadas | 36 previas más layout, miniaturas, recetas, compatibilidad JSON y mate/PBR |
| `npm run test:regressions` | 3 aprobadas | Arrastre y separación glitter imprimible/material |
| `npm run test:browser` | 29 aprobadas | Controles aprobados, capas, JSON, rotación de plancha y degradación sin WebGL |
| `npm run test:reliability` | 16 escenarios aprobados | Recuperación, importación atómica, espejo, medidas, mockup y video con holográfico activo |
| `npm run test:glitter` | 33 recorridos UI + 3 archivos | Color libre, capas y material en escritorio/táctil/sin WebGL; PNG/JPEG/PDF reales descargados |
| `npm run test:interface` | 24 escenarios | Seis pestañas, dos vistas, panel móvil, miniaturas, recetas, guardado y plancha lateral |
| `npm run package` | Ejecutado; dos ZIP íntegros | ZIP estático y ZIP de fuente separados |
| `npm run test:package` | 1 escenario, 12 verificaciones aprobadas | ZIP extraído: estilos locales, seis pestañas, previews visibles, WebGL, edición, glitter, autoguardado y cero dependencias faltantes |

No se omiten fallos: el primer test de teclado falló con `false !== true` al esperar Diseño después de ArrowRight desde el foco de Producto. El código usaba el índice de la pestaña activa anterior; se corrigió para usar la pestaña enfocada. Se repitió el recorrido completo. No se eliminaron aserciones. Las cantidades son una mezcla de pruebas unitarias y escenarios de integración, no una certificación de funciones comerciales.

## Comprobaciones de interfaz

- Seis pestañas exactas y un único panel de herramientas visible, sin controles con IDs duplicados. Navegación con flechas/Home/End; panel móvil recogible con Escape y botón; campos inertes cuando está cerrado.
- Proporción real del canvas conservada, sin distorsión por bordes. Ambos previews completos y sin superposición para las seis pestañas en escritorio 1024×600, 1024×768 y 1500×980. También siguen visibles al abrir la plancha acoplada.
- Móvil emulado 390×844 y 360×800: barra inferior dentro de pantalla, panel de hasta 55 % de alto, sin overflow horizontal; el lienzo y el control frontal 270° permanecen alcanzables cerrando/desplazando el panel.
- Texto e imagen en acordeones; capas con miniaturas de 48×48 diferentes por contenido, selección, orden, bloqueo, visibilidad, duplicado y Undo/Redo. La miniatura no cambia las medidas ni el arte.
- Fino/grueso son recetas de partícula. Metálico/holográfico son parámetros del material existente; mate y ajustes de intensidad siguen funcionando. Se verificó la propiedad de iridescencia y ausencia de errores de shader en WebGL.
- El material no cambia el raster del diseño. El borrador imprimible solo se aplica a la capa seleccionada; las recetas sobreviven a JSON, cierre/recarga y autoguardado. No se reincorporó Taza mágica.

## Regresiones de producción

Se conservaron los ocho productos, texto/imagen, tamaños en cm, sincronización 2D→3D, imagen tras exportar/reabrir, cámara aprobada y 270°. El resize corrige la relación de aspecto del visor sin alterar geometría o FOV.

Espejo: se descargaron PNG/JPEG/PDF normales y reflejados, se decodificaron y compararon las formas de HOLA contra su reflejo geométrico. PNG coincide píxel a píxel; JPEG/PDF usan tolerancia de máscara de tinta del 3 % por compresión con pérdida. pHYs/JFIF a 300 ppp, dimensiones 2362×1063 para 20×9 cm y MediaBox del PDF físico siguen comprobados.

Plancha: dos piezas de 20×9 cm en A4, sin cambio de escala, colisiones/márgenes, rotación real y espejo una sola vez. La prueba abre la ventana de impresión, decodifica su imagen y comprueba la llamada con un espía de `window.print`. El diálogo nativo y la impresora física no se consideran aprobados.

PNG mockup y video 360°: generación, archivo con contenido y decodificación del video, seguida de nueva edición sin congelar textura. La ejecución de fiabilidad activa el holográfico del material antes del video. No se certifica suavidad/FPS en móviles físicos.

## Evidencias

- `evidence/fase2b/tasks.txt` e `interface-final.txt`: comandos, salidas y estados de los recorridos finales.
- `evidence/fase2b/interface-browser.json`: 24 escenarios de interfaz.
- `evidence/fase2b/desktop-effects.png`, `desktop-layers.png`, `desktop-sheet.png`: herramientas y ambas vistas.
- `evidence/fase2b/mobile-effects.png`, `mobile-layers.png`, `mobile-sheet.png`: capturas de viewport móvil (no una imagen larga que desplace artificialmente la barra fija).
- `evidence/fase2b/noWebGL-*.png`: fallback con edición 2D disponible.
- `evidence/fase2b/compat/`: informes y capturas de las suites aprobadas repetidas sobre esta interfaz. `glitter/print-files.json` registra las métricas de archivos reales.
- La prueba de paquete escribe `evidence/fase2b/package.json` con SHA-256 exacto del ZIP servido.

Las evidencias anteriores de Fase 1/2A se preservan. Los documentos históricos se conservan como referencia; las rutas anteriores siguen describiendo aquellas entregas.

## Vista previa

[Escritorio](evidence/fase2b/desktop-effects.png) · [Capas](evidence/fase2b/desktop-layers.png) · [Móvil](evidence/fase2b/mobile-effects.png) · [Plancha](evidence/fase2b/desktop-sheet.png)

## Pendientes

No se probaron dispositivos iPhone/Android físicos, Safari ni impresoras reales; tampoco usabilidad con usuarios, auditoría de accesibilidad exhaustiva o rendimiento prolongado. El holográfico imprimible es multicolor plano, sin efecto óptico físico. El material con iridescencia es aproximado; modelos/materiales requieren calibración comercial. La plancha no se autoguarda y grupos/selección múltiple siguen fuera de esta fase. Se recomienda una sola pestaña del navegador por documento, como en Fase 2A.

El estado es prototipo validado para revisión. Decisiones, archivos modificados, alcance y reversión: [INTERFAZ_FASE2B.md](INTERFAZ_FASE2B.md). No se publica en producción sin autorización.
