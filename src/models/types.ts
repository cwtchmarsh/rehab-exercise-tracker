export interface ExerciseEntry {
  id: string;
  name: string;
  durationMinutes: number;
  sets?: number;
  reps?: number;
  distanceKm?: number;
  calories?: number;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  exercises: ExerciseEntry[];
}

export interface SummaryStats {
  totalMinutes: number;
  totalExercises: number;
  breakdownByExercise: Record<string, number>;
  averageMinutesPerDay?: number;
  weeklyGrowthPercentage?: number;
  longestStreakDays?: number;
  mostActiveDay?: string;
}

export interface TrendPoint {
  date: string;
  totalMinutes: number;
}

export interface TrendInsights {
  longestStreakDays: number;
  mostActiveDay: string | null;
  weeklyGrowthPercentage: number;
}
