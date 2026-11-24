# FEP Editor PRO — Preparación comercial Android · Premium P5

Estado: preparación interna. Una compilación debug NO está lista para publicarse en Google Play.

## Reglas de lanzamiento
- Conservar el mismo `applicationId` `com.fep.editorpro` para actualizaciones; verificarlo de nuevo antes de publicar.
- Crear y proteger una clave de firma de **release** independiente de la debug; guardar una copia de recuperación fuera del repositorio.
- No subir certificados privados, contraseñas ni archivos keystore a commits, artefactos públicos o logs.
- Generar y verificar el Android App Bundle (`.aab`) de producción usando credenciales autorizadas.
- Configurar el producto de pago único desde Google Play Console; no añadir cobros propios ni suscripciones.
- Confirmar nombre legal del editor/publisher, correo de soporte, ficha y capturas definitivas, clasificación de contenido, política de privacidad y formulario de seguridad de datos conforme a las reglas vigentes.
- Auditar licencias y atribuciones de dependencias, modelos GLB, tipografías y recursos originales; no declarar licencias verificadas sin pruebas.
- Probar instalación fresca, actualización in-place **con la misma firma**, exportación y restauración de respaldo JSON, modo avión, permisos de cámara y galería, y reproducción de MP4 en dispositivos físicos.
- Comprobar en el dispositivo las dimensiones de PNG/JPEG/PDF, el espejo, el tamaño de impresión y los presupuestos de memoria.
- Mostrar al usuario la versión/compilación de Android desde el sistema mediante el menú **Proyecto → Acerca de**.

## Estado de datos locales
La biblioteca de proyectos vive en almacenamiento local del teléfono. Desinstalar una APK puede eliminarla; las copias JSON de cada proyecto deben estar verificadas antes de reinstalar. El botón "Guardar JSON" respalda el documento actual, no necesariamente toda la biblioteca.

## Entregables antes de publicación
1. Pruebas P5 de dispositivo sin regresiones frente a P4.
2. Informe de auditoría de licencias + listado de recursos.
3. Paquete firmado release `.aab` verificable con una clave segura, aprobado por los propietarios.
4. Ficha de Google Play revisada y política de privacidad acorde a las funciones reales.
5. Prueba de compra y descarga desde pista de prueba cerrada.
6. Aprobación expresa antes de cambiar a distribución pública.

No habilitar servicios externos ni cobrar automáticamente a los usuarios durante este desarrollo.
