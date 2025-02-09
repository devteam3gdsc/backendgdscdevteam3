import projectServices from "../services/projectServices.mjs";
import { httpError } from "../utils/httpResponse.mjs";
const projectController = {
    createProject : async (req, res) => {
        try {
            const newProject = await projectServices.createProject(req.body, req.params.groupId, req.user.id);
            res.status(200).json(newProject);
        } catch (error) {
            if (error instanceof httpError)
                return res.status(error.statusCode).json(error.message);
            else return res.status(500).json(error);
        }
    },

    updateProject : async (req, res) => {
        try {
            const updatedProject = await projectServices.updateProject(req.params.projectId, req.body);
            console.log(updatedProject)
            res.status(200).json(updatedProject);
        } catch (error) {
            if (error instanceof httpError)
                return res.status(error.statusCode).json(error.message);
            else return res.status(500).json(error);
        }
    },

    deleteProject : async (req, res) => {
        try {
            const result = await projectServices.deleteProject(req.params.projectId);
            res.status(200).json({message: "Deleting project successfully"});
        } catch (error) {
            if (error instanceof httpError)
                return res.status(error.statusCode).json(error.message);
            else return res.status(500).json(error);
        }
    },

    getFullProjectData: async (req, res) => {
        try {
          const project = await projectServices.getFullProjectData(
            req.params.projectId,
            req.user.id,
          );
    
          res.status(200).json(project);
        } catch (error) {
          if (error instanceof httpError)
            return res.status(error.statusCode).json(error.message);
          else return res.status(500).json(error);
        }
      },
    
      inviteMembers : async (req, res) => {
        try {
          const project = await projectServices.inviteMembers(req.params.projectId, req.user.id, req.body.members);//{ "members": ["userId1", "userId2", "userId3"]
          res.status(200).json({ message:"Invite new member successfully"});
        } catch (error) {
          if (error instanceof httpError)
            return res.status(error.statusCode).json(error.message);
          else return res.status(500).json(error);
        }
      },
    
      confirmInvite : async (req, res) => { // accept // ?accept=true/false
        try {
          console.log(1)
          const confirm = await projectServices.confirmInvite(req.params.projectId, req.user.id, req.query.accept);
          res.status(200).json(confirm)
          
        } catch (error) {
          if (error instanceof httpError)
            return res.status(error.statusCode).json(error.message);
          else return res.status(500).json(error);
        }
      }, 
    
      removeMember : async (req, res) => {
        try {
          const project = await projectServices.removeMember(req.params.projectId, req.params.removedUserId);
          res.status(200).json({ message:"Delete member successfully"});
        } catch (error) {
          if (error instanceof httpError)
            return res.status(error.statusCode).json(error.message);
          else return res.status(500).json(error);
        }
      },
    
      joinProject : async (req, res) => {
        try {
          const project = await projectServices.joinProject(req.params.projectId, req.user.id);
          res.status(200).json({ message:"Join project successfully"});
        } catch (error) {
          if (error instanceof httpError)
            return res.status(error.statusCode).json(error.message);
          else return res.status(500).json(error);
        }
      },
    
      leaveProject : async (req, res) => {
        try {
          const project = await projectServices.leaveProject(req.params.projectId, req.user.id);
          res.status(200).json({ message:"leave project successfully"});
        } catch (error) {
          if (error instanceof httpError)
            return res.status(error.statusCode).json(error.message);
          else return res.status(500).json(error);
        }
      },
    
      assignAdmin : async (req, res) => {
        try {
          const project = await projectServices.assignAdmin(req.params.projectId, req.params.assignAdminUserId);
          res.status(200).json({ message:"assign admin project successfully"});
        } catch (error) {
          if (error instanceof httpError)
            return res.status(error.statusCode).json(error.message);
          else return res.status(500).json(error);
        }
      },
    
      removeAdmin : async (req, res) => {
        try {
          const project = await projectServices.removeAdmin(req.params.projectId, req.params.removeAdminUserId);
          res.status(200).json({ message:"Remove admin project successfully"});
        } catch (error) {
          if (error instanceof httpError)
            return res.status(error.statusCode).json(error.message);
          else return res.status(500).json(error);
        }
      },

};

export default projectController;