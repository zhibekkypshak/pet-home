# Pet Home 🐾

## 1. Project Description

Pet Home is a responsive multi-page website that helps people discover shelter pets, learn about them and find the right companion. It encourages responsible pet adoption.

The project was built in three stages:

- **Midterm**: a responsive multi-page website built with HTML5, CSS3 and Bootstrap 5.
- **Endterm**: interactivity added with JavaScript and jQuery: a dynamic pet catalog, search and filter, favorites, form validation and jQuery effects.
- **Final**: the site became a client-side web application. It now uses a **public API**, **object-oriented JavaScript** with classes, **localStorage** persistence, a **CRUD** feature, a **multi-step form**, a **statistics panel** and **accessibility settings** (dark mode and text size).

## 2. Group Members

| Member | Final-stage contribution |
|---|---|
| **Amangeldi Arailym** | Breed Explorer page: API integration (`ApiService`), saved photos CRUD (`PhotoCollection`), `StorageManager` class |
| **Kypshak Zhibek** | Pet Match quiz (`MatchQuiz`, `Pet` class scoring), statistics panel and sorting on the Pets page, dark mode and text size (`ThemeManager`) |

Both members worked on testing, responsive design and this README, and both can explain the whole project.

## 3. Live Website and Repository

- **Live website:** https://zhibekkypshak.github.io/pet-home/
- **GitHub repository:** https://github.com/zhibekkypshak/pet-home

## 4. Technologies Used

- **HTML5**: page structure and semantic markup
- **CSS3**: custom styling, CSS Grid and Flexbox, media queries, animations
- **Bootstrap 5.3**: layout, form controls, alerts, spinners, progress bars, built-in dark theme (`data-bs-theme`)
- **JavaScript (ES6+)**: classes, async/await, `fetch`, array methods, DOM manipulation, events
- **jQuery 3.7**: selectors, DOM traversal, events and effects (contact page and Pet Match quiz)
- **localStorage**: saved user data
- **Git, GitHub and GitHub Pages**: version control and hosting

## 5. How to Run and Test

### Run locally
1. Download or clone the repository:
   `git clone https://github.com/zhibekkypshak/pet-home.git`
2. Open the folder in VS Code.
3. Start **Live Server** (right-click `index.html`, then **Open with Live Server**).
   You can also open the published website link above.
4. You need an internet connection for the API features (Breed Explorer and Cat Fact) and for the Bootstrap and jQuery CDNs.

### Test the final features
1. **Breed Explorer** (`breeds.html`): type "husky" in the search box, choose a breed and click **Show photos**. Click **♡ Save** on a photo. In **My Saved Photos**, click **✏️ Note** to add a note, **🗑 Remove** to delete a photo, or **Clear all**. Refresh the page to see that saved photos and the last chosen breed are restored. Click **🎲 Random breed** and **New fact**.
2. **Error state**: turn off the internet (DevTools → Network → Offline) and reload `breeds.html`. A clear error message and a **Try again** button appear. Typing a breed that does not exist (for example "xyz") shows the empty state.
3. **Pet Match quiz** (`match.html`): try clicking **Next** without an answer, and a validation message appears. Answer all 5 steps and click **See my match**. Reload the page: your last result is saved, and you can **Show** it again or **Clear** it.
4. **Pets page** (`pets.html`): look at the statistics panel. Use the new **Sort** dropdown (age or name). Add favorites, and the "Your favorites" number updates. Click **Clear Favorites**.
5. **Accessibility panel** (the round buttons at the bottom-right of every page): switch dark mode (🌙/☀️) and change the text size (A− / A+). Open another page: the settings are remembered. Click ↺ to reset.
6. **Previous features**: search and filter by type, Show Favorites, the contact form validation, the jQuery toggles on the contact page, and `contact.html?pet=luna` pre-selecting a pet. All of these still work.

## 6. API Information

| API | Endpoints used | What we show | Key needed |
|---|---|---|---|
| **Dog CEO API** - https://dog.ceo/dog-api/ | `GET /api/breeds/list/all`<br>`GET /api/breed/{breed}/images/random/{count}`<br>`GET /api/breed/{breed}/{sub-breed}/images/random/{count}` | The list of 100+ dog breeds (sub-breeds included, e.g. "French Bulldog") and random photos of the chosen breed | No (free, public) |
| **Cat Facts API** - https://catfact.ninja/ | `GET /fact` | A random cat fact on the Breed Explorer page | No (free, public) |

**How the data is handled**
- Requests use `fetch` with **async/await** inside the `ApiService` class. Requests time out after 8 seconds (using `AbortController`).
- The JSON response is processed in JavaScript. For example, the `{ bulldog: ["french", "english"] }` structure becomes readable names, which are sorted and deduplicated. The results are displayed with dynamically created DOM elements.
- Every request has four states:
  - **loading**: a Bootstrap spinner and text
  - **success**: a green message
  - **empty**: a yellow message, for example when no breed matches or no photos are returned
  - **error**: a red message with a **Try again** button
- No secret keys are used, so there is nothing private in the public code.

## 7. Final-Stage Features (new after the Endterm)

### Feature 1 - API Integration: Breed Explorer (mandatory)
A new page, `breeds.html`, loads live dog breed data and photos from the Dog CEO API and cat facts from catfact.ninja. It has breed search, a choice of photo count, a random breed button, and all four request states (loading, success, empty, error).

### Feature 2 - Object-Oriented Programming (mandatory)
The project uses six classes. Each one creates real objects that run real features:

| Class | File | Responsibility | Objects created |
|---|---|---|---|
| `StorageManager` | `js/storage.js` | Safe read, save and clear of JSON in localStorage | One object per saved feature (favorites, saved photos, last breed, quiz result, display settings) |
| `Pet` | `js/pets-data.js` | Pet properties plus methods `getAgeLabel()`, `getAdoptLink()`, `getMatchScore()`, `getMatchReasons()` | 6 pets (`petData.map(data => new Pet(data))`) |
| `ApiService` | `js/breeds.js` | `get()` method: fetch, timeout, error messages | `dogApi` and `catApi` |
| `PhotoCollection` | `js/breeds.js` | CRUD for saved photos | `savedPhotos` |
| `MatchQuiz` | `js/match.js` | Steps, validation, scoring, results, saved result | `quiz` |
| `ThemeManager` | `js/theme.js` | Dark mode and text size, panel rendering | `themeManager` |

The `pets` array is now shared by the Pets page and the quiz (`js/pets-data.js`), so the code is not duplicated.

### Feature 3 - localStorage (mandatory)
| Key | Data | Restored / Updated / Cleared |
|---|---|---|
| `petFavorites` | Array of favorite pet names | Restored on load; updated with ♡; **Clear Favorites** button |
| `petHomeSavedPhotos` | Array of `{ id, url, breed, note, savedAt }` objects | Restored on load; notes can be edited; Remove / **Clear all** |
| `petHomeLastBreed` | `{ breed }` | Last chosen breed is pre-selected |
| `petHomeMatchResult` | `{ answers, date }` | "Your last result" box; **Show** / **Clear** |
| `petHomeDisplay` | `{ theme, scale }` | Applied on every page; ↺ reset |

All values are stored as JSON. `StorageManager.load()` uses `try/catch` and checks that the data has the right shape (array or object). Each feature also checks the values themselves. Missing or broken data (for example `{broken`) never crashes the page: the default value is used instead.

### Feature 4 - CRUD: Saved Dog Photos (additional)
On the Breed Explorer page the user can:
- **Create**: save a photo
- **Read**: see the saved gallery with a counter
- **Update**: add or edit a note with an inline form
- **Delete**: remove one photo or clear all

The data survives page reloads.

### Feature 5 - Multi-Step Form with Calculated Values: Pet Match Quiz (additional)
`match.html` is a 5-step form (living space, free time, activity, experience, children). It has:
- a progress bar
- Back and Next buttons, plus Enter-key support
- validation at each step (an error message and a shake animation)
- jQuery fade and slide effects

A match score from 0 to 100% is calculated for every pet with `Pet.getMatchScore()`. The page shows the best match with reasons, links to the pet's page and the contact form (with the pet pre-selected), and lists other good matches.

### Feature 6 - Statistics Panel and Sorting (additional)
The Pets page now has a statistics dashboard: total pets, average age, the number of your favorites, and a bar chart of pets by type. The values are calculated with `reduce()`, and the dashboard updates when favorites change. There is also a new **Sort** dropdown (youngest first, oldest first, A→Z), an **empty-results** message and a **Clear Favorites** button.

### Feature 7 - Theme and Accessibility Settings (additional)
A floating panel on every page offers:
- **dark mode**, using Bootstrap's `data-bs-theme` plus custom styles
- **text size** from 90% to 130%, with a reset button

The buttons have ARIA labels, `aria-pressed` and visible keyboard focus. The preferences are saved in localStorage.

### Other improvements
- Fixed a CSS bug: the mobile `@media` block in `style-zhibek.css` was not closed, so some styles (pet controls, favorite buttons, validation) only worked on phones.
- Pet images were compressed from about 18 MB to about 1.3 MB, so the site loads much faster.
- The new pages (Breeds, Pet Match) were added to the navigation on every page.

## 8. Features from Earlier Stages (still working)

- **Midterm**: Home, About, Pets, 6 pet profile pages and Contact; responsive layout with Bootstrap and custom CSS.
- **Endterm**:
  - A `pets` array displayed with a `for...of` loop; a `for` loop that counts dogs
  - Functions `createPetCard()`, `getFilteredPets()`, `displayPets()` and `toggleFavorite()`
  - Search by name, filter by type, favorites saved in localStorage
  - Contact form validation (name, email, message) with live error messages, and pet pre-selection from the URL (`?pet=`)
  - jQuery: visiting hours `slideToggle`, contact info `fadeToggle`, live name preview, selected-pet message (DOM traversal with `closest()`, `find()` and `parent()`)

## 9. Project Structure

```
pet-home/
├── index.html, about.html, pets.html, contact.html
├── breeds.html            ← NEW (API + CRUD)
├── match.html             ← NEW (multi-step quiz)
├── pet-max.html … pet-daisy.html   (6 pet profiles)
├── css/
│   ├── style-zhibek.css   (main styles)
│   ├── style-pets.css
│   └── style-final.css    ← NEW (final-stage components + dark mode)
├── js/
│   ├── storage.js         ← NEW  StorageManager class
│   ├── theme.js           ← NEW  ThemeManager class (all pages)
│   ├── pets-data.js       ← NEW  Pet class + pet objects
│   ├── pets.js            (catalog: search, filter, sort, favorites, stats)
│   ├── breeds.js          ← NEW  ApiService, PhotoCollection, Breed Explorer UI
│   ├── match.js           ← NEW  MatchQuiz class (jQuery)
│   ├── contact.js         (form validation)
│   └── jquery.js          (jQuery interactions)
├── images/
└── README.md
```
