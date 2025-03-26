import {
  idToImageUrlMap,
  BASE_PRICES,
  LISTINGS_DATA,
  LISTINGS,
  ROOM_DETAILS,
  virtualTourLinks,
} from "./data.js";
import { showInfoAlert, showRedAlert } from "./alert.js";

let usdToPkrRate = 277.66; // Default rate
let currentCurrency = "USD"; // Default currency

// Helper function to get all listing IDs
const getAllListingIds = () => Object.values(LISTINGS_DATA).flat();

// Function to fetch USD to PKR conversion rate
async function fetchConversionRate() {
  try {
    const response = await fetch(
      "https://v6.exchangerate-api.com/v6/cbb36a5aeba2aa9dbaa251e0/latest/USD"
    );
    const data = await response.json();
    usdToPkrRate = data.conversion_rates.PKR;
  } catch (error) {
    console.error("Failed to fetch USD to PKR rate:", error);
    usdToPkrRate = 277.66; // Fallback rate
  }
}

// Function to get image URL by ID
function getImageUrlById(id) {
  return idToImageUrlMap[id] || "https://dummyimage.com/300x300/000/fff";
}

// Base URL configuration
const getBaseUrl = () => {
  const hostname = window.location.hostname;
  return hostname === "namuve.com" || hostname === "www.namuve.com"
    ? "https://namuve.com/api"
    : "http://localhost:3000/api";
};

const BASE_URL = getBaseUrl();

// Function to fetch listings data from the server
const getListingData = async () => {
  try {
    const response = await fetch(`${BASE_URL}/listings`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching listings:", error);
    return [];
  }
};

// Helper function to get base price by listing ID
function getBasePriceByListingId(listingId) {
  listingId = Number(listingId); // Ensure it's a number

  for (const [category, ids] of Object.entries(LISTINGS_DATA)) {
    if (ids.includes(listingId)) {
      // Find the listing in the LISTINGS array that matches this ID
      const listing = LISTINGS.find((item) => item.id === listingId);
      return listing ? listing.price : 40; // Use default if not found
    }
  }

  return 40; // Default fallback price
}

// Function to update listing prices based on selected currency
function updateListingPrices(listings) {
  const listingItems = document.querySelectorAll(".room-item");
  listingItems.forEach((listingItem) => {
    const priceElement = listingItem.querySelector(".position-absolute");
    const listingId = listingItem.dataset.listingId;
    const basePrice = getBasePriceByListingId(listingId);
    const priceText =
      currentCurrency === "USD"
        ? `Starting from $${basePrice}`
        : `Starting from ₨${(basePrice * usdToPkrRate)
            .toFixed(2)
            .toLocaleString()}`;
    priceElement.textContent = priceText;
  });
}

// Function to fetch calendar data
async function fetchCalendarData(listingId, startDate, endDate) {
  try {
    const response = await fetch(
      `${BASE_URL}/listings/${listingId}/calendar?startDate=${startDate}&endDate=${endDate}`
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

// Function to fetch reviews and ratings from Hostaway API
async function fetchHostawayReviews() {
  try {
    const listingIds = getAllListingIds();
    const reviewsPromises = listingIds.map(async (listingId) => {
      const response = await fetch(
        `https://api.hostaway.com/v1/reviews?listingMapIds=${listingId}`,
        {
          headers: {
            Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI4MDA2NiIsImp0aSI6ImE0OTkzMDcyMzdiNmQyODA2M2NlYzYwZjUzM2RmYTM1NTU4ZjU0Yzc4OTJhMTk5MmFkZGNhYjZlZWE5NTE1MzFjMDYwM2UzMGI5ZjczZDRhIiwiaWF0IjoxNzM5MjcwMjM2LjA0NzE4LCJuYmYiOjE3MzkyNzAyMzYuMDQ3MTgyLCJleHAiOjIwNTQ4MDMwMzYuMDQ3MTg2LCJzdWIiOiIiLCJzY29wZXMiOlsiZ2VuZXJhbCJdLCJzZWNyZXRJZCI6NTI0OTJ9.n_QTZxeFcJn121EGofg290ReOoNE7vMJAE4-lnXhNbLCZw0mIJu1KQWE5pM0xPUcUHeJ-7XTQfS0U5yIkabGi7vGGex0yx9A0h03fn7ZBAtCzPLq_Xmj8ZOdHzahpRqxRsNRRNOlnbttTSrpSo4NJCdK6yhMTKrKkTTVh60IJIc`, // Replace with your actual token
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    });

    // Wait for all review promises to resolve
    const reviewsData = await Promise.all(reviewsPromises);

    // Initialize an empty map to store ratings
    const ratingMap = {};

    // Extract ratings with status 'guest-to-host' and map to listing IDs
    reviewsData.forEach((data) => {
      (data.result || []).forEach((review) => {
        if (
          review.rating !== null &&
          review.rating >= 1 &&
          review.rating <= 10 &&
          review.type === "guest-to-host" &&
          review.channelId === 2018 &&
          2005
        ) {
          if (!ratingMap[review.listingMapId]) {
            ratingMap[review.listingMapId] = [];
          }
          ratingMap[review.listingMapId].push(review.rating);
        }
      });
    });

    // Log the filtered rating map to the console
    // console.log("Rating Map:", ratingMap);

    return ratingMap;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return {};
  }
}

// Function to map ratings to average ratings per listing
function mapRatingsToListings(ratingMap) {
  const mappedRatings = {};

  Object.keys(ratingMap).forEach((listingId) => {
    const ratings = ratingMap[listingId];
    if (Array.isArray(ratings) && ratings.length > 0) {
      const averageRating =
        ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
      mappedRatings[listingId] = averageRating;
    }
  });

  return mappedRatings;
}

// Function to handle mobile filter dropdown changes
document.addEventListener("DOMContentLoaded", () => {
  const mobileDropdown = document.getElementById("mobileFilterDropdown");
  if (mobileDropdown) {
    mobileDropdown.addEventListener("change", function () {
      const category = this.value;
      filterListings(category);
    });
  }
});

// Function to convert rating to star representation
function ratingToStars(rating) {
  const stars = Math.floor(rating / 2);
  const halfStars = rating % 2 === 1 ? 1 : 0;
  const fullStars = Array.from(
    { length: stars },
    () => '<span class="fa fa-star"></span>'
  );
  const halfStar =
    halfStars > 0 ? '<span class="fa fa-star-half-alt"></span>' : "";
  const emptyStars = Array.from(
    { length: 5 - stars - halfStars },
    () => '<span class="fa fa-star-o"></span>'
  );
  return fullStars.join("") + halfStar + emptyStars.join("");
}

async function loadListings() {
  // Ensure DOM elements exist before accessing them
  const gallery = document.getElementById("gallery");
  const loading = document.getElementById("loading");
  const errorElement = document.getElementById("error");

  if (!gallery || !loading || !errorElement) {
    // console.log("Welcome to Namuve.com");
    return;
  }

  try {
    // Show loading spinner
    loading.style.display = "block";
    errorElement.style.display = "none";

    const ratings = await fetchHostawayReviews();
    const ratingMap = mapRatingsToListings(ratings);

    await fetchConversionRate();
    const listings = await getListingData();

    const images = getAllListingIds().map((id) => ({ id: id.toString() }));

    // Add filter buttons with active state handling
    const filterContainer = document.createElement("div");
    filterContainer.classList.add("container", "mb-5", "mt-4");

    // Insert filter container before the gallery
    if (gallery.parentNode) {
      gallery.parentNode.insertBefore(filterContainer, gallery);
    }

    // Add click handlers for filter buttons
    const filterButtons = document.querySelectorAll(".filter-buttons button");
    filterButtons.forEach((button) => {
      button.addEventListener("click", function () {
        // Remove active class from all buttons
        filterButtons.forEach((btn) => btn.classList.remove("active"));
        // Add active class to clicked button
        this.classList.add("active");

        const category = this.dataset.category;
        filterListings(category);
      });
    });

    // Hide loading spinner
    loading.style.display = "none";

    // Render listings
    const validListings = listings.filter((listing) => listing && listing.id);
    validListings.forEach((listing, index) => {
      const container = document.createElement("div");
      container.classList.add("col-lg-4", "col-md-6", "wow", "fadeInUp");
      container.setAttribute("data-wow-delay", `${0.1 * (index + 1)}s`);

      // Get room details
      const roomDetails = getListingInfo(listing.id);

      // Get rating from ratingMap
      const rating = ratingMap[listing.id] || 0;

      container.innerHTML = `
        <div class="room-item shadow rounded overflow-hidden" data-listing-id="${
          listing.id
        }" style="height: 600px !important;">
          <div class="position-relative" style="height: 300px !important;">
            <img class="img-fluid" src="${getImageUrlById(
              listing.id
            )}" alt="Listing Image ${
        listing.id
      }" style="width: 100% !important; height: 300px !important; object-fit: cover !important;" />
            <small class="position-absolute start-0 top-100 translate-middle-y text-white rounded py-1 px-3 ms-4" style="background-color: #6B7560; border: 1px #6B7560 solid;">
              Starting from ${
                currentCurrency === "USD"
                  ? `$${getBasePriceByListingId(listing.id)}`
                  : `₨${(getBasePriceByListingId(listing.id) * usdToPkrRate)
                      .toFixed(2)
                      .toLocaleString()}`
              }
            </small>
          </div>
          <div class="p-4 mt-2" style="height: 300px !important; display: flex !important; flex-direction: column !important;">
            <div class="d-flex justify-content-between mb-3" style="align-items: center !important;">
              <h5 class="mb-0" style="max-width: 70% !important; font-size: 20px !important;">${
                listing.name || "Loading..."
              }</h5>
              <div class="ps-2 d-flex" style="color: #ffc107;">
                ${ratingToStars(rating)}
              </div>
            </div>
            <div class="d-flex mb-3">
              <small class="border-end me-3 pe-3"><i class="fa fa-bed me-2" style="color: #212429;"></i>${
                roomDetails.beds
              } Bed(s)</small>
              <small class="border-end me-3 pe-3"><i class="fa fa-users me-2" style="color: #212429;"></i>${
                roomDetails.guests
              } Guests</small>
              <small><i class="fa fa-wifi me-2" style="color: #212429;"></i>Wifi</small>
            </div>
            
            <div class="d-flex flex-wrap gap-2 justify-content-between mt-auto">
              <a href="/listings-details?id=${
                listing.id
              }" class="btn btn-primary rounded-pill px-4 py-2 flex-grow-1" style="background-color: #6c757e; border: none;">
                <i class="fas fa-info-circle me-2"></i>View Details
              </a>
              <button class="btn btn-dark rounded-pill px-4 py-2 flex-grow-1 virtual-tour">
                <i class="fas fa-video me-2"></i>Virtual Tour
              </button>
              <button class="btn btn-success rounded-pill px-4 py-2 flex-grow-1 book-now-btn" style="background-color: #6B7560; border: 1px #6B7560 solid;">
                <i class="fas fa-calendar-check me-2"></i>Book Now
              </button>
            </div>
          </div>
        </div>
      `;

      // Append the container to the gallery
      gallery.appendChild(container);

      // Add event listener for the virtual tour button
      const virtualTourBtn = container.querySelector(".virtual-tour");
      if (virtualTourBtn) {
        virtualTourBtn.addEventListener("click", () => {
          const tourLink = virtualTourLinks[listing.id];
          if (tourLink) {
            window.location.href = tourLink;
          } else {
            showInfoAlert("Virtual tour is not available for this listing.");
          }
        });
      }

      // Add Book Now button functionality
      const bookNowBtn = container.querySelector(".book-now-btn");
      if (bookNowBtn) {
        bookNowBtn.addEventListener("click", () => {
          openBookingModal(listing.id);
        });
      }
    });

    // Add currency selector functionality
    const currencySelector = document.getElementById("currencySelector");
    if (currencySelector) {
      currencySelector.addEventListener("change", (event) => {
        currentCurrency = event.target.value;
        updateListingPrices(listings);
      });
    }
  } catch (error) {
    console.error("Error loading listings:", error);
    if (errorElement) {
      errorElement.textContent = `Failed to load listings: ${error.message}`;
      errorElement.style.display = "block";
    }
    if (loading) {
      loading.style.display = "none";
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", loadListings);

// Helper function to get room type and base price by listing ID
function getListingInfo(listingId) {
  listingId = Number(listingId);
  for (const [category, ids] of Object.entries(LISTINGS_DATA)) {
    if (ids.includes(listingId)) {
      return {
        roomType: category,
        basePrice: BASE_PRICES[category],
        guests: ROOM_DETAILS[category].guests,
        beds: ROOM_DETAILS[category].beds,
      };
    }
  }
  return {
    roomType: "Studio",
    basePrice: 40,
    guests: "1-2",
    beds: "1",
  }; // Default fallback
}

// Update the filterListings function to handle animations
function filterListings(category) {
  const allListings = document.querySelectorAll(".col-lg-4");

  // First, fade out all listings
  allListings.forEach((container) => {
    container.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    container.style.opacity = "0";
    container.style.transform = "scale(0.95)";
  });

  // After short delay, update visibility and fade in relevant listings
  setTimeout(() => {
    allListings.forEach((container) => {
      const listing = container.querySelector(".room-item");
      const listingId = parseInt(listing.dataset.listingId);

      if (category === "All") {
        container.style.display = "";
        setTimeout(() => {
          container.style.opacity = "1";
          container.style.transform = "scale(1)";
        }, 50);
      } else {
        const shouldShow = LISTINGS_DATA[category]?.includes(listingId);
        if (shouldShow) {
          container.style.display = "";
          setTimeout(() => {
            container.style.opacity = "1";
            container.style.transform = "scale(1)";
          }, 50);
        } else {
          container.style.display = "none";
          container.style.opacity = "0";
          container.style.transform = "scale(0.95)";
        }
      }
    });
  }, 300);
}

// Add this function to check availability status
const checkAvailabilityStatus = (calendarData, selectedDate) => {
  if (!calendarData || !calendarData.result) return null;

  const dateEntry = calendarData.result.find(
    (entry) => entry.date === selectedDate
  );
  if (!dateEntry) return null;

  return {
    status: dateEntry.status,
    price: dateEntry.price,
  };
};

// Function to open booking modal
function openBookingModal(listingId) {
  const modal = new bootstrap.Modal(document.getElementById("calendar-popup"));
  const checkinInput = document.getElementById("checkin");
  const checkoutInput = document.getElementById("checkout");
  const guestsInput = document.getElementById("guests");

  // Reset form
  checkinInput.value = "";
  checkoutInput.value = "";
  guestsInput.value = "1";

  modal.show();

  // Initialize flatpickr with availability checking
  flatpickr(checkinInput, {
    dateFormat: "Y-m-d",
    minDate: "today",
    disable: [], // Will be populated with reserved dates
    onChange: async function (selectedDates, dateStr) {
      checkoutPicker.set("minDate", selectedDates[0].fp_incr(1));

      // Check availability for check-in date
      const calendarData = await fetchCalendarData(listingId, dateStr, dateStr);
      const result = checkAvailabilityStatus(calendarData, dateStr);
      if (result) {
        // console.log(`Check-in date ${dateStr}:`);
        // console.log(`Status: ${result.status}`);
        // console.log(`Price: $${result.price}`);

        if (result.status === "reserved") {
          checkinInput.value = ""; // Clear the input if date is reserved
          showInfoAlert("This date is not available for booking.");
        }
      }
    },
    onReady: async function (selectedDates, dateStr, instance) {
      // Fetch next 30 days availability when calendar initializes
      const today = new Date();
      const thirtyDaysLater = new Date(
        today.getTime() + 30 * 24 * 60 * 60 * 1000
      );
      const calendarData = await fetchCalendarData(
        listingId,
        today.toISOString().split("T")[0],
        thirtyDaysLater.toISOString().split("T")[0]
      );

      if (calendarData && calendarData.result) {
        const reservedDates = calendarData.result
          .filter((entry) => entry.status === "reserved")
          .map((entry) => entry.date);

        instance.set("disable", reservedDates);
      }
    },
  });

  const checkoutPicker = flatpickr(checkoutInput, {
    dateFormat: "Y-m-d",
    minDate: "today",
    disable: [], // Will be populated with reserved dates
    onChange: async function (selectedDates, dateStr) {
      const calendarData = await fetchCalendarData(listingId, dateStr, dateStr);
      const result = checkAvailabilityStatus(calendarData, dateStr);
      if (result) {
        // console.log(`Check-out date ${dateStr}:`);
        // console.log(`Status: ${result.status}`);
        // console.log(`Price: $${result.price}`);

        if (result.status === "reserved") {
          checkoutInput.value = ""; // Clear the input if date is reserved
          showInfoAlert("This date is not available for booking.");
        }
      }
    },
    onReady: async function (selectedDates, dateStr, instance) {
      // Fetch next 30 days availability when calendar initializes
      const today = new Date();
      const thirtyDaysLater = new Date(
        today.getTime() + 30 * 24 * 60 * 60 * 1000
      );
      const calendarData = await fetchCalendarData(
        listingId,
        today.toISOString().split("T")[0],
        thirtyDaysLater.toISOString().split("T")[0]
      );

      if (calendarData && calendarData.result) {
        const reservedDates = calendarData.result
          .filter((entry) => entry.status === "reserved")
          .map((entry) => entry.date);

        instance.set("disable", reservedDates);
      }
    },
  });

  // Handle booking confirmation
  const confirmBookingBtn = document.getElementById("confirm-booking");
  if (confirmBookingBtn) {
    confirmBookingBtn.onclick = async () => {
      const checkin = checkinInput.value;
      const checkout = checkoutInput.value;
      const guests = guestsInput.value;

      if (!checkin || !checkout || !guests) {
        showRedAlert(
          "Please fill in all fields before proceeding with the booking."
        );
        return;
      }

      // Show loading message
      showInfoAlert("Please wait while we process your booking...");

      // Check availability for both dates before proceeding
      const checkinData = await fetchCalendarData(listingId, checkin, checkin);
      const checkoutData = await fetchCalendarData(
        listingId,
        checkout,
        checkout
      );

      const checkinStatus = checkAvailabilityStatus(checkinData, checkin);
      const checkoutStatus = checkAvailabilityStatus(checkoutData, checkout);

      if (
        !checkinStatus ||
        !checkoutStatus ||
        checkinStatus.status === "reserved" ||
        checkoutStatus.status === "reserved"
      ) {
        showRedAlert(
          "Selected dates are not available. Please choose different dates."
        );
        return;
      }

      try {
        // Get listing details for the checkout
        const listing = await getListingInfo(listingId);

        // Create checkout session
        const response = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            listingId,
            listingName: listing.name,
            price: checkinStatus.price,
            checkIn: checkin,
            checkOut: checkout,
            guests,
            imageUrl: listing.imageUrl,
            description: listing.description,
          }),
        });

        const { url } = await response.json();

        // Reset form and close modal
        checkinInput.value = "";
        checkoutInput.value = "";
        guestsInput.value = "1";
        modal.hide();

        // Redirect to Stripe checkout
        window.location.href = url;
      } catch (error) {
        console.error("Error:", error);
        showRedAlert(
          "An error occurred while processing your booking. Please try again."
        );
      }
    };
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", loadListings);

// Make filterListings available globally
window.filterListings = filterListings;

export { fetchHostawayReviews, mapRatingsToListings, ratingToStars };
