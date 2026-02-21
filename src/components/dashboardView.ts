import { StorageService } from "../services/storageService.js";
import { SummaryService } from "../services/summaryService.js";
import { getTodayDateString, toReadableDate } from "../utils/date.js";
import { renderBarChart, renderLineChart } from "../utils/chart.js";
import { escapeHtml } from "../utils/sanitize.js";

interface ChartLike {
  destroy: () => void;
}

export class DashboardView {
  private readonly storage: StorageService;
  private readonly summaryService: SummaryService;
  private chart: ChartLike | null = null;

  private dateInput!: HTMLInputElement;
  private modeSelect!: HTMLSelectElement;
  private metricsEl!: HTMLDivElement;
  private breakdownEl!: HTMLUListElement;
  private chartCanvas!: HTMLCanvasElement;

  constructor(storage: StorageService, summaryService: SummaryService) {
    this.storage = storage;
    this.summaryService = summaryService;
  }

  init(root: HTMLElement): void {
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

    this.modeSelect = root.querySelector<HTMLSelectElement>("#dashboard-mode") as HTMLSelectElement;
    this.dateInput = root.querySelector<HTMLInputElement>("#dashboard-date") as HTMLInputElement;
    this.metricsEl = root.querySelector<HTMLDivElement>("#dashboard-metrics") as HTMLDivElement;
    this.breakdownEl = root.querySelector<HTMLUListElement>("#exercise-breakdown") as HTMLUListElement;
    this.chartCanvas = root.querySelector<HTMLCanvasElement>("#dashboard-chart") as HTMLCanvasElement;

    this.dateInput.value = getTodayDateString();

    this.modeSelect.addEventListener("change", () => this.refresh());
    this.dateInput.addEventListener("change", () => this.refresh());

    this.refresh();
  }

  refresh(): void {
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
      this.chart = renderBarChart(
        this.chartCanvas,
        points.map((point) => point.date.slice(5)),
        points.map((point) => point.totalMinutes),
        "Minutes by Day",
        this.chart,
      );
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
      this.chart = renderBarChart(
        this.chartCanvas,
        points.map((point) => point.date.slice(5)),
        points.map((point) => point.totalMinutes),
        "Weekly Daily Totals",
        this.chart,
      );
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
    this.chart = renderLineChart(
      this.chartCanvas,
      points.map((point) => point.date.slice(8)),
      points.map((point) => point.totalMinutes),
      "Monthly Trend",
      this.chart,
    );
  }

  private renderMetrics(entries: Array<[string, string | number]>): void {
    this.metricsEl.innerHTML = entries
      .map(([label, value]) => `<article class="metric"><span>${escapeHtml(String(label))}</span><strong>${escapeHtml(String(value))}</strong></article>`)
      .join("");
  }

  private renderBreakdown(breakdown: Record<string, number>): void {
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
