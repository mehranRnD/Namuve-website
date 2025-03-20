import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import Stripe from "stripe";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const router = express.Router();
// Derive __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Stripe with API key from environment variables
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

if (!stripe) {
  console.error(
    "Warning: Stripe API key not found in environment variables. Stripe payments will not work."
  );
}

// Set the base directory for static files
const publicDir = path.join(__dirname, "../../frontend/public");

// Route for Home Page
router.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// Routes for other pages
router.get("/about", (req, res) => {
  res.sendFile(path.join(publicDir, "about.html"));
});

router.get("/blogs", (req, res) => {
  res.sendFile(path.join(publicDir, "blogs.html"));
});

router.get("/contact", (req, res) => {
  res.sendFile(path.join(publicDir, "contact.html"));
});

router.get("/empire-holdings", (req, res) => {
  res.sendFile(path.join(publicDir, "empire-holdings.html"));
});

router.get("/estimate-revenue", (req, res) => {
  res.sendFile(path.join(publicDir, "estimate-revenue.html"));
});

router.get("/faqs", (req, res) => {
  res.sendFile(path.join(publicDir, "faqs.html"));
});

router.get("/listings-details", (req, res) => {
  res.sendFile(path.join(publicDir, "listings-details.html"));
});

router.get("/listings", (req, res) => {
  res.sendFile(path.join(publicDir, "listings.html"));
});

router.get("/reviews-and-testimonials", (req, res) => {
  res.sendFile(path.join(publicDir, "reviews-and-testimonials.html"));
});

router.get("/services", (req, res) => {
  res.sendFile(path.join(publicDir, "services.html"));
});

// router.get("/services-details", (req, res) => {
//   res.sendFile(path.join(publicDir, "#"));
// });

// router.get("/spaces", (req, res) => {
//   res.sendFile(path.join(publicDir, "spaces.html"));
// });

// router.get("/team", (req, res) => {
//   res.sendFile(path.join(publicDir, "team.html"));
// });

// router.get("/techsol", (req, res) => {
//   res.sendFile(path.join(publicDir, "techsol.html"));
// });

// router.get("/uniform", (req, res) => {
//   res.sendFile(path.join(publicDir, "uniform.html"));
// });

router.get("/terms-and-conditions", (req, res) => {
  res.sendFile(path.join(publicDir, "terms-and-conditions.html"));
});

router.get("/team", (req, res) => {
  res.sendFile(path.join(publicDir, "team.html"));
});

router.get("/booking-engine", (req, res) => {
  res.sendFile(path.join(publicDir, "booking-engine.html"));
});

router.get("/gallery", (req, res) => {
  res.sendFile(path.join(publicDir, "gallery.html"));
});

router.get("/blog-one", (req, res) => {
  res.sendFile(path.join(publicDir, "blog-one.html"));
});

router.get("/blog-two", (req, res) => {
  res.sendFile(path.join(publicDir, "blog-two.html"));
});

router.get("/blog-three", (req, res) => {
  res.sendFile(path.join(publicDir, "blog-three.html"));
});

router.get("/complete", (req, res) => {
  res.sendFile(path.join(publicDir, "complete.html"));
});

router.get("/cancel", (req, res) => {
  res.sendFile(path.join(publicDir, "cancel.html"));
});

// Add API routes
router.get("/api/listings", async (req, res) => {
  try {
    const apiBaseUrl = "https://api.hostaway.com/v1/listings";
    const authToken =
      "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI4MDA2NiIsImp0aSI6IjZkODk5MWMyZTI4MGQ0NDg3NmNhNDUyZmYxMWU5ZTcxNDFhNDJhMGIzMmViNzA3ZTQyMDFhYjY4OWQ3NDc2Yjk0NDZlZjA2NTZhY2QzMDkxIiwiaWF0IjoxNzIzOTk0NTQxLjcxOTMyNiwibmJmIjoxNzIzOTk0NTQxLjcxOTMyNywiZXhwIjoyMDM5NTI3MzQxLjcxOTMzMSwic3ViIjoiIiwic2NvcGVzIjpbImdlbmVyYWwiXSwic2VjcmV0SWQiOjM5NDM0fQ.aCE9HtgvxqTLuftdSe3I75s8DocQoBz949WG-NTot-qIzWRmruShmqkZNs8rtA_CyNNocOr_fahkXZBK3hHxQ4G6QxX9z8acQ_mJ68Wz5YKT39A6gAmu--5Ux_W6xdMpzb8J6f4SrdDJneC3RIWweT3KvZ832VIm1AmQDgHgJ7k";

    const response = await axios.get(apiBaseUrl, {
      headers: {
        Authorization: authToken,
        "Content-Type": "application/json",
      },
    });

    const data =
      typeof response.data === "string"
        ? JSON.parse(response.data)
        : response.data;

    // Extract listings
    const listings =
      data?.status === "success" && Array.isArray(data.result)
        ? data.result.map((listing) => ({
            id: listing.id || Date.now().toString(),
            name: listing.name || "Unnamed Listing",
            description: listing.description || "No description available",
            address: listing.address || "Address not provided",
            price: listing.price || 0,
            houseRules: listing.houseRules || "No specific house rules",
            imageUrl:
              listing.imageUrl || "https://dummyimage.com/300x300/000/fff",
          }))
        : [];

    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/listings/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const apiBaseUrl = "https://api.hostaway.com/v1/listings";
    const authToken =
      "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI4MDA2NiIsImp0aSI6IjZkODk5MWMyZTI4MGQ0NDg3NmNhNDUyZmYxMWU5ZTcxNDFhNDJhMGIzMmViNzA3ZTQyMDFhYjY4OWQ3NDc2Yjk0NDZlZjA2NTZhY2QzMDkxIiwiaWF0IjoxNzIzOTk0NTQxLjcxOTMyNiwibmJmIjoxNzIzOTk0NTQxLjcxOTMyNywiZXhwIjoyMDM5NTI3MzQxLjcxOTMzMSwic3ViIjoiIiwic2NvcGVzIjpbImdlbmVyYWwiXSwic2VjcmV0SWQiOjM5NDM0fQ.aCE9HtgvxqTLuftdSe3I75s8DocQoBz949WG-NTot-qIzWRmruShmqkZNs8rtA_CyNNocOr_fahkXZBK3hHxQ4G6QxX9z8acQ_mJ68Wz5YKT39A6gAmu--5Ux_W6xdMpzb8J6f4SrdDJneC3RIWweT3KvZ832VIm1AmQDgHgJ7k";

    const response = await axios.get(apiBaseUrl, {
      headers: {
        Authorization: authToken,
        "Content-Type": "application/json",
      },
    });

    const data =
      typeof response.data === "string"
        ? JSON.parse(response.data)
        : response.data;

    // Extract listings
    const listings =
      data?.status === "success" && Array.isArray(data.result)
        ? data.result.map((listing) => ({
            id: listing.id || Date.now().toString(),
            name: listing.name || "Unnamed Listing",
            description: listing.description || "No description available",
            address: listing.address || "Address not provided",
            price: listing.price || 0,
            houseRules: listing.houseRules || "No specific house rules",
            imageUrl:
              listing.imageUrl || "https://dummyimage.com/300x300/000/fff",
          }))
        : [];

    const listing = listings.find((l) => l.id.toString() === id);
    if (listing) {
      res.json(listing);
    } else {
      res.status(404).json({ error: "Listing not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/listings/:id/calendar", async (req, res) => {
  const { id } = req.params;
  try {
    // Get token first (same way as listings endpoint)
    const tokenResponse = await axios.post(
      "https://api.hostaway.com/v1/accessTokens",
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: "80066",
        client_secret:
          "d68ae34610624f57d27d57e14e1969a44ab1cf016037f98c5c338113bed5b570",
        scope: "general",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const authToken = `Bearer ${tokenResponse.data.access_token}`;

    // Now fetch calendars for the specific listing
    const today = new Date().toISOString().split("T")[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const endDate = nextMonth.toISOString().split("T")[0];

    const calendarResponse = await axios.get(
      `https://api.hostaway.com/v1/listings/${id}/calendar`,
      {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
        params: {
          startDate: today,
          endDate: endDate,
        },
      }
    );

    console.log(`Calendar data fetched for listing ${id}`);
    res.json(calendarResponse.data);
  } catch (error) {
    console.error(`Error fetching calendar for listing ${id}:`, error.message);
    res.status(500).json({
      error: "Failed to fetch calendar data",
      details: error.response?.data || error.message,
    });
  }
});

// Function to fetch the USD to PKR exchange rate
async function fetchExchangeRate() {
  try {
    const response = await axios.get(
      "https://v6.exchangerate-api.com/v6/cbb36a5aeba2aa9dbaa251e0/latest/USD"
    );
    const rate = response.data.conversion_rates.PKR;
    return rate;
  } catch (error) {
    console.error("Failed to fetch exchange rate:", error);
    throw new Error("Could not retrieve exchange rate");
  }
}

// Stripe Checkout Route
router.post("/api/create-checkout-session", async (req, res) => {
  if (!stripe) {
    return res.status(500).json({
      error: "Stripe is not configured. Please check server configuration.",
    });
  }

  try {
    const {
      listingId,
      listingName,
      price,
      checkIn,
      checkOut,
      guests,
      imageUrl,
      description,
    } = req.body;

    if (!price || isNaN(parseFloat(price))) {
      return res.status(400).json({ error: "Invalid price provided" });
    }

    // Fetch conversion rate from USD to PKR
    const exchangeRate = await fetchExchangeRate();

    // Calculate number of nights
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const numberOfNights = Math.ceil(
      (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
    );

    // Convert prices to PKR
    const basePricePerNight = parseFloat(price) * exchangeRate;
    const basePrice = basePricePerNight * numberOfNights;
    const securityDeposit = 18 * exchangeRate;
    const salesTaxPerNight = basePricePerNight * 0.16;
    const salesTax = salesTaxPerNight * numberOfNights;
    const totalAmount = basePrice + securityDeposit + salesTax;

    // Convert total amount to USD
    const totalAmountUSD = totalAmount / exchangeRate;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "pkr",
            product_data: {
              name: "Reservation Details",
              description: `Check-in: ${checkIn} \n Check-out: ${checkOut}\nGuests: ${guests}`,
              
            },
            unit_amount: Math.round(basePrice * 100),
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: "pkr",
            product_data: {
              name: "Security Deposit",
              description: "Refundable security deposit",
            },
            unit_amount: Math.round(securityDeposit * 100),
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: "pkr",
            product_data: {
              name: "Sales Tax",
              description: `Sales tax for ${numberOfNights} nights`,
            },
            unit_amount: Math.round(salesTax * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.BASE_URL}/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/cancel?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        listingId,
        checkIn,
        checkOut,
        guests,
        basePrice: basePrice.toString(),
        securityDeposit: securityDeposit.toString(),
        salesTax: salesTax.toString(),
        totalAmount: totalAmount.toString(),
      },
      custom_text: {
        submit: {
          message: `Note: Thank you for your reservation!`,
        },
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe session creation error:", error);
    res.status(500).json({
      error: "Failed to create checkout session",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Catch-all route for 404 errors
router.use((req, res) => {
  res.status(404).sendFile(path.join(publicDir, "404.html"));
});

export default router;
