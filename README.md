# TareasPlus

TareasPlus es una aplicación web/PWA colaborativa para gestionar tareas, listas, proyectos y plantillas. Está diseñada para funcionar tanto en ordenador como en dispositivos móviles.

🌐 **Aplicación:** https://gabrielbailly.github.io/tareas/

---

## Funcionalidades

### ✅ Gestión de tareas

- Crear, editar, completar y eliminar tareas.
- Título, descripción, fecha límite y prioridad.
- Asignación a uno o varios usuarios.
- Visualización abreviada del nombre de los responsables.
- Cambio de lista desde la edición de una tarea.
- Checklist/subtareas dentro de cada tarea.
- Subtareas con texto multilínea y autoajuste.
- Reordenación de subtareas.
- Descripción visible directamente en las tarjetas.
- Información compacta de lista, prioridad, responsable y fecha.
- Fecha límite en formato breve.
- Confirmación antes de eliminar cuando corresponde.

### 🚩 Hoy

Las tareas pueden marcarse específicamente para **Hoy**.

- Marcador 🚩 para activar/desactivar el estado.
- Las tareas de Hoy se muestran prioritariamente.
- Contador de tareas para Hoy en el dashboard.
- Posibilidad de seleccionar **Hoy** al crear una tarea.
- Compatible también con los atajos de voz.

### 🔍 Búsqueda

- Buscador global de tareas.
- Permite localizar rápidamente tareas independientemente de la lista en la que se encuentren.

### ↕️ Orden y movimiento de tareas

- Reordenación manual mediante arrastrar y soltar.
- Movimiento de tareas dentro de una lista.
- Movimiento de tareas entre listas.
- Orden manual compatible con vistas filtradas.
- Soporte adaptado para ordenador y dispositivos táctiles.

---

## 📋 Listas y proyectos

- Crear listas.
- Renombrar listas.
- Eliminar listas.
- Asignar un color a cada lista.
- Punto de color visible en:
  - menú lateral;
  - selector de lista;
  - cabecera;
  - tarjetas de tareas.
- Compartir listas con otros usuarios.
- Gestión de miembros y permisos.
- Reordenación de listas mediante arrastrar y soltar.
- Sincronización del orden por usuario.
- Separación visual entre **Listas/Proyectos** y **Plantillas**.

### ⭐ Lista predeterminada

Cada usuario puede elegir su lista predeterminada mediante una estrella ★.

Las nuevas tareas creadas sin especificar lista se añaden automáticamente a esa lista.

La preferencia se guarda individualmente para cada usuario.

---

## 🗓️ Plantillas

TareasPlus permite crear listas especiales de tipo **Plantilla**.

Las plantillas están pensadas para tareas periódicas o para preparar un nuevo curso/año.

Incluyen:

- Organización de tareas por meses.
- Movimiento de tareas entre meses.
- Reordenación mediante arrastrar y soltar.
- Visualización del mes actual en primer lugar.
- Creación de una nueva lista anual a partir de una plantilla.
- Importación de tareas mediante CSV.
- Asociación de tareas importadas a un mes determinado.

Las plantillas aparecen en un apartado independiente del menú lateral.

---

## 💬 Comentarios

Cada tarea dispone de su propio sistema de comentarios.

Características:

- Autor del comentario.
- Fecha y hora.
- Texto del comentario.
- Edición de comentarios propios.
- Eliminación por el autor.
- Permisos adicionales para propietarios de listas.
- Contador de comentarios visible en la tarjeta.
- Sincronización en tiempo real mediante Firestore.

Los comentarios se almacenan en:

```text
tasks/{taskId}/comments/{commentId}
```

---

## 🔔 Notificaciones

TareasPlus utiliza **OneSignal Web Push** para las notificaciones.

Puede avisar, entre otros casos, cuando:

- se asigna una tarea a un usuario;
- se añade un comentario a una tarea.

Las notificaciones pueden activarse o desactivarse desde el menú del usuario.

El sistema funciona mediante un Cloudflare Worker independiente:

```text
https://tareas.gbailly.workers.dev
```

La PWA permite recibir notificaciones en dispositivos compatibles, incluidos iPhone y Android cuando el sistema y navegador admiten Web Push.

---

## 📥 Importación CSV

Las tareas pueden importarse desde archivos CSV.

El sistema incluye:

- Selección del archivo.
- Mapeo de columnas.
- Asociación de campos del CSV con campos de TareasPlus.
- Importación a la lista activa.
- Conservación del nombre de responsables aunque todavía no sean usuarios registrados en TareasPlus.

---

## 🏛️ Integración con Consejo de Dirección

TareasPlus puede importar directamente tareas pendientes desde la aplicación del Consejo de Dirección.

Origen:

```text
https://consejo.gecoas.es
```

La integración:

- recupera tareas pendientes;
- comprueba la identidad del usuario;
- importa las tareas a TareasPlus;
- conserva información sobre su procedencia;
- evita depender de una API pública sin autenticación.

Al finalizar la importación, el diálogo puede cerrarse mediante **Hecho**.

---

## 👥 Usuarios y colaboración

- Inicio de sesión mediante Google.
- Firebase Authentication.
- Listas propias.
- Listas compartidas.
- Gestión de miembros.
- Permisos según usuario y propiedad de la lista.
- Visualización de las listas creadas y compartidas.
- Invitaciones utilizando las funciones de compartir/correo disponibles en el dispositivo.

---

# 🎙️ Atajos de voz

TareasPlus permite crear tareas rápidamente mediante voz.

## iPhone / iPad

Desde la propia aplicación puede accederse a:

**🎙 Instalar atajos de voz**

Actualmente existen tres atajos:

### 🎙 Tarea rápida

Permite dictar el título de una tarea.

La tarea se crea automáticamente en la lista predeterminada del usuario.

### 🚩 Tarea para hoy

Permite dictar el título y crea directamente una tarea marcada para **Hoy**.

### ＋ Nueva tarea

Permite:

1. Dictar el título.
2. Elegir la lista.
3. Indicar si la tarea corresponde a Hoy.
4. Crear la tarea.

Los atajos se distribuyen mediante Apple Shortcuts/iCloud.

---

# 🔐 Vinculación automática de los atajos

Los atajos de voz utilizan un sistema de vinculación individual por usuario.

Esto evita que un atajo compartido cree tareas con la identidad de la persona que lo creó.

## Primera ejecución

La primera vez que un usuario ejecuta un atajo:

1. El atajo solicita un código temporal al Worker.
2. Se abre TareasPlus.
3. La URL contiene un parámetro temporal:

```text
?voiceLink=XXXXXXXXXX
```

4. TareasPlus muestra la ventana:

**🎙 Vincular atajos de voz**

5. El usuario pulsa:

**Vincular con mi cuenta**

6. TareasPlus autoriza el código utilizando la sesión de Google del usuario.
7. El atajo obtiene automáticamente un token personal.
8. El token se guarda localmente en:

```text
TareasPlus-voice-token.txt
```

Las siguientes ejecuciones reutilizan ese token y ya no requieren volver a vincular la cuenta.

### Una vinculación para todos los atajos

Los tres atajos utilizan el mismo token.

Por tanto, una vez vinculada la cuenta con uno de ellos, los demás pueden utilizar la misma vinculación.

---

## Worker de voz

Los atajos utilizan un Cloudflare Worker independiente:

```text
https://tareas-voice.gbailly.workers.dev
```

Este Worker gestiona:

- inicio de la vinculación;
- códigos temporales;
- autorización desde TareasPlus;
- emisión de tokens personales;
- identificación del usuario;
- consulta de sus listas;
- lista predeterminada;
- creación de tareas;
- asignación de la tarea al usuario correcto.

---

## Seguridad del sistema de voz

El sistema no utiliza un UID fijo para todos los usuarios.

Tampoco utiliza una contraseña compartida entre todos los atajos.

Cada token queda asociado al UID del usuario que autorizó la vinculación.

Además:

- los códigos de vinculación son temporales;
- el Worker comprueba la identidad del usuario;
- el Worker comprueba que el usuario pertenece a la lista;
- las plantillas no aparecen como listas disponibles para los atajos;
- los tokens se identifican en Firestore mediante su hash;
- los secretos de Firebase permanecen almacenados en Cloudflare.

De esta forma:

```text
Atajo
   ↓
Token personal
   ↓
Usuario Firebase
   ↓
Sus listas
   ↓
Tarea creada por ese usuario
   ↓
Tarea asignada a ese usuario
```

---

# 🤖 Android

TareasPlus también está preparada como PWA para Android.

El archivo:

```text
manifest.webmanifest
```

incluye accesos rápidos para:

- 🎙 **Tarea rápida**
- 🚩 **Tarea para hoy**
- ＋ **Nueva tarea**

En navegadores y launchers Android compatibles, estos accesos pueden aparecer al mantener pulsado el icono de TareasPlus instalado en la pantalla de inicio.

Android aprovecha la sesión autenticada de la propia PWA y no depende de Apple Shortcuts.

---

# 📱 PWA

TareasPlus puede instalarse como aplicación en dispositivos móviles.

Características:

- Diseño responsive.
- Compatible con iPhone.
- Compatible con Android.
- Compatible con escritorio.
- Icono propio.
- Funcionamiento en pantalla completa como PWA.
- Menú lateral adaptado a móvil.
- El menú se cierra automáticamente después de seleccionar una opción en móvil.
- Botón flotante **+** para crear tareas.
- El botón flotante se oculta cuando hay un modal abierto.
- Accesos rápidos mediante `manifest.webmanifest`.

---

# 🏠 Dashboard

El dashboard permite acceder rápidamente a la información principal.

Incluye:

- tareas pendientes;
- tareas completadas;
- tareas para Hoy;
- acceso directo a las distintas vistas;
- indicación de la lista seleccionada;
- color identificativo de la lista.

---

# 🏗️ Arquitectura

## Frontend

Aplicación web/PWA publicada mediante GitHub Pages.

Repositorio:

```text
gabrielbailly/tareas
```

Aplicación:

```text
https://gabrielbailly.github.io/tareas/
```

---

## Firebase

TareasPlus utiliza Firebase para autenticación y datos.

### Firebase Authentication

Inicio de sesión mediante Google.

### Cloud Firestore

Almacena:

- usuarios;
- listas;
- tareas;
- comentarios;
- preferencias;
- orden de listas;
- lista predeterminada;
- información de vinculación de los atajos.

---

## Colecciones principales de Firestore

Entre las colecciones utilizadas se encuentran:

```text
projects
tasks
userPreferences
voiceLinkRequests
voiceTokens
```

Los comentarios se almacenan como subcolección:

```text
tasks/{taskId}/comments
```

### `projects`

Listas, proyectos y plantillas.

### `tasks`

Tareas de la aplicación.

### `userPreferences`

Preferencias individuales, como:

- orden de listas;
- lista predeterminada.

### `voiceLinkRequests`

Solicitudes temporales para vincular un atajo con una cuenta.

### `voiceTokens`

Identificación segura de los tokens personales utilizados por los atajos.

---

# ☁️ Cloudflare Workers

TareasPlus utiliza dos Workers diferentes.

## Worker de notificaciones

```text
https://tareas.gbailly.workers.dev
```

Gestiona las notificaciones push mediante OneSignal.

Entre otras:

- tarea asignada;
- nuevo comentario.

## Worker de voz

```text
https://tareas-voice.gbailly.workers.dev
```

Gestiona la integración de Siri/Atajos con TareasPlus.

**No deben mezclarse ambos Workers.**

---

# 🔒 Secretos

Los secretos utilizados por los Workers deben almacenarse como **Secrets** de Cloudflare y nunca publicarse en GitHub.

El Worker de voz utiliza las credenciales necesarias para acceder a Firebase desde servidor.

No deben incluirse claves privadas ni tokens personales en este repositorio.

---

# 🚀 Despliegue

## Frontend

Para una actualización normal:

1. Actualizar `index.html`.
2. Actualizar `manifest.webmanifest` si existen cambios relacionados con la PWA.
3. Subir los archivos a la rama `main`.
4. Esperar a que GitHub Pages publique los cambios.

En algunos dispositivos puede ser necesario cerrar y volver a abrir la PWA para recibir los cambios.

Los cambios importantes del manifiesto, iconos o determinadas configuraciones de notificaciones pueden requerir reinstalar la PWA.

---

## Workers

Los Workers se despliegan independientemente desde Cloudflare.

### Notificaciones

Worker:

```text
tareas
```

### Voz

Worker:

```text
tareas-voice
```

Después de modificar cualquiera de ellos es necesario realizar **Deploy**.

---

# 📌 Estado actual

TareasPlus dispone actualmente de:

- gestión colaborativa de tareas;
- listas y proyectos compartidos;
- responsables;
- fechas y prioridades;
- checklist y subtareas;
- comentarios;
- notificaciones push;
- búsqueda global;
- vista Hoy;
- lista predeterminada;
- orden manual;
- movimiento de tareas entre listas;
- colores por lista;
- plantillas anuales;
- importación CSV;
- integración con Consejo de Dirección;
- PWA para iPhone y Android;
- atajos de voz para iPhone;
- vinculación automática de los atajos por usuario;
- accesos rápidos PWA para Android.

El objetivo de TareasPlus es mantener una gestión de tareas sencilla y rápida, pero suficientemente flexible para el trabajo colaborativo y el uso cotidiano desde ordenador o móvil.
