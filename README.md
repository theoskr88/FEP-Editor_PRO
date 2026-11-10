# FEP Editor PRO · Fase 3D · Diseño creativo

Diseño libre y personalización 3D comparten el mismo documento, capas, guardado e impresión. Se conserva el editor recibido, sus ocho modelos, lienzo y módulo de planchas. La interfaz original se amplía con controles de capas y glitter; no se sustituye por otro editor.

[Cambios, diagnóstico del error de carga, biblioteca y reversión](docs/CREATIVO_FASE3D.md). La corrección está validada localmente; la comprobación de las URLs públicas sigue pendiente por bloqueo de red del entorno. No se ha desplegado.

## Ejecución local

Requisitos: Node 20 o superior, npm y Python 3.

```bash
npm ci
npm run serve
```

Abrir http://127.0.0.1:8790. Three.js 0.170.0 y OrbitControls están incluidos en `vendor/` con licencia; no se usa CDN en ejecución. No hay backend, autenticación, pagos ni almacenamiento remoto.

El documento se guarda automáticamente en IndexedDB tras 700 ms sin cambios y se recupera al abrir desde el mismo origen/perfil del navegador. El indicador muestra guardando/guardado/error. **Restaurar versión anterior** recupera el respaldo transaccional. **Guardar/Abrir proyecto** sigue permitiendo transportar JSON V1/V2, con preparación atómica de imágenes. La plancha aún no se guarda. Descargar JSON es recomendable antes de cerrar o cambiar de dispositivo; un cierre forzado puede interrumpir el último guardado.

```bash
npm test
npm run test:regressions
FEP_CHROMIUM=/usr/bin/chromium npm run test:browser
FEP_CHROMIUM=/usr/bin/chromium npm run test:reliability
FEP_CHROMIUM=/usr/bin/chromium npm run test:glitter
FEP_CHROMIUM=/usr/bin/chromium npm run test:interface
npm run test:boot
npm run test:stickers
npm run test:consolidation
npm run test:free
npm run test:free:recovery
npm run test:free:limits
npm run test:vector
python3 tests/validate-svg.py
npm run package
npm run test:package
```

Las pruebas de navegador requieren Chromium instalado. Las suites anteriores navegan las pestañas/acordeones reales mediante un ayudante; `test:interface` recorre la interfaz directamente. La evidencia actual se escribe en `docs/evidence/fase3d`, sin sobrescribir Fase 2A. Bloquean conexiones externas; las pruebas normales usan los archivos locales del paquete. `test:package` extrae el ZIP de Pages y lo sirve sin inyección de código de pruebas. `tests/baseline.mjs` es un diagnóstico histórico del commit `175591e`, no parte de las pruebas normales.

`npm run package` escribe los ZIP `FEP_EDITOR_PRO_FASE3D_PAGES.zip` y `FEP_EDITOR_PRO_FASE3D_FUENTE.zip` en `/workspace/deliverables` (alternativa: `python3 scripts/package.py --out /ruta/de/salida`). Generar desde una copia de trabajo limpia para una entrega reproducible. No despliega. El ZIP de fuente incluye archivos versionados y excluye ZIP generados, cachés y `node_modules`; ejecutar `npm ci` para las pruebas. El ZIP de Pages se sirve directamente con `index.html` en la raíz.

## Seis pestañas, un mismo editor

Producto, Diseño, Capas, Efectos, Escena e Imprimir. En escritorio, herramientas y plancha se acoplan a la izquierda; el lienzo 2D y el visor 3D siguen visibles. En móvil, una barra inferior abre paneles con scroll propio; se cierran con la misma pestaña, × o Escape. Guardar/Abrir JSON y Restaurar versión anterior están en Proyecto. Capas incluye miniaturas, orden, bloqueo y visibilidad.

Fino, grueso, metálico y holográfico son preajustes del motor glitter existente. El holográfico imprimible simula colores; el material 3D aproxima iridescencia. El arte de sublimación no incorpora el revestimiento físico. No hay modelos nuevos ni Taza mágica.

[Diseño, compatibilidad, límites y reversión](docs/CREATIVO_FASE3D.md) · [Pruebas y capturas](docs/RESULTADOS.md).

## Glitter: un selector de color, dos destinos

En la columna izquierda, **Ajustar** distingue **Glitter imprimible (capa)** y **Glitter del producto (solo mockup)**. Elegir Dorado sincroniza el selector; cambiarlo a `#1249FF` selecciona Personalizado y muestra azul. La miniatura muestra los parámetros pendientes y Restablecer afecta solo al destino activo.

- **Imprimible:** Añadir crea una base bajo fotos/textos; Aplicar a capa seleccionada cambia solo esa capa desbloqueada. Opacidad, bloqueo, visibilidad, orden y Undo/Redo se conservan. La simulación se incluye en PNG/JPEG/PDF y planchas; no genera brillo físico al imprimir.
- **Producto:** activar Glitter en Acabado del producto muestra los controles de material. Cambian el mockup de taza/vaso inmediatamente, con partículas irregulares, normales y rugosidad sensibles a luces y cámara. No alteran el arte de producción ni recubren fotos/texto. Es una aproximación visual pendiente de calibración comercial.
- JSON V1/V2 y autoguardado conservan los ajustes. La migración mantiene las paletas antiguas que se veían; `glitterSchema: 2` identifica los colores libres y destinos independientes. Sin servicios externos, modelos nuevos ni despliegues.

[Decisiones, migración, límites y reversión](docs/GLITTER_FASE2A.md) · [Pruebas y capturas](docs/RESULTADOS.md).

## Capas

Lista ordenada de delante hacia atrás, selección, visibilidad, bloqueo, duplicación, subir/bajar y opacidad. Deshacer/rehacer registra cambios de capas. Seleccionar no invalida Rehacer. El bloqueo evita edición, desplazamiento, ajuste de imagen y eliminación individual; Limpiar borra el documento completo y se puede deshacer. Aún no hay grupos ni selección múltiple.

[Auditoría, arquitectura y pendientes](docs/AUDITORIA.md) · [Resultados verificables](docs/evidence/browser.json).

No se ha desplegado ni conectado infraestructura remota.

[Consolidación, límites y reversión](docs/CAMBIOS.md) · [Pruebas y pendientes](docs/RESULTADOS.md). El acabado antiguo de revelado por calor se migra a normal al importar proyectos; conserva el arte y avisa.
