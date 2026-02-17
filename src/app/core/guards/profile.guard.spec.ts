import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { profileGuard } from './profile.guard';
import { StorageService } from '../services/storage.service';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { signal } from '@angular/core';
import { Profile } from '../models';

describe('profileGuard', () => {
   const mockRouter = {
      navigate: vi.fn(),
   };

   const activeProfileSignal = signal<Profile | null>(null);

   const mockStorageService = {
      activeProfile: activeProfileSignal,
   };

   const dummyRoute = {} as ActivatedRouteSnapshot;
   const dummyState = {} as RouterStateSnapshot;

   beforeEach(() => {
      vi.clearAllMocks();
      activeProfileSignal.set(null);

      TestBed.configureTestingModule({
         providers: [
            { provide: Router, useValue: mockRouter },
            { provide: StorageService, useValue: mockStorageService },
         ],
      });
   });

   it('should allow access when a profile is selected', () => {
      activeProfileSignal.set({
         id: 'p1',
         name: 'Luna',
         age: 8,
         avatar: '🚀',
         totalStars: 10,
         progress: [],
      });

      const result = TestBed.runInInjectionContext(() =>
         profileGuard(dummyRoute, dummyState)
      );

      expect(result).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
   });

   it('should redirect to /profile-select when no profile is selected', () => {
      activeProfileSignal.set(null);

      const result = TestBed.runInInjectionContext(() =>
         profileGuard(dummyRoute, dummyState)
      );

      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/profile-select']);
   });
});
