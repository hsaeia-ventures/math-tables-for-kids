import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Lock, Star, LogOut } from 'lucide-angular';
import { StorageService } from '../../core/services/storage.service';
import { AuthService } from '../../core/services/auth.service';
import { SoundService } from '../../core/services/sound.service';
import { StarBackgroundComponent } from '../../shared/components/star-background.component';
import { PlanetMenuModalComponent } from '../../shared/components/planet-menu-modal.component';

interface PlanetData {
  tableId: number;
  basicCompleted: boolean;
  advancedCompleted: boolean;
  stars: number;
  trainingCompleted?: boolean;
  color: string;
  emoji: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, LucideAngularModule, StarBackgroundComponent, PlanetMenuModalComponent],
  template: `
    <app-star-background />
    <div class="min-h-screen p-6 max-w-7xl mx-auto">
      <header class="flex justify-between items-center mb-12">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-4xl shadow-lg border-2 border-white/20">
            {{ activeProfile()?.avatar }}
          </div>
          <div>
            <h2 class="text-2xl font-bold">{{ activeProfile()?.name }}</h2>
            <div class="flex items-center text-accent font-bold">
               <lucide-icon [name]="Star" class="w-4 h-4 mr-1 fill-accent"></lucide-icon>
               {{ activeProfile()?.totalStars }} Estrellas
            </div>
          </div>
        </div>

        <button (click)="logout()" class="p-2 text-white/60 hover:text-white flex flex-col items-center">
          <lucide-icon [name]="LogOut" class="w-6 h-6"></lucide-icon>
          <span class="text-xs">Salir</span>
        </button>
      </header>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
        @for (planet of planets(); track planet.tableId) {
          <div class="relative group">
            <button
              (click)="openPlanetMenu(planet)"
              class="juicy-button w-full flex flex-col items-center gap-4 p-6 rounded-[2.5rem] bg-white/5 border-2 border-white/10 hover:border-accent hover:bg-white/10 transition-all"
              [attr.id]="'planet-btn-' + planet.tableId"
            >
              <div
                class="w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-xl relative animate-float transition-transform group-hover:scale-110"
                [style.background]="planet.color"
              >
                {{ planet.emoji }}
                @if (planet.stars > 0) {
                  <div class="absolute -top-2 -right-2 bg-accent text-primary px-2 py-1 rounded-full text-sm font-bold flex items-center">
                    ★ {{ planet.stars }}
                  </div>
                }
                @if (planet.trainingCompleted) {
                  <div class="absolute -bottom-1 -left-1 bg-indigo-500 text-white w-7 h-7 rounded-full text-sm font-bold flex items-center justify-center border-2 border-primary shadow-md training-badge">
                    🎯
                  </div>
                }
              </div>
              <div class="text-center">
                <h3 class="text-xl font-bold">Tabla {{ planet.tableId }}</h3>
                <p class="text-xs text-blue-200 uppercase tracking-widest mt-1">
                  {{ getPlanetStatus(planet) }}
                </p>
              </div>
            </button>

            @if (planet.tableId > 1 && !isPreviousCompleted(planet.tableId)) {
              <div class="absolute inset-0 bg-primary/80 backdrop-blur-[2px] rounded-[2.5rem] flex items-center justify-center z-10">
                <lucide-icon [name]="Lock" class="w-10 h-10 text-white/50"></lucide-icon>
              </div>
            }
          </div>
        }
      </div>
    </div>

    <!-- Planet Menu Modal -->
    @if (showPlanetMenu() && selectedPlanet(); as planet) {
      <app-planet-menu-modal
        [tableId]="planet.tableId"
        [tableName]="'Tabla ' + planet.tableId"
        [planetEmoji]="planet.emoji"
        [planetColor]="planet.color"
        [trainingCompleted]="planet.trainingCompleted ?? false"
        [isOpen]="showPlanetMenu()"
        (selectMode)="onSelectMode($event)"
        (closeModal)="closePlanetMenu()"
      />
    }
  `,
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private storage = inject(StorageService);
  private auth = inject(AuthService);
  private sound = inject(SoundService);
  private router = inject(Router);

  readonly Star = Star;
  readonly Lock = Lock;
  readonly LogOut = LogOut;

  activeProfile = this.storage.activeProfile;

  showPlanetMenu = signal(false);
  selectedPlanet = signal<PlanetData | null>(null);

  planets = computed(() => {
    const profile = this.activeProfile();
    if (!profile) return [];

    const colors = [
      'linear-gradient(135deg, #f87171, #ef4444)',
      'linear-gradient(135deg, #fb923c, #f97316)',
      'linear-gradient(135deg, #fbbf24, #f59e0b)',
      'linear-gradient(135deg, #a3e635, #84cc16)',
      'linear-gradient(135deg, #4ade80, #22c55e)',
      'linear-gradient(135deg, #2dd4bf, #14b8a6)',
      'linear-gradient(135deg, #38bdf8, #0ea5e9)',
      'linear-gradient(135deg, #818cf8, #6366f1)',
      'linear-gradient(135deg, #c084fc, #a855f7)',
      'linear-gradient(135deg, #f472b6, #ec4899)',
    ];

    const emojis = ['🌡️', '🏜️', '🌱', '💧', '🍃', '🌊', '❄️', '🪐', '🔮', '⚛️'];

    return profile.progress.map((p, i) => ({
      ...p,
      color: colors[i],
      emoji: emojis[i],
    }));
  });

  isPreviousCompleted(tableId: number): boolean {
    if (tableId === 1) return true;
    const prev = this.activeProfile()?.progress.find(p => p.tableId === tableId - 1);
    return prev?.basicCompleted ?? false;
  }

  getPlanetStatus(planet: PlanetData): string {
    if (planet.basicCompleted && planet.advancedCompleted) return 'Dominada';
    if (planet.basicCompleted) return 'Avanzado';
    if (planet.trainingCompleted) return 'Entrenada';
    return 'Sin explorar';
  }

  openPlanetMenu(planet: PlanetData): void {
    if (planet.tableId > 1 && !this.isPreviousCompleted(planet.tableId)) return;
    this.sound.play('click');
    this.selectedPlanet.set(planet);
    this.showPlanetMenu.set(true);
  }

  onSelectMode(mode: 'training' | 'mission'): void {
    const planet = this.selectedPlanet();
    if (!planet) return;
    this.sound.play('click');
    this.showPlanetMenu.set(false);
    if (mode === 'training') {
      this.router.navigate(['/training', planet.tableId]);
    } else {
      this.router.navigate(['/exercise', planet.tableId]);
    }
  }

  closePlanetMenu(): void {
    this.showPlanetMenu.set(false);
    this.selectedPlanet.set(null);
  }

  async logout(): Promise<void> {
    this.sound.play('click');
    await this.auth.logout();
    this.router.navigate(['/login']);
  }
}

