import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import connectDb from "./config/db";
import http from "http";
import router from "./routes";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { ConnectSocket } from "./config/socket/socket";

// Initialize dotenv to load environment variables
dotenv.config();

// Create an Express application
const app = express();

// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with the HTTP server

app.use(express.json({ limit: "50mb" })); // Increase JSON payload limit
app.use(express.urlencoded({ limit: "50mb", extended: true })); // Increase URL-encoded payload limit

// app.use(
//   cors({
//     origin: "http://localhost:3000",
//     credentials: true,
//     optionsSuccessStatus: 200,
//   })
// );

app.use(cookieParser());
app.use("/api", router);

ConnectSocket(server);

const port = process.env.PORT || 8081;

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

app.use(cors(corsOptions));

app.use(cookieParser());
app.use("/api", router);

connectDb().then(() => {
  // Start the server and log the URL
  server.listen(port, () => {
    console.log("Connected to DB Successfully!");
    console.log(`Server is running on port ${port}`);
  });
});
