# Firebase Setup Rapido - TrimIt

Esta guia conecta el frontend ya implementado con tu proyecto real de Firebase.

## 1. Crear proyecto en Firebase

1. Ir a Firebase Console.
2. Crear proyecto nuevo (ejemplo: `trimit-app`).
3. Activar Google Analytics si lo necesitas (opcional para MVP).

## 2. Crear app Web

1. En el proyecto, agregar App Web.
2. Copiar el objeto de configuracion (`apiKey`, `authDomain`, etc.).

## 3. Habilitar Authentication

1. Ir a Authentication > Sign-in method.
2. Habilitar `Email/Password`.

## 4. Crear Firestore Database

1. Ir a Firestore Database.
2. Crear base en modo Production.
3. Elegir region cercana (ejemplo: `southamerica-east1`).
4. Publicar reglas con el archivo del repo [firestore.rules](../firestore.rules).

## 5. Configurar variables de entorno

1. Crear archivo `.env.local` en la raiz del proyecto.
2. Copiar valores desde `.env.example`.
3. Pegar credenciales de tu app web Firebase.

Ejemplo:

VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_DATABASE_ID=default

Si creaste Firestore con otro Database ID (distinto de `default`), coloca ese valor en `VITE_FIREBASE_DATABASE_ID`.

## 6. Probar en local

1. Ejecutar `npm run dev`.
2. Ir a `/auth`.
3. Crear cuenta (nombre, correo, contrasena).
4. Iniciar sesion.
5. Presionar `Probar conexion Firestore`.

Resultado esperado:
- Usuario creado en Authentication.
- Documento en `users/{uid}`.
- Documento de prueba en `users/{uid}/debugLogs`.

## 8. Publicar cambios en Hosting

### Opcion A: Manual rapido

Ejecuta este comando cada vez que quieras publicar cambios:

`npm run deploy:hosting`

### Opcion B: Automatico con GitHub Actions

Ya existe workflow en `.github/workflows/firebase-hosting-deploy.yml`.

Para activarlo:
1. Genera token con `firebase login:ci`.
2. En tu repositorio GitHub crea el secreto `FIREBASE_TOKEN`.
3. Haz push a `main`.

Cada push en `main` construye y despliega automaticamente a Hosting.

## 7. Troubleshooting comun

- Error `Firebase: Error (auth/invalid-api-key)`:
  - Revisar `VITE_FIREBASE_API_KEY` en `.env.local`.
- Error de permisos en Firestore:
  - Verificar despliegue de reglas y que el usuario este autenticado.
- Cambios de `.env.local` no aplican:
  - Reiniciar `npm run dev`.
