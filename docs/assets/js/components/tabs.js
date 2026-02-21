export class Tabs {
    constructor(buttonSelector, panelSelector) {
        this.buttons = document.querySelectorAll(buttonSelector);
        this.panels = document.querySelectorAll(panelSelector);
    }
    init() {
        this.buttons.forEach((button) => {
            button.addEventListener("click", () => {
                const target = button.dataset.tab;
                if (!target) {
                    return;
                }
                this.activate(target);
            });
        });
    }
    activate(targetId) {
        this.buttons.forEach((button) => {
            const active = button.dataset.tab === targetId;
            button.classList.toggle("active", active);
            button.setAttribute("aria-selected", String(active));
        });
        this.panels.forEach((panel) => {
            const active = panel.id === targetId;
            panel.classList.toggle("active", active);
            panel.hidden = !active;
        });
    }
}
//# sourceMappingURL=tabs.js.map