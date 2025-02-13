import { Router } from "express";
import postController from "../controllers/postController.mjs";
import authMiddleware from "../middlewares/authMidleware.mjs";
import userController from "../controllers/userController.mjs";
const pageRouter = Router();

// postRouter.get("/",)
pageRouter.get("/me", authMiddleware.verifyToken, postController.getUserPost);
pageRouter.get(
  "/community",
  authMiddleware.verifyToken,
  postController.getCommunityPosts
);
pageRouter.get("/feed", authMiddleware.verifyToken,postController.getFeedPosts);
pageRouter.get("/popular",authMiddleware.verifyToken,userController.getPopular);
pageRouter.get("/recent",authMiddleware.verifyToken,userController.getRecent)

export default pageRouter;
