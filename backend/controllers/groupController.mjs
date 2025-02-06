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
};

export default groupController;
