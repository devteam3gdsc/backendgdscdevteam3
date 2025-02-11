import { Router } from "express";
import projectController from "../controllers/projectController.mjs";
import authMiddleware from "../middlewares/authMidleware.mjs";
import roleMiddleware from "../middlewares/roleMiddleware.mjs";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 } from "cloudinary";
import multer from "multer";


const storage = new CloudinaryStorage({
  cloudinary: v2,
  params: {
    folder: "User_avatar_files",
    resource_type: "image",
  },
});
const upload = multer({ storage });

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
    projectController.updateFull,
);
projectRouter.put(
  "/update/:projectId",
  authMiddleware.verifyToken,
  roleMiddleware("project",["leader", "admin"]),
  upload.single("avatar"),
  projectController.updateFull,
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