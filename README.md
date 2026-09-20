# TareasPlus: correo con Gmail + GitHub Actions

## 1. GitHub Secrets
Repositorio → Settings → Secrets and variables → Actions → New repository secret.

Crea `GMAIL_APP_PASSWORD` con la contraseña de aplicación de dev@alcaste-lasfuentes.com.

Crea `FIREBASE_SERVICE_ACCOUNT`: Firebase → Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada. Abre el JSON descargado y copia TODO su contenido como valor del secret. No subas ese JSON a GitHub.

## 2. Archivos
Sube index.html, package.json y conserva exactamente las carpetas:
- scripts/send-invitations.mjs
- .github/workflows/send-invitations.yml

Publica firestore.rules en Firebase.

## 3. Probar
GitHub → Actions → Enviar invitaciones TareasPlus → Run workflow.

Después se ejecuta automáticamente cada 5 minutos. GitHub puede retrasar los cron algunos minutos.
