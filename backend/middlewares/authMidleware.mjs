import jwt from "jsonwebtoken";

const authMiddleware = {
  verifyToken: async (req, res, next) => {
    try {
      // Lấy token từ Header Authorization
      const token =
        req.headers.authorization?.split(" ")[1] || req.headers.token;
      // Bearer <token>
      if (!token) {
        return res
          .status(401)
          .json({ message: "Access Denied: No Token Provided" });
      }

      // Xac thuc token
      if (!process.env.JWT_ACCESS_SECRET) {
        return res.status(500).json({ message: "JWT secret not configured." });
      }

      const verified = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      req.user = verified; // Store the decoded user info in req.user
      next(); // Chuyen den Controller
    } catch (error) {
      console.error("JWT Verification Error:", error); // Log chi tiết lỗi
      res.status(403).json({ message: "Invalid Token" });
    }
  },
};

export default authMiddleware;
