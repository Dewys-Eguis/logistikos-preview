# Auditoría y reorganización · 26 de septiembre de 2026

## Alcance y conservación

Se inspeccionaron los 21 archivos originales: un HTML de 923.459 bytes, un LEEME, doce PNG y siete documentos (cinco XLSX y dos PDF). Se revisaron las cuatro secuencias JavaScript, el bloque CSS, las 17 plantillas, los enlaces, campos, imágenes y recursos incrustados del HTML. Los libros se inventariaron leyendo todas sus hojas/celdas y comprobando sus contenedores; los PDF se abrieron y se extrajo el texto de sus cuatro páginas. Esta revisión de recursos no constituye una auditoría legal ni una validación financiera de los documentos.

Se conserva todo el texto comercial, los programas y sus duraciones, indicadores, modalidades, condiciones declaradas, noticias, tabla normativa, preguntas frecuentes, contactos, marcas, documentos y ejemplos. No se eliminó ninguna página o funcionalidad. No se aplicó el rediseño premium ni se sustituyó el logo.

Copia íntegra previa a los cambios: `../../backups/original-20260926/Logistikos_web/`. El script histórico de extracción se conserva al lado de la copia únicamente como registro; no forma parte del proceso normal de compilación ni debe volver a ejecutarse sobre el trabajo posterior.

## Estructura anterior

```text
Logistikos_web/
  index.html                HTML, CSS, JS, plantillas, imágenes y descargas base64
  LEEME.txt                 Limitaciones y tareas pendientes del prototipo
  logos/                    12 PNG, duplicados dentro del HTML
  kit-rrhh/                 5 XLSX y 2 PDF
```

No había gestor de paquetes, scripts de compilación, pruebas, backend ni control de versiones Git en la carpeta.

## Nueva estructura

```text
Logistikos_web/
  index.html                         Salida generada y punto de entrada portátil
  README.md                          Edición, responsabilidades y comandos
  LEEME.txt                          Original conservado como referencia histórica
  package.json
  pages/
    layout.html                      Cabecera, pie, contacto y asistente
    manifest.json                    Registro de las 17 plantillas
    home.html
    quienes-somos.html
    a-medida.html
    programas.html
    fundae.html
    rrhh.html
    al-dia.html
    radar.html                       Contenido antiguo conservado
    universitarios.html
    campus.html
    marca.html                       Comparativa tipográfica interna
    area-{especialidad}.html         Seis especialidades
    partials/partners.html           Bloque de logos compartido
  assets/
    css/
      variables.css
      base.css
      components.css
      home.css
      animations.css
      responsive.css
    js/
      main.js
      renderer.js
      courses.js
      calculator.js
      forms.js
      animations.js
      assistant.js
      downloads.js
      generated/download-data.js     Compatibilidad local, carga bajo demanda
    images/logos/                    12 PNG activos, idénticos a los originales
    icons/README.md                   Reserva y criterio de uso de SVG
  kit-rrhh/                          Documentos originales, 2 ZIP y manifest.json
  logos/                             Originales conservados, sin uso en la nueva entrada
  scripts/build.cjs
  tests/
    calculator.cjs
    regression.cjs
    http-smoke.cjs
  docs/
    AUDITORIA.md
    inventario-archivos.json          Tamaños, hashes y contenido de adjuntos
    inventario-paginas.json           Secciones, titulares, campos, enlaces y texto
    inventario-enlaces.json           Destinos y número de apariciones
    migracion.json                    Correspondencia de plantillas y extracción
    verificacion.json                Comparación en navegador e interacciones
    verificacion-recursos.json        Integridad de documentos y ZIP
    verificacion-http.json            Recursos y descargas bajo HTTP
    archivos-cambiados.json           Lista exacta de archivos creados/modificados
    previews/                         Tres capturas de la presentación conservada
```

`pages` contiene fuentes HTML, no nuevas URLs públicas. Mantener la navegación hash y compilar un único punto de entrada evita introducir requisitos de servidor antes del rediseño. La duplicación de plantillas en `index.html` es generada: solo deben editarse las fuentes. Los CSS y JS son externos incluso en la salida compilada.

## Archivos creados y modificados

Creado todo el árbol `pages`, `assets`, `scripts`, `tests` y `docs`, además de `README.md`, `package.json` y los ZIP `KIT-06_Impacto_ROI_y_guia.zip` y `Kit_RRHH_Logistikos.zip`. Los ZIP se recuperaron del HTML original, no se inventaron documentos nuevos. Se incluye un listado exacto en `archivos-cambiados.json`.

Único archivo original modificado: `index.html`, reemplazado por la salida del compilador. `LEEME.txt`, los doce PNG de `logos` y los siete documentos originales conservan sus bytes. Los logos activos se copian a `assets/images/logos` y las referencias se actualizan.

## Páginas, secciones y navegación

| Ruta | Contenido y comportamiento conservado |
| --- | --- |
| `#/` | Hero, selector de seis áreas/hoja de ruta, elección de perfil, cifras, tres diferenciales, logos, vídeo, seis especialidades, formación a medida, método, modalidades, formatos, actualidad, tres casos ilustrativos, equipo, accesos FUNDAE/RRHH y seis FAQ. |
| `#/quienes-somos` | Historia, cifras, principios, dirección/Javier Fernández, formación, publicaciones, logos y red de formadores. |
| `#/a-medida` | Tipos de necesidad, ejemplos, seis pasos y servicios incluidos. |
| `#/programas` | Seis departamentos con cuatro programas cada uno, selección dinámica y CTA contextual. |
| `#/fundae` | Calculadora de crédito, crédito consumido, participantes, horas, curso, modalidad, nivel y comparación de bonificación. |
| `#/rrhh` | Captación de email simulada, descarga de kit, seis fichas con siete herramientas, calendario y servicios a RRHH. |
| `#/al-dia` | Suscripción simulada, ocho noticias/cambios y tabla de ocho formaciones obligatorias. |
| `#/universitarios` | Seis programas transversales de 25 h, cinco sesiones por programa, grupo mínimo, diploma y dos Executive Programs. |
| `#/campus` | Servicios de campus, grabaciones, materiales, seguimiento, login simulado y ayuda por email. |
| `#/area/supply-chain` | Retos, perfiles, seis programas, programa tipo, normativa, formadores, ejemplo FUNDAE y áreas relacionadas. |
| `#/area/compras` | Misma estructura temática, seis programas de compras. |
| `#/area/transporte` | Misma estructura temática, seis programas de transporte. |
| `#/area/comercio-internacional` | Misma estructura temática, seis programas de comercio exterior. |
| `#/area/ia-datos` | Misma estructura temática, seis programas de IA/datos. |
| `#/area/liderazgo` | Seis programas y el programa insignia «De jefe a líder», comparación jefe/líder, cinco sesiones, destinatarios, indicadores y ejemplo económico. |
| `#/marca` | Cuatro alternativas de tipografía, conservadas aunque no están en el menú principal. |
| `#/radar` | Alias a «Al día». La plantilla Radar antigua y sus seis registros siguen conservados, aunque el router original no la muestra. |

`#/s/areas` y `#/s/metodo` llevan a secciones del Home. `#/de-jefe-a-lider` abre la sección correspondiente del área Liderazgo. La cabecera, el pie, las migas de pan, los enlaces entre áreas y las anclas locales se conservan. Las rutas inexistentes regresan al Home.

Destinos externos: Calendly para diagnóstico, WhatsApp general y con texto precargado, email de contacto/ayuda/recuperación, YouTube para el vídeo y Google Fonts para las tipografías. Se inventariaron las URL; no se reservaron reuniones ni se enviaron mensajes ni se verificó la titularidad o disponibilidad de estos servicios externos.

## Formularios y funciones reales

| Función | Estado encontrado y conservado |
| --- | --- |
| Calculadora FUNDAE | Funcional en cliente. Tramos por plantilla, mínimo, crédito disponible, límites, modalidades, niveles, selección de curso y barras comparativas. Sin consulta a la cuenta real FUNDAE. |
| Departamentos y hoja de ruta | Funcionales; actualizan la selección, contenido, CTA y estilos. |
| FAQ y «Otro perfil» | Desplegables nativos. Otro perfil valida texto y abre WhatsApp con un mensaje precargado; no lo envía automáticamente. |
| Kit RRHH | Valida el formato de email y desbloquea el ZIP; no guarda ni envía el email. Las descargas individuales no requieren registro. |
| Suscripción «Al día» | Valida email y muestra una confirmación, pero no registra ninguna suscripción. |
| Campus | Valida campos, borra la contraseña y muestra «disponible en breve». No hay autenticación. |
| Diagnóstico | Enlace a Calendly/WhatsApp/contacto. No existe formulario propio de diagnóstico. |
| Asistente | Panel, sugerencias, historial breve, envío, cancelación y errores. Necesita `window.claude.use('sample')`; permanece oculto fuera de ese entorno. |
| Descargas | Siete acciones, dos de ellas ZIP. Se preservan los documentos exactos y la compatibilidad con doble clic y con el servicio de descargas de Claude. |

## Duplicación y organización

- Había 2.032 atributos `style` y cuatro scripts incrustados. Se externalizaron los estilos estáticos en 486 bloques únicos y se separaron las responsabilidades JavaScript. Los eventos interpolados ahora usan atributos de datos.
- Los doce logos aparecían incrustados dos veces y también existían en disco. Ahora se reutilizan archivos PNG y un fragmento de logos compartido entre Home y Quiénes somos. Se conserva la carpeta antigua por compatibilidad y trazabilidad.
- Las descargas base64 repetían recursos del directorio `kit-rrhh`; se usa el binario original por HTTP. Un paquete generado conserva únicamente la compatibilidad con el navegador local/Claude y se carga bajo demanda.
- Las áreas comparten estructura visual y textos de CTA; sus diferencias de programa se conservaron explícitas. No se ha convertido su contenido en un catálogo nuevo ni se han fusionado textos con diferencias editoriales.
- El catálogo por departamentos, los programas por área, la selección universitaria de la calculadora y la base de conocimiento del asistente son fuentes distintas con divergencias. Separar su responsabilidad deja visible esta deuda; unificarlas requiere decidir el catálogo correcto.
- El renderizador original vuelve a construir toda la vista en cada cambio de estado y restaura foco/desplegables por posición. Se conserva para esta migración; conviene sustituirlo o acotar actualizaciones en la fase funcional posterior.

## Responsive y accesibilidad

Se mantienen los breakpoints de 1.100, 960 y 520 px. A 960 px las rejillas generales pasan a una columna, los logos a tres, la navegación se desplaza horizontalmente y la cabecera se reorganiza. Los títulos reducen a 54/36 px y luego a 42/30 px. Se conservan las áreas seguras de dispositivos y las reglas de foco.

Antes las reglas buscaban fragmentos literales de `style`, lo que hacía depender el móvil del formato del HTML. Ahora usan clases `layout-*` con las mismas coincidencias. El movimiento suave respeta `prefers-reduced-motion`.

Problemas preexistentes que siguen pendientes:

- La calculadora desborda en 390 y 768 px por el ancho intrínseco del selector de cursos y sus contenedores. `overflow-x:hidden` del body puede ocultar el problema y recortar contenido.
- La cabecera móvil usa desplazamiento horizontal: varios enlaces están fuera de la vista inicial, aunque son desplazables. Esto se distingue de un desbordamiento accidental del contenido.
- El Home y la comparativa de tipografías presentan otros elementos fuera del ancho; las mediciones exactas están en `verificacion.json`. Algunas mediciones incluyen contenido de desplegables cerrados: no todas representan un defecto visible.
- La cabecera sticky cambia de altura, pero el offset de anclas es fijo. Puede tapar títulos en pantallas estrechas.
- Algunas páginas usan `h2` como primer encabezado; la nueva fase debe revisar jerarquía, foco tras navegar, mensajes de formulario anunciados y nombres accesibles de todos los controles.

## Atención necesaria antes del rediseño/publicación

1. **Integraciones**: definir CRM/email, suscripción real, política de consentimiento, URL del campus y backend del asistente. Los textos «Kit en camino» y «Recibirás...» son promesas del prototipo, no envíos reales. Se han conservado por la instrucción de no cambiar contenido.
2. **Calculadora**: usa salario bruto medio como aproximación de cotización. No valida costes reales, crédito oficial ni todos los condicionantes de bonificación; acepta algunos valores incoherentes entre campos. Las reglas se preservaron, no se certificaron.
3. **Catálogo**: la página universitaria muestra seis títulos, pero la calculadora añade cuatro universitarios con otros títulos. El curso seleccionado inicialmente no se recalcula desde el catálogo hasta que se cambia. Resolver una fuente de verdad editorial.
4. **Enlaces antiguos**: `#/s/fundae` de las seis áreas apunta a una sección inexistente del Home, por lo que no abre la calculadora; habría que migrarlo a `#/fundae`. El Radar antiguo queda sin ruta propia al existir el alias. Estos comportamientos se documentan y conservan para no introducir cambios funcionales silenciosos.
5. **Contenido**: confirmar cifras (20.000 horas, 167 empresas, países), garantía a 60 días, credenciales, uso de marcas, testimonios/casos reales, diploma universitario, duraciones, modalidades, mínimos de participantes y etiquetas comerciales. Las afirmaciones normativas de 2026 no se han verificado jurídicamente en esta tarea.
6. **Material visual**: solo hay logos de terceros, wordmark tipográfico e iconos SVG; faltan fotografía real de dirección, sesiones y equipo. No se generaron imágenes nuevas.
7. **SEO**: las rutas hash no equivalen a páginas HTML indexables independientes. Definir URLs, metadatos por página, canonical, sitemap, robots y página 404 cuando se elija el despliegue.
8. **Páginas legales**: faltan aviso legal, privacidad y cookies. Inventariar servicios/almacenamiento reales antes de diseñar cualquier consentimiento.
9. **Operación**: no hay backend, pruebas en Safari/Firefox ni pruebas con servicios reales. Elegir alojamiento y flujo de publicación; no publicar copias de seguridad ni herramientas de auditoría como contenido público.

## Verificación

- Comparación automática de 17 rutas a 390, 768 y 1.440 px: 51 vistas, igualdad del contenido y de 29 propiedades CSS calculadas por elemento, sin errores JavaScript en la ejecución verificada. Google Fonts se bloqueó de forma idéntica en ambas versiones para evitar variaciones de red; esto prueba la conservación de la presentación, no la calidad visual del prototipo.
- Prueba diferencial de 86 escenarios de calculadora: todos los límites de plantilla, cuatro modalidades, dos niveles, campos vacíos, valores negativos, ceros y crédito agotado coinciden con la lógica original.
- Interacciones: selectores, FAQ, validaciones, cambios de curso/horas, foco, siete descargas con comparación de bytes, Campus, alias/anclas/ruta desconocida, enlace precargado de WhatsApp y asistente mediante stub local.
- Integridad: originales PNG/PDF/XLSX/LEEME conservados byte a byte; ZIP legibles y contenidos idénticos a los recursos originales.
- HTTP local: CSS, JavaScript e imágenes cargan sin recursos locales ausentes; las siete descargas coinciden byte a byte y no cargan el paquete base64 de compatibilidad. Se revisaron capturas del Home en escritorio/móvil y de la calculadora móvil, que confirman el recorte preexistente.
- Los límites de producción indicados arriba no se consideran funcionalidades conectadas por haber pasado estas pruebas.

La arquitectura está preparada para diseñar el Home nuevo con la paleta solicitada: `#070B14`, `#0F172A`, `#315BFF`, `#6F8BFF`, `#FF7A1A`, `#F8FAFC` y `#94A3B8`. Los colores anteriores se mantienen mediante variables de compatibilidad hasta que se apruebe y ejecute esa fase.
