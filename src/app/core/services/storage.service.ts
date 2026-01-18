import { Injectable, signal } from '@angular/core';
import { Observable, of, delay, tap } from 'rxjs';
import { Profile, UserSession, TableProgress } from '../models';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly USERS_KEY = 'astromath_users';
  private readonly SESSION_KEY = 'astromath_session';

  currentUser = signal<UserSession | null>(this.getInitialSession());
  profiles = signal<Profile[]>([]);
  activeProfile = signal<Profile | null>(null);

  constructor() {
    this.loadProfiles();
  }

  private getInitialSession(): UserSession | null {
    const session = localStorage.getItem(this.SESSION_KEY);
    return session ? JSON.parse(session) : null;
  }

  login(email: string): Observable<UserSession> {
    const session: UserSession = { email };
    return of(session).pipe(
      delay(300),
      tap((s) => {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(s));
        this.currentUser.set(s);
        this.loadProfiles();
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.SESSION_KEY);
    this.currentUser.set(null);
    this.activeProfile.set(null);
    this.profiles.set([]);
  }

  private loadProfiles(): void {
    const user = this.currentUser();
    if (!user) return;

    const allUsersData = JSON.parse(localStorage.getItem(this.USERS_KEY) || '{}');
    const userProfiles = allUsersData[user.email] || [];
    this.profiles.set(userProfiles);

    if (user.currentProfileId) {
      const active = userProfiles.find((p: Profile) => p.id === user.currentProfileId);
      this.activeProfile.set(active || null);
    }
  }

  createProfile(name: string, age: number, avatar: string): Observable<Profile> {
    const user = this.currentUser();
    if (!user) throw new Error('No user logged in');

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
    const userProfiles = allUsersData[user.email] || [];
    userProfiles.push(newProfile);
    allUsersData[user.email] = userProfiles;
    localStorage.setItem(this.USERS_KEY, JSON.stringify(allUsersData));

    this.profiles.set(userProfiles);
    return of(newProfile).pipe(delay(300));
  }

  selectProfile(profileId: string): void {
    const user = this.currentUser();
    if (!user) return;

    user.currentProfileId = profileId;
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
    this.currentUser.set({ ...user });

    const active = this.profiles().find((p) => p.id === profileId);
    this.activeProfile.set(active || null);
  }

  updateProgress(tableId: number, type: 'basic' | 'advanced', stars: number): Observable<void> {
    const user = this.currentUser();
    const profile = this.activeProfile();
    if (!user || !profile) return of(undefined);

    const updatedProfile = { ...profile };
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
    const userProfiles: Profile[] = allUsersData[user.email];
    const profileIndex = userProfiles.findIndex((p) => p.id === profile.id);
    userProfiles[profileIndex] = updatedProfile;
    allUsersData[user.email] = userProfiles;
    localStorage.setItem(this.USERS_KEY, JSON.stringify(allUsersData));

    this.activeProfile.set(updatedProfile);
    this.profiles.set([...userProfiles]);

    return of(undefined).pipe(delay(300));
  }
}
