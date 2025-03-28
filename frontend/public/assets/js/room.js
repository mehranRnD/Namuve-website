import { showRedAlert, showInfoAlert } from "./alert.js";
import { idToImageUrlMap, virtualTourLinks, LISTINGS } from "./data.js";
import {
  fetchHostawayReviews,
  mapRatingsToListings,
  ratingToStars,
} from "./listings.js";
let usdToPkrRate = 1;
let currentCurrency = "USD"; // Default currency
// Descriptions for the rooms
const roomDescriptions = [
  "Experience the ultimate luxury in our spacious suite, featuring elegant decor and modern amenities.",
  "Enjoy a cozy and comfortable stay in this beautifully designed room.",
  "Indulge in style and sophistication with our premium room offering stunning views and top-notch facilities.",
];
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
// Base URL configuration
const getBaseUrl = () => {
  const hostname = window.location.hostname;
  return hostname === "namuve.com" || hostname === "www.namuve.com"
    ? "https://namuve.com/api"
    : "http://localhost:3000/api";
};

const BASE_URL = getBaseUrl();

// Fetch listings data from the server
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

async function fetchListingsPrices() {
  const token =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI4MDA2NiIsImp0aSI6ImE0OTkzMDcyMzdiNmQyODA2M2NlYzYwZjUzM2RmYTM1NTU4ZjU0Yzc4OTJhMTk5MmFkZGNhYjZlZWE5NTE1MzFjMDYwM2UzMGI5ZjczZDRhIiwiaWF0IjoxNzM5MjcwMjM2LjA0NzE4LCJuYmYiOjE3MzkyNzAyMzYuMDQ3MTgyLCJleHAiOjIwNTQ4MDMwMzYuMDQ3MTg2LCJzdWIiOiIiLCJzY29wZXMiOlsiZ2VuZXJhbCJdLCJzZWNyZXRJZCI6NTI0OTJ9.n_QTZxeFcJn121EGofg290ReOoNE7vMJAE4-lnXhNbLCZw0mIJu1KQWE5pM0xPUcUHeJ-7XTQfS0U5yIkabGi7vGGex0yx9A0h03fn7ZBAtCzPLq_Xmj8ZOdHzahpRqxRsNRRNOlnbttTSrpSo4NJCdK6yhMTKrKkTTVh60IJIc";

  try {
    const today = new Date().toISOString().split("T")[0];
    // console.log('Fetching prices for:', today);

    const listingIds = LISTINGS.map((listing) => listing.id);

    // Fetch all listing prices in parallel
    const fetchPromises = listingIds.map(async (listingId) => {
      try {
        const response = await fetch(
          `https://api.hostaway.com/v1/listings/${listingId}/calendar`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          console.warn(
            `Failed to fetch calendar for listing ${listingId}: ${response.status}`
          );
          return null;
        }

        const data = await response.json();

        let todayPrice =
          data.dates?.find((date) => date.date === today)?.price ||
          data.result?.find((date) => date.date === today)?.price ||
          data.calendar?.find((date) => date.date === today)?.price;

        return todayPrice !== undefined
          ? { listingId, price: todayPrice }
          : null;
      } catch (error) {
        console.error(
          `Error fetching calendar for listing ${listingId}:`,
          error
        );
        return null;
      }
    });

    // Wait for all fetches to complete
    const allPrices = (await Promise.all(fetchPromises)).filter(Boolean);

    // **Update LISTINGS with the latest prices**
    LISTINGS.forEach((listing) => {
      const priceData = allPrices.find((p) => p.listingId === listing.id);
      if (priceData) {
        listing.price = priceData.price;
      }
    });

    // **Log Price Summary**
    // const pricesSummary = LISTINGS.map(listing => `${listing.id}: ${listing.price}`);
    // console.log('Updated Price Summary:\n', pricesSummary.join('\n'));

    return allPrices;
  } catch (error) {
    console.error("Error fetching listings prices:", error);
    return [];
  }
}

// Call the function
fetchListingsPrices();

// Images array with IDs for room data
const images = [{ id: "288675" }, { id: "288676" }, { id: "288723" }];

// Function to display real-time prices
async function displayRealTimePrices() {
  try {
    const prices = await fetchListingsPrices();
    images.forEach((image) => {
      const price = prices.find((p) => p.listingId === Number(image.id));
    });
  } catch (error) {
    console.error("Error displaying real-time prices:", error);
  }
}

// Call the function to display prices
displayRealTimePrices();

// Helper function to get base price by listing ID
function getBasePriceByListingId(listingId) {
  listingId = Number(listingId); // Ensure it's a number
  // Find the index of this listing in the LISTINGS array
  const listingIndex = LISTINGS.findIndex((item) => item.id === listingId);
  if (listingIndex !== -1) {
    // Use the corresponding price from allPrices array
    const price = LISTINGS[listingIndex].price;
    return price;
  }
  return 40; // Default fallback price
}

// Function to fetch calendar data for a specific listing
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
// Function to fetch price data for a specific listing
async function fetchPriceData(listingId, checkIn, checkOut) {
  try {
    const response = await fetch(
      `${BASE_URL}/listings/${listingId}/price?checkIn=${checkIn}&checkOut=${checkOut}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching price data:", error);
    return null;
  }
}
// Function to blur reserved dates
function blurReservedDates(calendarData) {
  if (!calendarData || !calendarData.result) return [];
  return calendarData.result
    .filter((entry) => entry.status === "reserved")
    .map((entry) => entry.date);
}
// Load and render room data dynamically
const loadRooms = async () => {
  const roomList = document.getElementById("room-list");
  if (!roomList) {
    return;
  }
  // Fetch ratings
  const ratings = await fetchHostawayReviews();
  const ratingMap = mapRatingsToListings(ratings);
  await fetchConversionRate();
  const listings = await getListingData();
  images.forEach((image, index) => {
    const listing = listings.find(
      (listing) => listing.id.toString() === image.id.toString()
    );
    const imageUrl =
      idToImageUrlMap[image.id] || "https://dummyimage.com/300x300/000/fff";

    // Get rating for this room
    const rating = ratingMap[image.id] || 0;
    const starsHTML = ratingToStars(rating);

    const roomItem = document.createElement("div");
    roomItem.classList.add("col-lg-4", "col-md-6", "wow", "fadeInUp");
    roomItem.setAttribute("data-wow-delay", `${0.1 * (index + 1)}s`);
    roomItem.dataset.listingId = image.id;
    roomItem.innerHTML = `
      <div class="room-item shadow rounded overflow-hidden" style="height: 100% !important;">
        <div class="position-relative">
          <img class="img-fluid" src="${imageUrl}" alt="Room Image ${
      image.id
    }" style="width: 100%; height: 250px; object-fit: cover;" />
          <small class="position-absolute start-0 top-100 translate-middle-y text-white rounded py-1 px-3 ms-4" style="background-color: #6B7560; border: 1px #6B7560 solid;">
            Loading price...
          </small>
        </div>
        <div class="p-4 mt-2">
          <div class="d-flex justify-content-between mb-3">
            <h5 class="mb-0" style="width: 60% !important;">${
              listing ? listing.name : "Loading..."
            }</h5>
            <div class="ps-2 d-flex star-one" style="color: #FFC107; width: 40% !important; justify-content: flex-end !important;">
              ${starsHTML}
            </div>
          </div>
          <p class="text-body mb-3" style="min-height: 48px !important;">${
            roomDescriptions[index]
          }</p>
          <div class="d-flex flex-wrap gap-2 justify-content-between mt-auto">
            <a href="/listings-details?id=${image.id}"
              class="btn btn-primary rounded-pill px-4 py-2 flex-grow-1"
              style="background-color: #6C757E;; border: none;">
              <i class="fas fa-info-circle me-2"></i>View Details
            </a>
            <button class="btn btn-dark rounded-pill px-4 py-2 flex-grow-1 virtual-tour">
              <i class="fas fa-video me-2"></i>Virtual Tour
            </button>
            <button class="btn btn-success rounded-pill px-4 py-2 flex-grow-1 book-now-btn"
            style="background-color: #6B7560; border: 1px #6B7560 solid; " data-room-id="${
              image.id
            }">
              <i class="fas fa-calendar-check me-2"></i>Book Now
            </button>
          </div>
        </div>
      </div>
    `;
    roomList.appendChild(roomItem);
    (async () => {
      try {
        const prices = await fetchListingsPrices();
        const price = prices.find((p) => p.listingId === Number(image.id));
        const priceElement = roomItem.querySelector(".position-absolute");
        if (price) {
          priceElement.textContent = `Starting from $${price.price}`;
        } else {
          priceElement.textContent = "Price not available";
        }
      } catch (error) {
        console.error("Error updating price:", error);
        const priceElement = roomItem.querySelector(".position-absolute");
        priceElement.textContent = "Price not available";
      }
    })();
    const bookNowBtn = roomItem.querySelector(".book-now-btn");
    bookNowBtn.addEventListener("click", async () => {
      const roomId = image.id;
      const modalElement = document.getElementById("calendar-popup");
      modalElement.dataset.roomId = roomId;
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
      document.getElementById("checkin").value = "";
      document.getElementById("checkout").value = "";
      document.getElementById("guests").value = "1";
      const calendarData = await fetchCalendarData(
        roomId,
        "2025-01-01",
        "2025-12-31"
      );
      const reservedDates = blurReservedDates(calendarData);
      // Initialize flatpickr for checkin and checkout
      flatpickr("#checkin", {
        minDate: "today",
        dateFormat: "Y-m-d",
        disable: reservedDates,
        onChange: (selectedDates, dateStr) => {
          document.getElementById("checkin").dataset.selectedDate = dateStr;
        },
      });
      flatpickr("#checkout", {
        minDate: "today",
        dateFormat: "Y-m-d",
        disable: reservedDates,
        onChange: (selectedDates, dateStr) => {
          document.getElementById("checkout").dataset.selectedDate = dateStr;
        },
      });
    });
    const virtualTourBtn = roomItem.querySelector(".virtual-tour");
    virtualTourBtn.addEventListener("click", () => {
      const roomId = image.id; // Get the room ID
      const tourLink = virtualTourLinks[roomId]; // Get the corresponding virtual tour link
      if (tourLink) {
        // Redirect to the virtual tour link if it exists
        window.location.href = tourLink;
      } else {
        // Handle cases where the virtual tour link is not available
        showInfoAlert("Virtual tour is not available for this room.");
      }
    });
  });
  const currencySelector = document.getElementById("currencySelector");
  if (currencySelector !== null) {
    currencySelector.addEventListener("change", async (event) => {
      if (event.target.value !== null) {
        currentCurrency = event.target.value;
        await fetchConversionRate();
        updateAllPrices();
      }
    });
  }
  // Update prices when dates change
  document.getElementById("checkin").addEventListener("change", async () => {
    const checkIn = document.getElementById("checkin").value;
    const checkOut = document.getElementById("checkout").value;
    const roomCards = roomList.querySelectorAll(".room-item");
    roomCards.forEach(async (card) => {
      const roomId = card.querySelector(".book-now-btn").dataset.roomId;
      // Fetch price data for this listing
      const priceData = await fetchPriceData(roomId, checkIn, checkOut);
      const priceElement = card.querySelector(".position-absolute");
      if (priceData && priceData.price) {
        priceElement.textContent = `$${priceData.price} per night`;
      } else {
        priceElement.textContent = "Price not available";
      }
    });
  });
  document.getElementById("checkout").addEventListener("change", async () => {
    const checkIn = document.getElementById("checkin").value;
    const checkOut = document.getElementById("checkout").value;
    const roomCards = roomList.querySelectorAll(".room-item");
    roomCards.forEach(async (card) => {
      const roomId = card.querySelector(".book-now-btn").dataset.roomId;
      // Fetch price data for this listing
      const priceData = await fetchPriceData(roomId, checkIn, checkOut);
      const priceElement = card.querySelector(".position-absolute");
      if (priceData && priceData.price) {
        priceElement.textContent = `$${priceData.price} per night`;
      } else {
        priceElement.textContent = "Price not available";
      }
    });
  });
};

// Function to update all prices
async function updateAllPrices() {
  const priceElements = document.querySelectorAll(".position-absolute");
  priceElements.forEach(async (element) => {
    const roomId = element.closest(".room-item").dataset.listingId;
    try {
      const prices = await fetchListingsPrices();
      const price = prices.find((p) => p.listingId === Number(roomId));
      if (price) {
        const convertedPrice =
          currentCurrency === "USD"
            ? (price.price / usdToPkrRate).toFixed(2)
            : (price.price * usdToPkrRate).toFixed(2);
        const currencySymbol = currentCurrency === "USD" ? "$" : "₨";
        element.textContent = `Starting from ${currencySymbol}${convertedPrice}`;
      } else {
        element.textContent = "Price not available";
      }
    } catch (error) {
      console.error("Error updating price:", error);
      element.textContent = "Price not available";
    }
  });
}

// Function to get listing info
async function getListingInfo(listingId) {
  try {
    const response = await fetch(`/api/listings/${listingId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching listing info:", error);
    return null;
  }
}

// Function to check availability status
function checkAvailabilityStatus(calendarData, selectedDate) {
  if (!calendarData || !calendarData.result) return null;

  const entry = calendarData.result.find(
    (entry) => entry.date === selectedDate
  );
  if (!entry) return null;

  return {
    status: entry.status,
    price: entry.price,
  };
}

document
  .getElementById("confirm-booking")
  .addEventListener("click", async () => {
    const checkinInput = document.getElementById("checkin");
    const checkoutInput = document.getElementById("checkout");
    const guestsInput = document.getElementById("guests");

    const checkin = checkinInput.dataset.selectedDate;
    const checkout = checkoutInput.dataset.selectedDate;
    const guests = guestsInput.value;

    // Get the room ID from the modal's parent element
    const modalElement = document.querySelector(".modal.show");
    const roomId = modalElement ? modalElement.dataset.roomId : null;

    if (!roomId) {
      showRedAlert("Error: Room ID not found. Please try again.");
      return;
    }

    if (!checkin || !checkout || !guests) {
      showRedAlert(
        "Please select both check-in and check-out dates and enter the number of guests."
      );
      return;
    }

    // Show loading message
    showInfoAlert("Please wait while we process your booking...");

    try {
      // Get listing details for the checkout
      const listing = await getListingInfo(roomId);

      // Create checkout session
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId: roomId,
          listingName: listing.name,
          price: listing.price,
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
      checkinInput.dataset.selectedDate = "";
      checkoutInput.dataset.selectedDate = "";

      const modal = new bootstrap.Modal(modalElement);
      modal.hide();

      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (error) {
      console.error("Error:", error);
      showRedAlert(
        "An error occurred while processing your booking. Please try again."
      );
    }
  });

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("currencySelector")
    .addEventListener("change", async (event) => {
      if (event.target.value !== null) {
        currentCurrency = event.target.value;
        await fetchConversionRate();
      }
    });
});

document.addEventListener("DOMContentLoaded", () => {
  loadRooms();
});
