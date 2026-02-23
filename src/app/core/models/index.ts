export interface Profile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  totalStars: number;
  progress: TableProgress[];
}

export interface TableProgress {
  tableId: number;
  basicCompleted: boolean;
  advancedCompleted: boolean;
  stars: number;
  trainingCompleted?: boolean;
  failedMultipliers?: number[];
}

export interface GameQuestion {
  text: string;
  answer: number;
  options?: number[];
  type: 'button' | 'input';
}

export interface GameResult {
  correctAnswers: number;
  totalQuestions: number;
  starsEarned: number;
}

export interface TrainingStep {
  multiplier: number;
  operation: string;
  correctAnswer: number;
  options: [number, number];
  hint: string;
}

export type TrainingPhase = 'observe' | 'quiz' | 'feedback' | 'hint';
