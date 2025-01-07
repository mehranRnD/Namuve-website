import { idToImageUrlMap, LISTINGS } from "./data.js"; // Import the image URL map

const BASE_URL = "http://localhost:3000/api/listings"; // Base URL for the API

// Extract the listing IDs from the array
const LISTING_IDS = LISTINGS.map((listing) => listing.id);

// Function to get the price for a specific listing ID
const getPriceById = (listingId) => {
  const listing = LISTINGS.find((l) => l.id === listingId);
  return listing ? listing.price : "N/A";
};

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
        console.log(`This listing is available and ID is ${listingId}`);
      }
    }
  });

  await Promise.all(fetchPromises);

  console.log("Available Listings IDs:", availableListings);

  if (availableListings.length === 0) {
    alert("No available listings for the selected dates.");
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

      if (!checkinDate || !checkoutDate || !guests) {
        alert("Please fill in all the required fields.");
        return;
      }

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
        alert("No available listings for the selected dates.");
      }
    });
  }

  const urlParams = new URLSearchParams(window.location.search);
  const availableListings = urlParams.get("availableListings");

  if (availableListings) {
    const listingIdsArray = availableListings.split(",").map(Number);
    const listingsContainer = document.getElementById("available-listings");

    if (listingsContainer) {
      listingsContainer.innerHTML = "<p>Loading available listings...</p>";

      const listingDetailsPromises = listingIdsArray.map(fetchListingDetails);
      const listingDetails = await Promise.all(listingDetailsPromises);

      const checkinDate = new URLSearchParams(window.location.search).get("checkinDate");
      const checkoutDate = new URLSearchParams(window.location.search).get("checkoutDate");
      const guests = new URLSearchParams(window.location.search).get("guests");

      listingsContainer.innerHTML = `
        <div class="row">
          <div class="col-lg-8">
            <div class="items">
              <div class="row">
                ${listingDetails
                  .map((listing) => {
                    if (listing) {
                      const imageUrl = idToImageUrlMap[listing.id];
                      const booknrentUrl = `https://www.booknrent.com/checkout/${listing.id}?start=${checkinDate}&end=${checkoutDate}&numberOfGuests=${guests}`;
                      return `
                        <div class="col-lg-12 mb-4">
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
                                  <span>Available</span>
                                  
                                  <p>
                                    This listing is available for your selected dates.
                                  </p>
                                  <ul class="info">
                                    <li><i class="fa fa-user"></i> Guests: ${listing.guests || "N/A"}</li>
                                    <li><i class="fa fa-globe"></i> Location: ${listing.location || "TBD"}</li>
                                    <li><i class="fa fa-home"></i> Price: Starting from $${listing.price || "TBD"}</li>
                                  </ul>
                                  <a href="${booknrentUrl}" class="btn btn-dark">Book Now</a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      `;
                    }
                    return "";
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
                      width="600"
                      height="450"
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
      `;
    } else {
      console.error("Available listings container not found.");
    }
  }
});
