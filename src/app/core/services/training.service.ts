import { Injectable } from '@angular/core';
import { TrainingStep } from '../models';

@Injectable({
   providedIn: 'root'
})
export class TrainingService {

   generateTrainingSteps(tableId: number): TrainingStep[] {
      const steps: TrainingStep[] = [];

      for (let m = 1; m <= 10; m++) {
         const correctAnswer = tableId * m;
         steps.push({
            multiplier: m,
            operation: `${tableId} × ${m}`,
            correctAnswer,
            options: this.generateReducedOptions(correctAnswer),
            hint: this.generateHint(tableId, m),
         });
      }

      return steps;
   }

   generateTrainingStepsForMultipliers(tableId: number, multipliers: number[]): TrainingStep[] {
      return multipliers.map(m => {
         const correctAnswer = tableId * m;
         return {
            multiplier: m,
            operation: `${tableId} × ${m}`,
            correctAnswer,
            options: this.generateReducedOptions(correctAnswer),
            hint: this.generateHint(tableId, m),
         };
      });
   }

   generateHint(tableId: number, multiplier: number): string {
      const result = tableId * multiplier;
      const visualRepresentation = this.buildVisualHint(tableId, multiplier);

      const hintTemplates = [
         `Recuerda, Cadete: ${multiplier} grupo(s) de ${tableId} = ${result}`,
         `Piensa así: ${tableId} sumado ${multiplier} vez/veces da ${result}`,
         `¡Pista! ${visualRepresentation} = ${result}`,
      ];

      return hintTemplates[Math.floor(Math.random() * hintTemplates.length)];
   }

   generateReducedOptions(correctAnswer: number): [number, number] {
      let wrong: number;
      const maxAttempts = 20;
      let attempts = 0;

      do {
         const offset = Math.floor(Math.random() * 10) + 1;
         wrong = Math.random() > 0.5
            ? correctAnswer + offset
            : correctAnswer - offset;
         attempts++;
      } while ((wrong <= 0 || wrong === correctAnswer) && attempts < maxAttempts);

      if (wrong <= 0 || wrong === correctAnswer) {
         wrong = correctAnswer + 1;
      }

      return this.shufflePair(correctAnswer, wrong);
   }

   private buildVisualHint(tableId: number, multiplier: number): string {
      const emoji = '⭐';
      if (tableId <= 5 && multiplier <= 5) {
         const group = emoji.repeat(tableId);
         const groups = Array(multiplier).fill(group).join(' + ');
         return groups;
      }
      return `${tableId} × ${multiplier}`;
   }

   private shufflePair(a: number, b: number): [number, number] {
      return Math.random() > 0.5 ? [a, b] : [b, a];
   }
}
