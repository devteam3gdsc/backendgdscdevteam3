import { Router } from "express";
import authMiddleware from "../middlewares/authMidleware.mjs";
import projectController from "../controllers/projectController.mjs";
import sectionController from "../controllers/sectionController.mjs";
const projectRouter = Router();

projectRouter.get("/find",authMiddleware.verifyToken,projectController.findProjects);
projectRouter.get("/users/:projectId",authMiddleware.verifyToken,projectController.getUsers);
projectRouter.get("/uninvitedUsers/:projectId",authMiddleware.verifyToken,projectController.getUninvitedUsers)
projectRouter.get("/posts/:projectId",authMiddleware.verifyToken,projectController.getProjectPosts);
projectRouter.post("/sectionCreate",authMiddleware.verifyToken,sectionController.createSection);
projectRouter.put("/sectionUpdate/:sectionId",authMiddleware.verifyToken,sectionController.updateSection);
projectRouter.delete("/sectionUpdate/:sectionId",authMiddleware.verifyToken,sectionController.deleteSection);
projectRouter.get("/section/:sectionId/addingParticipant/:userId",authMiddleware.verifyToken,sectionController.addParticipant);
projectRouter.get("/section/:sectionId/removeParticipant/:userId",authMiddleware.verifyToken,sectionController.removeParticipant);
projectRouter.get("/section/:sectionId/getUsers",authMiddleware.verifyToken,sectionController.getUsers);
projectRouter.get("/section/:sectionId/getUninvitedUsers",authMiddleware.verifyToken,sectionController.getUninvitedUsers);
projectRouter.get("/section/:sectionId",authMiddleware.verifyToken,sectionController.getSectionsPosts);



export default projectRouter;