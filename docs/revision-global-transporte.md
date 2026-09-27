# Revisión global y Transporte · 27/09/2026

## Actualización: Transporte aprobada y habilitada

Tras la aprobación del usuario, se retiró únicamente Transporte de PENDING_AREAS y se activó el enlace estático que Compras mantenía deshabilitado. Los accesos de footer, Formación, Home, Supply Chain, Al día y listados usan ahora la ruta pública `#/area/transporte`. El servidor `scripts/preview-area.cjs` sirve los archivos sin excepciones ni modificaciones del router.

Activas: Supply Chain, Compras y Transporte. Pendientes y bloqueadas: Comercio Internacional, Liderazgo e IA y datos. No se continúa con ninguna de ellas.

Archivos funcionales de esta activación: `assets/js/main.js`, `pages/area-compras.html`, `scripts/preview-area.cjs` e `index.html` regenerado mediante build. Se actualizaron las tres pruebas existentes (`tests/global-review.cjs`, `tests/transporte.cjs`, `tests/compras.cjs`) y sus evidencias para comprobar tres áreas bloqueadas, Transporte activa, sus accesos reales y su responsive. No se cambió el diseño aprobado.

El resto de este documento es el registro histórico de la entrega anterior, cuando Transporte aún estaba pendiente de aprobación.

Compras aprobada y activa. Transporte terminada para revisión, todavía bloqueada en la web pública. Comercio Internacional, Liderazgo e IA y datos siguen bloqueadas y no se han rediseñado.

## Footer único

La duplicación tenía dos causas: Home incluía `pages/partials/home-footer.html` y ocultaba el footer global con `body.is-home > footer { display:none; }`; además, once hojas de estilos contenían variantes o reglas relacionadas con los footers según la página.

Se conserva el footer global de `pages/layout.html`, con el bloque de contacto y la estructura de columnas de las páginas aprobadas. Su presentación se centraliza en `assets/css/footer.css`, con la escala tipográfica compartida. Se retiraron las reglas de footer específicas de cada ruta y se eliminó el parcial duplicado de Home y su include. Home conserva su sección editorial de contacto, que no es un segundo footer.

Se integraron antes de retirar el parcial: «Transformación para organizaciones», Murcia, presencial y aula virtual, teléfono con enlace `tel:`, YouTube, consulta legal y de privacidad y volver arriba. Permanecen logo, descripción, Every step covered, seis áreas con sus nombres completos, Formación a medida, Por departamento, Cursos universitarios, FUNDAE, Recursos para RRHH, Campus, Nosotros, Al día, correo, WhatsApp, copyright y agenda de diagnóstico. No se inventaron documentos legales: el enlace original sigue siendo una consulta por correo.

El cierre permanece oscuro en ambos temas. La fila final reserva espacio para evitar que WhatsApp cubra «Volver arriba» al llegar al final. El enlace de volver arriba ahora funciona sin cambiar de ruta, también fuera de Home.

## Hero móvil de Home

La animación precedía al contenido en el DOM. A 900 px o menos pasaba a posición relativa y ocupaba espacio antes del título. Además, su animación de entrada seguía aplicando `translateY(-50%)`, propia del posicionamiento absoluto de escritorio.

Se movió `.hero-content` antes de `.hero-logistics-art`. En móvil la ilustración entra después del CTA en el flujo normal, con una animación de entrada propia que termina sin desplazamiento. Se ajustaron el espacio superior, los márgenes laterales y el tamaño máximo del dibujo; la órbita lateral queda dentro del ancho disponible. El pequeño código decorativo del final del hero se oculta en móvil. La composición absoluta de escritorio se mantiene.

## Compras activa y bloqueo restante

Se retiró únicamente `#/area/compras` de PENDING_AREAS. Los enlaces existentes del footer, Home, Formación, Supply Chain y otras páginas quedan activos mediante el mismo mecanismo de navegación, sin duplicar excepciones. Se comprobó que Compras no mantiene atributos de deshabilitado ni etiquetas «Próximamente».

Transporte, Comercio Internacional, Liderazgo e IA y datos permanecen en PENDING_AREAS. También se bloquea el alias antiguo de Liderazgo `#/de-jefe-a-lider`, que antes permitía llegar al área pendiente por otra ruta.

El selector de tema sincroniza ahora su texto y atributos accesibles después de cada render, evitando etiquetas desactualizadas al navegar.

## Transporte: contenido y diseño

Antes de editar se leyó la página completa y el contenido relacionado de `assets/js/courses.js`. Se guardó el HTML anterior en `tests/fixtures/transporte-before.html`. Se mantuvo como referencia principal el contenido de la página, sin sustituirlo por títulos distintos del catálogo resumido de Formación.

La composición usa un recorrido de origen, ruta y entrega, con líneas, nodos y un tramo animado. No contiene un mapa geográfico, cifras simuladas ni resultados comerciales inventados. Los retos se presentan en filas editoriales, el catálogo permite filtrar sin salir de la página, el proceso se conecta verticalmente y la normativa se organiza en seis entradas. El ejemplo FUNDAE conserva su condición completa.

| Programa original | Duración | Modalidad | Nivel | Indicador |
| --- | --- | --- | --- | --- |
| Tacógrafo inteligente y tiempos de conducción y descanso | 8 h | Presencial | Básico | Sanciones evitadas |
| Gestión económica de la flota y control del combustible | 16 h | Híbrida | Superior | Coste por kilómetro |
| Planificación de rutas y ocupación de la flota | 16 h | Híbrida | Superior | Kilómetros en vacío |
| Documentación digital del transporte: e-CMR y Ley de Movilidad Sostenible | 8 h | Online Live | Superior | Días de cobro |
| Mercancías peligrosas (ADR) y perecederas (ATP) para jefes de tráfico | 12 h | Presencial | Superior | Incidencias en ruta |
| Negociación y venta en el sector transporte | 12 h | Presencial | Superior | Margen por servicio |

También se conserva:

- Claim y descripción; perfiles de jefes de tráfico, planificadores de rutas, gestores de flota y administración de transporte.
- Los cuatro retos con sus explicaciones completas: urgentes, facturación sin auditar, incidencias y huella en licitaciones.
- Las etiquetas Obligación 2026, Más demandado y Nuevo 2026 en sus programas originales.
- Las tres afirmaciones originales del cliente sobre demanda, tacógrafo, documentación, inspección y gasóleo, sin añadir cifras o normativa ni presentarlas como investigación nueva.
- Los cuatro pasos: revisión de rutas/tarifas/facturas, planificación y costeo, incidencias y automatización con IA, cuadro de mando y revisión a 60 días.
- LOTT, Convenio CMR, Acuerdo ATP, ADR, eFTI · e-CMR e ISO 14083.
- Directivos en activo, asignación por sector y mercancía, NDA y propuesta de dos perfiles entre los que elige el cliente.
- Gestión FUNDAE sin coste añadido. Rutas y ocupación de flota, 16 h, híbrida: 12 participantes × 16 h × 13 €/h = hasta 2.496 €, sujeto al crédito disponible. Se conserva que Online Live se bonifica con el módulo presencial.
- Acceso a la calculadora y otras áreas: Supply Chain y Compras activas; las tres áreas restantes deshabilitadas.

### Interacciones

Filtros Todos / Operación / Costes y negocio / Cumplimiento, con estado `aria-pressed`, contador anunciado y conservación de los programas al volver a Todos. Acordeones nativos con nivel e indicador, desplegable de contexto de demanda, anclas de programas/contacto, foco visible y hover. Movimiento sutil de ruta, desactivado con reducción de movimiento. Los filtros solo se muestran si se inicializa su comportamiento; sin él, los seis programas permanecen disponibles. El módulo elimina sus listeners al abandonar la página.

## Archivos de esta revisión

Fuentes modificadas:

- `pages/home.html`
- `pages/layout.html`
- `pages/area-transporte.html`
- `assets/js/main.js`
- `assets/js/theme.js`
- `assets/css/home.css`
- `assets/css/empresas.css`
- `assets/css/formacion.css`
- `assets/css/fundae.css`
- `assets/css/nosotros.css`
- `assets/css/rrhh.css`
- `assets/css/universitarios.css`
- `assets/css/al-dia.css`
- `assets/css/supply-chain.css`
- `assets/css/campus.css`
- `assets/css/theme.css`

Nuevos: `assets/css/footer.css`, `assets/css/transporte.css`, `assets/js/transporte.js`, `tests/global-review.cjs`, `tests/transporte.cjs`, `tests/fixtures/transporte-before.html` y este informe.

Retirado: `pages/partials/home-footer.html`. El servidor local `scripts/preview-compras.cjs` pasa a llamarse `scripts/preview-area.cjs` y su única excepción local es Transporte. Actualizados `tests/compras.cjs` y `docs/rediseno-compras.md` para reflejar la aprobación.

Generado mediante build: `index.html`. No se edita manualmente. El contenido de `assets/js/generated/download-data.js` no cambió. No se tocó node_modules ni se añadieron frameworks o dependencias.

Evidencias:

- `docs/global-previews/`: `home-{dark,light}-{320,375,390,430,768,900,1440}.png`, `footer-390.png`, `footer-1440.png`, `report.json`.
- `docs/transporte-previews/`: `dark-390.png`, `light-390.png`, `dark-1440.png`, `light-1440.png`, `interaction-light-390.png`, `report.json`.
- Actualizadas las cuatro capturas y `report.json` de `docs/compras-previews/` tras activar Compras y unificar el footer.

Los archivos del rediseño anterior de Compras se conservan; su HTML y CSS no se volvieron a rediseñar en esta revisión.

## Verificación

- `npm run build` correcto y `git diff --check` sin errores.
- `tests/global-review.cjs`: 154 combinaciones de 11 páginas × 7 anchos × 2 temas; un único footer y sus estilos/dimensiones iguales en todas las rutas; Home a 320, 375, 390, 430, 768, 900 y 1440 px; título temprano, dibujo después del CTA, sin hueco enorme ni solapamiento con el texto, sin desbordamiento horizontal; animación real y movimiento reducido; menús móvil y Recursos, cambio de tema, volver arriba y navegación.
- `tests/compras.cjs`: preservación del contenido, 12 combinaciones de tamaño/tema, teclado, anclas, enlace desde Supply Chain y estado público activo.
- `tests/transporte.cjs`: comparación del contenido y cada campo de los seis programas; 18 combinaciones de 320 a 1920 px en ambos temas; filtros por teclado, recuento, acordeones, salida y regreso, contacto, calculadora y rutas bloqueadas. Carga local HTTP con rutas relativas compatibles con GitHub Pages.
- Sin errores JavaScript en estas pruebas. Capturas revisadas visualmente.
- La suite histórica que depende de `../backups/original-20260926/Logistikos_web/index.html` no se usa: ese respaldo no existe en esta copia. Se ejecutaron las pruebas específicas anteriores; la calculadora no se modificó.

## Cómo revisar

Desde la raíz del proyecto, `node scripts/preview-area.cjs` y abrir http://127.0.0.1:4173/#/area/transporte. Solo escucha en 127.0.0.1. La excepción de Transporte se aplica a la respuesta local del JavaScript, nunca al archivo público. Para Home y Compras se pueden usar las mismas URLs locales con `#/` y `#/area/compras`.

No se ha publicado ni habilitado Transporte. No se ha iniciado Comercio Internacional. Siguiente paso: revisión visual y aprobación del usuario.
