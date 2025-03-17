import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

const router = express.Router();
// Derive __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
          imageUrl: listing.imageUrl || "https://dummyimage.com/300x300/000/fff",
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
    const authToken ="Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI4MDA2NiIsImp0aSI6IjZkODk5MWMyZTI4MGQ0NDg3NmNhNDUyZmYxMWU5ZTcxNDFhNDJhMGIzMmViNzA3ZTQyMDFhYjY4OWQ3NDc2Yjk0NDZlZjA2NTZhY2QzMDkxIiwiaWF0IjoxNzIzOTk0NTQxLjcxOTMyNiwibmJmIjoxNzIzOTk0NTQxLjcxOTMyNywiZXhwIjoyMDM5NTI3MzQxLjcxOTMzMSwic3ViIjoiIiwic2NvcGVzIjpbImdlbmVyYWwiXSwic2VjcmV0SWQiOjM5NDM0fQ.aCE9HtgvxqTLuftdSe3I75s8DocQoBz949WG-NTot-qIzWRmruShmqkZNs8rtA_CyNNocOr_fahkXZBK3hHxQ4G6QxX9z8acQ_mJ68Wz5YKT39A6gAmu--5Ux_W6xdMpzb8J6f4SrdDJneC3RIWweT3KvZ832VIm1AmQDgHgJ7k";

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
          imageUrl: listing.imageUrl || "https://dummyimage.com/300x300/000/fff",
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

// Add this calendar endpoint
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

// Catch-all route for 404 errors
router.use((req, res) => {
  res.status(404).sendFile(path.join(publicDir, "404.html"));
});

export default router;
