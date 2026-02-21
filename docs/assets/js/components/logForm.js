import { getTodayDateString } from "../utils/date.js";
import { validateDailyLog } from "../utils/validation.js";
export class LogForm {
    constructor(storage, onDataChanged) {
        this.storage = storage;
        this.onDataChanged = onDataChanged;
        this.selectedDate = getTodayDateString();
    }
    init(root) {
        root.innerHTML = `
      <section class="panel-card">
        <h2>Daily Exercise Entry</h2>
        <p class="muted">Track multiple exercises for a day. Data is stored in your browser.</p>

        <div class="field-row">
          <label for="log-date">Date</label>
          <input id="log-date" type="date" required>
        </div>

        <div class="table-header">
          <h3>Exercises</h3>
          <button id="add-row" type="button" class="ghost">Add Exercise</button>
        </div>
        <div id="exercise-rows" class="exercise-rows"></div>

        <div class="actions">
          <button id="save-log" type="button">Save Day</button>
          <button id="clear-day" type="button" class="ghost">Clear Day</button>
          <span>Total minutes: <strong id="total-minutes">0</strong></span>
        </div>
        <p id="log-status" role="status" class="status"></p>
      </section>

      <section class="panel-card">
        <h3>Data Tools</h3>
        <div class="actions wrap">
          <button id="export-json" type="button" class="ghost">Export JSON</button>
          <label class="file-label" for="import-json">Import JSON</label>
          <input id="import-json" type="file" accept="application/json">
          <button id="load-demo" type="button" class="ghost">Load Example Data</button>
        </div>
      </section>
    `;
        this.dateInput = root.querySelector("#log-date");
        this.rowsContainer = root.querySelector("#exercise-rows");
        this.totalMinutesEl = root.querySelector("#total-minutes");
        this.statusEl = root.querySelector("#log-status");
        this.importInput = root.querySelector("#import-json");
        this.dateInput.value = this.selectedDate;
        root.querySelector("#add-row")?.addEventListener("click", () => {
            this.rowsContainer.append(this.createRow());
            this.updateTotalMinutes();
        });
        root.querySelector("#save-log")?.addEventListener("click", () => this.save());
        root.querySelector("#clear-day")?.addEventListener("click", () => this.clearDay());
        root.querySelector("#export-json")?.addEventListener("click", () => this.exportJson());
        root.querySelector("#load-demo")?.addEventListener("click", () => {
            void this.loadDemoData();
        });
        this.dateInput.addEventListener("change", () => {
            this.selectedDate = this.dateInput.value;
            this.loadDate(this.selectedDate);
        });
        this.importInput.addEventListener("change", () => {
            const file = this.importInput.files?.[0];
            if (!file) {
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                const text = typeof reader.result === "string" ? reader.result : "";
                const result = this.storage.importData(text);
                this.setStatus(result.message, result.success);
                if (result.success) {
                    this.loadDate(this.selectedDate);
                    this.onDataChanged();
                }
            };
            reader.readAsText(file);
        });
        this.loadDate(this.selectedDate);
    }
    loadDate(date) {
        const log = this.storage.getLogByDate(date);
        this.rowsContainer.innerHTML = "";
        if (!log || log.exercises.length === 0) {
            this.rowsContainer.append(this.createRow());
        }
        else {
            log.exercises.forEach((entry) => this.rowsContainer.append(this.createRow(entry)));
        }
        this.updateTotalMinutes();
        this.setStatus("", true);
    }
    save() {
        const exercises = this.readRows();
        const log = {
            date: this.selectedDate,
            exercises,
        };
        const errors = validateDailyLog(log);
        if (errors.length > 0) {
            this.setStatus(errors[0] ?? "Validation failed.", false);
            return;
        }
        this.storage.upsertLog(log);
        this.setStatus("Saved successfully.", true);
        this.onDataChanged();
    }
    clearDay() {
        const existing = this.storage.getLogs().filter((log) => log.date !== this.selectedDate);
        this.storage.saveLogs(existing);
        this.rowsContainer.innerHTML = "";
        this.rowsContainer.append(this.createRow());
        this.updateTotalMinutes();
        this.setStatus("Day cleared.", true);
        this.onDataChanged();
    }
    readRows() {
        const rows = Array.from(this.rowsContainer.querySelectorAll(".exercise-row"));
        return rows
            .map((row) => {
            const name = this.readInput(row, "name");
            const duration = Number(this.readInput(row, "duration"));
            const sets = this.optionalNumber(this.readInput(row, "sets"));
            const reps = this.optionalNumber(this.readInput(row, "reps"));
            const distanceKm = this.optionalNumber(this.readInput(row, "distance"));
            const calories = this.optionalNumber(this.readInput(row, "calories"));
            return {
                id: crypto.randomUUID(),
                name,
                durationMinutes: duration,
                sets,
                reps,
                distanceKm,
                calories,
            };
        })
            .filter((entry) => entry.name || Number.isFinite(entry.durationMinutes));
    }
    readInput(row, field) {
        return row.querySelector(`[data-field="${field}"]`)?.value.trim() ?? "";
    }
    optionalNumber(value) {
        if (!value) {
            return undefined;
        }
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    }
    createRow(entry) {
        const row = document.createElement("article");
        row.className = "exercise-row";
        row.innerHTML = `
      <input data-field="name" placeholder="Exercise name" required>
      <input data-field="duration" type="number" min="1" placeholder="Minutes" required>
      <input data-field="sets" type="number" min="0" placeholder="Sets">
      <input data-field="reps" type="number" min="0" placeholder="Reps">
      <input data-field="distance" type="number" min="0" step="0.1" placeholder="Distance km">
      <input data-field="calories" type="number" min="0" placeholder="Calories">
      <button type="button" class="danger" aria-label="Remove exercise">Remove</button>
    `;
        const setValue = (field, value) => {
            const input = row.querySelector(`[data-field="${field}"]`);
            if (input && value !== undefined) {
                input.value = String(value);
            }
        };
        setValue("name", entry?.name);
        setValue("duration", entry?.durationMinutes);
        setValue("sets", entry?.sets);
        setValue("reps", entry?.reps);
        setValue("distance", entry?.distanceKm);
        setValue("calories", entry?.calories);
        row.querySelectorAll("input").forEach((input) => {
            input.addEventListener("input", () => this.updateTotalMinutes());
        });
        row.querySelector("button")?.addEventListener("click", () => {
            row.remove();
            if (this.rowsContainer.children.length === 0) {
                this.rowsContainer.append(this.createRow());
            }
            this.updateTotalMinutes();
        });
        return row;
    }
    updateTotalMinutes() {
        const total = Array.from(this.rowsContainer.querySelectorAll('[data-field="duration"]'))
            .map((input) => Number(input.value))
            .filter((value) => Number.isFinite(value) && value > 0)
            .reduce((sum, value) => sum + value, 0);
        this.totalMinutesEl.textContent = String(total);
    }
    setStatus(message, success) {
        this.statusEl.textContent = message;
        this.statusEl.classList.toggle("error", !success && message.length > 0);
    }
    exportJson() {
        const json = this.storage.exportData();
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `exercise-tracker-${this.selectedDate}.json`;
        anchor.click();
        URL.revokeObjectURL(url);
    }
    async loadDemoData() {
        try {
            const response = await fetch("./assets/example-data.json");
            if (!response.ok) {
                throw new Error("Could not load example data.");
            }
            const text = await response.text();
            const result = this.storage.importData(text);
            this.setStatus(result.message, result.success);
            if (result.success) {
                this.loadDate(this.selectedDate);
                this.onDataChanged();
            }
        }
        catch {
            this.setStatus("Unable to load example data.", false);
        }
    }
}
//# sourceMappingURL=logForm.js.map