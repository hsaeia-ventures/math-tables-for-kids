import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, ChevronLeft, Rocket, Shield, Star, Zap } from 'lucide-angular';
import { StorageService } from '../../core/services/storage.service';
import { SoundService } from '../../core/services/sound.service';
import { TrainingService } from '../../core/services/training.service';
import { TrainingStep, TrainingPhase } from '../../core/models';
import { StarBackgroundComponent } from '../../shared/components/star-background.component';

@Component({
   selector: 'app-training',
   imports: [CommonModule, LucideAngularModule, StarBackgroundComponent],
   template: `
    <app-star-background />
    <div class="min-h-screen p-6 flex flex-col items-center">

      <!-- Header -->
      <div class="w-full max-w-4xl flex justify-between items-center mb-8">
        <button (click)="goBack()" class="p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors" id="training-back-btn">
          <lucide-icon [name]="ChevronLeft" class="w-6 h-6"></lucide-icon>
        </button>

        <div class="flex-1 mx-6">
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm text-blue-200 uppercase tracking-widest font-bold">Dominio</span>
            <span class="text-sm font-bold text-accent">{{ masteryProgress() }}%</span>
          </div>
          <div class="h-4 bg-white/10 rounded-full overflow-hidden border-2 border-white/5">
            <div
              class="h-full mastery-bar-fill rounded-full"
              [style.width.%]="masteryProgress()"
            ></div>
          </div>
        </div>

        <div class="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl border-2 border-white/5">
          <lucide-icon [name]="Zap" class="w-5 h-5 text-accent"></lucide-icon>
          <span class="text-lg font-bold" translate="no">{{ currentStepIndex() + 1 }}/{{ totalSteps() }}</span>
        </div>
      </div>

      <!-- Step indicator dots -->
      @if (!isCompleted()) {
        <div class="flex gap-2 mb-8 flex-wrap justify-center max-w-md">
          @for (step of steps(); track step.multiplier; let i = $index) {
            <div
              [class]="getStepDotClass(i)"
              class="step-dot"
            ></div>
          }
        </div>
      }

      @if (!isCompleted()) {
        <!-- Training Content -->
        @if (currentStep(); as step) {
          <div class="w-full max-w-2xl bg-white/10 backdrop-blur-md rounded-[3rem] p-10 text-center border-4 border-white/10 shadow-2xl relative overflow-hidden">

            <!-- Review badge -->
            @if (isReviewRound()) {
              <div class="absolute top-4 right-4 bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-amber-500/30">
                🔄 Repaso
              </div>
            }

            <h2 class="text-xl text-blue-200 uppercase tracking-[0.3em] mb-2 font-bold">
              Tabla del {{ tableId }}
            </h2>
            <p class="text-sm text-blue-300/60 mb-6">
              @switch (phase()) {
                @case ('observe') { Observa y memoriza }
                @case ('quiz') { ¿Recuerdas la respuesta? }
                @case ('feedback') { ¡Excelente trabajo! }
                @case ('hint') { Pista del Comandante }
              }
            </p>

            <!-- PHASE: OBSERVE -->
            @if (phase() === 'observe') {
              <div class="mb-8">
                <div class="text-6xl md:text-7xl font-bold text-white mb-4" translate="no">
                  {{ step.operation }} =
                  <span class="text-accent animate-reveal text-glow inline-block">{{ step.correctAnswer }}</span>
                </div>

                <!-- Visual representation -->
                @if (tableId <= 5 && step.multiplier <= 5) {
                  <div class="visual-groups mt-6 mb-4">
                    @for (group of getVisualGroups(step.multiplier); track $index) {
                      <div class="visual-group">
                        @for (item of getVisualItems(tableId); track $index) {
                          <span class="text-lg">⭐</span>
                        }
                      </div>
                    }
                  </div>
                  <p class="text-xs text-blue-300/50">{{ step.multiplier }} grupo(s) de {{ tableId }}</p>
                }
              </div>

              <button
                (click)="startQuizPhase()"
                class="juicy-button px-10 py-4 bg-accent text-primary font-bold text-xl shadow-[0_6px_0_0_#ca8a04]"
                id="training-continue-observe-btn"
              >
                ¡Lo tengo! Ponme a prueba
              </button>
            }

            <!-- PHASE: QUIZ -->
            @if (phase() === 'quiz') {
              <div class="text-6xl md:text-7xl font-bold text-white mb-10" translate="no">
                {{ step.operation }} = <span class="text-accent">?</span>
              </div>

              <div class="grid grid-cols-2 gap-6 max-w-md mx-auto">
                @for (opt of step.options; track opt; let i = $index) {
                  <button
                    (click)="checkAnswer(opt)"
                    [disabled]="selectedOption() !== null"
                    class="quiz-option juicy-button py-8 text-4xl font-bold rounded-3xl bg-white/10 border-4 border-white/5 hover:border-accent hover:bg-accent/20 transition-all text-white active:bg-accent active:text-primary disabled:opacity-60"
                    [style.animation-delay.ms]="i * 100"
                    [attr.id]="'training-option-' + opt"
                    translate="no"
                  >
                    {{ opt }}
                  </button>
                }
              </div>
            }

            <!-- PHASE: FEEDBACK (correct) -->
            @if (phase() === 'feedback') {
              <div class="animate-celebration">
                <div class="text-7xl mb-4">🌟</div>
                <div class="text-3xl font-bold text-success mb-2">¡GENIAL!</div>
                <p class="text-xl text-blue-200 mb-8">
                  {{ step.operation }} = <span class="font-bold text-accent" translate="no">{{ step.correctAnswer }}</span>
                </p>
                <button
                  (click)="nextStep()"
                  class="juicy-button px-10 py-4 bg-accent text-primary font-bold text-xl shadow-[0_6px_0_0_#ca8a04]"
                  id="training-next-btn"
                >
                  Continuar Entrenamiento
                </button>
              </div>
            }

            <!-- PHASE: HINT (wrong) -->
            @if (phase() === 'hint') {
              <div class="mb-6">
                <div class="text-5xl mb-4">🤖</div>
                <div class="commander-bubble text-left mb-6">
                  <p class="text-lg text-blue-100 leading-relaxed">
                    {{ step.hint }}
                  </p>
                </div>
                <p class="text-sm text-blue-300/60 mb-6">
                  No te preocupes, ¡así se aprende! Vamos a repasarlo.
                </p>
                <button
                  (click)="retryAfterHint()"
                  class="juicy-button px-10 py-4 bg-indigo-500 text-white font-bold text-xl shadow-[0_6px_0_0_#4338ca]"
                  id="training-understood-btn"
                >
                  ¡Entendido! Quiero intentarlo de nuevo
                </button>
              </div>
            }

          </div>
        }
      } @else {
        <!-- COMPLETION SCREEN -->
        <div class="w-full max-w-2xl bg-white/10 backdrop-blur-md rounded-[3rem] p-12 text-center border-4 border-accent shadow-2xl">
          <div class="animate-badge mb-6">
            <div class="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl border-4 border-white/20 animate-float">
              <lucide-icon [name]="Shield" class="w-16 h-16 text-white"></lucide-icon>
            </div>
          </div>

          <h2 class="text-4xl font-bold mb-2">¡Entrenamiento Completado!</h2>
          <p class="text-xl text-blue-200 mb-2">Tabla del {{ tableId }}</p>

          <div class="flex justify-center gap-2 my-6">
            @for (s of [1,2,3]; track s) {
              <lucide-icon
                [name]="Star"
                class="w-10 h-10 text-accent fill-accent"
                [style.animation-delay.s]="s * 0.2"
              ></lucide-icon>
            }
          </div>

          @if (failedMultipliers().length === 0) {
            <div class="bg-success/10 border border-success/30 rounded-2xl p-4 mb-8">
              <p class="text-success font-bold text-lg">🏆 ¡Perfecto! ¡Sin errores!</p>
              <p class="text-success/80 text-sm">Eres un Piloto Preparado, Comandante.</p>
            </div>
          } @else {
            <div class="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-8">
              <p class="text-amber-300 font-bold text-lg">🎯 ¡Entrenamiento superado!</p>
              <p class="text-amber-200/80 text-sm">Has repasado los puntos difíciles. ¡Estás listo para la misión!</p>
            </div>
          }

          <div class="flex flex-col gap-4">
            <button
              (click)="goToMission()"
              class="juicy-button py-5 bg-accent text-primary font-bold text-xl shadow-[0_6px_0_0_#ca8a04]"
              id="training-go-mission-btn"
            >
              <div class="flex items-center justify-center gap-2">
                <lucide-icon [name]="Rocket" class="w-6 h-6"></lucide-icon>
                ¡Ir a la Misión Real!
              </div>
            </button>
            <button
              (click)="goBack()"
              class="text-white/60 hover:text-white font-bold transition-colors"
              id="training-back-dashboard-btn"
            >
              Volver al Centro de Control
            </button>
          </div>
        </div>
      }
    </div>
  `,
   styleUrl: './training.component.scss',
   changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingComponent implements OnInit {
   private route = inject(ActivatedRoute);
   private router = inject(Router);
   private storage = inject(StorageService);
   private sound = inject(SoundService);
   private trainingService = inject(TrainingService);

   readonly ChevronLeft = ChevronLeft;
   readonly Rocket = Rocket;
   readonly Shield = Shield;
   readonly Star = Star;
   readonly Zap = Zap;

   tableId = 0;
   steps = signal<TrainingStep[]>([]);
   currentStepIndex = signal(0);
   phase = signal<TrainingPhase>('observe');
   failedMultipliers = signal<number[]>([]);
   isReviewRound = signal(false);
   isCompleted = signal(false);
   selectedOption = signal<number | null>(null);
   completedStepIndices = signal<Set<number>>(new Set());
   failedStepIndices = signal<Set<number>>(new Set());

   currentStep = computed(() => this.steps()[this.currentStepIndex()]);
   totalSteps = computed(() => this.steps().length);

   masteryProgress = computed(() => {
      const total = this.totalSteps();
      if (total === 0) return 0;
      return Math.round((this.completedStepIndices().size / total) * 100);
   });

   ngOnInit(): void {
      this.tableId = Number(this.route.snapshot.paramMap.get('tableId'));
      this.startTraining();
   }

   startTraining(): void {
      const steps = this.trainingService.generateTrainingSteps(this.tableId);
      this.steps.set(steps);
      this.currentStepIndex.set(0);
      this.phase.set('observe');
      this.failedMultipliers.set([]);
      this.isReviewRound.set(false);
      this.isCompleted.set(false);
      this.selectedOption.set(null);
      this.completedStepIndices.set(new Set());
      this.failedStepIndices.set(new Set());
   }

   startQuizPhase(): void {
      this.sound.play('click');
      this.phase.set('quiz');
      this.selectedOption.set(null);
   }

   checkAnswer(selected: number): void {
      const step = this.currentStep();
      if (!step || this.selectedOption() !== null) return;

      this.selectedOption.set(selected);

      if (selected === step.correctAnswer) {
         this.sound.play('success');
         this.phase.set('feedback');

         const completed = new Set(this.completedStepIndices());
         completed.add(this.currentStepIndex());
         this.completedStepIndices.set(completed);
      } else {
         this.sound.play('hint');
         this.phase.set('hint');

         if (!this.failedMultipliers().includes(step.multiplier)) {
            this.failedMultipliers.update(arr => [...arr, step.multiplier]);
         }

         const failed = new Set(this.failedStepIndices());
         failed.add(this.currentStepIndex());
         this.failedStepIndices.set(failed);
      }
   }

   retryAfterHint(): void {
      this.sound.play('click');
      this.phase.set('observe');
   }

   nextStep(): void {
      this.selectedOption.set(null);

      if (this.currentStepIndex() < this.totalSteps() - 1) {
         this.currentStepIndex.update(i => i + 1);
         this.phase.set('observe');
      } else {
         if (!this.isReviewRound() && this.failedMultipliers().length > 0) {
            this.startReviewRound();
         } else {
            this.completeTraining();
         }
      }
   }

   private startReviewRound(): void {
      this.isReviewRound.set(true);
      const reviewSteps = this.trainingService.generateTrainingStepsForMultipliers(
         this.tableId,
         this.failedMultipliers()
      );
      this.steps.set(reviewSteps);
      this.currentStepIndex.set(0);
      this.phase.set('observe');
      this.selectedOption.set(null);
      this.completedStepIndices.set(new Set());
      this.failedStepIndices.set(new Set());
   }

   private completeTraining(): void {
      this.isCompleted.set(true);
      this.sound.play('training_complete');

      this.storage.updateTrainingProgress(
         this.tableId,
         true,
         this.failedMultipliers()
      ).subscribe();
   }

   goToMission(): void {
      this.sound.play('click');
      this.router.navigate(['/exercise', this.tableId]);
   }

   goBack(): void {
      this.sound.play('click');
      this.router.navigate(['/dashboard']);
   }

   getStepDotClass(index: number): string {
      if (this.completedStepIndices().has(index)) return 'completed';
      if (index === this.currentStepIndex()) return 'current';
      if (this.failedStepIndices().has(index)) return 'failed';
      return 'pending';
   }

   getVisualGroups(multiplier: number): number[] {
      return Array.from({ length: multiplier });
   }

   getVisualItems(tableId: number): number[] {
      return Array.from({ length: tableId });
   }
}
