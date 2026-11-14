# Android C1 — preparación, no entrega aprobada
Rama exclusiva: desarrollo/android-cierre-c. Cloudflare y la base B5.1 no se alteran.
Se usa Capacitor 8 para envolver recursos locales; la descarga de herramientas y la
generación del proyecto nativo ocurren en GitHub Actions, no en el PC del trabajo.
El service worker web no se registra en la versión Android.
La primera compilación es solo APK DEBUG; no se publica ni firma para Google Play.
Al completarse CI: validar apertura offline, Three.js/WebGL, importación, exportaciones
PNG/PDF/SVG, archivos locales, persistencia y navegación en emulador y teléfono.
No considerar estas funciones verificadas por el mero hecho de compilar.
La integración de archivos nativos y la migración de proyectos quedan para C2.
