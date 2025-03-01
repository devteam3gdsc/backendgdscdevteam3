import { Router } from "express";
import authMiddleware from "../middlewares/authMidleware.mjs";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 } from "cloudinary";
import multer from "multer";
import userController from "../controllers/userController.mjs";
import postController from "../controllers/postController.mjs";
import authController from "../controllers/authcontroller.mjs";
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
  userController.getUserFullInfo,
);
userRouter.get(
  "/publicInfo/:userId",
  authMiddleware.verifyToken,
  userController.getUserPublicInfo,
);
userRouter.put(
  "/updateFull",
  authMiddleware.verifyToken,
  upload.single("avatar"),
  userController.updateFullUserInfo,
);
userRouter.put(
  "/updatePassword",
  authMiddleware.verifyToken,
  userController.updateUserPassword,
);

userRouter.get(
  "/briefData/:userId",
  authMiddleware.verifyToken,
  userController.getUserBriefData,
);

userRouter.get("/test", authMiddleware.verifyToken, userController.test);
userRouter.get(
  "/follow/:userId",
  authMiddleware.verifyToken,
  userController.follow,
);
userRouter.get(
  "/unfollow/:userId",
  authMiddleware.verifyToken,
  userController.unfollow,
);
userRouter.get(
  "/posts/:userId",
  authMiddleware.verifyToken,
  postController.getAnotherUserPost,
);
userRouter.get(
  "/getUsers",
  authMiddleware.verifyToken,
  userController.getUsers,
);
userRouter.get("/pin", authMiddleware.verifyToken, userController.addPin);
userRouter.get("/pinned", authMiddleware.verifyToken, userController.getPin);
userRouter.get(
  "/unpin/:position",
  authMiddleware.verifyToken,
  userController.unPin,

);
export default userRouter;
