# Identidad visual oficial — FEP Editor PRO

Logotipo aprobado: archivo original facilitado por los propietarios en esta conversación (FEP azul, cubo dorado, editor y lápiz, texto EDITOR PRO).

**Ubicación obligatoria del archivo:** `src/brand/Logotipo FEP Editor Pro con Cubo Dorado.png`. Debe ser el PNG original, no una reinterpretación ni un gráfico geométrico. No guardar fuentes tipográficas de terceros.

La rama P8+P9 incluye:
- Pantalla de entrada con el **logotipo completo**, visible brevemente después de abrir la WebView, sin alterar el editor.
- Creación de íconos convencionales y adaptativos Android 12+ a partir del elemento del editor del mismo PNG.
- Splash nativo Android vertical y horizontal centrado en fondo blanco.
- Generación offline de los recursos durante CI, sin necesidad de una cuenta externa.
- Si el PNG todavía no está presente, CI advierte y conserva el ícono provisional sin romper la compilación.

**Acción de integración binaria restante:** subir el PNG original a esta ruta dentro de la misma rama. El conector de GitHub para este proyecto permite editar archivos UTF-8, pero no cargar directamente los bytes de una imagen; por eso las modificaciones de código están comprometidas, mientras que el PNG debe añadirse con la acción de carga de archivos de GitHub. La próxima ejecución que incluya el PNG generará los recursos correctos.

**Validación:** abrir APK desde pantalla cerrada, confirmar que aparece el logotipo completo FEP Editor PRO, que el ícono de Android usa la imagen oficial, que no se muestra el logo geométrico provisional, y que proyectos/impresión siguen intactos. No dar esta verificación por aprobada hasta que la nueva APK incluya el PNG y se pruebe en Android.
