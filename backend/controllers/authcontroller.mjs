import User from "../models/Users.mjs";
import jwt from "jsonwebtoken";
import userServices from "../services/userServices.mjs";
import authServices from "../services/authServices.mjs";
import tokensAndCookies from "../utils/tokensAndCookies.mjs";
import { httpError } from "../utils/httpResponse.mjs";
import crypto from "crypto";
import bcrypt from "bcrypt"
import sendEmail from "../services/emailServices.mjs";

const authController = {
  // [POST] /auth/sigup
  signup: async (req, res) => {
    try {
      const result = await userServices.signUpUser(req.body)
      return res.status(result.statusCode).json(result.message);
    } catch (error) {
      if (error instanceof httpError) return res.status(error.statusCode).json(error.message)
      else return res.status(error).json(error);
    }
  },
  // [POST] /auth/login
  login: async (req, res) => {
    try {
      const result = await authServices.login(req.body);
      tokensAndCookies.cookieSet(res,result.newRefreshToken);
      return res.status(200).json({newAccessToken:result.newAccessToken});
    } catch (error) {
      if (error instanceof httpError) return res.status(error.statusCode).json(error.message)
      else return res.status(error).json(error);
    }
  },
  // [POST] /auth/logout
  logout: async (req, res) => {
    try {
      const result =await authServices.logout(req.cookies.refreshToken);
      res.clearCookie("refreshToken"); // Xoa cookie tren client
      return res.status(result.statusCode).json(result.message)
    } catch (error) {
      if (error instanceof httpError) return res.status(error.statusCode).json(error.message)
      else return res.status(500).json(error);
    }
  },
  // [POST] /auth/refresh
  requestRefreshToken: async (req, res) => {
    try {
      const result =await authServices.requestRefreshToken(req.cookies.refreshToken);
      tokensAndCookies.cookieSet(res,result.newRefreshToken);
      return res.status(200).json({newAccessToken:result.newAccessToken})
    } catch (error) {
      if (error instanceof httpError) return res.status(error.statusCode).json(error.message)
      else return res.status(500).json(error);
  }},

  forgotPassword : async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if(!user || user.id !== req.user.id) return res.status(404).json({ message:"User not found!" });
        const resetToken = crypto.randomBytes(20).toString("hex");
        const hashedToken = jwt.sign({ token: resetToken }, process.env.JWT_RESET_PASSWORD_SECRET);

        user.resetPasswordToken = resetToken;//hashedToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15' 
        await user.save();
        const resetLink = `${process.env.FE_URL}/pass-new/${resetToken}`;
        await sendEmail(
          user.email,
          "Reset Your Password",
          `
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}" style="color: blue; text-decoration: underline;">Reset Your Password</a>
          <p>If you did not request this, please ignore this email.</p>
          `
      );      
        return res.status(200).json({ message: "Email sent successfully" });
    } catch(error) {
        return res.status(500).json({ message: "Something went wrong", error });
    }
},

resetPassword : async (req, res) => {
try {
    const { token } = req.params;
    const { newPassword } = req.body;
    
    // Tìm user với token hợp lệ
    const hashedToken = jwt.sign({ token }, process.env.JWT_RESET_PASSWORD_SECRET);
    const user = await User.findOne({
        resetPasswordToken: token, //hashedToken,
        resetPasswordExpires: { $gt: Date.now() }, // Token chưa hết hạn
    });
    
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });
    
    // Cập nhật mật khẩu
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    
    // Xóa token sau khi đặt lại mật khẩu
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    return res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
    return res.status(500).json({ message: "Something went wrong", error });
  }
},

}


export default authController;
