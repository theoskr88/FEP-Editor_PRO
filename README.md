# Cierre B — Base local y offline para el futuro empaquetado móvil

Rama de desarrollo: `desarrollo/cierre-b-v1`. La entrega actual conserva el editor aprobado y añade Mis proyectos, guardado transaccional, respaldos e integridad, funcionamiento offline verificable y controles de memoria. No se ha publicado en producción ni se han integrado cuentas, nube o pagos propios.

- [Informe B1](docs/CIERRE_B1.md) · [B2](docs/CIERRE_B2.md) · [B3](docs/CIERRE_B3.md) · [B4](docs/CIERRE_B4.md) · [B5 y pendientes](docs/CIERRE_B5.md)
- [Contrato de almacenamiento y compatibilidad](docs/ALMACENAMIENTO_LOCAL.md)
- [ZIP de cada etapa y checksums](entregables/) · [Pruebas y capturas B5](docs/evidence/cierre-b5/)

El navegador debe ofrecer IndexedDB para Mis proyectos. Los proyectos pertenecen al dominio y dispositivo; para moverlos usa Exportar/Importar en Mis proyectos. Los JSON nativos anteriores siguen admitidos. Un fallo de guardado no elimina proyectos automáticamente.

El ZIP Pages incluye todos los recursos del editor. La versión web necesita completar una primera descarga en HTTPS/localhost para trabajar offline. La caché se actualiza por versiones completas después de confirmar el guardado. No es todavía un APK/IPA: instalación, archivos nativos y primer uso offline en Android/iOS se validarán en Cierre C. Las pruebas físicas de impresión y plotter siguen pendientes.

Desarrollo: `npm ci`, `npm test`, `npm run serve`. Después de editar el runtime ejecuta `python3 scripts/finalize-offline.py`, prueba de nuevo y genera los ZIP con `npm run package -- --phase CIERRE_B5`. La regresión secuencial principal se reproduce con `python3 scripts/audit-b5.py`; consulta el informe B5 para los recorridos suplementarios y la reversión.

---

## Documentación de entregas anteriores

# FEP Editor PRO · Camino a V1.0 · Cierre A

Polera con frente, espalda y dos mangas; cojín con lados A/B; bolsa con frente/reverso y libreta con portada/contraportada. Ocho escenas comerciales procedurales, tinta transparente y producción separada del mockup. Cada cara conserva medidas, capas, historial de sesión y textura independiente de superficie. [Comparativa real antes/después](docs/CIERRE_A_COMPARATIVAS.md) · [Pruebas](docs/CIERRE_A_PRUEBAS.md) · [Reversión](docs/CIERRE_A_REVERSION.md).

Decisión comercial: pago único objetivo US$9,99, sin suscripciones, cuentas obligatorias ni nube de proyectos. El Cierre A conserva el paquete web para revisión y empaquetado posterior; Android/iOS, validación integral offline, gestor y tiendas corresponden a B/C/D. No se integran pagos ni se publica.

Diseño libre y personalización 3D comparten el mismo documento, capas, guardado e impresión. Se conserva el editor recibido, sus ocho modelos, lienzo y módulo de planchas. La interfaz original se amplía con controles de capas y glitter; no se sustituye por otro editor.

[Cambios, diagnóstico del error de carga, biblioteca y reversión](docs/CIERRE_A.md). La corrección está validada localmente; la comprobación de las URLs públicas sigue pendiente por bloqueo de red del entorno. No se ha desplegado.

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
npm run test:acceptance
npm run test:profiles
npm run test:creative
npm run test:mockup
npm run test:print
npm run test:zones
npm run test:accessories
npm run test:scenes
node tests/zones-visual.mjs
node tests/zones-migration.mjs
node tests/zones-race.mjs
node tests/free-zone-recovery.mjs
python3 tests/validate-cierre-a-files.py
python3 tests/validate-svg.py
npm run package
npm run test:package
```

Las pruebas de navegador requieren Chromium instalado. La validación externa de SVG requiere Inkscape; la de PDF requiere Poppler y Pillow. El análisis de video usa ffprobe/ffmpeg. Las suites anteriores navegan las pestañas/acordeones reales mediante un ayudante; `test:interface` recorre la interfaz directamente. La evidencia actual se escribe en `docs/evidence/cierre-a`, sin sobrescribir Fase 2A. Bloquean conexiones externas; las pruebas normales usan los archivos locales del paquete. `test:package` extrae el ZIP de Pages y lo sirve sin inyección de código de pruebas. `tests/baseline.mjs` es un diagnóstico histórico del commit `175591e`, no parte de las pruebas normales.

`npm run package` escribe los ZIP `FEP_EDITOR_PRO_CIERRE_A_PAGES.zip` y `FEP_EDITOR_PRO_CIERRE_A_FUENTE.zip` en `/workspace/deliverables` (alternativa: `python3 scripts/package.py --out /ruta/de/salida`). Generar desde una copia de trabajo limpia para una entrega reproducible. No despliega. El ZIP fuente incluye todo el código, pruebas, modelos, licencias, documentación y evidencia del Cierre A. Las evidencias binarias de fases anteriores se conservan en Git y sus ZIP originales, sin duplicarlas en esta entrega. Excluye ZIP de entrega, cachés y `node_modules`; ejecutar `npm ci` para las pruebas. El ZIP de Pages se sirve directamente con `index.html` en la raíz.

## Seis pestañas, un mismo editor

Producto, Diseño, Capas, Efectos, Escena e Imprimir. En escritorio, herramientas y plancha se acoplan a la izquierda; el lienzo 2D y el visor 3D siguen visibles. En móvil, una barra inferior abre paneles con scroll propio; se cierran con la misma pestaña, × o Escape. Guardar/Abrir JSON y Restaurar versión anterior están en Proyecto. Capas incluye miniaturas, orden, bloqueo y visibilidad.

Fino, grueso, metálico y holográfico son preajustes del motor glitter existente. El holográfico imprimible simula colores; el material 3D aproxima iridescencia. El arte de sublimación no incorpora el revestimiento físico. Se conserva el catálogo, incluido el panel propio de la Fase 3C. No hay Taza mágica.

[Diseño, compatibilidad, límites y reversión](docs/CIERRE_A.md) · [Pruebas y capturas](docs/RESULTADOS.md).

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

Para repetir auditorías y capturas de una versión anterior se requiere el repositorio con su historial Git y los ZIP ZONAS1 conservados en `entregables/`. Las pruebas normales de la versión actual usan sus recursos locales.
