import { Cloudinary } from "@cloudinary/url-gen/index";
import Comments from "../models/Comments.mjs";
import Post from "../models/Posts.mjs";
import User from "../models/Users.mjs";
import mongoose from "mongoose";
import { v2 } from "cloudinary";
const postController = {
  //[GET] /me/:id?page=...&limit=...&search=...
  getUserPost: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const search = req.query.search || "";
      const skip = (page - 1) * limit;
      if (req.body.tags) {
        var tags = req.body.tags.split(",");
      } else {
        var tags = [];
      }
      const userId = new mongoose.Types.ObjectId(`${req.params.id}`);
      const orders = req.body.orders || "descending";
      const criteria = req.body.criteria || "date";
      switch (criteria) {
        case "date": {
          var sortValue = "updatedAt";
          break;
        }
        case "likes": {
          var sortValue = "totalLikes";
          break;
        }
        case "comments": {
          var sortValue = "totalComments";
          break;
        }
      }
      switch (orders) {
        case "descending": {
          var sortOrder = -1;
          break;
        }
        case "ascending": {
          var sortOrder = 1;
          break;
        }
      }
      const Data = await Post.aggregate([
        {
          $match: {
            $and: [
              { $or: [{ author: userId }, { stored: userId }] },
              { title: { $regex: search, $options: "i" } },
            ],
          },
        },
        { $sort: { [sortValue]: sortOrder } },
        {
          $facet: {
            posts: [
              { $skip: skip },
              { $limit: limit },
              {
                $addFields: {
                  Stored: { $in: [userId, "$stored"] },
                  Liked: { $in: [userId, "$likes"] },
                  isAuthor: { $eq: ["$author", userId] },
                },
              },
            ],
            countingPostsNoTags: [{ $count: "totalPosts" }],
            postsWithTags: [
              { $match: { tags: { $in: tags } } },
              { $skip: skip },
              { $limit: limit },
              {
                $addFields: {
                  Stored: { $in: [userId, "$stored"] },
                  Liked: { $in: [userId, "$likes"] },
                  isAuthor: { $eq: ["$author", userId] },
                },
              },
            ],
            countingPostsWithTags: [
              { $match: { tags: { $in: tags } } },
              { $count: "totalPosts" },
            ],
          },
        },
      ]);
      if (
        (!Data[0].countingPostsNoTags[0] && !tags[0]) ||
        (!Data[0].countingPostsWithTags[0] && tags[0])
      ) {
        return res.status(500).json("Oops!There is no posts here!");
      }
      const totalPosts = tags[0]
        ? Data[0].countingPostsWithTags[0].totalPosts
        : Data[0].countingPostsNoTags[0].totalPosts;
      const totalPages = Math.ceil(totalPosts / limit);
      const posts = tags[0] ? Data[0].postsWithTags : Data[0].posts;
      res.status(200).json({
        posts,
        currentPage: page,
        totalPages,
        totalPosts,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  },
  // /post/create
  createPost: async (req, res) => {
    try {
      const { title, content, visibility, stored } = req.body;
      // if (!req.files || req.files.length === 0) {
      //     return res.status(400).json({ message: 'No files uploaded' });
      // }
      if (req.body.tags) {
        var tags = req.body.tags.split(",");
      } else {
        var tags = [];
      }
      const userId = req.user.id;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(500).json("Invalid user!");
      }
      const codeFiles = req.files["code_files"];
      const files = codeFiles.map((file) => {
        return {
          fileUrl: file.path,
          fileName: file.originalname,
        };
      });
      const newPost = new Post({
        title: title,
        content: content,
        author: userId,
        tags: tags,
        authorname: user.displayname,
        avatar: user.avatar,
        visibility: visibility,
        files: files || [],
        stored: stored || [],
      });
      await newPost.save();
      return res.status(200).json("Post created successfully!");
    } catch (error) {
      res.status(500).json(error);
    }
  },
  // /community?page=...&limit=...&search=...
  getCommunityPosts: async (req, res) => {
    try {
      const userId = new mongoose.Types.ObjectId(`${req.body.userId}`);
      const search = req.query.search || "";
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const skip = (page - 1) * limit;
      if (req.body.tags) {
        var tags = req.body.tags.split(",");
      } else {
        var tags = [];
      }
      const orders = req.body.orders || "descending";
      const criteria = req.body.criteria || "date";
      switch (criteria) {
        case "date": {
          var sortValue = "updatedAt";
          break;
        }
        case "likes": {
          var sortValue = "totalLikes";
          break;
        }
        case "comments": {
          var sortValue = "totalComments";
          break;
        }
      }
      switch (orders) {
        case "descending": {
          var sortOrder = -1;
          break;
        }
        case "ascending": {
          var sortOrder = 1;
          break;
        }
      }
      const Data = await Post.aggregate([
        {
          $match: {
            $and: [
              { visibility: "public" },
              { title: { $regex: search, $options: "i" } },
            ],
          },
        },
        { $sort: { [sortValue]: sortOrder } },
        {
          $facet: {
            posts: [
              { $skip: skip },
              { $limit: limit },
              {
                $addFields: {
                  Stored: { $in: [userId, "$stored"] },
                  Liked: { $in: [userId, "$likes"] },
                  isAuthor: { $eq: ["$author", userId] },
                },
              },
            ],
            countingPostsNoTags: [{ $count: "totalPosts" }],
            postsWithTags: [
              { $match: { tags: { $in: tags } } },
              { $skip: skip },
              { $limit: limit },
              {
                $addFields: {
                  Stored: { $in: [userId, "$stored"] },
                  Liked: { $in: [userId, "$likes"] },
                  isAuthor: { $eq: ["$author", userId] },
                },
              },
            ],
            countingPostsWithTags: [
              { $match: { tags: { $in: tags } } },
              { $count: "totalPosts" },
            ],
          },
        },
      ]);
      if (
        (!Data[0].countingPostsNoTags[0] && !tags[0]) ||
        (!Data[0].countingPostsWithTags[0] && tags[0])
      ) {
        return res.status(500).json("Oops!There is no posts here!");
      }
      const totalPosts = tags[0]
        ? Data[0].countingPostsWithTags[0].totalPosts
        : Data[0].countingPostsNoTags[0].totalPosts;
      const totalPages = Math.ceil(totalPosts / limit);
      const posts = tags[0] ? Data[0].postsWithTags : Data[0].posts;
      res.status(200).json({
        posts,
        currentPage: page,
        totalPages,
        totalPosts,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  },
  // // /community?limit=...
  // getCommunityPosts: async (req, res) => {
  //     try {
  //         const userId = new mongoose.Types.ObjectId(req.body.userId);
  //         const limit = parseInt(req.query.limit) || 5; // Số bài viết mỗi lần tải
  //         const cursor = req.query.cursor; // Cursor từ client (nếu có)
  //         const orders = req.body.orders || "descending"; // Thứ tự
  //         const criteria = req.body.criteria || "date"; // Tiêu chí sắp xếp

  //         // Xác định tiêu chí sắp xếp
  //         let sortValue;
  //         switch (criteria) {
  //             case "date":
  //                 sortValue = "updatedAt";
  //                 break;
  //             case "likes":
  //                 sortValue = "totalLikes";
  //                 break;
  //             case "comments":
  //                 sortValue = "totalComments";
  //                 break;
  //         }

  //         const sortOrder = orders === "ascending" ? 1 : -1;

  //         // Lọc bài viết
  //         let matchStage = { visibility: "public" }; // Mặc định bài viết công khai
  //         if (cursor) {
  //             // Lọc bài viết trước/sau cursor
  //             matchStage[sortValue] = sortOrder === 1 ? { $gt: new Date(cursor) } : { $lt: new Date(cursor) };
  //         }

  //         if (req.body.tags) {
  //             const tags = req.body.tags.split(",");
  //             matchStage.tags = { $in: tags }; // Lọc theo tags nếu có
  //         }

  //         // Pipeline MongoDB
  //         const posts = await Post.aggregate([
  //             { $match: matchStage },
  //             { $sort: { [sortValue]: sortOrder } }, // Sắp xếp
  //             { $limit: limit + 1 }, // Lấy thêm 1 bài để kiểm tra `hasMore`
  //             {
  //                 $addFields: {
  //                     Stored: { $in: [userId, "$stored"] },
  //                     Liked: { $in: [userId, "$likes"] },
  //                     isAuthor: { $eq: ["$author", userId] },
  //                 },
  //             },
  //         ]);

  //         // Kiểm tra còn bài viết để tải không
  //         const hasMore = posts.length > limit;
  //         if (hasMore) posts.pop(); // Loại bỏ bài viết thứ `limit + 1`

  //         // Cursor cho bài viết cuối cùng
  //         const nextCursor = posts.length > 0 ? posts[posts.length - 1][sortValue] : null;

  //         res.status(200).json({
  //             posts,
  //             hasMore,
  //             nextCursor,
  //         });
  //     } catch (error) {
  //         res.status(500).json({ error: error.message });
  //     }
  // },
  // /post/store/:postId
  storePost: async (req, res) => {
    //cần xem lại, nếu người đó là tác giả hay đã từng lưu?,làm cho ẩn đi khi gửi
    try {
      const userId = req.user.id;
      const postId = req.params.postId;
      await Post.findByIdAndUpdate(postId, { $push: { stored: userId } });
      return res.status(200).json("saved!");
    } catch (error) {
      return res.status(500).json(error);
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
      return res.status(500).json(error);
    }
  },
  // /post/:postId
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
      const files = codeFiles.map((file) => file.path);
      const post = await Post.updateOne(
        { author: userId, _id: postId },
        { $set: { title: title, content: content, files: files } }
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
