import { Router } from "express";
import authController from "../controllers/authcontroller.mjs";
import authMidleware from "../middlewares/authMidleware.mjs";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 } from "cloudinary";
import multer from "multer";

const authRouter = Router();
authRouter.post("/login", authController.login);
authRouter.post("/signup", authController.signup);
authRouter.post("/logout", authMidleware.verifyToken, authController.logout);
authRouter.post("/refresh", authController.requestRefreshToken);

export default authRouter;
