# FEP EDITOR PRO — P8 + P9 Integral — Checklist de validación Android

Versión candidata: **0.9.9-p8p9**. **Validación funcional inicial aprobada por usuario: 12/12 pruebas**, informadas el 25-11-2026. No equivale a cierre de las verificaciones detalladas ni a aprobación comercial.

## Validación funcional informada por el usuario — 25-11-2026
- [x] Instalación de P8+P9 y versión visible 0.9.9-p8p9.
- [x] Acceso a proyectos anteriores o restauración mediante ZIP (sin prueba diferenciada de ambos métodos).
- [x] «Diseño + 3D» muestra ambos espacios.
- [x] «Ampliar 2D» y «Ampliar 3D» funcionan sin pérdida de capas.
- [x] La taza refleja cambios de diseño en tiempo real.
- [x] Cámaras rápidas: frente, tres cuartos y zona impresa.
- [x] «Estudio Pro» mejora la presentación visual.
- [x] Colores de asa, borde e interior no afectan la impresión.
- [x] Las velocidades de video 360° generan los archivos esperados.
- [x] Fondo fotográfico funciona.
- [x] PNG y PDF conservan dimensiones y espejo correctos.
- [x] Modo avión y arranque sin errores.

**No inferir de lo anterior:** actualización sin desinstalar (A02); restauración de ZIP corrupto/cancelado (A08-A09); firma estable (A13-A14); mediciones impresas reales (D01-D09); validación de todos los modelos (C01-C05); licencia/publicación (F01-F07). Permanecen por verificar.


Reglas: no marcar una prueba aprobada por el hecho de que CI esté verde; prueba en dispositivo real y documenta evidencia. Mantener intactas P1–P7.

Marca [x] al aprobar y anota modelo Android, versión, captura, archivo exportado o fallo. La app **no puede declararse lista para vender** mientras existan bloqueantes sin resolver.

## A. Instalación, firma y protección de datos (bloqueantes)
- [ ] A01. La APK se instala sin error en Android 12 o superior.
- [ ] A02. La nueva APK **actualiza encima de la anterior**, sin desinstalar ni borrar datos. Si falla, bloquear lanzamiento.
- [ ] A03. Versión y build reales visibles en Proyecto → Acerca de.
- [ ] A04. Abrir proyecto anterior y comprobar capas y valores originales.
- [ ] A05. Exportar biblioteca ZIP completa desde Mis proyectos.
- [ ] A06. Abrir ZIP externamente y comprobar manifest.json y archivos individuales.
- [ ] A07. Restaurar ese ZIP en una biblioteca de pruebas; conserva proyectos anteriores.
- [ ] A08. Intentar restaurar ZIP corrupto y confirmar que NO se incorporan proyectos incompletos.
- [ ] A09. Cancelar restauración a mitad y comprobar que no se pierden proyectos previos.
- [ ] A10. Abrir/cerrar app y reiniciar teléfono; proyectos permanecen.
- [ ] A11. Modo avión: abrir, diseñar, exportar y guardar.
- [ ] A12. No aparece «Arranque con limitaciones: runtime» con todos los módulos sanos.
- [ ] A13. Firma debug estable verificada entre dos builds, con huella SHA-256 coincidente.
- [ ] A14. Certificado Release persistente y custodiado, distinto al debug. **No configurado aún**.

## B. Experiencia visual y edición en vivo
- [ ] B01. Cabecera compacta; lienzo útil en teléfono de ~6 pulgadas.
- [ ] B02. Botón «Diseño + 3D» muestra ambos espacios.
- [ ] B03. «Ampliar 2D» deja el lienzo grande y editable.
- [ ] B04. «Ampliar 3D» deja girar y ampliar producto sin controles encima.
- [ ] B05. «Volver a diseño + 3D» no pierde selección ni historial.
- [ ] B06. Cambiar modo no crea capas ni modifica el diseño.
- [ ] B07. Escena → Fondo / Vistas / Exportar / Avanzado sin controles duplicados.
- [ ] B08. Barra inferior utilizable en pantalla pequeña y rotación horizontal.
- [ ] B09. Editar foto, texto y sticker y ver 3D actualizado sin «Aplicar».
- [ ] B10. Deshacer, rehacer, bloquear, ocultar, duplicar y reordenar capas.
- [ ] B11. Gestos de dos dedos en fotos, texto, stickers; sin saltos.
- [ ] B12. Guías no aparecen en PNG/PDF final.
- [ ] B13. Plantillas P5 siguen editables y no sobrescriben capas anteriores.

## C. Producto 3D / calidad comercial
- [ ] C01. Taza cerámica: geometría creíble, asa bien proporcionada, diseño centrado.
- [ ] C02. Taza esmaltada: colores/contorno y vista realistas, incluyendo advertencias de prototipo.
- [ ] C03. Vaso térmico: diseño envuelto sin distorsión visible.
- [ ] C04. Polera: frente, espalda y mangas sin deformación.
- [ ] C05. Cojín, bolsa, libreta, llavero, mousepad y placa: cada modelo correcto.
- [ ] C06. Cámara rápida: frente, tres cuartos, área impresa y superior.
- [ ] C07. Giro manual y zoom funcionan sin invertir la orientación.
- [ ] C08. «Estudio Pro» aplica escenario cálido, luz suave, cámara y calidad HD.
- [ ] C09. Fotografía de teléfono de más de 16 MP se adapta antes de importarla.
- [ ] C10. La foto de escena aparece detrás del objeto y no en diseño imprimible.
- [ ] C11. Restablecer/eliminar fondo de escena funciona.
- [ ] C12. Paletas de asa/borde/interior cambian el modelo y no los colores de impresión.
- [ ] C13. Captura mockup PNG correcta, sin interfaz superpuesta ni cortes.
- [ ] C14. Video 360°: velocidades rápida / normal / lenta modifican duración y exportan.
- [ ] C15. No hay cierres por memoria tras 10 exportaciones, giros y cambios de escenas.

## D. Impresión y producción
- [ ] D01. PNG a escala real: medir con regla, margen de error aceptado ≤1 mm (para pieza de prueba).
- [ ] D02. JPEG y PDF equivalentes en medidas a PNG.
- [ ] D03. Espejo horizontal invierte todo el diseño incluyendo letras.
- [ ] D04. Plancha A4 imprime a 100%, sin «ajustar a página».
- [ ] D05. Plancha A3 genera archivo sin cerrar app; resolución efectiva clara.
- [ ] D06. Sangrado y marcas de corte no contaminan el diseño del producto.
- [ ] D07. Recorte de fotografía avisa ppp efectivos insuficientes.
- [ ] D08. Imprimir una prueba real de taza: ajustar centro, asa, sangrado y orientación.
- [ ] D09. Comparar colores impresos con referencia: anotar perfil, impresora, papel y tinta.

## E. Competidores — evaluación honesta de brechas
- [ ] E01. Comparar un mismo diseño de taza en FEP, Mocka3D y Mug3D.
- [ ] E02. Comparar velocidad del flujo para producir 3 piezas.
- [ ] E03. Comparar fotos del mismo diseño y mismo ángulo a resolución similar.
- [ ] E04. Identificar modelos faltantes: sets de tazas, Stanley, botellas, funda, etc.
- [ ] E05. Agrupar/combinar capas: no declarar paridad sin herramienta y prueba.
- [ ] E06. AR, comunidad, compartir por enlace y generación IA: **fuera de la modalidad completamente offline actual** hasta definir alcance, permisos e infraestructura.
- [ ] E07. No copiar recursos visuales, modelos o código de competencia sin licencia.

## F. Publicación
- [ ] F01. APK Release y AAB firmados con keystore comercial protegido.
- [ ] F02. Licencias de modelos, stickers, tipografías y dependencias documentadas.
- [ ] F03. Política de privacidad y datos de soporte reales y publicados.
- [ ] F04. Ficha Google Play: capturas auténticas y declaración de funciones exacta.
- [ ] F05. Prueba cerrada de compra única y actualización desde pista de pruebas.
- [ ] F06. Android/iOS: no afirmar iOS compatible sin build y pruebas en dispositivo.
- [ ] F07. Cero fallos bloqueantes antes de autorizar publicación 1.0.

## Criterio de salida
**Aprobado funcionalmente**: A01,A03-A12 y B,C,D verificados en al menos un Android real; cero fallas críticas.  
**Aprobado comercialmente**: A02,A13,A14,F01-F07 verificados y propietarios autorizan publicación.  
La aprobación de pruebas automáticas NO reemplaza estas verificaciones.

### Registro de prueba
- Fecha:
- Modelo:
- Android:
- Build FEP:
- Resultado correctas / fallidas / pendientes:
- Problemas y capturas:
- Aprobación:
