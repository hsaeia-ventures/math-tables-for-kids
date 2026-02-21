import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { StarBackgroundComponent } from '../../shared/components/star-background.component';
import { SoundService } from '../../core/services/sound.service';

@Component({
  selector: 'app-welcome',
  imports: [StarBackgroundComponent],
  template: `
    <app-star-background />
    <div class="min-h-screen flex flex-col items-center justify-center p-6 text-center">

      <!-- Hero Section -->
      <section class="animate-fade-in mb-12 flex flex-col items-center">
        <div class="mb-4 animate-float flex justify-center">
          <img src="/astro-math-logo.png" alt="AstroMath Logo" class="h-40 md:h-56 object-contain rounded-3xl border-2 border-yellow-400 shadow-[0_0_35px_rgba(250,204,21,0.5)] transition duration-500 hover:shadow-[0_0_50px_rgba(250,204,21,0.8)]" />
        </div>
        <h1 class="sr-only">AstroMath</h1>
        <p class="text-xl md:text-2xl text-blue-200 max-w-2xl leading-relaxed mt-2 mx-auto">
          Una aventura espacial donde aprender las tablas de multiplicar
          es tan emocionante como explorar las estrellas.
        </p>
      </section>

      <!-- Benefits Section -->
      <section class="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl w-full mb-14 animate-slide-up">
        <div class="benefit-card">
          <span class="text-4xl mb-3 block">🚀</span>
          <h3 class="text-lg font-bold text-accent mb-1">Misiones Espaciales</h3>
          <p class="text-blue-200 text-sm leading-relaxed">
            Cada tabla es un planeta por conquistar.
            ¡Avanza de misión en misión mientras aprendes!
          </p>
        </div>
        <div class="benefit-card">
          <span class="text-4xl mb-3 block">⭐</span>
          <h3 class="text-lg font-bold text-accent mb-1">Progreso Visible</h3>
          <p class="text-blue-200 text-sm leading-relaxed">
            Gana estrellas, desbloquea niveles y observa
            cómo crece tu conocimiento día a día.
          </p>
        </div>
        <div class="benefit-card">
          <span class="text-4xl mb-3 block">🧠</span>
          <h3 class="text-lg font-bold text-accent mb-1">Confianza Matemática</h3>
          <p class="text-blue-200 text-sm leading-relaxed">
            La práctica constante fortalece la seguridad.
            ¡Dominar las tablas nunca fue tan divertido!
          </p>
        </div>
        <div class="benefit-card">
          <span class="text-4xl mb-3 block">👨‍👩‍👧</span>
          <h3 class="text-lg font-bold text-accent mb-1">Para Toda la Familia</h3>
          <p class="text-blue-200 text-sm leading-relaxed">
            Crea perfiles para cada pequeño astronauta.
            Cada uno avanza a su propio ritmo.
          </p>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="animate-slide-up mb-10">
        <button
          (click)="goToLogin()"
          class="juicy-button px-12 py-5 bg-accent text-primary font-bold text-2xl shadow-[0_6px_0_0_#ca8a04] hover:shadow-[0_3px_0_0_#ca8a04] active:shadow-none translate-y-[-6px] active:translate-y-0"
        >
          🌟 ¡Comienza tu misión!
        </button>
      </section>

      <!-- Social Proof -->
      <p class="text-blue-200/50 text-sm italic animate-fade-in">
        Miles de pequeños astronautas ya están explorando el universo matemático.
      </p>
    </div>
  `,
  styles: `
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(-10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes slide-up {
      from { opacity: 0; transform: translateY(30px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(-12px); }
    }

    .animate-fade-in {
      animation: fade-in 0.8s ease-out both;
    }
    .animate-slide-up {
      animation: slide-up 0.8s ease-out 0.3s both;
    }
    .animate-float {
      animation: float 3s ease-in-out infinite;
    }

    .benefit-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 1.5rem;
      padding: 1.5rem;
      transition: all 0.3s ease;
    }
    .benefit-card:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(250, 204, 21, 0.4);
      transform: translateY(-4px);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomeComponent {
  private router = inject(Router);
  private sound = inject(SoundService);

  goToLogin(): void {
    this.sound.play('click');
    this.router.navigate(['/login']);
  }
}
