// NexaFlow Studio — alta de newsletter con doble opt-in (Brevo)
// Endpoint serverless (Vercel). Recibe {nombre, email, consent, website(honeypot)}
// y dispara el email de confirmación DOI de Brevo hacia la lista "NexaFlow Insights".
//
// Requiere la variable de entorno BREVO_API_KEY en Vercel (Project → Settings →
// Environment Variables). Sin ella, responde 503 y el formulario muestra un aviso.

const BREVO_LIST_ID = 5;          // Lista "Newsletter NexaFlow Insights"
const BREVO_DOI_TEMPLATE = 10;    // Plantilla "Confirmación Doble Opt-In (API)"
const REDIRECT_URL = "https://www.nexaflowestudio.com/gracias.html";

export default async function handler(req, res) {
  // Mismo origen; solo POST
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ ok: false, error: "not_configured" });
  }

  // Body puede llegar como objeto (Vercel lo parsea) o como string
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  const email = String(body.email || "").trim().toLowerCase();
  const nombre = String(body.nombre || "").trim().slice(0, 80);
  const consent = body.consent === true || body.consent === "true" || body.consent === "on" || body.consent === 1;

  // Honeypot anti-spam: si el campo oculto viene relleno, es un bot → fingimos éxito
  if (body.website) {
    return res.status(200).json({ ok: true });
  }

  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  if (!emailOk) {
    return res.status(400).json({ ok: false, error: "email" });
  }
  if (!consent) {
    return res.status(400).json({ ok: false, error: "consent" });
  }

  try {
    const r = await fetch("https://api.brevo.com/v3/contacts/doubleOptinConfirmation", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        email,
        attributes: nombre ? { NOMBRE: nombre } : {},
        includeListIds: [BREVO_LIST_ID],
        templateId: BREVO_DOI_TEMPLATE,
        redirectionUrl: REDIRECT_URL,
      }),
    });

    // 201/204 = correo de confirmación enviado correctamente
    if (r.status === 201 || r.status === 204) {
      // Aviso interno al propietario por cada registro (no bloquea la respuesta)
      await notifyOwner(apiKey, { email, nombre, source: String(body.source || "web") }).catch(() => {});
      return res.status(200).json({ ok: true });
    }

    // Contacto ya existente / ya suscrito: lo tratamos como éxito suave
    let detail = "";
    try { detail = await r.text(); } catch {}
    if (r.status === 400 && /already|exist|duplicate/i.test(detail)) {
      return res.status(200).json({ ok: true, already: true });
    }
    return res.status(502).json({ ok: false, error: "brevo", status: r.status });
  } catch (e) {
    return res.status(502).json({ ok: false, error: "network" });
  }
}

// Envía un aviso interno a NexaFlow por cada nuevo registro (pendiente de confirmar).
async function notifyOwner(apiKey, { email, nombre, source }) {
  const when = new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" });
  const safe = (v) => String(v || "—").replace(/[<>]/g, "");
  const html =
    '<div style="font-family:Arial,Helvetica,sans-serif;color:#0e0f10;font-size:15px;line-height:1.6">' +
    '<p style="margin:0 0 14px"><b>🟢 Nuevo registro en la newsletter</b> (pendiente de confirmar).</p>' +
    '<table cellpadding="0" cellspacing="0" style="font-size:14px">' +
    '<tr><td style="padding:3px 14px 3px 0;color:#565a5e">Nombre</td><td><b>' + safe(nombre) + '</b></td></tr>' +
    '<tr><td style="padding:3px 14px 3px 0;color:#565a5e">Email</td><td><b>' + safe(email) + '</b></td></tr>' +
    '<tr><td style="padding:3px 14px 3px 0;color:#565a5e">Origen</td><td>' + safe(source) + '</td></tr>' +
    '<tr><td style="padding:3px 14px 3px 0;color:#565a5e">Fecha</td><td>' + safe(when) + '</td></tr>' +
    '</table>' +
    '<p style="margin:14px 0 0;color:#8a8d90;font-size:12.5px">Entrará en la lista solo cuando confirme el doble opt-in. Puedes responder a este correo para contactar directamente.</p>' +
    '</div>';
  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "accept": "application/json", "content-type": "application/json", "api-key": apiKey },
    body: JSON.stringify({
      sender: { name: "NexaFlow · Web", email: "hola@nexaflowestudio.com" },
      to: [{ email: "hola@nexaflowestudio.com", name: "NexaFlow Studio" }],
      replyTo: { email, name: nombre || email },
      subject: "🟢 Nuevo registro newsletter: " + email,
      htmlContent: html,
    }),
  });
}
