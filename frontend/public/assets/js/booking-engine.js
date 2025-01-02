import { idToImageUrlMap } from "./data.js"; // Import the image URL map

const BASE_URL = "http://localhost:3000/api/listings"; // Base URL for the API
const LISTING_IDS = [
  288675, 288682, 288690, 323229, 323261, 336255, 307143, 306032, 288691,
  305069, 288681, 288726, 288679, 288723, 288678, 323258, 288677, 288684,
  288687, 288977, 288689, 288685, 288683, 306543, 288724, 305055, 309909,
  323227, 288688, 288686, 305327, 288676,
];

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

// Function to check available listings based on user-selected dates
async function checkAvailableListings(checkinDate, checkoutDate) {
  const availableListings = [];

  // Create an array of promises for fetching calendar data
  const fetchPromises = LISTING_IDS.map(async (listingId) => {
    const calendarData = await fetchCalendarData(
      listingId,
      checkinDate,
      checkoutDate
    );

    // Check if the calendar data is valid
    if (calendarData && calendarData.result) {
      // Check if any date in the range is available
      const isAvailable = calendarData.result.some((entry) => {
        return (
          entry.status === "available" &&
          new Date(entry.date) >= new Date(checkinDate) &&
          new Date(entry.date) < new Date(checkoutDate)
        );
      });

      // If any date is available, add the listing ID to the available listings
      if (isAvailable) {
        availableListings.push(listingId);
        console.log(`This listing is available and ID is ${listingId}`);
      }
    }
  });

  // Wait for all fetch promises to resolve
  await Promise.all(fetchPromises);

  console.log("Available Listings IDs:", availableListings);

  if (availableListings.length === 0) {
    alert("No available listings for the selected dates.");
  }

  return availableListings; // Return the available listings
}

// Event listener for the booking form submission
document.addEventListener("DOMContentLoaded", () => {
  const bookingForm = document.getElementById("booking-form");
  if (bookingForm) {
    bookingForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const location = document.getElementById("location").value;
      const checkinDate = document.getElementById("checkin").value;
      const checkoutDate = document.getElementById("checkout").value;
      const guests = document.getElementById("guests").value;

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

        // Redirect to the same page with query parameters
        window.location.href = `/booking-engine?${queryParams.toString()}`;
      } else {
        alert("No available listings for the selected dates.");
      }
    });
  } else {
    console.error("Booking form not found.");
  }

  // After redirection, display images of available listings
  const urlParams = new URLSearchParams(window.location.search);
  const availableListings = urlParams.get("availableListings");

  if (availableListings) {
    const listingIdsArray = availableListings.split(",").map(Number); // Convert to an array of numbers
    const listingsContainer = document.getElementById("available-listings");

    if (listingsContainer) {
      listingsContainer.innerHTML = `
        <div class="row">
          <div class="col-lg-8">
            <div class="items">
              <div class="row">
                ${listingIdsArray
                  .map((id) => {
                    const imageUrl = idToImageUrlMap[id];
                    return imageUrl ? `
                      <div class="col-lg-12 mb-4">
                        <div class="item" style="padding: 15px;">
                          <div class="row">
                            <div class="col-lg-4 col-sm-5">
                              <div class="image">
                                <img src="${imageUrl}" alt="Listing ID: ${id}" />
                              </div>
                            </div>
                            <div class="col-lg-8 col-sm-7">
                              <div class="right-content">
                                <h4>Listing ID: ${id}</h4>
                                <span>Available</span>
                                
                                <p>
                                  This listing is available for your selected dates.
                                </p>
                                <ul class="info">
                                  <li><i class="fa fa-user"></i> Guests: 4</li>
                                  <li><i class="fa fa-globe"></i> Location: TBD</li>
                                  <li><i class="fa fa-home"></i> Price: TBD</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ` : '';
                  })
                  .join("")}
              </div>
            </div>
          </div>
          <div class="col-lg-4">
            <div class="side-bar-map">
              <div class="row">
                <div class="col-lg-12">
                  <div id="map">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12469.776493332698!2d-80.14036379941481!3d25.907788681148624!2m3!1f357.26927939317244!2f20.870722720054623!3f0!3m2!1i1024!2i768!4f35!3m3!1m2!1s0x88d9add4b4ac788f%3A0xe77469d09480fcdb!2sSunny%20Isles%20Beach!5e1!3m2!1sen!2sth!4v1642869952544!5m2!1sen!2sth"
                      width="100%"
                      height="550px"
                      frameborder="0"
                      style="border: 0; border-radius: 23px"
                      allowfullscreen=""
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
