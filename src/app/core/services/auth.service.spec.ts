import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { Auth, signInWithPopup, signOut, authState, GoogleAuthProvider } from '@angular/fire/auth';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock Firebase Auth module functions
vi.mock('@angular/fire/auth', () => ({
   Auth: class { },
   GoogleAuthProvider: class { },
   signInWithPopup: vi.fn(),
   signOut: vi.fn(),
   authState: vi.fn(),
}));

describe('AuthService', () => {
   let service: AuthService;
   let mockAuth: any;

   beforeEach(() => {
      mockAuth = new (class { })();
      // Default authState to null (not logged in)
      (authState as any).mockReturnValue(of(null));

      TestBed.configureTestingModule({
         providers: [
            AuthService,
            { provide: Auth, useValue: mockAuth },
         ],
      });
      service = TestBed.inject(AuthService);
      vi.clearAllMocks();
   });

   it('should be created', () => {
      expect(service).toBeTruthy();
   });

   describe('signInWithGoogle', () => {
      it('should call signInWithPopup with GoogleAuthProvider', async () => {
         await service.signInWithGoogle();
         expect(signInWithPopup).toHaveBeenCalledWith(mockAuth, expect.any(GoogleAuthProvider));
      });

      it('should propagate errors from signInWithPopup', async () => {
         const error = new Error('Popup closed');
         (signInWithPopup as any).mockRejectedValueOnce(error);

         await expect(service.signInWithGoogle()).rejects.toThrow('Popup closed');
      });
   });

   describe('logout', () => {
      it('should call signOut', async () => {
         await service.logout();
         expect(signOut).toHaveBeenCalledWith(mockAuth);
      });
   });

   describe('currentUser', () => {
      it('should reflect initial auth state', () => {
         // Since authState is mocked to return of(null) in beforeEach
         // The signal should be null/undefined initially or after first emission
         // Note: toSignal might need specific handling or just rely on TestBed
         const initialUser = service.currentUser();
         expect(initialUser).toBeFalsy();
      });
   });
});
