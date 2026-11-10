# FEP Editor PRO · consolidación de Estudio 3D V0.9.5

Se conserva el editor recibido, sus ocho modelos, lienzo y módulo de planchas. La interfaz original se amplía con controles de capas y glitter; no se sustituye por otro editor.

## Ejecución local

Requisitos: Node 20 o superior, npm y Python 3.

```bash
npm ci
npm run serve
```

Abrir http://127.0.0.1:8790. El visor utiliza Three.js 0.170.0 desde jsDelivr, como el original; una sesión normal requiere acceso a ese CDN. No hay Firebase, pagos ni almacenamiento remoto. El proyecto se conserva mediante **Guardar proyecto** y **Abrir proyecto** (JSON local); la plancha todavía no se guarda. Guardar antes de cerrar: no existe autoguardado.

```bash
npm test
FEP_CHROMIUM=/usr/bin/chromium npm run test:browser
```

Las pruebas de navegador requieren Chromium instalado. Cargan Three.js desde `node_modules` mediante interceptación de la solicitud CDN y bloquean otras conexiones externas. No instalan ni ejecutan servicios comerciales. `tests/baseline.mjs` es un diagnóstico del original: lee los archivos originales del commit `175591e`; no forma parte de las pruebas normales.

## Glitter

- **Material físico:** elegir Glitter en Acabado del producto. Rosado, dorado, plateado, azul, multicolor o personalizado; controles de partícula, intensidad y acabado. Solo se representa en taza y vaso 3D. El material Standard responde a las luces y cámara del visor, con relieve aproximado. No representa una medición física ni un modelo comercial calibrado.
- **Imprimible:** pulsar Añadir glitter al arte imprimible. Se crea una capa debajo del diseño; texto e imágenes permanecen encima. El PNG/JPEG/PDF contiene esa simulación de color, que no produce brillo físico al imprimir.
- La capa glitter se crea bloqueada para evitar moverla accidentalmente. Para editarla, seleccionarla en Capas, desbloquearla, ajustar controles y pulsar Actualizar capa glitter seleccionada. Los controles también actualizan el material del mockup; no cambian una capa imprimible sin esa acción explícita.
- El material físico queda fuera del lienzo de exportación. Guardar JSON conserva ambas modalidades y parámetros.

## Capas

Lista ordenada de delante hacia atrás, selección, visibilidad, bloqueo, duplicación, subir/bajar y opacidad. Deshacer/rehacer registra cambios de capas. Seleccionar no invalida Rehacer. El bloqueo evita edición, desplazamiento, ajuste de imagen y eliminación individual; Limpiar borra el documento completo y se puede deshacer. Aún no hay grupos ni selección múltiple.

[Auditoría, arquitectura y pendientes](docs/AUDITORIA.md) · [Resultados verificables](docs/evidence/browser.json).

No se ha desplegado ni conectado infraestructura remota.
