import { LevelResult, PlayerStats, SkillMetrics, GameMode } from "./types";

const HISTORY_SIZE = 20;
const REACTION_TIME_THRESHOLD = 30000;

export function createInitialStats(): PlayerStats {
  return {
    totalGames: 0,
    totalWins: 0,
    totalLosses: 0,
    currentStreak: 0,
    bestStreak: 0,
    averageAttempts: 0,
    averageTime: 0,
    accuracyHistory: [],
    reactionTimes: [],
    modeStats: {
      classic: createInitialModeStats(),
      depth: createInitialModeStats(),
      strategic: createInitialModeStats(),
      tactical: createInitialModeStats(),
    },
    lastPlayedAt: null,
  };
}

function createInitialModeStats() {
  return {
    gamesPlayed: 0,
    wins: 0,
    bestStreak: 0,
    averageAttempts: 0,
  };
}

export function createInitialSkillMetrics(): SkillMetrics {
  return {
    skillLevel: 50,
    successRate: 0.5,
    consistencyScore: 0.5,
    reactionSpeed: 0.5,
    failureStreak: 0,
    winStreak: 0,
    difficultyModifier: 1.0,
  };
}

export function updateStatsWithResult(
  stats: PlayerStats,
  result: LevelResult
): PlayerStats {
  const newStats = { ...stats };
  
  newStats.totalGames++;
  
  if (result.won) {
    newStats.totalWins++;
    newStats.currentStreak++;
    newStats.bestStreak = Math.max(newStats.bestStreak, newStats.currentStreak);
  } else {
    newStats.totalLosses++;
    newStats.currentStreak = 0;
  }
  
  const totalAttempts = newStats.averageAttempts * (newStats.totalGames - 1) + result.attemptsUsed;
  newStats.averageAttempts = totalAttempts / newStats.totalGames;
  
  if (result.timeUsed !== null) {
    const totalTime = newStats.averageTime * (newStats.totalGames - 1) + result.timeUsed;
    newStats.averageTime = totalTime / newStats.totalGames;
  }
  
  newStats.accuracyHistory = [
    ...newStats.accuracyHistory.slice(-(HISTORY_SIZE - 1)),
    result.accuracy,
  ];
  
  if (result.timeUsed !== null && result.timeUsed < REACTION_TIME_THRESHOLD) {
    newStats.reactionTimes = [
      ...newStats.reactionTimes.slice(-(HISTORY_SIZE - 1)),
      result.timeUsed,
    ];
  }
  
  const modeKey = result.gameMode;
  const modeStat = { ...newStats.modeStats[modeKey] };
  modeStat.gamesPlayed++;
  if (result.won) {
    modeStat.wins++;
  }
  const modeTotal = modeStat.averageAttempts * (modeStat.gamesPlayed - 1) + result.attemptsUsed;
  modeStat.averageAttempts = modeTotal / modeStat.gamesPlayed;
  newStats.modeStats[modeKey] = modeStat;
  
  newStats.lastPlayedAt = Date.now();
  
  return newStats;
}

export function calculateSkillMetrics(
  stats: PlayerStats,
  recentResults: LevelResult[]
): SkillMetrics {
  const recentCount = Math.min(10, recentResults.length);
  const recent = recentResults.slice(-recentCount);
  
  const overallSuccessRate = stats.totalGames > 0
    ? stats.totalWins / stats.totalGames
    : 0.5;
  
  const recentSuccessRate = recent.length > 0
    ? recent.filter(r => r.won).length / recent.length
    : 0.5;
  
  const successRate = stats.totalGames < 5
    ? recentSuccessRate
    : overallSuccessRate * 0.3 + recentSuccessRate * 0.7;
  
  let consistencyScore = 0.5;
  if (stats.accuracyHistory.length >= 3) {
    const recentAccuracy = stats.accuracyHistory.slice(-5);
    const mean = recentAccuracy.reduce((a, b) => a + b, 0) / recentAccuracy.length;
    const variance = recentAccuracy.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / recentAccuracy.length;
    const stdDev = Math.sqrt(variance);
    consistencyScore = Math.max(0, Math.min(1, 1 - stdDev));
  }
  
  let reactionSpeed = 0.5;
  if (stats.reactionTimes.length >= 3) {
    const avgTime = stats.reactionTimes.reduce((a, b) => a + b, 0) / stats.reactionTimes.length;
    reactionSpeed = Math.max(0, Math.min(1, 1 - avgTime / REACTION_TIME_THRESHOLD));
  }
  
  let failureStreak = 0;
  let winStreak = 0;
  for (let i = recent.length - 1; i >= 0; i--) {
    if (recent[i].won) {
      if (failureStreak === 0) winStreak++;
      else break;
    } else {
      if (winStreak === 0) failureStreak++;
      else break;
    }
  }
  
  const baseSkill = successRate * 40 + consistencyScore * 30 + reactionSpeed * 30;
  const streakBonus = winStreak * 2;
  const streakPenalty = failureStreak * 3;
  const skillLevel = Math.max(10, Math.min(100, baseSkill + streakBonus - streakPenalty));
  
  let difficultyModifier = 1.0;
  if (failureStreak >= 3) {
    difficultyModifier = Math.max(0.6, 1 - failureStreak * 0.1);
  } else if (winStreak >= 5) {
    difficultyModifier = Math.min(1.4, 1 + winStreak * 0.05);
  }
  
  return {
    skillLevel,
    successRate,
    consistencyScore,
    reactionSpeed,
    failureStreak,
    winStreak,
    difficultyModifier,
  };
}

export function calculateLevelAccuracy(
  attemptsUsed: number,
  maxAttempts: number,
  rangeSize: number
): number {
  const optimalAttempts = Math.ceil(Math.log2(rangeSize));
  const efficiency = Math.max(0, 1 - (attemptsUsed - optimalAttempts) / maxAttempts);
  return Math.round(efficiency * 100) / 100;
}

export function getSkillLevelName(skillLevel: number): string {
  if (skillLevel >= 90) return "Master";
  if (skillLevel >= 75) return "Expert";
  if (skillLevel >= 60) return "Advanced";
  if (skillLevel >= 45) return "Intermediate";
  if (skillLevel >= 30) return "Beginner";
  return "Novice";
}
