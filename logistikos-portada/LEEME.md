# Logistikos · Portada de impacto «Corredor logístico»

## 1. Verla ya (sin instalar nada)
Descomprima la carpeta y haga doble clic en **`index.html`**: se abre en el navegador con todos los efectos. Cambie el ancho de la ventana para ver la versión de tablet y la de móvil.

## 2. Contenido de la carpeta
| Archivo | Para qué |
|---|---|
| `index.html` | Vista previa. Entre `COPIAR DESDE AQUÍ` y `COPIAR HASTA AQUÍ` está el bloque de la portada. |
| `logistikos-hero.css` | Estilos (todo dentro de `.lgk-hero`, no toca el resto del sitio). |
| `logistikos-hero.js` | Panel de letras que giran, hora de España y raíl de especialidades. Sin librerías. |
| `img/` | Render 3D (escritorio WebP/JPG y recorte móvil). |
| `react/` | La misma portada como componente React (`LogistikosHero.jsx`) con sus estilos, script e imágenes. |

## 3. Montarla en el proyecto

### Opción A · Proyecto React / Vite (lo más probable en su sitio)
1. Copie la carpeta `react/` a `src/components/logistikos-portada/`.
2. En la página de inicio, reemplace el bloque de portada actual por:
   ```jsx
   import LogistikosHero from './components/logistikos-portada/LogistikosHero';
   // …
   <LogistikosHero />
   ```
3. Añada las fuentes en `index.html` (dentro de `<head>`):
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet">
   ```
4. Ejecute `npm run dev` y abra el inicio.
5. Si su cabecera actual ya está fuera del hero, elimine el `<header className="lgk-header">` del componente para no duplicarla.

En Next.js (App Router), añada `'use client';` en la primera línea del componente.

### Opción B · Sitio en HTML
1. Copie `logistikos-hero.css`, `logistikos-hero.js` y la carpeta `img/` junto a su `index.html`.
2. En `<head>`: las fuentes (paso 3 de arriba) y `<link rel="stylesheet" href="logistikos-hero.css">`.
3. Pegue el bloque `<section class="lgk-hero">…</section>` donde va la portada.
4. Antes de `</body>`: `<script src="logistikos-hero.js" defer></script>`.

## 4. Antes de publicar
- **Logo:** sustituir el texto `logistikos` por el archivo oficial (`<img src="…" alt="Logistikos">` dentro de `.lgk-logo`).
- **Enlaces:** los botones y el menú tienen `href="#"`. Pongan las rutas reales (Formación, In company, Campus, «Cuéntanos tu reto», «Agendar reunión»…) y conecten los submenús que ya tiene el sitio.
- **WhatsApp:** usa `https://wa.me/34696348047`. Confirmar el número.
- **Botón de menú (☰):** en tablet y móvil aparece el botón. Conéctenlo al menú móvil que ya tiene el sitio.
- **Cinta naranja:** en escritorio la quitaron en el diseño, así que aquí solo aparece en móvil. Si la quieren también en escritorio, borren `display:none` de `.lgk-ticker` en el CSS.

## 5. Con Claude Code (opcional)
Copie esta carpeta en la raíz del proyecto, abra una terminal allí, ejecute `claude` y pegue:

```
En la carpeta logistikos-portada hay una portada nueva (index.html para verla, react/LogistikosHero.jsx como componente, CSS, JS e imágenes). Reemplaza SOLO la portada actual de la página de inicio por este componente, sin cambiar los textos ni el resto del sitio. Revisa primero cómo está hecho el proyecto y dime tu plan. Conecta los enlaces del menú y los botones a las rutas reales del sitio, usa el menú móvil existente para el botón ☰, carga las fuentes y comprueba el resultado a 1440 px, 1024 px y 390 px. Respeta prefers-reduced-motion.
```

## 6. Ajustes rápidos
- Colores: variables al inicio de `.lgk-hero` (`--orange`, `--navy`…).
- Punto de fuga (estelas y retícula): `--vp-x` y `--vp-y`.
- Áreas del panel de letras: lista `CATS` al inicio de `logistikos-hero.js`.
- Velocidad: el panel cambia cada 3 s; el raíl, cada 2 s (función `tick`).
