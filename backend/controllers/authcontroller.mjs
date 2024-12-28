import bcrypt from "bcrypt";
import User from "../models/Users.mjs";
import jwt from "jsonwebtoken";

const authController = {
  // [POST] /auth/sigup
  signup: async (req, res) => {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(req.body.password, salt);
      const existedUser = await User.findOne({ username: req.body.username });
      if (existedUser) {
        return res.json("Username has already existed");
      }
      const existedEmail = await User.findOne({ email: req.body.email });
      if (existedEmail) {
        return res.json("Email has already existed");
      }
      await User.create({
        username: req.body.username,
        email: req.body.email,
        password: hashed,
      });
      res.status(201).json({ message: "Sign up successfully!" });
    } catch (err) {
      return res.json(err);
    }
  },
  // [POST] /auth/login
  login: async (req, res) => {
    try {
      const existedUsername = await User.findOne({ username: req.body.username });
      const existedEmail = await User.findOne({ email: req.body.username });
      const existedUser = existedEmail || existedUsername;
  
      if (!existedUser) {
        return res.json("Username or email is not existed");
      }
      const passwordCheck = await bcrypt.compare(
        req.body.password,
        existedUser.password
      );
      if (!passwordCheck) {
        return res.json("Wrong password");
      }
  
      // Tạo token
      const accessToken = jwt.sign(
        { id: existedUser.id },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: "200s" }
      );
      const refreshToken = jwt.sign(
        { id: existedUser.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "365d" }
      );
  
      // Lưu Refresh Token vào database
      existedUser.refreshTokens = existedUser.refreshTokens || []; // Nếu chưa có, khởi tạo
      existedUser.refreshTokens.push(refreshToken);
      await existedUser.save();
  
      // Cài đặt Refresh Token vào cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false, // Đổi thành `true` khi dùng HTTPS
        path: "/",
        sameSite: "strict",
      });
  
      return res.status(200).json({
        message: "Sign in successfully!",
        accessToken, refreshToken
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
  // [POST] /auth/logout
  logout: async (req, res)=>{
    try{
        const refreshToken = req.cookies.refreshToken;
        console.log("Received refreshToken:", req.cookies.refreshToken);

    if (!refreshToken) {
        return res.status(400).json("No Refresh Token provided");
    }

       // Xóa Refresh Token khỏi database
    const user = await User.findOne({ refreshTokens: refreshToken });
    if (!user) {
        return res.status(404).json("User not found");
    }

    user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
    await user.save();
    res.clearCookie("refreshToken"); // Xoa cookie tren client
    return res.status(200).json("Logged out");
    }catch(error){
        res.status(500).json(error);
    }
},
  // [POST] /auth/refresh
  requestRefreshToken: async (req, res)=> {
    try {
      // Lấy Refresh Token từ cookie
      const refreshToken = req.cookies.refreshToken;

      // Nếu không có Refresh Token, trả về lỗi
      if (!refreshToken) {
        return res.status(401).json("Refresh Token is required");
      }
      // Tìm người dùng có token này
      const user = await User.findOne({ refreshTokens: refreshToken });
      if (!user) {
        return res.status(403).json("Invalid Refresh Token");
      }
      // Kiểm tra xem Refresh Token có hợp lệ không
      jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET,
        async (err, decoded) => {
          if (err) {
            return res.status(403).json("Invalid or expired Refresh Token");
          }

          // Tạo Access Token mới với thời gian hết hạn dài hơn
          const newAccessToken = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: "300s" } // Access Token hết hạn sau 5 phút
          );

          // Tạo Refresh Token mới với thời gian hết hạn dài hơn
          const newRefreshToken = jwt.sign(
            { id: user.id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "365d" } // Refresh Token hết hạn sau 365 ngày
          );

          // Cập nhật Refresh Token trong database
          user.refreshTokens = user.refreshTokens.filter(
            (token) => token !== refreshToken
          );
          user.refreshTokens.push(newRefreshToken);
          await user.save();

          // Cập nhật Refresh Token mới vào cookie
          res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true, // Đảm bảo chỉ có thể truy cập qua HTTP
            secure: process.env.NODE_ENV === "production", // Đặt thành true khi chạy trên HTTPS
            path: "/",
            sameSite: "strict", // Đảm bảo cookie không bị gửi cross-site
          });

          // Trả về Access Token mới
          return res.status(200).json({ newAccessToken });
        }
      );
    } catch (error) {
      console.error(error); // In lỗi ra console để dễ dàng debug
      return res
        .status(500)
       .json("Error in refreshing token: " + error.message);
    }
  } 
};

export default authController;
