import postServices from "../services/postServices.mjs";
import Comments from "../models/Comments.mjs";
import Post from "../models/Posts.mjs";
import User from "../models/Users.mjs";
import mongoose from "mongoose";
import { httpError } from "../utils/httpResponse.mjs";
import findDocument from "../utils/findDocument.mjs";
import updateDocument from "../utils/updateDocument.mjs";
import { fileDestroy, getFiles } from "../utils/filesHelper.mjs";
import { Group } from "../models/Groups.mjs";
import userServices from "../services/userServices.mjs";
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
      const groupId = req.query.groupId
        ? new mongoose.Types.ObjectId(`${req.query.groupId}`)
        : "";
      const projectId = req.query.projectId
        ? new mongoose.Types.ObjectId(`${req.query.projectId}`)
        : "";
      let matchData = [];
      if (type == "me") {
        matchData.push({ author: userId });
      } else matchData.push({ stored: { $in: [userId] } });
      if (req.query.tags) {
        const tags = req.query.tags.split(",");
        matchData.push({ tags: { $all: tags } });
      }
      if (groupId) {
        matchData.push({ group: groupId });
      }
      if (projectId) {
        matchData.push({ project: projectId });
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
        limit,
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


  createPost: async (req, res) => {
    try {
      const newPostId = await postServices.createPost(
        req.user.id,
        req.body,
        req.files,
      );
      await updateDocument(
        User,
        1,
        [{ _id: req.user.id }],
        [{ $inc: { totalPosts: 1 } }],
      );
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
      matchData.push({ group: null, project: null, section: null });
      if (req.query.tags) {
        const tags = req.query.tags.split(",");
        matchData.push({ tags: { $all: tags } });
      }
      if (search) {
        matchData.push({ title: { $regex: search, $options: "i" } });
      }
      const result = await postServices.getPosts(
        userId,
        { $and: matchData },
        req.query.criteria,
        req.query.order,
        skip,
        limit,
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

  //[GET] /group/getPosts?page=...&limit=...&search=...&group=...&status=pending
  getPostsInGroupProjectSection: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const search = req.query.search || "";
      const skip = (page - 1) * limit;
      const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
      const { group, project, section, status } = req.query;

    // Mảng điều kiện lọc
    let matchData = [{ visibility: "public" }];

    // Lọc theo group, project, section nếu có
    if (group) matchData.push({ group: new mongoose.Types.ObjectId(group) });
    if (project) matchData.push({ project: new mongoose.Types.ObjectId(project) });
    if (section) matchData.push({ section: new mongoose.Types.ObjectId(section) });

    // Lọc theo trạng thái nếu có
    if (status) matchData.push({ status });

    // Lọc theo tags nếu có
    if (req.query.tags) {
      const tags = req.query.tags.split(",");
      matchData.push({ tags: { $all: tags } });
    }

    // Lọc theo tiêu đề (tìm kiếm)
    if (search) {
      matchData.push({ title: { $regex: search, $options: "i" } });
    }

    // Gọi postServices
    const result = await postServices.getPostsInGroup(userId, { $and: matchData }, req.query.criteria, req.query.order, skip, limit);

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
  
  confirmPost: async (req, res) => {
    try {
      const postId = new mongoose.Types.ObjectId(`${req.params.postId}`)
      const post = await Post.findById(postId);
      console.log(post)
      
      if (!post) {
        console.log("Post not found");
        return res.status(404).json({ message: "Post not found" });
      }
  
      console.log(post);
      
      // Lấy ID của group/project/section theo đúng thứ tự ưu tiên
      const typeObj = {
        group: post.group || null,
        project: post.project || null,
        section: post.section || null,
      };
  
      console.log(typeObj);
  
      const result = await postServices.confirmCreatePost(post.author, typeObj, postId, req.query.accept);
      return res.status(200).json(result);
      
    } catch (error) {
      if (error instanceof httpError) {
        return res.status(error.statusCode).json(error.message);
      } else {
        return res.status(500).json({ message: "Internal Server Error", error: error.toString() });
      }
    }
  },
  

  //[GET] /post/store/:postId
  storePost: async (req, res) => {
    try {
      await updateDocument(
        Post,
        1,
        [{ _id: req.params.postId }],
        [{ $push: { stored: req.user.id } }],
      );
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
      const post = await findDocument(
        Post,
        { author: userId, _id: postId },
        {},
      );
      const urls = post.files;
      await fileDestroy(urls, "raw");
      await post.deleteOne();
      await updateDocument(
        User,
        1,
        [{ _id: req.user.id }],
        [{ $inc: { totalPosts: -1 } }],
      );
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
      const result = await postServices.editPost(
        userId,
        postId,
        req.body,
        req.files,
      );
      return res.status(result.statusCode).json(result.message);
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },
  //[GET] /post/like/:postId
  likePost: async (req, res) => {
    try {

      const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
      const post = await Post.findOneAndUpdate(
        { _id: req.params.postId },
        { $push: { likes: userId }, $inc: { totalLikes: 1 } },
        { new: false },
      );
      await updateDocument(
        User,
        1,
        [{ _id: post.author }],
        [{ $inc: { totalLikes: 1 } }],
      );
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
      const post = await Post.findOneAndUpdate(
        { _id: req.params.postId },
        {
          $pull: { likes: req.user.id },
          $inc: { totalLikes: -1 },
        },
        { new: false },
      );
      await updateDocument(
        User,
        1,
        [{ _id: post.author }],
        [{ $inc: { totalLikes: -1 } }],
      );
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
      await updateDocument(
        Post,
        1,
        [{ _id: req.params.postId }],
        [{ $pull: { stored: req.user.id } }],
      );
      return res.status(200).json("unstored!");
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },
  setState: async (req, res) => {
    try {
      const state = req.query.state;
      await updateDocument(
        Post,
        1,
        [{ _id: req.params.postId, author: req.user.id }],
        [{ $set: { visibility: state } }],
      );
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

      const {
        title,
        content,
        authorname,
        avatar,
        createdAt,
        editedAt,
        visibility,
        ...data
      } = post[0];
      return res.status(200).json({
        title,
        content,
        authorname,
        avatar,
        createdAt,
        editedAt,
        visibility,
      });
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },
  //[GET] /following?page=...&limit=...&search=...

  getFeedPosts: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const search = req.query.search || "";
      const skip = (page - 1) * limit;
      const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
      const groups = await Group.aggregate([
        {
          $match: {
            $expr: {
              $in: [
                userId,
                {
                  $map: {
                    input: "$members",
                    as: "member",
                    in: "$$member.user",
                  },
                },
              ],
            },
          },
        },
      ]);
      const groupsId = groups.map((group) => group._id);
      const following = (
        await findDocument(User, { _id: userId }, { following: 1, _id: 0 })
      ).following;
      console.log(following)
      const matchData = [
        { group:null},
        { author: { $ne: userId}},
        { author: { $in: following } },
        { visibility: "public" },
        { status: "approved"}
      ];

      let groupFilter = {};
      if (groupsId) {
        groupFilter = { group: { $in: groupsId },status:"approved" };
      }
      if (search) {
        matchData.push({ title: { $regex: search, $options: "i" } });
      }
      const result = await postServices.getPosts(
        userId,
        { $or: [{ $and:matchData },groupFilter ] },
        req.query.criteria,
        req.query.order,
        skip,
        limit,
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
  getAnotherUserPost: async (req, res) => {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 5;
      const skip = (page - 1) * limit;
      const search = req.query.search || "";
      const authorId = new mongoose.Types.ObjectId(`${req.params.userId}`);
      const myId = new mongoose.Types.ObjectId(`${req.user.id}`);
      const matchData = [{ author: authorId }, { visibility: "public" }, {status: "approved"}];
      if (search) {
        matchData.push({ title: { $regex: search, $options: "i" } });
      }

      const result = await postServices.getPosts(
        myId,
        { $and: [...matchData] },
        req.query.criteria,
        req.query.order,
        skip,
        limit,
      );
      const totalPages = result.totalPosts
        ? Math.ceil(result.totalPosts / limit)
        : 0;
      const hasMore = totalPages - page > 0 ? true : false;

      const author = await findDocument(
        User,
        { _id: authorId },
        { avatar: 1, displayname: 1, _id: 0 },
      );
      const me = await User.findById(myId);
      const newRecent = me.recent.filter((pin) => {
        return pin.name !== author.displayname;
      });
      newRecent.push({
        id: authorId,
        pinType: "user",
        name: author.displayname,
        avatar: author.avatar,
      });
      if (newRecent.length > 3) {
        newRecent.shift();
      }
      me.recent = newRecent;
      console.log(me.recent);
      await me.save();
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
};
export default postController;
