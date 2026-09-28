# Primera tanda de ajustes del cliente

- Logos: retirados los bloques de empresas de Home y Nosotros, sin testimonios inventados. Se conserva el bloque textual de la red de formadores y su ancla en Nosotros.
- Antigüedad: eliminada la referencia de Home hacia el equipo, el pie de la ficha de Dirección, su biografía antigua y la métrica de 20+ años de Nosotros. Sin sustituirla por una antigüedad nueva.
- Cifras: 130+ formaciones acumuladas, 1.160 empresas con las que hemos trabajado, 20.000+ horas acumuladas y 4 países con equipos formados, bajo «En nuestra trayectoria». En Home se añade «[X] formaciones al mes · Pendiente de confirmación», separado de las cifras confirmadas.
- Garantía: «Condiciones de la garantía» junto a la garantía principal, cifra de 60 días, método y FAQ de Home; principio de resultados de Nosotros; paso 06 y refuerzo gratuito incluido en Empresas. Desplegables accesibles informan de que el texto definitivo está pendiente. No se crean condiciones legales.
- Campus: estado Próximamente y acceso aún no disponible. Sin formulario, sesión activa, progreso ficticio ni credenciales en pantalla. La maqueta permanece en un template inactivo para reutilizarla. Se corrigen las referencias al campus operativo en Empresas y FAQ.
- Executive Programs: los dos programas permanecen en un template inactivo en Cursos universitarios, sin mostrarse. Se retira la mención de las soluciones de Home. Sin eliminación definitiva.
- Dirección: fotografía proporcionada por el usuario, copiada sin generar ni modificar la imagen; máximo 200 px de ancho. Nombre, tarjeta y biografía ampliada con los textos facilitados. Sin iniciales JF.
- Comercio Internacional: nombre de interfaz actualizado en cards, listados, footer, etiquetas de navegación y título de su fuente; conserva su ruta y bloqueo.
- Etiquetas: Más demandado pasa a Prioridad 2026 en el catálogo compartido y en las fuentes de áreas, incluidas las pendientes, sin rediseñarlas ni habilitarlas.
- El texto factual existente del asistente se sincroniza exclusivamente respecto a cifras acumuladas, Campus y Executive Programs. No se añade funcionalidad de IA ni se modifica su funcionamiento.

## Verificaciones

Build desde fuentes correcto. Revisión global: 168 combinaciones de rutas, tamaños y temas con navegación, footer y bloqueos correctos. Prueba de esta tanda: 40 combinaciones en Home, Nosotros, Campus, Cursos universitarios y Empresas; garantías desplegables, fotografía, ausencia de logos y acceso ficticio; sin overflow ni errores JavaScript. Comparación del catálogo completo y los 18 programas de las tres áreas: intactos salvo la etiqueta autorizada. Revisión visual de Nosotros móvil claro y Campus escritorio claro. Capturas de ambos temas disponibles en client-batch-previews/.

Las tres áreas aprobadas siguen activas y las tres pendientes bloqueadas. La simplificación anterior se conserva. No se trabaja en Talento Internacional, Prescriptores, backend ni nuevas funciones.

Los documentos y fixtures históricos de revisión conservan las versiones previas como evidencia; no forman parte del contenido público.

## Archivos cambiados en esta tanda

- `pages/a-medida.html`
- `pages/area-comercio-internacional.html`
- `pages/area-compras.html`
- `pages/area-ia-datos.html`
- `pages/area-liderazgo.html`
- `pages/area-supply-chain.html`
- `pages/area-transporte.html`
- `pages/campus.html`
- `pages/home.html`
- `pages/layout.html`
- `pages/programas.html`
- `pages/quienes-somos.html`
- `pages/universitarios.html`
- `pages/partials/home-areas.html`
- `pages/partials/home-cases-faq.html`
- `pages/partials/home-solutions.html`
- `assets/js/courses.js`
- `assets/js/main.js`
- `assets/js/assistant.js`
- `assets/css/client-adjustments.css`
- `assets/images/javier-fernandez-diez-de-los-rios.jpeg`
- `index.html (generado)`
- `tests/client-batch.cjs`
- `tests/fixtures/client-batch-before.json`
- `docs/client-batch-previews/`
