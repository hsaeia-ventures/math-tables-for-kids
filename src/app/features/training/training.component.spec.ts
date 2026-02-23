import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TrainingComponent } from './training.component';
import { TrainingService } from '../../core/services/training.service';
import { StorageService } from '../../core/services/storage.service';
import { SoundService } from '../../core/services/sound.service';
import { ActivatedRoute, Router } from '@angular/router';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { TrainingStep } from '../../core/models';

const MOCK_STEPS: TrainingStep[] = Array.from({ length: 10 }, (_, i) => ({
   multiplier: i + 1,
   operation: `5 × ${i + 1}`,
   correctAnswer: 5 * (i + 1),
   options: [5 * (i + 1), 5 * (i + 1) + 3] as [number, number],
   hint: `Recuerda: ${i + 1} grupo(s) de 5 = ${5 * (i + 1)}`,
}));

const MOCK_REVIEW_STEPS: TrainingStep[] = [
   {
      multiplier: 3,
      operation: '5 × 3',
      correctAnswer: 15,
      options: [15, 18] as [number, number],
      hint: 'Recuerda: 3 grupo(s) de 5 = 15',
   },
];

describe('TrainingComponent', () => {
   let component: TrainingComponent;
   let fixture: ComponentFixture<TrainingComponent>;

   const mockTrainingService = {
      generateTrainingSteps: vi.fn().mockReturnValue(MOCK_STEPS),
      generateTrainingStepsForMultipliers: vi.fn().mockReturnValue(MOCK_REVIEW_STEPS),
   };

   const mockStorageService = {
      activeProfile: signal({
         id: 'p1', name: 'Luna', age: 8, avatar: '🚀', totalStars: 0,
         progress: Array.from({ length: 10 }, (_, i) => ({
            tableId: i + 1, basicCompleted: false, advancedCompleted: false, stars: 0,
            trainingCompleted: false, failedMultipliers: [],
         })),
      }),
      updateTrainingProgress: vi.fn().mockReturnValue(of(undefined)),
   };

   const mockSoundService = {
      play: vi.fn(),
   };

   const mockRouter = {
      navigate: vi.fn(),
   };

   const mockActivatedRoute = {
      snapshot: {
         paramMap: {
            get: vi.fn().mockReturnValue('5'),
         },
      },
   };

   beforeEach(() => {
      vi.clearAllMocks();
      mockTrainingService.generateTrainingSteps.mockReturnValue(
         MOCK_STEPS.map(s => ({ ...s, options: [...s.options] as [number, number] }))
      );
      mockTrainingService.generateTrainingStepsForMultipliers.mockReturnValue(
         MOCK_REVIEW_STEPS.map(s => ({ ...s, options: [...s.options] as [number, number] }))
      );

      TestBed.configureTestingModule({
         imports: [TrainingComponent],
         providers: [
            { provide: TrainingService, useValue: mockTrainingService },
            { provide: StorageService, useValue: mockStorageService },
            { provide: SoundService, useValue: mockSoundService },
            { provide: Router, useValue: mockRouter },
            { provide: ActivatedRoute, useValue: mockActivatedRoute },
         ],
      });

      fixture = TestBed.createComponent(TrainingComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
   });

   it('should create the component', () => {
      expect(component).toBeTruthy();
   });

   it('should initialize with tableId from route', () => {
      expect(component.tableId).toBe(5);
   });

   it('should generate 10 training steps on init', () => {
      expect(mockTrainingService.generateTrainingSteps).toHaveBeenCalledWith(5);
      expect(component.steps()).toHaveLength(10);
   });

   it('should start in observe phase', () => {
      expect(component.phase()).toBe('observe');
   });

   it('should have mastery at 0% initially', () => {
      expect(component.masteryProgress()).toBe(0);
   });

   it('should not be completed initially', () => {
      expect(component.isCompleted()).toBe(false);
   });

   describe('Phase: Observe', () => {
      it('should show the current step operation and answer', () => {
         const step = component.currentStep();
         expect(step?.operation).toBe('5 × 1');
         expect(step?.correctAnswer).toBe(5);
      });

      it('should render the mastery bar', () => {
         const el = fixture.nativeElement as HTMLElement;
         const bar = el.querySelector('.mastery-bar-fill');
         expect(bar).toBeTruthy();
      });

      it('should transition to quiz phase on button click', () => {
         component.startQuizPhase();
         expect(component.phase()).toBe('quiz');
         expect(mockSoundService.play).toHaveBeenCalledWith('click');
      });
   });

   describe('Phase: Quiz', () => {
      beforeEach(() => {
         component.startQuizPhase();
         fixture.detectChanges();
      });

      it('should show exactly 2 options', () => {
         const step = component.currentStep();
         expect(step?.options).toHaveLength(2);
      });

      it('should contain the correct answer in options', () => {
         const step = component.currentStep();
         expect(step?.options).toContain(step?.correctAnswer);
      });
   });

   describe('Interaction: Correct answer', () => {
      beforeEach(() => {
         component.startQuizPhase();
      });

      it('should transition to feedback phase on correct answer', () => {
         const step = component.currentStep()!;
         component.checkAnswer(step.correctAnswer);
         expect(component.phase()).toBe('feedback');
      });

      it('should play success sound', () => {
         const step = component.currentStep()!;
         component.checkAnswer(step.correctAnswer);
         expect(mockSoundService.play).toHaveBeenCalledWith('success');
      });

      it('should increment mastery progress', () => {
         const step = component.currentStep()!;
         component.checkAnswer(step.correctAnswer);
         expect(component.masteryProgress()).toBe(10); // 1/10 = 10%
      });

      it('should not allow selecting another option after answering', () => {
         const step = component.currentStep()!;
         component.checkAnswer(step.correctAnswer);
         expect(component.selectedOption()).toBe(step.correctAnswer);

         // Try selecting again — should be no-op
         const wrongOption = step.options.find(o => o !== step.correctAnswer)!;
         component.checkAnswer(wrongOption);
         // Phase should still be feedback (not hint)
         expect(component.phase()).toBe('feedback');
      });
   });

   describe('Interaction: Wrong answer', () => {
      beforeEach(() => {
         component.startQuizPhase();
      });

      it('should transition to hint phase on wrong answer', () => {
         const step = component.currentStep()!;
         const wrongOption = step.options.find(o => o !== step.correctAnswer)!;
         component.checkAnswer(wrongOption);
         expect(component.phase()).toBe('hint');
      });

      it('should play hint sound', () => {
         const step = component.currentStep()!;
         const wrongOption = step.options.find(o => o !== step.correctAnswer)!;
         component.checkAnswer(wrongOption);
         expect(mockSoundService.play).toHaveBeenCalledWith('hint');
      });

      it('should add multiplier to failedMultipliers', () => {
         const step = component.currentStep()!;
         const wrongOption = step.options.find(o => o !== step.correctAnswer)!;
         component.checkAnswer(wrongOption);
         expect(component.failedMultipliers()).toContain(step.multiplier);
      });

      it('should NOT have lives system (no lives to lose)', () => {
         // The component should not have any lives-related signals — verify no penalty
         const step = component.currentStep()!;
         const wrongOption = step.options.find(o => o !== step.correctAnswer)!;
         component.checkAnswer(wrongOption);
         // Just checking that the component continues and doesn't end
         expect(component.isCompleted()).toBe(false);
      });
   });

   describe('Phase: Hint', () => {
      beforeEach(() => {
         component.startQuizPhase();
         const step = component.currentStep()!;
         const wrongOption = step.options.find(o => o !== step.correctAnswer)!;
         component.checkAnswer(wrongOption);
      });

      it('should show hint text', () => {
         const step = component.currentStep()!;
         expect(step.hint).toBeTruthy();
         expect(step.hint.length).toBeGreaterThan(0);
      });

      it('should return to observe phase on retryAfterHint', () => {
         component.retryAfterHint();
         expect(component.phase()).toBe('observe');
      });

      it('should stay on the same step after retry', () => {
         const indexBefore = component.currentStepIndex();
         component.retryAfterHint();
         expect(component.currentStepIndex()).toBe(indexBefore);
      });
   });

   describe('Step navigation', () => {
      it('should advance to next step after correct feedback', () => {
         component.startQuizPhase();
         component.checkAnswer(component.currentStep()!.correctAnswer);
         component.nextStep();

         expect(component.currentStepIndex()).toBe(1);
         expect(component.phase()).toBe('observe');
      });

      it('should complete after all 10 steps with no errors', () => {
         for (let i = 0; i < 10; i++) {
            component.startQuizPhase();
            component.checkAnswer(component.currentStep()!.correctAnswer);
            component.nextStep();
         }

         expect(component.isCompleted()).toBe(true);
      });

      it('should start review round if there were errors', () => {
         // Answer 9 correctly, 1 wrong
         for (let i = 0; i < 9; i++) {
            component.startQuizPhase();
            component.checkAnswer(component.currentStep()!.correctAnswer);
            component.nextStep();
         }

         // Last one: wrong
         component.startQuizPhase();
         const step = component.currentStep()!;
         const wrongOption = step.options.find(o => o !== step.correctAnswer)!;
         component.checkAnswer(wrongOption);
         component.retryAfterHint();

         // Now answer correctly after hint
         component.startQuizPhase();
         component.checkAnswer(step.correctAnswer);
         component.nextStep();

         // Should be in review round now
         expect(component.isReviewRound()).toBe(true);
         expect(mockTrainingService.generateTrainingStepsForMultipliers).toHaveBeenCalled();
      });
   });

   describe('Completion', () => {
      beforeEach(() => {
         // Complete all 10 steps correctly
         for (let i = 0; i < 10; i++) {
            component.startQuizPhase();
            component.checkAnswer(component.currentStep()!.correctAnswer);
            component.nextStep();
         }
      });

      it('should show completion screen', () => {
         expect(component.isCompleted()).toBe(true);
      });

      it('should call updateTrainingProgress with correct data', () => {
         expect(mockStorageService.updateTrainingProgress).toHaveBeenCalledWith(5, true, []);
      });

      it('should play training_complete sound', () => {
         expect(mockSoundService.play).toHaveBeenCalledWith('training_complete');
      });
   });

   describe('Navigation', () => {
      it('should navigate to dashboard on goBack', () => {
         component.goBack();
         expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
         expect(mockSoundService.play).toHaveBeenCalledWith('click');
      });

      it('should navigate to exercise on goToMission', () => {
         component.goToMission();
         expect(mockRouter.navigate).toHaveBeenCalledWith(['/exercise', 5]);
         expect(mockSoundService.play).toHaveBeenCalledWith('click');
      });
   });

   describe('Helper methods', () => {
      it('should return correct step dot class for completed step', () => {
         component.startQuizPhase();
         component.checkAnswer(component.currentStep()!.correctAnswer);
         expect(component.getStepDotClass(0)).toBe('completed');
      });

      it('should return "current" for the current step', () => {
         expect(component.getStepDotClass(0)).toBe('current');
      });

      it('should return "pending" for future steps', () => {
         expect(component.getStepDotClass(5)).toBe('pending');
      });

      it('should return correct visual groups', () => {
         expect(component.getVisualGroups(3)).toHaveLength(3);
      });

      it('should return correct visual items', () => {
         expect(component.getVisualItems(5)).toHaveLength(5);
      });
   });
});
