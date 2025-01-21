import express, { json } from "express";
import cors from "cors";
import connectDB from "./backend/config/db.mjs";
import cookieParser from "cookie-parser";
import router from "./backend/routes/index.mjs";
import { configDotenv } from "dotenv";
import { v2 } from "cloudinary";
import { createServer } from "http";
import { initializeSocket } from "./backend/utils/socket.mjs"; // Import the function

const app = express();
const PORT = process.env.PORT;
configDotenv();

// HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = initializeSocket(httpServer); // Call the function

// CORS configuration
const corsOptions = {
  origin: "https://sks564-5173.csb.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Connect to the database
connectDB();
router(app);

// Cloudinary configuration
v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Start the HTTP server
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
