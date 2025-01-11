import express, { json } from "express";
import cors from "cors";
import connectDB from "./backend/config/db.mjs";
import cookieParser from "cookie-parser";
import router from "./backend/routes/index.mjs";
import { configDotenv } from "dotenv";
import { v2 } from "cloudinary";
const app = express();

const PORT = process.env.PORT;

// CORS configuration: Set the origin to your frontend's URL
const corsOptions = {
  origin: "http://localhost:5174", // Set this to the exact frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  credentials: true, // Allow cookies to be sent
};

// Use the CORS middleware with the above configuration
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Connect to the database
connectDB();
router(app);

// Cloudinary configuration
configDotenv();
v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
