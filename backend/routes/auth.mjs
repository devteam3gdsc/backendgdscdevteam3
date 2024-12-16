import { Router } from "express";
import authcontroller from "../controllers/authcontroller.mjs";
import authMidleware from "../middlewares/authMidleware.mjs";
const authrouter = Router();

authrouter.post("/login", authcontroller.login);
authrouter.post("/signup", authcontroller.signupUser);
// authrouter.post(
//   "/logout",
//   authMiddleware.verifyToken,
//   authcontroller.logOutUser
// );
// authrouter.post("/refresh", authcontroller.requestRefreshToken);
export default authrouter;
