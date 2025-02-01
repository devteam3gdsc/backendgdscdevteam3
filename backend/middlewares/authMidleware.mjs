
import tokensAndCookies from "../utils/tokensAndCookies.mjs";
import { httpError } from "../utils/httpResponse.mjs";
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
};

export default authMiddleware;
