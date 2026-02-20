import { render, screen, fireEvent } from '@testing-library/angular';
import { WelcomeComponent } from './welcome.component';
import { SoundService } from '../../core/services/sound.service';
import { Router } from '@angular/router';
import { vi, describe, it, beforeEach } from 'vitest';

describe('WelcomeComponent', () => {
   const mockSoundService = {
      play: vi.fn(),
   };

   const mockRouter = {
      navigate: vi.fn(),
   };

   beforeEach(() => {
      vi.clearAllMocks();
   });

   async function setup() {
      return await render(WelcomeComponent, {
         providers: [
            { provide: SoundService, useValue: mockSoundService },
            { provide: Router, useValue: mockRouter },
         ],
      });
   }

   it('should render the AstroMath title', async () => {
      await setup();
      expect(screen.getByText('AstroMath')).toBeTruthy();
   });

   it('should render motivational description text', async () => {
      await setup();
      expect(screen.getByText(/aventura espacial/i)).toBeTruthy();
   });

   it('should render the four benefit cards', async () => {
      await setup();
      expect(screen.getByText(/misiones espaciales/i)).toBeTruthy();
      expect(screen.getByText(/progreso visible/i)).toBeTruthy();
      expect(screen.getByText(/confianza matemática/i)).toBeTruthy();
      expect(screen.getByText(/para toda la familia/i)).toBeTruthy();
   });

   it('should navigate to /login when CTA button is clicked', async () => {
      await setup();
      const ctaButton = screen.getByRole('button', { name: /comienza tu misión/i });
      expect(ctaButton).toBeTruthy();

      fireEvent.click(ctaButton);

      expect(mockSoundService.play).toHaveBeenCalledWith('click');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
   });
});
