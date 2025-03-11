import { type CareerLevel, careerLevels } from "@shared/schema";

export function calculateCareerLevel(totalPoints: number): {
  currentLevel: CareerLevel | null;
  nextLevel: CareerLevel | null;
  remainingPoints: number;
  message: string;
} {
  const levels = Object.entries(careerLevels) as [CareerLevel, number][];
  
  // Find current and next level
  let currentLevel: CareerLevel | null = null;
  let nextLevel: CareerLevel | null = null;
  
  for (let i = 0; i < levels.length; i++) {
    if (totalPoints >= levels[i][1]) {
      currentLevel = levels[i][0];
      nextLevel = levels[i + 1]?.[0] || null;
    } else {
      if (!currentLevel) {
        nextLevel = levels[i][0];
      }
      break;
    }
  }

  // Calculate remaining points for next level
  const remainingPoints = nextLevel 
    ? careerLevels[nextLevel] - totalPoints
    : 0;

  // Generate message
  let message = '';
  if (currentLevel) {
    message = `Tebrikler ${currentLevel} oldunuz!`;
    if (nextLevel) {
      message += ` Haydi şimdi ${nextLevel} olma vakti, kalan puan ${remainingPoints}! Yapabilirsin!`;
    } else {
      message += ' En yüksek seviyeye ulaştınız!';
    }
  } else if (nextLevel) {
    message = `Haydi ${nextLevel} olmak için ${remainingPoints} puan daha topla! Yapabilirsin!`;
  }

  return {
    currentLevel,
    nextLevel,
    remainingPoints,
    message
  };
}

export const levelColors = {
  JADE: 'bg-emerald-100',
  PEARL: 'bg-slate-100',
  SAPPHIRE: 'bg-blue-100',
  RUBY: 'bg-red-100',
  EMERALD: 'bg-emerald-300',
  DIAMOND: 'bg-cyan-100',
  BLUE_DIAMOND: 'bg-blue-300',
  RED_DIAMOND: 'bg-red-300',
  BLACK_DIAMOND: 'bg-gray-900',
  AMBASSADOR: 'bg-purple-300'
} as const;
