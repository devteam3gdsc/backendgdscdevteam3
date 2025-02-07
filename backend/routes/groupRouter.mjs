import { Router } from "express";
import groupController from "../controllers/groupController.mjs";
import authMiddleware from "../middlewares/authMidleware.mjs";
import roleMiddleware from "../middlewares/roleMiddleware.mjs";

const groupRouter = Router();
groupRouter.post(
  "/create",
  authMiddleware.verifyToken,
  groupController.createGroup,
);
groupRouter.put(
  "/update/:groupId",
  authMiddleware.verifyToken,
  roleMiddleware(["creator", "admin"]),
  groupController.updateGroup,
);
groupRouter.delete(
  "/delete/:groupId",
  authMiddleware.verifyToken,
  roleMiddleware(["creator"]),
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
  roleMiddleware(["creator", "admin"]),
  groupController.inviteMembers,
);
groupRouter.delete(
  "/removeMember/:groupId/:removedUserId",
  authMiddleware.verifyToken,
  roleMiddleware(["creator", "admin"]),
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
  roleMiddleware(["creator", "admin"]),
  groupController.assignAdmin,
);
groupRouter.post(
  "/assignCreator/:groupId/:assignCreatorUserId",
  authMiddleware.verifyToken,
  roleMiddleware(["creator"]),
  groupController.assignCreator,
);
export default groupRouter;
