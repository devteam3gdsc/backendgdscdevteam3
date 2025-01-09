import { Router } from "express";
import authMiddleware from "../middlewares/authMidleware.mjs";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 } from "cloudinary";
import multer from "multer";
import userController from "../controllers/userController.mjs";
const userRouter = Router();
const storage = new CloudinaryStorage({
  cloudinary: v2,
  params: {
    folder: "User_avatar_files",
    resource_type: "image",
  },
});
const upload = multer({ storage });
userRouter.get(
  "/fullInfo",
  authMiddleware.verifyToken,
  userController.getUserFullInfo
);
userRouter.get(
  "/publicInfo",
  authMiddleware.verifyToken,
  userController.getUserPublicInfo
);
userRouter.put(
  "/updateFull",
  authMiddleware.verifyToken,
  upload.single("avatar"),
  userController.updateFullUserInfo
);
userRouter.put(
  "/updatePassword",
  authMiddleware.verifyToken,
  userController.updateUserPassword
);
export default userRouter;
