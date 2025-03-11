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
  JADE: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
  PEARL: 'bg-gradient-to-br from-slate-50 to-slate-100',
  SAPPHIRE: 'bg-gradient-to-br from-blue-50 to-blue-100',
  RUBY: 'bg-gradient-to-br from-red-50 to-red-100',
  EMERALD: 'bg-gradient-to-br from-green-50 to-green-100',
  DIAMOND: 'bg-gradient-to-br from-cyan-50 to-cyan-100',
  BLUE_DIAMOND: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
  RED_DIAMOND: 'bg-gradient-to-br from-rose-50 to-rose-100',
  BLACK_DIAMOND: 'bg-gradient-to-br from-gray-800 to-gray-900 text-white',
  AMBASSADOR: 'bg-gradient-to-br from-purple-50 to-purple-100'
} as const;