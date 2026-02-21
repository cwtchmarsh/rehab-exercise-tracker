import { toReadableDate } from "../utils/date.js";
import { renderLineChart } from "../utils/chart.js";
export class TrendsView {
    constructor(storage, summaryService) {
        this.chart = null;
        this.storage = storage;
        this.summaryService = summaryService;
    }
    init(root) {
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
        this.insightsEl = root.querySelector("#insights");
        this.chartCanvas = root.querySelector("#trends-chart");
        this.refresh();
    }
    refresh() {
        const logs = this.storage.getLogs();
        const series = this.summaryService.getTrendSeries(logs);
        const insights = this.summaryService.getInsights(logs);
        this.insightsEl.innerHTML = `
      <article class="metric"><span>Longest Streak</span><strong>${insights.longestStreakDays} days</strong></article>
      <article class="metric"><span>Most Active Day</span><strong>${insights.mostActiveDay ? toReadableDate(insights.mostActiveDay) : "N/A"}</strong></article>
      <article class="metric"><span>Weekly Growth</span><strong>${insights.weeklyGrowthPercentage}%</strong></article>
    `;
        this.chart = renderLineChart(this.chartCanvas, series.map((item) => item.date), series.map((item) => item.totalMinutes), "Minutes", this.chart);
    }
}
//# sourceMappingURL=trendsView.js.map