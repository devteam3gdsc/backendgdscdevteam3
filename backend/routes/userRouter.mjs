import { Router } from "express"
import authMiddleware from "../middlewares/authMidleware.mjs";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 } from "cloudinary";
import multer from "multer";
import userController from "../controllers/userController.mjs"
import authController from "../controllers/authcontroller.mjs"
const userRouter = Router();
const storage = new CloudinaryStorage({
    cloudinary: v2,
    params:{
      folder: "User_avatar_files",
      resource_type: "image"
    }
  })
const upload = multer({ storage });
userRouter.get("/detail",authMiddleware.verifyToken,userController.getUserInfo);
userRouter.put("/update",authMiddleware.verifyToken,upload.single('avatar'),userController.updateUserInfo)
export default userRouter;