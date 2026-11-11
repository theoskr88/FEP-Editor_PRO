# Pruebas y pendientes · Cierre A

Chromium Linux, escritorio 1500×980, móvil emulado 390×844, escenario adicional sin WebGL y render software SwiftShader. Base ZONAS1 `ac9bedf`; sin despliegue en producción.

| Comprobaciones | Aprobadas |
|---|---:|
| Auditoría de ambos ZIP ZONAS1: CRC, SHA y archivos del checkpoint | 2 paquetes |
| ZONAS1 Pages extraído, sin sondas de prueba | 30 |
| Unidades, proyecto, geometría, SVG, impresión y escenas | 94 |
| Aceptación crítica escritorio/móvil | 20 |
| Polera y cojín: seis zonas, recuperación, impresión y video | 26 |
| Bolsa y libreta: cuatro caras, archivos y mockups | 32 |
| Ocho escenas, luces, sombras, cámara y separación de impresión | 8 |
| Migración histórica y fallos GLB/glTF de los cuatro productos | 12 |
| Diseño libre tras alternar y recuperar | 2 |
| Importación de imagen demorada al cambiar de cara | 2 |
| Glitter físico/imprimible, controles, capas y recuperación | 33 |
| PNG/JPEG/PDF reales con espejo de glitter/diseño | 3 |
| Impresión 3F: medidas, espejo, sangrado, marcas y resolución | 12 |
| Vectoriales, nodos, booleanos y SVG de corte | 15 |
| Inkscape: importación, cm, offset, espejo y SVG plano | 5 |
| Catálogo y placa GLB/glTF anteriores | 4 |
| Interfaz directa escritorio/móvil/sin WebGL | 24 |
| Inicio y APIs/módulos ausentes | 8 (más 4 reproducciones negativas) |
| Reproducibilidad exacta de polera/cojín | 1 |
| Decodificación de cuatro videos, dos PDF y reversión con ZONAS1 | 8 |
| Cierre A Pages extraído y servido sin sondas de auditoría | 32 |

[Todos los JSON, logs y archivos descargados](evidence/cierre-a/). `gate.json` identifica el runtime exacto aprobado por SHA-256. Los ZIP y los archivos de fuente se verifican antes de la entrega; los ZIP anteriores permanecen intactos.

## Evidencia principal

La aceptación crítica repite inicio, seis pestañas, los nueve perfiles, sincronización real 2D/3D, Diseño libre, capas, stickers, glitter separado, guardado/recuperación, PNG/JPEG/PDF físicos, espejo, planchas, SVG de corte sin fotos y video descargado/decodificado en escritorio y móvil. No se considera suficiente compilar o pasar sintaxis.

Bolsa y libreta se prueban con texto, flor PNG transparente y sticker; dimensiones diferentes entre caras; copia aditiva; undo por cara; recuperación idéntica por IndexedDB y JSON; PNG/JPEG/PDF individuales; SVG de corte; ZIP completo con CRC; planchas; fotografías HD de ambos lados y videos reales. Se comprueba que el reverso contiene su propio arte y que la cara frontal no se reemplaza.

El PNG de producción permanece binariamente idéntico al recorrer los ocho escenarios, cambiar luz y sombras y exportar fotografía HD. Los mapas de tinta sobre la taza tienen alfa en las zonas vacías y no añaden un rectángulo blanco al material de color. Las luces y la intensidad de sombra cambian píxeles del canvas 3D visible. El escenario contiene geometría de ciclorama y suelo ubicado respecto al volumen del producto; no se fuerza un render desde la sonda para comprobarlo.

Los cuatro videos de polera/cojín/bolsa/libreta se descargan y decodifican; ffprobe/ffmpeg confirman 45 fotogramas a 15 fps para tres segundos, con duración dentro de un fotograma y vistas frontal/posterior distintas. Los PDF consolidados se abren con Poppler: bolsa en dos hojas A3 y libreta en una hoja A3, a tamaño físico. La validación de reversión usa el `project.js` original de ZONAS1 sobre copias convertidas de los proyectos reales.

[Comparativas y ocho fotografías HD](CIERRE_A_COMPARATIVAS.md) · [Bolsa 360°](evidence/cierre-a/tote-360.webm) · [Libreta 360°](evidence/cierre-a/notebook-360.webm) · [Bolsa, plancha](evidence/cierre-a/tote-consolidado.pdf) · [Libreta, plancha](evidence/cierre-a/notebook-consolidado.pdf).

## Fallos y pendientes

El [informe técnico](CIERRE_A.md) documenta el límite del ayudante de capturas, la importación del generador, las ejecuciones 137, el diagnóstico de dos píxeles de suavizado y la espera/recarga de modelos al editar medidas. Los ensayos iniciales permanecen junto a los resultados posteriores aprobados.

Pendientes: calibración con productos fabricados y tallas reales; impresión/plotters físicos; teléfonos y tabletas físicos; otros navegadores/codecs y rendimiento en equipos modestos. Los modelos/escenarios son paramétricos estilizados y no se certifican como escaneos fotográficos. No se declara compatibilidad universal con plotters.

No se han implementado el gestor del Cierre B, empaquetado/idiomas/integración nativa del Cierre C ni funciones comerciales/tiendas del Cierre D. La batería bloquea solicitudes externas y usa recursos locales; la prueba integral de operación offline e instalación corresponde a los cierres posteriores. No hay nuevas cuentas, nube de proyectos, pagos, suscripciones o temperaturas.

[Reversión y respaldo compatible](CIERRE_A_REVERSION.md).
