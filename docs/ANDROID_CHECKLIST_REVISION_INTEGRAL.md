# FEP Editor PRO — Checklist de aceptación Android (versión consolidada)
Fecha: 2026-11-16
Rama: desarrollo/android-cierre-c

## Preparación (no perder proyectos)
- [ ] Conservar la APK instalada y exportar copia de seguridad de cada proyecto importante.
- [ ] Instalar la nueva APK como actualización, sin desinstalar la anterior.
- [ ] Confirmar que los proyectos guardados siguen disponibles después de actualizar.
- [ ] Abrir la aplicación sin Internet (modo avión) y continuar trabajando.

## 1. Entrada, editor y proyectos
- [ ] Abre «Personalizar producto 3D» sin quedar en pantalla negra.
- [ ] El producto 3D aparece, puede girar y muestra el diseño.
- [ ] Agrega un texto, lo mueve, lo guarda, cierra y abre otra vez el proyecto.
- [ ] Prueba Deshacer y Rehacer tras añadir imágenes.
- [ ] Cambia de producto o zona sin perder las capas guardadas.

## 2. Fotos y galería
- [ ] Toca «Tomar fotografía» y verifica que se abra la cámara.
- [ ] Toma una foto y confirma que aparece como capa editable en el lienzo.
- [ ] Toca «Cámara alternativa» y comprueba que la foto también se añade como capa.
- [ ] Toca «Elegir de galería», selecciona dos fotos y verifica que se añaden ambas.
- [ ] Importa un PNG transparente, un JPG de cámara grande y un WebP.
- [ ] Prueba mover, escalar, girar y ajustar opacidad a 25/50/100 % en cada imagen.
- [ ] Cierra y reabre el proyecto; comprueba que las imágenes se conservan.

## 3. Exportación PNG y PDF
- [ ] Abre el producto 3D y selecciona «Descargar mockup PNG».
- [ ] Elige ubicación en el selector de Android y confirma el guardado.
- [ ] Abre el archivo con Galería o Archivos: debe verse la taza/producto, el diseño y el escenario.
- [ ] Revisa que el PNG NO sea negro, corrupto, vacío o transparente sin intención.
- [ ] Exporta un PNG de impresión y comprueba que NO lleva escenario ni marca de agua.
- [ ] Revisa la opción PDF de impresión y confirma que el documento abre.
- [ ] Prueba dos tamaños de imagen; el archivo debe poder abrirse en ambos.

## 4. Marca de agua
- [ ] En Escena, junto a «Descargar mockup PNG», activa «Marca de agua del mockup».
- [ ] Prueba texto, posición centro, esquina y repetida.
- [ ] Prueba opacidad de la marca 10/50/100 %.
- [ ] Carga un logotipo PNG y exporta una foto comercial.
- [ ] Desactiva la marca y exporta de nuevo: debe salir limpia.
- [ ] Comprueba que la marca jamás aparece en el PNG/PDF destinado a impresión.

## 5. Video de giro 360°
- [ ] Con el mockup visible, inicia «Grabar video 360°».
- [ ] Se visualiza el avance de generación.
- [ ] Al terminar, se abre la opción de elegir dónde guardar MP4.
- [ ] Abre el MP4 guardado; debe girar el producto completo y mostrar el diseño.
- [ ] Comprueba duración, fluidez y que el archivo no esté vacío.
- [ ] Prueba «Cancelar video» y confirma que el editor sigue respondiendo.

## 6. Materiales y escenas
- [ ] Revisa Estudio, Mesa de madera, Mármol, Cafetería, Textil y Minimalista.
- [ ] Comprueba proporción, perspectiva y que el producto no flote.
- [ ] Revisa sombras, superficies y que no aparezcan geometrías artificiales llamativas.
- [ ] Cambia de escenario y captura un mockup PNG para comparar.
- [ ] Comprueba que el editor no se cierre por memoria al cambiar escenarios.

## 7. Calidad final
- [ ] Después de 10 minutos de edición, la aplicación sigue respondiendo.
- [ ] Toda falla muestra una explicación y no un falso mensaje de éxito.
- [ ] La cámara, importación y exportación funcionan sin conexión a Internet.
- [ ] Se conservaron proyectos previos y el editor no eliminó archivos.
- [ ] Registrar el modelo y la versión Android del teléfono.

## Reporte
Para cada casilla fallida: anotar paso, texto exacto del error, si el archivo existe, y capturar pantalla del resultado. No aprobar comercialmente hasta que Cámara, Importación, PNG, MP4 y Restauración del proyecto estén validados en dispositivo físico.

## Aclaraciones
«Quitar fondo» actual se limita a fondos de color uniforme: no es IA de recorte de personas u objetos complejos. Escenarios 3D fotográficos propios siguen siendo una mejora independiente, no se marcan aprobados solo por compilar.
