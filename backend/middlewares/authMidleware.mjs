
import tokensAndCookies from "../utils/tokensAndCookies.mjs";
import { httpError } from "../utils/httpResponse.mjs";
import axios from "axios";

const authMiddleware = {
  verifyToken: (req, res, next) => {
    try {
      const token = req.cookies.refreshToken;
      if (token) {
        const verified = tokensAndCookies.refreshTokenDecoding(token)
        req.user = verified;
        next();
      } else {
        const token = req.headers.authorization?.split(" ")[1]
        const verified = tokensAndCookies.accessTokenDecoding(token)
        req.user = verified;
        next();
      }
    } catch (error) {
      if (error instanceof httpError) return res.status(error.statusCode).json(error.message)
      else return res.status(500).json(error);
    }
  },verifyEmail : async (req, res, next) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
  
    const API_KEY = process.env.KICKBOX_API_KEY; // Đặt API key trong file .env
    const API_URL = `https://api.kickbox.com/v2/verify?email=${email}&apikey=${API_KEY}`;
  
    try {
      const response = await axios.get(API_URL);
      const { result, reason } = response.data;
  
      // Kiểm tra trạng thái email
      if (result === "deliverable") {
        console.log("Email is valid.");
        next(); // Email hợp lệ, tiếp tục xử lý
      } else {
        console.error(`Email verification failed. Reason: ${reason}`);
        return res.status(400).json({ 
          message: "Email does not exist or is invalid.", 
          reason 
        });
      }
    } catch (error) {
      console.error("Error verifying email:", error.message);
      return res.status(500).json({ message: "Error verifying email." });
    }
  },
  verifySocketToken : (socket, next) => {
    try {
      let token = null;
      if(socket.handshake.query?.token) {
        token = socket.handshake.query.token;
      }

      if(!token) {
        return next(new Error("Unauthorized: No token provided!"));
      }

      const verified = tokensAndCookies.accessTokenDecoding(token);
      socket.user = verified;
      next();
    } catch (error) {
      return next(new Error("Unauthorized: Invalid Token"));
    }
  },
  verifyEmail : async (req, res, next) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
  
    const API_KEY = process.env.KICKBOX_API_KEY; // Đặt API key trong file .env
    const API_URL = `https://api.kickbox.com/v2/verify?email=${email}&apikey=${API_KEY}`;
  
    try {
      const response = await axios.get(API_URL);
      const { result, reason } = response.data;
  
      // Kiểm tra trạng thái email
      if (result === "deliverable") {
        console.log("Email is valid.");
        next(); // Email hợp lệ, tiếp tục xử lý
      } else {
        console.error(`Email verification failed. Reason: ${reason}`);
        return res.status(400).json({ 
          message: "Email does not exist or is invalid.", 
          reason 
        });
      }
    } catch (error) {
      console.error("Error verifying email:", error.message);
      return res.status(500).json({ message: "Error verifying email." });
    }
  }
};

export default authMiddleware;
