# Logistikos Form API

Backend minimo para enviar por correo los formularios de Diagnostico, Webinar y Talento Internacional.

## Rutas

- `POST /api/diagnostico`
- `POST /api/webinar`
- `POST /api/talento`
- `GET /health`

## Variables en Render

Copia los nombres de `.env.example` y asigna valores reales en **Environment**. No subas la API key al repositorio.

- `RESEND_API_KEY`: clave secreta creada en Resend.
- `FORM_TO_EMAIL`: buzon que recibira las solicitudes.
- `FORM_FROM_EMAIL`: remitente del dominio verificado, por ejemplo `Logistikos Web <formularios@logistikos.es>`.
- `ALLOWED_ORIGINS`: origenes permitidos separados por coma.

## Render

Crea un Web Service apuntando a la carpeta `form-api`.

- Runtime: Node
- Build command: vacio / no necesario
- Start command: `npm start`
- Health check path: `/health`

Cuando Render entregue una URL, por ejemplo `https://logistikos-form-api.onrender.com`, colócala en `assets/js/forms-config.js` y ejecuta `npm run build` desde la raiz del proyecto.
