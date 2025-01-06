document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".php-email-form");
    const loadingMessage = form.querySelector(".loading");
    const errorMessage = form.querySelector(".error-message");
    const sentMessage = form.querySelector(".sent-message");

    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent the default form submission

        loadingMessage.style.display = "block"; // Show loading message
        errorMessage.style.display = "none"; // Clear previous error messages
        sentMessage.style.display = "none"; // Hide sent message

        // Get form data
        const formData = new FormData(form);

        // Send email using fetch
        fetch(form.action, {
            method: "POST",
            body: formData,
        })
        .then(response => response.text())
        .then(data => {
            loadingMessage.style.display = "none"; // Hide loading message
            if (data.trim() === "OK") {
                sentMessage.style.display = "block"; // Show sent message
                form.reset(); // Reset the form
            } else {
                errorMessage.innerHTML = data; // Show error message
                errorMessage.style.display = "block"; // Show error message
            }
        })
        .catch(error => {
            loadingMessage.style.display = "none"; // Hide loading message
            errorMessage.innerHTML = "There was an error sending your message. Please try again.";
            errorMessage.style.display = "block"; // Show error message
        });
    });
});
