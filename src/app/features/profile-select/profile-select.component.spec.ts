import { render, screen, fireEvent } from '@testing-library/angular';
import { ProfileSelectComponent } from './profile-select.component';
import { StorageService } from '../../core/services/storage.service';
import { SoundService } from '../../core/services/sound.service';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { Profile } from '../../core/models';

describe('ProfileSelectComponent', () => {
   const profilesSignal = signal<Profile[]>([]);
   const loadingProfilesSignal = signal<boolean>(false);
   const activeProfileSignal = signal<Profile | null>(null);

   const mockStorageService = {
      profiles: profilesSignal,
      loadingProfiles: loadingProfilesSignal,
      activeProfile: activeProfileSignal,
      createProfile: vi.fn(),
      selectProfile: vi.fn(),
   };

   const mockSoundService = {
      play: vi.fn(),
   };

   const mockAuthService = {
      currentUser: signal(null),
      user$: of(null),
      logout: vi.fn(),
   };

   const mockRouter = {
      navigate: vi.fn(),
   };

   beforeEach(() => {
      vi.clearAllMocks();
      profilesSignal.set([]);
      loadingProfilesSignal.set(false);
      activeProfileSignal.set(null);
   });

   async function setup() {
      return await render(ProfileSelectComponent, {
         providers: [
            { provide: StorageService, useValue: mockStorageService },
            { provide: SoundService, useValue: mockSoundService },
            { provide: AuthService, useValue: mockAuthService },
            { provide: Router, useValue: mockRouter },
         ],
      });
   }

   it('should show loading state when profiles are loading', async () => {
      loadingProfilesSignal.set(true);
      await setup();
      expect(screen.getByText(/buscando comandantes/i)).toBeTruthy();
   });

   it('should show existing profiles with name, age, and stars', async () => {
      profilesSignal.set([
         { id: 'p1', name: 'Luna', age: 8, avatar: '🚀', totalStars: 15, progress: [] },
         { id: 'p2', name: 'Max', age: 10, avatar: '👽', totalStars: 25, progress: [] },
      ]);

      await setup();

      expect(screen.getByText('Luna')).toBeTruthy();
      expect(screen.getByText('Edad: 8')).toBeTruthy();
      expect(screen.getByText('15')).toBeTruthy();
      expect(screen.getByText('Max')).toBeTruthy();
      expect(screen.getByText('Edad: 10')).toBeTruthy();
      expect(screen.getByText('25')).toBeTruthy();
   });

   it('should always show the "New Commander" button', async () => {
      await setup();
      expect(screen.getByText(/nuevo comandante/i)).toBeTruthy();
   });

   it('should open the create modal when "New Commander" is clicked', async () => {
      const { fixture } = await setup();
      const button = screen.getByText(/nuevo comandante/i);

      fireEvent.click(button);
      fixture.detectChanges();

      expect(screen.getByText(/nuevo piloto/i)).toBeTruthy();
      expect(screen.getByRole('textbox')).toBeTruthy();
      expect(screen.getByRole('spinbutton')).toBeTruthy();
      expect(screen.getByText(/seleccionar avatar/i)).toBeTruthy();
      expect(screen.getByText(/crear piloto/i)).toBeTruthy();
   });

   it('should close the modal when the close button is clicked', async () => {
      const { fixture } = await setup();

      // Open modal
      fireEvent.click(screen.getByText(/nuevo comandante/i));
      fixture.detectChanges();
      expect(screen.getByText(/nuevo piloto/i)).toBeTruthy();

      // Close modal
      fireEvent.click(screen.getByText('✕'));
      fixture.detectChanges();

      expect(screen.queryByText(/nuevo piloto/i)).toBeNull();
   });

   it('should call createProfile when form is submitted with valid data', async () => {
      mockStorageService.createProfile.mockReturnValue(of({
         id: 'new-id', name: 'Luna', age: 8, avatar: '🚀', totalStars: 0, progress: [],
      }));
      const { fixture } = await setup();

      // Open modal
      fireEvent.click(screen.getByText(/nuevo comandante/i));
      fixture.detectChanges();

      // Set form values directly on the component instance (ngModel doesn't propagate from DOM without Zone.js)
      fixture.componentInstance.newName = 'Luna';
      fixture.componentInstance.newAge = 8;
      fixture.detectChanges();

      // Submit
      fireEvent.click(screen.getByText(/crear piloto/i));
      fixture.detectChanges();

      expect(mockSoundService.play).toHaveBeenCalledWith('click');
      expect(mockStorageService.createProfile).toHaveBeenCalledWith('Luna', 8, '🚀');
   });

   it('should close the modal after successful profile creation', async () => {
      mockStorageService.createProfile.mockReturnValue(of({
         id: 'new-id', name: 'Luna', age: 8, avatar: '🚀', totalStars: 0, progress: [],
      }));
      const { fixture } = await setup();

      // Open modal
      fireEvent.click(screen.getByText(/nuevo comandante/i));
      fixture.detectChanges();

      // Set name directly and submit
      fixture.componentInstance.newName = 'Luna';
      fixture.detectChanges();

      fireEvent.click(screen.getByText(/crear piloto/i));
      fixture.detectChanges();

      // Modal should close after creation
      expect(screen.queryByText(/nuevo piloto/i)).toBeNull();
   });

   it('should not call createProfile if name is empty', async () => {
      const { fixture } = await setup();

      // Open modal
      fireEvent.click(screen.getByText(/nuevo comandante/i));
      fixture.detectChanges();

      // Don't fill name, just submit
      fireEvent.click(screen.getByText(/crear piloto/i));
      fixture.detectChanges();

      expect(mockStorageService.createProfile).not.toHaveBeenCalled();
   });

   it('should navigate to /dashboard when a profile is selected', async () => {
      profilesSignal.set([
         { id: 'p1', name: 'Luna', age: 8, avatar: '🚀', totalStars: 15, progress: [] },
      ]);
      const { fixture } = await setup();

      fireEvent.click(screen.getByText('Luna'));
      fixture.detectChanges();

      expect(mockSoundService.play).toHaveBeenCalledWith('click');
      expect(mockStorageService.selectProfile).toHaveBeenCalledWith('p1');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
   });

   it('should logout and navigate to /login when Exit is clicked', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);
      const { fixture } = await setup();

      const exitButton = screen.getByText(/salir/i);
      fireEvent.click(exitButton);
      fixture.detectChanges();

      expect(mockSoundService.play).toHaveBeenCalledWith('click');

      // Wait for async logout
      await new Promise((r) => setTimeout(r, 0));

      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
   });
});
