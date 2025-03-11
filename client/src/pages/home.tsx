import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Week } from "@shared/schema";
import { calculateCareerLevel, levelColors } from "@/lib/career";

export default function Home() {
  const { toast } = useToast();
  const [currentPeriodStart, setCurrentPeriodStart] = useState(1);
  const [inputValues, setInputValues] = useState<{[key: number]: string}>({});

  // Fetch all weeks
  const { data: weeks = [] } = useQuery<Week[]>({
    queryKey: ["/api/weeks"],
  });

  // Update week points - Optimize with debounce
  const updateWeek = useMutation({
    mutationFn: async ({ weekNumber, points }: { weekNumber: number; points: number }) => {
      await apiRequest("POST", `/api/weeks/${weekNumber}`, { points, weekNumber });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weeks"] });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Calculate current period total points
  const currentPeriodWeeks = weeks.filter(
    (w) => w.weekNumber >= currentPeriodStart && w.weekNumber < currentPeriodStart + 26
  );

  const periodPoints = currentPeriodWeeks.reduce((sum, week) => sum + week.points, 0);
  const { currentLevel, nextLevel, remainingPoints, message } = calculateCareerLevel(periodPoints);

  // Handle point input optimized
  const handlePointInput = useCallback((weekNumber: number, value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    setInputValues(prev => ({ ...prev, [weekNumber]: numericValue }));

    // Use the actual points from the state
    const points = parseInt(numericValue) || 0;
    if (points >= 0) {
      updateWeek.mutate({ weekNumber, points });
    }
  }, [updateWeek]);

  // Shift period window
  const shiftPeriod = useCallback((direction: 1 | -1) => {
    setCurrentPeriodStart(prev => {
      const newStart = prev + direction;
      return newStart >= 1 && newStart <= 55 ? newStart : prev; // 80 - 25 = maximum start position
    });
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
        HAYDI BAŞLAYALIM!
      </h1>

      {/* Kariyer Durumu */}
      {currentLevel && (
        <div className="text-center mb-8">
          <div className="text-xl font-semibold text-emerald-600">
            {`Tebrikler ${currentLevel} oldunuz!`}
          </div>
        </div>
      )}

      {/* Cetvel */}
      <div className="relative w-full max-w-6xl mx-auto overflow-hidden mb-8">
        <div className="flex overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-1 transition-all duration-300 ease-in-out min-w-full">
            {Array.from({ length: 80 }, (_, i) => i + 1).map((weekNumber) => {
              const week = weeks.find((w) => w.weekNumber === weekNumber);
              const isInCurrentPeriod = weekNumber >= currentPeriodStart && weekNumber < currentPeriodStart + 26;
              const isAchievementWeek = currentLevel && week?.points && week.points > 0;

              return (
                <Card 
                  key={weekNumber}
                  className={`flex-shrink-0 w-16 transition-colors duration-300 bg-white shadow-sm border
                    ${isInCurrentPeriod ? 'border-blue-500' : 'border-gray-100'}
                    ${isAchievementWeek && isInCurrentPeriod ? levelColors[currentLevel] : ''}`}
                >
                  <CardContent className="p-1 text-center">
                    <div className="text-xs font-medium text-gray-600 mb-1">
                      Hafta {weekNumber}
                    </div>
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={inputValues[weekNumber] || week?.points || ''}
                      onChange={(e) => handlePointInput(weekNumber, e.target.value)}
                      className="w-full text-center p-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Durum ve Navigation */}
        <div className="text-center mt-4 space-y-4">
          <div className="text-xl font-bold text-gray-800">
            26 haftalık toplam puan: {periodPoints}
          </div>
          {message && (
            <div className="text-lg text-blue-600">
              {message}
            </div>
          )}
          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => shiftPeriod(-1)} 
              disabled={currentPeriodStart <= 1}
              variant="outline"
              className="bg-white hover:bg-gray-50"
            >
              ← Geri
            </Button>
            <Button 
              onClick={() => shiftPeriod(1)}
              disabled={currentPeriodStart >= 55}
              variant="outline"
              className="bg-white hover:bg-gray-50"
            >
              İleri →
            </Button>
          </div>
        </div>
      </div>

      {/* Kariyer Seviyeleri */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full max-w-6xl mx-auto">
        {Object.entries(levelColors).map(([level, bgColor]) => (
          <Card 
            key={level} 
            className={`
              ${bgColor} border-none shadow-sm transition-all duration-300
              ${currentLevel === level ? 'ring-2 ring-blue-500 scale-105' : ''}
            `}
          >
            <CardContent className="p-4 text-center">
              <div className="font-semibold">{level}</div>
              <div className="text-sm text-gray-600">
                {level === 'JADE' ? '1,500 Puan' :
                 level === 'PEARL' ? '4,500 Puan' :
                 level === 'SAPPHIRE' ? '9,000 Puan' :
                 level === 'RUBY' ? '18,000 Puan' :
                 level === 'EMERALD' ? '36,000 Puan' :
                 level === 'DIAMOND' ? '75,000 Puan' :
                 level === 'BLUE_DIAMOND' ? '150,000 Puan' :
                 level === 'RED_DIAMOND' ? '300,000 Puan' :
                 level === 'BLACK_DIAMOND' ? '750,000 Puan' :
                 '1,500,000 Puan'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}