# FEP Editor PRO — Firma de Android y continuidad de proyectos (P6)

## Estado real

P5 se compiló con un certificado debug generado en la rama P5; el caché de GitHub Actions no se comparte de forma segura y fiable entre ramas hermanas. La nueva rama P6 **no puede garantizar una actualización directa sobre P5** hasta disponer exactamente del certificado con que se firmó P5.

El flujo P6 ya admite:
- `ANDROID_TEST_KEYSTORE_BASE64`: keystore debug persistente con alias `androiddebugkey`, contraseña del almacén y de la clave `android`. Debe configurarse como **Repository Secret** en GitHub antes de compilar para preservar la firma entre ramas.
- `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASS`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASS`: **cuatro** Repository Secrets para generar release APK y AAB, solo si todos están presentes.
- `versionName=0.9.6-p6` y `versionCode=1000+GITHUB_RUN_NUMBER`.

**No guardar ni imprimir claves privadas en archivos del repositorio, logs, pull requests, capturas ni mensajes.** La clave release necesita respaldo seguro externo y custodia de FEP SpA.

## Continuidad con P5

Para poder actualizar P5 sin desinstalar, el archivo `ANDROID_TEST_KEYSTORE_BASE64` debe representar exactamente el keystore original que firmó P5. Un keystore nuevo **no** conserva esa compatibilidad. Las credenciales release tampoco actualizan una APK debug antigua.

Si no se dispone de ese keystore:
1. En P5, abrir **Mis proyectos → Exportar biblioteca ZIP** solo si la opción está disponible en la versión instalada; de lo contrario, exportar cada proyecto como JSON.
2. Verificar los archivos fuera del teléfono.
3. Instalar la primera P6 con la nueva firma como una nueva línea de pruebas; la desinstalación previa puede borrar los proyectos locales.
4. Restaurar respaldos cuando corresponda y verificar apertura.
5. Desde entonces, conservar **esa misma** clave para todas las futuras compilaciones de prueba, o separar desde ese momento los canales debug y release.

## Publicación

Solo después de configurar Secrets de release y aprobar pruebas físicas, compilar `assembleRelease bundleRelease`, descargar el artefacto `fep-editor-pro-p6-signed-release` y validar las huellas y resultados. El artefacto de debug **no** es apto para publicar.

Pendientes previos a publicación: licencias auditadas por recurso, política de privacidad pública, pruebas de impresión real y ficha de Google Play, clasificación, formulario de datos, pista cerrada y aprobación expresa.
