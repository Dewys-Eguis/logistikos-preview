# Compras · aprobada y habilitada

Actualización posterior: Compras fue aprobada y se retiró de PENDING_AREAS. El footer ahora es único en todo el sitio. La revisión local de la siguiente área se ejecuta con `node scripts/preview-area.cjs`; Compras funciona en la ruta pública `#/area/compras`. El registro siguiente describe la entrega inicial, antes de esa aprobación.

Solo se ha rediseñado Compras. No se ha habilitado ninguna de las cinco áreas pendientes ni se ha modificado el router público, header, Recursos, footer, WhatsApp o control de tema. Sin frameworks ni dependencias nuevas.

## Revisión local

En la entrega inicial se utilizó un servidor de revisión local; ahora Compras se abre directamente desde la web normal en `#/area/compras`.

El servidor escucha únicamente en 127.0.0.1 y permite revisar Compras en memoria. No modifica el bloqueo de enlaces ni los archivos públicos. En GitHub Pages y al abrir index.html normalmente, Compras continúa redirigiendo a Formación. No publicar este servidor: es una herramienta local de revisión.

## Contenido conservado

- Claim y descripción originales; compradores, category managers, responsables de aprovisionamiento y dirección de compras.
- Los cuatro retos y sus explicaciones completas.
- Los seis programas originales de la página (no sustituidos por el catálogo diferente de Formación): negociación TCO, contratos internacionales, compras y aprovisionamiento, riesgo de proveedor, finanzas e IA aplicada a compras. Se conservan títulos completos, 16/12/20/12/12/8 horas respectivamente, modalidades, nivel Superior, los seis KPI y etiquetas Más demandado / Nuevo 2026.
- Las dos afirmaciones originales sobre demanda en España y su atribución a Empack y Logistics & Automation. Se preservan como contenido del cliente, sin añadir cifras ni presentarlas como una investigación nueva.
- Los cuatro pasos originales, incluido el plan por categoría y revisión a 60 días.
- CBAM, EUDR, Incoterms® 2020 y diligencia debida en la cadena de suministro.
- Directivos en activo, asignación por sector y mercancía, NDA y elección entre dos perfiles.
- Gestión FUNDAE sin coste añadido; negociación TCO presencial de 16 h; 8 participantes × 16 h × 13 €/h = hasta 1.664 €, sujeto al crédito disponible. Enlace original a la calculadora.
- Nombres de las otras cinco áreas: Supply Chain activa; las cuatro pendientes deshabilitadas.

## Reorganización e interacción

- Hero editorial con panel gráfico TCO, factores cualitativos del texto original, grid y movimiento sutil; sin datos simulados.
- Retos en acordeones accesibles; catálogo de dos columnas con seis fichas desplegables que mantienen duración y modalidad visibles y muestran nivel e indicador al abrirse.
- Contexto de demanda en un desplegable adicional.
- Proceso en secuencia horizontal en escritorio y vertical en móvil.
- Normativa en cuatro filas separadas junto al bloque de formadores; ejemplo FUNDAE en un bloque de cálculo destacado.
- Enlaces a programas y contacto, foco visible, hover, controles nativos por teclado y respeto a reducción de movimiento.
- Colores propios para claro y oscuro. Reutiliza sc-shell, botones compartidos y variables globales de tipografía y espaciado. No se altera Supply Chain.

## Archivos

Modificados: `pages/area-compras.html`, `pages/layout.html` (solo carga de CSS), `index.html` (generado con npm run build).

Añadidos: `assets/css/compras.css`, `scripts/preview-compras.cjs`, `tests/compras.cjs`, `tests/fixtures/compras-before.html`, este informe y `docs/compras-previews/{dark-1440.png,light-1440.png,dark-390.png,light-390.png,report.json}`.

## Verificación

Build correcto. Prueba específica `node tests/compras.cjs` con Playwright disponible mediante NODE_PATH: comparación de contenido con el HTML anterior, seis programas, cuatro normas y cuatro perfiles, cambio de tema, 320/390/768/1024/1440/1920 px en claro y oscuro sin desbordamiento, teclado en todos los desplegables, ancla de programas, cinco rutas públicas bloqueadas y Supply Chain accesible. Sin errores JavaScript. Capturas de escritorio y móvil revisadas visualmente.

La prueba histórica `tests/calculator.cjs` no pudo ejecutarse: falta `../backups/original-20260926/Logistikos_web/index.html`. No se modificó la calculadora. No se ejecutó la suite histórica completa por esa dependencia ausente.

Siguiente paso: revisión del usuario. No habilitar Compras ni iniciar Transporte hasta recibir su aprobación.
