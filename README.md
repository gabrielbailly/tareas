TareasPlus - orden de listas sincronizado

El orden del menu se guarda ahora en Firestore en:
userPreferences/{uid}.projectOrder

Así el mismo usuario conserva el orden al entrar desde iPhone, Android, Mac u otro navegador.

IMPORTANTE: antes de probar, anade a tus reglas de Firestore el bloque incluido en firestore-rules-snippet.txt dentro de match /databases/{database}/documents { ... } y publica las reglas.

Después sustituye index.html en GitHub.

## Gestion de miembros
En Editar lista, el propietario puede ver los miembros y eliminar cualquier miembro salvo al propietario. La eliminacion actualiza memberIds y members en Firestore, por lo que el acceso desaparece inmediatamente segun las reglas existentes de membresia.
