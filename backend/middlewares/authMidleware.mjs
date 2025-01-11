import jwt from "jsonwebtoken";

const authMiddleware = {
  verifyToken: async (req, res, next) => {
    try {
      const token = req.cookies.refreshToken;
      console.log(1);
      if (token) {
        const secret = process.env.JWT_REFRESH_SECRET;
        const verified = jwt.verify(token, secret);
        req.user = verified;
        next();
      } else {
        const token = req.headers.authorization?.split(" ")[1]
        const secret = process.env.JWT_ACCESS_SECRET;
        const verified = jwt.verify(token, secret);
        req.user = verified;
        next();
      }
    } catch (error) {
      console.error("JWT Error:", error.message);
      res.status(403).json({ name: error.name, message: error.message });
    }
  },
};

export default authMiddleware;
