# TareasPlus responsive + avisos automáticos OneSignal

## Qué cambia
- Vista móvil rediseñada: las tareas pasan de tabla horizontal a tarjetas.
- Formularios y botones adaptados a móvil.
- Cuando un usuario crea una tarea asignada a OTRA persona, se solicita al Worker que envíe un push OneSignal al External ID (UID Firebase) de esa persona.
- No se envía push al creador si se asigna la tarea a sí mismo.

## 1. GitHub
Sube a la raíz:
- `index.html`
- `OneSignalSDKWorker.js`

## 2. Cloudflare Worker
Necesitamos este pequeño Worker porque la REST API Key de OneSignal NO debe estar en el HTML público.

En Cloudflare Workers crea un Worker y pega `notification-worker.js`.
En Settings → Variables and Secrets añade:
- Nombre: `ONESIGNAL_REST_API_KEY`
- Valor: tu REST API Key de OneSignal
- Tipo: Secret

No envíes esa clave por chat ni la subas a GitHub.

Publica el Worker y copia su URL, por ejemplo:
`https://tareasplus-notify.xxxxx.workers.dev`

## 3. Conectar TareasPlus
En `index.html` busca:
`const NOTIFICATION_WORKER_URL="";`

y pon:
`const NOTIFICATION_WORKER_URL="https://TU-WORKER.workers.dev";`

Vuelve a subir `index.html` a GitHub.

## 4. Prueba
- Usuario A y Usuario B deben activar notificaciones.
- A crea una tarea y marca a B como responsable.
- B recibe “Nueva tarea asignada”.
- Al tocarla se abre TareasPlus.

El Worker no acepta destinatarios arbitrarios desde el navegador: lee la tarea de Firestore y toma de allí los UID asignados.
