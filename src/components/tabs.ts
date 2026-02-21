export class Tabs {
  private readonly buttons: NodeListOf<HTMLButtonElement>;
  private readonly panels: NodeListOf<HTMLElement>;

  constructor(buttonSelector: string, panelSelector: string) {
    this.buttons = document.querySelectorAll<HTMLButtonElement>(buttonSelector);
    this.panels = document.querySelectorAll<HTMLElement>(panelSelector);
  }

  init(): void {
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

  activate(targetId: string): void {
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
