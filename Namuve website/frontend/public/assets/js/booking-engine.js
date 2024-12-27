// ... existing code ...

// Handle booking form submission
const bookingForm = document.getElementById("booking-form");
if (bookingForm) {
  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent default form submission

    const location = bookingForm.querySelector('input[placeholder="Location"]').value;
    const checkin = bookingForm.querySelector('#checkin').value;
    const checkout = bookingForm.querySelector('#checkout').value;
    const guests = bookingForm.querySelector('input[placeholder="Number of Guests"]').value;

    // Redirect to search results page or perform search logic
    console.log(`Searching for ${guests} guests in ${location} from ${checkin} to ${checkout}`);
    // Example: window.location.href = `search-results.html?location=${location}&checkin=${checkin}&checkout=${checkout}&guests=${guests}`;
  });
}

// ... existing code ...