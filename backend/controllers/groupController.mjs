
import { httpError, httpResponse } from "../utils/httpResponse.mjs";
import groupServices from "../services/groupServices.mjs";
import mongoose from "mongoose";
import postServices from "../services/postServices.mjs";
import findDocument from "../utils/findDocument.mjs";
import { Group, Project } from "../models/Groups.mjs";
import userServices from "../services/userServices.mjs";
import User from "../models/Users.mjs";


const groupController = {
  createGroup: async (req, res) => {
    try {
        const avatarFile = req.file; // Lấy file avatar từ request (nếu có)
        const newGroup = await groupServices.createGroup(req.body, req.user.id, avatarFile);
        return res.status(201).json(newGroup);
    } catch (error) {
        if (error instanceof httpError) {
            return res.status(error.statusCode).json(error.message);
        } else {
            return res.status(500).json(error.message);
        }
    }
},

  getGroupsByUserId: async (req, res) => {
    try {
      const groups = await groupServices.getGroupsByUserId(req.user.groupId);
      res.status(200).json(groups);
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },
  
  findGroups: async (req, res) => {
    try {
      const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
      const result = await groupServices.findGroups(userId, req.query);
      return res.status(200).json(result);
      } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },
  updateGroup: async (req, res) => {
    try {
      await groupServices.updateGroup(
        req.params.groupId,
        req.body,
        req.user.id,
      );
      return res.status(200).json("updated success");

    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },

  getGroupPosts: async (req, res) => {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 5;
      const search = req.query.search || "";
      const skip = (page - 1) * limit;
      const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
      const groupId = new mongoose.Types.ObjectId(`${req.params.groupId}`);
      const matchData = [{ group: groupId, visibility: "public", project:null,section:null }];
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
      
      const group = await findDocument(
        Group,
        { _id: groupId },
        { avatar: 1, name: 1, _id: 0 },
      );
      const me = await User.findById(userId);
      console.log(1);
      const newRecent = me.recent.filter((pin) => {
        return pin.name !== group.name;
      });
      newRecent.push({
        id: groupId,
        pinType: "group",
        name: group.name,
        avatar: group.avatar,
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

  updateFull: async (req, res) => {
    try {
      const groupId = req.params.groupId;
      const result = await groupServices.updateGroupFull(
        req.user.id,
        groupId,
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

  getUsers: async (req, res) => {
    try {
      const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
      const groupId = new mongoose.Types.ObjectId(`${req.params.groupId}`);
      const groupMembers = (
        await findDocument(Group, { _id: groupId }, { _id: 0, members: 1 })
      ).members;
      const groupUsers = groupMembers.map((member) => {
        return { _id: `${member.user}`, role: member.role };
      });
      const groupMembersId = groupMembers.map((member) => {
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
        { _id: { $in: groupMembersId } },
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
      const usersWithRole = groupUsers.map((member) => {
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


  deleteGroup: async (req, res) => {
    try {
      const result = await groupServices.deleteGroup(req.params.groupId, req.user.id);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },

  getFollowedUserNotInGroup: async (req, res) => {
    try {
      const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
      const groupId = new mongoose.Types.ObjectId(`${req.params.groupId}`);
      const groupMembers = (
        await findDocument(Group, { _id: groupId }, { members: 1, _id: 0 })
      ).members;
      const following = (
        await findDocument(User, { _id: userId }, { following: 1, _id: 0 })
      ).following;
      const groupMembersId = groupMembers.map((mem) => mem.user);
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
        { _id: { $in: following } },
        { _id: { $nin: groupMembersId } },
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


  getFullGroupData: async (req, res) => {
    try {
      const group = await groupServices.getFullGroupData(
        req.params.groupId,
        req.user.id,
      );
       return res.status(200).json(group);
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },

  getUserNotInGroup: async (req, res) => {
    try {
      const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
      const groupId = new mongoose.Types.ObjectId(`${req.params.groupId}`);
      const groupMembers = (
        await findDocument(Group, { _id: groupId }, { members: 1, _id: 0 })
      ).members;
      const groupMembersId = groupMembers.map((mem) => mem.user);
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
      const matchData = [{ _id: { $nin: groupMembersId } }];
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


  inviteMembers : async (req, res) => {
    try {
      console.log(1)
      const group = await groupServices.inviteMembers(req.params.groupId, req.user.id, req.body.members);//{ "members": ["userId1", "userId2", "userId3"]
      console.log(group)
      res.status(200).json({ message:"Invite new member successfully"});
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },


  confirmInvite : async (req, res) => { // accept // ?accept=true/false
    try {
      const groupId = new mongoose.Types.ObjectId(`${req.params.groupId}`)
      const confirm = await groupServices.confirmInvite(groupId,req.user.id , req.query.accept);
      res.status(200).json(confirm)
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  }, 

  removeMember : async (req, res) => {
    try {
      const group = await groupServices.removeMember(req.params.groupId, req.params.removedUserId, req.user.id);
      res.status(200).json({ message:"Delete member successfully"});
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },

  joinGroup : async (req, res) => {
    try {
      const group = await groupServices.joinGroup(req.params.groupId, req.user.id);
      res.status(200).json({ message:"Join group successfully"});
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },

  leaveGroup : async (req, res) => {
    try {
      await groupServices.leaveGroup(req.params.groupId, req.user.id);
      return res.status(200).json({ message:"leave group successfully"});
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },

  assignAdmin : async (req, res) => {
    try {
      const group = await groupServices.assignAdmin(req.params.groupId, req.params.assignAdminUserId, req.user.id);
      res.status(200).json({ message:"assign admin group successfully"});
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },

  removeAdmin : async (req, res) => {
    try {
      const group = await groupServices.removeAdmin(req.params.groupId, req.params.removeAdminUserId, req.user.id);
      res.status(200).json({ message:"Remove admin group successfully"});
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },

  assignCreator : async (req, res) => {
    try {
      const group = await groupServices.assignCreator(req.params.groupId, req.params.assignCreatorUserId, req.user.id);
      res.status(200).json({ message:"assign creator group successfully"});
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },
  getPublicGroupData: async (req,res) => {
    try {
      const groupId = new mongoose.Types.ObjectId(`${req.params.groupId}`);
      const Data = await Group.findOne({_id:groupId},{name:1,avatar:1});
      if (!Data){
        return res.status(404).json("cant find group")
      }
      return res.status(200).json(Data)
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  }


};

export default groupController;
