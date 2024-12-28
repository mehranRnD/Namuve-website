import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./routes/routes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class HostawayListingManager {
  constructor() {
    this.app = express();
    this.apiBaseUrl = process.env.HOSTAWAY_API_URL || "https://api.hostaway.com/v1/listings";
    this.port = process.env.PORT || 3000;
    this.listings = [];

    // Initialize token
    this.initializeToken();

    // Middleware
    this.app.use(cors());
    this.app.use(express.json());

    // Serve static files
    this.app.use(express.static(path.join(__dirname, "../frontend/public")));
    this.app.use("/", routes);

    // Test endpoint to check token
    this.app.get('/test-token', (req, res) => {
        // console.log('Current Auth Token:', this.authToken);
        res.json({ 
            message: 'Check console for token details',
            token: this.authToken 
        });
    });

    // Backend-specific routes
    this.app.get('/api/listings/:id', async (req, res) => {
        try {
            // Ensure we have a valid token
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

            const listing = typeof response.data === "string"
                ? JSON.parse(response.data)
                : response.data;

            res.json(listing);
        } catch (error) {
            console.error("Listing Detail Fetch Error:", error.message);
            res.status(500).json({ error: "Failed to fetch listing details" });
        }
    });

    this.app.get('/api/listings/:id/calendar', async (req, res) => {
        try {
            // Ensure we have a valid token
            if (!this.authToken) {
                await this.getAccessToken();
            }

            const listingId = req.params.id;
            const { startDate, endDate } = req.query;
            console.log('Making calendar request with token:', this.authToken);
            
            const response = await axios.get(`${this.apiBaseUrl}/${listingId}/calendar`, {
                headers: {
                    Authorization: this.authToken,
                    "Content-Type": "application/json",
                },
                params: {
                    startDate,
                    endDate,
                    includeResources: true
                }
            });

            const calendarData = typeof response.data === "string"
                ? JSON.parse(response.data)
                : response.data;

            res.json(calendarData);
        } catch (error) {
            console.error("Calendar Fetch Error:", error.message);
            if (error.response) {
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
            }
            res.status(500).json({ error: "Failed to fetch calendar data" });
        }
    });
  }

  async getAccessToken() {
    try {
        console.log('Requesting new access token...');
        const response = await axios.post('https://api.hostaway.com/v1/accessTokens', 
            new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: process.env.HOSTAWAY_ACCOUNT_ID || '80066',
                client_secret: process.env.HOSTAWAY_API_KEY || 'd68ae34610624f57d27d57e14e1969a44ab1cf016037f98c5c338113bed5b570',
                scope: 'general'
            }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cache-Control': 'no-cache'
            }
        });

        // console.log('Full API Response:', JSON.stringify(response.data, null, 2));

        if (response.data && response.data.access_token) {
            this.authToken = `Bearer ${response.data.access_token}`;
            // console.log('New access token:', this.authToken);

            console.log('Congratulations Mehran, Token obtained successfully!');

            return this.authToken;
        } else {
            console.log('Response data:', response.data);
            throw new Error('Failed to get access token');
        }
    } catch (error) {
        console.error('Error getting access token:', error.message);
        if (error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
        }
        throw error;
    }
  }

  async initializeToken() {
    try {
        // console.log('Initializing token...');
        await this.getAccessToken();
        // console.log('Token initialization successful');
        
        // Refresh token every 23 hours
        setInterval(async () => {
            console.log('Refreshing token...');
            await this.getAccessToken();
        }, 23 * 60 * 60 * 1000);
    } catch (error) {
        console.error('Failed to initialize token:', error);
    }
  }

  startServer() {
    this.app.listen(this.port, () => {
      console.log(`Server is running on port ${this.port}`);
    });
  }
}

const manager = new HostawayListingManager();
manager.startServer();
