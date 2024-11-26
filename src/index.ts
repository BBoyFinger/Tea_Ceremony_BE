import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import connectDb from "./config/db";
import router from "./routes";
import cookieParser from "cookie-parser";

// Initialize dotenv to load environment variables
dotenv.config();

// Create an Express application
const app = express();

app.use(express.json({ limit: "50mb" })); // Tăng giới hạn kích thước cho JSON payload
app.use(express.urlencoded({ limit: "50mb", extended: true })); // Tăng giới hạn cho URL-encoded payload

const port = process.env.PORT || 8081;

// CORS Configuration
// const allowedOrigins = ["https://tea-ware-fe.vercel.app"];

// const corsOptions = {
//   origin: function (origin: any, callback: any) {
//     if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true, // Cho phép gửi thông tin xác thực (cookies, etc.)
// };

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.use("/api", router);

connectDb().then(() => {
  // Start the server and log the URL
  app.listen(port, () => {
    console.log("Connected to DB Successfully!");
    console.log(`Server is running on port ${port}`);
  });
});
