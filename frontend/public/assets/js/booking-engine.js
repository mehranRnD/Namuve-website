const BASE_URL = "http://localhost:3000/api/listings"; // Base URL for the API
const LISTING_IDS = [
  288675, 288682, 288690, 323229, 323261, 336255, 307143, 306032, 288691,
  305069, 288681, 288726, 288679, 288723, 288678, 323258, 288677, 288684,
  288687, 288977, 288689, 288685, 288683, 306543, 288724, 305055, 309909,
  323227, 288688, 288686, 305327, 288676,
];

// Function to fetch calendar data for a specific listing
async function fetchCalendarData(listingId, startDate, endDate) {
  try {
    const response = await fetch(
      `${BASE_URL}/${listingId}/calendar?startDate=${startDate}&endDate=${endDate}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching calendar data:", error);
    return null;
  }
}


// Function to check available listings based on user-selected dates
async function checkAvailableListings(checkinDate, checkoutDate) {
  const availableListings = [];

  // Create an array of promises for fetching calendar data
  const fetchPromises = LISTING_IDS.map(async (listingId) => {
    const calendarData = await fetchCalendarData(
      listingId,
      checkinDate,
      checkoutDate
    );

    // Log the fetched calendar data for debugging
    // console.log(`Calendar data for listing ${listingId}:`, calendarData);

    // Check if the calendar data is valid
    if (calendarData && calendarData.result) {
      // Check if any date in the range is available
      const isAvailable = calendarData.result.some((entry) => {
        return (
          entry.status === "available" &&
          new Date(entry.date) >= new Date(checkinDate) &&
          new Date(entry.date) < new Date(checkoutDate)
        );
      });

      // If any date is available, add the listing ID to the available listings
      if (isAvailable) {
        availableListings.push(listingId);
        // Alert the user with the listing ID
        console.log(`This listing is available and ID is ${listingId}`);
      }
    }
  });

  // Wait for all fetch promises to resolve
  await Promise.all(fetchPromises);

  // Log available listings IDs to the console
  console.log("Available Listings IDs:", availableListings);

  // Show alert if no listings are available
  if (availableListings.length === 0) {
    alert("No available listings for the selected dates.");
  }

  return availableListings; // Return the available listings
}

// Event listener for the booking form submission
document
  .getElementById("booking-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    // Get user input values
    const location = document.getElementById("location").value;
    const checkinDate = document.getElementById("checkin").value;
    const checkoutDate = document.getElementById("checkout").value;
    const guests = document.getElementById("guests").value;

    // Validate inputs
    if (!checkinDate || !checkoutDate || !guests) {
      alert("Please fill in all the required fields.");
      return;
    }

    // Check available listings based on the provided dates
    const availableListings = await checkAvailableListings(
      checkinDate,
      checkoutDate
    );

    // If available listings are found, redirect with the listing IDs
    if (availableListings.length > 0) {
      const queryParams = new URLSearchParams({
        location,
        checkinDate,
        checkoutDate,
        guests,
        availableListings: availableListings.join(","), // Pass the listing IDs as a comma-separated string
      });

      window.location.href = `/booking-engine?${queryParams.toString()}`;
    } else {
      alert("No available listings for the selected dates.");
    }
  });
