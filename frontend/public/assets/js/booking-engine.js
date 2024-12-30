const BASE_URL = "http://localhost:3000/api/listings"; // Base URL for the API
const LISTING_IDS = [
  288675, 288682, 288690, 323229, 323261, 336255, 307143, 306032, 288691,
  305069, 288681, 288726, 288679, 288723, 288678, 323258, 288677, 288684,
  288687, 288977, 288689, 288685, 288683, 306543, 288724, 305055, 309909,
  323227, 288688, 288686, 305327, 288676,
];

// Function to get URL parameters
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    checkinDate: params.get('checkinDate'),
    checkoutDate: params.get('checkoutDate'),
    guests: params.get('guests'),
  };
}

// Function to fetch calendar data for a specific listing
async function fetchCalendarData(listingId, startDate, endDate) {
  try {
    const response = await fetch(`${BASE_URL}/${listingId}/calendar?startDate=${startDate}&endDate=${endDate}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching calendar data:", error);
    return null;
  }
}

// Function to load cached data or fetch new data
async function loadCalendarData(checkinDate, checkoutDate) {
  const cacheKey = `calendarData_${checkinDate}_${checkoutDate}`;
  const cachedData = localStorage.getItem(cacheKey);

  if (cachedData) {
    // Parse and return cached data
    return JSON.parse(cachedData);
  } else {
    // Fetch new data and cache it
    const fetchPromises = LISTING_IDS.map(listingId => fetchCalendarData(listingId, checkinDate, checkoutDate));
    const calendarDataArray = await Promise.all(fetchPromises);
    
    // Cache the fetched data
    localStorage.setItem(cacheKey, JSON.stringify(calendarDataArray));
    return calendarDataArray;
  }
}

// On page load, fetch available listings based on URL parameters
document.addEventListener("DOMContentLoaded", async () => {
  const { checkinDate, checkoutDate } = getQueryParams();
  const availableListings = [];

  // Load calendar data (either from cache or by fetching)
  const calendarDataArray = await loadCalendarData(checkinDate, checkoutDate);

  // Filter available listings
  calendarDataArray.forEach((calendarData, index) => {
    if (calendarData && calendarData.result.some(entry => entry.status === "available")) {
      availableListings.push({
        id: LISTING_IDS[index],
        name: `Listing ID: ${LISTING_IDS[index]}`, // Replace with actual names if available
        status: "available"
      });
    }
  });

  // Display available listings
  const listingsContainer = document.getElementById("available-listings");
  if (availableListings.length > 0) {
    availableListings.forEach(listing => {
      const listingElement = document.createElement("div");
      listingElement.className = "listing-item";
      listingElement.innerHTML = `
        <h5>${listing.name}</h5>
        <p>Status: ${listing.status}</p>
      `;
      listingsContainer.appendChild(listingElement);
    });
  } else {
    listingsContainer.innerHTML = "<p>No listings are available.</p>";
  }
});

// Event listener for the booking form submission
document.getElementById("booking-form").addEventListener("submit", (event) => {
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

  // Redirect to booking-engine.html with selected dates
  const queryParams = new URLSearchParams({
    location,
    checkinDate,
    checkoutDate,
    guests,
  });
  window.location.href = `/booking-engine?${queryParams.toString()}`;
});
