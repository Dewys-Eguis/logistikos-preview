# Nosotros: rediseño editorial

## Ajuste posterior: contacto y cifras

Por petición posterior, los dos bloques de contacto de Nosotros se han igualado visualmente a Empresas / Formación: CTA naranja compacto, resplandor azul, título de contacto con peso 500 y escala compartida, botón azul y márgenes responsive equivalentes. Esta petición sustituye la conservación inicial de los estilos del footer descrita más abajo. Header y WhatsApp flotante siguen sin cambios.

Las tres cifras cuentan durante 1,4 segundos al entrar en pantalla, una vez por visita. Una línea decorativa acompaña la animación y cada bloque responde al hover. Los lectores de pantalla reciben el valor final estable; con movimiento reducido no hay conteo. Se cancelan los frames pendientes al salir de la página.

Se añadió la variable compartida `--type-button-small:13px`, coincidente con los botones existentes de referencia. Se comprobaron los estilos del contacto frente a Empresas en 1440, 768 y 390 px, en ambos temas, además de las diez combinaciones del test de Nosotros. Capturas actualizadas: `updated-cta-desktop.png`, `updated-contact-desktop.png`, `updated-cta-mobile.png` y `updated-metrics.png` en `docs/nosotros-previews/`.

## Contenido y procedencia

Antes de modificar la página se revisaron `pages/quienes-somos.html`, el parcial `pages/partials/partners.html`, los componentes compartidos, el router, el cambio de tema y los assets locales. Se guardó un inventario del contenido original en `tests/fixtures/nosotros-content.json`.

Se conservan todos los textos originales, la biografía y formación de Javier Fernández Díez de los Ríos, la publicación citada, la localización y las tres cifras: 20+ años, 20.000+ horas y 4 países. Los doce logos siguen acompañados de la explicación original: son compañías con las que colaboran los formadores; no se presentan como clientes de Logístikos.

Los únicos textos visibles añadidos son enlaces y el CTA reutilizados del proyecto: «Hablemos» del header, «Nuestros logístikos» del propio contenido, y «Lo diseñamos alrededor de tu operación» / «Hablemos de tu equipo» de Empresas. No se añadieron nombres, clientes, cifras ni afirmaciones de experiencia.

## Estructura final

1. Hero de identidad con introducción, enlace a contacto y a la sección de compañías.
2. Diferencias: los tres principios originales, en filas editoriales.
3. Dirección y trayectoria: biografía, formación y publicaciones.
4. Red de formadores.
5. Experiencia en cifras.
6. Compañías con las que colaboran los formadores.
7. CTA final, seguido del footer compartido original.

Se reutiliza `assets/images/formation-operation.jpg` como imagen decorativa del hero, sin atribuirla a una instalación propia. No existen retratos en los assets revisados: `.about-portrait-slot` está preparado para uno futuro y muestra el monograma JF original, sin generar una identidad ficticia. Los archivos de imagen y el parcial de logos no se modificaron.

## Diseño y tipografía

Se consumen las variables globales existentes: `--type-hero`, `--type-section`, `--type-subtitle`, `--type-lead`, `--type-body`, `--type-secondary`, `--type-small`, `--type-eyebrow`, `--type-button`, junto con `--leading-*`, `--tracking-*`, `--weight-heading`, `--measure-*` y `--space-*`. No se añadieron tamaños tipográficos independientes.

| Ancho | H1 | H2 | H3 |
| --- | --- | --- | --- |
| 1920 px | 76 px | 60 px | 30 px |
| 1440 px | 76 px | 57,6 px | 29,92 px |
| 1024 px | 63,744 px | 40,96 px | 27,632 px |
| 768 px | 55,808 px | 34 px | 26,224 px |
| 390 px | 44,09 px | 34 px | 24,145 px |

El modo oscuro es el predeterminado y el claro usa fondos, bordes, texto y acentos específicos de la página. Se respeta la preferencia guardada mediante el mecanismo existente. Header, footer y WhatsApp mantienen su HTML, estilos y comportamiento.

Las entradas suaves se activan por visibilidad; el contenido es visible si el módulo de animación no se carga. La preferencia de movimiento reducido se atiende tanto al entrar como al cambiarla, y el observer se desconecta al salir de la ruta.

## Archivos

Modificados:

- `pages/quienes-somos.html`: composición editorial y contenido preservado.
- `pages/layout.html`: carga del CSS y JS específicos, sin cambios en componentes compartidos.
- `assets/js/main.js`: montaje y limpieza del módulo de Nosotros.
- `index.html`: regenerado con `npm run build`.

Añadidos:

- `assets/css/nosotros.css`: estilos aislados, temas y responsive.
- `assets/js/nosotros.js`: animaciones por visibilidad.
- `tests/nosotros.cjs`: verificación del contenido, diseño y comportamiento.
- `tests/fixtures/nosotros-content.json`: inventario capturado antes del rediseño.
- Este documento y capturas / informe JSON en `docs/nosotros-previews/`.

## Verificación

`npm run build`: correcto.

`node tests/nosotros.cjs`: correcto en Microsoft Edge / Playwright, con Archivo cargada. Se probaron los cinco anchos en los dos temas (10 combinaciones).

- Todo el texto original, las tres cifras y los doce logos preservados.
- H1/H2/H3 coinciden con las variables compartidas.
- Sin desbordamientos de texto ni imágenes rotas.
- Todas las entradas por scroll terminan visibles.
- Header, footer y WhatsApp conservan sus estilos calculados al activar/desactivar el nuevo CSS.
- Enlaces a la sección de compañías y a contacto funcionan.
- Cambio de tema, persistencia al recargar y movimiento reducido funcionan.
- Navegación Home → Formación → Empresas → Nosotros sin errores JavaScript.

Capturas completas: `dark-{ancho}.png` y `light-{ancho}.png`. Mediciones: `report.json`. Comparativa del hero: `comparison-desktop.png`.

La suite histórica general continúa dependiendo de un respaldo que no está en esta copia del proyecto; la prueba específica de Nosotros no necesita ese respaldo.
