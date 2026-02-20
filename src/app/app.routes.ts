import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { profileGuard } from './core/guards/profile.guard';

export const routes: Routes = [
  {
    path: 'welcome',
    loadComponent: () => import('./features/welcome/welcome.component').then(m => m.WelcomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'profile-select',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile-select/profile-select.component').then(m => m.ProfileSelectComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard, profileGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'exercise/:tableId',
    canActivate: [authGuard, profileGuard],
    loadComponent: () => import('./features/game/game.component').then(m => m.GameComponent)
  },
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'welcome'
  }
];
