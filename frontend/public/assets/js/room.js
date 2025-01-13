import { showRedAlert } from "./alert.js";
import { idToImageUrlMap, LISTINGS, virtualTourLinks } from "./data.js";

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
      "https://v6.exchangerate-api.com/v6/f1672b88bf550c2ce88410bc/latest/USD"
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
    const response = await fetch("http://localhost:3000/api/listings");
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
const images = [{ id: "323227" }, { id: "288691" }, { id: "288678" }];

// Function to update room prices based on selected currency
function updateRoomPrices() {
  const roomItems = document.querySelectorAll(".room-item");
  roomItems.forEach((roomItem, index) => {
    const roomId = images[index].id; // Get the room ID
    const listing = LISTINGS.find((listing) => listing.id.toString() === roomId); // Find the listing by ID
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
      `http://localhost:3000/api/listings/${listingId}/calendar?startDate=${startDate}&endDate=${endDate}`
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
          <img class="img-fluid" src="${imageUrl}" alt="Room Image ${image.id}" style="width: 100%; height: 250px; object-fit: cover;" />
          <small class="position-absolute start-0 top-100 translate-middle-y text-white rounded py-1 px-3 ms-4" style="background-color: #989549;">
            ${listing ? `Starting from $${listing.price}` : "Price not available"}
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
          
          <p class="text-body mb-3" style="min-height: 48px !important;">${
            roomDescriptions[index]
          }</p>
          <div class="d-flex flex-wrap gap-2 justify-content-between mt-auto">
            <a href="/listings-details?id=${image.id}" 
              class="btn btn-primary rounded-pill px-4 py-2 flex-grow-1"
              style="background-color: #989549; border: none;">
              <i class="fas fa-info-circle me-2"></i>View Details
            </a>
            <button class="btn btn-dark rounded-pill px-4 py-2 flex-grow-1 virtual-tour">
              <i class="fas fa-video me-2"></i>Virtual Tour
            </button>
            <button class="btn btn-success rounded-pill px-4 py-2 flex-grow-1 book-now-btn" data-room-id="${image.id}">
              <i class="fas fa-calendar-check me-2"></i>Book Now
            </button>
          </div>
        </div>
      </div>
    `;
    roomList.appendChild(roomItem);
  });

  // Add a button below all the listings
if (!document.getElementById("view-all-listings-btn-container")) {
  // Create a parent div for the button
  const viewAllListingsContainer = document.createElement("div");
  viewAllListingsContainer.id = "view-all-listings-btn-container";
  viewAllListingsContainer.className = "text-center mt-4"; // Center the button and add spacing

  // Create the button
  const viewAllListingsBtn = document.createElement("button");
  viewAllListingsBtn.id = "view-all-listings-btn";
  viewAllListingsBtn.className = "btn-more-listings px-5 py-3 rounded-pill";
  viewAllListingsBtn.style.backgroundColor = "#989549";
  viewAllListingsBtn.style.border = "none";
  viewAllListingsBtn.style.color = "white";
  viewAllListingsBtn.style.fontWeight = "bold";
  viewAllListingsBtn.textContent = "Visit All Listings";

  // Add a click event listener to redirect to /listings
  viewAllListingsBtn.addEventListener("click", () => {
    window.location.href = "/listings";
  });

  // Append the button to the parent div
  viewAllListingsContainer.appendChild(viewAllListingsBtn);

  // Append the parent div to the room list container
  roomList.appendChild(viewAllListingsContainer);
}


  updateRoomPrices(); // Call to update prices after rooms are loaded
};


document.addEventListener("DOMContentLoaded", () => {
  loadRooms();
});
