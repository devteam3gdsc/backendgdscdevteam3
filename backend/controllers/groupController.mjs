import { httpError,httpResponse } from "../utils/httpResponse.mjs";
import groupServices from "../services/groupServices.mjs";
import mongoose from "mongoose";
import postServices from "../services/postServices.mjs";
import findDocument from "../utils/findDocument.mjs";
import { Group } from "../models/Group.mjs";
import userServices from "../services/userServices.mjs";
import User from "../models/Users.mjs";
import { microwave } from "@cloudinary/url-gen/qualifiers/focusOn";

const groupController = {
    createGroup: async (req, res) => {
        try {
          const newGroup = await groupServices.createGroup(req.body, req.user.id);
          return res.status(201).json(newGroup);
        } catch (error) {
          if (error instanceof httpError)
            return res.status(error.statusCode).json(error.message);
          else return res.status(500).json(error);
        }
      },
      findGroups: async (req,res) =>{
        try {
            const userId = new mongoose.Types.ObjectId(`${req.user.id}`)
            const result = await groupServices.findGroups(userId,req.query);
            return res.status(200).json(result);
        } catch (error) {
            if (error instanceof httpError)
                return res.status(error.statusCode).json(error.message);
              else return res.status(500).json(error);
        }
        },
        getGroupPosts: async (req,res) =>{
          try {
              const page = req.query.page || 1;
              const limit = req.query.limit || 5;
              const search = req.query.search || "";
              const skip = (page-1)*limit;
              const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
              const groupId = new mongoose.Types.ObjectId(`${req.params.groupId}`);
              const matchData = [{group:groupId,visibility:"public"}]
              if (req.query.tags) {
                const tags = req.query.tags.split(",");
                matchData.push({ tags: { $all: tags } });
              }
              if (req.query.status){
                matchData.push({status:req.query.status})
              }
              else matchData.push({status:"approved"})
              if (search){
                matchData.push({title:{$regex:search,$options:"i"}})
              }
              const result = await postServices.getPosts(userId,{$and:[...matchData]},req.query.criteria,req.query.order,skip,limit);
              const group = await findDocument(Group,{_id:groupId},{avatar:1,name:1,_id:0});
              const me = await User.findById(userId);
              const newRecent = me.recent.filter((pin)=>{return pin.name !== group.name});
              newRecent.push({
                id:groupId,
                recentType:"group",
                name: group.name,
                avatar:group.avatar
              });
              if (newRecent.length > 3){
                newRecent.shift();
              }
              me.recent = newRecent;
              await me.save();
              if (!result.posts[0]){
                return res.status(200).json({
                  posts: [],
                  currentPage: page,
                  totalPages: 1,
                  totalPosts: 0,
                  hasMore: false,
                })
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
      getUsers: async (req,res)=>{
              try {
                const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
                const groupId = new mongoose.Types.ObjectId(`${req.params.groupId}`);
                const groupMembers = (await findDocument(Group,{_id:groupId},{_id:0,members:1})).members
                const groupUsers = groupMembers.map((member)=>{return {_id:`${member.user}`,role:member.role}})
                const groupMembersId = groupMembers.map((member)=>{return new mongoose.Types.ObjectId(`${member.user}`)})
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
                const matchData = [{_id:{$ne:userId}},{_id:{$in:groupMembersId}}]
                if (search){
                  matchData.push({displayname:{$regex:search,$option:"i"}})
                }
                const result = await userServices.getUsers(matchData,sortValue,sortOrder,skip,limit);
                const usersMap = new Map(result.users.map((user)=>[`${user._id}`,user]));
                const usersWithRole = groupUsers.map((member)=>{return {
                  ...member,
                  ...(usersMap.get(member._id)||{})
                }})
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
            }  

}

export default groupController;