import { idToImageUrlMap, BASE_PRICES, LISTINGS_DATA, ROOM_DETAILS } from "./data.js";
import { fetchHostawayReviews, mapRatingsToListings, ratingToStars } from "./listings.js";
let currentListing = null;
let usdToPkrRate = 277.66; // Default rate

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

// Function to fetch USD to PKR conversion rate
async function fetchExchangeRate() {
  try {
    const response = await fetch(
      "https://v6.exchangerate-api.com/v6/cbb36a5aeba2aa9dbaa251e0/latest/USD"
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

// Function to get the listing ID from URL parameters
function getListingIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

// Function to display rating
async function displayListingRating() {
  const listingId = getListingIdFromUrl();
  if (!listingId) {
    console.error('No listing ID found in URL');
    return;
  }

  try {
    // Fetch all reviews
    const ratings = await fetchHostawayReviews();
    const ratingMap = mapRatingsToListings(ratings);

    // Get rating for this specific listing
    const rating = ratingMap[listingId] || 0;
    const starsHTML = ratingToStars(rating);

    // Find the rating container and update it
    const ratingContainer = document.getElementById('listing-rating');
    if (ratingContainer) {
      ratingContainer.innerHTML = starsHTML;
    }
  } catch (error) {
    console.error('Error fetching and displaying rating:', error);
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  displayListingRating();
});

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
    // Fetch and display the rating
    const ratings = await fetchHostawayReviews();
    const ratingMap = mapRatingsToListings(ratings);
    const rating = ratingMap[listingId] || 0;
    const starsHTML = ratingToStars(rating);


    listingDetailsContainer.innerHTML = `
      <div class="listing-content">
    <img src="${idToImageUrlMap[listingId] || "https://via.placeholder.com/250"}" 
         class="listing-image" alt="Listing Image" />
    <div class="name-rating-container">
      <h2 class="listing-name">${listing.name || "N/A"}</h2>
      <div class="star-rating">${starsHTML}</div>
    </div>
    <div class="icons">
          <span>
            <i class="fa-solid fa-building"></i> 
            ${listingInfo.roomType} 
            <i class="fa-solid fa-arrow-right ms-1" style="font-size: 0.8em; opacity: 0.7;"></i>
          </span>
          <span>
            <i class="fa-solid fa-bed"></i> 
            ${listingInfo.beds} Bed(s) 
          </span>
          <span>
            <i class="fa-solid fa-users"></i> 
            ${listingInfo.guests} Guests 
          </span>
        </div>
        <p><strong>Description:</strong> ${listing.description || "No description available"}</p>
        <p><strong>House Rules:</strong> ${listing.houseRules || "No specific house rules"}</p>
        <p><strong>Address:</strong> ${listing.address || "Address not provided"}</p>
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
