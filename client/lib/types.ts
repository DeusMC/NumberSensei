export type GameMode = "classic" | "depth" | "strategic" | "tactical";

export interface LevelParams {
  seed: number;
  levelNumber: number;
  rangeMin: number;
  rangeMax: number;
  maxAttempts: number;
  timeLimit: number | null;
  gameMode: GameMode;
  targetNumber: number;
  hintStyle: "basic" | "distance" | "hot_cold" | "penalty";
  difficultyScore: number;
}

export interface GuessResult {
  guess: number;
  feedback: "correct" | "higher" | "lower";
  hint?: string;
  timestamp: number;
  penalty?: number;
}

export interface LevelResult {
  levelNumber: number;
  won: boolean;
  attemptsUsed: number;
  maxAttempts: number;
  timeUsed: number | null;
  timeLimit: number | null;
  accuracy: number;
  gameMode: GameMode;
  targetNumber: number;
  guesses: GuessResult[];
  completedAt: number;
}

export interface PlayerStats {
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  currentStreak: number;
  bestStreak: number;
  averageAttempts: number;
  averageTime: number;
  accuracyHistory: number[];
  reactionTimes: number[];
  modeStats: Record<GameMode, ModeStats>;
  lastPlayedAt: number | null;
}

export interface ModeStats {
  gamesPlayed: number;
  wins: number;
  bestStreak: number;
  averageAttempts: number;
}

export interface SkillMetrics {
  skillLevel: number;
  successRate: number;
  consistencyScore: number;
  reactionSpeed: number;
  failureStreak: number;
  winStreak: number;
  difficultyModifier: number;
}

export interface GameState {
  currentLevel: LevelParams | null;
  currentGuesses: GuessResult[];
  isPlaying: boolean;
  isPaused: boolean;
  startTime: number | null;
  elapsedTime: number;
}

export interface PlayerProfile {
  displayName: string;
  avatarId: number;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}
