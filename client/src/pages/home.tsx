import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
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
  const [totalWeeks] = useState(100); // Show 100 weeks

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
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Calculate current period total points
  const periodPoints = weeks
    .filter(
      (w) => w.weekNumber >= currentPeriodStart && w.weekNumber < currentPeriodStart + 26
    )
    .reduce((sum, week) => sum + week.points, 0);

  const { currentLevel, message } = calculateCareerLevel(periodPoints);

  // Handle point input
  const handlePointInput = (weekNumber: number, value: string) => {
    const points = parseInt(value) || 0;
    updateWeek.mutate({ weekNumber, points });
  };

  // Shift period window
  const shiftPeriod = (direction: 1 | -1) => {
    const newStart = currentPeriodStart + direction;
    if (newStart >= 1 && newStart <= totalWeeks - 25) {
      setCurrentPeriodStart(newStart);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
        Kariyer Takip Takvimi
      </h1>

      <div className="mb-8">
        <Card className="relative border-2 border-red-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <Button 
                onClick={() => shiftPeriod(-1)} 
                disabled={currentPeriodStart <= 1}
              >
                ← Önceki
              </Button>
              <div className="text-lg font-semibold">
                {currentPeriodStart}. - {currentPeriodStart + 25}. Haftalar
              </div>
              <Button 
                onClick={() => shiftPeriod(1)}
                disabled={currentPeriodStart >= totalWeeks - 25}
              >
                Sonraki →
              </Button>
            </div>

            <div className="text-center mb-4">
              <div className="text-xl font-bold mb-2">
                Toplam Puan: {periodPoints}
              </div>
              <div className="text-lg text-blue-600 font-medium">
                {message}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((weekNumber) => {
          const week = weeks.find((w) => w.weekNumber === weekNumber);
          const isInPeriod = weekNumber >= currentPeriodStart && weekNumber < currentPeriodStart + 26;
          const isAchievementWeek = isInPeriod && currentLevel && week?.points > 0;

          return (
            <Card 
              key={weekNumber}
              className={`
                ${isInPeriod ? 'border-red-500 border-2' : ''}
                ${isAchievementWeek ? levelColors[currentLevel] : ''}
              `}
            >
              <CardContent className="p-4">
                <div className="text-sm font-medium mb-2">
                  Hafta {weekNumber}
                </div>
                <Input
                  type="number"
                  min="0"
                  value={week?.points || ''}
                  onChange={(e) => handlePointInput(weekNumber, e.target.value)}
                  className="w-full"
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
