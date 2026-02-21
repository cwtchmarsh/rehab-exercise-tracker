import { endOfMonth, endOfWeek, listDatesInRange, parseDate, startOfMonth, startOfWeek, weekLabel, } from "../utils/date.js";
export class SummaryService {
    getDailySummary(log) {
        if (!log) {
            return {
                totalMinutes: 0,
                totalExercises: 0,
                breakdownByExercise: {},
            };
        }
        return this.createSummary(log.exercises.map((exercise) => ({
            date: log.date,
            exercises: [exercise],
        })));
    }
    getWeeklySummary(logs, dateString) {
        const date = parseDate(dateString);
        const start = startOfWeek(date);
        const end = endOfWeek(date);
        const weeklyLogs = logs.filter((log) => {
            const logDate = parseDate(log.date);
            return logDate >= start && logDate <= end;
        });
        const summary = this.createSummary(weeklyLogs);
        summary.averageMinutesPerDay = Number((summary.totalMinutes / 7).toFixed(1));
        return summary;
    }
    getMonthlySummary(logs, dateString) {
        const date = parseDate(dateString);
        const start = startOfMonth(date);
        const end = endOfMonth(date);
        const monthlyLogs = logs.filter((log) => {
            const logDate = parseDate(log.date);
            return logDate >= start && logDate <= end;
        });
        const summary = this.createSummary(monthlyLogs);
        const weekTotals = this.getWeeklyTotals(monthlyLogs);
        const average = weekTotals.length > 0
            ? weekTotals.reduce((sum, value) => sum + value, 0) / weekTotals.length
            : 0;
        summary.averageMinutesPerDay = Number(average.toFixed(1));
        return summary;
    }
    getDailyTotalsForWeek(logs, dateString) {
        const date = parseDate(dateString);
        const start = startOfWeek(date);
        const end = endOfWeek(date);
        const weekDates = listDatesInRange(start, end);
        const map = this.mapDailyTotals(logs);
        return weekDates.map((day) => ({
            date: day,
            totalMinutes: map.get(day) ?? 0,
        }));
    }
    getDailyTotalsForMonth(logs, dateString) {
        const date = parseDate(dateString);
        const start = startOfMonth(date);
        const end = endOfMonth(date);
        const dates = listDatesInRange(start, end);
        const map = this.mapDailyTotals(logs);
        return dates.map((day) => ({
            date: day,
            totalMinutes: map.get(day) ?? 0,
        }));
    }
    getTrendSeries(logs) {
        const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
        return sorted.map((log) => ({
            date: log.date,
            totalMinutes: this.sumLogMinutes(log),
        }));
    }
    getInsights(logs) {
        const series = this.getTrendSeries(logs).filter((item) => item.totalMinutes > 0);
        const longestStreakDays = this.calculateLongestStreak(series.map((item) => item.date));
        let mostActiveDay = null;
        let maxMinutes = -1;
        for (const item of series) {
            if (item.totalMinutes > maxMinutes) {
                maxMinutes = item.totalMinutes;
                mostActiveDay = item.date;
            }
        }
        const weeklyGrowthPercentage = this.calculateWeeklyGrowth(logs);
        return {
            longestStreakDays,
            mostActiveDay,
            weeklyGrowthPercentage,
        };
    }
    createSummary(logs) {
        const breakdownByExercise = {};
        let totalMinutes = 0;
        let totalExercises = 0;
        for (const log of logs) {
            for (const exercise of log.exercises) {
                totalExercises += 1;
                totalMinutes += exercise.durationMinutes;
                const key = exercise.name.trim().toLowerCase();
                breakdownByExercise[key] = (breakdownByExercise[key] ?? 0) + exercise.durationMinutes;
            }
        }
        return {
            totalMinutes,
            totalExercises,
            breakdownByExercise,
        };
    }
    sumLogMinutes(log) {
        return log.exercises.reduce((sum, exercise) => sum + exercise.durationMinutes, 0);
    }
    mapDailyTotals(logs) {
        const totals = new Map();
        for (const log of logs) {
            totals.set(log.date, this.sumLogMinutes(log));
        }
        return totals;
    }
    calculateLongestStreak(sortedDates) {
        if (sortedDates.length === 0) {
            return 0;
        }
        const uniqueSorted = Array.from(new Set(sortedDates)).sort((a, b) => a.localeCompare(b));
        let longest = 1;
        let current = 1;
        for (let i = 1; i < uniqueSorted.length; i += 1) {
            const previousDateString = uniqueSorted[i - 1];
            const currentDateString = uniqueSorted[i];
            if (!previousDateString || !currentDateString) {
                continue;
            }
            const previous = parseDate(previousDateString);
            const currentDate = parseDate(currentDateString);
            previous.setDate(previous.getDate() + 1);
            if (previous.toDateString() === currentDate.toDateString()) {
                current += 1;
                longest = Math.max(longest, current);
            }
            else {
                current = 1;
            }
        }
        return longest;
    }
    calculateWeeklyGrowth(logs) {
        if (logs.length === 0) {
            return 0;
        }
        const latestLog = logs[logs.length - 1];
        if (!latestLog) {
            return 0;
        }
        const latestDate = parseDate(latestLog.date);
        const currentWeekStart = startOfWeek(latestDate);
        const previousWeekStart = new Date(currentWeekStart);
        previousWeekStart.setDate(previousWeekStart.getDate() - 7);
        const currentWeekEnd = endOfWeek(latestDate);
        const previousWeekEnd = new Date(previousWeekStart);
        previousWeekEnd.setDate(previousWeekStart.getDate() + 6);
        const currentWeekTotal = this.sumWithinRange(logs, currentWeekStart, currentWeekEnd);
        const previousWeekTotal = this.sumWithinRange(logs, previousWeekStart, previousWeekEnd);
        if (previousWeekTotal === 0) {
            return currentWeekTotal > 0 ? 100 : 0;
        }
        return Number((((currentWeekTotal - previousWeekTotal) / previousWeekTotal) * 100).toFixed(1));
    }
    sumWithinRange(logs, start, end) {
        let total = 0;
        for (const log of logs) {
            const logDate = parseDate(log.date);
            if (logDate >= start && logDate <= end) {
                total += this.sumLogMinutes(log);
            }
        }
        return total;
    }
    getWeeklyTotals(logs) {
        const totalsByWeek = new Map();
        for (const log of logs) {
            const key = weekLabel(log.date);
            totalsByWeek.set(key, (totalsByWeek.get(key) ?? 0) + this.sumLogMinutes(log));
        }
        return Array.from(totalsByWeek.values());
    }
}
//# sourceMappingURL=summaryService.js.map