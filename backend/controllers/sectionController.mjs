import mongoose from "mongoose";
import { Section } from "../models/Group.mjs";
import sectionServices from "../services/sectionServices.mjs";
import userServices from "../services/userServices.mjs";
const sectionController = {
    createSection: async (req,res)=>{
        try {
          await sectionServices.createSection(req.body);
        } catch (error) {
          if (error instanceof httpError)
            return res.status(error.statusCode).json(error.message);
          else return res.status(500).json(error);
        }
      },
    updateSection: async (req,res)=>{
        try {
            const { sectionId } = req.params;
            if (!mongoose.Types.ObjectId.isValid(sectionId)) {
                return res.status(400).json({ message: "Invalid section ID" });
            }
            const allowedFields = ["name", "description"];
            const updateData = Object.keys(req.body)
            .filter(key => allowedFields.includes(key))
            .reduce((obj, key) => {
                obj[key] = req.body[key];
                return obj;
            }, {});
            const result = await Section.findOneAndUpdate(
            { _id: sectionId },
            updateData,
            { new: true }
            );
            if (!result) {
                return res.status(404).json({ message: "Section not found" });
            }
            return res.status(200).json({ message: "Section updated successfully", data: result });
        } catch (error) {
            if (error instanceof httpError)
                return res.status(error.statusCode).json(error.message);
              else return res.status(500).json(error);
        }
    },
    deleteSection: async (req,res)=>{
        try {
            const sectionId = new mongoose.Types.ObjectId(`${req.params.sectionId}`);
            const deleteResult = await Section.deleteOne({_id:sectionId})
            if (deleteResult.deletedCount === 0){
                return res.status(404).json("cant find the section!")
            }
            const parentSectionUpdate = await Section.updateMany({children:{$in:sectionId}},{$pull:{children:sectionId}})
            if (parentSectionUpdate.matchedCount === 0){
                return res.status(404).json("cant find parent section!")
            }
            return res.status(200).json("section deleted!")
        } catch (error) {
            if (error instanceof httpError)
                return res.status(error.statusCode).json(error.message);
              else return res.status(500).json(error);
        }
    },
    addParticipant: async (req,res)=>{
        try {
            const sectionId = new mongoose.Types.ObjectId(`${req.params.sectionId}`);
            const userId = new mongoose.Types.ObjectId(`${req.params.userId}`);
            const section = await Section.findById(sectionId)
            const updateResult = await Section.updateMany({_id:{$in:section.children}},{$push:{participants:userId}});
            if (updateResult.matchedCount === 0){
                return res.status(404).json("cant find section!")
            }
            section.participants.push(userId);
            await section.save();
            return res.status(200).json("participant added!")
        } catch (error) {
            if (error instanceof httpError)
                return res.status(error.statusCode).json(error.message);
              else return res.status(500).json(error);
        }
    },
    removeParticipant: async (req,res)=>{
        try {
            const sectionId = new mongoose.Types.ObjectId(`${req.params.sectionId}`);
            const userId = new mongoose.Types.ObjectId(`${req.params.userId}`);
            const section = await Section.findById(sectionId)
            const updateResult = await Section.updateMany({_id:{$in:section.children}},{$pull:{participants:userId}});
            if (updateResult.matchedCount === 0){
                return res.status(404).json("cant find section!")
            }
            section.participants = section.participants.filter((participant)=>{return !participant.equals(userId)});
            await section.save();
            return res.status(200).json("participant removed!")
        } catch (error) {
            if (error instanceof httpError)
                return res.status(error.statusCode).json(error.message);
              else return res.status(500).json(error);
        }
    },
    getUsers: async (req,res)=>{
        try {
          const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
          const sectionId = new mongoose.Types.ObjectId(`${req.params.sectionId}`);
          const section = await Section.findById(sectionId);
          if (!section){
            return res.status(404).json("Invalid section Id!")
          }
          const page = req.query.page || 1;
          const limit = req.query.limit || 5;
          const skip = (page-1)*limit;
          const order = req.query.order || "descending";
          const criteria = req.query.criteria || "dateJoined";
          const search = req.query.search || ""
          switch (criteria){
            case "dateJoined":{
              var sortValue = "createdAt";
              break;
            }
            case "likes":{
              var sortValue = "totalLikes";
              break;
            }
            case "followers":{
              var sortValue = "totalFollowers";
              break;
            }
          };
          switch (order){
            case "descending":{
              var sortOrder = -1;
              break;
            }
            case "ascending":{
              var sortOrder = 1;
              break;
            }
          }
          const matchData = [{_id:{$ne:userId}},{_id:{$in:section.participants}}]
          if (search){
            matchData.push({displayname:{$regex:search,$option:"i"}})
          }
          const result = await userServices.getUsers(userId,matchData,sortValue,sortOrder,skip,limit);
          const totalPages = Math.ceil(result.totalUsers/limit);
          const hasMore = totalPages - page > 0 ? true:false
          return res.status(200).json({
            users:result.users,
            totalPages,
            currentPage:page,
            totalUsers:result.totalUsers,
            hasMore
          })
        } catch (error) {
          if (error instanceof httpError) return res.status(error.statusCode).json(error.message)
            else return res.status(500).json(error); 
        }
      }

}

export default sectionController
