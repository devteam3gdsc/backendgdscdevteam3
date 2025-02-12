import mongoose from "mongoose";
import { configDotenv } from "dotenv";
configDotenv();
export default function connectDB() {
  try {
    const mongoURL = process.env.MONGODB_URL;

    // Kết nối MongoDB mà không cần các tuỳ chọn deprecated
    mongoose.connect(mongoURL);

    console.log("Kết nối đến MongoDB thành công!");
  } catch (error) {
    console.error("Lỗi kết nối MongoDB:", error);
    process.exit(1); // Thoát khi gặp lỗi kết nối
  }
}
