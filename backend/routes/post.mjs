import {Router} from "express";
import postController from "../controllers/postController.mjs"
import authMiddleware from "../middlewares/authMidleware.mjs";
const postRouter = Router();

postRouter.get("/", postController.getPost);
postRouter.post("/createPost",authMiddleware.verifyToken, postController.createPost);
postRouter.get("/:id", authMiddleware.verifyToken ,postController.getUserPost);
export default postRouter;