import { Injectable } from '@angular/core';
import { GameQuestion } from '../models';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  generateQuestions(tableId: number, mode: 'basic' | 'advanced'): GameQuestion[] {
    const questions: GameQuestion[] = [];
    const multipliers = mode === 'basic'
      ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      : this.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    for (const m of multipliers) {
      const answer = tableId * m;
      const type = Math.random() > 0.5 ? 'button' : 'input';

      const question: GameQuestion = {
        text: `${tableId} × ${m} = ?`,
        answer,
        type
      };

      if (type === 'button') {
        question.options = this.generateOptions(answer);
      }

      questions.push(question);
    }

    return questions;
  }

  private generateOptions(correctAnswer: number): number[] {
    const options = new Set<number>([correctAnswer]);
    while (options.size < 4) {
      const offset = Math.floor(Math.random() * 10) - 5;
      const wrong = correctAnswer + offset;
      if (wrong > 0 && wrong !== correctAnswer) {
        options.add(wrong);
      }
    }
    return this.shuffle(Array.from(options));
  }

  private shuffle<T>(array: T[]): T[] {
    return [...array].sort(() => Math.random() - 0.5);
  }
}
