import { showRedAlert, showInfoAlert } from "./alert.js";
import {idToImageUrlMap, LISTINGS, roomDescriptions, LISTINGS_DATA} from "./data.js"; 
import {fetchHostawayReviews, mapRatingsToListings, ratingToStars} from "./listings.js";

// Base URL configuration
const getBaseUrl = () => {
  const hostname = window.location.hostname;
  return hostname === 'namuve.com' || hostname === 'www.namuve.com'
    ? 'https://namuve.com/api'
    : 'http://localhost:3000/api';
};

const BASE_URL = getBaseUrl();
const LISTING_IDS = LISTINGS.map((listing) => listing.id);
let usdToPkrRate = 277.66; // Fallback rate
const calendarDataCache = new Map();
const listingDetailsCache = new Map();
// Function to fetch USD to PKR exchange rate
async function fetchConversionRate() {
  try {
    const response = await fetch(
      "https://v6.exchangerate-api.com/v6/cbb36a5aeba2aa9dbaa251e0/latest/USD"
    );
    const data = await response.json();
    usdToPkrRate = data.conversion_rates.PKR;
  } catch (error) {
    console.error("Failed to fetch exchange rate:", error);
  }
}

// Get listing price by ID
const getPriceById = (listingId) => {
  const listing = LISTINGS.find((l) => l.id === listingId);
  return listing ? listing.price : "N/A";
};

// Update all listing prices based on selected currency
function updatePrices(currency) {
  document.querySelectorAll(".listing-item").forEach((listing) => {
    const listingId = parseInt(listing.getAttribute("data-id"));
    const priceElement = listing.querySelector(".info li");

    if (priceElement) {
      let basePrice = getPriceById(listingId);
      let convertedPrice =
        currency === "PKR" ? (basePrice * usdToPkrRate).toFixed(0) : basePrice;

      priceElement.innerHTML = `Price: Starting from ${currency} ${convertedPrice}`;
    }
  });
}

// Event listener for currency selection
document.addEventListener("DOMContentLoaded", async () => {
  await fetchConversionRate();

  const currencySelector = document.getElementById("currencySelector");
  if (currencySelector) {
    currencySelector.addEventListener("change", (event) => {
      updatePrices(event.target.value);
    });
  }
});

// Fetch calendar data for a listing
async function fetchCalendarData(listingId, startDate, endDate) {
  const cacheKey = `${listingId}-${startDate}-${endDate}`;
  if (calendarDataCache.has(cacheKey)) return calendarDataCache.get(cacheKey);

  try {
    const response = await fetch(
      `${BASE_URL}/listings/${listingId}/calendar?startDate=${startDate}&endDate=${endDate}`
    );
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    calendarDataCache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error("Error fetching calendar data:", error);
    return null;
  }
}

// Fetch listing details
async function fetchListingDetails(listingId) {
  if (listingDetailsCache.has(listingId))
    return listingDetailsCache.get(listingId);

  try {
    const response = await fetch(`${BASE_URL}/listings/${listingId}`);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const listing = await response.json();
    listing.price = getPriceById(listingId);
    listingDetailsCache.set(listingId, listing);
    return listing;
  } catch (error) {
    console.error("Error fetching listing details:", error);
    return null;
  }
}

// Check available listings
async function checkAvailableListings(checkinDate, checkoutDate) {
  const checkin = new Date(checkinDate);
  const checkout = new Date(checkoutDate);

  try {
    const results = await Promise.allSettled(
      LISTING_IDS.map((id) => fetchCalendarData(id, checkinDate, checkoutDate))
    );

    return LISTING_IDS.filter((id, index) => {
      const calendarData =
        results[index].status === "fulfilled" ? results[index].value : null;
      return calendarData?.result?.some(
        (entry) =>
          entry.status === "available" &&
          new Date(entry.date) >= checkin &&
          new Date(entry.date) < checkout
      );
    });
  } catch (error) {
    console.error("Error checking available listings:", error);
    return [];
  }
}

// Handle booking form submission
document.addEventListener("DOMContentLoaded", () => {
  const bookingForm = document.getElementById("booking-form");

  if (bookingForm) {
    bookingForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const location = document.getElementById("location").value;
      const checkinDate = document.getElementById("checkin").value;
      const checkoutDate = document.getElementById("checkout").value;
      const guests = document.getElementById("guests").value;

      if (!checkinDate || !checkoutDate || !guests || parseInt(guests) < 1) {
        showRedAlert("Please fill all fields correctly.");
        return;
      }

      sessionStorage.setItem(
        "searchParams",
        JSON.stringify({
          location,
          checkinDate,
          checkoutDate,
          guests,
        })
      );

      showInfoAlert("Searching for available listings...");

      checkAvailableListings(checkinDate, checkoutDate)
        .then((availableListings) => {
          sessionStorage.setItem(
            "availableListings",
            JSON.stringify(availableListings)
          );
        })
        .catch((error) => {
          console.error("Error fetching listings:", error);
        });

      setTimeout(() => {
        window.location.href = "/booking-engine";
      }, 3500);
    });
  }
});

// Filter listings by category
function filterListings(category) {
  document.querySelectorAll(".listing-item").forEach((listing) => {
    const listingId = parseInt(listing.getAttribute("data-id"));
    listing.style.display =
      category === "All" || LISTINGS_DATA[category]?.includes(listingId)
        ? "block"
        : "none";
  });
}

// Event listener for filtering listings
document.addEventListener("click", (event) => {
  if (event.target.classList.contains("btn-filter")) {
    document
      .querySelectorAll(".btn-filter")
      .forEach((btn) => btn.classList.remove("active"));
    event.target.classList.add("active");

    filterListings(event.target.getAttribute("data-category"));
  }
});

document.addEventListener("click", (event) => {
  if (event.target.classList.contains("btn-filter")) {
    document
      .querySelectorAll(".btn-filter")
      .forEach((btn) => btn.classList.remove("active")); // Remove active class from all buttons
    event.target.classList.add("active"); // Add active class to clicked button
    const category = event.target.getAttribute("data-category"); // Get category from button
    filterListings(category); // Apply filtering
  }
});

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// shuffleArray(roomDescriptions);
// let currentIndex = 0;
// function getNextDescription() {
//   if (currentIndex >= roomDescriptions.length) {
//     currentIndex = 0;
//     shuffleArray(roomDescriptions);
//   }
//   return roomDescriptions[currentIndex++];
// }

document.addEventListener("DOMContentLoaded", async () => {
  // Get search parameters from sessionStorage
  const searchParams = JSON.parse(sessionStorage.getItem("searchParams"));

  if (searchParams) {
    const { location, checkinDate, checkoutDate, guests } = searchParams;
    const listingsContainer = document.getElementById("available-listings");

    if (listingsContainer) {
      // Show loading spinner
      listingsContainer.innerHTML = `
        <div class="d-flex justify-content-center align-items-center" style="height: 200px;">
          <div class="spinner-border" role="status" style="width: 3rem; height: 3rem; color: #989549">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>`;

      try {
        // Check available listings
        const availableListings = await checkAvailableListings(
          checkinDate,
          checkoutDate
        );

        if (availableListings.length > 0) {
          const listingDetails = await Promise.all(
            availableListings.map(fetchListingDetails)
          );
          const ratings = await fetchHostawayReviews();
          const mappedRatings = mapRatingsToListings(ratings);

          // Render listings
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
                        ${listingDetails
                          .filter(Boolean)
                          .map((listing) => {
                            const imageUrl =
                              idToImageUrlMap[listing.id] ||
                              "https://dummyimage.com/300x300/000/fff";
                            const booknrentUrl = `https://www.booknrent.com/checkout/${listing.id}?start=${checkinDate}&end=${checkoutDate}&numberOfGuests=${guests}`;
                            const rating = mappedRatings[listing.id] || 0;
                            const stars = ratingToStars(rating);

                            return `
                            <div class="col-lg-12 mb-4 listing-item" data-id="${
                              listing.id
                            }">
                              <div class="item" style="padding: 15px;">
                                <div class="row">
                                  <div class="col-lg-4 col-sm-5">
                                    <div class="image">
                                      <img src="${imageUrl}" alt="Listing Name: ${
                              listing.name
                            }" />
                                    </div>
                                  </div>
                                  <div class="col-lg-8 col-sm-7">
                                    <div class="right-content">
                                      <h4 class="d-flex align-items-center">
                                        ${listing.name}
                                        <div class="ps-2 d-flex star-one"
                                          style="color: #FFC107; width: 40% !important; justify-content: flex-end !important;">
                                          ${stars}
                                        </div>
                                      </h4>
                                      <ul class="info">
                                        <li>Price: Starting from $${
                                          listing.price || "TBD"
                                        }</li>
                                      </ul>
                                      <a href="${booknrentUrl}" class="btn btn-dark">Book Now</a>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>`;
                          })
                          .join("")}
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
                              style="border: 0" allowfullscreen="" loading="lazy"
                              referrerpolicy="no-referrer-when-downgrade"></iframe>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>`;
        } else {
          listingsContainer.innerHTML =
            "<p class='text-danger text-center'>No available listings for the selected dates.</p>";
        }
      } catch (error) {
        console.error("Error fetching listing details:", error);
        listingsContainer.innerHTML =
          "<p class='text-danger text-center'>Failed to load listings. Please try again later.</p>";
      }
    }
  }
});