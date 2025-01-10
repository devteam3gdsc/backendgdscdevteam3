import express, { json } from "express";
import cors from "cors";
import connectDB from "./backend/config/db.mjs";
import cookieParser from "cookie-parser";
import router from "./backend/routes/index.mjs";
import { configDotenv } from "dotenv";
import { v2 } from "cloudinary";
const app = express();

const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

connectDB();
router(app);

configDotenv();
v2.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET
  })

app.listen(PORT, () => {
  console.log(process.env.MONGODB_URL);
  console.log(`Example app listening on port ${PORT}`);
});

//AUTHENTICATION: so sánh dữ liệu xem có đúng k
//AUTHORIZATION: phân quyền