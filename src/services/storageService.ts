import { DailyLog } from "../models/types.js";
import { validateDailyLog } from "../utils/validation.js";

export class StorageService {
  private readonly storageKey = "exercise-tracker.logs.v1";

  getLogs(): DailyLog[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as DailyLog[];
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed
        .filter((item) => item && typeof item.date === "string" && Array.isArray(item.exercises))
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch {
      return [];
    }
  }

  saveLogs(logs: DailyLog[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(logs));
  }

  getLogByDate(date: string): DailyLog | null {
    return this.getLogs().find((log) => log.date === date) ?? null;
  }

  upsertLog(log: DailyLog): void {
    const errors = validateDailyLog(log);
    if (errors.length > 0) {
      throw new Error(errors.join(" "));
    }

    const logs = this.getLogs();
    const index = logs.findIndex((item) => item.date === log.date);

    if (index >= 0) {
      logs[index] = log;
    } else {
      logs.push(log);
    }

    logs.sort((a, b) => a.date.localeCompare(b.date));
    this.saveLogs(logs);
  }

  exportData(): string {
    return JSON.stringify(this.getLogs(), null, 2);
  }

  importData(rawJson: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(rawJson) as DailyLog[];
      if (!Array.isArray(parsed)) {
        return { success: false, message: "Invalid JSON structure. Expected an array." };
      }

      const cleaned: DailyLog[] = [];
      for (const item of parsed) {
        const errors = validateDailyLog(item);
        if (errors.length > 0) {
          return { success: false, message: `Import failed for ${item.date}: ${errors.join(" ")}` };
        }
        cleaned.push(item);
      }

      cleaned.sort((a, b) => a.date.localeCompare(b.date));
      this.saveLogs(cleaned);
      return { success: true, message: `Imported ${cleaned.length} daily logs.` };
    } catch {
      return { success: false, message: "Invalid JSON file." };
    }
  }
}
