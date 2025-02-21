import { Router } from "express";
import sectionController from "../controllers/sectionController.mjs";
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
projectRouter.get(
  "/find",
  authMiddleware.verifyToken,
  projectController.findProjects,
);
projectRouter.get(
  "/users/:projectId",
  authMiddleware.verifyToken,
  projectController.getUsers,
);
projectRouter.get(
  "/uninvitedUsers/:projectId",
  authMiddleware.verifyToken,
  projectController.getUninvitedUsers,
);
projectRouter.get(
  "/posts/:projectId",
  authMiddleware.verifyToken,
  projectController.getProjectPosts,
);
projectRouter.post(
  "/sectionCreate",
  authMiddleware.verifyToken,
  sectionController.createSection,
);
projectRouter.put(
  "/sectionUpdate/:sectionId",
  authMiddleware.verifyToken,
  sectionController.updateSection,
);
projectRouter.delete(
  "/sectionDelete/:sectionId",
  authMiddleware.verifyToken,
  sectionController.deleteSection,
);
projectRouter.post(
  "/section/:sectionId/addingParticipant/:userId",
  authMiddleware.verifyToken,
  sectionController.addParticipant,
);
projectRouter.get(
  "/section/:sectionId/removeParticipant/:userId",
  authMiddleware.verifyToken,
  sectionController.removeParticipant,
);
projectRouter.get(
  "/section/:sectionId/getUsers",
  authMiddleware.verifyToken,
  sectionController.getUsers,
);
projectRouter.get(
  "/section/:sectionId/getUninvitedUsers",
  authMiddleware.verifyToken,
  sectionController.getUninvitedUsers,
);
projectRouter.get(
  "/section/:sectionId",
  authMiddleware.verifyToken,
  sectionController.getSectionsPosts,
);
projectRouter.post(
    "/create/:groupId",
    authMiddleware.verifyToken,
    upload.single('avatar'),
    //roleMiddleware("group",["creator", "admin"]),
    projectController.createProject,
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

