// Initialize Flatpickr calendars
flatpickr("#checkin", { dateFormat: "Y-m-d" });
flatpickr("#checkout", { dateFormat: "Y-m-d" });

// Function to save the form data and clear the form
function saveAndClearForm() {
  const location = document.getElementById("location").value;
  const checkin = document.getElementById("checkin").value;
  const checkout = document.getElementById("checkout").value;
  const guests = document.getElementById("guests").value;

  // Validate if all fields are filled
  if (!location || !checkin || !checkout || !guests) {
    alert("Please fill in all the fields!");
    return;
  }

  // Display saved booking details
  alert(`Booking Details Saved:
  Location: ${location}
  Check-In Date: ${checkin}
  Check-Out Date: ${checkout}
  Number of Guests: ${guests}`);

  // Clear the form fields after saving
  document.getElementById("location").value = "";
  document.getElementById("checkin").value = "";
  document.getElementById("checkout").value = "";
  document.getElementById("guests").value = "";
}

// Function to show a custom alert message
function showAlert(message) {
  const alertDiv = document.getElementById("alert");
  alertDiv.innerText = message;
  alertDiv.style.display = "block";

  alertDiv.classList.add("show");

  setTimeout(() => {
    alertDiv.classList.remove("show");
    setTimeout(() => {
      alertDiv.style.display = "none";
    }, 150);
  }, 5000);
}

// Function to calculate the price based on selected values
function calculatePrice(event) {
  event.preventDefault(); // Prevent form submission

  const area = document.getElementById("area").value;
  const bedrooms = document.getElementById("bedrooms").value;
  const furnishing = document.getElementById("furnishing").value;

  // Validate if all fields are selected
  if (!area || !bedrooms || !furnishing) {
    showAlert("Please select Area, Bedrooms, and Furnishing.");
    return;
  }

  let price = 0;

  // Calculate price based on selected values
  if (area === "Lahore") price += 1000;
  else if (area === "Karachi") price += 1500;
  else if (area === "Islamabad") price += 2000;

  if (bedrooms === "studio") price += 500;
  else if (bedrooms === "1") price += 1000;
  else if (bedrooms === "2") price += 1500;
  else if (bedrooms === "3") price += 2000;

  if (furnishing === "standard") price += 300;
  else if (furnishing === "luxury") price += 700;

  // Redirect to estimate-revenue.html page after calculation
  window.location.href = "estimate-revenue.html";
}
