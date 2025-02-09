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

projectRouter.get(
    "/fullData/:projectId",
    authMiddleware.verifyToken,
    projectController.getFullProjectData,
  );
  
projectRouter.post(
    "/invite/:projectId",
    authMiddleware.verifyToken,
    roleMiddleware("project",["admin", "leader"]),
    projectController.inviteMembers,
  );
projectRouter.post(
    "/confirmInvite/:projectId",
    authMiddleware.verifyToken,
    projectController.confirmInvite,
  );
projectRouter.delete(
    "/removeMember/:projectId/:removedUserId",
    authMiddleware.verifyToken,
    roleMiddleware("project",["admin", "leader"]),
    projectController.removeMember,
  );
projectRouter.post(
    "/join/:projectId",
    authMiddleware.verifyToken,
    projectController.joinProject,
  );
projectRouter.post(
    "/leave/:projectId",
    authMiddleware.verifyToken,
    projectController.leaveProject,
  );
projectRouter.post(
    "/assignAdmin/:projectId/:assignAdminUserId",
    authMiddleware.verifyToken,
    roleMiddleware("project",["admin", "leader"]),
    projectController.assignAdmin,
  );
projectRouter.post(
    "/removeAdmin/:projectId/:removeAdminUserId",
    authMiddleware.verifyToken,
    roleMiddleware("project",["admin", "leader"]),
    projectController.removeAdmin,
  );
export default projectRouter;