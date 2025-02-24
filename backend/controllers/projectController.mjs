
import mongoose, { mongo } from "mongoose";
import projectServices from "../services/projectServices.mjs";
import { Group, Project } from "../models/Groups.mjs";
import User from "../models/Users.mjs";
import { httpError } from "../utils/httpResponse.mjs";
import findDocument from "../utils/findDocument.mjs";
import userServices from "../services/userServices.mjs";
import postServices from "../services/postServices.mjs";
import sectionServices from "../services/sectionServices.mjs";
const projectController = {
  findProjects: async (req, res) => {
    try {
      const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
      const result = await projectServices.findProjects(userId, req.query);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },
  // getUsers: async (req, res) => {
  //   try {
  //     const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
  //     const projectId = new mongoose.Types.ObjectId(`${req.params.projectId}`);
  //     const projectMembers = (
  //       await findDocument(Project, { _id: projectId }, { _id: 0, members: 1 })
  //     ).members;
  //     const projectUsers = projectMembers.map((member) => {
  //       return { _id: `${member.user}`, role: member.role };
  //     });
  //     const projectMembersId = projectMembers.map((member) => {
  //       return new mongoose.Types.ObjectId(`${member.user}`);
  //     });
  //     const page = req.query.page || 1;
  //     const limit = req.query.limit || 5;
  //     const skip = (page - 1) * limit;
  //     const order = req.query.order || "descending";
  //     const criteria = req.query.criteria || "dateJoined";
  //     const search = req.query.search || "";
  //     switch (criteria) {
  //       case "dateJoined": {
  //         var sortValue = "createdAt";
  //         break;
  //       }
  //       case "likes": {
  //         var sortValue = "totalLikes";
  //         break;
  //       }
  //       case "followers": {
  //         var sortValue = "totalFollowers";
  //         break;
  //       }
  //     }
  //     switch (order) {
  //       case "descending": {
  //         var sortOrder = -1;
  //         break;
  //       }
  //       case "ascending": {
  //         var sortOrder = 1;
  //         break;
  //       }
  //     }
  //     const matchData = [
  //       { _id: { $ne: userId } },
  //       { _id: { $in: projectMembersId } },
  //     ];
  //     if (search) {
  //       matchData.push({ displayname: { $regex: search, $options: "i" } });
  //     }
  //     const result = await userServices.getUsers(
  //       userId,
  //       matchData,
  //       sortValue,
  //       sortOrder,
  //       skip,
  //       limit,
  //     );
  //     if (result.totalUsers === 0){
  //       return res.status(200).json({
  //         users: [],
  //         totalPages:0,
  //         currentPage: page,
  //         totalUsers: 0,
  //         hasMore:false,
  //       })
  //     }
  //     const usersMap = new Map(
  //       result.users.map((user) => [`${user._id}`, user]),
  //     );
  //     const usersWithRole = projectUsers.map((user) => {
  //       return {
  //         ...user,
  //         ...(usersMap.get(user._id) || {}),
  //       };
  //     });
  //     console.log(result.totalUsers)
  //     const totalPages = Math.ceil(result.totalUsers / limit);
  //     const hasMore = totalPages - page > 0 ? true : false;
  //     return res.status(200).json({
  //       users: usersWithRole,
  //       totalPages,
  //       currentPage: page,
  //       totalUsers: result.totalUsers,
  //       hasMore,
  //     });
  //   } catch (error) {
  //     if (error instanceof httpError)
  //       return res.status(error.statusCode).json(error.message);
  //     else return res.status(500).json(error);
  //   }
  // },
  getUsers: async (req, res) => {
    try {
      const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
      const projectId = new mongoose.Types.ObjectId(`${req.params.projectId}`);
      const projectMembers = (
        await findDocument(Project, { _id: projectId }, { _id: 0, members: 1 })
      ).members;
      const projectUsers = projectMembers.map((member) => {
        return { _id: `${member.user}`, role: member.role };
      });
      const projectMembersId = projectMembers.map((member) => {
        return new mongoose.Types.ObjectId(`${member.user}`);
      });
      const page = req.query.page || 1;
      const limit = req.query.limit || 5;
      const skip = (page - 1) * limit;
      const order = req.query.order || "descending";
      const criteria = req.query.criteria || "dateJoined";
      const search = req.query.search || "";
      switch (criteria) {
        case "dateJoined": {
          var sortValue = "createdAt";
          break;
        }
        case "likes": {
          var sortValue = "totalLikes";
          break;
        }
        case "followers": {
          var sortValue = "totalFollowers";
          break;
        }
      }
      switch (order) {
        case "descending": {
          var sortOrder = -1;
          break;
        }
        case "ascending": {
          var sortOrder = 1;
          break;
        }
      }
      const matchData = [
        { _id: { $in: projectMembersId } },
      ];
      if (search) {
        matchData.push({ displayname: { $regex: search, $option: "i" } });
      }
      const result = await userServices.getUsers(
        userId,
        matchData,
        sortValue,
        sortOrder,
        skip,
        limit,
      );
      if (result.totalUsers === 0){
        return res.status(200).json({
          users: [],
          totalPages:0,
          currentPage: page,
          totalUsers: 0,
          hasMore:false,
        })
      }
      const usersMap = new Map(
        result.users.map((user) => [`${user._id}`, user]),
      );
      const usersWithRole = projectUsers.map((member) => {
        return {
          ...member,
          ...(usersMap.get(member._id) || {}),
        };
      });
      const totalPages = Math.ceil(result.totalUsers / limit);
      if (page > totalPages) {
        return res.status(200).json({
          users: [],
          totalPages,
          currentPage: page,
          totalUsers: result.totalUsers,
          hasMore: false,
        });
      }
      const hasMore = totalPages - page > 0 ? true : false;
      return res.status(200).json({
        users: usersWithRole,
        totalPages,
        currentPage: page,
        totalUsers: result.totalUsers,
        hasMore,
      });
        } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },

  getProjectPosts: async (req, res) => {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 5;
      const search = req.query.search || "";
      const skip = (page - 1) * limit;
      const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
      const projectId = new mongoose.Types.ObjectId(`${req.params.projectId}`);
      const matchData = [{ project: projectId, visibility: "public" }];
      if (req.query.tags) {
        const tags = req.query.tags.split(",");
        matchData.push({ tags: { $all: tags } });
      }
      if (req.query.status) {
        matchData.push({ status: req.query.status });
      } else matchData.push({ status: "approved" });
      if (search) {
        matchData.push({ title: { $regex: search, $options: "i" } });
      }
      const result = await postServices.getPosts(
        userId,
        { $and: [...matchData] },
        req.query.criteria,
        req.query.order,
        skip,
        limit,
      );
      const project = await findDocument(
        Project,
        { _id: projectId },
        { avatar: 1, name: 1, _id: 0 },
      );
      const me = await User.findById(userId);
      const newRecent = me.recent.filter((pin) => {
        return pin.name !== project.name;
      });
      newRecent.push({
        id: projectId,
        pinType: "project",
        name: project.name,
        avatar: project.avatar,
      });
      if (newRecent.length > 3) {
        newRecent.shift();
      }
      me.recent = newRecent;
      await me.save();
      if (!result.posts[0]) {
        return res.status(200).json({
          posts: [],
          currentPage: page,
          totalPages: 1,
          totalPosts: 0,
          hasMore: false,
        });
      }
      const totalPages = Math.ceil(result.totalPosts / limit);
      const hasMore = totalPages - page > 0 ? true : false;
      return res.status(200).json({
        posts: result.posts,
        currentPage: page,
        totalPages,
        totalPosts: result.totalPosts,
        hasMore,
      });
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },
  getUninvitedUsers: async (req, res) => {
    try {
      const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
      const projectId = new mongoose.Types.ObjectId(`${req.params.projectId}`);
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json("Invalid projectId");
      }
      const groupMembers = (
        await findDocument(
          Group,
          { _id: project.group },
          { members: 1, _id: 0 },
        )
      ).members;
      if (!groupMembers) {
        return res.status(404).json("cant find group");
      }
      const projectMembersId = project.members.map((member) => {
        return member.user;
      });
      const groupMembersId = groupMembers.map((member) => {
        return member.users;
      });
      const page = req.query.page || 1;
      const limit = req.query.limit || 5;
      const skip = (page - 1) * limit;
      const order = req.query.order || "descending";
      const criteria = req.query.criteria || "dateJoined";
      const search = req.query.search || "";
      switch (criteria) {
        case "dateJoined": {
          var sortValue = "createdAt";
          break;
        }
        case "likes": {
          var sortValue = "totalLikes";
          break;
        }
        case "followers": {
          var sortValue = "totalFollowers";
          break;
        }
      }
      switch (order) {
        case "descending": {
          var sortOrder = -1;
          break;
        }
        case "ascending": {
          var sortOrder = 1;
          break;
        }
      }
      const matchData = [
        { _id: { $in: groupMembersId } },
        { _id: { $nin: projectMembersId } },
      ];
      if (search) {
        matchData.push({ displayname: { $regex: search, $options: "i" } });
      }
      const result = await userServices.getUsers(
        userId,
        matchData,
        sortValue,
        sortOrder,
        skip,
        limit,
      );
      const totalPages = Math.ceil(result.totalUsers / limit);
      const hasMore = totalPages - page > 0 ? true : false;
      return res.status(200).json({
        users: result.users,
        totalPages,
        currentPage: page,
        totalUsers: result.totalUsers,
        hasMore,
      });
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },
    createProject : async (req, res) => {
        try {
            const groupId = new mongoose.Types.ObjectId(`${req.params.groupId}`);
            const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
            const avatarFile = req.file;
            const project = await projectServices.createProject(req.body,avatarFile, groupId, userId);
            return res.status(200).json(project);
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
    updateFull: async (req, res) => {
      try {
        const projectId = req.params.projectId;
        const result = await projectServices.updateProjectFull(
          projectId,
          req.file,
          req.body,
        );
        return res.status(result.statusCode).json(result.message);
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
          await projectServices.leaveProject(req.params.projectId, req.user.id);
          return res.status(200).json({ message:"leave project successfully"});
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

