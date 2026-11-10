# FEP Editor PRO · consolidación de Estudio 3D V0.9.5

Se conserva el editor recibido, sus ocho modelos, lienzo y módulo de planchas. La interfaz original se amplía con controles de capas y glitter; no se sustituye por otro editor.

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
npm run package
npm run test:package
```

Las pruebas de navegador requieren Chromium instalado. Bloquean conexiones externas; las pruebas normales usan los archivos locales del paquete. `test:package` extrae el ZIP de Pages y lo sirve sin inyección de código de pruebas. `tests/baseline.mjs` es un diagnóstico histórico del commit `175591e`, no parte de las pruebas normales.

`npm run package` escribe ZIP estático y ZIP de fuente en `/workspace/deliverables` (alternativa: `python3 scripts/package.py --out /ruta/de/salida`). Generar desde una copia de trabajo limpia para una entrega reproducible. No despliega. El ZIP de fuente incluye archivos versionados y excluye ZIP generados, cachés y `node_modules`; ejecutar `npm ci` para las pruebas. El ZIP de Pages se sirve directamente con `index.html` en la raíz.

## Glitter

- **Material físico:** elegir Glitter en Acabado del producto. Rosado, dorado, plateado, azul, multicolor o personalizado; controles de partícula, intensidad y acabado. Solo se representa en taza y vaso 3D. El material Standard responde a las luces y cámara del visor, con relieve aproximado. No representa una medición física ni un modelo comercial calibrado.
- **Imprimible:** pulsar Añadir glitter al arte imprimible. Se crea una capa debajo del diseño; texto e imágenes permanecen encima. El PNG/JPEG/PDF contiene esa simulación de color, que no produce brillo físico al imprimir.
- La capa glitter se crea editable debajo del arte. Para editarla, seleccionarla en Capas, ajustar controles y pulsar Actualizar capa glitter seleccionada. Su orden no atraviesa capas de texto o imagen. Los controles también actualizan el material del mockup; no cambian una capa imprimible sin esa acción explícita.
- El material físico queda fuera del lienzo de exportación. Guardar JSON conserva ambas modalidades y parámetros.

## Capas

Lista ordenada de delante hacia atrás, selección, visibilidad, bloqueo, duplicación, subir/bajar y opacidad. Deshacer/rehacer registra cambios de capas. Seleccionar no invalida Rehacer. El bloqueo evita edición, desplazamiento, ajuste de imagen y eliminación individual; Limpiar borra el documento completo y se puede deshacer. Aún no hay grupos ni selección múltiple.

[Auditoría, arquitectura y pendientes](docs/AUDITORIA.md) · [Resultados verificables](docs/evidence/browser.json).

No se ha desplegado ni conectado infraestructura remota.

[Consolidación, límites y reversión](docs/CAMBIOS.md) · [Pruebas y pendientes](docs/RESULTADOS.md). El acabado antiguo de revelado por calor se migra a normal al importar proyectos; conserva el arte y avisa.
