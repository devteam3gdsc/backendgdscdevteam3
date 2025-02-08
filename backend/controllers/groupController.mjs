import { httpError } from "../utils/httpResponse.mjs";
import groupServices from "../services/groupServices.mjs";

const groupController = {
  createGroup: async (req, res) => {
    try {
      const newGroup = await groupServices.createGroup(req.body, req.user.id);
      res.status(201).json(newGroup);
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
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

  updateGroup: async (req, res) => {
    try {
      const updatedGroup = await groupServices.updateGroup(
        req.params.groupId,
        req.body,
      );
      res.status(200).json(updatedGroup);
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },

  deleteGroup: async (req, res) => {
    try {
      const result = await groupServices.deleteGroup(req.params.groupId);
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },

  getFullGroupData: async (req, res) => {
    try {
      console.log(req.params.groupId, req.user.id);
      const group = await groupServices.getFullGroupData(
        req.params.groupId,
        req.user.id,
      );

      res.status(200).json(group);
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },

  inviteMembers : async (req, res) => {
    try {
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
      const confirm = await groupServices.confirmInvite(req.params.groupId, req.user.id, req.query.accept);
      res.status(200).json(confirm)
      
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  }, 

  removeMember : async (req, res) => {
    try {
      const group = await groupServices.removeMember(req.params.groupId, req.params.removedUserId);
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
      const group = await groupServices.leaveGroup(req.params.groupId, req.user.id);
      res.status(200).json({ message:"leave group successfully"});
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },

  assignAdmin : async (req, res) => {
    try {
      const group = await groupServices.assignAdmin(req.params.groupId, req.params.assignAdminUserId);
      res.status(200).json({ message:"assign admin group successfully"});
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },

  removeAdmin : async (req, res) => {
    try {
      const group = await groupServices.removeAdmin(req.params.groupId, req.params.removeAdminUserId);
      res.status(200).json({ message:"Remove admin group successfully"});
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },

  assignCreator : async (req, res) => {
    try {
      const group = await groupServices.assignCreator(req.params.groupId, req.params.assignCreatorUserId);
      res.status(200).json({ message:"assign creator group successfully"});
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },


};

export default groupController;
