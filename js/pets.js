
const favoritesStorage = new StorageManager("petFavorites", []);
let favorites = favoritesStorage.load().filter(name => typeof name === "string");

let favoritesOnly = false;

const petGrid = document.querySelector(".pet-grid");

const controls = document.createElement("div");
controls.className = "pet-controls mb-4";

controls.innerHTML = `
    <input type="text" id="pet-search"
           class="form-control mb-3"
           placeholder="Search pets by name...">

    <select id="pet-filter" class="form-select mb-3">
        <option value="All">All animals</option>
        <option value="Dog">Dogs</option>
        <option value="Cat">Cats</option>
        <option value="Rabbit">Rabbits</option>
        <option value="Parrot">Parrots</option>
    </select>

    <select id="pet-sort" class="form-select mb-3" aria-label="Sort pets">
        <option value="default">Sort: default order</option>
        <option value="age-asc">Age: youngest first</option>
        <option value="age-desc">Age: oldest first</option>
        <option value="name-asc">Name: A → Z</option>
    </select>

    <button id="show-favorites" type="button" class="btn button" aria-pressed="false">
        Show Favorites ❤️
    </button>

    <button id="clear-favorites" class="btn btn-outline-danger">
        Clear Favorites
    </button>

    <p id="pet-count" class="mt-3" aria-live="polite"></p>
`;

petGrid.before(controls);

const statsPanel = document.createElement("section");
statsPanel.className = "stats-panel mb-4";
statsPanel.setAttribute("aria-label", "Shelter statistics");
controls.before(statsPanel);

function renderStats() {
    const total = pets.length;
    const averageAge = pets.reduce((sum, pet) => sum + pet.age, 0) / total;

    const typeCounts = pets.reduce((counts, pet) => {
        counts[pet.type] = (counts[pet.type] || 0) + 1;
        return counts;
    }, {});

    const maxCount = Math.max(...Object.values(typeCounts));

    const bars = Object.entries(typeCounts)
        .map(([type, count]) => `
            <div class="stat-bar-row">
                <span class="stat-bar-label">${type}</span>
                <div class="stat-bar-track" role="img" aria-label="${type}: ${count}">
                    <div class="stat-bar-fill" style="width: ${(count / maxCount) * 100}%"></div>
                </div>
                <span class="stat-bar-value">${count}</span>
            </div>
        `)
        .join("");

    statsPanel.innerHTML = `
        <div class="stat-tiles">
            <div class="stat-tile"><span class="stat-number">${total}</span><span>Pets available</span></div>
            <div class="stat-tile"><span class="stat-number">${averageAge.toFixed(1)}</span><span>Average age (years)</span></div>
            <div class="stat-tile"><span class="stat-number">${favorites.length}</span><span>Your favorites</span></div>
        </div>
        <div class="stat-chart">
            <h2 class="h6 mb-3">Pets by type</h2>
            ${bars}
        </div>
    `;
}

function createPetCard(pet) {
    const isFavorite = favorites.includes(pet.name);

    const article = document.createElement("article");
    article.className = "pet-card";

    article.innerHTML = `
        <img src="${pet.image}" alt="${pet.name}" class="pet-image">

        <div class="pet-card-content">
            <h2 class="catalog-pet-name">${pet.name}</h2>
            <p>${pet.type} · ${pet.getAgeLabel()}</p>

            <a href="${pet.page}" class="btn button">View Pet</a>

            <button class="btn button favorite-btn"
                    data-name="${pet.name}">
                ${isFavorite ? "❤️ Remove Favorite" : "♡ Add Favorite"}
            </button>
        </div>
    `;

    return article;
}

function getFilteredPets() {
    const searchValue = document.getElementById("pet-search").value.toLowerCase();
    const selectedType = document.getElementById("pet-filter").value;

    const filtered = pets.filter(pet => {
        const matchesName = pet.name.toLowerCase().includes(searchValue);
        const matchesType = selectedType === "All" || pet.type === selectedType;

        const matchesFavorites = !favoritesOnly || favorites.includes(pet.name);

        return matchesName && matchesType && matchesFavorites;
    });

    return sortPets(filtered);
}

function sortPets(petList) {
    const sortValue = document.getElementById("pet-sort").value;
    const sorted = [...petList];

    if (sortValue === "age-asc") {
        sorted.sort((a, b) => a.age - b.age);
    } else if (sortValue === "age-desc") {
        sorted.sort((a, b) => b.age - a.age);
    } else if (sortValue === "name-asc") {
        sorted.sort((a, b) => a.name.localeCompare(b.name));
    }

    return sorted;
}

function displayPets(petList) {
    petGrid.innerHTML = "";

    if (petList.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-message";
        empty.textContent = favoritesOnly && favorites.length === 0
            ? "You have no favorites yet. Show all pets to add one."
            : "No pets match your search. Try another name or filter.";
        petGrid.appendChild(empty);
    }

    for (const pet of petList) {
        petGrid.appendChild(createPetCard(pet));
    }

    let dogCount = 0;

    for (let i = 0; i < petList.length; i++) {
        if (petList[i].type === "Dog") {
            dogCount++;
        }
    }

    document.getElementById("pet-count").textContent =
        `Found ${petList.length} pet(s), including ${dogCount} dog(s)`;
}

function toggleFavorite(name) {
    if (favorites.includes(name)) {
        favorites = favorites.filter(pet => pet !== name);
    } else {
        favorites.push(name);
    }

    favoritesStorage.save(favorites);
    renderStats();
}

document.getElementById("pet-search").addEventListener("input", () => {
    displayPets(getFilteredPets());
});

document.getElementById("pet-filter").addEventListener("change", () => {
    displayPets(getFilteredPets());
});

document.getElementById("pet-sort").addEventListener("change", () => {
    displayPets(getFilteredPets());
});

petGrid.addEventListener("click", event => {
    const button = event.target.closest(".favorite-btn");

    if (!button) return;

    toggleFavorite(button.dataset.name);
    displayPets(getFilteredPets());
});

document.getElementById("show-favorites").addEventListener("click", event => {
    favoritesOnly = !favoritesOnly;
    event.currentTarget.setAttribute("aria-pressed", String(favoritesOnly));
    event.currentTarget.textContent = favoritesOnly ? "Show All Pets" : "Show Favorites ❤️";
    displayPets(getFilteredPets());
});

document.getElementById("clear-favorites").addEventListener("click", () => {
    favorites = [];
    favoritesStorage.clear();
    renderStats();
    displayPets(getFilteredPets());
});

renderStats();
displayPets(pets);
