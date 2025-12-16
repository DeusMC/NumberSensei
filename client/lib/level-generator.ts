import { SeededRandom } from "./seeded-random";
import { GameMode, LevelParams, SkillMetrics } from "./types";

const BASE_RANGES: Record<GameMode, { min: number; max: number }> = {
  classic: { min: 1, max: 10 },
  depth: { min: 1, max: 16 },
  strategic: { min: 1, max: 8 },
  tactical: { min: 1, max: 20 },
};

const BASE_ATTEMPTS: Record<GameMode, number> = {
  classic: 5,
  depth: 6,
  strategic: 4,
  tactical: 3,
};

const TIME_LIMITS: Record<GameMode, number | null> = {
  classic: null,
  depth: null,
  strategic: 60,
  tactical: 30,
};

const HINT_STYLES: Record<GameMode, LevelParams["hintStyle"]> = {
  classic: "basic",
  depth: "distance",
  strategic: "penalty",
  tactical: "hot_cold",
};

function calculateDifficultyScore(
  range: number,
  attempts: number,
  timeLimit: number | null
): number {
  let score = 0;
  
  const rangeScore = Math.log2(range) * 10;
  score += rangeScore;
  
  const attemptPenalty = Math.max(0, (10 - attempts) * 5);
  score += attemptPenalty;
  
  if (timeLimit !== null) {
    const timePressure = Math.max(0, (60 - timeLimit) * 0.5);
    score += timePressure;
  }
  
  return Math.round(score);
}

function selectGameMode(
  levelNumber: number,
  skillMetrics: SkillMetrics,
  rng: SeededRandom
): GameMode {
  const modes: GameMode[] = ["classic", "depth", "strategic", "tactical"];
  
  if (levelNumber <= 3) {
    return "classic";
  }
  
  if (levelNumber <= 6) {
    return rng.next() > 0.5 ? "classic" : "depth";
  }
  
  if (levelNumber <= 10) {
    const idx = rng.nextInt(0, 2);
    return modes[idx];
  }
  
  if (skillMetrics.skillLevel >= 70) {
    return modes[rng.nextInt(0, 3)];
  }
  
  const roll = rng.next();
  if (roll < 0.3) return "classic";
  if (roll < 0.55) return "depth";
  if (roll < 0.8) return "strategic";
  return "tactical";
}

function calculateRangeExpansion(
  levelNumber: number,
  skillMetrics: SkillMetrics
): number {
  const baseExpansion = Math.pow(levelNumber, 1.3);
  const skillModifier = 1 + (skillMetrics.skillLevel / 100) * 0.5;
  const consistencyBonus = skillMetrics.consistencyScore * 0.2;
  
  let expansion = baseExpansion * skillModifier * (1 + consistencyBonus);
  
  if (skillMetrics.failureStreak > 2) {
    expansion *= Math.max(0.5, 1 - skillMetrics.failureStreak * 0.1);
  }
  
  return expansion;
}

function calculateAttemptReduction(
  levelNumber: number,
  skillMetrics: SkillMetrics
): number {
  if (levelNumber < 5) return 0;
  
  const baseReduction = Math.floor((levelNumber - 4) / 5);
  const skillReduction = skillMetrics.skillLevel > 60 ? 1 : 0;
  
  const failureSafety = skillMetrics.failureStreak > 1 ? -1 : 0;
  
  return Math.max(0, baseReduction + skillReduction + failureSafety);
}

function validateLevel(params: LevelParams): LevelParams {
  const range = params.rangeMax - params.rangeMin + 1;
  const minAttempts = Math.ceil(Math.log2(range));
  
  if (params.maxAttempts < minAttempts) {
    params.maxAttempts = minAttempts;
  }
  
  if (params.maxAttempts < 2) {
    params.maxAttempts = 2;
  }
  
  if (params.timeLimit !== null && params.timeLimit < 10) {
    params.timeLimit = 10;
  }
  
  return params;
}

export function generateLevel(
  levelNumber: number,
  skillMetrics: SkillMetrics,
  seed?: number
): LevelParams {
  const actualSeed = seed ?? Date.now() + levelNumber;
  const rng = new SeededRandom(actualSeed);
  
  const gameMode = selectGameMode(levelNumber, skillMetrics, rng);
  
  const baseRange = BASE_RANGES[gameMode];
  const expansion = calculateRangeExpansion(levelNumber, skillMetrics);
  
  const rangeMin = baseRange.min;
  const rangeMax = Math.min(
    1000,
    Math.round(baseRange.max + expansion * (baseRange.max - baseRange.min))
  );
  
  const baseAttempts = BASE_ATTEMPTS[gameMode];
  const attemptReduction = calculateAttemptReduction(levelNumber, skillMetrics);
  const maxAttempts = Math.max(2, baseAttempts - attemptReduction);
  
  let timeLimit = TIME_LIMITS[gameMode];
  if (timeLimit !== null && levelNumber > 10) {
    timeLimit = Math.max(15, timeLimit - Math.floor((levelNumber - 10) * 2));
  }
  if (skillMetrics.failureStreak > 2 && timeLimit !== null) {
    timeLimit = Math.min(60, timeLimit + 10);
  }
  
  const targetNumber = rng.nextInt(rangeMin, rangeMax);
  
  const difficultyScore = calculateDifficultyScore(
    rangeMax - rangeMin + 1,
    maxAttempts,
    timeLimit
  );
  
  const params: LevelParams = {
    seed: actualSeed,
    levelNumber,
    rangeMin,
    rangeMax,
    maxAttempts,
    timeLimit,
    gameMode,
    targetNumber,
    hintStyle: HINT_STYLES[gameMode],
    difficultyScore,
  };
  
  return validateLevel(params);
}

export function regenerateLevel(params: LevelParams): LevelParams {
  const rng = new SeededRandom(params.seed);
  
  rng.next();
  
  const targetNumber = rng.nextInt(params.rangeMin, params.rangeMax);
  
  return {
    ...params,
    targetNumber,
  };
}

export function getHint(
  guess: number,
  target: number,
  hintStyle: LevelParams["hintStyle"],
  attemptsLeft: number
): { feedback: "higher" | "lower"; hint?: string; penalty?: number } {
  const feedback = guess < target ? "higher" : "lower";
  const distance = Math.abs(target - guess);
  
  switch (hintStyle) {
    case "basic":
      return { feedback };
      
    case "distance":
      let distanceHint = "";
      if (distance <= 2) distanceHint = "Very close!";
      else if (distance <= 5) distanceHint = "Getting warm";
      else if (distance <= 10) distanceHint = "Moderate distance";
      else distanceHint = "Far away";
      return { feedback, hint: distanceHint };
      
    case "hot_cold":
      let tempHint = "";
      const ratio = distance / 100;
      if (ratio <= 0.05) tempHint = "Burning hot!";
      else if (ratio <= 0.1) tempHint = "Very hot";
      else if (ratio <= 0.2) tempHint = "Warm";
      else if (ratio <= 0.4) tempHint = "Cool";
      else tempHint = "Freezing cold";
      return { feedback, hint: tempHint };
      
    case "penalty":
      const penaltyHint = attemptsLeft <= 2 ? "Critical! Limited attempts" : undefined;
      return { feedback, hint: penaltyHint, penalty: attemptsLeft <= 2 ? 1 : 0 };
      
    default:
      return { feedback };
  }
}

export function getModeDescription(mode: GameMode): string {
  switch (mode) {
    case "classic":
      return "Pure logic and deduction. No time limits, straightforward hints.";
    case "depth":
      return "Mining for numbers. Deeper ranges with distance-based hints.";
    case "strategic":
      return "Think carefully. Penalties for running low on attempts.";
    case "tactical":
      return "Fast-paced action. Tight time limits and thermal hints.";
  }
}

export function getModeIcon(mode: GameMode): string {
  switch (mode) {
    case "classic":
      return "zap";
    case "depth":
      return "layers";
    case "strategic":
      return "target";
    case "tactical":
      return "clock";
  }
}
