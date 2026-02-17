import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SoundService } from '../../core/services/sound.service';
import { NotificationService } from '../../core/services/notification.service';
import { StarBackgroundComponent } from '../../shared/components/star-background.component';

@Component({
  selector: 'app-login',
  imports: [CommonModule, StarBackgroundComponent],
  template: `
    <app-star-background />
    <div class="min-h-screen flex items-center justify-center p-4">
      <div
        class="bg-white/10 backdrop-blur-md p-8 rounded-3xl border-2 border-white/20 w-full max-w-md text-center shadow-2xl"
      >
        <h1 class="text-5xl font-bold mb-2 text-accent drop-shadow-lg">AstroMath</h1>
        <p class="text-blue-200 mb-8 text-lg">Ready for your math mission?</p>

        <div class="space-y-6">
          <button
            (click)="loginWithGoogle()"
            [disabled]="loading()"
            class="juicy-button w-full py-4 bg-white text-gray-800 font-bold text-xl flex items-center justify-center gap-3 shadow-[0_4px_0_0_#d1d5db] hover:shadow-[0_2px_0_0_#d1d5db] active:shadow-none translate-y-[-4px] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            @if (loading()) {
              <div class="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              Powering Up...
            } @else {
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" class="w-6 h-6" alt="Google Logo">
              Commander Sign-in
            }
          </button>
          
          <p class="text-blue-200/60 text-sm mt-4 italic">
            Signing in will automatically create your mission log if it's your first time.
          </p>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private sound = inject(SoundService);
  private notify = inject(NotificationService);
  private router = inject(Router);

  loading = signal(false);

  async loginWithGoogle(): Promise<void> {
    this.loading.set(true);
    this.sound.play('click');

    try {
      await this.auth.signInWithGoogle();
      this.router.navigate(['/profile-select']);
    } catch (error) {
      console.error('Login failed', error);
      this.notify.show('No se pudo iniciar sesión. Inténtalo de nuevo.', 'error');
    } finally {
      this.loading.set(false);
    }
  }
}
