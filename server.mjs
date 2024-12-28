import express, { json } from "express";
import cors from "cors";
import connectDB from "./backend/config/db.mjs";
import cookieParser from "cookie-parser";
import router from "./backend/routes/index.mjs";

const app = express();
const PORT = process.env.PORT || 3500;
app.use(cors());
app.use(express.json());
app.use(cookieParser());

connectDB();
router(app);

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
  console.log(process.env.MONGODB_URL);
});

//AUTHENTICATION: so sánh dữ liệu xem có đúng k
//AUTHORIZATION: phân quyền
