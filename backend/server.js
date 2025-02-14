import express from "express";
import cors from "cors";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import routes from "./routes/routes.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class HostawayListingManager {
  constructor() {
    this.app = express();
    this.apiBaseUrl = "https://api.hostaway.com/v1/listings";
    this.port = 3000;
    this.listings = [];

    // Initialize token
    this.authToken = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI4MDA2NiIsImp0aSI6ImE0OTkzMDcyMzdiNmQyODA2M2NlYzYwZjUzM2RmYTM1NTU4ZjU0Yzc4OTJhMTk5MmFkZGNhYjZlZWE5NTE1MzFjMDYwM2UzMGI5ZjczZDRhIiwiaWF0IjoxNzM5MjcwMjM2LjA0NzE4LCJuYmYiOjE3MzkyNzAyMzYuMDQ3MTgyLCJleHAiOjIwNTQ4MDMwMzYuMDQ3MTg2LCJzdWIiOiIiLCJzY29wZXMiOlsiZ2VuZXJhbCJdLCJzZWNyZXRJZCI6NTI0OTJ9.n_QTZxeFcJn121EGofg290ReOoNE7vMJAE4-lnXhNbLCZw0mIJu1KQWE5pM0xPUcUHeJ-7XTQfS0U5yIkabGi7vGGex0yx9A0h03fn7ZBAtCzPLq_Xmj8ZOdHzahpRqxRsNRRNOlnbttTSrpSo4NJCdK6yhMTKrKkTTVh60IJIc"

    // Middleware
    this.app.use(cors());
    this.app.use(express.json());

    // Serve static files
    this.app.use(express.static(path.join(__dirname, "../frontend/public")));
    this.app.use("/", routes);
    this.startRoutes();
  }

  startRoutes() {
    this.app.get("/test-token", (req, res) => {
      res.json({
        message: "Check console for token details",
        token: this.authToken,
      });
    });
    this.app.get("/api/listings", async (req, res) => {
      try {
        if (!this.authToken) {
          await this.getAccessToken();
        }

        const response = await axios.get(this.apiBaseUrl, {
          headers: {
            Authorization: this.authToken,
            "Content-Type": "application/json",
          },
        });

        let listings = typeof response.data === "string" ? JSON.parse(response.data) : response.data;

        // Check if listings data exists and format it
        listings = listings.map(listing => {
          return {
            id: listing.id,
            name: listing.name,
            imageUrl: listing.images && listing.images.length > 0 ? listing.images[0].url : null, // Extract first image URL if available
            caption: listing.caption || listing.name,  // Use caption or fallback to name
            vrboCaption: listing.vrboCaption || null,
            airbnbCaption: listing.airbnbCaption || null,
            sortOrder: listing.sortOrder || 0
          };
        });

        res.json(listings);
      } catch (error) {
        console.error("Listings Fetch Error:", error.message);
        res.status(500).json({ error: "Failed to fetch listings" });
      }
    });

    this.app.get("/api/listings/:id", async (req, res) => {
      try {
        if (!this.authToken) {
          await this.getAccessToken();
        }

        const listingId = req.params.id;
        const response = await axios.get(`${this.apiBaseUrl}/${listingId}`, {
          headers: {
            Authorization: this.authToken,
            "Content-Type": "application/json",
          },
        });

        const listing = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
        res.json(listing);
      } catch (error) {
        console.error("Listing Detail Fetch Error:", error.message);
        res.status(500).json({ error: "Failed to fetch listing details" });
      }
    });

    this.app.get("/api/listings/:id/calendar", async (req, res) => {
      try {
        if (!this.authToken) {
          await this.getAccessToken();
        }

        const listingId = req.params.id;
        const { startDate, endDate } = req.query;

        const response = await axios.get(`${this.apiBaseUrl}/${listingId}/calendar`, {
          headers: {
            Authorization: this.authToken,
            "Content-Type": "application/json",
          },
          params: {
            startDate,
            endDate,
            includeResources: true,
          },
        });

        const calendarData = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
        res.json(calendarData);
      } catch (error) {
        console.error("Calendar Fetch Error:", error.message);
        res.status(500).json({ error: "Failed to fetch calendar data" });
      }
    });
  }

  startServer() {
    this.app.listen(this.port, () => {
      console.log(`Server is running on port ${this.port}`);
    });
  }
}

const manager = new HostawayListingManager();
manager.startServer();
