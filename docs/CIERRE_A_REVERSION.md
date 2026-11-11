# Reversión del Cierre A a ZONAS1

1. Descargar el JSON completo y los ZIP de todas las zonas de cada producto. Descargar los PDF/PNG de las planchas, que continúan siendo temporales. Conservar esos archivos originales para regresar al Cierre A.
2. Preparar archivos compatibles antes de usar ZONAS1: la versión anterior no reconoce los nuevos ambientes, la cámara Zona impresa ni las zonas de bolsa/libreta.

```bash
python3 scripts/rollback-zonas1.py proyecto-cierre-a.json --out respaldo-zonas1
```

La carpeta de salida debe ser nueva. El script nunca sobrescribe el original ni una carpeta existente. Conserva `ORIGINAL_CIERRE_A.json` byte por byte y genera SHA-256. Produce un proyecto activo compatible y un archivo independiente por frente/reverso de bolsa y libreta presentes. Conserva las zonas nativas de polera/cojín y respalda Diseño libre cuando existe. Los ambientes nuevos pasan a Estudio y la cámara nueva a Original; las capas y sus cm se mantienen.

3. Restaurar el conjunto completo `FEP_EDITOR_PRO_ZONAS1_PAGES.zip` conservado en `entregables/`, o trabajar desde `ac9bedf` en una rama de recuperación. No mezclar archivos de ambos runtimes. Para una prueba local, extraer en otro directorio y servir con Python HTTP en otro origen/perfil.
4. Abrir los archivos compatibles en la versión anterior. ZONAS1 edita bolsa/libreta de una cara por proyecto; cada cara queda respaldada en su archivo. La conversión se verifica con el `project.js` original extraído del ZIP ZONAS1, además de verificar el original intacto.
5. Para volver al Cierre A, restaurar su paquete completo y abrir `ORIGINAL_CIERRE_A.json`. No se necesita borrar IndexedDB.

Una publicación o reversión en un servicio/tienda requiere autorización expresa. Este procedimiento entrega archivos y pruebas locales; no ejecuta publicaciones ni elimina datos del usuario.
