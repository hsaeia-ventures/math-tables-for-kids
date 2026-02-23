Act as a Senior Angular Frontend Engineer specializing in EdTech applications for children. Use Angular (Latest Stable), Standalone Components, Signals, and Tailwind CSS.

**GOAL:** Build "AstroMath", a playful, responsive web app to teach multiplication tables (1-10) to kids.
**THEME:** "Cartoon Space". Cute planets, bright colors, rounded UI, "juicy" interactions.
**DATA:** Use **Firebase** (Firestore + Auth) as the Backend-as-a-Service (BaaS) for persistent data.

### TECH STACK REQUIREMENTS
- **Framework:** Angular (Standalone Components, No NgModules).
- **State Management:** Angular Signals (`signal()`, `computed()`, `effect()`).
- **Control Flow:** Use new syntax (`@if`, `@for`, `@switch`).
- **Styling:** Tailwind CSS. Use specific colors: Primary (Space Blue), Accent (Star Yellow), Success (Alien Green), Error (Comet Red).
- **Icons:** Lucide-Angular.
- **Audio:** Integrate `howler.js` for sound effects (clicks, success, failure, hint, level complete, training complete). Managed via `SoundService`.
- **Backend:** Firebase (Firestore for data, Firebase Auth for authentication).
- **Client:** `@angular/fire`.

### CORE FEATURES & LOGIC implementation details:

1. **Service Layer (Firebase Integration):**
   - **Authentication:** Use Firebase Auth (Google Sign-In via popup) for user accounts (parents/teachers).
   - **Data Access:** `StorageService` to read/write `profiles` and `progress` from Firestore.
   - **Security:** Firestore Security Rules ensuring users only access their own data (`request.auth.uid == userId`).

2. **Routing Flow:**
   - `/welcome`: Landing page with app branding and call to action.
   - `/login`: Login screen integrated with Firebase Auth (Google sign-in).
   - `/profile-select`: List existing profiles or create new (Name, Age, Avatar picker).
   - `/dashboard`: The "Mission Control". Shows 10 Planets (Tables 1-10). Visual indicators (lock icons, stars, training badges). Clicking a planet opens a modal to choose between Training and Mission.
   - `/training/:tableId`: **Training mode** — Guided learning experience (see section below).
   - `/exercise/:tableId`: **Mission mode** — The game/evaluation screen.

3. **Training Mode ("Misión de Entrenamiento"):**
   An interactive tutorial that combines teaching and micro-quizzes for each multiplication. Designed as a "flight simulator" before the real mission.

   - **Flow:** For each multiplication (1-10):
     - **Observe Phase:** The operation and its answer are shown with animations and optional visual representation (emoji groups for small numbers).
     - **Quiz Phase:** The child selects the correct answer from 2 options (reduced difficulty vs. the game's 4 options). No timer, no lives.
     - **Correct → Feedback Phase:** Celebration animation, mastery bar advances, proceed to next.
     - **Wrong → Hint Phase:** The "Commander" provides a contextual hint. The child reviews and retries the same multiplication.
   - **Review Round:** Multiplications where the child failed are repeated at the end of the session.
   - **Completion:** Marks `trainingCompleted = true` in Firestore. Shows a completion screen with an option to go directly to the real mission.
   - **Gamification:**
     - Mastery bar (not a simple progress bar) with glow animation.
     - Step indicator dots (green = completed, yellow = current, red = failed, gray = pending).
     - Training is **optional but incentivized**: The dashboard shows an indigo 🎯 badge on trained planets, and the planet menu includes a subtle encouragement message.
   - **Anti-frustration:** Zero penalties. No lives. Unlimited retries. Hints on every mistake.

4. **Game Logic (Mission Mode — Crucial):**
   - **Levels:** 'Basic' (Sequential: 1x1, 1x2...) vs 'Advanced' (Random). Advanced unlocks only after Basic is completed.
   - **Input Method:** For every question, randomly select (50/50 chance) between:
     - *Buttons:* 4 big options (1 correct, 3 random wrong answers).
     - *Input:* A text field + "Fire" button.
   - **Questions:** 10 questions per round.
   - **Lives:** 3 lives. Losing all lives ends the mission.
   - **Feedback:** Immediate visual/audio feedback. On wrong answer, show correct answer before moving next.

5. **UI Components:**
   - `StarBackgroundComponent`: CSS animated backdrop with twinkling stars and shooting stars.
   - `PlanetMenuModalComponent`: Modal displayed when clicking a planet, offering Training and Mission modes with glassmorphism design.
   - `ToastComponent`: Notification system for success/error messages.
   - Buttons must have hover/active states with `juicy-button` class and custom cursor.

### DATA MODEL (Firestore):

```
users/{userId}/profiles/{profileId}
├── name: string
├── age: number
├── avatar: string (emoji)
├── totalStars: number
└── progress: TableProgress[]
    ├── tableId: number
    ├── basicCompleted: boolean
    ├── advancedCompleted: boolean
    ├── stars: number (0-3)
    ├── trainingCompleted?: boolean    ← Training feature
    └── failedMultipliers?: number[]   ← Training feature
```

### STEP-BY-STEP IMPLEMENTATION PLAN:
1. Setup global styles, Tailwind config (colors/fonts), and SoundService.
2. Initialize Firebase client and create `AuthService` / `StorageService`. Configure Firestore security rules.
3. Build Login & Profile Selection/Creation screens.
4. Build Dashboard with Planet grid layout and planet menu modal.
5. Build the Training Engine (TrainingService, TrainingComponent with 4-phase flow).
6. Build the Game Engine (Question generation logic, State management with Signals).
7. Implement the Results/Rewards screen logic.

