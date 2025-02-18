import { showRedAlert, showGreenAlert, showInfoAlert } from "./alert.js";
import { idToImageUrlMap, LISTINGS, roomDescriptions, LISTINGS_DATA } from "./data.js"; // Import the image URL map

const BASE_URL = "http://localhost:3000/api/listings"; // Base URL for the API

// Extract the listing IDs from the array
const LISTING_IDS = LISTINGS.map((listing) => listing.id);

let usdToPkrRate = 277.66; // Fallback rate

// Function to fetch USD to PKR exchange rate
async function fetchConversionRate() {
  try {
    const response = await fetch(
      "https://v6.exchangerate-api.com/v6/5137852015813f31040c7f33/latest/USD"
    );
    const data = await response.json();
    usdToPkrRate = data.conversion_rates.PKR;
  } catch (error) {
    console.error("Failed to fetch USD to PKR rate:", error);
  }
}

// Function to get the price for a specific listing ID
const getPriceById = (listingId) => {
  const listing = LISTINGS.find((l) => l.id === listingId);
  return listing ? listing.price : "N/A";
};

// Function to update all listing prices based on selected currency
function updatePrices(currency) {
  document.querySelectorAll(".listing-item").forEach((listing) => {
    const listingId = parseInt(listing.getAttribute("data-id"));
    const priceElement = listing.querySelector(".info li"); // Select price <li> inside .info

    if (priceElement) {
      const basePrice = getPriceById(listingId);
      let convertedPrice = basePrice;

      if (currency === "PKR") {
        convertedPrice = (basePrice * usdToPkrRate).toFixed(0); // Convert USD to PKR
      } else {
        convertedPrice = basePrice; // Keep USD
      }

      priceElement.innerHTML = `Price: Starting from ${currency} ${convertedPrice}`;
    }
  });
}

// Event listener for currency selection
document.addEventListener("DOMContentLoaded", async () => {
  await fetchConversionRate(); // Fetch exchange rate when page loads

  const currencySelector = document.getElementById("currencySelector");

  if (currencySelector) {
    currencySelector.addEventListener("change", (event) => {
      updatePrices(event.target.value);
    });
  }
});

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

// Function to fetch listing details by ID
async function fetchListingDetails(listingId) {
  try {
    const response = await fetch(`${BASE_URL}/${listingId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const listing = await response.json();

    // Add hardcoded price to the listing object
    listing.price = getPriceById(listingId); // Assign the price based on the ID

    return listing;
  } catch (error) {
    console.error("Error fetching listing details:", error);
    return null;
  }
}

// Function to check available listings based on user-selected dates
async function checkAvailableListings(checkinDate, checkoutDate) {
  const availableListings = [];

  const fetchPromises = LISTING_IDS.map(async (listingId) => {
    const calendarData = await fetchCalendarData(
      listingId,
      checkinDate,
      checkoutDate
    );

    if (calendarData && calendarData.result) {
      const isAvailable = calendarData.result.some((entry) => {
        return (
          entry.status === "available" &&
          new Date(entry.date) >= new Date(checkinDate) &&
          new Date(entry.date) < new Date(checkoutDate)
        );
      });

      if (isAvailable) {
        availableListings.push(listingId);
        // console.log(`This listing is available and ID is ${listingId}`);
      }
    }
  });

  await Promise.all(fetchPromises);

  // console.log("Available Listings IDs:", availableListings);

  if (availableListings.length === 0) {
    showInfoAlert("No available listings for the selected dates.");
  }

  return availableListings;
}

// Event listener for the booking form submission
document.addEventListener("DOMContentLoaded", async () => {
  const bookingForm = document.getElementById("booking-form");

  if (bookingForm) {
    bookingForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const location = document.getElementById("location").value;
      const checkinDate = document.getElementById("checkin").value;
      const checkoutDate = document.getElementById("checkout").value;
      const guests = document.getElementById("guests").value;

      // Log checkin and checkout dates to the console

      if (!checkinDate) {
        showRedAlert("Please select a check-in date.");
        return;
      }
      if (!checkoutDate) {
        showRedAlert("Please select a check-out date.");
        return;
      }
      if (!guests || parseInt(guests) < 1) {
        showRedAlert("Please enter a valid number of guests.");
        return;
      }

      // If all details are valid, show green alert
      showGreenAlert("Please wait while we fetch available listings...");


      const availableListings = await checkAvailableListings(
        checkinDate,
        checkoutDate
      );

      if (availableListings.length > 0) {
        const queryParams = new URLSearchParams({
          location,
          checkinDate,
          checkoutDate,
          guests,
          availableListings: availableListings.join(","),
        });

        window.location.href = `/booking-engine?${queryParams.toString()}`;
      } else {
        showInfoAlert("No available listings for the selected dates.");
      }
    });
  }

// Function to filter listings
function filterListings(category) {
  const allListings = document.querySelectorAll(".listing-item"); // Select all listing elements
  if (allListings.length === 0) {
    console.error("No listings found to filter.");
    return;
  }

  allListings.forEach((listing) => {
    const listingId = parseInt(listing.getAttribute("data-id")); // Get listing ID
    if (category === "All" || (LISTINGS_DATA[category] && LISTINGS_DATA[category].includes(listingId))) {
      listing.style.display = "block"; // Show matching listings
    } else {
      listing.style.display = "none"; // Hide non-matching listings
    }
  });
}


document.addEventListener("click", (event) => {
  if (event.target.classList.contains("btn-filter")) {
    document.querySelectorAll(".btn-filter").forEach((btn) => btn.classList.remove("active")); // Remove active class from all buttons
    event.target.classList.add("active"); // Add active class to clicked button
    const category = event.target.getAttribute("data-category"); // Get category from button
    filterListings(category); // Apply filtering
  }
});


  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
  }

  // Shuffle the descriptions once
  shuffleArray(roomDescriptions);
  let currentIndex = 0;

  // Function to get the next description without repeating
  function getNextDescription() {
    if (currentIndex >= roomDescriptions.length) {
      currentIndex = 0; // Reset and shuffle again to avoid duplicates
      shuffleArray(roomDescriptions);
    }
    return roomDescriptions[currentIndex++];
  }
const urlParams = new URLSearchParams(window.location.search);
  const availableListings = urlParams.get("availableListings");
  // Add these lines to get the dates and guests
  const checkinDate = urlParams.get("checkinDate");
  const checkoutDate = urlParams.get("checkoutDate");
  const guests = urlParams.get("guests");

  if (availableListings) {
    const listingIdsArray = availableListings.split(",").map(Number);
    const listingsContainer = document.getElementById("available-listings");
  
    if (listingsContainer) {
      listingsContainer.innerHTML = `
        <div class="d-flex justify-content-center align-items-center" style="height: 200px;">
          <div class="spinner-border " role="status" style="width: 3rem; height: 3rem; color: #989549">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      `;
  
      const listingDetailsPromises = listingIdsArray.map(fetchListingDetails);
      const listingDetails = await Promise.all(listingDetailsPromises);
  
      // Render Listings - now with properly defined dates
      listingsContainer.innerHTML = `
        <div class="m-0 text-center">
          <div class="btn-group py-3 filter-buttons" role="group" aria-label="Room filter">
            <button type="button" class="btn btn-filter btn-list-out active" data-category="All">
              <i class="fas fa-th-large me-2"></i>All 
            </button>
            <button type="button" class="btn btn-filter btn-list-out" data-category="Studio">
              <i class="fas fa-home me-2"></i>Studio 
            </button>
            <button type="button" class="btn btn-filter btn-list-out" data-category="1BR">
              <i class="fas fa-bed me-2"></i>1 Bedroom 
            </button>
            <button type="button" class="btn btn-filter btn-list-out" data-category="2BR">
              <i class="fas fa-bed me-2"></i>2 Bedrooms 
            </button>
            <button type="button" class="btn btn-filter btn-list-out" data-category="2BR Premium">
              <i class="fas fa-star me-2"></i>2BR Premium 
            </button>
            <button type="button" class="btn btn-filter btn-list-out" data-category="3BR">
              <i class="fas fa-bed me-2"></i>3 Bedrooms 
            </button>
          </div>
        </div>
        <div class="visit-country">
          <div class="container">
            <div class="row">
              <div class="col-lg-8">
                <div class="items">
                  <div class="row">
                  ${listingDetails.map((listing) => {
                    if (listing) {
                      const imageUrl = idToImageUrlMap[listing.id];
                      const booknrentUrl = `https://www.booknrent.com/checkout/${listing.id}?start=${checkinDate}&end=${checkoutDate}&numberOfGuests=${guests}`;
                      return `
                        <div class="col-lg-12 mb-4 listing-item" data-id="${listing.id}">
                          <div class="item" style="padding: 15px;">
                            <div class="row">
                              <div class="col-lg-4 col-sm-5">
                                <div class="image">
                                  <img src="${imageUrl}" alt="Listing Name: ${listing.name}" />
                                </div>
                              </div>
                              <div class="col-lg-8 col-sm-7">
                                <div class="right-content">
                                  <h4>${listing.name}</h4>
                                  <span>Description: ${getNextDescription()}</span>
                                  <ul class="info">
                                    <li>Price: Starting from $${listing.price || "TBD"}</li>
                                  </ul>
                                  <a href="${booknrentUrl}" class="btn btn-dark">Book Now</a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>`;
                    }
                    return "";
                  }).join("")}
                  </div>
                </div>
              </div>
              <div class="col-lg-4">
              <div class="side-bar-map sticky-sidebar">
                <div class="row">
                  <div class="col-lg-12">
                    <div id="map">
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3401.8439540732948!2d74.3334951754502!3d31.500972774222813!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391904421ce9dde7%3A0x24a794a453d56e5a!2sThe%20Opus%20Luxury%20Residences!5e0!3m2!1sen!2s!4v1733138745085!5m2!1sen!2s"
                        style="border: 0"
                        allowfullscreen=""
                        loading="lazy"
                        referrerpolicy="no-referrer-when-downgrade"
                      ></iframe>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      `;
    } else {
      console.error("Available listings container not found.");
    }
  }
});
            