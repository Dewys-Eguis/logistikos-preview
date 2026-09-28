# Tres áreas completas y habilitadas

Trabajo realizado exclusivamente sobre la carpeta vigente. La referencia de conservación se capturó de estas mismas fuentes al comenzar esta tanda; no procede de proyectos anteriores.

## Archivos modificados

- pages/al-dia.html
- pages/area-comercio-internacional.html
- pages/area-ia-datos.html
- pages/area-liderazgo.html
- pages/home.html
- pages/layout.html
- assets/js/formacion.js
- assets/js/main.js
- index.html (regenerado desde fuentes)
- tests/search-radar-counters.cjs (actualiza las expectativas de bloqueo a acceso activo)

## Archivos añadidos

- assets/css/areas-completed.css
- assets/js/areas-completed.js
- assets/images/area-international.jpg
- assets/images/area-leadership.jpg
- assets/images/area-data.jpg
- tests/areas-completed.cjs
- tests/fixtures/areas-current-before.json

Las pruebas generan capturas y results.json en docs/areas-completed-check y actualizan las evidencias de docs/search-radar-check. La prueba HTTP actualiza docs/verificacion-http.json.

## Contenido conservado

- Comercio Internacional: sus seis programas con títulos, horas, modalidades, niveles, indicadores y etiquetas originales; perfiles, retos, normativa existente, metodología, formadores, condiciones y ejemplo FUNDAE. Se conserva su nombre sin añadir “Aduanas”.
- Liderazgo: sus siete programas, incluido De jefe a líder, sus cinco sesiones y entregables, los perfiles destinatarios, comparación, indicadores a 60 días, condiciones y ejemplos FUNDAE.
- IA y datos: sus seis programas, perfiles, retos, metodología, referencias normativas ya existentes, condiciones, formadores y ejemplo FUNDAE.

No se añadieron programas, cifras, normativa, duraciones, modalidades, niveles, condiciones ni perfiles. Los títulos neutrales y controles de navegación son la única nueva rotulación editorial.

## Reorganización

Cabecera con imagen humana, accesos a temas, navegación interna, tarjetas de retos, catálogo en acordeones nativos, proceso en cuatro pasos y detalle progresivo para contenido secundario. Comercio Internacional abre con importación, exportación y documentación; Incoterms y pagos preceden a los programas aduaneros. Liderazgo dispone de un bloque propio para el programa insignia y cinco sesiones desplegables. IA utiliza acentos azules y una foto colaborativa dentro del mismo sistema tipográfico.

## Fotografías

Tres fotografías de recurso diferentes, almacenadas localmente e integradas una vez en la cabecera de cada área. No se identifican como miembros o clientes de Logístikos.

- Comercio Internacional: assets/images/area-international.jpg — [Fuente en Pexels](https://www.pexels.com/photo/shipping-containers-at-port-dock-workers-prepare-for-loading-28438301/).
- Liderazgo: assets/images/area-leadership.jpg — [Fuente en Pexels](https://www.pexels.com/photo/coworkers-looking-at-a-laptop-in-a-meeting-7698802/).
- IA y datos: assets/images/area-data.jpg — [Fuente en Pexels](https://www.pexels.com/photo/colleagues-cooperating-working-on-computer-together-12903143/).

## Acceso público

Las rutas #/area/comercio-internacional, #/area/liderazgo y #/area/ia-datos quedan habilitadas en el proyecto. Los menús de escritorio y móvil, tarjetas, footer y buscador tienen enlaces activos. Se mantiene #/de-jefe-a-lider y se admiten anclas de programa. En el radar solo se sustituye Próximamente por el enlace activo de Liderazgo; sus señales y textos permanecen intactos.

El buscador mantiene todas las entradas anteriores y añade el programa insignia ya existente que el selector anterior omitía: ahora indexa 60 entradas.

## Verificación

- npm run build: correcto.
- node tests/areas-completed.cjs: correcto. Conservación exacta de datos de programas y contenido, hashes de las fuentes protegidas, rutas, navegación desktop/móvil, teclado, acordeones, anclas, imágenes locales y CTA.
- 320, 390, 768, 1024 y 1440 px: sin overflow, también con todos los desplegables abiertos, en dark y light.
- Cambio de tema mediante el control real y persistencia tras recargar: correctos.
- node tests/search-radar-counters.cjs: correcto; buscador, seis filtros, acentos, vacío, contadores, reducción de movimiento, radar y rutas activas.
- node tests/http-smoke.cjs: correcto; assets y siete descargas comprobados.
- Sin errores JavaScript en las verificaciones. Capturas revisadas visualmente en escritorio y móvil.

La suite heredada npm test depende de un backup histórico ausente, como ya se documentó en la tanda anterior. No se recuperó ni se usó ese proyecto. Las verificaciones de esta entrega utilizan únicamente las fuentes actuales.
