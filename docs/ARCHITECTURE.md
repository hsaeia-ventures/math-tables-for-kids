# Architecture Guide - AstroMath

## Overview
AstroMath is an EdTech application for children to learn multiplication tables through a "Cartoon Space" theme.

## Tech Stack
- **Framework:** Angular 21 (Standalone Components, Signals, OnPush)
- **Styling:** Tailwind CSS 4
- **State Management:** Angular Signals
- **Persistence:** LocalStorage via `StorageService`
- **Audio:** `howler.js` via `SoundService`
- **Icons:** `lucide-angular`

## Application Structure
- `src/app/core`: Singleton services (`StorageService`, `SoundService`), guards, and models.
- `src/app/shared`: Reusable components (`StarBackground`, `Button`, etc.).
- `src/app/features`: Feature-based modules (Login, Dashboard, Game).

## Data Models
- `Profile`: id, name, age, avatar, totalStars.
- `Progress`: tableId, basicCompleted, advancedCompleted, stars.
