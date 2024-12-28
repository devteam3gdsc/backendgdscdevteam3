import { Router } from "express";
import authcontroller from "../controllers/authcontroller.mjs";
import authMidleware from "../middlewares/authMidleware.mjs";
const authrouter = Router();

authrouter.post("/login", authcontroller.login);
authrouter.post("/signup", authcontroller.signup);
authrouter.post("/logout", authMidleware.verifyToken, authcontroller.logout);
authrouter.post("/refresh", authcontroller.requestRefreshToken);

export default authrouter;
