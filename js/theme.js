
class ThemeManager {
    constructor(storage) {
        this.storage = storage;
        this.minScale = 90;
        this.maxScale = 130;
        this.step = 10;

        const saved = this.storage.load();

        this.theme = saved.theme === "dark" ? "dark" : "light";
        this.scale = this.isValidScale(saved.scale) ? saved.scale : 100;
    }

    isValidScale(value) {
        return Number.isInteger(value) && value >= this.minScale && value <= this.maxScale;
    }

    apply() {
        const root = document.documentElement;

        root.setAttribute("data-bs-theme", this.theme);
        document.body.classList.toggle("dark-theme", this.theme === "dark");
        document.body.style.zoom = this.scale / 100;

        this.updatePanel();
    }

    persist() {
        this.storage.save({ theme: this.theme, scale: this.scale });
        this.apply();
    }

    toggleTheme() {
        this.theme = this.theme === "dark" ? "light" : "dark";
        this.persist();
    }

    changeScale(direction) {
        const next = this.scale + direction * this.step;

        if (next >= this.minScale && next <= this.maxScale) {
            this.scale = next;
            this.persist();
        }
    }

    reset() {
        this.theme = "light";
        this.scale = 100;
        this.storage.clear();
        this.apply();
    }

    renderPanel() {
        const panel = document.createElement("div");
        panel.className = "a11y-panel";
        panel.setAttribute("role", "group");
        panel.setAttribute("aria-label", "Display settings");

        panel.innerHTML = `
            <button type="button" class="a11y-btn" data-action="theme" aria-pressed="false"
                    title="Toggle dark mode">🌙</button>
            <button type="button" class="a11y-btn" data-action="smaller"
                    aria-label="Decrease text size" title="Smaller text">A−</button>
            <span class="a11y-scale" aria-live="polite"></span>
            <button type="button" class="a11y-btn" data-action="bigger"
                    aria-label="Increase text size" title="Bigger text">A+</button>
            <button type="button" class="a11y-btn" data-action="reset"
                    aria-label="Reset display settings" title="Reset">↺</button>
        `;

        panel.addEventListener("click", event => {
            const button = event.target.closest("button");
            if (!button) return;

            const action = button.dataset.action;

            if (action === "theme") this.toggleTheme();
            if (action === "smaller") this.changeScale(-1);
            if (action === "bigger") this.changeScale(1);
            if (action === "reset") this.reset();
        });

        document.body.appendChild(panel);
        this.panel = panel;
    }

    updatePanel() {
        if (!this.panel) return;

        const themeButton = this.panel.querySelector('[data-action="theme"]');
        const isDark = this.theme === "dark";

        themeButton.textContent = isDark ? "☀️" : "🌙";
        themeButton.setAttribute("aria-pressed", String(isDark));
        themeButton.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");

        this.panel.querySelector(".a11y-scale").textContent = `${this.scale}%`;
        this.panel.querySelector('[data-action="smaller"]').disabled = this.scale <= this.minScale;
        this.panel.querySelector('[data-action="bigger"]').disabled = this.scale >= this.maxScale;
    }
}

const themeManager = new ThemeManager(new StorageManager("petHomeDisplay", { theme: "light", scale: 100 }));
themeManager.renderPanel();
themeManager.apply();
