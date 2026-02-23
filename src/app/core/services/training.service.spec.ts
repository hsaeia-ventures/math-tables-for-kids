import { TestBed } from '@angular/core/testing';
import { TrainingService } from './training.service';
import { describe, it, expect, beforeEach } from 'vitest';

describe('TrainingService', () => {
   let service: TrainingService;

   beforeEach(() => {
      TestBed.configureTestingModule({
         providers: [TrainingService],
      });
      service = TestBed.inject(TrainingService);
   });

   it('should be created', () => {
      expect(service).toBeTruthy();
   });

   describe('generateTrainingSteps', () => {
      it('should generate exactly 10 steps for any table', () => {
         for (let tableId = 1; tableId <= 10; tableId++) {
            const steps = service.generateTrainingSteps(tableId);
            expect(steps).toHaveLength(10);
         }
      });

      it('should produce the correct operation string for each step', () => {
         const steps = service.generateTrainingSteps(5);
         steps.forEach((step, i) => {
            expect(step.operation).toBe(`5 × ${i + 1}`);
         });
      });

      it('should produce the correct answer for each step', () => {
         const steps = service.generateTrainingSteps(7);
         steps.forEach((step, i) => {
            expect(step.correctAnswer).toBe(7 * (i + 1));
         });
      });

      it('should include the correct multiplier for each step', () => {
         const steps = service.generateTrainingSteps(3);
         steps.forEach((step, i) => {
            expect(step.multiplier).toBe(i + 1);
         });
      });

      it('should have exactly 2 options per step', () => {
         const steps = service.generateTrainingSteps(4);
         steps.forEach(step => {
            expect(step.options).toHaveLength(2);
         });
      });

      it('should always include the correct answer in the options', () => {
         const steps = service.generateTrainingSteps(6);
         steps.forEach(step => {
            expect(step.options).toContain(step.correctAnswer);
         });
      });

      it('should have a non-empty hint for each step', () => {
         const steps = service.generateTrainingSteps(8);
         steps.forEach(step => {
            expect(step.hint).toBeTruthy();
            expect(step.hint.length).toBeGreaterThan(0);
         });
      });
   });

   describe('generateTrainingStepsForMultipliers', () => {
      it('should generate steps only for the specified multipliers', () => {
         const multipliers = [3, 7, 9];
         const steps = service.generateTrainingStepsForMultipliers(5, multipliers);

         expect(steps).toHaveLength(3);
         expect(steps[0].multiplier).toBe(3);
         expect(steps[0].correctAnswer).toBe(15);
         expect(steps[1].multiplier).toBe(7);
         expect(steps[1].correctAnswer).toBe(35);
         expect(steps[2].multiplier).toBe(9);
         expect(steps[2].correctAnswer).toBe(45);
      });

      it('should return an empty array if no multipliers are provided', () => {
         const steps = service.generateTrainingStepsForMultipliers(5, []);
         expect(steps).toHaveLength(0);
      });
   });

   describe('generateReducedOptions', () => {
      it('should return an array of exactly 2 elements', () => {
         const options = service.generateReducedOptions(15);
         expect(options).toHaveLength(2);
      });

      it('should always include the correct answer', () => {
         for (let i = 0; i < 50; i++) {
            const answer = Math.floor(Math.random() * 100) + 1;
            const options = service.generateReducedOptions(answer);
            expect(options).toContain(answer);
         }
      });

      it('should have a wrong option that is different from the correct answer', () => {
         for (let i = 0; i < 50; i++) {
            const answer = 20;
            const options = service.generateReducedOptions(answer);
            const wrong = options.find(o => o !== answer);
            expect(wrong).toBeDefined();
            expect(wrong).not.toBe(answer);
         }
      });

      it('should have a wrong option that is greater than 0', () => {
         for (let i = 0; i < 50; i++) {
            const options = service.generateReducedOptions(2);
            options.forEach(opt => {
               expect(opt).toBeGreaterThan(0);
            });
         }
      });
   });

   describe('generateHint', () => {
      it('should return a non-empty string', () => {
         const hint = service.generateHint(5, 3);
         expect(hint).toBeTruthy();
         expect(hint.length).toBeGreaterThan(0);
      });

      it('should include the correct answer in the hint text', () => {
         const hint = service.generateHint(5, 3);
         expect(hint).toContain('15');
      });

      it('should include the correct answer for various tables', () => {
         for (let tableId = 1; tableId <= 10; tableId++) {
            for (let m = 1; m <= 10; m++) {
               const hint = service.generateHint(tableId, m);
               expect(hint).toContain(String(tableId * m));
            }
         }
      });
   });
});
