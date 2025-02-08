import { Router } from "express";
import projectController from "../controllers/projectController.mjs";
import authMiddleware from "../middlewares/authMidleware.mjs";
import roleMiddleware from "../middlewares/roleMiddleware.mjs";

const projectRouter = Router();
projectRouter.post(
    "/create/:groupId",
    authMiddleware.verifyToken,
    //roleMiddleware("group",["creator", "admin"]),
    projectController.createProject,
);
projectRouter.post(
    "/update/:projectId",
    authMiddleware.verifyToken,
    roleMiddleware("project",["leader", "admin"]),
    projectController.updateProject,
);
projectRouter.delete(
    "/delete/:projectId",
    authMiddleware.verifyToken,
    roleMiddleware("project",["leader"]),
    projectController.deleteProject,
);

export default projectRouter;