import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import {
   Firestore, collection, collectionData, doc, setDoc, updateDoc
} from '@angular/fire/firestore';
import { Observable, of, delay, from, firstValueFrom } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { signal } from '@angular/core';
import { Profile } from '../models';

// Mock Firebase Firestore module functions
vi.mock('@angular/fire/firestore', () => ({
   Firestore: class { },
   collection: vi.fn(),
   collectionData: vi.fn(),
   doc: vi.fn(),
   setDoc: vi.fn(),
   updateDoc: vi.fn(),
}));

describe('StorageService', () => {
   let service: StorageService;
   const currentUserSignal = signal<any>(null);

   const mockAuthService = {
      currentUser: currentUserSignal,
      user$: of(null),
   };

   const mockNotificationService = {
      show: vi.fn(),
   };

   const fakeUser = { uid: 'user-123' };

   beforeEach(() => {
      vi.clearAllMocks();
      currentUserSignal.set(null);

      // Default mocks
      (collectionData as any).mockReturnValue(of([]));
      (setDoc as any).mockResolvedValue(undefined);

      TestBed.configureTestingModule({
         providers: [
            StorageService,
            { provide: AuthService, useValue: mockAuthService },
            { provide: NotificationService, useValue: mockNotificationService },
            { provide: Firestore, useValue: {} },
         ],
      });
      service = TestBed.inject(StorageService);
   });

   it('should be created', () => {
      expect(service).toBeTruthy();
   });

   describe('createProfile', () => {
      it('should generate a profile with the correct structure', async () => {
         currentUserSignal.set(fakeUser);

         const createdProfile = await firstValueFrom(service.createProfile('Luna', 8, '🚀'));

         expect(createdProfile).toBeDefined();
         expect(createdProfile.name).toBe('Luna');
         expect(createdProfile.age).toBe(8);
         expect(createdProfile.avatar).toBe('🚀');
         expect(createdProfile.totalStars).toBe(0);
         expect(createdProfile.progress).toHaveLength(10);
         // Verify each progress entry has correct structure
         createdProfile.progress.forEach((p, i) => {
            expect(p.tableId).toBe(i + 1);
            expect(p.basicCompleted).toBe(false);
            expect(p.advancedCompleted).toBe(false);
            expect(p.stars).toBe(0);
            expect(p.trainingCompleted).toBe(false);
            expect(p.failedMultipliers).toEqual([]);
         });
      });

      it('should call setDoc with the correct Firestore reference', () => {
         currentUserSignal.set(fakeUser);
         const mockCollectionRef = { type: 'collection' };
         const mockDocRef = { type: 'doc' };
         (collection as any).mockReturnValue(mockCollectionRef);
         (doc as any).mockReturnValue(mockDocRef);
         (setDoc as any).mockResolvedValue(undefined);

         service.createProfile('Luna', 8, '🚀').subscribe();

         expect(collection).toHaveBeenCalledWith({}, 'users/user-123/profiles');
         expect(doc).toHaveBeenCalledWith(mockCollectionRef, expect.any(String));
         expect(setDoc).toHaveBeenCalledWith(mockDocRef, expect.objectContaining({
            name: 'Luna',
            age: 8,
            avatar: '🚀',
         }));
      });

      it('should throw error if no user is logged in', () => {
         currentUserSignal.set(null);
         expect(() => service.createProfile('Luna', 8, '🚀')).toThrow('No user logged in');
      });
   });

   describe('selectProfile', () => {
      it('should set the active profile correctly', () => {
         const profiles: Profile[] = [
            { id: 'p1', name: 'Luna', age: 8, avatar: '🚀', totalStars: 5, progress: [] },
            { id: 'p2', name: 'Max', age: 10, avatar: '👽', totalStars: 10, progress: [] },
         ];
         service.profiles.set(profiles);

         service.selectProfile('p2');

         expect(service.activeProfile()).toEqual(profiles[1]);
      });

      it('should set activeProfile to null for a non-existent ID', () => {
         const profiles: Profile[] = [
            { id: 'p1', name: 'Luna', age: 8, avatar: '🚀', totalStars: 5, progress: [] },
         ];
         service.profiles.set(profiles);

         service.selectProfile('non-existent');

         expect(service.activeProfile()).toBeNull();
      });
   });

   describe('reactive behavior', () => {
      it('should load profiles when a user logs in', () => {
         const mockProfiles = [
            { id: 'p1', name: 'Luna', age: 8, avatar: '🚀', totalStars: 0, progress: [] },
         ];
         (collectionData as any).mockReturnValue(of(mockProfiles));

         // Simulate user login — the effect should trigger loadProfiles
         TestBed.flushEffects();

         currentUserSignal.set(fakeUser);
         TestBed.flushEffects();

         expect(service.profiles()).toEqual(mockProfiles);
         expect(service.loadingProfiles()).toBe(false);
      });

      it('should clear data when user logs out', () => {
         // First, set up some state
         service.profiles.set([
            { id: 'p1', name: 'Luna', age: 8, avatar: '🚀', totalStars: 5, progress: [] },
         ]);
         service.activeProfile.set({ id: 'p1', name: 'Luna', age: 8, avatar: '🚀', totalStars: 5, progress: [] });

         // Simulate logout — user becomes null
         currentUserSignal.set(null);
         TestBed.flushEffects();

         expect(service.profiles()).toEqual([]);
         expect(service.activeProfile()).toBeNull();
         expect(service.loadingProfiles()).toBe(false);
      });
   });

   describe('updateTrainingProgress', () => {
      const profileWithProgress: Profile = {
         id: 'p1',
         name: 'Luna',
         age: 8,
         avatar: '🚀',
         totalStars: 0,
         progress: Array.from({ length: 10 }, (_, i) => ({
            tableId: i + 1,
            basicCompleted: false,
            advancedCompleted: false,
            stars: 0,
            trainingCompleted: false,
            failedMultipliers: [] as number[],
         })),
      };

      it('should update the local profile with training completed', async () => {
         currentUserSignal.set(fakeUser);
         service.activeProfile.set({ ...profileWithProgress });
         const mockDocRef = { type: 'doc' };
         (doc as any).mockReturnValue(mockDocRef);
         (updateDoc as any).mockResolvedValue(undefined);

         service.updateTrainingProgress(3, true, [5, 8]).subscribe();

         const updated = service.activeProfile();
         const table3 = updated?.progress.find(p => p.tableId === 3);
         expect(table3?.trainingCompleted).toBe(true);
         expect(table3?.failedMultipliers).toEqual([5, 8]);
      });

      it('should call updateDoc with the correct Firestore data', () => {
         currentUserSignal.set(fakeUser);
         service.activeProfile.set({ ...profileWithProgress, progress: profileWithProgress.progress.map(p => ({ ...p })) });
         const mockDocRef = { type: 'doc' };
         (doc as any).mockReturnValue(mockDocRef);
         (updateDoc as any).mockResolvedValue(undefined);

         service.updateTrainingProgress(1, true, []).subscribe();

         expect(doc).toHaveBeenCalledWith({}, 'users/user-123/profiles/p1');
         expect(updateDoc).toHaveBeenCalledWith(mockDocRef, expect.objectContaining({
            progress: expect.any(Array),
         }));
      });

      it('should return of(undefined) if no user is logged in', () => {
         currentUserSignal.set(null);
         service.activeProfile.set(profileWithProgress);

         let result: any;
         service.updateTrainingProgress(1, true, []).subscribe(v => result = v);
         expect(result).toBeUndefined();
      });

      it('should return of(undefined) if no active profile', () => {
         currentUserSignal.set(fakeUser);
         service.activeProfile.set(null);

         let result: any;
         service.updateTrainingProgress(1, true, []).subscribe(v => result = v);
         expect(result).toBeUndefined();
      });
   });
});
