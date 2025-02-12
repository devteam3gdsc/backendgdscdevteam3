import { Router } from "express";
import authMiddleware from "../middlewares/authMidleware.mjs";
import projectController from "../controllers/projectController.mjs";
const projectRouter = Router();

projectRouter.get("/find",authMiddleware.verifyToken,projectController.findProjects);
projectRouter.get("/users/:projectId",authMiddleware.verifyToken,projectController.getUsers);
projectRouter.get("/posts/:projectId",authMiddleware.verifyToken,projectController.getProjectPosts)

export default projectRouter;