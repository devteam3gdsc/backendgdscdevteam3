import { Router } from "express";
import authController from "../controllers/authcontroller.mjs";
import authMidleware from "../middlewares/authMidleware.mjs";

const authRouter = Router();

authRouter.post("/login", authController.login);
authRouter.post("/signup",authMidleware.verifyEmail, authController.signup);
authRouter.post("/logout", authMidleware.verifyToken, authController.logout);
authRouter.post("/refresh", authController.requestRefreshToken);
authRouter.post("/forgot-password",authMidleware.verifyEmail,authMidleware.verifyToken ,authController.forgotPassword);
authRouter.post("/reset-password/:token", authController.resetPassword);

export default authRouter;
