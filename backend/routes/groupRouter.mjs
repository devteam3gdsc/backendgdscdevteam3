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
export default groupRouter;
