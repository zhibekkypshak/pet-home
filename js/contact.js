const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");
const petSelect = document.getElementById("pet");

const params = new URLSearchParams(window.location.search);
const selectedPet = params.get("pet");

if (selectedPet && petSelect) {
    const petExists = Array.from(petSelect.options).some(
        option => option.value === selectedPet
    );

    if (petExists) {
        petSelect.value = selectedPet;
    }
}

function showError(field, message) {
    let error = field.parentElement.querySelector(".validation-error");

    if (!error) {
        error = document.createElement("small");
        error.className = "validation-error text-danger d-block mt-1";
        field.insertAdjacentElement("afterend", error);
    }

    error.textContent = message;
    field.classList.add("is-invalid");
    field.setAttribute("aria-invalid", "true");
}

function clearError(field) {
    const error = field.parentElement.querySelector(".validation-error");

    if (error) {
        error.remove();
    }

    field.classList.remove("is-invalid");
    field.removeAttribute("aria-invalid");
}

function validateField(field) {
    const value = field.value.trim();

    if (field.id === "name") {
        if (value.length < 2) {
            showError(field, "Name must contain at least 2 characters.");
            return false;
        }
    }

    if (field.id === "email") {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(value)) {
            showError(field, "Please enter a valid email address.");
            return false;
        }
    }

    if (field.id === "message") {
        if (value.length < 10) {
            showError(field, "Message must contain at least 10 characters.");
            return false;
        }
    }

    clearError(field);
    return true;
}

function validateForm() {
    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const message = document.getElementById("message");

    const nameValid = validateField(name);
    const emailValid = validateField(email);
    const messageValid = validateField(message);

    return nameValid && emailValid && messageValid;
}

const fields = [
    document.getElementById("name"),
    document.getElementById("email"),
    document.getElementById("message")
];

fields.forEach(field => {
    field.addEventListener("input", () => {
        validateField(field);
    });
});

contactForm.addEventListener("submit", function(event) {
    event.preventDefault();

    formStatus.textContent = "";
    formStatus.classList.remove("text-success", "text-danger");

    if (validateForm()) {
        formStatus.textContent =
            "Thank you! Your message has been submitted successfully. (Demo only)";

        formStatus.classList.add("text-success");

        contactForm.reset();
        fields.forEach(clearError);
    } else {
        formStatus.textContent =
            "Please correct the errors above.";

        formStatus.classList.add("text-danger");
    }
});
