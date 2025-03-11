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
    setCurrentPeriodStart(prev => Math.max(1, prev + direction));
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
        HAYDI BAŞLAYALIM!
      </h1>

      <div className="flex flex-col items-center gap-8">
        {/* Kariyer Durumu */}
        <Card className="w-full max-w-2xl bg-white shadow-sm border-none">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-3">
              <div className="text-2xl font-bold text-gray-800">
                26 haftalık toplam puan: {periodPoints}
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

        {/* Cetvel */}
        <div className="relative w-full max-w-6xl">
          <div className="flex items-center">
            <Button 
              onClick={() => shiftPeriod(-1)} 
              disabled={currentPeriodStart <= 1}
              variant="ghost"
              className="text-gray-600"
            >
              ← Geri
            </Button>

            <div className="flex-1 overflow-x-auto">
              <div className="flex gap-2 transition-transform duration-300 ease-in-out">
                {Array.from({ length: 26 }, (_, i) => i + currentPeriodStart).map((weekNumber) => {
                  const week = weeks.find((w) => w.weekNumber === weekNumber);
                  const isAchievementWeek = currentLevel && week?.points && week.points > 0;

                  return (
                    <Card 
                      key={weekNumber}
                      className={`flex-shrink-0 w-20 transition-colors duration-300 bg-white shadow-sm border-none
                        ${isAchievementWeek ? levelColors[currentLevel] : ''}`}
                    >
                      <CardContent className="p-2 text-center">
                        <div className="text-sm font-medium text-gray-600 mb-1">
                          Hafta {weekNumber}
                        </div>
                        <Input
                          type="number"
                          min="0"
                          value={week?.points || ''}
                          onChange={(e) => handlePointInput(weekNumber, e.target.value)}
                          className="w-full text-center p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <Button 
              onClick={() => shiftPeriod(1)}
              variant="ghost"
              className="text-gray-600"
            >
              İleri →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}