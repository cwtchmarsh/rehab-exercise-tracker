import { getTodayDateString, toReadableDate } from "../utils/date.js";
import { renderBarChart, renderLineChart } from "../utils/chart.js";
import { escapeHtml } from "../utils/sanitize.js";
export class DashboardView {
    constructor(storage, summaryService) {
        this.chart = null;
        this.storage = storage;
        this.summaryService = summaryService;
    }
    init(root) {
        root.innerHTML = `
      <section class="panel-card">
        <h2>Dashboard</h2>
        <div class="field-grid">
          <label>
            View
            <select id="dashboard-mode">
              <option value="daily">Daily Summary</option>
              <option value="weekly">Weekly Summary</option>
              <option value="monthly">Monthly Summary</option>
            </select>
          </label>
          <label>
            Date
            <input id="dashboard-date" type="date">
          </label>
        </div>

        <div id="dashboard-metrics" class="metric-grid"></div>

        <h3>Exercise Breakdown</h3>
        <ul id="exercise-breakdown" class="breakdown-list"></ul>

        <h3>Activity Chart</h3>
        <div class="chart-wrap">
          <canvas id="dashboard-chart" aria-label="Dashboard chart"></canvas>
        </div>
      </section>
    `;
        this.modeSelect = root.querySelector("#dashboard-mode");
        this.dateInput = root.querySelector("#dashboard-date");
        this.metricsEl = root.querySelector("#dashboard-metrics");
        this.breakdownEl = root.querySelector("#exercise-breakdown");
        this.chartCanvas = root.querySelector("#dashboard-chart");
        this.dateInput.value = getTodayDateString();
        this.modeSelect.addEventListener("change", () => this.refresh());
        this.dateInput.addEventListener("change", () => this.refresh());
        this.refresh();
    }
    refresh() {
        const logs = this.storage.getLogs();
        const mode = this.modeSelect.value;
        const selectedDate = this.dateInput.value;
        if (mode === "daily") {
            const log = this.storage.getLogByDate(selectedDate);
            const summary = this.summaryService.getDailySummary(log);
            this.renderMetrics([
                ["Total Minutes", summary.totalMinutes],
                ["Exercises", summary.totalExercises],
                ["Date", toReadableDate(selectedDate)],
            ]);
            this.renderBreakdown(summary.breakdownByExercise);
            const points = this.summaryService.getDailyTotalsForWeek(logs, selectedDate);
            this.chart = renderBarChart(this.chartCanvas, points.map((point) => point.date.slice(5)), points.map((point) => point.totalMinutes), "Minutes by Day", this.chart);
            return;
        }
        if (mode === "weekly") {
            const summary = this.summaryService.getWeeklySummary(logs, selectedDate);
            this.renderMetrics([
                ["Total Minutes", summary.totalMinutes],
                ["Avg Minutes / Day", summary.averageMinutesPerDay ?? 0],
                ["Exercises", summary.totalExercises],
            ]);
            this.renderBreakdown(summary.breakdownByExercise);
            const points = this.summaryService.getDailyTotalsForWeek(logs, selectedDate);
            this.chart = renderBarChart(this.chartCanvas, points.map((point) => point.date.slice(5)), points.map((point) => point.totalMinutes), "Weekly Daily Totals", this.chart);
            return;
        }
        const summary = this.summaryService.getMonthlySummary(logs, selectedDate);
        this.renderMetrics([
            ["Total Minutes", summary.totalMinutes],
            ["Weekly Average", summary.averageMinutesPerDay ?? 0],
            ["Exercises", summary.totalExercises],
        ]);
        this.renderBreakdown(summary.breakdownByExercise);
        const points = this.summaryService.getDailyTotalsForMonth(logs, selectedDate);
        this.chart = renderLineChart(this.chartCanvas, points.map((point) => point.date.slice(8)), points.map((point) => point.totalMinutes), "Monthly Trend", this.chart);
    }
    renderMetrics(entries) {
        this.metricsEl.innerHTML = entries
            .map(([label, value]) => `<article class="metric"><span>${escapeHtml(String(label))}</span><strong>${escapeHtml(String(value))}</strong></article>`)
            .join("");
    }
    renderBreakdown(breakdown) {
        const rows = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
        if (rows.length === 0) {
            this.breakdownEl.innerHTML = "<li>No exercises logged for this view.</li>";
            return;
        }
        this.breakdownEl.innerHTML = rows
            .map(([name, minutes]) => `<li><span>${escapeHtml(name)}</span><strong>${escapeHtml(String(minutes))} min</strong></li>`)
            .join("");
    }
}
//# sourceMappingURL=dashboardView.js.map