import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { of, Observable } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { firstValueFrom } from 'rxjs';

describe('authGuard', () => {
   const mockRouter = {
      navigate: vi.fn(),
   };

   const mockAuthService: {
      user$: Observable<{ uid: string; email: string } | null>;
   } = {
      user$: of(null),
   };

   const dummyRoute = {} as ActivatedRouteSnapshot;
   const dummyState = {} as RouterStateSnapshot;

   beforeEach(() => {
      vi.clearAllMocks();

      TestBed.configureTestingModule({
         providers: [
            { provide: Router, useValue: mockRouter },
            { provide: AuthService, useValue: mockAuthService },
         ],
      });
   });

   it('should allow access when user is authenticated', async () => {
      mockAuthService.user$ = of({ uid: 'user-123', email: 'test@test.com' });

      const result = TestBed.runInInjectionContext(() =>
         authGuard(dummyRoute, dummyState)
      );

      const canActivate = await firstValueFrom(result as any);
      expect(canActivate).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
   });

   it('should redirect to /welcome when user is not authenticated', async () => {
      mockAuthService.user$ = of(null);

      const result = TestBed.runInInjectionContext(() =>
         authGuard(dummyRoute, dummyState)
      );

      const canActivate = await firstValueFrom(result as any);
      expect(canActivate).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/welcome']);
   });
});
