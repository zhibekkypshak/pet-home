class MatchQuiz {
    constructor(form, petList, storage) {
        this.$form = $(form);
        this.pets = petList;
        this.storage = storage;
        this.currentStep = 1;
        this.totalSteps = this.$form.find(".quiz-step").length;
    }

    showStep(step) {
        const $steps = this.$form.find(".quiz-step");

        $steps.filter(":visible").hide();
        $steps.filter(`[data-step="${step}"]`).removeAttr("hidden").fadeIn(250);

        this.currentStep = step;
        this.updateProgress();
        $("#quiz-error").text("");

        $("#prev-step").prop("disabled", step === 1);
        $("#next-step").prop("hidden", step === this.totalSteps);
        $("#submit-quiz").prop("hidden", step !== this.totalSteps);
    }

    updateProgress() {
        const answered = this.countAnswered();
        const percent = Math.round((answered / this.totalSteps) * 100);

        $("#quiz-progress").css("width", `${percent}%`);
        $("#quiz-progress").parent().attr("aria-valuenow", percent);
        $("#step-label").text(`Step ${this.currentStep} of ${this.totalSteps}`);
        $("#step-percent").text(`${percent}%`);
    }

    countAnswered() {
        return ["space", "time", "energy", "experience", "kids"]
            .filter(name => this.$form.find(`input[name="${name}"]:checked`).length > 0)
            .length;
    }

    validateStep(step) {
        const $step = this.$form.find(`.quiz-step[data-step="${step}"]`);
        const isValid = $step.find("input:checked").length > 0;

        if (!isValid) {
            $("#quiz-error").text("Please choose an answer to continue.");
            $step.addClass("shake");
            setTimeout(() => $step.removeClass("shake"), 400);
        }

        return isValid;
    }

    next() {
        if (this.validateStep(this.currentStep) && this.currentStep < this.totalSteps) {
            this.showStep(this.currentStep + 1);
        }
    }

    prev() {
        if (this.currentStep > 1) {
            this.showStep(this.currentStep - 1);
        }
    }

    getAnswers() {
        const value = name => this.$form.find(`input[name="${name}"]:checked`).val();

        return {
            space: value("space"),
            time: Number(value("time")),
            energy: Number(value("energy")),
            experience: Number(value("experience")),
            kids: value("kids") === "yes"
        };
    }

    calculateResults(answers) {
        return this.pets
            .map(pet => ({ pet, score: pet.getMatchScore(answers), reasons: pet.getMatchReasons(answers) }))
            .sort((a, b) => b.score - a.score);
    }

    submit() {
        if (!this.validateStep(this.currentStep)) return;

        const answers = this.getAnswers();
        const results = this.calculateResults(answers);

        this.storage.save({ answers, date: new Date().toISOString() });
        this.renderResults(results);
        this.renderSavedResult();
    }

    renderResults(results) {
        const [best, ...others] = results;
        const $results = $("#quiz-results");

        const reasons = best.reasons.length > 0
            ? `<ul>${best.reasons.map(reason => `<li>${reason}</li>`).join("")}</ul>`
            : "";

        const otherRows = others.slice(0, 3).map(item => `
            <div class="match-row">
                <img src="${item.pet.image}" alt="${item.pet.name}">
                <div class="flex-grow-1">
                    <div class="d-flex justify-content-between">
                        <a href="${item.pet.page}"><strong>${item.pet.name}</strong></a>
                        <span>${item.score}%</span>
                    </div>
                    <div class="progress" style="height: 8px;">
                        <div class="progress-bar bg-success" style="width: ${item.score}%"></div>
                    </div>
                </div>
            </div>
        `).join("");

        $results.html(`
            <div class="best-match">
                <img src="${best.pet.image}" alt="${best.pet.name}" class="best-match-img">
                <div>
                    <p class="text-uppercase small fw-bold text-success mb-1">Your best match</p>
                    <h2>${best.pet.name} <span class="badge bg-success">${best.score}%</span></h2>
                    <p class="mb-2">${best.pet.type} · ${best.pet.getAgeLabel()}</p>
                    ${reasons}
                    <div class="d-flex flex-wrap gap-2">
                        <a href="${best.pet.page}" class="btn button">Meet ${best.pet.name}</a>
                        <a href="${best.pet.getAdoptLink()}" class="btn btn-outline-success">Ask about adoption</a>
                    </div>
                </div>
            </div>
            <h3 class="h5 mt-4 mb-3">Other good matches</h3>
            ${otherRows}
            <button type="button" id="retake-quiz" class="btn btn-outline-secondary mt-3">↺ Retake quiz</button>
        `);

        this.$form.slideUp(300);
        $results.removeAttr("hidden").hide().fadeIn(400);
    }

    loadSaved() {
        const saved = this.storage.load();
        const answers = saved.answers;

        const isValid = answers
            && ["apartment", "house"].includes(answers.space)
            && [1, 2, 3].includes(answers.time)
            && [1, 2, 3].includes(answers.energy)
            && [1, 2, 3].includes(answers.experience)
            && typeof answers.kids === "boolean";

        return isValid ? saved : null;
    }

    renderSavedResult() {
        const saved = this.loadSaved();
        const $box = $("#saved-result");

        if (!saved) {
            $box.attr("hidden", true).empty();
            return;
        }

        const best = this.calculateResults(saved.answers)[0];
        const date = new Date(saved.date).toLocaleDateString();

        $box.html(`
            <span>💾 Your last result (${date}): <strong>${best.pet.name}</strong> - ${best.score}% match</span>
            <span class="d-flex gap-2">
                <button type="button" class="btn btn-sm btn-success" id="show-saved">Show</button>
                <button type="button" class="btn btn-sm btn-outline-danger" id="clear-saved-result">Clear</button>
            </span>
        `).removeAttr("hidden");
    }

    restoreAnswers(answers) {
        Object.entries(answers).forEach(([name, value]) => {
            const stringValue = name === "kids" ? (value ? "yes" : "no") : String(value);
            this.$form.find(`input[name="${name}"][value="${stringValue}"]`)
                .prop("checked", true)
                .closest(".quiz-option").addClass("selected");
        });
        this.updateProgress();
    }

    reset() {
        this.$form[0].reset();
        $("#quiz-results").attr("hidden", true).empty();
        this.$form.slideDown(300);
        this.showStep(1);
    }

    init() {
        $("#next-step").on("click", () => this.next());
        $("#prev-step").on("click", () => this.prev());

        this.$form.on("submit", event => {
            event.preventDefault();
            this.submit();
        });

        this.$form.on("change", "input[type=radio]", event => {
            $(event.target).closest(".quiz-step").find(".quiz-option").removeClass("selected");
            $(event.target).closest(".quiz-option").addClass("selected");
            $("#quiz-error").text("");
            this.updateProgress();
        });

        this.$form.on("keydown", event => {
            if (event.key === "Enter" && this.currentStep < this.totalSteps) {
                event.preventDefault();
                this.next();
            }
        });

        $(document).on("click", "#retake-quiz", () => this.reset());

        $(document).on("click", "#show-saved", () => {
            const saved = this.loadSaved();
            if (!saved) return;

            this.restoreAnswers(saved.answers);
            this.renderResults(this.calculateResults(saved.answers));
        });

        $(document).on("click", "#clear-saved-result", () => {
            this.storage.clear();
            this.renderSavedResult();
        });

        this.showStep(1);
        this.renderSavedResult();
    }
}

$(document).ready(function () {
    const quiz = new MatchQuiz(
        "#match-form",
        pets,
        new StorageManager("petHomeMatchResult", {})
    );

    quiz.init();
});
