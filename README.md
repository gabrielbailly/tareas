# TareasPlus — invitaciones mediante Compartir

Esta versión elimina Gmail, SMTP, Gmail API y GitHub Actions.

Al invitar:
1. La invitación queda registrada en Firestore.
2. Se abre el menú nativo Compartir del dispositivo.
3. Puedes enviarla por WhatsApp, Mail, Mensajes, etc.
4. Si el navegador no soporta Compartir, el texto se copia al portapapeles.
5. El invitado entra con el correo indicado y la lista se incorpora automáticamente.

También permite a todos los miembros de una lista editar, completar y eliminar sus tareas.

Instalación:
- Sustituye index.html en GitHub.
- Publica firestore.rules en Firebase.
- No necesitas package.json, scripts, GitHub Actions ni secrets de Gmail.
