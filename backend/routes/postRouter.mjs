import { Router } from "express";
import authMiddleware from "../middlewares/authMidleware.mjs";
import commentsController from "../controllers/commentsController.mjs";
import postController from "../controllers/postController.mjs";
import { v2 } from "cloudinary";
import multer from "multer";
import { configDotenv } from "dotenv";
import { CloudinaryStorage } from "multer-storage-cloudinary";
//khai bao
const postRouter = Router();

const storage = new CloudinaryStorage({
  cloudinary: v2,
  params: {
    folder: "User_code_files",
    resource_type: "raw",
  },
});
const upload = multer({ storage });

var cpUpload = upload.fields([{ name: "code_files", maxCount: 6 }]);

//post:
postRouter.post(
  "/create",
  authMiddleware.verifyToken,
  cpUpload,
  postController.createPost
);
postRouter.get(
  "/store/:postId",
  authMiddleware.verifyToken,
  postController.storePost
);
postRouter.get(
  "/unstore/:postId",
  authMiddleware.verifyToken,
  postController.unStorePost
);
postRouter.get(
  "/like/:postId",
  authMiddleware.verifyToken,
  postController.likePost
);
postRouter.get("/unlike/:postId", postController.unLikePost);
postRouter.get("/detail/:postId", postController.detailPost);
postRouter.delete(
  "/delete/:postId",
  authMiddleware.verifyToken,
  postController.deletePost
);
postRouter.put(
  "/edit/:postId",
  authMiddleware.verifyToken,
  cpUpload,
  postController.editPost
);

//comment:
postRouter.get(
  "/detail/:postId/comment",
  authMiddleware.verifyToken,
  commentsController.getComments
);
postRouter.post(
  "/:postId/comment/create",
  authMiddleware.verifyToken,
  commentsController.createComment
);
postRouter.delete(
  "/:postId/comment/delete/:commentId",
  authMiddleware.verifyToken,
  commentsController.deleteComment
);
postRouter.put(
  "/:postId/comment/edit/:commentId",
  authMiddleware.verifyToken,
  commentsController.editComment
);
export default postRouter;
