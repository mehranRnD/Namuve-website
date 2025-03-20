import { showRedAlert, showInfoAlert } from "./alert.js";
import { idToImageUrlMap, LISTINGS, virtualTourLinks } from "./data.js";
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
// Images array with IDs for room data
const images = [{ id: "288675" }, { id: "288676" }, { id: "288723" }];
// Function to update room prices based on selected currency
function updateRoomPrices() {
  const roomItems = document.querySelectorAll(".room-item");
  roomItems.forEach((roomItem, index) => {
    const roomId = images[index].id; // Get the room ID
    const listing = LISTINGS.find(
      (listing) => listing.id.toString() === roomId
    ); // Find the listing by ID
    const priceElement = roomItem.querySelector(".position-absolute");
    if (listing) {
      const priceInPkr = listing.price * usdToPkrRate;
      const priceText =
        currentCurrency === "USD"
          ? `Starting from $${listing.price}`
          : `Starting from ₨${priceInPkr.toFixed(2).toLocaleString()}`;
      priceElement.textContent = priceText;
    } else {
      priceElement.textContent = "Price not available";
    }
  });
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
    roomItem.innerHTML = `
      <div class="room-item shadow rounded overflow-hidden" style="height: 100% !important;">
        <div class="position-relative">
          <img class="img-fluid" src="${imageUrl}" alt="Room Image ${
      image.id
    }" style="width: 100%; height: 250px; object-fit: cover;" />
          <small class="position-absolute start-0 top-100 translate-middle-y text-white rounded py-1 px-3 ms-4" style="background-color: #6B7560; border: 1px #6B7560 solid;">
            ${
              listing
                ? `Starting from $${listing.price}`
                : "Price not available"
            }
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
      const confirmBookingBtn = document.getElementById("confirm-booking");
      confirmBookingBtn.onclick = () => {
        const checkinInput = document.getElementById("checkin");
        const checkoutInput = document.getElementById("checkout");
        const guestsInput = document.getElementById("guests");
        const checkin = checkinInput.dataset.selectedDate;
        const checkout = checkoutInput.dataset.selectedDate;
        const guests = guestsInput.value;
        if (!checkin) {
          showRedAlert("Please enter a check-in date.");
          return;
        }
        if (!checkout) {
          showRedAlert("Please enter a check-out date.");
          return;
        }
        if (!guests || parseInt(guests) < 1) {
          showRedAlert("Please enter a valid number of guests.");
          return;
        }
        const booknrentUrl = `https://www.booknrent.com/checkout/${roomId}?start=${checkin}&end=${checkout}&numberOfGuests=${guests}`;
        // Clear the form inputs
        checkinInput.value = "";
        checkoutInput.value = "";
        guestsInput.value = "1";
        checkinInput.dataset.selectedDate = "";
        checkoutInput.dataset.selectedDate = "";
        modal.hide();
        window.location.href = booknrentUrl;
      };
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
  updateRoomPrices(); // Call to update prices after rooms are loaded
  const currencySelector = document.getElementById("currencySelector");
  if (currencySelector) {
    currencySelector.addEventListener("change", (event) => {
      currentCurrency = event.target.value;
      updateRoomPrices(); // Update prices when currency changes
    });
  }
};
document.addEventListener("DOMContentLoaded", () => {
  loadRooms();
});
