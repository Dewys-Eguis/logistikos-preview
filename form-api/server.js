"use strict";

const http = require("node:http");
const { URL } = require("node:url");

const PORT = Number(process.env.PORT || 10000);
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FORM_TO_EMAIL = process.env.FORM_TO_EMAIL || "";
const FORM_FROM_EMAIL = process.env.FORM_FROM_EMAIL || "";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((value) => value.trim().replace(/\/$/, ""))
  .filter(Boolean);

const LIMIT_WINDOW_MS = 15 * 60 * 1000;
const LIMIT_MAX = 12;
const requestBuckets = new Map();

function json(res, status, body, origin) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  };
  if (origin && isAllowedOrigin(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers.Vary = "Origin";
  }
  res.writeHead(status, headers);
  res.end(JSON.stringify(body));
}

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (!ALLOWED_ORIGINS.length) return false;
  const normalized = origin.replace(/\/$/, "");
  return ALLOWED_ORIGINS.includes(normalized);
}

function clientIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwarded || req.socket.remoteAddress || "unknown";
}

function rateLimited(req) {
  const key = clientIp(req);
  const now = Date.now();
  const current = requestBuckets.get(key);
  if (!current || now - current.startedAt > LIMIT_WINDOW_MS) {
    requestBuckets.set(key, { startedAt: now, count: 1 });
    return false;
  }
  current.count += 1;
  return current.count > LIMIT_MAX;
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 100000) {
        reject(new Error("Payload demasiado grande"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(new Error("JSON invalido"));
      }
    });
    req.on("error", reject);
  });
}

function text(value, max = 4000) {
  return String(value == null ? "" : value).trim().slice(0, max);
}

function email(value) {
  const candidate = text(value, 320);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate) ? candidate : "";
}

function escapeHtml(value) {
  return text(value, 12000)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function row(label, value) {
  const clean = text(value, 12000) || "No indicado";
  return `<tr><td style="padding:8px 12px;border-bottom:1px solid #e7ebf0;font-weight:700;vertical-align:top;width:190px">${escapeHtml(label)}</td><td style="padding:8px 12px;border-bottom:1px solid #e7ebf0;white-space:pre-wrap">${escapeHtml(clean)}</td></tr>`;
}

function emailShell(title, subtitle, rows) {
  return `<!doctype html><html><body style="margin:0;background:#f4f6f9;font-family:Arial,sans-serif;color:#101a2b"><div style="max-width:760px;margin:0 auto;padding:32px 16px"><div style="background:#081426;color:#fff;padding:26px 30px;border-radius:18px 18px 0 0"><div style="font-size:12px;letter-spacing:.14em;color:#ff7a1a;font-weight:700">LOGISTIKOS · FORMULARIOS WEB</div><h1 style="font-size:25px;margin:10px 0 6px">${escapeHtml(title)}</h1><p style="margin:0;color:#b9c5d8">${escapeHtml(subtitle)}</p></div><table role="presentation" style="width:100%;border-collapse:collapse;background:#fff;border-radius:0 0 18px 18px;overflow:hidden"><tbody>${rows.join("")}</tbody></table></div></body></html>`;
}

function diagnosticMessage(data) {
  const replyTo = email(data.email);
  const required = ["nombre", "cargo", "empresa", "plantilla", "email", "problema"];
  if (required.some((key) => !text(data[key]))) return { error: "Faltan campos obligatorios." };
  if (!replyTo) return { error: "El correo electronico no es valido." };
  return {
    subject: `[Logistikos] Nuevo diagnostico · ${text(data.empresa, 120)}`,
    replyTo,
    html: emailShell("Nueva solicitud de diagnostico", "Diagnostico gratuito de necesidades formativas", [
      row("Nombre y apellidos", data.nombre),
      row("Cargo", data.cargo),
      row("Empresa", data.empresa),
      row("Plantilla", data.plantilla),
      row("Email", data.email),
      row("Problema / reto", data.problema),
      row("Origen", data.origen || "Diagnostico gratuito web Logistikos"),
    ]),
  };
}

function webinarMessage(data) {
  const replyTo = email(data.email);
  const required = ["webinar", "nombre", "apellido1", "telefono", "empresa", "cargo", "email", "consentimiento"];
  if (required.some((key) => !text(data[key]))) return { error: "Faltan campos obligatorios." };
  if (!replyTo) return { error: "El correo electronico no es valido." };
  return {
    subject: `[Logistikos] Inscripcion webinar · ${text(data.webinar, 140)}`,
    replyTo,
    html: emailShell("Nueva inscripcion a webinar", text(data.webinar, 200), [
      row("Webinar", data.webinar),
      row("Nombre", [data.nombre, data.apellido1, data.apellido2].filter(Boolean).join(" ")),
      row("DNI / documento", data.dni),
      row("Telefono", data.telefono),
      row("Empresa", data.empresa),
      row("Cargo", data.cargo),
      row("Direccion personal", data.direccion),
      row("Poblacion", data.poblacion),
      row("Provincia", data.provincia),
      row("Codigo postal", data.cp),
      row("Email", data.email),
      row("Consentimiento", "Aceptado"),
    ]),
  };
}

function talentMessage(data) {
  const required = ["empresa", "puesto", "personas", "ubicacion", "turnos", "contacto"];
  if (required.some((key) => !text(data[key]))) return { error: "Faltan campos obligatorios." };
  const contactEmail = email(data.contacto);
  return {
    subject: `[Logistikos] Talento Internacional · ${text(data.empresa, 120)}`,
    replyTo: contactEmail || undefined,
    html: emailShell("Nueva solicitud de Talento Internacional", "Necesidad de cobertura de vacantes", [
      row("Empresa", data.empresa),
      row("Puesto", data.puesto),
      row("Numero de personas", data.personas),
      row("Ubicacion", data.ubicacion),
      row("Turnos", data.turnos),
      row("Contacto", data.contacto),
    ]),
  };
}

async function sendEmail(message) {
  if (!RESEND_API_KEY || !FORM_TO_EMAIL || !FORM_FROM_EMAIL) {
    const error = new Error("Servidor sin configurar");
    error.code = "NOT_CONFIGURED";
    throw error;
  }
  const payload = {
    from: FORM_FROM_EMAIL,
    to: [FORM_TO_EMAIL],
    subject: message.subject,
    html: message.html,
  };
  if (message.replyTo) payload.reply_to = message.replyTo;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.message || `Resend HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return result;
}

const handlers = {
  "/api/diagnostico": diagnosticMessage,
  "/api/webinar": webinarMessage,
  "/api/talento": talentMessage,
};

const server = http.createServer(async (req, res) => {
  const origin = String(req.headers.origin || "");
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (req.method === "OPTIONS") {
    if (!isAllowedOrigin(origin)) return json(res, 403, { ok: false, error: "Origen no permitido" }, origin);
    res.writeHead(204, {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    });
    return res.end();
  }

  if (req.method === "GET" && url.pathname === "/health") {
    return json(res, 200, { ok: true, service: "logistikos-form-api" }, origin);
  }

  if (req.method !== "POST" || !handlers[url.pathname]) {
    return json(res, 404, { ok: false, error: "Ruta no encontrada" }, origin);
  }
  if (!isAllowedOrigin(origin)) return json(res, 403, { ok: false, error: "Origen no permitido" }, origin);
  if (rateLimited(req)) return json(res, 429, { ok: false, error: "Demasiados intentos. Intentalo de nuevo mas tarde." }, origin);

  try {
    const data = await readJson(req);
    if (text(data.website)) return json(res, 200, { ok: true }, origin); // honeypot
    const message = handlers[url.pathname](data);
    if (message.error) return json(res, 400, { ok: false, error: message.error }, origin);
    const result = await sendEmail(message);
    return json(res, 200, { ok: true, id: result.id || null }, origin);
  } catch (error) {
    console.error(new Date().toISOString(), url.pathname, error.message);
    const status = error.code === "NOT_CONFIGURED" ? 503 : 500;
    return json(res, status, { ok: false, error: status === 503 ? "Servicio de formularios pendiente de configuracion." : "No se pudo enviar la solicitud." }, origin);
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Logistikos form API listening on port ${PORT}`);
});
