# Pet Home 🐾

## 1. Project Description

Pet Home is a responsive multi-page website designed to help people discover pets and learn more about them. The website provides information about different animals and encourages responsible pet adoption.

This project is a continuation of our Midterm project. For the Endterm, we extended the existing website with interactive JavaScript and jQuery functionality to improve the user experience.

## 2. Group Members

- Kypshak Zhibek 
- Amangeldi Arailym

## 3. Technologies Used

- HTML5 – website structure and content.
- CSS3 – styling and responsive design.
- Bootstrap 5 – responsive layout and UI components.
- JavaScript – interactive functionality and DOM manipulation.
- jQuery – additional DOM interactions, event handling, and effects.
- Git and GitHub – version control and project hosting.

## 4. Website Structure

The website contains multiple connected pages:

- Home – introduction to Pet Home.
- About – information about the project.
- Pets – pet catalog.
- Pet Profile Pages – individual information about each animal.
- Contact – contact form and contact information.

## 5. JavaScript Features

The following JavaScript functionality was added:

### Arrays
- A pets array stores information about animals, including their names, types, ages, images, and profile pages.
- A favorites array stores the names of selected pets.

### Loops
- `for...of` loop is used to display pet cards dynamically.
- `for` loop is used to count dogs in the displayed pet list.

### Functions
The project includes reusable functions:
- `createPetCard()` – dynamically creates a pet card.
- `getFilteredPets()` – filters pets according to search input and selected animal type.
- `displayPets()` – displays pet cards and updates the pet count.
- `toggleFavorite()` – adds or removes pets from favorites.

### DOM Manipulation
- Pet cards are created dynamically using JavaScript.
- Search and filtering update the displayed content.
- Favorite buttons update their labels and states.
- Pet information and result counts are updated dynamically.

### Events and Interaction
The website uses event listeners to handle user interactions, including:
- Searching for pets.
- Filtering pets by animal type.
- Adding and removing favorite pets.
- Displaying the favorites list.

### Local Storage
The favorites list is saved using `localStorage`, so selected pets remain saved after refreshing the page.

## 6. Form Validation

The Contact page includes JavaScript form validation.

The validation checks user input and displays appropriate feedback when the entered information is invalid. A success message is displayed when the form is completed correctly.

## 7. jQuery Functionality

jQuery is used to enhance website interactions.

The implementation demonstrates:
- Different jQuery selectors.
- DOM traversal methods.
- Event handling.
- Effects and animations to show or hide interface elements.

## 8. How to Test the Website

1. Open the website using the published link or run it locally using VS Code Live Server.
2. Navigate to the Pets page.
3. Use the search field to find a pet by name.
4. Use the dropdown menu to filter animals by type.
5. Click the favorite button to add or remove a pet from favorites.
6. Click "Show Favorites" to display saved pets.
7. Refresh the page to check whether favorites remain saved.
8. Open the Contact page and test the form validation using both valid and invalid input.
9. Test the remaining interactive elements on the website.

## 9. Live Website
 https://zhibekkypshak.github.io/pet-home/

## 10. GitHub Repository
https://github.com/zhibekkypshak/pet-home.git

