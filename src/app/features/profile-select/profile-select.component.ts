import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Plus, Rocket, User, LogOut } from 'lucide-angular';
import { StorageService } from '../../core/services/storage.service';
import { SoundService } from '../../core/services/sound.service';
import { StarBackgroundComponent } from '../../shared/components/star-background.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile-select',
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, StarBackgroundComponent],
  template: `
    <app-star-background />
    <div class="min-h-screen p-8 max-w-6xl mx-auto relative">
      <div class="absolute top-4 right-4 z-10">
        <button (click)="logout()" class="p-2 text-white/60 hover:text-white flex flex-col items-center transition-colors">
          <lucide-icon [name]="LogOut" class="w-6 h-6"></lucide-icon>
          <span class="text-xs">Salir</span>
        </button>
      </div>

      <h1 class="text-4xl font-bold text-center text-accent mb-12 drop-shadow-md pt-8">
        Elige tu Comandante
      </h1>

      @if (storage.loadingProfiles()) {
        <div class="flex flex-col items-center justify-center min-h-[400px]">
          <div class="animate-spin h-16 w-16 border-4 border-accent border-t-transparent rounded-full mb-4 shadow-[0_0_15px_rgba(234,179,8,0.5)]"></div>
          <p class="text-xl text-blue-200 animate-pulse">Buscando Comandantes...</p>
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
              <p class="text-blue-200">Edad: {{ profile.age }}</p>
              <div class="mt-4 flex items-center justify-center gap-2 text-accent">
                <span class="text-xl">★</span>
                <span class="font-bold text-xl">{{ profile.totalStars }}</span>
              </div>
            </button>
          }

          <button
            (click)="openCreateModal()"
            class="juicy-button bg-white/5 backdrop-blur-sm p-6 rounded-3xl border-2 border-dashed border-white/20 hover:border-white/40 flex flex-col items-center justify-center gap-4 text-white/60 hover:text-white"
          >
            <div class="p-6 rounded-full bg-white/10">
              <lucide-icon [name]="Plus" class="w-12 h-12"></lucide-icon>
            </div>
            <span class="text-xl font-bold">Nuevo Comandante</span>
          </button>
        </div>
      }

      @if (showCreate()) {
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div class="bg-primary border-4 border-accent p-8 rounded-[2rem] w-full max-w-md shadow-2xl relative">
            <button
              (click)="closeCreateModal()"
              class="absolute top-4 right-4 text-white/40 hover:text-white"
            >✕</button>
            <h2 class="text-3xl font-bold text-accent mb-6">Nuevo Piloto</h2>

            <form [formGroup]="profileForm" (ngSubmit)="onCreateProfile()" class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-blue-100 mb-2">Nombre</label>
                <input
                  type="text"
                  formControlName="name"
                  class="w-full px-4 py-3 rounded-xl bg-white/10 border-2 text-white outline-none transition-colors"
                  [class]="profileForm.get('name')!.invalid && profileForm.get('name')!.touched ? 'border-red-400 focus:border-red-400' : 'border-white/10 focus:border-accent'"
                />
                @if (profileForm.get('name')!.touched && profileForm.get('name')!.invalid) {
                  <div class="mt-1 text-sm text-red-400">
                    @if (profileForm.get('name')!.hasError('required')) {
                      El nombre es obligatorio.
                    } @else if (profileForm.get('name')!.hasError('minlength')) {
                      Mínimo 2 caracteres.
                    } @else if (profileForm.get('name')!.hasError('maxlength')) {
                      Máximo 20 caracteres.
                    }
                  </div>
                }
              </div>
              <div>
                <label class="block text-sm font-medium text-blue-100 mb-2">Edad</label>
                <input
                  type="number"
                  formControlName="age"
                  class="w-full px-4 py-3 rounded-xl bg-white/10 border-2 text-white outline-none transition-colors"
                  [class]="profileForm.get('age')!.invalid && profileForm.get('age')!.touched ? 'border-red-400 focus:border-red-400' : 'border-white/10 focus:border-accent'"
                />
                @if (profileForm.get('age')!.touched && profileForm.get('age')!.invalid) {
                  <div class="mt-1 text-sm text-red-400">
                    @if (profileForm.get('age')!.hasError('required')) {
                      La edad es obligatoria.
                    } @else if (profileForm.get('age')!.hasError('min')) {
                      Edad mínima: 4 años.
                    } @else if (profileForm.get('age')!.hasError('max')) {
                      Edad máxima: 14 años.
                    }
                  </div>
                }
              </div>
              <div>
                <label class="block text-sm font-medium text-blue-100 mb-2">Seleccionar Avatar</label>
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
                [disabled]="profileForm.invalid"
                class="juicy-button w-full py-4 bg-accent text-primary font-bold text-xl shadow-[0_4px_0_0_#ca8a04] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Crear Piloto
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
  private fb = inject(FormBuilder);

  readonly Plus = Plus;
  readonly Rocket = Rocket;
  readonly User = User;
  readonly LogOut = LogOut;

  profiles = this.storage.profiles;
  showCreate = signal(false);

  avatars = ['🚀', '👨‍🚀', '👽', '🤖', '🌟'];
  selectedAvatar = signal('🚀');

  profileForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
    age: [7, [Validators.required, Validators.min(4), Validators.max(14)]],
  });

  openCreateModal(): void {
    this.profileForm.reset({ name: '', age: 7 });
    this.selectedAvatar.set('🚀');
    this.showCreate.set(true);
  }

  closeCreateModal(): void {
    this.showCreate.set(false);
  }

  onCreateProfile(): void {
    if (this.profileForm.invalid) return;
    const { name, age } = this.profileForm.getRawValue();
    this.sound.play('click');
    this.storage.createProfile(name!, age!, this.selectedAvatar()).subscribe(() => {
      this.showCreate.set(false);
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
