import User from "../models/Users.mjs";
import findDocument from "../utils/findDocument.mjs";
import userServices from "../services/userServices.mjs";
import {httpError} from "../utils/httpResponse.mjs"
import Post from "../models/Posts.mjs";
import updateDocument from "../utils/updateDocument.mjs";
import mongoose, { mongo } from "mongoose";
const userController = {
  getUserBriefData: async (req, res) => {
    try {
      const user = await findDocument(User,
        {_id:req.params.userId},
        {_id:0,displayname:1,avatar:1,email:1}
      );
      const result = {user,followed:(await User.findOne({_id:req.user.id},{_id:0,following:1})).following.includes(req.params.userId)}
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof httpError) return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },
  //[GET] /user/publicInfo
  getUserPublicInfo: async (req, res) => {
    try {
      const user = await findDocument(User,
        {_id:req.params.userId},
        {_id:0,username:1,displayname:1,avatar:1,totalLikes:1,totalComments:1,story:1,email:1,totalPosts:1,totalFollowers:1,totalFollowing:1,createdAt:1}
      );
      console.log((await User.findOne({_id:req.user.id},{_id:0,following:1})).following.includes(req.params.userId));
      const resultWithFollowed = {user,followed:(await User.findOne({_id:req.user.id},{_id:0,following:1})).following.includes(req.params.userId)}
      return res.status(200).json(resultWithFollowed);
    } catch (error) {
      if (error instanceof httpError) return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },
  //[GET] /user/fullInfo
  getUserFullInfo: async (req, res) => {
    try {
      const result = await findDocument(User,
        {_id:req.user.id},
        {_id:1,displayname:1,email:1,avatar:1,username:1,totalLikes:1,totalComments:1,story:1,email:1,totalPosts:1,totalFollowers:1,totalFollowing:1,createdAt:1}
      );
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof httpError) return res.status(error.statusCode).json(error.message)
      else return res.status(500).json(error);
    }
  },
  //[PUT] /user/updateFull
  updateFullUserInfo: async (req, res) => {
    try {
      const userId = req.user.id;
      const result = await userServices.updateUserFullInfo(userId,req.file,req.body)
      return res.status(result.statusCode).json(result.message);
    } catch (error) {
      if (error instanceof httpError) return res.status(error.statusCode).json(error.message)
      else return res.status(500).json(error);
    }
  },
  //[PUT] /user/updatePassword
  updateUserPassword: async (req, res) => {
    try {
      const userId = req.user.id;
      const result = await userServices.updateUserPassword(userId,req.body.oldPassword,req.body.newPassword);
      return res.status(result.statusCode).json(result.message);
    } catch (error) {
      if (error instanceof httpError) return res.status(error.statusCode).json(error.message)
      else return res.status(500).json(error);
    }
  },
  test: async (req,res) => {
    try {
      const userId = req.user.id;
      const result = await findDocument(Post,2,{author:userId},{title:1})
      return res.status(200).json(result)
    } catch (error) {
      if (error instanceof httpError) return res.status(error.statusCode).json(error.message)
      else return res.status(500).json(error);
    }
  },
  follow: async (req,res) => {
    try {
      await updateDocument(User,1,[{_id:req.user.id}],[{$push:{following:req.params.userId}},{$inc:{totalFollowing:1}}])
      await updateDocument(User,1,[{_id:req.params.userId}],[{$inc:{totalFollowers:1}}])
      return res.status(200).json("followed!")
    } catch (error) {
      if (error instanceof httpError) return res.status(error.statusCode).json(error.message)
       else return res.status(500).json(error);
    }
  },
  unfollow: async (req,res) => {
    try {
      await updateDocument(User,1,[{_id:req.user.id}],[{$pull:{following:req.params.userId}},{$inc:{totalFollowing:-1}}])
      await updateDocument(User,1,[{_id:req.params.userId}],[{$inc:{totalFollowers:-1}}])
      return res.status(200).json("unfollowed!");
    } catch (error) {
      if (error instanceof httpError) return res.status(error.statusCode).json(error.message)
       else return res.status(500).json(error);
    }
  },
  getUsers: async (req,res)=>{
    try {
      const userId = new mongoose.Types.ObjectId(`${req.user.id}`)
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
      const matchData = [{_id:{$ne:userId}}];
      if (search){
        matchData.push({displayname:{$regex:search,$option:"i"}})
      }
      const result = await userServices.getUsers(matchData,sortValue,sortOrder,skip,limit);
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
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },
  addPin: async (req,res)=>{
    try {
      const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
      await userServices.addPin(userId,req.query);
      return res.status(200).json("pin added")
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  }
};
export default userController;
