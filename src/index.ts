import express, { Request, Response } from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import connectDb from "./config/db";
import router from "./routes";
import cookieParser from "cookie-parser";

// Initialize dotenv to load environment variables
dotenv.config();

// Create an Express application
const app = express();

app.use(express.json({ limit: '50mb' })); // Tăng giới hạn kích thước cho JSON payload
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Tăng giới hạn cho URL-encoded payload

// Define the port number from environment variable or default to 8081
const PORT: number = parseInt(process.env.PORT || "8081", 10);

const allowedOrigins = ['https://tea-ware-fe.vercel.app'];  

const corsOptions = {
  origin: function (origin: any, callback: any) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};
 
// Middleware to parse JSON
app.use(cors(corsOptions));
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
