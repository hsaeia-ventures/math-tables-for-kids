import { Injectable, signal, inject, effect } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Profile, TableProgress } from '../models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly USERS_KEY = 'astromath_users';

  private auth = inject(AuthService);

  profiles = signal<Profile[]>([]);
  activeProfile = signal<Profile | null>(null);

  constructor() {
    // Automatically react to auth changes
    effect(() => {
      const user = this.auth.currentUser();
      if (user) {
        this.loadProfiles(user.email || user.uid);
      } else {
        this.clearData();
      }
    });
  }

  private clearData(): void {
    this.profiles.set([]);
    this.activeProfile.set(null);
  }

  private loadProfiles(userKey: string): void {
    const allUsersData = JSON.parse(localStorage.getItem(this.USERS_KEY) || '{}');
    const userProfiles = allUsersData[userKey] || [];
    this.profiles.set(userProfiles);

    // If there was an active profile pre-selected (optional logic for future)
    // For now we just reset it and let user select
    this.activeProfile.set(null);
  }

  createProfile(name: string, age: number, avatar: string): Observable<Profile> {
    const user = this.auth.currentUser();
    if (!user) throw new Error('No user logged in');
    const userKey = user.email || user.uid;

    const newProfile: Profile = {
      id: crypto.randomUUID(),
      name,
      age,
      avatar,
      totalStars: 0,
      progress: Array.from({ length: 10 }, (_, i) => ({
        tableId: i + 1,
        basicCompleted: false,
        advancedCompleted: false,
        stars: 0,
      })),
    };

    const allUsersData = JSON.parse(localStorage.getItem(this.USERS_KEY) || '{}');
    const userProfiles = allUsersData[userKey] || [];
    userProfiles.push(newProfile);
    allUsersData[userKey] = userProfiles;
    localStorage.setItem(this.USERS_KEY, JSON.stringify(allUsersData));

    this.profiles.set([...userProfiles]);
    return of(newProfile).pipe(delay(300));
  }

  selectProfile(profileId: string): void {
    const active = this.profiles().find((p) => p.id === profileId);
    this.activeProfile.set(active || null);
  }

  updateProgress(tableId: number, type: 'basic' | 'advanced', stars: number): Observable<void> {
    const user = this.auth.currentUser();
    const profile = this.activeProfile();
    if (!user || !profile) return of(undefined);
    const userKey = user.email || user.uid;

    const updatedProfile = { ...profile };
    // Deep copy progress to avoid direct mutation issues
    updatedProfile.progress = profile.progress.map(p => ({ ...p }));

    const progressIndex = updatedProfile.progress.findIndex((p) => p.tableId === tableId);

    if (progressIndex > -1) {
      const p = updatedProfile.progress[progressIndex];
      if (type === 'basic') p.basicCompleted = true;
      if (type === 'advanced') p.advancedCompleted = true;

      const starDiff = Math.max(0, stars - p.stars);
      p.stars = Math.max(p.stars, stars);
      updatedProfile.totalStars += starDiff;
    }

    const allUsersData = JSON.parse(localStorage.getItem(this.USERS_KEY) || '{}');
    const userProfiles: Profile[] = allUsersData[userKey];
    const profileIndex = userProfiles.findIndex((p) => p.id === profile.id);
    userProfiles[profileIndex] = updatedProfile;
    allUsersData[userKey] = userProfiles;
    localStorage.setItem(this.USERS_KEY, JSON.stringify(allUsersData));

    this.activeProfile.set(updatedProfile);
    this.profiles.set([...userProfiles]);

    return of(undefined).pipe(delay(300));
  }
}
