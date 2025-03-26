import express from "express";
import cors from "cors";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./routes/routes.js";
import { getConfig } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class HostawayListingManager {
  constructor() {
    this.app = express();
    this.apiBaseUrl = "https://api.hostaway.com/v1/listings";
    this.port = process.env.PORT || 3000;
    this.config = getConfig();
    this.listings = [];

    // Initialize token
    this.authToken =
      "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI4MDA2NiIsImp0aSI6ImE0OTkzMDcyMzdiNmQyODA2M2NlYzYwZjUzM2RmYTM1NTU4ZjU0Yzc4OTJhMTk5MmFkZGNhYjZlZWE5NTE1MzFjMDYwM2UzMGI5ZjczZDRhIiwiaWF0IjoxNzM5MjcwMjM2LjA0NzE4LCJuYmYiOjE3MzkyNzAyMzYuMDQ3MTgyLCJleHAiOjIwNTQ4MDMwMzYuMDQ3MTg2LCJzdWIiOiIiLCJzY29wZXMiOlsiZ2VuZXJhbCJdLCJzZWNyZXRJZCI6NTI0OTJ9.n_QTZxeFcJn121EGofg290ReOoNE7vMJAE4-lnXhNbLCZw0mIJu1KQWE5pM0xPUcUHeJ-7XTQfS0U5yIkabGi7vGGex0yx9A0h03fn7ZBAtCzPLq_Xmj8ZOdHzahpRqxRsNRRNOlnbttTSrpSo4NJCdK6yhMTKrKkTTVh60IJIc";

    // Trust proxy for secure cookies in production
    if (process.env.NODE_ENV === 'production') {
      this.app.set('trust proxy', 1);
    }

    // Middleware
    this.app.use(cors({
      origin: this.config.corsOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    }));
    this.app.use(express.json());

    // Security headers
    this.app.use((req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      }
      next();
    });

    // Serve static files
    this.app.use(express.static(path.join(__dirname, "../frontend/public")));
    this.app.use("/", routes);

    // Error handling middleware
    this.app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ 
        error: process.env.NODE_ENV === 'production' 
          ? 'Internal Server Error' 
          : err.message 
      });
    });

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

        let listings =
          typeof response.data === "string"
            ? JSON.parse(response.data)
            : response.data;

        listings = listings.map((listing) => {
          return {
            id: listing.id,
            name: listing.name,
            imageUrl:
              listing.images && listing.images.length > 0
                ? listing.images[0].url
                : null,
            caption: listing.caption || listing.name,
            vrboCaption: listing.vrboCaption || null,
            airbnbCaption: listing.airbnbCaption || null,
            sortOrder: listing.sortOrder || 0,
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

        const listing =
          typeof response.data === "string"
            ? JSON.parse(response.data)
            : response.data;
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

        const response = await axios.get(
          `${this.apiBaseUrl}/${listingId}/calendar`,
          {
            headers: {
              Authorization: this.authToken,
              "Content-Type": "application/json",
            },
            params: {
              startDate,
              endDate,
              includeResources: true,
            },
          }
        );

        const calendarData =
          typeof response.data === "string"
            ? JSON.parse(response.data)
            : response.data;
        res.json(calendarData);
      } catch (error) {
        console.error("Calendar Fetch Error:", error.message);
        res.status(500).json({ error: "Failed to fetch calendar data" });
      }
    });

    this.app.post("/api/available-listings", async (req, res) => {
      console.log("Received POST request at /api/available-listings");
      try {
        if (!this.authToken) {
          await this.getAccessToken();
        }
    
        const { checkinDate, checkoutDate } = req.body;
        const listingIds = req.body.listingIds;
    
        console.log("checkinDate:", checkinDate);
        console.log("checkoutDate:", checkoutDate);
        console.log("listingIds:", listingIds);
    
        const fetchPromises = listingIds.map(async (listingId) => {
          const response = await axios.get(`${this.apiBaseUrl}/${listingId}/calendar`, {
            headers: {
              Authorization: this.authToken,
              "Content-Type": "application/json",
            },
            params: {
              startDate: checkinDate,
              endDate: checkoutDate,
              includeResources: true,
            },
          });
    
          const calendarData = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
          return { listingId, calendarData };
        });
    
        const results = await Promise.all(fetchPromises);
    
        const availableListings = results.filter(result => {
          return result.calendarData.some(entry => entry.status === "available");
        }).map(result => result.listingId);
    
        res.json(availableListings);
      } catch (error) {
        console.error("Available Listings Fetch Error:", error.message);
        res.status(500).json({ error: "Failed to fetch available listings" });
      }
    });
  }

  startServer() {
    const PORT = process.env.PORT || 3000;
    this.app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
}

const manager = new HostawayListingManager();
manager.startServer();
