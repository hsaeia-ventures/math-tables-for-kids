import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StorageService } from '../../core/services/storage.service';
import { SoundService } from '../../core/services/sound.service';
import { StarBackgroundComponent } from '../../shared/components/star-background.component';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, StarBackgroundComponent],
  template: `
    <app-star-background />
    <div class="min-h-screen flex items-center justify-center p-4">
      <div
        class="bg-white/10 backdrop-blur-md p-8 rounded-3xl border-2 border-white/20 w-full max-w-md text-center shadow-2xl"
      >
        <h1 class="text-5xl font-bold mb-2 text-accent drop-shadow-lg">AstroMath</h1>
        <p class="text-blue-200 mb-8 text-lg">Ready for your math mission?</p>

        <form (submit)="onSubmit()" class="space-y-6">
          <div>
            <label for="email" class="block text-left text-sm font-medium text-blue-100 mb-2">
              Commander Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="email"
              required
              placeholder="e.g. explorer@space.com"
              class="w-full px-6 py-4 rounded-2xl bg-white/20 border-2 border-white/10 text-white placeholder-white/40 focus:border-accent outline-none transition-all text-lg"
            />
          </div>

          <button
            type="submit"
            [disabled]="loading"
            class="juicy-button w-full py-4 bg-accent text-primary font-bold text-xl shadow-[0_4px_0_0_#ca8a04] hover:shadow-[0_2px_0_0_#ca8a04] active:shadow-none translate-y-[-4px] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            @if (loading) {
              Powering Up...
            } @else {
              Blast Off!
            }
          </button>
        </form>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private storage = inject(StorageService);
  private sound = inject(SoundService);
  private router = inject(Router);

  email = '';
  loading = false;

  onSubmit(): void {
    if (!this.email) return;

    this.loading = true;
    this.sound.play('click');

    this.storage.login(this.email).subscribe({
      next: () => {
        this.router.navigate(['/profile-select']);
        this.loading = false;
      }
    });
  }
}
