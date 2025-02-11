import { Router } from "express";
import authMiddleware from "../middlewares/authMidleware.mjs";
import projectController from "../controllers/projectController.mjs";
const projectRouter = Router();

projectRouter.get("/find",authMiddleware.verifyToken,projectController.findProjects)

export default projectRouter;