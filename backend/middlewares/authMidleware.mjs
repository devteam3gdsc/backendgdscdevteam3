import jwt from "jsonwebtoken";

const authMiddleware = {
  verifyToken: async (req, res, next) => {
    try {
      const token =
        req.headers.authorization?.split(" ")[1] || req.cookies.refreshToken;
      if (!token) {
        return res.status(401).json({ message: "Access Denied: No Token Provided" });
      }
      const secret = process.env.JWT_REFRESH_SECRET;
      const verified = jwt.verify(token, secret);
      req.user = verified;
      next();
    } catch (error) {
      console.error("JWT Error:", error.message);
      res.status(403).json({ name: error.name, message: error.message });
    }
  },
};

export default authMiddleware;
