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
  JADE: 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white',
  PEARL: 'bg-gradient-to-r from-gray-100 to-gray-300',
  SAPPHIRE: 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white',
  RUBY: 'bg-gradient-to-r from-red-400 to-pink-500 text-white',
  EMERALD: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white',
  DIAMOND: 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white',
  BLUE_DIAMOND: 'bg-gradient-to-r from-indigo-400 to-violet-500 text-white',
  RED_DIAMOND: 'bg-gradient-to-r from-rose-400 to-red-500 text-white',
  BLACK_DIAMOND: 'bg-gradient-to-r from-gray-800 to-gray-900 text-white',
  AMBASSADOR: 'bg-gradient-to-r from-purple-400 to-fuchsia-500 text-white'
} as const;