import { DailyLog, ExerciseEntry } from "../models/types.js";

export function validateExercise(entry: ExerciseEntry): string[] {
  const errors: string[] = [];

  if (!entry.name.trim()) {
    errors.push("Exercise name is required.");
  }
  if (!Number.isFinite(entry.durationMinutes) || entry.durationMinutes <= 0) {
    errors.push("Duration must be a positive number.");
  }
  if (entry.sets !== undefined && entry.sets < 0) {
    errors.push("Sets cannot be negative.");
  }
  if (entry.reps !== undefined && entry.reps < 0) {
    errors.push("Reps cannot be negative.");
  }
  if (entry.distanceKm !== undefined && entry.distanceKm < 0) {
    errors.push("Distance cannot be negative.");
  }
  if (entry.calories !== undefined && entry.calories < 0) {
    errors.push("Calories cannot be negative.");
  }

  return errors;
}

export function validateDailyLog(log: DailyLog): string[] {
  const errors: string[] = [];

  if (!/^\d{4}-\d{2}-\d{2}$/.test(log.date)) {
    errors.push("Date must be formatted as YYYY-MM-DD.");
  }
  if (log.exercises.length === 0) {
    errors.push("Add at least one exercise entry.");
  }

  log.exercises.forEach((entry, index) => {
    const entryErrors = validateExercise(entry);
    for (const error of entryErrors) {
      errors.push(`Exercise ${index + 1}: ${error}`);
    }
  });

  return errors;
}
