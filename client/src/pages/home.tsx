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
  const [totalWeeks] = useState(100);

  // Fetch all weeks
  const { data: weeks = [] } = useQuery<Week[]>({
    queryKey: ["/api/weeks"],
  });

  // Update week points
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
    const points = parseInt(value) || 0;
    if (points >= 0) {
      updateWeek.mutate({ weekNumber, points });
    }
  }, [updateWeek]);

  // Shift period window
  const shiftPeriod = useCallback((direction: 1 | -1) => {
    const newStart = currentPeriodStart + direction;
    if (newStart >= 1 && newStart <= totalWeeks - 25) {
      setCurrentPeriodStart(newStart);
    }
  }, [currentPeriodStart, totalWeeks]);

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text mb-8">
        Kariyer Takip Takvimi
      </h1>

      <Card className="neumorphic border-none">
        <CardContent className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <Button 
              onClick={() => shiftPeriod(-1)} 
              disabled={currentPeriodStart <= 1}
              className="neumorphic hover:shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] border-none"
            >
              ← Önceki
            </Button>
            <div className="text-lg font-semibold">
              {currentPeriodStart}. - {currentPeriodStart + 25}. Haftalar
            </div>
            <Button 
              onClick={() => shiftPeriod(1)}
              disabled={currentPeriodStart >= totalWeeks - 25}
              className="neumorphic hover:shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] border-none"
            >
              Sonraki →
            </Button>
          </div>

          <div className="text-center space-y-3 p-4 rounded-lg neumorphic-inset">
            <div className="text-2xl font-bold">
              Toplam Puan: {periodPoints}
            </div>
            {currentLevel && (
              <div className="text-xl font-semibold text-emerald-600">
                {`Tebrikler ${currentLevel} oldunuz!`}
              </div>
            )}
            {message && (
              <div className="text-lg text-blue-600">
                {message}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {Array.from({ length: 26 }, (_, i) => i + currentPeriodStart).map((weekNumber) => {
          const week = weeks.find((w) => w.weekNumber === weekNumber);
          const isAchievementWeek = currentLevel && week?.points && week.points > 0;

          return (
            <Card 
              key={weekNumber}
              className={`neumorphic border-none transition-all duration-300 ${
                isAchievementWeek ? levelColors[currentLevel] : ''
              }`}
            >
              <CardContent className="p-4 space-y-2">
                <div className="text-sm font-medium text-center">
                  Hafta {weekNumber}
                </div>
                <Input
                  type="number"
                  min="0"
                  value={week?.points || ''}
                  onChange={(e) => handlePointInput(weekNumber, e.target.value)}
                  className="week-input"
                  placeholder="Puan"
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}