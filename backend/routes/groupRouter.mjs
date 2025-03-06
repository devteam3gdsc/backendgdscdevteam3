import { Router } from "express";
import groupController from "../controllers/groupController.mjs";
import authMiddleware from "../middlewares/authMidleware.mjs";
import roleMiddleware from "../middlewares/roleMiddleware.mjs"
import postController from "../controllers/postController.mjs";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 } from "cloudinary";
import multer from "multer";
import checkAdmin from "../middlewares/checkAdminMiddleware.mjs";

const storage = new CloudinaryStorage({
  cloudinary: v2,
  params: {
    folder: "User_avatar_files",
    resource_type: "image",
  },
});
const upload = multer({ storage });

const groupRouter = Router();
groupRouter.get(
  "/find",
  authMiddleware.verifyToken,
  groupController.findGroups,
);
groupRouter.get(
  "/users/:groupId",
  authMiddleware.verifyToken,
  groupController.getUsers,
);
groupRouter.get(
  "/posts/:groupId",
  authMiddleware.verifyToken,
  groupController.getGroupPosts,
);
groupRouter.get(
  "/suggestedUser/:groupId",
  authMiddleware.verifyToken,
  groupController.getFollowedUserNotInGroup,
);
groupRouter.get(
  "/getUninvitedUsers/:groupId",
  authMiddleware.verifyToken,
  groupController.getUserNotInGroup);
groupRouter.post(
  "/create",
  authMiddleware.verifyToken,
  upload.single("avatar"),
  groupController.createGroup,
);

groupRouter.put(
  "/update/:groupId",
  authMiddleware.verifyToken,
  // roleMiddleware("group",["admin"]),
  upload.single("avatar"),
  groupController.updateFull,
);
groupRouter.delete(
  "/delete/:groupId",
  authMiddleware.verifyToken,
  // roleMiddleware("group",["admin"]),
  groupController.deleteGroup,
);
groupRouter.get(
  "/fullData/:groupId",
  authMiddleware.verifyToken,
  groupController.getFullGroupData,
);

groupRouter.post(
  "/invite/:groupId",
  authMiddleware.verifyToken,
  // roleMiddleware("group",["admin"]),
  groupController.inviteMembers,
);
groupRouter.post(
  "/confirmInvite/:groupId",
  authMiddleware.verifyToken,
  groupController.confirmInvite,
);
groupRouter.delete(
  "/removeMember/:groupId/:removedUserId",
  authMiddleware.verifyToken,
  // roleMiddleware("group",["admin"]),
  groupController.removeMember,
);
groupRouter.post(
  "/join/:groupId",
  authMiddleware.verifyToken,
  groupController.joinGroup,
);
groupRouter.post(
  "/leave/:groupId",
  authMiddleware.verifyToken,
  groupController.leaveGroup,
);
groupRouter.post(
  "/assignAdmin/:groupId/:assignAdminUserId",
  authMiddleware.verifyToken,
  // roleMiddleware("group",["admin"]),
  groupController.assignAdmin,
);
groupRouter.post(
  "/removeAdmin/:groupId/:removeAdminUserId",
  authMiddleware.verifyToken,
  // roleMiddleware("group",["admin"]),
  groupController.removeAdmin,
);
groupRouter.post(
  "/assignCreator/:groupId/:assignCreatorUserId",
  authMiddleware.verifyToken,
  // roleMiddleware("group",["creator"]),
  groupController.assignCreator,
);
// -----POST-----
//[GET] /group/createPost
groupRouter.post(
  "/createPost",
  authMiddleware.verifyToken,
  //roleMiddleware("group",["creator"]),
  postController.createPost, //group/project/section truyen qua body
);
groupRouter.post(
  "/postModerate/:postId",
  authMiddleware.verifyToken,
  checkAdmin,
  postController.confirmPost, 
);
 //[GET] /group/getPosts?page=...&limit=...&search=...&group=...&status=approved
groupRouter.get( 
  "/getPosts",
  authMiddleware.verifyToken,
  // roleMiddleware("group",["creator"]),
  postController.getPostsInGroupProjectSection,
);
groupRouter.get("/publicData/:groupId",authMiddleware.verifyToken,groupController.getPublicGroupData);
export default groupRouter;
