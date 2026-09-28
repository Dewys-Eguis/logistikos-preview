# Simplificación de contenidos

Alcance: Home, Formación, Supply Chain, Compras y Transporte. Sin rediseño general ni cambios en las áreas pendientes.

## Cambios por página

- **Home:** método reducido a cuatro explicaciones breves; modalidades y ejemplos, seis programas destacados y noticias pasan a desplegables. Se sustituye la calculadora duplicada por acceso a FUNDAE. Se resume el contexto institucional y se enlazan Empresas, Nosotros y RRHH. Hero, propuesta, perfiles, garantía, áreas, cifras, casos y CTA se conservan.
- **Formación:** introducción más directa y navegación explícita hacia las seis áreas. El detalle sobre adaptación de la formación pasa a un desplegable. Se mantienen los seis departamentos y sus 24 programas.
- **Supply Chain:** introducción y retos más breves; demanda, proceso, normativa, formadores, NDA y ejemplo FUNDAE permanecen accesibles como detalle. Sus seis programas siguen completos.
- **Compras:** introducción más breve; retos cerrados inicialmente; metodología, normativa, formadores, NDA y ejemplo FUNDAE en detalle progresivo. Sus seis programas siguen completos.
- **Transporte:** introducción más breve; proceso y seguimiento, normativa, formadores, NDA y ejemplo FUNDAE en detalle progresivo. Sus seis programas siguen completos.

## Conservación y destinos

Se compararon los textos protegidos contra una captura previa: nombres, duraciones, modalidades, niveles, KPI, perfiles, ejemplos FUNDAE, normativa y procesos específicos. No se eliminaron programas ni se modificaron cifras o condiciones comerciales. Las garantías y el seguimiento a 60 días siguen presentes.

Antes de reducir duplicaciones se revisaron las páginas dedicadas: Empresas (método, formatos y garantía), FUNDAE (calculadora y condiciones), Nosotros (trayectoria), RRHH (recursos) y Campus. Estas páginas no se editaron. Los detalles específicos de cada área permanecen en sus desplegables, incluyendo los ejemplos de 2.600 €, 1.664 € y 2.496 € y sus condiciones originales.

## Lectura inicial en móvil

Medición a 390 px, con los detalles cerrados y movimiento reducido. La reducción de palabras visibles no implica eliminación del contenido desplegable.

| Página | Menos altura total | Menos palabras visibles |
|---|---:|---:|
| Home | 38 % | 58 % |
| Formación | 16 % | 21 % |
| Supply Chain | 20 % | 36 % |
| Compras | 18 % | 32 % |
| Transporte | 17 % | 30 % |

## Verificación

- Build correcto desde pages/, sin editar index.html manualmente.
- content-simplification.cjs: cinco páginas, seis anchuras de 320 a 1920 px, ambos temas, detalles abiertos/cerrados sin overflow, teclado, filtros, enlaces, contenido protegido y ausencia de errores JavaScript.
- global-review.cjs: 168 combinaciones de ruta, anchura y tema; footer, menús y bloqueo público correctos.
- home.cjs, compras.cjs y transporte.cjs: correctos. Las pruebas antiguas de Home se adaptaron a la calculadora dedicada y al contenido desplegable; se retiró una expectativa obsoleta de un botón de pausa que ya no existía en la versión aprobada.
- Catálogo, estilos globales, navegación, temas, animaciones y fuentes de las tres áreas pendientes verificados sin cambios mediante huellas SHA-256. Header, hero y animación principal de Home, footer y WhatsApp comparados con la versión previa.
- Revisión visual de capturas móvil claro y escritorio oscuro. Capturas de las cinco páginas y resultados detallados en simplification-previews/.

Supply Chain, Compras y Transporte siguen activas. Comercio Internacional, Liderazgo e IA y datos siguen bloqueadas.

## Archivos de implementación

pages/home.html; pages/programas.html; pages/area-supply-chain.html; pages/area-compras.html; pages/area-transporte.html; pages/partials/home-solutions.html; pages/layout.html; assets/css/content-summary.css; assets/js/home.js; index.html (generado).

Pruebas: tests/content-simplification.cjs, tests/fixtures/simplification-before.json y adaptación de tests/home.cjs, tests/compras.cjs, tests/transporte.cjs y tests/global-review.cjs. Documentación y capturas en docs/.
