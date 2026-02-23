# 🎯 Plan de Implementación — "Misión de Entrenamiento" (Idea 2)

## Resumen Ejecutivo

Implementar un **modo de entrenamiento guiado** (`/training/:tableId`) donde el niño aprende cada multiplicación de una tabla mediante un flujo de **Observar → Mini-Quiz → Refuerzo/Pista → Siguiente**. Sin vidas, sin timer, con repetición de errores al final y pistas del "Comandante".

### Decisión de diseño previa solicitada
> **¿El entrenamiento es obligatorio antes de practicar, opcional, o da un bonus?**
> Este plan está preparado para las 3 opciones, pero necesito tu decisión para definir la lógica exacta del Dashboard y del GameComponent. Por defecto, el plan asume la opción **"sugerir pero no obligar" + bonus visual** (indicador en el dashboard de que el entrenamiento está completado).

---

## Arquitectura de la Solución

### Flujo propuesto
```
Dashboard → Tap en planeta → Modal "Menú del Planeta"
  ├── 🎯 Entrenar    → /training/:tableId (TrainingComponent)
  └── 🚀 Misión Real → /exercise/:tableId (GameComponent — existente)

Training Flow:
  Para cada multiplicación (1..10):
    Fase 1: OBSERVAR → Se muestra "5×3 = 15" con animación
    Fase 2: MINI-QUIZ → ¿Cuánto es 5×3? (2 opciones)
      ├── Acierto ✅ → Refuerzo positivo → Siguiente multiplicación
      └── Error ❌ → Pista del Comandante → Se re-muestra → Reintentar
  → Al completar las 10:
    Si hay errores → Se repiten las multiplicaciones fallidas
    Si todo correcto → 🏆 Entrenamiento completado → Dashboard
```

### Archivos nuevos a crear
| Archivo | Descripción |
|---|---|
| `src/app/features/training/training.component.ts` | Componente principal del entrenamiento |
| `src/app/features/training/training.component.scss` | Estilos y animaciones del entrenamiento |
| `src/app/features/training/training.component.spec.ts` | Tests del componente |
| `src/app/core/services/training.service.ts` | Lógica de generación de pasos y pistas |
| `src/app/core/services/training.service.spec.ts` | Tests del servicio |
| `src/app/shared/components/planet-menu-modal.component.ts` | Modal de selección de modo al tocar planeta |
| `src/app/shared/components/planet-menu-modal.component.spec.ts` | Tests del modal |

### Archivos existentes a modificar
| Archivo | Tipo de cambio |
|---|---|
| `src/app/core/models/index.ts` | Agregar campos al modelo + nueva interfaz |
| `src/app/core/services/storage.service.ts` | Nuevo método para guardar progreso de training |
| `src/app/core/services/storage.service.spec.ts` | Tests del nuevo método |
| `src/app/core/services/game.service.ts` | Refactor menor (extraer método `shuffle` como utilidad compartida) |
| `src/app/core/services/sound.service.ts` | Agregar nuevo sonido "hint" para las pistas |
| `src/app/features/dashboard/dashboard.component.ts` | Integrar modal de selección + indicador de training |
| `src/app/features/dashboard/dashboard.component.scss` | Estilos del indicador de training completado |
| `src/app/app.routes.ts` | Nueva ruta `/training/:tableId` |
| `context/PRD.md` | Actualizar con la nueva sección de entrenamiento |

---

## Tareas Detalladas

---

### 📦 GRUPO 1: Capa de Datos (Models + Services)

#### Tarea 1.1 — Actualizar modelos de datos
**Archivo:** `src/app/core/models/index.ts`

**Cambios:**
1. **Eliminar la interfaz `TableProgress` duplicada** (líneas 17-22, es una copia exacta de las líneas 10-15).
2. **Agregar campos de entrenamiento a `TableProgress`:**
   ```typescript
   export interface TableProgress {
     tableId: number;
     basicCompleted: boolean;
     advancedCompleted: boolean;
     stars: number;
     trainingCompleted: boolean;       // NUEVO: si completó el entrenamiento
     failedMultipliers: number[];      // NUEVO: multiplicadores donde falló (para repetición)
   }
   ```
3. **Crear interfaz `TrainingStep`:**
   ```typescript
   export interface TrainingStep {
     multiplier: number;           // Ej: 3 (para tabla del 5: 5×3)
     operation: string;            // Ej: "5 × 3"
     correctAnswer: number;        // Ej: 15
     options: [number, number];    // 2 opciones (simplificado vs 4 del juego)
     hint: string;                 // Pista del Comandante
   }
   ```
4. **Crear tipo para las fases del entrenamiento:**
   ```typescript
   export type TrainingPhase = 'observe' | 'quiz' | 'feedback' | 'hint';
   ```

**Impacto:** Todos los lugares donde se crea un `TableProgress` (principalmente `StorageService.createProfile`) deben inicializar los nuevos campos.

---

#### Tarea 1.2 — Crear `TrainingService`
**Archivo nuevo:** `src/app/core/services/training.service.ts`

**Responsabilidades:**
1. **`generateTrainingSteps(tableId: number): TrainingStep[]`** — Genera los 10 pasos de entrenamiento para una tabla.
   - Para cada multiplicador (1-10), crea un `TrainingStep` con:
     - La operación (`${tableId} × ${multiplier}`)
     - La respuesta correcta
     - 2 opciones: la correcta + 1 incorrecta (generada con offset aleatorio)
     - Una pista contextual en español
2. **`generateHint(tableId: number, multiplier: number): string`** — Genera la pista del Comandante.
   - Formato: `"Recuerda: ${multiplier} grupo(s) de ${tableId} = ${tableId × multiplier}"`
   - Variaciones alternativas: representación visual con emojis (ej: `"⭐⭐⭐ + ⭐⭐⭐ = 6 estrellas"` para 3×2)
3. **`generateReducedOptions(correctAnswer: number): [number, number]`** — 2 opciones (correcta + 1 distractora).
   - La opción incorrecta debe ser plausible (±1 a ±5 del resultado correcto, siempre > 0)
   - El orden de las opciones debe ser aleatorio

**Notas de implementación:**
- Inyectable con `providedIn: 'root'`
- Puede reutilizar la lógica de `shuffle` del `GameService` (considerar extraerla a un utils)

---

#### Tarea 1.3 — Tests de `TrainingService`
**Archivo nuevo:** `src/app/core/services/training.service.spec.ts`

**Casos de test:**
1. `generateTrainingSteps` genera exactamente 10 pasos para cualquier tabla (1-10)
2. Cada paso tiene la operación correcta (ej: `"5 × 3"` para tabla 5, multiplicador 3)
3. Cada paso tiene la respuesta correcta (`tableId * multiplier`)
4. Cada paso tiene exactamente 2 opciones
5. Una de las 2 opciones es siempre la respuesta correcta
6. La opción incorrecta es > 0 y ≠ respuesta correcta
7. `generateHint` devuelve un string no vacío
8. `generateHint` incluye la respuesta correcta en el texto
9. `generateReducedOptions` devuelve un array de 2 elementos
10. `generateReducedOptions` siempre incluye la respuesta correcta

---

#### Tarea 1.4 — Actualizar `StorageService`
**Archivo:** `src/app/core/services/storage.service.ts`

**Cambios:**
1. **Actualizar `createProfile`** — Inicializar los nuevos campos en el array `progress`:
   ```typescript
   progress: Array.from({ length: 10 }, (_, i) => ({
     tableId: i + 1,
     basicCompleted: false,
     advancedCompleted: false,
     stars: 0,
     trainingCompleted: false,    // NUEVO
     failedMultipliers: [],       // NUEVO
   })),
   ```

2. **Agregar método `updateTrainingProgress`:**
   ```typescript
   updateTrainingProgress(
     tableId: number,
     completed: boolean,
     failedMultipliers: number[]
   ): Observable<void>
   ```
   - Similar a `updateProgress`, pero actualiza `trainingCompleted` y `failedMultipliers`
   - Optimistic update local del `activeProfile`
   - Persiste en Firestore con `updateDoc`

---

#### Tarea 1.5 — Tests de `StorageService` (actualización)
**Archivo:** `src/app/core/services/storage.service.spec.ts`

**Nuevos casos de test:**
1. `createProfile` incluye `trainingCompleted: false` y `failedMultipliers: []` en cada `TableProgress`
2. `updateTrainingProgress` actualiza el perfil local correctamente
3. `updateTrainingProgress` llama a `updateDoc` con los datos correctos de Firestore
4. `updateTrainingProgress` no hace nada si no hay usuario activo
5. `updateTrainingProgress` no hace nada si no hay perfil activo

---

#### Tarea 1.6 — Actualizar `SoundService`
**Archivo:** `src/app/core/services/sound.service.ts`

**Cambios:**
1. Agregar un nuevo sonido `'hint'` para cuando el Comandante da una pista:
   ```typescript
   this.loadSound('hint', '<URL_SONIDO_PISTA>');
   ```
2. Actualizar el tipo del método `play`:
   ```typescript
   play(key: 'click' | 'success' | 'failure' | 'complete' | 'hint'): void
   ```

---

### 📦 GRUPO 2: Componente de Entrenamiento (Feature)

#### Tarea 2.1 — Crear `TrainingComponent` (lógica)
**Archivo nuevo:** `src/app/features/training/training.component.ts`

**Signals y Estado:**
```typescript
tableId = 0;
steps = signal<TrainingStep[]>([]);
currentStepIndex = signal(0);
phase = signal<TrainingPhase>('observe');
failedMultipliers = signal<number[]>([]);
isReviewRound = signal(false);       // true cuando está repitiendo errores
masteryProgress = signal(0);         // 0-100, barra de dominio
isCompleted = signal(false);
selectedOption = signal<number | null>(null);
```

**Computeds:**
```typescript
currentStep = computed(() => this.steps()[this.currentStepIndex()]);
totalSteps = computed(() => this.steps().length);
progressPercentage = computed(() => 
  (this.currentStepIndex() / this.totalSteps()) * 100
);
```

**Métodos principales:**
1. **`ngOnInit()`** — Lee `tableId` de la ruta, genera los pasos con `TrainingService`
2. **`startObservePhase()`** — Muestra la operación con resultado (fase "observar")
3. **`startQuizPhase()`** — Transición a la fase de mini-quiz (auto-avanza desde observe tras ~3s o click)
4. **`checkAnswer(selected: number)`** — Evalúa la respuesta:
   - Si acierta: `phase = 'feedback'` (positivo), incrementa `masteryProgress`
   - Si falla: `phase = 'hint'`, agrega a `failedMultipliers`
5. **`showHint()`** — Muestra la pista del Comandante y regresa a `observe` para esa misma multiplicación
6. **`nextStep()`** — Avanza al siguiente paso o al round de revisión
7. **`startReviewRound()`** — Si hay `failedMultipliers`, regenera pasos solo para esos multiplicadores
8. **`completeTraining()`** — Marca como completado, llama a `StorageService.updateTrainingProgress`
9. **`goBack()`** — Navega a `/dashboard`

**Template (estructura general):**
- Header con barra de "Dominio" (no barra de progreso genérica)
- Botón de volver al dashboard
- Sección condicional según `phase()`:
  - `observe`: Muestra la operación completa con animación de aparición + representación visual
  - `quiz`: Muestra la operación sin resultado + 2 botones de opciones
  - `feedback`: Animación de refuerzo positivo (🌟) con botón "Continuar"
  - `hint`: Mensaje del Comandante con la pista + botón "Entendido" que vuelve a `observe`
- Pantalla final de completado con insignia

---

#### Tarea 2.2 — Estilos del `TrainingComponent`
**Archivo nuevo:** `src/app/features/training/training.component.scss`

**Estilos a implementar:**
1. **Animación de la fase "observe":** Efecto de aparición progresiva del resultado (scale-in + glow)
2. **Barra de Dominio:** Gradiente especial (diferente a la barra de progreso del juego), con efecto de brillo al avanzar
3. **Botones de opciones (mini-quiz):** Más grandes que los del juego (son solo 2), con hover effects
4. **Caja de pista del Comandante:** Estilo "burbuja de diálogo" con icono de robot/comandante
5. **Pantalla de completado:** Animación de celebración
6. **Representación visual:** Grids de emojis/estrellas para representar la multiplicación

---

#### Tarea 2.3 — Tests del `TrainingComponent`
**Archivo nuevo:** `src/app/features/training/training.component.spec.ts`

**Casos de test:**

*Renderizado inicial:*
1. Se renderiza correctamente con un `tableId` válido
2. Muestra la barra de "Dominio" al 0% inicialmente
3. Muestra la primera multiplicación en fase "observe"
4. Muestra el botón de volver al dashboard

*Fase Observe:*
5. Muestra la operación completa (ej: "5 × 1 = 5")
6. Tiene un botón/acción para avanzar a la fase quiz

*Fase Quiz:*
7. Muestra la operación SIN el resultado (ej: "5 × 1 = ?")
8. Muestra exactamente 2 opciones de respuesta
9. Una de las opciones es la respuesta correcta

*Interacción - Acierto:*
10. Al seleccionar la respuesta correcta, muestra feedback positivo
11. La barra de dominio se incrementa tras un acierto
12. Se reproduce el sonido de éxito

*Interacción - Error:*
13. Al seleccionar la respuesta incorrecta, muestra la pista del Comandante
14. NO se pierden vidas (no hay sistema de vidas)
15. Se reproduce el sonido de pista (hint)
16. El multiplicador se agrega a `failedMultipliers`

*Fase Hint:*
17. Muestra el texto de la pista
18. Tiene un botón "Entendido" que vuelve a la fase observe del mismo paso
19. Al reintentar tras la pista, vuelve a mostrar el quiz

*Navegación de pasos:*
20. Tras feedback positivo, el botón "Continuar" avanza al siguiente paso
21. Al completar los 10 pasos sin errores, muestra pantalla de completado
22. Al completar los 10 pasos CON errores, inicia ronda de revisión con los multiplicadores fallidos

*Ronda de revisión:*
23. Solo muestra los multiplicadores donde falló
24. Al completar la ronda de revisión, muestra pantalla de completado

*Completado:*
25. La pantalla de completado muestra insignia/celebración
26. Llama a `StorageService.updateTrainingProgress` con los datos correctos
27. Botón "Volver al Centro de Control" navega a `/dashboard`

---

### 📦 GRUPO 3: Dashboard — Modal de Selección de Modo

#### Tarea 3.1 — Crear `PlanetMenuModalComponent`
**Archivo nuevo:** `src/app/shared/components/planet-menu-modal.component.ts`

**Props (Inputs):**
```typescript
tableId = input.required<number>();
tableName = input.required<string>();   // Ej: "Tabla 5"
planetEmoji = input.required<string>(); // Ej: "🍃"
planetColor = input.required<string>(); // Ej: "linear-gradient(…)"
trainingCompleted = input<boolean>(false);
isOpen = input<boolean>(false);
```

**Outputs:**
```typescript
selectMode = output<'training' | 'mission'>();
closeModal = output<void>();
```

**Template:**
- Overlay oscuro (click fuera cierra el modal)
- Tarjeta centrada con:
  - Header con emoji + nombre del planeta
  - Dos botones grandes:
    - 🎯 **"Entrenar"** — Con subtexto: "Simulador de vuelo" o "Aprende paso a paso"
      - Si `trainingCompleted`: badge de ✅ "Completado"
    - 🚀 **"Misión Real"** — Con subtexto: "¡Demuestra lo que sabes!"
  - Botón de cerrar (X)

**Estilos inline o en template:**
- Glassmorphism (ya presente en la app)
- Animación de entrada (scale-in + fade-in)
- Los botones tienen el estilo `juicy-button` existente

---

#### Tarea 3.2 — Tests del `PlanetMenuModalComponent`
**Archivo nuevo:** `src/app/shared/components/planet-menu-modal.component.spec.ts`

**Casos de test:**
1. Se renderiza cuando `isOpen` es `true`
2. No se renderiza (o está oculto) cuando `isOpen` es `false`
3. Muestra el nombre del planeta y emoji correctos
4. Muestra los botones "Entrenar" y "Misión Real"
5. Click en "Entrenar" emite `selectMode` con `'training'`
6. Click en "Misión Real" emite `selectMode` con `'mission'`
7. Click fuera del modal emite `closeModal`
8. Muestra badge de "Completado" cuando `trainingCompleted` es `true`
9. No muestra badge cuando `trainingCompleted` es `false`

---

#### Tarea 3.3 — Modificar `DashboardComponent`
**Archivo:** `src/app/features/dashboard/dashboard.component.ts`

**Cambios:**

1. **Importar** `PlanetMenuModalComponent`

2. **Agregar state para el modal:**
   ```typescript
   showPlanetMenu = signal(false);
   selectedPlanet = signal<{tableId: number, emoji: string, color: string} | null>(null);
   ```

3. **Modificar `goToGame()`** → Renombrar a **`openPlanetMenu(planet)`**:
   ```typescript
   openPlanetMenu(planet: { tableId: number; emoji: string; color: string }): void {
     if (planet.tableId > 1 && !this.isPreviousCompleted(planet.tableId)) return;
     this.sound.play('click');
     this.selectedPlanet.set(planet);
     this.showPlanetMenu.set(true);
   }
   ```

4. **Agregar método `onSelectMode()`:**
   ```typescript
   onSelectMode(mode: 'training' | 'mission'): void {
     const planet = this.selectedPlanet();
     if (!planet) return;
     this.showPlanetMenu.set(false);
     if (mode === 'training') {
       this.router.navigate(['/training', planet.tableId]);
     } else {
       this.router.navigate(['/exercise', planet.tableId]);
     }
   }
   ```

5. **Agregar método `closePlanetMenu()`:**
   ```typescript
   closePlanetMenu(): void {
     this.showPlanetMenu.set(false);
     this.selectedPlanet.set(null);
   }
   ```

6. **Agregar computed para saber si el training está completado:**
   ```typescript
   isTrainingCompleted = computed(() => {
     const planet = this.selectedPlanet();
     if (!planet) return false;
     const progress = this.activeProfile()?.progress.find(p => p.tableId === planet.tableId);
     return progress?.trainingCompleted ?? false;
   });
   ```

7. **Actualizar template:**
   - Cambiar `(click)="goToGame(planet.tableId)"` → `(click)="openPlanetMenu(planet)"`
   - Agregar indicador visual en cada planeta si el training está completado (ej: pequeño icono 🎯)
   - Agregar el modal al final del template:
     ```html
     @if (showPlanetMenu() && selectedPlanet(); as planet) {
       <app-planet-menu-modal
         [tableId]="planet.tableId"
         [tableName]="'Tabla ' + planet.tableId"
         [planetEmoji]="planet.emoji"
         [planetColor]="planet.color"
         [trainingCompleted]="isTrainingCompleted()"
         [isOpen]="showPlanetMenu()"
         (selectMode)="onSelectMode($event)"
         (closeModal)="closePlanetMenu()"
       />
     }
     ```

8. **Actualizar el texto de estado** de los planetas para reflejar el entrenamiento:
   - `'Entrenando'` → podría cambiar a `'Sin entrenar'` si no completó el training, o `'Entrenado'` si sí

---

#### Tarea 3.4 — Actualizar estilos del Dashboard
**Archivo:** `src/app/features/dashboard/dashboard.component.scss`

**Cambios:**
1. Agregar estilo para el indicador de training completado en los planetas (un pequeño badge/icono)
2. Posible pulsación/glow sutil en el botón si hay training disponible pero no completado

---

### 📦 GRUPO 4: Routing y Configuración

#### Tarea 4.1 — Agregar ruta de training
**Archivo:** `src/app/app.routes.ts`

**Cambio:** Agregar la nueva ruta entre `dashboard` y `exercise`:
```typescript
{
  path: 'training/:tableId',
  canActivate: [authGuard, profileGuard],
  loadComponent: () => import('./features/training/training.component')
    .then(m => m.TrainingComponent)
},
```

---

### 📦 GRUPO 5: Documentación

#### Tarea 5.1 — Actualizar PRD
**Archivo:** `context/PRD.md`

**Cambios:**
1. Agregar sección "Modo de Entrenamiento" describiendo:
   - Flujo de la experiencia
   - Mecánica de las fases (Observar, Quiz, Pista, Repetición)
   - Sistema de gamificación (barra de dominio, sin penalizaciones)
2. Actualizar el diagrama de flujo general de la app para incluir la bifurcación Entrenar/Misión
3. Actualizar la sección de modelos de datos

---

## Orden de Implementación Recomendado

```
Fase 1 — Fundamentos (sin impacto visual):
  1.1 → Modelos
  1.2 → TrainingService
  1.3 → Tests TrainingService
  1.4 → StorageService (actualización)
  1.5 → Tests StorageService
  1.6 → SoundService

Fase 2 — Feature principal:
  2.1 → TrainingComponent (lógica + template)
  2.2 → TrainingComponent (estilos)
  2.3 → Tests TrainingComponent

Fase 3 — Integración con Dashboard:
  3.1 → PlanetMenuModalComponent
  3.2 → Tests PlanetMenuModalComponent
  3.3 → DashboardComponent (modificación)
  3.4 → Dashboard estilos

Fase 4 — Wiring:
  4.1 → Ruta

Fase 5 — Documentación:
  5.1 → PRD
```

---

## Notas Técnicas Importantes

### 1. Compatibilidad con datos existentes (Firestore)
Los perfiles ya existentes en Firestore **no tienen** los campos `trainingCompleted` ni `failedMultipliers`. Hay dos enfoques:
- **Opción A (recomendada):** Tratar los campos como opcionales en el código (`trainingCompleted?: boolean`) y defaultear a `false` / `[]` cuando estén ausentes. Esto evita una migración de datos.
- **Opción B:** Crear un script de migración que actualice todos los perfiles existentes.

### 2. Patrón de componente inline
La app usa **single-file components** (template y estilos inline en el `.ts` o con `styleUrl`). El `TrainingComponent` seguirá este mismo patrón con `template` inline y `styleUrl` externo.

### 3. Señales (Signals) sobre Observables
La app usa predominantemente **Angular Signals** para el estado local de componentes (no `BehaviorSubject`). El `TrainingComponent` seguirá este patrón.

### 4. Testing con Vitest
Los tests existentes usan **Vitest** (no Jasmine/Karma) con `vi.mock()` para Firebase. Los nuevos tests seguirán exactamente el mismo patrón.

### 5. No se necesita game.service.ts para el training
Aunque la propuesta original mencionaba `generateTrainingStep()` en `GameService`, es más limpio crear un `TrainingService` separado para mantener la separación de responsabilidades. El `GameService` se mantiene enfocado en la generación de preguntas del juego real.

### 6. Interfaz `TableProgress` duplicada
El archivo `models/index.ts` tiene la interfaz `TableProgress` definida **dos veces** (líneas 10-15 y 17-22). Esto se corregirá en la Tarea 1.1.

---

## Resumen de Archivos

### 📄 Archivos NUEVOS (7)
| # | Archivo | Grupo |
|---|---|---|
| 1 | `src/app/features/training/training.component.ts` | 2 |
| 2 | `src/app/features/training/training.component.scss` | 2 |
| 3 | `src/app/features/training/training.component.spec.ts` | 2 |
| 4 | `src/app/core/services/training.service.ts` | 1 |
| 5 | `src/app/core/services/training.service.spec.ts` | 1 |
| 6 | `src/app/shared/components/planet-menu-modal.component.ts` | 3 |
| 7 | `src/app/shared/components/planet-menu-modal.component.spec.ts` | 3 |

### ✏️ Archivos MODIFICADOS (9)
| # | Archivo | Grupo | Magnitud |
|---|---|---|---|
| 1 | `src/app/core/models/index.ts` | 1 | Media |
| 2 | `src/app/core/services/storage.service.ts` | 1 | Media |
| 3 | `src/app/core/services/storage.service.spec.ts` | 1 | Baja |
| 4 | `src/app/core/services/game.service.ts` | 1 | Baja (refactor menor) |
| 5 | `src/app/core/services/sound.service.ts` | 1 | Baja |
| 6 | `src/app/features/dashboard/dashboard.component.ts` | 3 | Alta |
| 7 | `src/app/features/dashboard/dashboard.component.scss` | 3 | Baja |
| 8 | `src/app/app.routes.ts` | 4 | Baja |
| 9 | `context/PRD.md` | 5 | Media |

**Total: 16 archivos** (7 nuevos + 9 modificados)
