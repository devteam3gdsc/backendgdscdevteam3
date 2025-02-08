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
  roleMiddleware("group",["admin"]),
  groupController.updateGroup,
);
groupRouter.delete(
  "/delete/:groupId",
  authMiddleware.verifyToken,
  roleMiddleware("group",["admin"]),
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
  roleMiddleware("group",["admin"]),
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
  roleMiddleware("group",["admin"]),
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
  roleMiddleware("group",["admin"]),
  groupController.assignAdmin,
);
groupRouter.post(
  "/removeAdmin/:groupId/:removeAdminUserId",
  authMiddleware.verifyToken,
  roleMiddleware("group",["admin"]),
  groupController.removeAdmin,
);
// groupRouter.post(
//   "/assignCreator/:groupId/:assignCreatorUserId",
//   authMiddleware.verifyToken,
//   roleMiddleware("group",["creator"]),
//   groupController.assignCreator,
// );


export default groupRouter;
