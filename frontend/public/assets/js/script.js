// Initialize Flatpickr calendars
flatpickr("#checkin", { dateFormat: "Y-m-d" });
flatpickr("#checkout", { dateFormat: "Y-m-d" });

// Base URL configuration
const getBaseUrl = () => {
  const hostname = window.location.hostname;
  return hostname === "namuve.com" || hostname === "www.namuve.com"
    ? "https://namuve.com/api"
    : "http://localhost:3000/api";
};

const BASE_URL = getBaseUrl();

// Function to save the form data and clear the form
function saveAndClearForm() {
  const location = document.getElementById("location").value;
  const checkin = document.getElementById("checkin").value;
  const checkout = document.getElementById("checkout").value;
  const guests = document.getElementById("guests").value;

  // Validate if all fields are filled
  if (!location || !checkin || !checkout || !guests) {
    showAlert("Please fill in all the fields!");
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

// Function to show a custom alert message
function showAlert(message) {
  const alertDiv = document.createElement('div');
  alertDiv.className = 'alert alert-info';
  alertDiv.style.position = 'fixed';
  alertDiv.style.top = '20px';
  alertDiv.style.right = '20px';
  alertDiv.style.zIndex = '9999';
  alertDiv.style.padding = '15px';
  alertDiv.style.borderRadius = '5px';
  alertDiv.style.backgroundColor = '#f8f9fa';
  alertDiv.style.border = '1px solid #dee2e6';
  alertDiv.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
  alertDiv.innerHTML = message;
  
  document.body.appendChild(alertDiv);
  
  setTimeout(() => {
    alertDiv.remove();
  }, 3000);
}

// Function to format message for WhatsApp
function formatWhatsAppMessage(name, email, subject, message) {
    return `*This is a new text message:*

*Name:* ${name}
*Email:* ${email}
*Subject:* ${subject}
*Message:* ${message}`;
}

// Function to send message to WhatsApp
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    // Validate form
    if (!name || !email || !subject || !message) {
        showAlert("Please fill in all fields before submitting.");
        return;
    }
    
    // Format the message
    const formattedMessage = formatWhatsAppMessage(name, email, subject, message);
    
    // WhatsApp phone number (with country code)
    const phoneNumber = "923000454711"; // +92 300 045 4711
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(formattedMessage)}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
    
    // Show success message
    showAlert("Your message has been sent to WhatsApp!");
    
    // Clear the form
    this.reset();
});
