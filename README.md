# TareasPlus — comentarios

Novedades:
- Comentarios dentro de cada tarea.
- Autor, fecha/hora y texto.
- Edición de los comentarios propios.
- Eliminación por el autor; el propietario de la lista puede eliminar cualquier comentario.
- Contador de comentarios visible en la tarjeta.
- Sincronización en tiempo real con Firestore.
- Notificación push a los demás responsables de la tarea cuando se añade un comentario.

## Actualización
1. GitHub Pages: sustituye `index.html`.
2. Firestore: añade las reglas de `firestore-rules-snippet.txt` dentro del bloque de documentos y publica.
3. Cloudflare Worker `tareas`: sustituye el código por `notification-worker.js` y pulsa Deploy.
4. No cambies el secreto `ONESIGNAL_REST_API_KEY`.

Los comentarios se guardan en:
`tasks/{taskId}/comments/{commentId}`.
