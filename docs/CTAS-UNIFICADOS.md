# Llamadas a la acción unificadas (CTAs)

Fecha: 2 de octubre de 2026 · Rama: `ctas-unificados`

## La regla

Toda la web usa **dos puertas, siempre con el mismo nombre y en el mismo orden**:

| Botón | Destino | Uso |
| --- | --- | --- |
| **Cuéntanos tu reto** (principal) | `#/diagnostico?tema=<clave>` | El visitante describe su necesidad o problema y recibe el informe diagnóstico por email en 24 h laborables. |
| **Agendar reunión** (secundario) | `https://calendly.com/logistikos/reunion` | Para quien prefiere hablar directamente con un experto (30 min). |

WhatsApp, email y teléfono quedan como enlaces de texto.

**Línea de beneficio (opción B).** Junto al botón «Cuéntanos tu reto» aparece
`<p class="cta-benefit">Diagnóstico gratuito en 24 h · Sin compromiso</p>` (en FUNDAE:
«Incluido en el diagnóstico gratuito · Sin compromiso»). Así el botón dice la acción y la línea
dice el beneficio. Estilo en `assets/css/components.css` (`.cta-benefit`).

«Diagnóstico» se usa solo para el **informe** que se recibe, nunca para el botón de Calendly.
Ningún botón dice ya «Agendar diagnóstico», «Hablemos», «Hablar de vuestro reto», etc.

Excepciones con conversión propia, que no cambian: Webinar (Inscribirme), Campus (Acceder),
Talento Internacional (Cuéntanos tus vacantes) y Kit RRHH (Descargar). Todas terminan en el
bloque de contacto común, que ofrece las dos puertas.

## Parámetro `tema`

Cada botón indica desde dónde llega el visitante. `assets/js/diagnostico.js` lo traduce y lo
envía en el campo `origen` del email (por ejemplo, «Web Logístikos · Cuéntanos tu reto ·
FUNDAE · validar crédito»). Con algunos temas el formulario muestra además una etiqueta y un
ejemplo adaptado.

Claves en uso: `cabecera`, `menu-movil`, `contacto`, `pie`, `inicio`, `inicio-cierre`,
`a-medida`, `programas`, `quienes-somos`, `supply-chain`, `compras`, `transporte`,
`comercio-internacional`, `ia-datos`, `liderazgo`, `de-jefe-a-lider`, `fundae`,
`universitarios`, `obligatorias`.

Para añadir un botón nuevo: enlazar a `#/diagnostico?tema=<clave>` y añadir la clave al objeto
`TOPICS` de `diagnostico.js`. Si la clave no existe, el formulario funciona igual, sin etiqueta.

## Cambios por archivo

- `pages/layout.html`: cabecera y menú móvil → «Cuéntanos tu reto»; bloque `#contacto` con
  texto nuevo y las dos puertas; columna de contacto del pie; meta-descripción («nuestro equipo
  de expertos»); texto del asistente.
- `pages/home.html`: portada y bloque final con «Cuéntanos tu reto» + «Agendar reunión».
- `pages/diagnostico.html`: título «Cuéntanos tus necesidades o problemas»; todo en *tú*;
  teléfono opcional; enlace «Agendar reunión» en el paso 3, bajo el formulario y como botón en
  el mensaje de confirmación; etiqueta de tema.
- `pages/a-medida.html`, `programas.html`, `quienes-somos.html`, `area-*.html`,
  `fundae.html`, `universitarios.html`, `al-dia.html`: etiquetas y destinos unificados.
- `assets/js/diagnostico.js`: lectura de `tema`, campo `origen`, ejemplos por tema.
- `assets/js/main.js`: título de la ruta → «Cuéntanos tu reto».
- `assets/js/assistant.js`: base de conocimiento del asistente alineada.
- `assets/css/diagnostico.css`, `assets/css/footer.css`: estilos de los elementos nuevos.
- `form-api/server.js`: asunto «Nuevo reto», fila «Teléfono» en el email.
- `tests/areas-completed.cjs`: el botón de las áreas ahora abre el formulario.

La ruta sigue siendo `#/diagnostico` para no romper enlaces ya compartidos.

## Pendiente (no tocado)

- Claim «Every step covered» en el pie, la portada y `LEEME.txt`: falta el claim en español.
- Error previo en `assets/js/animations.js:78` (`updateScroll` lee `classList` de un elemento
  nulo al hacer scroll). Ya existía antes de este cambio.
- Tras desplegar `form-api` con el cambio de `server.js`, reiniciar el servicio en Render.

## Publicar

```sh
npm run build   # regenera index.html (ya incluido en este commit)
git push origin ctas-unificados
```
