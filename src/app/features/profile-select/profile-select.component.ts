import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Plus, Rocket, User, LogOut } from 'lucide-angular';
import { StorageService } from '../../core/services/storage.service';
import { SoundService } from '../../core/services/sound.service';
import { StarBackgroundComponent } from '../../shared/components/star-background.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile-select',
  imports: [CommonModule, FormsModule, LucideAngularModule, StarBackgroundComponent],
  template: `
    <app-star-background />
    <div class="min-h-screen p-8 max-w-6xl mx-auto relative">
      <div class="absolute top-4 right-4 z-10">
        <button (click)="logout()" class="p-2 text-white/60 hover:text-white flex flex-col items-center transition-colors">
          <lucide-icon [name]="LogOut" class="w-6 h-6"></lucide-icon>
          <span class="text-xs">Exit</span>
        </button>
      </div>

      <h1 class="text-4xl font-bold text-center text-accent mb-12 drop-shadow-md pt-8">
        Choose Your Commander
      </h1>

      @if (storage.loadingProfiles()) {
        <div class="flex flex-col items-center justify-center min-h-[400px]">
          <div class="animate-spin h-16 w-16 border-4 border-accent border-t-transparent rounded-full mb-4 shadow-[0_0_15px_rgba(234,179,8,0.5)]"></div>
          <p class="text-xl text-blue-200 animate-pulse">Scanning for Commanders...</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          @for (profile of profiles(); track profile.id) {
            <button
              (click)="selectProfile(profile.id)"
              class="juicy-button bg-white/10 backdrop-blur-md p-6 rounded-3xl border-2 border-white/10 hover:border-accent text-center group"
            >
              <div class="w-32 h-32 mx-auto mb-4 rounded-full bg-blue-500/30 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">
                {{ profile.avatar }}
              </div>
              <h2 class="text-2xl font-bold text-white mb-1">{{ profile.name }}</h2>
              <p class="text-blue-200">Age: {{ profile.age }}</p>
              <div class="mt-4 flex items-center justify-center gap-2 text-accent">
                <span class="text-xl">★</span>
                <span class="font-bold text-xl">{{ profile.totalStars }}</span>
              </div>
            </button>
          }

          <button
            (click)="showCreate.set(true)"
            class="juicy-button bg-white/5 backdrop-blur-sm p-6 rounded-3xl border-2 border-dashed border-white/20 hover:border-white/40 flex flex-col items-center justify-center gap-4 text-white/60 hover:text-white"
          >
            <div class="p-6 rounded-full bg-white/10">
              <lucide-icon [name]="Plus" class="w-12 h-12"></lucide-icon>
            </div>
            <span class="text-xl font-bold">New Commander</span>
          </button>
        </div>
      }

      @if (showCreate()) {
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div class="bg-primary border-4 border-accent p-8 rounded-[2rem] w-full max-w-md shadow-2xl relative">
            <button
              (click)="showCreate.set(false)"
              class="absolute top-4 right-4 text-white/40 hover:text-white"
            >✕</button>
            <h2 class="text-3xl font-bold text-accent mb-6">Enlist New Pilot</h2>

            <form (submit)="onCreateProfile()" class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-blue-100 mb-2">Name</label>
                <input
                  type="text"
                  [(ngModel)]="newName"
                  name="newName"
                  required
                  class="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/10 text-white outline-none focus:border-accent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-blue-100 mb-2">Age</label>
                <input
                  type="number"
                  [(ngModel)]="newAge"
                  name="newAge"
                  required
                  min="4"
                  max="14"
                  class="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/10 text-white outline-none focus:border-accent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-blue-100 mb-2">Select Avatar</label>
                <div class="flex justify-between gap-2">
                  @for (av of avatars; track av) {
                    <button
                      type="button"
                      (click)="selectedAvatar.set(av)"
                      [class.bg-accent]="selectedAvatar() === av"
                      class="text-4xl p-2 rounded-xl border-2 border-white/10 transition-colors"
                    >
                      {{ av }}
                    </button>
                  }
                </div>
              </div>

              <button
                type="submit"
                class="juicy-button w-full py-4 bg-accent text-primary font-bold text-xl shadow-[0_4px_0_0_#ca8a04]"
              >
                Create Pilot
              </button>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileSelectComponent {
  public storage = inject(StorageService);
  private sound = inject(SoundService);
  private router = inject(Router);
  private auth = inject(AuthService);

  readonly Plus = Plus;
  readonly Rocket = Rocket;
  readonly User = User;
  readonly LogOut = LogOut;

  profiles = this.storage.profiles;
  showCreate = signal(false);

  newName = '';
  newAge = 7;
  avatars = ['🚀', '👨‍🚀', '👽', '🤖', '🌟'];
  selectedAvatar = signal('🚀');

  onCreateProfile(): void {
    if (!this.newName) return;
    this.sound.play('click');
    this.storage.createProfile(this.newName, this.newAge, this.selectedAvatar()).subscribe(() => {
      this.showCreate.set(false);
      this.newName = '';
    });
  }

  selectProfile(id: string): void {
    this.sound.play('click');
    this.storage.selectProfile(id);
    this.router.navigate(['/dashboard']);
  }

  async logout(): Promise<void> {
    this.sound.play('click');
    await this.auth.logout();
    this.router.navigate(['/login']);
  }
}
