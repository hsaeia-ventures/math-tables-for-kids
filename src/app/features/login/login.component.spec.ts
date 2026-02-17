import { render, screen, fireEvent } from '@testing-library/angular';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';
import { SoundService } from '../../core/services/sound.service';
import { Router } from '@angular/router';
import { vi, describe, it, beforeEach } from 'vitest';

describe('LoginComponent', () => {
   const mockAuthService = {
      signInWithGoogle: vi.fn(),
   };

   const mockSoundService = {
      play: vi.fn(),
   };

   const mockRouter = {
      navigate: vi.fn(),
   };

   // Reset mocks between tests to prevent cross-test contamination
   beforeEach(() => {
      vi.clearAllMocks();
   });

   async function setup() {
      return await render(LoginComponent, {
         providers: [
            { provide: AuthService, useValue: mockAuthService },
            { provide: SoundService, useValue: mockSoundService },
            { provide: Router, useValue: mockRouter },
         ],
      });
   }

   it('should render the login button', async () => {
      await setup();
      const button = screen.getByRole('button', { name: /commander sign-in/i });
      expect(button).toBeTruthy();
   });

   it('should trigger login flow when button is clicked', async () => {
      // Arrange: create a controllable promise so we can check intermediate state
      let resolveLogin!: () => void;
      const loginPromise = new Promise<void>((resolve) => { resolveLogin = resolve; });
      mockAuthService.signInWithGoogle.mockReturnValue(loginPromise);
      const { fixture } = await setup();
      const button = screen.getByRole('button', { name: /commander sign-in/i });

      // Act: click the button
      fireEvent.click(button);
      fixture.detectChanges();

      // Assert: Check immediate UI feedback (loading state)
      expect(mockSoundService.play).toHaveBeenCalledWith('click');
      expect(screen.getByText(/powering up/i)).toBeTruthy();

      // Now resolve the promise to complete the login flow
      resolveLogin();
      // Flush the microtask queue so the async function's finally block runs
      await loginPromise;
      // Allow one more microtask tick for the finally block
      await new Promise((r) => setTimeout(r, 0));
      fixture.detectChanges();

      // Assert: Check service call and navigation
      expect(mockAuthService.signInWithGoogle).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/profile-select']);
   });

   it('should stop loading if login fails', async () => {
      // Arrange: create a controllable promise that will reject
      let rejectLogin!: (err: Error) => void;
      const loginPromise = new Promise<void>((_, reject) => { rejectLogin = reject; });
      mockAuthService.signInWithGoogle.mockReturnValue(loginPromise);
      const { fixture } = await setup();
      const button = screen.getByRole('button', { name: /commander sign-in/i });

      // Act: click the button
      fireEvent.click(button);
      fixture.detectChanges();

      // The loading state should be active
      expect(screen.getByText(/powering up/i)).toBeTruthy();

      // Reject the promise to simulate login failure
      rejectLogin(new Error('Login Failed'));
      // Flush the microtask/catch/finally chain
      try { await loginPromise; } catch { /* expected rejection */ }
      await new Promise((r) => setTimeout(r, 0));
      fixture.detectChanges();

      // Assert: loading should be false, button should be back
      expect(screen.queryByText(/powering up/i)).toBeNull();
      expect(screen.getByRole('button', { name: /commander sign-in/i })).toBeTruthy();
      // Navigation should not happen on failure
      expect(mockRouter.navigate).not.toHaveBeenCalled();
   });
});

