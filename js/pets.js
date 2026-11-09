
const pets = [
    { name: "Max", type: "Dog", age: 2, image: "images/max.jpg", page: "pet-max.html" },
    { name: "Luna", type: "Cat", age: 3, image: "images/luna.jpg", page: "pet-luna.html" },
    { name: "Charlie", type: "Dog", age: 1, image: "images/charlie.jpg", page: "pet-charlie.html" },
    { name: "Bella", type: "Dog", age: 4, image: "images/bella.jpg", page: "pet-bella.html" },
    { name: "Milo", type: "Rabbit", age: 3, image: "images/milo.jpg", page: "pet-milo.html" },
    { name: "Daisy", type: "Parrot", age: 5, image: "images/daisy.jpg", page: "pet-daisy.html" }
];

let favorites = JSON.parse(localStorage.getItem("petFavorites")) || [];

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

    <button id="show-favorites" class="btn button">
        Show Favorites ❤️
    </button>

    <p id="pet-count" class="mt-3" aria-live="polite"></p>
`;

petGrid.before(controls);

function createPetCard(pet) {
    const isFavorite = favorites.includes(pet.name);

    const article = document.createElement("article");
    article.className = "pet-card";

    article.innerHTML = `
        <img src="${pet.image}" alt="${pet.name}" class="pet-image">

        <div class="pet-card-content">
            <h2 class="catalog-pet-name">${pet.name}</h2>
            <p>${pet.type} · ${pet.age} years old</p>

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

    return pets.filter(pet => {
        const matchesName = pet.name.toLowerCase().includes(searchValue);
        const matchesType = selectedType === "All" || pet.type === selectedType;

        return matchesName && matchesType;
    });
}

function displayPets(petList) {
    petGrid.innerHTML = "";

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

    localStorage.setItem("petFavorites", JSON.stringify(favorites));
}

document.getElementById("pet-search").addEventListener("input", () => {
    displayPets(getFilteredPets());
});

document.getElementById("pet-filter").addEventListener("change", () => {
    displayPets(getFilteredPets());
});

petGrid.addEventListener("click", event => {
    const button = event.target.closest(".favorite-btn");

    if (!button) return;

    toggleFavorite(button.dataset.name);
    displayPets(getFilteredPets());
});

document.getElementById("show-favorites").addEventListener("click", () => {
    const favoritePets = pets.filter(pet => favorites.includes(pet.name));

    displayPets(favoritePets);
});

displayPets(pets);
