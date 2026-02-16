# 📐 Modelo Entidad-Relación — AstroMath (Supabase)

Documento que describe el esquema de base de datos para la aplicación **AstroMath**, diseñado para ser implementado en **Supabase** (PostgreSQL).

---

## Diagrama de Entidades

```
┌──────────────────────────────────┐
│          auth.users              │  ← Tabla gestionada por Supabase Auth
│  (no la creamos nosotros)        │
├──────────────────────────────────┤
│  id         : uuid  [PK]        │
│  email      : text               │
│  created_at : timestamptz        │
└──────────┬───────────────────────┘
           │
           │  1 usuario tiene N perfiles
           │  (ej: papá crea perfil para cada hijo)
           ▼
┌──────────────────────────────────┐
│           profiles               │
├──────────────────────────────────┤
│  id          : uuid  [PK]       │
│  user_id     : uuid  [FK → auth.users.id]  NOT NULL
│  name        : text  NOT NULL    │
│  age         : smallint  NOT NULL│
│  avatar      : text  NOT NULL    │
│  total_stars : integer DEFAULT 0 │
│  created_at  : timestamptz       │
│  updated_at  : timestamptz       │
└──────────┬───────────────────────┘
           │
           │  1 perfil tiene N registros de progreso
           │  (exactamente 10: uno por tabla de multiplicar)
           ▼
┌──────────────────────────────────┐
│        table_progress            │
├──────────────────────────────────┤
│  id                 : uuid [PK]  │
│  profile_id         : uuid [FK → profiles.id]  NOT NULL
│  table_id           : smallint NOT NULL  (1-10)
│  basic_completed    : boolean DEFAULT false
│  advanced_completed : boolean DEFAULT false
│  stars              : smallint DEFAULT 0  (0-3)
│  best_score         : smallint DEFAULT 0  (0-10)
│  attempts           : integer DEFAULT 0
│  last_played_at     : timestamptz
│  created_at         : timestamptz
│                                  │
│  UNIQUE(profile_id, table_id)    │  ← Un perfil solo tiene un registro por tabla
└──────────────────────────────────┘
```

---

## 🔑 Relaciones

| Relación | Tipo | Descripción |
|---|---|---|
| `auth.users` → `profiles` | **1:N** | Un usuario autenticado (padre/profesor) puede crear múltiples perfiles (hijos/alumnos). |
| `profiles` → `table_progress` | **1:N** | Cada perfil tiene exactamente **10 filas** de progreso (una por tabla del 1 al 10). |

---

## 📋 Detalle de Campos

### `profiles`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `uuid` | Identificador único del perfil (generado con `gen_random_uuid()`). |
| `user_id` | `uuid` | Referencia al usuario autenticado que lo creó. Permite filtrar con RLS. |
| `name` | `text` | Nombre del "comandante" (ej: "Lucía"). |
| `age` | `smallint` | Edad del niño/a (4-14). |
| `avatar` | `text` | Emoji del avatar seleccionado (🚀, 👨‍🚀, 👽, 🤖, 🌟). |
| `total_stars` | `integer` | Suma total de estrellas acumuladas (campo calculable, pero se mantiene para consultas rápidas en el dashboard). |
| `created_at` | `timestamptz` | Fecha de creación. |
| `updated_at` | `timestamptz` | Última actualización. |

### `table_progress`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `uuid` | Identificador único. |
| `profile_id` | `uuid` | FK al perfil. Con `ON DELETE CASCADE`. |
| `table_id` | `smallint` | Tabla de multiplicar (1-10). |
| `basic_completed` | `boolean` | ¿Se completó el modo básico? |
| `advanced_completed` | `boolean` | ¿Se completó el modo avanzado? (solo se desbloquea si `basic_completed = true`). |
| `stars` | `smallint` | Mejor puntuación en estrellas (0-3). |
| `best_score` | `smallint` | Mejor número de respuestas correctas (0-10). Útil para estadísticas futuras. |
| `attempts` | `integer` | Número total de intentos en esta tabla. Útil para analytics. |
| `last_played_at` | `timestamptz` | Última vez que se jugó esta tabla. |
| `created_at` | `timestamptz` | Fecha de creación del registro. |

> 💡 Los campos `best_score`, `attempts` y `last_played_at` son **nuevos** respecto al modelo TypeScript actual. No cambian ningún flujo existente, pero aportan datos valiosos para futuras funcionalidades (ej: estadísticas para padres, recomendaciones de repaso).

---

## 🔒 Políticas RLS (Row Level Security)

### `profiles`

```sql
-- SELECT: Un usuario solo puede ver sus propios perfiles
CREATE POLICY "Users can view own profiles"
  ON profiles FOR SELECT
  USING (user_id = auth.uid());

-- INSERT: Un usuario solo puede crear perfiles vinculados a su cuenta
CREATE POLICY "Users can create own profiles"
  ON profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- UPDATE: Un usuario solo puede actualizar sus propios perfiles
CREATE POLICY "Users can update own profiles"
  ON profiles FOR UPDATE
  USING (user_id = auth.uid());

-- DELETE: Un usuario solo puede eliminar sus propios perfiles
CREATE POLICY "Users can delete own profiles"
  ON profiles FOR DELETE
  USING (user_id = auth.uid());
```

### `table_progress`

```sql
-- SELECT: Solo se puede ver el progreso de perfiles propios
CREATE POLICY "Users can view own progress"
  ON table_progress FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- INSERT: Solo se puede insertar progreso en perfiles propios
CREATE POLICY "Users can insert own progress"
  ON table_progress FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- UPDATE: Solo se puede actualizar progreso de perfiles propios
CREATE POLICY "Users can update own progress"
  ON table_progress FOR UPDATE
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- DELETE: Solo se puede eliminar progreso de perfiles propios
CREATE POLICY "Users can delete own progress"
  ON table_progress FOR DELETE
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
```

---

## 🔄 Mapeo con el Código Angular Actual

| Modelo TypeScript actual | → Tabla Supabase |
|---|---|
| `UserSession.email` | `auth.users` (gestionado por Supabase Auth) |
| `Profile.id, name, age, avatar, totalStars` | `profiles` |
| `Profile.progress[]` (array embebido) | `table_progress` (tabla separada, JOIN) |
| `TableProgress.tableId, basicCompleted, advancedCompleted, stars` | `table_progress` |

> **Cambio clave:** `progress` pasa de ser un **array anidado dentro de Profile** a ser una **tabla separada con FK**, lo cual es la normalización correcta para una base de datos relacional.

---

## ⚙️ Trigger: Inicialización Automática de Progreso

Al crear un nuevo perfil, se deben generar automáticamente las **10 filas de `table_progress`** (una por cada tabla de multiplicar del 1 al 10). Esto se logra con un trigger de PostgreSQL:

```sql
CREATE OR REPLACE FUNCTION initialize_table_progress()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO table_progress (profile_id, table_id)
  SELECT NEW.id, generate_series(1, 10);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION initialize_table_progress();
```

Esto garantiza que el progreso siempre esté listo sin necesidad de lógica adicional en el frontend.
