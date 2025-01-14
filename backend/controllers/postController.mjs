import postServices from "../services/postServices.mjs";
import Comments from "../models/Comments.mjs";
import Post from "../models/Posts.mjs";
import User from "../models/Users.mjs";
import mongoose from "mongoose";
import { v2 } from "cloudinary";
const postController = {
  //[GET] /me?page=...&limit=...&search=...&type=...
  getUserPost: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const search = req.query.search || ""; 
      const skip = (page - 1) * limit;
      const type = req.query.type ||"me";
      const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
      let matchData = [];
      if (type == "me"){
        matchData.push({author:userId})
      }
      else matchData.push({stored:{$in:[userId]}});
      if (req.query.tags){
        const tags = req.query.tags.split(",");
        matchData.push({ tags: { $all: tags }});
      }
      if (search){
        matchData.push({ title: { $regex: search, $options: "i" }})
      }
      const result = await postServices.getPosts(userId,{$and:[...matchData]},req.query.criteria,req.query.order,skip,limit)
      const totalPages = Math.ceil(result.totalPosts / limit);
      const hasMore = totalPages - page > 0 ? true : false;
      res.status(200).json({
        posts:result.posts,
        currentPage: page,
        totalPages,
        totalPosts:result.totalPosts,
        hasMore,
      });
    } catch (error) {
      if (error instanceof httpError) return res.status(error.statusCode).json(error.message)
      else return res.status(500).json(error);
    }
  },
  // /post/create
  createPost: async (req, res) => {
    try {
      const newPostId = await postServices.createPost(req.user.id,req.body,req.files)
      return res.status(200).json({
        message: "Post created successfully!",
        postId: newPostId,
      });
    } catch (error) {
      if (error instanceof httpError) return res.status(error.statusCode).json(error.message)
      else return res.status(500).json(error);
    }
  },
  // /community?page=...&limit=...&search=...
  getCommunityPosts: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const search = req.query.search || ""; 
      const skip = (page - 1) * limit;
      const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
      let matchData = [{visibility:"public"}];
      if (req.query.tags){
        const tags = req.query.tags.split(",");
        matchData.push({ tags: { $all: tags }});
      }
      if (search){
        matchData.push({ title: { $regex: search, $options: "i" }})
      }
      const result = await postServices.getPosts(userId,{$and:[...matchData]},req.query.criteria,req.query.order,skip,limit)
      const totalPages = Math.ceil(result.totalPosts / limit);
      const hasMore = totalPages - page > 0 ? true : false;
      res.status(200).json({
        posts:result.posts,
        currentPage: page,
        totalPages,
        totalPosts:result.totalPosts,
        hasMore,
      });
    } catch (error) {
      if (error instanceof httpError) return res.status(error.statusCode).json(error.message)
      else return res.status(500).json(error);
    }
  },
  storePost: async (req, res) => {
    //cần xem lại, nếu người đó là tác giả hay đã từng lưu?,làm cho ẩn đi khi gửi
    try {
      const userId = req.user.id;
      const postId = req.params.postId;
      await Post.findByIdAndUpdate(postId, { $push: { stored: userId } });
      return res.status(200).json("saved!");
    } catch (error) {
      if (error instanceof httpError) return res.status(error.statusCode).json(error.message)
      else return res.status(500).json(error);
    }
  },
  //detail/:postId
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
      if (error instanceof httpError) return res.status(error.statusCode).json(error.message)
      else return res.status(500).json(error);
    }
  },
  // /post/delete/:postId
  deletePost: async (req, res) => {
    try {
      const userId = req.user.id;
      const postId = req.params.postId;
      const post = await Post.findOne({ author: userId, _id: postId });
      if (!post) {
        return res.status(403).json("You are not the author of the post");
      }
      const urls = post.files;
      const publicIds = urls.map((url) => {
        const URLparts = url.fileUrl.split("/");
        const URLlastPart = URLparts[URLparts.length - 1].split(".");
        const anotherURL = URLlastPart[0];
        const publicId = URLparts[URLparts.length - 2] + "/" + anotherURL;
        return publicId;
      });
      for (const publicId of publicIds) {
        try {
          await v2.uploader.destroy(publicId, { resource_type: "raw" });
        } catch (error) {
          return res.status(500).json(error);
        }
      }
      await post.deleteOne();
      await Comments.deleteMany({ postId: postId });
      return res.status(200).json("Post delete successfully!");
    } catch (error) {
      res.status(500).json(error);
    }
  },
  // /post/edit/:postId
  editPost: async (req, res) => {
    try {
      const userId = req.user.id;
      const postId = req.params.postId;
      const { title, content } = req.body;
      const codeFiles = req.files["code_files"];
      const files = codeFiles.map((file) => {
        return {
          fileName: file.originalname,
          fileUrl: file.path,
        };
      });
      const post = await Post.updateOne(
        { author: userId, _id: postId },
        {
          $set: {
            title: title,
            content: content,
            files: files,
            editedAt: Date.now(),
          },
        }
      );
      if (post.matchedCount === 0) {
        return res.status(403).json("You are not the author of the post");
      } else return res.status(200).json("Post edited successfully!");
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  // /post/like/:postId
  likePost: async (req, res) => {
    try {
      const userId = req.user.id;
      const postId = req.params.postId;
      await Post.findByIdAndUpdate(postId, {
        $addToSet: { likes: userId },
        $inc: { totalLikes: 1 },
      });
      return res.status(200).json("liked!");
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  // /post/unlike/:postId
  unLikePost: async (req, res) => {
    try {
      const userId = req.user.id;
      const postId = req.params.postId;
      await Post.findByIdAndUpdate(postId, {
        $pull: { likes: userId },
        $inc: { totalLikes: -1 },
      });
      return res.status(200).json("unliked!");
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  // /post/unstore/:postId
  unStorePost: async (req, res) => {
    try {
      const userId = req.user.id;
      const postId = req.params.postId;
      await Post.findByIdAndUpdate(postId, { $pull: { stored: userId } });
      return res.status(200).json("unstored!");
    } catch (error) {
      return res.status(500).json(error);
    }
  },
};
export default postController;
