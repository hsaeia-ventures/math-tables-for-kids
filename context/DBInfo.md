# 📐 Modelo de Datos — AstroMath (Firebase Firestore)

Documento que describe el esquema de base de datos NoSQL para la aplicación **AstroMath**, diseñado para ser implementado en **Google Cloud Firestore**.

---

## Estructura de Colecciones (NoSQL)

Firestore es una base de datos orientada a documentos. No hay "tablas" ni "registros" (filas), sino **Colecciones** y **Documentos**.

```text
users/                        (Colección Raíz)
│
├── {userId}/                 (Documento: ID del padre/tutor)
│   │                         (Coincide con Auth UID)
│   │
│   ├── profiles/             (Subcolección)
│   │   │
│   │   ├── {profileId}/      (Documento: Perfil de un niño)
│   │   │   │
│   │   │   ├── name: "Lucía"
│   │   │   ├── age: 7
│   │   │   ├── avatar: "🚀"
│   │   │   └── ...
│   │   │
│   │   │   └── table_progress/   (Subcolección: Progreso)
│   │   │       │
│   │   │       ├── 1/            (Documento: Tabla del 1)
│   │   │       │   ├── stars: 3
│   │   │       │   └── ...
│   │   │       │
│   │   │       ├── ...
│   │   │       │
│   │   │       └── 10/           (Documento: Tabla del 10)
```

---

## 📋 Detalle de Documentos

### 1. `users/{userId}/profiles/{profileId}`

Representa el perfil de un estudiante (hijo/alumno).

| Campo | Tipo | Descripción |
|---|---|---|
| `name` | `string` | Nombre del "comandante" (ej: "Mario"). |
| `age` | `number` | Edad (4-14). |
| `avatar` | `string` | Emoji del avatar (ej: "👨‍🚀"). |
| `total_stars` | `number` | Suma total de estrellas (cache para UI rápida). |
| `created_at` | `timestamp` | Fecha de creación. |

### 2. `.../profiles/{profileId}/table_progress/{tableId}`

Almacena el progreso de una tabla específica.
**ID del Documento:** El ID es el número de la tabla (ej: `"1"`, `"2"`, `"10"`). Esto facilita el acceso directo (`doc(db, '...', '5')`).

| Campo | Tipo | Descripción |
|---|---|---|
| `basic_completed` | `boolean` | ¿Completó el modo básico? |
| `advanced_completed` | `boolean` | ¿Completó el modo avanzado? |
| `stars` | `number` | Mejor puntuación en estrellas (0-3). |
| `best_score` | `number` | Récord de respuestas correctas (0-10). |
| `attempts` | `number` | Total de veces jugadas. |
| `last_played_at` | `timestamp` | Fecha de última partida. |

---

## 🔒 Reglas de Seguridad (Security Rules)

Estas reglas reemplazan a las RLS de SQL. Garantizan que un usuario solo pueda leer/escribir datos que le pertenecen (donde `request.auth.uid == userId`).

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función auxiliar para verificar propiedad
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }

    // Regla para la colección de usuarios
    match /users/{userId} {
      // El usuario puede leer/escribir su propio documento raíz (si existiera datos ahí)
      allow read, write: if isOwner(userId);
      
      // Regla recursiva para subcolecciones (profiles y table_progress)
      match /profiles/{profileId} {
        allow read, write: if isOwner(userId);
        
        match /table_progress/{tableId} {
           allow read, write: if isOwner(userId);
        }
      }
    }
  }
}
```

---

## 🔄 Inicialización de Datos

A diferencia de SQL, Firestore no tiene "Triggers" nativos síncronos (existen Cloud Functions, pero son asíncronas).

**Estrategia:** La inicialización de las 10 tablas se hará **desde el Frontend (Angular)** inmediatamente después de crear el perfil.

1. El usuario crea un perfil -> `addDoc(profilesRef, data)`.
2. El servicio espera el ID del nuevo perfil.
3. El servicio ejecuta un `batch` (lote) de escritura para crear los 10 documentos en `table_progress` con valores por defecto.

Esto simplifica la arquitectura al no requerir despliegue de Cloud Functions backend para lógica simple.
