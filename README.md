# Papier Waren

Sitio de papierwaren.com.mx hecho en HTML, CSS y JS (reemplaza al WordPress anterior).

- `index.html`, `nosotros.html`, `contacto.html`: páginas
- `assets/`: estilos, scripts, imágenes y video
- `api/enviar.js`: función de Vercel que envía los formularios por correo (SMTP)

## Variables de entorno en Vercel

| Variable    | Ejemplo                       |
|-------------|-------------------------------|
| `SMTP_HOST` | `smtp.hostinger.com`          |
| `SMTP_PORT` | `465`                         |
| `SMTP_USER` | `contacto@papierwaren.com.mx` |
| `SMTP_PASS` | contraseña del buzón          |
| `MAIL_FROM` | opcional, por defecto `SMTP_USER` |

Destinatarios:
- Cotizar y Facturación → ventaspapierwaren8@gmail.com
- Contacto → papierwarencontacto@gmail.com

## Ver en local

```bash
python -m http.server 8765
```

(Los formularios solo funcionan desplegados en Vercel o con `vercel dev`.)
