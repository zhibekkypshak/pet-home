class ApiService {
    constructor(baseUrl, timeoutMs = 8000) {
        this.baseUrl = baseUrl;
        this.timeoutMs = timeoutMs;
    }

    async get(path) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);

        try {
            const response = await fetch(this.baseUrl + path, { signal: controller.signal });

            if (!response.ok) {
                throw new Error(`Server answered with status ${response.status}.`);
            }

            return await response.json();
        } catch (error) {
            if (error.name === "AbortError") {
                throw new Error("The request took too long. Check your internet connection.");
            }
            if (error instanceof TypeError) {
                throw new Error("Network error - you might be offline.");
            }
            throw error;
        } finally {
            clearTimeout(timer);
        }
    }
}

class PhotoCollection {
    constructor(storage) {
        this.storage = storage;

        this.photos = this.storage.load().filter(photo =>
            photo && typeof photo.id === "string" && typeof photo.url === "string"
        );
    }

    getAll() {
        return this.photos;
    }

    has(url) {
        return this.photos.some(photo => photo.url === url);
    }

    add(url, breed) {
        if (this.has(url)) return;

        this.photos.unshift({
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            url: url,
            breed: breed,
            note: "",
            savedAt: new Date().toISOString()
        });
        this.save();
    }

    updateNote(id, note) {
        const photo = this.photos.find(item => item.id === id);
        if (!photo) return;

        photo.note = note.trim().slice(0, 60);
        this.save();
    }

    remove(id) {
        this.photos = this.photos.filter(photo => photo.id !== id);
        this.save();
    }

    clear() {
        this.photos = [];
        this.storage.clear();
    }

    save() {
        this.storage.save(this.photos);
    }
}

const dogApi = new ApiService("https://dog.ceo/api");
const catApi = new ApiService("https://catfact.ninja");
const savedPhotos = new PhotoCollection(new StorageManager("petHomeSavedPhotos", []));
const lastBreedStorage = new StorageManager("petHomeLastBreed", { breed: "" });

let allBreeds = [];

const breedSearch = document.getElementById("breed-search");
const breedSelect = document.getElementById("breed-select");
const photoCount = document.getElementById("photo-count");
const loadButton = document.getElementById("load-photos");
const randomButton = document.getElementById("random-breed");
const breedInfo = document.getElementById("breed-info");
const apiStatus = document.getElementById("api-status");
const dogGallery = document.getElementById("dog-gallery");
const savedGallery = document.getElementById("saved-gallery");
const savedEmpty = document.getElementById("saved-empty");
const savedCount = document.getElementById("saved-count");
const clearSavedButton = document.getElementById("clear-saved");
const catFact = document.getElementById("cat-fact");
const newFactButton = document.getElementById("new-fact");

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function formatBreedName(value) {
    return value.split("/").reverse().map(capitalize).join(" ");
}

function showStatus(type, message, retryAction) {
    apiStatus.innerHTML = "";

    if (type === "loading") {
        apiStatus.innerHTML = `
            <div class="d-flex align-items-center gap-2 text-muted">
                <div class="spinner-border spinner-border-sm text-success" role="status"></div>
                <span></span>
            </div>`;
        apiStatus.querySelector("span").textContent = message;
        return;
    }

    const alertClass = {
        success: "alert-success",
        empty: "alert-warning",
        error: "alert-danger"
    }[type];

    const alert = document.createElement("div");
    alert.className = `alert ${alertClass} d-flex flex-wrap align-items-center gap-2 mb-0`;
    alert.textContent = message;

    if (retryAction) {
        const retry = document.createElement("button");
        retry.className = "btn btn-sm btn-outline-dark ms-auto";
        retry.textContent = "Try again";
        retry.addEventListener("click", retryAction);
        alert.appendChild(retry);
    }

    apiStatus.appendChild(alert);
}

function setControlsEnabled(enabled) {
    breedSelect.disabled = !enabled;
    loadButton.disabled = !enabled;
    randomButton.disabled = !enabled;
}

async function loadBreeds() {
    showStatus("loading", "Loading breed list...");
    setControlsEnabled(false);

    try {
        const data = await dogApi.get("/breeds/list/all");

        allBreeds = Object.entries(data.message).flatMap(([breed, subBreeds]) =>
            subBreeds.length === 0
                ? [{ value: breed, label: formatBreedName(breed) }]
                : subBreeds.map(sub => ({ value: `${breed}/${sub}`, label: formatBreedName(`${breed}/${sub}`) }))
        );

        allBreeds.sort((a, b) => a.label.localeCompare(b.label));

        if (allBreeds.length === 0) {
            showStatus("empty", "The API returned no breeds. Please try again later.", loadBreeds);
            return;
        }

        renderBreedOptions(allBreeds);
        setControlsEnabled(true);

        const lastBreed = lastBreedStorage.load().breed;
        if (allBreeds.some(breed => breed.value === lastBreed)) {
            breedSelect.value = lastBreed;
        }

        showStatus("success", `${allBreeds.length} breeds loaded. Choose one and click “Show photos”.`);
    } catch (error) {
        breedSelect.innerHTML = "<option>Breeds unavailable</option>";
        showStatus("error", `Could not load breeds. ${error.message}`, loadBreeds);
    }
}

function renderBreedOptions(list) {
    breedSelect.innerHTML = "";

    for (const breed of list) {
        const option = document.createElement("option");
        option.value = breed.value;
        option.textContent = breed.label;
        breedSelect.appendChild(option);
    }
}

breedSearch.addEventListener("input", () => {
    if (allBreeds.length === 0) return;

    const query = breedSearch.value.trim().toLowerCase();
    const matches = allBreeds.filter(breed => breed.label.toLowerCase().includes(query));

    if (matches.length === 0) {
        breedSelect.innerHTML = "<option value=''>No matching breeds</option>";
        breedSelect.disabled = true;
        loadButton.disabled = true;
        breedInfo.textContent = "";
        showStatus("empty", `No breed matches “${breedSearch.value.trim()}”.`);
        return;
    }

    renderBreedOptions(matches);
    breedSelect.disabled = false;
    loadButton.disabled = false;
    apiStatus.innerHTML = "";
    breedInfo.textContent = `${matches.length} breed(s) found`;
});

async function loadPhotos() {
    const breed = breedSelect.value;
    const count = Number(photoCount.value);

    if (!breed) return;

    lastBreedStorage.save({ breed });
    const label = formatBreedName(breed);

    showStatus("loading", `Fetching ${label} photos...`);
    loadButton.disabled = true;
    dogGallery.innerHTML = "";

    try {
        const data = await dogApi.get(`/breed/${breed}/images/random/${count}`);
        const urls = Array.isArray(data.message) ? data.message : [];

        if (urls.length === 0) {
            showStatus("empty", `No photos found for ${label}. Try another breed.`);
            return;
        }

        const uniqueUrls = [...new Set(urls)];

        uniqueUrls.forEach(url => dogGallery.appendChild(createPhotoCard(url, label)));
        showStatus("success", `Showing ${uniqueUrls.length} photo(s) of ${label}.`);
    } catch (error) {
        showStatus("error", `Could not load photos. ${error.message}`, loadPhotos);
    } finally {
        loadButton.disabled = false;
    }
}

function createPhotoCard(url, label) {
    const card = document.createElement("figure");
    card.className = "photo-card";

    const img = document.createElement("img");
    img.src = url;
    img.alt = `${label} dog`;
    img.loading = "lazy";
    img.addEventListener("error", () => card.remove());

    const caption = document.createElement("figcaption");

    const name = document.createElement("span");
    name.textContent = label;

    const saveButton = document.createElement("button");
    saveButton.className = "btn btn-sm btn-outline-success save-photo-btn";
    updateSaveButton(saveButton, savedPhotos.has(url));

    saveButton.addEventListener("click", () => {
        if (savedPhotos.has(url)) return;

        savedPhotos.add(url, label);
        updateSaveButton(saveButton, true);
        renderSavedPhotos();
    });

    caption.append(name, saveButton);
    card.append(img, caption);
    return card;
}

function updateSaveButton(button, isSaved) {
    button.textContent = isSaved ? "✓ Saved" : "♡ Save";
    button.disabled = isSaved;
}

function renderSavedPhotos() {
    const photos = savedPhotos.getAll();

    savedGallery.innerHTML = "";
    savedCount.textContent = photos.length;
    savedEmpty.hidden = photos.length > 0;
    clearSavedButton.hidden = photos.length === 0;

    photos.forEach(photo => {
        const card = document.createElement("figure");
        card.className = "photo-card";
        card.dataset.id = photo.id;

        const img = document.createElement("img");
        img.src = photo.url;
        img.alt = `Saved ${photo.breed} dog`;
        img.loading = "lazy";

        const caption = document.createElement("figcaption");
        caption.className = "flex-column align-items-stretch";

        const title = document.createElement("strong");
        title.textContent = photo.breed;

        const note = document.createElement("p");
        note.className = "photo-note mb-1";
        note.textContent = photo.note ? `“${photo.note}”` : "No note yet";

        const actions = document.createElement("div");
        actions.className = "d-flex gap-2";
        actions.innerHTML = `
            <button class="btn btn-sm btn-outline-secondary" data-action="edit">✏️ Note</button>
            <button class="btn btn-sm btn-outline-danger" data-action="delete">🗑 Remove</button>
        `;

        caption.append(title, note, actions);
        card.append(img, caption);
        savedGallery.appendChild(card);
    });
}

savedGallery.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const card = button.closest(".photo-card");
    const id = card.dataset.id;

    if (button.dataset.action === "delete") {
        savedPhotos.remove(id);
        renderSavedPhotos();
        refreshGallerySaveButtons();
    }

    if (button.dataset.action === "edit") {
        showNoteEditor(card, id);
    }
});

function showNoteEditor(card, id) {
    const photo = savedPhotos.getAll().find(item => item.id === id);
    const caption = card.querySelector("figcaption");

    const form = document.createElement("form");
    form.className = "d-flex gap-2";
    form.innerHTML = `
        <input class="form-control form-control-sm" maxlength="60"
               aria-label="Note for this photo" placeholder="Add a note (max 60)">
        <button class="btn btn-sm btn-success" type="submit">Save</button>
    `;

    const input = form.querySelector("input");
    input.value = photo.note;

    form.addEventListener("submit", event => {
        event.preventDefault();
        savedPhotos.updateNote(id, input.value);
        renderSavedPhotos();
    });

    caption.querySelector(".d-flex").replaceWith(form);
    input.focus();
}

function refreshGallerySaveButtons() {
    dogGallery.querySelectorAll(".photo-card").forEach(card => {
        const url = card.querySelector("img").src;
        updateSaveButton(card.querySelector(".save-photo-btn"), savedPhotos.has(url));
    });
}

clearSavedButton.addEventListener("click", () => {
    savedPhotos.clear();
    renderSavedPhotos();
    refreshGallerySaveButtons();
});

async function loadCatFact() {
    catFact.textContent = "Loading a cat fact...";
    newFactButton.disabled = true;

    try {
        const data = await catApi.get("/fact");

        if (!data.fact) {
            catFact.textContent = "No fact received this time - try again!";
            return;
        }

        catFact.textContent = data.fact;
    } catch (error) {
        catFact.textContent = `Could not load a fact. ${error.message}`;
    } finally {
        newFactButton.disabled = false;
    }
}

loadButton.addEventListener("click", loadPhotos);

breedSelect.addEventListener("change", () => {
    breedInfo.textContent = "";
});

randomButton.addEventListener("click", () => {
    const options = Array.from(breedSelect.options).filter(option => option.value);
    if (options.length === 0) return;

    const random = options[Math.floor(Math.random() * options.length)];
    breedSelect.value = random.value;
    breedInfo.textContent = `Random pick: ${random.textContent}`;
    loadPhotos();
});

newFactButton.addEventListener("click", loadCatFact);

renderSavedPhotos();
loadBreeds();
loadCatFact();
