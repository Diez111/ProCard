import React from 'react';
import { Progress } from './ui/progress';

export function TimeProgress() {
  const [progress, setProgress] = React.useState({
    year: 0,
    month: 0,
    week: 0
  });

  React.useEffect(() => {
    const calculateProgress = () => {
      const now = new Date();
      
      // Progreso del año
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
      const yearProgress = ((now.getTime() - startOfYear.getTime()) / 
        (endOfYear.getTime() - startOfYear.getTime())) * 100;

      // Progreso del mes
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const monthProgress = ((now.getTime() - startOfMonth.getTime()) / 
        (endOfMonth.getTime() - startOfMonth.getTime())) * 100;

      // Progreso de la semana
      const currentDay = now.getDay() || 7; // Convertir 0 (domingo) a 7
      const weekProgress = ((currentDay - 1) / 7) * 100;

      setProgress({
        year: Math.round(yearProgress),
        month: Math.round(monthProgress),
        week: Math.round(weekProgress)
      });
    };

    calculateProgress();
    const interval = setInterval(calculateProgress, 1000 * 60 * 60); // Actualizar cada hora

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progreso del año</span>
          <span>{progress.year}%</span>
        </div>
        <Progress value={progress.year} className="h-2" />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progreso del mes</span>
          <span>{progress.month}%</span>
        </div>
        <Progress value={progress.month} className="h-2" />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progreso de la semana</span>
          <span>{progress.week}%</span>
        </div>
        <Progress value={progress.week} className="h-2" />
      </div>
    </div>
  );
} 