# Activar formularios de Logistikos

El proyecto ya esta preparado para enviar por correo estos formularios:

- Diagnostico gratuito
- Inscripcion a Webinar
- Talento Internacional

RRHH y Campus no forman parte de este sistema.

## 1. Crear Resend

1. Crear una cuenta en Resend.
2. Agregar el dominio de Logistikos en Domains.
3. Copiar los registros DNS que indique Resend.
4. Agregar esos registros en el proveedor que administra el DNS del dominio (si esta en Wix, se agregan en la zona DNS de Wix).
5. Esperar a que Resend marque el dominio como verificado.
6. Crear una API key y guardarla. No ponerla en GitHub ni en archivos publicos.

## 2. Crear la API en Render

Crear un Web Service usando el mismo repositorio y configurar:

- Root Directory: `form-api`
- Runtime: Node
- Start Command: `npm start`
- Health Check Path: `/health`

Agregar estas variables en Render > Environment:

- `RESEND_API_KEY`: API key secreta de Resend
- `FORM_TO_EMAIL`: correo que recibira los formularios, por ejemplo `formacion@logistikos.es`
- `FORM_FROM_EMAIL`: por ejemplo `Logistikos Web <formularios@logistikos.es>`
- `ALLOWED_ORIGINS`: `https://dewys-eguis.github.io,https://logistikos.es,https://www.logistikos.es`

No hace falta compartir la contrasena del correo con el codigo ni con Render.

## 3. Conectar la web con Render

Cuando Render entregue una URL publica, por ejemplo:

`https://logistikos-form-api.onrender.com`

abrir `assets/js/forms-config.js` y colocarla en:

```js
var API_BASE = "https://logistikos-form-api.onrender.com";
```

Luego ejecutar desde la raiz:

```bash
npm run build
git add -A
git commit -m "Activar formularios Logistikos"
git push origin main
```

## 4. Probar

Probar una solicitud real de cada formulario y confirmar que llega al buzon configurado:

- Diagnostico: `#/diagnostico`
- Webinar: `#/webinar`
- Talento Internacional: `#/talento-internacional`

El remitente se gestiona desde Resend y el `Reply-To` usa el email del usuario cuando el formulario dispone de un email valido.
