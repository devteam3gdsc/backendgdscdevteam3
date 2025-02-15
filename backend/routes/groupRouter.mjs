import { Router } from "express";
import authMiddleware from "../middlewares/authMidleware.mjs";
import groupController from "../controllers/groupController.mjs";
const groupRouter = Router();

groupRouter.post(
  "/create",
  authMiddleware.verifyToken,
  groupController.createGroup,
);
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
  groupController.getUserNotInGroup,
);
export default groupRouter;
