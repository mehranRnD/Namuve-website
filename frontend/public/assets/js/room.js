import { idToImageUrlMap } from "./data.js";

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
      "https://v6.exchangerate-api.com/v6/dd469c4556431d9b5576d5f2/latest/USD"
    );
    const data = await response.json();
    usdToPkrRate = data.conversion_rates.PKR;
  } catch (error) {
    console.error("Failed to fetch USD to PKR rate:", error);
    usdToPkrRate = 277.66; // Fallback rate
  }
}

// Fetch listings data from the server
const getListingData = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/listings"); // Ensure the backend is running
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching listings:", error);
    return [];
  }
};

// Images array with IDs for room data
const images = [{ id: "323227" }, { id: "288691" }, { id: "288678" }];

// Update the virtualTourPaths object
const virtualTourPaths = {
  "323227": "../Opus4F42/index.html", // Updated path for room 323227
  "288724": "./assets/virtual-tours/tour2.html",
  "309909": "./assets/virtual-tours/tour3.html"
};

// Function to update room prices based on selected currency
function updateRoomPrices(listings) {
  const roomItems = document.querySelectorAll(".room-item");
  roomItems.forEach((roomItem, index) => {
    const listing = listings.find(
      (listing) => listing.id.toString() === images[index].id.toString()
    );
    const priceElement = roomItem.querySelector(".position-absolute");
    if (listing && listing.price) {
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
      `http://localhost:3000/api/listings/${listingId}/calendar?startDate=${startDate}&endDate=${endDate}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching calendar data:", error);
    return null;
  }
}

// Update the checkAvailabilityStatus function to include price
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

// Function to blur reserved dates
function blurReservedDates(calendarData) {
  const reservedDates = calendarData.result
    .filter((entry) => entry.status === "reserved")
    .map((entry) => entry.date);
  return reservedDates;
}

// Load and render room data dynamically
const loadRooms = async () => {
  const roomList = document.getElementById("room-list");

  // If roomList doesn't exist, silently return without showing error
  if (!roomList) {
    return;
  }

  await fetchConversionRate();
  const listings = await getListingData();

  images.forEach((image, index) => {
    const listing = listings.find(
      (listing) => listing.id.toString() === image.id.toString()
    );
    const imageUrl =
      idToImageUrlMap[image.id] || "https://via.placeholder.com/300";

    const roomItem = document.createElement("div");
    roomItem.classList.add("col-lg-4", "col-md-6", "wow", "fadeInUp");
    roomItem.setAttribute("data-wow-delay", `${0.1 * (index + 1)}s`);

    roomItem.innerHTML = `
      <div class="room-item shadow rounded overflow-hidden" style="height: 100% !important;">
        <div class="position-relative">
          <img class="img-fluid" src="${imageUrl}" alt="Room Image ${
      image.id
    }" style="width: 100% !important; height: 250px !important; object-fit: cover !important;" />
          <small class="position-absolute start-0 top-100 translate-middle-y text-white rounded py-1 px-3 ms-4" style="background-color: #989549;">
            ${
              currentCurrency === "USD"
                ? `$ ${listing ? listing.price : "N/A"}`
                : `₨ ${
                    listing
                      ? (listing.price * usdToPkrRate)
                          .toFixed(2)
                          .toLocaleString()
                      : "N/A"
                  }`
            }
          </small>
        </div>
        <div class="p-4 mt-2">
          <div class="d-flex justify-content-between mb-3">
            <h5 class="mb-0" style="width: 60% !important;">${
              listing ? listing.name : "Loading..."
            }</h5>
            <div class="ps-2 d-flex" style="color: #989549; width: 40% !important; justify-content: flex-end !important;">
              <small class="fa fa-star" style="margin-right: 2px !important;"></small>
              <small class="fa fa-star" style="margin-right: 2px !important;"></small>
              <small class="fa fa-star" style="margin-right: 2px !important;"></small>
              <small class="fa fa-star" style="margin-right: 2px !important;"></small>
              <small class="fa fa-star"></small>
            </div>
          </div>
          <div class="d-flex mb-3" style="justify-content: space-between !important;">
            <small class="border-end me-3 pe-3"><i class="fa fa-bed me-2" style="color: #989549;"></i>3 Beds</small>
            <small class="border-end me-3 pe-3"><i class="fa fa-bath me-2" style="color: #989549;"></i>2 Baths</small>
            <small><i class="fa fa-wifi me-2" style="color: #989549;"></i>Wifi</small>
          </div>
          <p class="text-body mb-3" style="min-height: 48px !important;">${
            roomDescriptions[index]
          }</p>
          <div class="d-flex flex-wrap gap-2 justify-content-between mt-auto">
        <a href="listings-details.html?id=${image.id}" 
          class="btn btn-primary rounded-pill px-4 py-2 flex-grow-1"
          style="background-color: #989549; border: none;">
          <i class="fas fa-info-circle me-2"></i>View Details
        </a>
        <button class="btn btn-dark rounded-pill px-4 py-2 flex-grow-1 virtual-tour">
          <i class="fas fa-video me-2"></i>Virtual Tour
        </button>
        <button class="btn btn-success rounded-pill px-4 py-2 flex-grow-1 book-now-btn">
          <i class="fas fa-calendar-check me-2"></i>Book Now
        </button>
      </div>
        </div>
      </div>
    `;
    roomList.appendChild(roomItem);

    // Add click event listener to the Book Now button
    const bookNowBtn = roomItem.querySelector(".book-now-btn");
    bookNowBtn.addEventListener("click", async () => {
      const roomId = image.id;
      const modal = new bootstrap.Modal(
        document.getElementById("calendar-popup")
      );
      modal.show();

      // Reset form fields when modal opens
      document.getElementById("checkin").value = "";
      document.getElementById("checkout").value = "";
      document.getElementById("guests").value = "1";

      // Initialize flatpickr for date inputs
      const calendarData = await fetchCalendarData(roomId, "2024-01-01", "2024-12-31");
      const reservedDates = blurReservedDates(calendarData);

      flatpickr("#checkin", {
        minDate: "today",
        dateFormat: "Y-m-d",
        disable: reservedDates, // Disable reserved dates
      });

      flatpickr("#checkout", {
        minDate: "today",
        dateFormat: "Y-m-d",
        disable: reservedDates, // Disable reserved dates
      });

      const confirmBookingBtn = document.getElementById("confirm-booking");
      if (confirmBookingBtn) {
        confirmBookingBtn.onclick = () => {
          const checkin = document.getElementById("checkin").value;
          const checkout = document.getElementById("checkout").value;
          const guests = document.getElementById("guests").value;

          if (!checkin || !checkout || !guests) {
            alert("Please fill in all fields");
            return;
          }

          // Construct the booking URL
          const booknrentUrl = `https://www.booknrent.com/checkout/${roomId}?start=${checkin}&end=${checkout}&numberOfGuests=${guests}`;

          // Reset form fields
          document.getElementById("checkin").value = "";
          document.getElementById("checkout").value = "";
          document.getElementById("guests").value = "1";
          // Close the modal
          modal.hide();
          // Redirect to the booking URL
          window.location.href = booknrentUrl;
        };
      }
    });
  });

  // Update room prices initially
  updateRoomPrices(listings);

  // Add event listener for currency selector
  const currencySelector = document.getElementById("currencySelector");
  if (currencySelector) {
    currencySelector.addEventListener("change", (event) => {
      currentCurrency = event.target.value;
      updateRoomPrices(listings);
    });
  }
};

// Wait for DOM to be fully loaded before executing
document.addEventListener("DOMContentLoaded", () => {
  loadRooms(); // Will silently return if room-list doesn't exist
});
