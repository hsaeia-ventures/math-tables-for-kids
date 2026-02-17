Act as a Senior Angular Frontend Engineer specializing in EdTech applications for children. Use Angular (Latest Stable), Standalone Components, Signals, and Tailwind CSS.

**GOAL:** Build "AstroMath", a playful, responsive web app to teach multiplication tables (1-10) to kids.
**THEME:** "Cartoon Space". Cute planets, bright colors, rounded UI, "juicy" interactions.
**DATA:** Use **Supabase** as the Backend-as-a-Service (BaaS) for persistent data (Auth & DB). No longer using LocalStorage mocks for core data.

### TECH STACK REQUIREMENTS
- **Framework:** Angular (Standalone Components, No NgModules).
- **State Management:** Angular Signals (`signal()`, `computed()`, `effect()`).
- **Control Flow:** Use new syntax (`@if`, `@for`, `@switch`).
- **Styling:** Tailwind CSS. Use specific colors: Primary (Space Blue), Accent (Star Yellow), Success (Alien Green), Error (Comet Red).
- **Icons:** Lucide-Angular.
- **Audio:** Integrate `howler.js` for sound effects (clicks, success, failure, level complete). create a `SoundService`.
- **Backend:** Supabase (PostgreSQL, Auth, Realtime).
- **Client:** `@supabase/supabase-js`.

### CORE FEATURES & LOGIC implementation details:

1. **Service Layer (Supabase Integration):**
   - **Authentication:** Use Supabase Auth for user accounts (parents/teachers or direct).
   - **Data Access:** Services to read/write `profiles` and `progress` from Supabase tables.
   - **Security:** Implement Row Level Security (RLS) policies.

2. **Routing Flow:**
   - `/login`: Login/Signup screen integrated with Supabase Auth.
   - `/profile-select`: List existing profiles or create new (Name, Age, Avatar picker).
   - `/dashboard`: The "Mission Control". Shows 10 Planets (Tables 1-10). Visual indicators (lock icons, stars) based on progress.
   - `/exercise/:tableId`: The game screen.

3. **Game Logic (Crucial):**
   - **Levels:** 'Basic' (Sequential: 1x1, 1x2...) vs 'Advanced' (Random). Advanced unlocks only after Basic is completed.
   - **Input Method:** For every question, randomly select (50/50 chance) between:
     - *Buttons:* 4 big options (1 correct, 3 random wrong answers).
     - *Input:* A text field + "Fire" button.
   - **Questions:** 10 questions per round.
   - **Feedback:** Immediate visual/audio feedback. On wrong answer, show correct answer before moving next.

4. **UI Components:**
   - Use a `StarBackground` component with CSS animations for the backdrop.
   - Buttons must have hover/active states appropriate for touch devices.

### STEP-BY-STEP IMPLEMENTATION PLAN:
1. Setup global styles, Tailwind config (colors/fonts), and SoundService.
2. Initialize Supabase client and create `AuthService` / `DataService`. Create tables in Supabase.
3. Build Login & Profile Selection/Creation screens.
4. Build Dashboard with Planet grid layout.
5. Build the Game Engine (Question generation logic, State management with Signals).
6. Implement the Results/Rewards screen logic.

Please start by scaffolding the application structure and the Supabase configuration (environment variables, client setup).
