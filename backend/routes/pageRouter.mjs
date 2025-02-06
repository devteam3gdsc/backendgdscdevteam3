import { Router } from "express";
import postController from "../controllers/postController.mjs";
import authMiddleware from "../middlewares/authMidleware.mjs";
const pageRouter = Router();

// postRouter.get("/",)
pageRouter.get("/me", authMiddleware.verifyToken, postController.getUserPost);
pageRouter.get(
  "/community",
  authMiddleware.verifyToken,
  postController.getCommunityPosts,
);
pageRouter.get(
  "/following",
  authMiddleware.verifyToken,
  postController.getFollowedPost,
);

export default pageRouter;
