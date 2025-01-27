import User from "../models/Users.mjs";
import findDocument from "../utils/findDocument.mjs";
import userServices from "../services/userServices.mjs";
import {httpError} from "../utils/httpResponse.mjs"
import Post from "../models/Posts.mjs";
import authController from "./authcontroller.mjs";
import updateDocument from "../utils/updateDocument.mjs";
const userController = {
  //[GET] /user/publicInfo
  getUserPublicInfo: async (req, res) => {
    try {
      const result = await findDocument(User,
        {_id:req.params.userId},
        {_id:0,displayname:1,avatar:1,totalLikes:1,totalComments:1,story:1,contactLinks:1,totalPosts:1}
      );
      return res.status(200).json(result);
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
        {_id:0,displayname:1,email:1,avatar:1,username:1,totalLikes:1,totalComments:1,story:1,contactLinks:1,totalPosts:1}
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
  }
};
export default userController;
