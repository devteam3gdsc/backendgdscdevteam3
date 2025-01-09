import { Router } from "express";
import postController from "../controllers/postController.mjs"
const pageRouter = Router();

// postRouter.get("/",)
pageRouter.get("/:id",postController.getUserPost);
pageRouter.get("/",postController.getCommunityPosts)

export default pageRouter;