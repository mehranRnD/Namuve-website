import { idToImageUrlMap } from "./data.js";

let currentListing = null;
let usdToPkrRate = 277.66; // Default rate

// Add the same pricing and listings data structure
const BASE_PRICES = {
  Studio: 40,
  "1BR": 48,
  "2BR": 57,
  "2BR Premium": 78,
  "3BR": 65,
};

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

// Add guest capacity mapping
const ROOM_DETAILS = {
    "Studio": {
        guests: "1-2",
        beds: "1"
    },
    "1BR": {
        guests: "1-3",
        beds: "1"
    },
    "2BR": {
        guests: "1-4",
        beds: "2"
    },
    "2BR Premium": {
        guests: "1-4",
        beds: "2"
    },
    "3BR": {
        guests: "1-6",
        beds: "3"
    }
};

// Helper function to get room type and base price by listing ID
function getListingInfo(listingId) {
  listingId = Number(listingId);
  for (const [category, ids] of Object.entries(LISTINGS_DATA)) {
    if (ids.includes(listingId)) {
      return {
        roomType: category,
        basePrice: BASE_PRICES[category],
        guests: ROOM_DETAILS[category].guests,
        beds: ROOM_DETAILS[category].beds
      };
    }
  }
  return { 
    roomType: 'Studio', 
    basePrice: 40,
    guests: "1-2",
    beds: "1"
  }; // Default fallback
}

// Function to fetch USD to PKR conversion rate
async function fetchExchangeRate() {
  try {
    const response = await fetch(
      "https://v6.exchangerate-api.com/v6/dd469c4556431d9b5576d5f2/latest/USD"
    );
    const data = await response.json();
    usdToPkrRate = data.conversion_rates.PKR;
    return usdToPkrRate;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return 277.66; // Fallback rate
  }
}

// Function to update price display
function updatePrice(currency) {
  const priceElement = document.querySelector(".price-display");
  if (!currentListing) return;

  const listingInfo = getListingInfo(currentListing.id);
  const basePrice = listingInfo.basePrice;

  if (currency === "PKR") {
    const pricePKR = (basePrice * usdToPkrRate).toFixed(2);
    priceElement.textContent = `₨${pricePKR.toLocaleString()}`;
  } else {
    priceElement.textContent = `$${basePrice}`;
  }
}

async function fetchListingDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const listingId = urlParams.get("id");

  const loadingContainer = document.getElementById("loading-container");
  const errorContainer = document.getElementById("error-container");
  const listingDetailsContainer = document.getElementById("listingDetails");
  const imageGalleryContainer = document.getElementById(
    "image-gallery-container"
  );

  if (!listingId) {
    showError("No listing ID provided.");
    return;
  }

  try {
    loadingContainer.style.display = "block";
    errorContainer.style.display = "none";
    listingDetailsContainer.style.display = "none";
    imageGalleryContainer.style.display = "none";

    // Fetch exchange rate first
    await fetchExchangeRate();

    const response = await fetch(`/api/listings/${listingId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch listing details (${response.status})`);
    }

    const listing = await response.json();
    currentListing = listing;

    const listingInfo = getListingInfo(listingId);
    const initialPrice = `$${listingInfo.basePrice}`;

    listingDetailsContainer.innerHTML = `
            <div class="listing-content">
                <img src="${
                  idToImageUrlMap[listingId] ||
                  "https://via.placeholder.com/250"
                }" 
                     class="listing-image" alt="Listing Image" />
                <h2>${listing.name || "N/A"}</h2>
                <div class="icons">
                    <span>
                        <i class="fa-solid fa-building"></i> 
                        ${listingInfo.roomType} 
                        <i class="fa-solid fa-arrow-right ms-1" style="font-size: 0.8em; opacity: 0.7;"></i>
                    </span>
                    <span>
                        <i class="fa-solid fa-bed"></i> 
                        ${listingInfo.beds} Beds 
                    </span>
                    <span>
                        <i class="fa-solid fa-users"></i> 
                        ${listingInfo.guests} Guests 
                    </span>
                </div>
                <p><strong>Description:</strong> ${
                  listing.description || "No description available"
                }</p>
                <p><strong>House Rules:</strong> ${
                  listing.houseRules || "No specific house rules"
                }</p>
                <p><strong>Address:</strong> ${
                  listing.address || "Address not provided"
                }</p>
                <p><strong>Price:</strong> Starting from <span class="price-display">${initialPrice}</span></p>
            </div>
        `;

    // Show the containers
    listingDetailsContainer.style.display = "block";
    loadingContainer.style.display = "none";

    // Handle currency selector
    const currencySelector = document.getElementById("currencySelector");
    if (currencySelector) {
      updatePrice(currencySelector.value);
      currencySelector.addEventListener("change", (e) => {
        updatePrice(e.target.value);
      });
    }
  } catch (error) {
    console.error("Error fetching listing details:", error);
    showError(`Failed to load listing details: ${error.message}`);
  }
}

function showError(message) {
  const loadingContainer = document.getElementById("loading-container");
  const errorContainer = document.getElementById("error-container");

  loadingContainer.style.display = "none";
  errorContainer.style.display = "block";
  errorContainer.textContent = message;
}

// Initialize
document.addEventListener("DOMContentLoaded", fetchListingDetails);
