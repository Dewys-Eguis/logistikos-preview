# Arquitectura y navegación

- Empresas incorpora «Modalidades y formatos» entre el proceso y «Qué incluye siempre», con las tres modalidades y cinco formatos solicitados. Se conserva literalmente el contenido recibido.
- Online Live enlaza a `#/campus`, A medida a `#/a-medida` y Cursos universitarios a `#/universitarios`.
- El proceso mantiene sus seis pasos. Enlace directo: `#/a-medida#como-trabajamos`. Se mantiene el identificador anterior `como-funciona` como alias.
- Home e interiores presentan Formación, Empresas, Nosotros, Recursos y Al día. Recursos contiene FUNDAE, Para RRHH y Cursos universitarios.
- En anchos inferiores a 1100 px se utiliza un diálogo nativo con hamburguesa. Campus está en el menú; Hablemos pasa al menú por debajo de 560 px. El selector de tema sigue visible en el header.
- Recursos utiliza un botón de apertura, enlaces normales, Tab, flechas, Inicio/Fin y Escape. El diálogo mantiene el foco, restaura el foco al cerrar y se cierra al navegar o pasar a escritorio.
- No se modifican las páginas de RRHH, FUNDAE, Formación o Nosotros, ni el footer, WhatsApp, imágenes o cálculos.

## Archivos de implementación

- pages/a-medida.html
- pages/layout.html
- pages/home.html
- assets/css/empresas.css
- assets/css/navigation.css (nuevo)
- assets/js/navigation.js (nuevo)
- assets/js/home.js (retirada del controlador móvil anterior)
- assets/js/main.js (enlaces a secciones de una ruta)
- index.html (generado con npm run build)

## Verificación

`tests/architecture.cjs`: 20 combinaciones de Home/Empresas, claro/oscuro y 1920, 1440, 1024, 768 y 390 px. Comprueba los límites del header y del bloque añadido, teclado, cierre exterior, navegación móvil, Escape y enlace directo al proceso. Sin errores JavaScript. Capturas en `docs/architecture-previews`.

La escala utiliza las variables existentes: `--type-section`, `--type-subtitle`, `--type-body`, `--type-secondary` y `--type-small`; no se añaden tamaños tipográficos.
