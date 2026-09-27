# FUNDAE · calculadora como elemento principal

## Cambios

La página usa la escala tipográfica y los colores existentes, con oscuro por defecto y una interpretación clara de fondos, campos, resultados y contrastes. La calculadora aparece inmediatamente después del hero breve. Inputs y resultados se muestran en dos columnas en desktop y a 1024 px, y se apilan a 768 y 390 px.

Se han mantenido todos los controles, valores iniciales, textos y resultados dinámicos de la calculadora. El archivo `assets/js/calculator.js` no se ha modificado: su SHA-256 coincide con el registrado antes del rediseño. No se han corregido ni reinterpretado las reglas de negocio.

Estructura:

1. Hero con el título e introducción originales y la nota de Online Live.
2. Calculadora completa: empresa, formación, modalidades, niveles, resultados y comparación.
3. Calendario de formación bonificada.
4. Información para la empresa y checklist documental descargable.
5. Ejemplo de jefe de almacén, tomado de Supply Chain.
6. Estimación orientativa y limitaciones documentadas.
7. CTA para validar el crédito real, seguido del footer consolidado.

## Procedencia y cambios de texto

| Contenido | Fuente |
| --- | --- |
| Hero, campos, resultados, nota de Online Live, fórmula y módulos, CTA «Validar con mi crédito real en 24 h» | `pages/fundae.html` anterior |
| «SIMULADOR FUNDAE» y «Estimación orientativa. El crédito real se valida con la cuenta FUNDAE de la empresa.» | `pages/home.html` |
| Calendario de cuatro pasos, fechas, asistencia y explicaciones | `pages/rrhh.html` |
| Checklist documental, descripción y descarga KIT-04 | `pages/rrhh.html` |
| «Un ejemplo con números», jefe de almacén, 10 participantes × 20 h × 13 €/h, hasta 2.600 € y su condición de crédito disponible | `pages/area-supply-chain.html` |
| Aproximación de cotización y límites de lo que valida la calculadora | `docs/AUDITORIA.md`, apartado de calculadora |

Cambios editoriales indicados:

- El título original de FUNDAE pasa de H2 a H1 sin cambiar su frase.
- Se añade el encabezado organizativo «Qué información necesita la empresa.» y se agrupan los rótulos existentes como «TU EMPRESA · LA FORMACIÓN», «Tu empresa» y «La formación».
- Se reutilizan frases ya existentes como títulos y enlaces; algunos rótulos cambian de mayúsculas/minúsculas para adaptarse a su jerarquía.
- La limitación de la auditoría se adapta para la página: «El salario bruto medio se usa como aproximación de la base de cotización. La calculadora no valida costes reales, crédito oficial ni todos los condicionantes de bonificación.»
- El ejemplo es fijo y está identificado como ejemplo; no se presenta como el resultado de los campos de la calculadora.

No se han añadido cifras, condiciones normativas ni promesas comerciales. La referencia a «24 h» ya estaba en la página anterior. Esta tarea no actualiza ni certifica las reglas normativas del proyecto.

## Sistema visual y responsive

- Todos los tamaños tipográficos consumen variables globales; no se añaden variables ni tamaños nuevos.
- H1: 76 px en 1920/1440, 63,744 px en 1024, 55,808 px en 768 y 44,09 px en 390.
- H2 editorial: `--type-section`; H3: `--type-subtitle`. Los rótulos técnicos del simulador y de la comparación usan la escala pequeña existente.
- Inputs a `--type-body` (16 px), controles de al menos 48 px y etiquetas explícitas.
- Botones de modalidad y nivel exponen `aria-pressed`, sin alterar sus handlers.
- Grids con `minmax(0,1fr)`, campos con `min-width:0` y textos monetarios largos que pueden partir línea.
- La ruta declara `overflow-x:visible` para no heredar el recorte horizontal del body original. No se ocultan desbordamientos.
- Header y WhatsApp permanecen intactos. El footer usa el tratamiento ya consolidado en Nosotros y Empresas; se comprobó su equivalencia de estilos en ambos temas.

## Archivos

Modificados:

- `pages/fundae.html`: estructura, accesibilidad y contenido reorganizado.
- `pages/layout.html`: carga de `assets/css/fundae.css`.
- `assets/js/main.js`: clase de ruta `is-fundae` y estado accesible de los botones, sin cambios de cálculo.
- `index.html`: regenerado con el build existente.

Añadidos:

- `assets/css/fundae.css`: presentación y responsive aislados.
- `tests/fundae-design.cjs`: regresión funcional y revisión responsive.
- `tests/fixtures/fundae-before.json`: contenido original, hash y resultados de 86 escenarios capturados antes de editar.
- Este informe y `docs/fundae-previews/` con capturas e informe JSON.

## Pruebas

`npm run build`: correcto.

`node tests/fundae-design.cjs`: correcto con Microsoft Edge / Playwright.

- SHA-256 del motor de cálculo sin cambios.
- 86 escenarios comparados con los resultados anteriores, incluidos los límites de tramo, las cuatro modalidades, ambos niveles, ceros, vacíos y crédito agotado.
- 1920, 1440, 1024, 768 y 390 px, en claro y oscuro: diez combinaciones, sin desbordamiento horizontal y con Archivo cargada.
- 23 escenarios de interacción en el navegador, incluidos valores grandes.
- Todos los cursos conservan su selección de horas y modalidad; editar horas sigue seleccionando «Otra formación».
- El foco de teclado se conserva al recalcular.
- Descarga del PDF KIT-04 comprobada byte a byte.
- Enlaces internos, cambio de tema, persistencia al recargar y navegación entre las cinco páginas comprobados.
- Footer comparado con Nosotros a 1024, 768 y 390 px, en ambos temas.
- Sin errores JavaScript.

La suite histórica dependiente del respaldo ausente no se ha utilizado como evidencia. La prueba nueva captura como referencia la versión actual del proyecto antes de estos cambios.
