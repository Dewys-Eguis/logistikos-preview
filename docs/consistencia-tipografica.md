# Consistencia tipográfica: Home, Formación y Empresas

La referencia es el Home: Archivo, peso 500 y una escala fluida compartida sin saltos de tamaño en los breakpoints. Los cambios de presentación están limitados a cuatro archivos CSS; no se modificaron HTML, textos, JavaScript, imágenes, colores, header ni WhatsApp.

## Variables en assets/css/variables.css

| Variable | Valor |
| --- | --- |
| `--type-hero` | `clamp(44px, calc(32px + 3.1vw), 76px)` |
| `--type-section` | `clamp(34px, 4vw, 60px)` |
| `--type-subtitle` | `clamp(24px, calc(22px + .55vw), 30px)` |
| `--type-lead` | `clamp(16px, calc(15px + .15vw), 18px)` |
| `--type-body` / `--type-secondary` / `--type-small` | 16 / 14 / 12 px |
| `--type-eyebrow` / `--type-button` | 10 / 14 px |
| `--leading-hero` / `--leading-section` / `--leading-subtitle` / `--leading-body` | 1.06 / 1.07 / 1.2 / 1.65 |
| `--tracking-hero` / `--tracking-section` / `--tracking-subtitle` / `--tracking-eyebrow` | -.055em / -.045em / -.025em / .13em |
| `--weight-heading` | 500 |
| `--measure-hero` / `--measure-lead` | 880 / 520 px |
| `--space-eyebrow-title` / `--space-title-lead` / `--space-lead-actions` | 28 px |
| `--space-actions` | 24 px |

Los anchos son límites máximos: cada columna conserva el espacio que permite su composición original. Los H1 y H2 usan `text-wrap:balance` respetando los saltos explícitos del HTML. Los botones del hero comparten 14 px, altura mínima de 54 px y padding de 16 × 24 px.

## Tamaños finales en las tres páginas

| Ancho viewport | H1 | H2 | H3 | Entradilla hero |
| --- | --- | --- | --- | --- |
| 1920 px | 76 px | 60 px | 30 px | 17.88 px |
| 1440 px | 76 px | 57.6 px | 29.92 px | 17.16 px |
| 1024 px | 63.744 px | 40.96 px | 27.632 px | 16.536 px |
| 768 px | 55.808 px | 34 px | 26.224 px | 16.152 px |
| 390 px | 44.09 px | 34 px | 24.145 px | 16 px |

## Archivos

- Modificados: `assets/css/variables.css`, `assets/css/home.css`, `assets/css/formacion.css`, `assets/css/empresas.css`.
- Añadidos: `tests/typography.cjs`, este informe y las capturas / mediciones en `docs/typography-previews/`.
- No es necesario regenerar `index.html`: ya carga los cuatro CSS externos.

Las reglas finales de cada página consumen las variables comunes. Se mantiene `!important` en tamaños H1/H2 para superar las reglas responsive heredadas; no se modifica el responsive global porque afectaría a otras páginas.

## Diferencias conservadas intencionalmente

- Estructura de columnas, imágenes, animaciones, alturas y padding exterior de los heroes; por ello no tienen necesariamente la misma altura total.
- Breadcrumb y bloque lateral de Formación, imagen de Empresas y saltos de línea explícitos del Home y Empresas.
- Métricas numéricas, códigos, badges, etiquetas de formularios y títulos pequeños del footer conservan su jerarquía funcional; no se convierten en H2/H3 editoriales.
- Colores y formas de los botones, y todos los estilos / comportamientos del header, WhatsApp y modo claro/oscuro.

## Verificación

Prueba con Microsoft Edge mediante Playwright, Archivo cargada, en las 15 combinaciones de página y ancho. Se revisaron capturas y se midieron H1/H2, ancho del documento y desbordamientos de títulos/párrafos. Sin errores JavaScript ni desbordamientos detectados. Se comprobó además que el cambio de tema conserva el tamaño del H1 y el ancho del documento.

Comando: `node tests/typography.cjs` (requiere Playwright instalado o accesible mediante `NODE_PATH`). Resultados en `docs/typography-previews/report.json`.

Limitación independiente: `npm test` no pudo iniciar la suite original porque falta `../backups/original-20260926/Logistikos_web/index.html`, requerido por `tests/calculator.cjs`. No se modificaron esos tests ni se inventó el respaldo.
