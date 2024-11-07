import express, { Request, Response } from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import connectDb from "./config/db";
import router from "./routes";
import cookieParser from "cookie-parser";
import axios from "axios";

// Initialize dotenv to load environment variables
dotenv.config();

// Create an Express application
const app = express();

app.use(express.json({ limit: "50mb" })); // Tăng giới hạn kích thước cho JSON payload
app.use(express.urlencoded({ limit: "50mb", extended: true })); // Tăng giới hạn cho URL-encoded payload

// Define the port number from environment variable or default to 8081
const PORT: number = parseInt(process.env.PORT || "8081", 10);

// CORS Configuration
const allowedOrigins = ["https://tea-ware-fe.vercel.app"];

const corsOptions = {
  origin: function (origin: any, callback: any) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Cho phép gửi thông tin xác thực (cookies, etc.)
};

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.get("/api/provinces", async (req, res) => {
  try {
    const response = await axios.get(
      "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/province",
      {
        headers: {
          token: process.env.GHN_API_TOKEN, // Use the token from environment variables
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch provinces" });
  }
});

// Fetch districts based on province ID
app.get("/api/districts", async (req, res) => {
  const { province_id } = req.query; // Get province_id from query parameters
  try {
    const response = await axios.get(
      "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/district",
      {
        headers: {
          token: process.env.GHN_API_TOKEN, // Use the token from environment variables
        },
        params: {
          province_id,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// Fetch wards based on district ID
app.get("/api/wards", async (req, res) => {
  const { district_id } = req.query; // Get district_id from query parameters
  try {
    const response = await axios.get(
      "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/ward",
      {
        headers: {
          token: process.env.GHN_API_TOKEN, // Use the token from environment variables
        },
        params: {
          district_id,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch wards" });
  }
});

app.use(express.json());
app.use(cookieParser());

app.use("/api", router);

connectDb().then(() => {
  // Start the server and log the URL
  app.listen(PORT, () => {
    console.log("Connected to DB Successfully!");
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
