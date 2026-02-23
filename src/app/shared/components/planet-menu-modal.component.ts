import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Crosshair, Rocket, X } from 'lucide-angular';

@Component({
   selector: 'app-planet-menu-modal',
   imports: [CommonModule, LucideAngularModule],
   template: `
    @if (isOpen()) {
      <!-- Overlay -->
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        (click)="onOverlayClick($event)"
        id="planet-menu-overlay"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"></div>

        <!-- Modal Card -->
        <div class="relative z-10 w-full max-w-sm animate-modal-in" id="planet-menu-card">

          <!-- Close Button -->
          <button
            (click)="closeModal.emit()"
            class="absolute -top-3 -right-3 z-20 w-10 h-10 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
            id="planet-menu-close-btn"
          >
            <lucide-icon [name]="X" class="w-5 h-5 text-white/80"></lucide-icon>
          </button>

          <div class="bg-white/10 backdrop-blur-md rounded-[2.5rem] border-2 border-white/15 shadow-2xl overflow-hidden">

            <!-- Header -->
            <div class="p-6 pb-4 text-center" [style.background]="planetColor()">
              <div class="text-5xl mb-2">{{ planetEmoji() }}</div>
              <h3 class="text-2xl font-bold text-white drop-shadow-md">{{ tableName() }}</h3>
            </div>

            <!-- Mode options -->
            <div class="p-6 flex flex-col gap-4">

              <!-- Training Option -->
              <button
                (click)="selectMode.emit('training')"
                class="juicy-button w-full flex items-center gap-4 p-5 rounded-2xl bg-indigo-500/20 border-2 border-indigo-400/30 hover:border-indigo-400/60 hover:bg-indigo-500/30 transition-all text-left group"
                id="planet-menu-training-btn"
              >
                <div class="w-14 h-14 rounded-2xl bg-indigo-500/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <lucide-icon [name]="Crosshair" class="w-7 h-7 text-indigo-300"></lucide-icon>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-lg text-white">Entrenar</span>
                    @if (trainingCompleted()) {
                      <span class="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full font-bold border border-success/30" id="training-completed-badge">
                        ✅ Completado
                      </span>
                    }
                  </div>
                  <p class="text-sm text-blue-200/70 mt-0.5">Simulador de vuelo · Aprende paso a paso</p>
                </div>
              </button>

              <!-- Mission Option -->
              <button
                (click)="selectMode.emit('mission')"
                class="juicy-button w-full flex items-center gap-4 p-5 rounded-2xl bg-accent/10 border-2 border-accent/30 hover:border-accent/60 hover:bg-accent/20 transition-all text-left group"
                id="planet-menu-mission-btn"
              >
                <div class="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <lucide-icon [name]="Rocket" class="w-7 h-7 text-accent"></lucide-icon>
                </div>
                <div class="flex-1 min-w-0">
                  <span class="font-bold text-lg text-white">Misión Real</span>
                  <p class="text-sm text-blue-200/70 mt-0.5">¡Demuestra lo que sabes!</p>
                </div>
              </button>

              <!-- Encouragement to train -->
              @if (!trainingCompleted()) {
                <p class="text-xs text-center text-blue-300/50 mt-1" id="training-suggestion">
                  💡 Entrenar antes de la misión te ayudará a tener mejores resultados
                </p>
              }

            </div>
          </div>
        </div>
      </div>
    }
  `,
   styles: `
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes modal-in {
      from {
        opacity: 0;
        transform: scale(0.85) translateY(20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    .animate-fade-in {
      animation: fade-in 0.2s ease-out forwards;
    }
    .animate-modal-in {
      animation: modal-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
  `,
   changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanetMenuModalComponent {
   tableId = input.required<number>();
   tableName = input.required<string>();
   planetEmoji = input.required<string>();
   planetColor = input.required<string>();
   trainingCompleted = input<boolean>(false);
   isOpen = input<boolean>(false);

   selectMode = output<'training' | 'mission'>();
   closeModal = output<void>();

   readonly Crosshair = Crosshair;
   readonly Rocket = Rocket;
   readonly X = X;

   onOverlayClick(event: MouseEvent): void {
      const target = event.target as HTMLElement;
      if (target.id === 'planet-menu-overlay') {
         this.closeModal.emit();
      }
   }
}
