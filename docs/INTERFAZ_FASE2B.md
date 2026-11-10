# Fase 2B — interfaz de FEP Editor PRO

Base aprobada verificada: HEAD local y rama remota `mejora/glitter-fase2a`, ambos en `1138d9864ed9a0f719ec5430dc6286005a503e43`. Rama de desarrollo: `desarrollo/interfaz-fase2b`. Se usa el mismo editor, repositorio y motor; no hay nueva aplicación, backend, cuentas o pagos. No se desplegó a producción ni se modificó main/FEP Market.

## Organización de herramientas

| Pestaña | Contenido |
|---|---|
| Producto | Ocho categorías, color del producto y centímetros del área imprimible |
| Diseño | Acordeones de texto e imagen; tamaños en cm, centrar/ajustar/llenar y limpiar |
| Capas | Miniaturas de 48 px, selección, tipo, orden, bloqueo, visibilidad, duplicación y opacidad |
| Efectos | Destino imprimible/material, color libre, paletas, miniatura, cuatro preajustes y ajuste fino |
| Escena | Fondo, guías, vistas de cámara, PNG mockup y video 360° |
| Imprimir | Espejo real, miniatura de salida, PNG/JPEG/PDF y plancha |

Guardar/Abrir JSON y Restaurar versión anterior quedan en **Proyecto**; el indicador de autoguardado permanece en la cabecera. Deshacer/Rehacer son accesos globales. El lienzo tiene accesos rápidos a Diseño y Capas. Los controles conservan sus IDs y handlers, sin duplicarlos.

### Computadores

A partir de 901 px, el área de trabajo tiene herramientas a la izquierda y dos vistas permanentes: Diseño 2D y Mockup 3D. Solo una pestaña de herramientas se muestra a la vez; su scroll no desplaza las vistas. La posición de 270° y sus controles permanecen bajo el visor.

La plancha se acopla al panel izquierdo en lugar de cubrir la aplicación. Tiene una vista de hoja y acordeones de papel, piezas y exportación. Las dos vistas continúan visibles al trabajar en ella. Cambiar de pestaña cierra la plancha y restaura el scroll; no descarta las piezas. Sus centímetros, rotación, espejo, formatos y diálogo de impresión usan el módulo aprobado sin reescribirlo.

El canvas 2D se ajusta visualmente al espacio disponible conservando su relación de aspecto. No modifica resolución del documento, tamaño de objetos o centímetros de producción. El contorno del lienzo no consume píxeles de su caja; se comprueba también su proporción real en el DOM. El renderer 3D usa la altura real del visor y ResizeObserver para evitar estirar el producto al redimensionar; cámara `(0,1,5.7)`, FOV 40°, geometrías y 270° iniciales se mantienen.

### Móvil

Hasta 900 px, las seis pestañas forman una barra inferior con área segura. Cada pestaña abre un panel inferior de hasta 55 % de la altura visible, con scroll propio y cierre; tocar de nuevo la pestaña o pulsar Escape lo recoge. El panel cerrado es inerte para teclado/tecnologías de asistencia. La edición y el visor se recorren verticalmente; no se promete que ambos quepan a la vez con el teclado y panel abiertos.

Los acordeones muestran un grupo de controles por vez. La plancha ocupa el panel inferior, sin tapar las pestañas. El estado de guardado sigue visible. Se comprobaron 390×844 y 360×800 en Chromium emulado; no hubo teléfonos físicos disponibles.

## Cuatro acabados preparados

Se amplía el controlador de glitter existente con recetas y un campo opcional `preset`. Se conservan JSON V1/V2, `glitterSchema: 2`, paletas/colores de Fase 2A, IndexedDB y su respaldo. Los documentos sin `preset` conservan el comportamiento anterior.

| Preajuste | Imprimible | Producto 3D |
|---|---|---|
| Fino | Partícula 1,5; intensidad 60; satinado | Normal y rugosidad del material actual, con grano fino |
| Grueso | Partícula 6; intensidad 80; brillante | Escamas mayores en mapas compartidos |
| Metálico | Partícula 2,5; intensidad 75; brillante | Metalicidad 0,82; acabado y color ajustables |
| Holográfico | Multicolor; partícula 3; intensidad 85; brillante | Interferencia aproximada con iridescencia de Three.js, metalicidad 0,68 |

En modo imprimible, elegir una receta solo cambia la miniatura/borrador hasta pulsar Aplicar a capa o Añadir base. En modo producto, cambia el mockup, nunca el arte exportado. Una capa impresa opaca queda por encima del revestimiento físico y puede ocultarlo: no se mezclan artificialmente.

Los parámetros siguen editables. Los estilos metálico/holográfico se conservan al ajustar tamaño/intensidad/acabado; mate reduce brillo/clearcoat y no se fuerza a brillante. Fino/grueso pasan a ajustes personalizados si se altera su receta de tamaño/intensidad/acabado. Elegir color libre siempre activa Personalizado sin ignorar el tinte. Restablecer vuelve al glitter inicial del destino correspondiente.

El holográfico imprimible es una simulación cromática plana: imprimir el archivo no produce holografía ni purpurina física. El material 3D aproxima interferencia, sin calibración de pigmentos, microgeometría ni espectro de una película comercial. No se certifica su apariencia física exacta. No hay HDR ni servidores adicionales; se reutilizan mapas deterministas y sus límites de memoria.

## Alcance técnico

- `index.html` / `src/interface.css`: presentación, pestañas, paneles y layout; iconos inline y recursos locales.
- `src/interface.js`: navegación, foco, panel móvil, acordeones y ajuste de vistas; sin estado del documento ni motor nuevo.
- `src/layer-ui.js`: representación de capas, miniaturas y filas reutilizadas; acciones de edición siguen en app.js.
- `src/glitter.js` / `src/glitter-controls.js`: recetas opcionales integradas al motor aprobado y selección de destino.
- `app.js`: conexión de la presentación, redimensionado correcto del renderer y propiedades PBR; impresión/serialización base y flujos 2D/3D conservados.
- `plancha.js`, activos, importación atómica y persistencia IndexedDB no se reescribieron.

Sin WebGL se muestra una explicación en el visor; Diseño y exportaciones 2D siguen disponibles. PNG mockup y video se deshabilitan si no puede iniciarse el renderer. No se reincorporó el acabado de taza mágica; su migración a normal sigue siendo legible.

## Pruebas, evidencia y fallo corregido

Ver [RESULTADOS.md](RESULTADOS.md). Las pruebas de interfaz usan navegador real sin ayudante de navegación. Las suites aprobadas se adaptaron con `tests/navigation.mjs`: pulsan las pestañas y abren los acordeones reales antes de interactuar. No desocultan el DOM ni deshabilitan aserciones. Sus resultados actuales se guardan en `docs/evidence/fase2b/compat/`, sin sobrescribir las evidencias aprobadas de Fase 2A.

El primer recorrido de teclado falló: ArrowRight se calculaba desde la pestaña activa aun cuando el foco estaba en otra. Se corrigió para partir de la pestaña enfocada y se repitió la prueba. Los recorridos siguientes incluyen flechas, Home/End, Escape, foco y panel inerte. El informe distingue esta incidencia resuelta de las verificaciones finales y de lo no probado.

## Entregas y reversión

`npm run package` genera `FEP_EDITOR_PRO_FASE2B_PAGES.zip` con index.html en raíz, app.js, plancha.js, src/ (incluido CSS) y vendor/. No requiere build ni CDN obligatorio. `FEP_EDITOR_PRO_FASE2B_FUENTE.zip` incluye código, pruebas, documentación y capturas, sin node_modules/.git ni ZIP generados. El ZIP estático se extrae y sirve para verificar rutas, estilos, herramientas y recuperación.

Conservar primero un JSON del proyecto y ambos ZIP. Para volver a la base aprobada, usar `mejora/glitter-fase2a` en `1138d9864ed9a0f719ec5430dc6286005a503e43` o los ZIP Fase 2A conservados en entregables. Probar en otro origen/puerto para aislar IndexedDB; no borrar almacenamiento del usuario como paso automático. Si ya se integró esta rama, revertir sus commits mediante nuevos commits, sin reset forzado ni sobrescribir main. Fase 2A conserva colores/tamaños de las recetas nuevas, pero ignora su campo `preset` y no reproduce la nueva iridescencia ni la interfaz. No se ejecutan despliegues en este procedimiento.

Pendientes: revisión de UX con usuarios, Safari/iOS/Android físicos, contraste/accesibilidad exhaustiva, rendimiento prolongado en equipos de baja gama, impresoras reales y calibración comercial de los modelos/materiales. La plancha continúa sin persistencia propia; no se añadieron grupos ni selección múltiple. Estado: prototipo validado para revisión, no certificación comercial.
