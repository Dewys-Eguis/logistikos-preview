# Logístikos · Arquitectura previa al rediseño

Esta entrega reorganiza el prototipo y conserva su contenido y presentación. La nueva identidad todavía no se ha aplicado. El sitio no está listo para producción: consultar `docs/AUDITORIA.md`.

## Abrir y editar

- Abrir `index.html` con doble clic o servir esta carpeta mediante cualquier servidor estático.
- Editar el contenido en `pages/*.html`, el marco común en `pages/layout.html` y los logos compartidos en `pages/partials/partners.html`.
- Editar los estilos en `assets/css/` y el comportamiento en `assets/js/`.
- Ejecutar `npm run build` después de modificar plantillas o descargables. Requiere Node.js 18 o posterior, sin instalar dependencias de compilación.
- `index.html` y `assets/js/generated/download-data.js` son resultados generados. No editarlos directamente.

Se conserva el enrutamiento `#/...`: las plantillas de `pages` son fragmentos fuente, no páginas independientes listas para navegar. El compilador las incorpora en el HTML para mantener el funcionamiento por doble clic sin `fetch`, servidor o framework. Los enlaces externos necesitan conexión; las fuentes de Google cuentan con alternativas locales.

## Responsabilidades

| Archivo | Responsabilidad |
| --- | --- |
| `variables.css` | Siete colores nuevos y variables de compatibilidad con el aspecto original. |
| `base.css` | Documento, tipografía base, enlaces y foco. |
| `components.css` | Cabecera, pie, componentes compartidos, formularios y estilos originales deduplicados. |
| `home.css` | Estilos exclusivos del Home actual, preparados para sustituirse en la siguiente fase. |
| `animations.css` | Desplazamiento suave y preferencia de movimiento reducido. |
| `responsive.css` | Breakpoints originales con clases de estructura explícitas. |
| `main.js` | Estado compartido, rutas, ciclo de renderizado y navegación. |
| `renderer.js` | Interpolación, bucles, condiciones y eventos declarativos. |
| `courses.js` | Departamentos, cursos, hoja de ruta y contenido del Radar antiguo. |
| `calculator.js` | Cálculos y controles FUNDAE; conserva las estimaciones originales. |
| `forms.js` | Kit, suscripción, otro perfil y simulación de Campus. |
| `animations.js` | Comportamiento de desplazamiento respetando movimiento reducido. |
| `assistant.js` | Asistente original y su dependencia del entorno Claude. |
| `downloads.js` | Descargas HTTP y compatibilidad local/Claude. |

Las clases `legacy-*` son una capa temporal: permiten retirar 2.032 atributos `style` sin diseñar otra vez las páginas. Las reglas están deduplicadas. Las clases `layout-*` conservan el responsive sin buscar texto dentro de estilos. La doble especificidad de las clases de compatibilidad preserva la prioridad que antes tenían los estilos inline. Las barras usan exclusivamente una variable CSS numérica para su ancho dinámico.

Los atributos `data-on-click` y `data-on-change` conectan callbacks del renderizador; no ejecutan JavaScript contenido en el HTML. El logo sigue siendo el texto «logístikos» con Unbounded, como en el original. Los pequeños SVG permanecen inline; `assets/icons` queda reservado para los próximos recursos.

## Compilar y verificar

```sh
npm run build
npm install
npm test
```

Las pruebas requieren Playwright y Microsoft Edge. Se puede elegir otro canal instalado con `BROWSER_CHANNEL`. Para las comparaciones se requiere conservar `../backups/original-20260926/Logistikos_web/index.html`. En esta entrega se ejecutaron con Playwright del entorno de trabajo, sin instalar dependencias en el sitio. No se necesita Playwright para abrir ni publicar la web.

El compilador incluye un paquete de descargas generado que solo se carga al solicitar una descarga local o desde Claude. En HTTP se usan los archivos binarios directamente. Es una duplicación de salida deliberada para compatibilidad; los documentos de `kit-rrhh` y su `manifest.json` son la fuente de ese paquete. Si se añade una acción de descarga, actualizar también la lista permitida de `downloads.js` y la plantilla correspondiente.

## Siguiente fase

El Home nuevo puede desarrollarse desde `pages/home.html`, `home.css` y los tokens de `variables.css`. El contenido y la arquitectura actuales son referencia, no una restricción visual. Revisar primero las decisiones de integración y contenido descritas en la auditoría.

No desplegar `backups`: está fuera de esta carpeta precisamente para mantener la copia original separada del sitio.
