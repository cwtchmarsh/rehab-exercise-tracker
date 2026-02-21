import { StorageService } from "../services/storageService.js";
import { SummaryService } from "../services/summaryService.js";
import { toReadableDate } from "../utils/date.js";
import { renderLineChart } from "../utils/chart.js";

interface ChartLike {
  destroy: () => void;
}

export class TrendsView {
  private readonly storage: StorageService;
  private readonly summaryService: SummaryService;
  private chart: ChartLike | null = null;

  private insightsEl!: HTMLDivElement;
  private chartCanvas!: HTMLCanvasElement;

  constructor(storage: StorageService, summaryService: SummaryService) {
    this.storage = storage;
    this.summaryService = summaryService;
  }

  init(root: HTMLElement): void {
    root.innerHTML = `
      <section class="panel-card">
        <h2>Trends & Insights</h2>
        <div id="insights" class="metric-grid"></div>
        <h3>Exercise Minutes Over Time</h3>
        <div class="chart-wrap large">
          <canvas id="trends-chart" aria-label="Exercise trend chart"></canvas>
        </div>
      </section>
    `;

    this.insightsEl = root.querySelector<HTMLDivElement>("#insights") as HTMLDivElement;
    this.chartCanvas = root.querySelector<HTMLCanvasElement>("#trends-chart") as HTMLCanvasElement;

    this.refresh();
  }

  refresh(): void {
    const logs = this.storage.getLogs();
    const series = this.summaryService.getTrendSeries(logs);
    const insights = this.summaryService.getInsights(logs);

    this.insightsEl.innerHTML = `
      <article class="metric"><span>Longest Streak</span><strong>${insights.longestStreakDays} days</strong></article>
      <article class="metric"><span>Most Active Day</span><strong>${insights.mostActiveDay ? toReadableDate(insights.mostActiveDay) : "N/A"}</strong></article>
      <article class="metric"><span>Weekly Growth</span><strong>${insights.weeklyGrowthPercentage}%</strong></article>
    `;

    this.chart = renderLineChart(
      this.chartCanvas,
      series.map((item) => item.date),
      series.map((item) => item.totalMinutes),
      "Minutes",
      this.chart,
    );
  }
}
