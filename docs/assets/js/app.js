import { DashboardView } from "./components/dashboardView.js";
import { LogForm } from "./components/logForm.js";
import { Tabs } from "./components/tabs.js";
import { TrendsView } from "./components/trendsView.js";
import { StorageService } from "./services/storageService.js";
import { SummaryService } from "./services/summaryService.js";
export class ExerciseTrackerApp {
    constructor() {
        this.storage = new StorageService();
        this.summaryService = new SummaryService();
        this.logForm = new LogForm(this.storage, () => this.refreshViews());
        this.dashboardView = new DashboardView(this.storage, this.summaryService);
        this.trendsView = new TrendsView(this.storage, this.summaryService);
    }
    init() {
        this.initTheme();
        const tabs = new Tabs(".tab-button", ".tab-panel");
        tabs.init();
        tabs.activate("tab-log");
        const logRoot = document.querySelector("#tab-log");
        const dashboardRoot = document.querySelector("#tab-dashboard");
        const trendsRoot = document.querySelector("#tab-trends");
        if (!logRoot || !dashboardRoot || !trendsRoot) {
            throw new Error("Missing application root elements.");
        }
        this.logForm.init(logRoot);
        this.dashboardView.init(dashboardRoot);
        this.trendsView.init(trendsRoot);
    }
    refreshViews() {
        this.dashboardView.refresh();
        this.trendsView.refresh();
    }
    initTheme() {
        const key = "exercise-tracker.theme";
        const root = document.documentElement;
        const toggle = document.querySelector("#theme-toggle");
        const saved = localStorage.getItem(key);
        if (saved === "dark") {
            root.classList.add("dark");
            if (toggle) {
                toggle.checked = true;
            }
        }
        toggle?.addEventListener("change", () => {
            const isDark = toggle.checked;
            root.classList.toggle("dark", isDark);
            localStorage.setItem(key, isDark ? "dark" : "light");
        });
    }
}
//# sourceMappingURL=app.js.map