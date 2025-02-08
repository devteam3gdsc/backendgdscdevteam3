import { Router } from "express";
import commentsController from "../controllers/commentsController.mjs";
import authMiddleware from "../middlewares/authMidleware.mjs";

const commentRouter = Router();

commentRouter.get("/getComments/:hostId",authMiddleware.verifyToken,commentsController.getComments)
commentRouter.post("/create/:hostId",authMiddleware.verifyToken,commentsController.createComment);
commentRouter.put("/edit/:commentId",authMiddleware.verifyToken,commentsController.editComment);
commentRouter.delete("/delete/:commentId",authMiddleware.verifyToken,commentsController.deleteComment);
commentRouter.get("/like/:commentId",authMiddleware.verifyToken,commentsController.likeComments);
commentRouter.get("/unlike/:commentId",authMiddleware.verifyToken,commentsController.unlikeComments);
export default commentRouter;