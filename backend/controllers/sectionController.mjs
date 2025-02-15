import mongoose from "mongoose";
import { Project, Section } from "../models/Groups.mjs";
import sectionServices from "../services/sectionServices.mjs";
import userServices from "../services/userServices.mjs";
import findDocument from "../utils/findDocument.mjs";
import User from "../models/Users.mjs";
const sectionController = {
  createSection: async (req, res) => {
    try {
      await sectionServices.createSection(req.body);
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },
  updateSection: async (req, res) => {
    try {
      const { sectionId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(sectionId)) {
        return res.status(400).json({ message: "Invalid section ID" });
      }
      const allowedFields = ["name", "description"];
      const updateData = Object.keys(req.body)
        .filter((key) => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = req.body[key];
          return obj;
        }, {});
      const result = await Section.findOneAndUpdate(
        { _id: sectionId },
        updateData,
        { new: true },
      );
      if (!result) {
        return res.status(404).json({ message: "Section not found" });
      }
      return res
        .status(200)
        .json({ message: "Section updated successfully", data: result });
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },
  deleteSection: async (req, res) => {
    try {
      const sectionId = new mongoose.Types.ObjectId(`${req.params.sectionId}`);
      const deleteResult = await Section.deleteOne({ _id: sectionId });
      if (deleteResult.deletedCount === 0) {
        return res.status(404).json("cant find the section!");
      }
      const parentSectionUpdate = await Section.updateMany(
        { children: { $in: sectionId } },
        { $pull: { children: sectionId } },
      );
      if (parentSectionUpdate.matchedCount === 0) {
        return res.status(404).json("cant find parent section!");
      }
      return res.status(200).json("section deleted!");
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },
  addParticipant: async (req, res) => {
    try {
      const sectionId = new mongoose.Types.ObjectId(`${req.params.sectionId}`);
      const usersId = req.body.usersId;
      const Ids = usersId.map((id)=>{return new mongoose.Types.ObjectId(`${id}`)})
      const section = await Section.findById(sectionId);
      const updateResult = await Section.updateMany(
        { _id: { $in: section.children } },
        { $push: { participants:{$each:Ids} } },
      );
      if (updateResult.matchedCount === 0) {
        return res.status(404).json("cant find section!");
      }
      section.participants.concat(usersId);
      await section.save();
      return res.status(200).json("participant added!");
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },
  removeParticipant: async (req, res) => {
    try {
      const sectionId = new mongoose.Types.ObjectId(`${req.params.sectionId}`);
      const userId = new mongoose.Types.ObjectId(`${req.params.userId}`);
      await sectionServices.removeUser(userId,sectionId);
      return res.status(200).json("User removed!")
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },
  getUsers: async (req, res) => {
    try {
      const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
      const sectionId = new mongoose.Types.ObjectId(`${req.params.sectionId}`);
      const section = await Section.findById(sectionId);
      if (!section) {
        return res.status(404).json("Invalid section Id!");
      }
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
        { _id: { $ne: userId } },
        { _id: { $in: section.participants } },
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
  getUninvitedUsers: async (req, res) => {
    try {
      const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
      const sectionId = new mongoose.Types.ObjectId(`${req.params.sectionId}`);
      const section = await Section.findById(sectionId);
      if (!section) {
        return res.status(404).json("Invalid section Id!");
      }
      const projectMembers = (
        await findDocument(
          Project,
          { _id: section.project },
          { members: 1, _id: 0 },
        )
      ).members;
      const projectMembersId = projectMembers.map((member) => {
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
        { _id: { $in: projectMembersId } },
        { _id: { $nin: section.participants } },
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
  getSectionsPosts: async (req, res) => {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 5;
      const search = req.query.search || "";
      const skip = (page - 1) * limit;
      const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
      const sectionId = new mongoose.Types.ObjectId(`${req.params.sectionId}`);
      const matchData = [{ section: sectionId, visibility: "public" }];
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
      const section = await findDocument(
        Section,
        { _id: sectionId },
        { name: 1, _id: 0 },
      );
      const me = await User.findById(userId);
      const newRecent = me.recent.filter((pin) => {
        return pin.name !== section.name;
      });
      newRecent.push({
        id: sectionId,
        recentType: "section",
        name: section.name,
        avatar: "",
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
  getSections: async (req,res)=>{
    try {
      const projectId = new mongoose.Types.ObjectId(`${req.params.projectId}`);
      const sections = await Section.find({project:projectId});
      return res.status(200).json(sections);
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  }
};

export default sectionController;
