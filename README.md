TareasPlus - orden de listas sincronizado

El orden del menu se guarda ahora en Firestore en:
userPreferences/{uid}.projectOrder

Así el mismo usuario conserva el orden al entrar desde iPhone, Android, Mac u otro navegador.

IMPORTANTE: antes de probar, anade a tus reglas de Firestore el bloque incluido en firestore-rules-snippet.txt dentro de match /databases/{database}/documents { ... } y publica las reglas.

Después sustituye index.html en GitHub.
