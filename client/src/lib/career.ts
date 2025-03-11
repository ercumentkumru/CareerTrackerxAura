import { type CareerLevel, careerLevels } from "@shared/schema";

export function calculateCareerLevel(totalPoints: number): {
  currentLevel: CareerLevel | null;
  nextLevel: CareerLevel | null;
  remainingPoints: number;
  message: string;
} {
  const levels = Object.entries(careerLevels) as [CareerLevel, number][];

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

  const remainingPoints = nextLevel 
    ? careerLevels[nextLevel] - totalPoints
    : 0;

  let message = '';
  if (!currentLevel && nextLevel) {
    message = `Haydi ${nextLevel} olmak için ${remainingPoints} puan daha topla! Yapabilirsin!`;
  } else if (currentLevel && nextLevel) {
    message = `Haydi şimdi ${nextLevel} olma vakti, kalan puan ${remainingPoints}! Yapabilirsin!`;
  } else if (currentLevel) {
    message = 'En yüksek seviyeye ulaştınız! Muhteşem bir başarı!';
  }

  return {
    currentLevel,
    nextLevel,
    remainingPoints,
    message
  };
}

export const levelColors = {
  JADE: 'bg-emerald-100/50',
  PEARL: 'bg-slate-100/50',
  SAPPHIRE: 'bg-blue-100/50',
  RUBY: 'bg-red-100/50',
  EMERALD: 'bg-emerald-200/50',
  DIAMOND: 'bg-cyan-100/50',
  BLUE_DIAMOND: 'bg-blue-200/50',
  RED_DIAMOND: 'bg-red-200/50',
  BLACK_DIAMOND: 'bg-gray-800/50 text-white',
  AMBASSADOR: 'bg-purple-200/50'
} as const;