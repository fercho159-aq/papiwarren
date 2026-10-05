/**
 * Papier Waren — envío de formularios (Vercel Function).
 * Mismos destinatarios que tenían los formularios de Contact Form 7.
 *
 * Variables de entorno (Vercel → Settings → Environment Variables):
 *   SMTP_HOST   p. ej. smtp.hostinger.com
 *   SMTP_PORT   465
 *   SMTP_USER   contacto@papierwaren.com.mx
 *   SMTP_PASS   contraseña del buzón
 *   MAIL_FROM   (opcional) remitente; por defecto SMTP_USER
 */
const nodemailer = require('nodemailer');

const FORMULARIOS = {
  distribuidor: { para: 'ventaspapierwaren8@gmail.com', asunto: 'Mensaje de sitio web' },
  contacto: { para: 'papierwarencontacto@gmail.com', asunto: 'papierwaren.com.mx' },
  facturacion: { para: 'ventaspapierwaren8@gmail.com', asunto: 'Facturar por generar' },
};

const TIPOS_ARCHIVO = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'application/pdf': 'pdf',
};
const MAX_ARCHIVO = 4 * 1024 * 1024; // Vercel limita el cuerpo de la petición a 4.5 MB

const OK = 'Gracias por tu mensaje. Ha sido enviado.';
const ERROR = 'Hubo un error al intentar enviar tu mensaje. Por favor inténtalo de nuevo más tarde.';

function responder(ok, mensaje, status = 200) {
  return Response.json({ ok, mensaje }, { status });
}

function campo(datos, nombre) {
  const v = datos.get(nombre);
  return typeof v === 'string' ? v.trim().replace(/[\r\n]+/g, ' ') : '';
}

async function POST(request) {
  let datos;
  try {
    datos = await request.formData();
  } catch {
    return responder(false, 'Solicitud no válida.', 400);
  }

  // Trampa anti-spam: los bots llenan este campo oculto.
  if (campo(datos, 'sitio_web')) return responder(true, OK);

  const tipo = campo(datos, 'formulario');
  const config = FORMULARIOS[tipo];
  if (!config) return responder(false, 'Formulario no válido.', 400);

  const correo = campo(datos, 'correo');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return responder(false, 'La dirección de correo electrónico no es válida.', 400);
  }

  let cuerpo;
  const adjuntos = [];

  if (tipo === 'distribuidor') {
    const nombre = campo(datos, 'nombre');
    const whatsapp = campo(datos, 'whatsapp');
    if (!nombre || !whatsapp) return responder(false, 'Por favor completa todos los campos.', 400);
    cuerpo = `De: ${nombre}\nMail <${correo}>\nWhatsApp ${whatsapp}\n`;
  } else if (tipo === 'contacto') {
    const nombre = campo(datos, 'nombre');
    const mensaje = String(datos.get('mensaje') || '').trim();
    if (!nombre || !mensaje) return responder(false, 'Por favor completa todos los campos.', 400);
    cuerpo = `De: ${nombre}\nMail <${correo}>\nMensaje:\n${mensaje}\n`;
  } else {
    cuerpo = `Mail <${correo}>\nRFC: ${campo(datos, 'rfc').toUpperCase()}\nRazón social: ${campo(datos, 'razon')}\n`;

    const archivo = datos.get('ticket');
    if (archivo && typeof archivo === 'object' && archivo.size > 0) {
      if (archivo.size > MAX_ARCHIVO) return responder(false, 'El archivo es demasiado grande (máximo 4 MB).', 400);
      const ext = TIPOS_ARCHIVO[archivo.type];
      if (!ext) return responder(false, 'Solo se permiten imágenes o PDF.', 400);
      adjuntos.push({
        filename: `nota.${ext}`,
        content: Buffer.from(await archivo.arrayBuffer()),
        contentType: archivo.type,
      });
    }
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.error('Faltan variables de entorno SMTP');
    return responder(false, ERROR, 500);
  }

  const puerto = Number(SMTP_PORT) || 465;
  const transporte = nodemailer.createTransport({
    host: SMTP_HOST,
    port: puerto,
    secure: puerto === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  try {
    await transporte.sendMail({
      from: `"Papier Waren" <${MAIL_FROM || SMTP_USER}>`,
      to: config.para,
      replyTo: correo,
      subject: config.asunto,
      text: `${cuerpo}\n--\nEnviado desde papierwaren.com.mx`,
      attachments: adjuntos,
    });
    return responder(true, OK);
  } catch (err) {
    console.error('Error al enviar correo:', err);
    return responder(false, ERROR, 500);
  }
}

module.exports = { POST };
