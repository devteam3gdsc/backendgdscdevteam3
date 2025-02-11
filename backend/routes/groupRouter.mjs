import { Router } from "express";
import authMiddleware from "../middlewares/authMidleware.mjs";
import groupController from "../controllers/groupController.mjs";
const groupRouter = Router();

groupRouter.post(
    "/create",
    authMiddleware.verifyToken,
    groupController.createGroup,
  );
groupRouter.get("/find",authMiddleware.verifyToken,groupController.findGroups)

export default groupRouter;