import bcrypt from "bcrypt";
import User from "../models/Users.mjs";

const authController = {
  signupUser: async (req, res) => {
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
      res.json("Sign up successfully!");
    } catch (err) {
      return res.json(err);
    }
  },
  // [POST] /auth/login
  login: async (req, res) => {
    try {
      // const user = await User.findOne({
      //   $or: [{ username: req.body.username }, { email: req.body.username }],
      // });
      // if (!user) {
      //   return res.json("Username or email is not existed");
      // }
      const existedUsername = await User.findOne({
        username: req.body.username,
      });
      const existedEmail = await User.findOne({ email: req.body.username });
      const existedUser = existedEmail || existedUsername;
      if (!existedUser) {
        return res.json("Username or email is not existed");
      } else {
        const passwordCheck = await bcrypt.compare(
          req.body.password,
          existedUser.password
        );
        if (passwordCheck) {
          res.json("Sign in successfully!");
        } else return res.json("Wrong password");
      }
    } catch (err) {
      return res.json(err);
    }
  },
  /*requestRefreshToken: async (req, res)=> {
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
            // Cấp lại Refresh Token bị lỗi (Hết hạn hoặc không hợp lệ)
            return res.status(403).json("Invalid or expired Refresh Token");
          }

          // // Lấy thông tin người dùng từ decoded (decoded sẽ có thông tin sau khi giải mã token)
          // const user = await User.findById(decoded.id);
          // if (!user) {
          //     return res.status(404).json("User not found");
          // }

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
  },
  logOutUser: async (req, res)=>{
    try{
        const refreshToken = req.cookies.refreshToken;

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
}*/
};

export default authController;
