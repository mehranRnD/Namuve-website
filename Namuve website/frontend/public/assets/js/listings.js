import { idToImageUrlMap, roomDescriptions } from "./data.js";

let usdToPkrRate = 277.66; // Default rate
let currentCurrency = "USD"; // Default currency

// Add base prices mapping near the top of the file
const BASE_PRICES = {
  Studio: 40,
  "1BR": 48,
  "2BR": 57,
  "2BR Premium": 78,
  "3BR": 65,
};

// Replace the images array with this structured data
const LISTINGS_DATA = {
  Studio: [288675, 288682, 288690, 323229, 323261, 336255],
  "1BR": [
    307143, 306032, 288691, 305069, 288681, 288726, 288679, 288723, 288678,
    323258,
  ],
  "2BR": [
    288677, 288684, 288687, 288977, 288689, 288685, 288683, 306543, 288724,
  ],
  "2BR Premium": [305055, 309909, 323227, 288688],
  "3BR": [288686, 305327, 288676],
};

// Helper function to get all listing IDs
const getAllListingIds = () => Object.values(LISTINGS_DATA).flat();

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

// Function to get image URL by ID
function getImageUrlById(id) {
  return idToImageUrlMap[id] || "https://via.placeholder.com/300";
}

// Function to fetch listings data from the server
const getListingData = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/listings");
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

// Helper function to get base price by listing ID
function getBasePriceByListingId(listingId) {
  listingId = Number(listingId);
  for (const [category, ids] of Object.entries(LISTINGS_DATA)) {
    if (ids.includes(listingId)) {
      return BASE_PRICES[category];
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

// Function to load listings
async function loadListings() {
  const gallery = document.getElementById("gallery");
  const loading = document.getElementById("loading");
  const errorElement = document.getElementById("error");

  try {
    loading.style.display = "block";
    await fetchConversionRate();
    const listings = await getListingData();

    // Replace the hardcoded images array with getAllListingIds()
    const images = getAllListingIds().map((id) => ({ id: id.toString() }));

    // Add filter buttons with active state handling
    const filterContainer = document.createElement("div");
    filterContainer.classList.add("container", "mb-5", "mt-4");
    filterContainer.innerHTML = `
        <div class="m-0 text-center">
            <div class="btn-group py-3 gap-4 filter-buttons" role="group" aria-label="Room filter">
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
    `;
    gallery.parentNode.insertBefore(filterContainer, gallery);

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

    loading.style.display = "none";

    images.forEach((image, index) => {
      const listing = listings.find(
        (l) => l.id.toString() === image.id.toString()
      );
      const container = document.createElement("div");
      container.classList.add("col-lg-4", "col-md-6", "wow", "fadeInUp");
      container.setAttribute("data-wow-delay", `${0.1 * (index + 1)}s`);

      container.innerHTML = `
  <div class="room-item shadow rounded overflow-hidden" data-listing-id="${
    image.id
  }" style="height: 600px !important;">
    <div class="position-relative" style="height: 300px !important;">
      <img class="img-fluid" src="${getImageUrlById(image.id)}" 
        alt="Listing Image ${image.id}" 
        style="width: 100% !important; 
        height: 300px !important; 
        object-fit: cover !important;" />
      <small class="position-absolute start-0 top-100 translate-middle-y text-white rounded py-1 px-3 ms-4" style="background-color: #989549;">
        Starting from ${
          currentCurrency === "USD"
            ? `$${getBasePriceByListingId(image.id)}`
            : `₨${(getBasePriceByListingId(image.id) * usdToPkrRate)
                .toFixed(2)
                .toLocaleString()}`
        }
      </small>
    </div>
    <div class="p-4 mt-2" style="height: 300px !important; display: flex !important; flex-direction: column !important;">
      <div class="d-flex justify-content-between mb-3" style="align-items: center !important;">
        <h5 class="mb-0" style="max-width: 70% !important; font-size: 1.1rem !important;">${
          listing ? listing.name : "Loading..."
        }</h5>
        <div class="ps-2 d-flex" style="color: #989549;">
          <small class="fa fa-star" style="margin: 0 1px !important;"></small>
          <small class="fa fa-star" style="margin: 0 1px !important;"></small>
          <small class="fa fa-star" style="margin: 0 1px !important;"></small>
          <small class="fa fa-star" style="margin: 0 1px !important;"></small>
          <small class="fa fa-star" style="margin: 0 1px !important;"></small>
        </div>
      </div>
      <div class="d-flex mb-3">
        <small class="border-end me-3 pe-3"><i class="fa fa-bed me-2" style="color: #989549;"></i>3 Bed</small>
        <small class="border-end me-3 pe-3"><i class="fa fa-bath me-2" style="color: #989549;"></i>2 Bath</small>
        <small><i class="fa fa-wifi me-2" style="color: #989549;"></i>Wifi</small>
      </div>
      <p class="text-body mb-3" style="flex-grow: 1 !important; overflow: hidden !important;">${
        roomDescriptions[images.findIndex((img) => img.id === image.id)]
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

      gallery.appendChild(container);

      // Add Book Now button functionality
      const bookNowBtn = container.querySelector(".book-now-btn");
      bookNowBtn.addEventListener("click", () => {
        openBookingModal(image.id);
      });
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
    errorElement.textContent = `Failed to load listings: ${error.message}`;
    errorElement.style.display = "block";
    loading.style.display = "none";
  }
}

// Update the filterListings function to handle animations
function filterListings(category) {
  const allListings = document.querySelectorAll(".col-lg-4");

  // First, fade out all listings
  allListings.forEach((container) => {
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
        console.log(`Check-in date ${dateStr}:`);
        console.log(`Status: ${result.status}`);
        console.log(`Price: $${result.price}`);

        if (result.status === "reserved") {
          checkinInput.value = ""; // Clear the input if date is reserved
          alert("This date is not available for booking.");
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
        console.log(`Check-out date ${dateStr}:`);
        console.log(`Status: ${result.status}`);
        console.log(`Price: $${result.price}`);

        if (result.status === "reserved") {
          checkoutInput.value = ""; // Clear the input if date is reserved
          alert("This date is not available for booking.");
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
        showAlert(
          "Please fill in all fields before proceeding with the booking."
        );
        return;
      }

      // Check availability for both dates before proceeding
      const checkinData = await fetchCalendarData(listingId, checkin, checkin);
      const checkoutData = await fetchCalendarData(
        listingId,
        checkout,
        checkout
      );

      const checkinStatus = checkAvailabilityStatus(checkinData, checkin);
      const checkoutStatus = checkAvailabilityStatus(checkoutData, checkout);

      const booknrentUrl = `https://www.booknrent.com/checkout/${listingId}?start=${checkin}&end=${checkout}&numberOfGuests=${guests}`;

      // Reset form and close modal
      checkinInput.value = "";
      checkoutInput.value = "";
      guestsInput.value = "1";
      modal.hide();

      // Only redirect if dates are available
      window.location.href = booknrentUrl;
    };
  }
}

function showAlert(message, type = "danger") {
  // Remove any existing alerts
  const existingAlert = document.querySelector(".booking-alert");
  if (existingAlert) {
    existingAlert.remove();
  }

  // Create alert element
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type} alert-dismissible fade show booking-alert`;
  alertDiv.role = "alert";
  alertDiv.innerHTML = `
    <div class="d-flex align-items-center">
      <i class="fas ${
        type === "danger" ? "fa-exclamation-circle" : "fa-info-circle"
      } me-2"></i>
      <strong>${message}</strong>
    </div>
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  // Add custom styles
  alertDiv.style.position = "fixed";
  alertDiv.style.top = "20px";
  alertDiv.style.left = "50%";
  alertDiv.style.transform = "translateX(-50%)";
  alertDiv.style.zIndex = "9999";
  alertDiv.style.minWidth = "280px";
  alertDiv.style.maxWidth = "90%";
  alertDiv.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
  alertDiv.style.borderRadius = "8px";

  // Add alert to the DOM
  document.body.appendChild(alertDiv);

  // Auto dismiss after 5 seconds
  setTimeout(() => {
    alertDiv.classList.remove("show");
    setTimeout(() => alertDiv.remove(), 150);
  }, 5000);
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", loadListings);

// Make filterListings available globally
window.filterListings = filterListings;
