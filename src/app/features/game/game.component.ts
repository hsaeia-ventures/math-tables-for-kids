import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, ChevronLeft, Star, Heart, Trophy, Rocket } from 'lucide-angular';
import { StorageService } from '../../core/services/storage.service';
import { SoundService } from '../../core/services/sound.service';
import { GameService } from '../../core/services/game.service';
import { GameQuestion, GameResult } from '../../core/models';
import { StarBackgroundComponent } from '../../shared/components/star-background.component';

@Component({
  selector: 'app-game',
  imports: [CommonModule, FormsModule, LucideAngularModule, StarBackgroundComponent],
  template: `
    <app-star-background />
    <div class="min-h-screen p-6 flex flex-col items-center">
      <!-- Header -->
      <div class="w-full max-w-4xl flex justify-between items-center mb-12">
        <button (click)="goBack()" class="p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors">
          <lucide-icon [name]="ChevronLeft" class="w-6 h-6"></lucide-icon>
        </button>

        <div class="flex-1 mx-8 h-4 bg-white/10 rounded-full overflow-hidden border-2 border-white/5">
          <div
            class="h-full bg-accent transition-all duration-500 shadow-[0_0_15px_rgba(250,204,21,0.5)]"
            [style.width.%]="progress()"
          ></div>
        </div>

        <div class="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl border-2 border-white/5">
          <lucide-icon [name]="Heart" [class]="lives() > 0 ? 'text-error fill-error' : 'text-white/20'" class="w-6 h-6"></lucide-icon>
          <span class="text-xl font-bold">{{ lives() }}</span>
        </div>
      </div>

      @if (!isFinished()) {
        <!-- Game Content -->
        @if (currentQuestion(); as q) {
          <div class="w-full max-w-2xl bg-white/10 backdrop-blur-md rounded-[3rem] p-12 text-center border-4 border-white/10 shadow-2xl relative overflow-hidden">
            <h2 class="text-2xl text-blue-200 uppercase tracking-[0.3em] mb-6 font-bold">Pregunta {{ currentIndex() + 1 }} de 10</h2>
            <div class="text-7xl font-bold mb-12 text-white drop-shadow-md" translate="no">
              {{ q.text }}
            </div>

            @if (feedback()) {
              <div
                [class]="feedback() === 'correct' ? 'text-success' : 'text-error'"
                class="absolute inset-0 bg-primary/90 flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-300 z-20"
              >
                <div class="text-6xl mb-4">
                  {{ feedback() === 'correct' ? '🌟 ¡GENIAL!' : '☄️ ¡UPS!' }}
                </div>
                <div class="text-2xl text-white mb-8">
                  {{ feedback() === 'correct' ? '¡Cálculo perfecto, Comandante!' : 'La respuesta correcta era ' }}<span translate="no">{{ feedback() !== 'correct' ? q.answer : '' }}</span>
                </div>
                <button
                  (click)="nextQuestion()"
                  class="juicy-button px-10 py-4 bg-white text-primary font-bold text-xl"
                >
                  Continuar Misión
                </button>
              </div>
            }

            @if (q.type === 'button') {
              <div class="grid grid-cols-2 gap-6">
                @for (opt of q.options; track opt) {
                  <button
                    (click)="checkAnswer(opt)"
                    [disabled]="!!feedback()"
                    class="juicy-button py-8 text-4xl font-bold rounded-3xl bg-white/10 border-4 border-white/5 hover:border-accent hover:bg-accent/20 transition-all text-white active:bg-accent active:text-primary"
                    translate="no"
                  >
                    {{ opt }}
                  </button>
                }
              </div>
            } @else {
              <div class="flex flex-col items-center gap-6">
                <input
                  type="number"
                  [(ngModel)]="userInput"
                  (keyup.enter)="checkAnswer(userInput!)"
                  [disabled]="!!feedback()"
                  class="w-full max-w-xs text-center text-6xl py-6 rounded-3xl bg-white/10 border-4 border-white/5 text-white outline-none focus:border-accent transition-all"
                  placeholder="?"
                  autofocus
                />
                <button
                  (click)="checkAnswer(userInput!)"
                  [disabled]="userInput === null || !!feedback()"
                  class="juicy-button w-full max-w-xs py-6 bg-accent text-primary font-bold text-2xl shadow-[0_6px_0_0_#ca8a04]"
                >
                  ¡Disparar!
                </button>
              </div>
            }
          </div>
        }
      } @else {
        <!-- Resultados -->
        <div class="w-full max-w-2xl bg-white/10 backdrop-blur-md rounded-[3rem] p-12 text-center border-4 border-accent shadow-2xl animate-in zoom-in duration-500">
          <div class="flex justify-center mb-8">
             <div class="relative">
               <lucide-icon [name]="Trophy" class="w-32 h-32 text-accent animate-bounce"></lucide-icon>
               <div class="absolute -top-4 -right-4 bg-error text-white px-4 py-2 rounded-full font-bold text-2xl rotate-12">
                 MISIÓN COMPLETA
               </div>
             </div>
          </div>

          <h2 class="text-5xl font-bold mb-4">Acertaste {{ correctCount() }} / 10</h2>
          <p class="text-2xl text-blue-200 mb-12">
            @if (correctCount() === 10) { ¡Vuelo perfecto! ¡Eres un as de las mates! }
            @else if (correctCount() > 7) { ¡Gran trabajo! ¡La flota estelar está orgullosa! }
            @else { ¡Buen esfuerzo! ¡Sigue entrenando para alcanzar las estrellas! }
          </p>

          <div class="flex justify-center gap-4 mb-12">
            @for (s of [1,2,3]; track s) {
              <lucide-icon
                [name]="Star"
                [class]="s <= starsEarned() ? 'text-accent fill-accent' : 'text-white/10'"
                [style.animation-delay.s]="s * 0.2"
                class="w-16 h-16 animate-in zoom-in"
              ></lucide-icon>
            }
          </div>

          <div class="flex flex-col gap-4">
            <button
              (click)="goBack()"
              class="juicy-button py-6 bg-accent text-primary font-bold text-2xl shadow-[0_6px_0_0_#ca8a04]"
            >
              Volver al Centro de Control
            </button>
            <button
              (click)="restart()"
              class="text-white/60 hover:text-white font-bold"
            >
              Intentar de Nuevo
            </button>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private storage = inject(StorageService);
  private sound = inject(SoundService);
  private gameService = inject(GameService);

  readonly ChevronLeft = ChevronLeft;
  readonly Star = Star;
  readonly Heart = Heart;
  readonly Trophy = Trophy;
  readonly Rocket = Rocket;

  tableId = 0;
  questions = signal<GameQuestion[]>([]);
  currentIndex = signal(0);
  lives = signal(3);
  correctCount = signal(0);
  isFinished = signal(false);
  feedback = signal<'correct' | 'wrong' | null>(null);
  userInput: number | null = null;

  currentQuestion = computed(() => this.questions()[this.currentIndex()]);
  progress = computed(() => (this.currentIndex() / 10) * 100);

  starsEarned = computed(() => {
    if (this.correctCount() === 10) return 3;
    if (this.correctCount() >= 8) return 2;
    if (this.correctCount() >= 5) return 1;
    return 0;
  });

  ngOnInit(): void {
    this.tableId = Number(this.route.snapshot.paramMap.get('tableId'));
    this.startMission();
  }

  startMission(): void {
    const profile = this.storage.activeProfile();
    const mode = (profile?.progress.find(p => p.tableId === this.tableId)?.basicCompleted) ? 'advanced' : 'basic';
    this.questions.set(this.gameService.generateQuestions(this.tableId, mode));
  }

  checkAnswer(val: number): void {
    const q = this.currentQuestion();
    if (!q || this.feedback()) return;

    if (val === q.answer) {
      this.sound.play('success');
      this.feedback.set('correct');
      this.correctCount.update(c => c + 1);
    } else {
      this.sound.play('failure');
      this.feedback.set('wrong');
      this.lives.update(l => Math.max(0, l - 1));
    }
  }

  nextQuestion(): void {
    this.feedback.set(null);
    this.userInput = null;

    if (this.currentIndex() < 9 && this.lives() > 0) {
      this.currentIndex.update(i => i + 1);
    } else {
      this.finishMission();
    }
  }

  finishMission(): void {
    this.isFinished.set(true);
    this.sound.play('complete');

    const profile = this.storage.activeProfile();
    const isBasic = !profile?.progress.find(p => p.tableId === this.tableId)?.basicCompleted;

    this.storage.updateProgress(
      this.tableId,
      isBasic ? 'basic' : 'advanced',
      this.starsEarned()
    ).subscribe();
  }

  restart(): void {
    this.currentIndex.set(0);
    this.lives.set(3);
    this.correctCount.set(0);
    this.isFinished.set(false);
    this.startMission();
  }

  goBack(): void {
    this.sound.play('click');
    this.router.navigate(['/dashboard']);
  }
}
