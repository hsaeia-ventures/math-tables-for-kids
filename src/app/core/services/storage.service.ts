import { Injectable, signal, inject, effect, DestroyRef } from '@angular/core';
import { Observable, of, delay, from, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Firestore, collection, collectionData, doc, setDoc, updateDoc } from '@angular/fire/firestore';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Profile, TableProgress } from '../models';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private auth = inject(AuthService);
  private firestore = inject(Firestore);
  private destroyRef = inject(DestroyRef);
  private notify = inject(NotificationService);

  profiles = signal<Profile[]>([]);
  activeProfile = signal<Profile | null>(null);
  loadingProfiles = signal<boolean>(false);

  constructor() {
    effect(() => {
      const user = this.auth.currentUser();
      if (user) {
        this.loadingProfiles.set(true);
        this.loadProfiles(user.uid);
      } else {
        this.clearData();
      }
    });
  }

  private clearData(): void {
    this.profiles.set([]);
    this.activeProfile.set(null);
    this.loadingProfiles.set(false);
  }

  private loadProfiles(userId: string): void {
    const profilesRef = collection(this.firestore, `users/${userId}/profiles`);
    collectionData(profilesRef, { idField: 'id' }).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (profiles) => {
        this.profiles.set(profiles as Profile[]);
        this.loadingProfiles.set(false);
      },
      error: (error) => {
        console.error('StorageService: Error loading profiles:', error);
        this.notify.show('Error al cargar los perfiles.', 'error');
        this.loadingProfiles.set(false);
      }
    });
  }

  createProfile(name: string, age: number, avatar: string): Observable<Profile> {
    const user = this.auth.currentUser();
    if (!user) throw new Error('No user logged in');

    const newProfile: Profile = {
      id: crypto.randomUUID(), // We can let Firestore generate ID too, but keeping consistent for now
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

    const profilesRef = collection(this.firestore, `users/${user.uid}/profiles`);
    // Use setDoc with specific ID or addDoc. Using setDoc since we generated ID.
    const docRef = doc(profilesRef, newProfile.id);

    return from(setDoc(docRef, newProfile)).pipe(
      map(() => newProfile),
      delay(300),
      catchError((error) => {
        console.error('StorageService: Error creating profile:', error);
        this.notify.show('Error al crear el perfil.', 'error');
        return throwError(() => error);
      })
    );
  }

  selectProfile(profileId: string): void {
    const active = this.profiles().find((p) => p.id === profileId);
    this.activeProfile.set(active || null);
  }

  updateProgress(tableId: number, type: 'basic' | 'advanced', stars: number): Observable<void> {
    const user = this.auth.currentUser();
    const profile = this.activeProfile();
    if (!user || !profile) return of(undefined);

    const updatedProfile = { ...profile };
    updatedProfile.progress = profile.progress.map(p => ({ ...p }));

    const progressIndex = updatedProfile.progress.findIndex((p) => p.tableId === tableId);

    if (progressIndex > -1) {
      const p = updatedProfile.progress[progressIndex];
      let changed = false;

      if (type === 'basic' && !p.basicCompleted) {
        p.basicCompleted = true;
        changed = true;
      }
      if (type === 'advanced' && !p.advancedCompleted) {
        p.advancedCompleted = true;
        changed = true;
      }

      const starDiff = Math.max(0, stars - p.stars);
      if (starDiff > 0) {
        p.stars = Math.max(p.stars, stars);
        updatedProfile.totalStars += starDiff;
        changed = true;
      }

      if (changed) {
        const profileRef = doc(this.firestore, `users/${user.uid}/profiles/${profile.id}`);

        // Optimistic update locally
        this.activeProfile.set(updatedProfile);

        return from(updateDoc(profileRef, {
          progress: updatedProfile.progress,
          totalStars: updatedProfile.totalStars
        })).pipe(
          delay(300)
        );
      }
    }

    return of(undefined);
  }
}
