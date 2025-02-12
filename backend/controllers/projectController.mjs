import mongoose from "mongoose";
import projectServices from "../services/projectServices.mjs";
import { Project } from "../models/Group.mjs";
import { httpError } from "../utils/httpResponse.mjs";
import findDocument from "../utils/findDocument.mjs";
import userServices from "../services/userServices.mjs";
const projectController = {
    findProjects: async (req,res)=>{
        try {
            const userId = new mongoose.Types.ObjectId(`${req.user.id}`)
            const result = await projectServices.findProjects(userId,req.query)
            return res.status(200).json(result);
        } catch (error) {
            if (error instanceof httpError)
                return res.status(error.statusCode).json(error.message);
              else return res.status(500).json(error);
        }
    },
    getUsers: async (req,res)=>{
        try {
          const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
          const projectId = new mongoose.Types.ObjectId(`${req.params.projectId}`);
          const projectMembers = (await findDocument(Project,{_id:projectId},{_id:0,members:1})).members;
          const projectUsers = projectMembers.map((member)=>{return {_id:`${member.user}`,role:member.role}})
          const projectMembersId = projectMembers.map((member)=>{return new mongoose.Types.ObjectId(`${member.user}`)})
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
          const matchData = [{_id:{$ne:userId}},{_id:{$in:projectMembersId}}];
          if (search){
            matchData.push({displayname:{$regex:search,$option:"i"}})
          }
          const result = await userServices.getUsers(matchData,sortValue,sortOrder,skip,limit);
          const usersMap = new Map(result.users.map((user)=>[`${user._id}`,user]))
          const usersWithRole = projectUsers.map((user)=>{
            return {
              ...user,
              ...(usersMap.get(user._id)||{})
            }
          })
          const totalPages = Math.ceil(result.totalUsers/limit);
          const hasMore = totalPages - page > 0 ? true:false
          return res.status(200).json({
            users:usersWithRole,
            totalPages,
            currentPage:page,
            totalUsers:result.totalUsers,
            hasMore
          })
        } catch (error) {
          if (error instanceof httpError) return res.status(error.statusCode).json(error.message)
            else return res.status(500).json(error); 
        }
      },
    getProjectPosts: async (req,res)=>{
      const page = req.query.page || 1;
      const limit = req.query.limit || 5;
      const skip = (page - 1)*limit
      // if (req.query.tags){
        
      // }
    }
    
}

export default projectController