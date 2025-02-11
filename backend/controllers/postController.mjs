import postServices from "../services/postServices.mjs";
import Comments from "../models/Comments.mjs";
import Post from "../models/Posts.mjs";
import User from "../models/Users.mjs";
import mongoose from "mongoose";
import { v2 } from "cloudinary";
import { httpError } from "../utils/httpResponse.mjs";
import findDocument from "../utils/findDocument.mjs";
import updateDocument from "../utils/updateDocument.mjs";
import { fileDestroy, getFiles } from "../utils/filesHelper.mjs";
import { edit } from "@cloudinary/url-gen/actions/animated";
const postController = {
  //[GET] /me?page=...&limit=...&search=...&type=...
  getUserPost: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const search = req.query.search || "";
      const skip = (page - 1) * limit;
      const type = req.query.type || "me";
      const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
      let matchData = [];
      if (type == "me") {
        matchData.push({ author: userId });
      } else matchData.push({ stored: { $in: [userId] } });
      if (req.query.tags) {
        const tags = req.query.tags.split(",");
        matchData.push({ tags: { $all: tags } });
      }
      if (search) {
        matchData.push({ title: { $regex: search, $options: "i" } });
      }
      const result = await postServices.getPosts(
        userId,
        { $and: [...matchData] },
        req.query.criteria,
        req.query.order,
        skip,
        limit
      );
      const totalPages = Math.ceil(result.totalPosts / limit);
      const hasMore = totalPages - page > 0 ? true : false;
      res.status(200).json({
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
  
  //[POST] /post/create
  createPost: async (req, res) => {
    try {
      const newPostId = await postServices.createPost(
        req.user.id,
        req.body,
        req.files
      );
      await updateDocument(User,1,[{_id:req.user.id}],[{$inc:{totalPosts:1}}]);
      return res.status(200).json({
        message: "Post created successfully!",
        postId: newPostId,
      });
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },
  //[GET] /community?page=...&limit=...&search=...
  getCommunityPosts: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const search = req.query.search || "";
      const skip = (page - 1) * limit;
      const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
      let matchData = [{ visibility: "public" }];
      if (req.query.tags) {
        const tags = req.query.tags.split(",");
        matchData.push({ tags: { $all: tags } });
      }
      if (search) {
        matchData.push({ title: { $regex: search, $options: "i" } });
      }
      const result = await postServices.getPosts(
        userId,
        { $and: [...matchData] },
        req.query.criteria,
        req.query.order,
        skip,
        limit
      );
      const totalPages = Math.ceil(result.totalPosts / limit);
      const hasMore = totalPages - page > 0 ? true : false;
      res.status(200).json({
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
  //[GET] /post/store/:postId
  storePost: async (req, res) => {
    //cần xem lại, nếu người đó là tác giả hay đã từng lưu?,làm cho ẩn đi khi gửi
    try {
      await updateDocument(Post,1,[{_id:req.params.postId}], [{ $push: { stored: req.user.id} }]);
      return res.status(200).json("saved!");
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },
  //[GET] /post/detail/:postId
  detailPost: async (req, res) => {
    //thieu gioi han comment
    try {
      const postId = new mongoose.Types.ObjectId(`${req.params.postId}`);
      const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
      const post = await Post.aggregate([
        { $match: { _id: postId } },
        {
          $addFields: {
            Stored: { $in: [userId, "$stored"] },
            Liked: { $in: [userId, "$likes"] },
            isAuthor: { $eq: ["$author", userId] },
          },
        },
      ]);
      return res.status(200).json({
        post,
      });
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },
  // /post/delete/:postId
  deletePost: async (req, res) => {
    try {
      const userId = req.user.id;
      const postId = req.params.postId;
      const post = await findDocument(Post,{author:userId,_id:postId},{})
      const urls = post.files;
      await fileDestroy(urls,"raw");
      await post.deleteOne();
      await updateDocument(User,1,[{_id:req.user.id}],[{$inc:{totalPosts:-1}}]);
      await Comments.deleteMany({ postId: postId });
      return res.status(200).json("Post delete successfully!");
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },
  // /post/edit/:postId
  editPost: async (req, res) => {
    try {
      const userId = req.user.id;
      const postId = req.params.postId;
      const result = await postServices.editPost(userId,postId,req.body,req.files);
      return res.status(result.statusCode).json(result.message)
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },
  //[GET] /post/like/:postId
  likePost: async (req, res) => {
    try {
      const userId = new mongoose.Types.ObjectId(`${req.user.id}`)
      const post = await Post.findOneAndUpdate({_id:req.params.postId},{$push:{likes:userId},$inc:{totalLikes:1}},{new:false});
      await updateDocument(User,1,[{_id:post.author}],[{$inc:{totalLikes:1}}]);
      return res.status(200).json("liked!");
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },
  //[GET] /post/unlike/:postId
  unLikePost: async (req, res) => {
    try {
      const post = await Post.findOneAndUpdate({_id:req.params.postId},{
      $pull: { likes:req.user.id},
      $inc: { totalLikes: -1 }
    },{new:false});
      await updateDocument(User,1,[{_id:post.author}],[{$inc:{totalLikes:-1}}]);
      return res.status(200).json("unliked");
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },
  //[GET] /post/unstored/:postId
  unStorePost: async (req, res) => {
    try {
      await updateDocument(Post,1,[{_id:req.params.postId}], [{ $pull: { stored: req.user.id } }]);
      return res.status(200).json("unstored!");
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },
  setState: async (req,res) => {
    try {
      const state = req.query.state;
      await updateDocument(Post,1,[{_id:req.params.postId,author:req.user.id}],[{$set:{visibility:state}}])
      return res.status(200).json("State set!");
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },
  halfDetail: async (req, res) => {
    try {
      const postId = new mongoose.Types.ObjectId(`${req.params.postId}`);
      const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
      const post = await Post.aggregate([
        { $match: { _id: postId } },
        {
          $addFields: {
            Stored: { $in: [userId, "$stored"] },
            Liked: { $in: [userId, "$likes"] },
            isAuthor: { $eq: ["$author", userId] },
          },
        },
      ]);
      const {title,content,authorname,avatar,...data} = post[0]
      return res.status(200).json({
        title,
        content,
        authorname,
        avatar
      });
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },
  //[GET] /following?page=...&limit=...&search=...
  getFeedPosts: async (req,res) => {
    try {
    const page = parseInt(req.query.page)||1;
    const limit = parseInt(req.query.limit)||5;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;
    const following = (await findDocument(User,{_id:req.user.id},{following:1,_id:0})).following
    console.log(following)
    const matchData = [{author:{$in:following}},{visibility:"public"}]
    if (search) {
      matchData.push({ title: { $regex: search, $options: "i" } });
    }
    const result = await postServices.getPosts(req.user.id,{$and:[...matchData]},req.query.criteria,req.query.order,skip,limit);
    const totalPages = Math.ceil(result.totalPosts / limit);
    const hasMore = totalPages - page > 0 ? true : false;
    res.status(200).json({
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
  getAnotherUserPost: async (req,res) =>{
    try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 5;
    const skip = (page - 1)*limit
    const search = req.query.search || "";
    const authorId = new mongoose.Types.ObjectId(`${req.params.userId}`)
    const matchData = [{author:authorId},{visibility:"public"}]
    if (search){
      matchData.push({title:{$regex:search,$options:"i"}})
    }
    console.log(matchData)
    const result = await postServices.getPosts(req.user.id,{$and:[...matchData]},req.query.criteria,req.query.order,skip,limit);
    console.log(result)
    const totalPages = result.totalPosts?Math.ceil(result.totalPosts / limit):0;
    const hasMore = totalPages - page > 0 ? true : false;
    res.status(200).json({
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
  }
};
export default postController;
