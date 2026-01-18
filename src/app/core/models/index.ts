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
}

export interface UserSession {
  email: string;
  currentProfileId?: string;
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
