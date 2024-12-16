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

app.get("/", (req, res) => {
  return res.send("this trang chu");
});

app.listen(PORT, () => {
  console.log("hello");
  console.log(process.env.MONGODB_URL);
  console.log(`Example app listening on port ${PORT}`);
});

//AUTHENTICATION: so sánh dữ liệu xem có đúng k
//AUTHORIZATION: phân quyền
