import test from "node:test";
import assert from "node:assert/strict";
import { SummaryService } from "../docs/assets/js/services/summaryService.js";

const summaryService = new SummaryService();

const logs = [
  {
    date: "2026-02-09",
    exercises: [{ id: "1", name: "Run", durationMinutes: 30 }],
  },
  {
    date: "2026-02-10",
    exercises: [{ id: "2", name: "Bike", durationMinutes: 20 }],
  },
  {
    date: "2026-02-17",
    exercises: [{ id: "3", name: "Run", durationMinutes: 60 }],
  },
];

test("weekly summary computes total and average", () => {
  const weekly = summaryService.getWeeklySummary(logs, "2026-02-10");
  assert.equal(weekly.totalMinutes, 50);
  assert.equal(weekly.averageMinutesPerDay, 7.1);
});

test("insights calculate longest streak and growth", () => {
  const insights = summaryService.getInsights(logs);
  assert.equal(insights.longestStreakDays, 2);
  assert.equal(insights.weeklyGrowthPercentage, 20);
});
