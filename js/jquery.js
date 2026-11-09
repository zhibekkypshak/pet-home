
// Wait until the page is fully loaded
$(document).ready(function () {

    $("#toggle-hours").on("click", function () {

        $(this)
            .closest(".visiting-hours")
            .find(".table-responsive")
            .slideToggle(400);

    });

    $("#name").on("input", function () {

        const userName = $(this).val().trim();

        const preview = $(this)
            .parent()
            .find(".name-preview");

        if (userName.length > 0) {
            preview.text("Hello, " + userName + "! Welcome to Pet Home.");
        } else {
            preview.text("Your name will appear here.");
        }

    });

    $("#toggle-contact").on("click", function () {

        $(".contact-info")
            .find("h3, p, ul")
            .fadeToggle(400);

    });

    $("#pet").on("change", function () {

        const selectedPet = $(this).val();

        if (selectedPet !== "") {
            $("#form-status")
                .text("You selected: " + selectedPet)
                .removeClass("text-danger")
                .addClass("text-info");
        } else {
            $("#form-status").text("");
        }

    });

});
