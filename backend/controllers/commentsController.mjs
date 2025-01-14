import Comments from "../models/Comments.mjs";
import mongoose from "mongoose";
import Post from "../models/Posts.mjs";
import User from "../models/Users.mjs";
const commentsController = {
  // /post/:postId/comment/create
  createComment: async (req, res) => {
    try {
      const { text, code } = req.body;
      const userId = req.user.id;
      const postId = req.params.postId;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(500).json("Invalid user!");
      }
      const newComment = new Comments({
        author: userId,
        authorname: user.displayname,
        avatar: user.avatar,
        code: code,
        text: text,
        postId: postId,
      });
      await newComment.save();
      await Post.findByIdAndUpdate(postId, { $inc: { totalComments: 1 } });
      return res.status(200).json({
        message: "comment created successfully!",
        commentId: newComment._id,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  },
  // /post/:postId/comment/delete/:commentId
  deleteComment: async (req, res) => {
    try {
      const userId = req.user.id;
      const commentId = req.params.commentId;
      const postId = req.params.postId;
      const comment = await Comments.deleteOne({
        author: userId,
        _id: commentId,
      });
      if (comment.deletedCount === 0) {
        return res.status(403).json("You are not the author of the comment");
      } else {
        await Post.findByIdAndUpdate(postId, { $inc: { totalComments: -1 } });
        return res.status(200).json("Comment delete successfully!");
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  // /post/:postId/comment/edit/:commentId
  editComment: async (req, res) => {
    try {
      const userId = req.user.id;
      const commentId = req.params.commentId;
      const { text, code } = req.body;
      const comment = await Comments.updateOne(
        { author: userId, _id: commentId },
        { $set: { text: text, code: code, editedAt:Date.now() } }
      );
      if (comment.matchedCount === 0) {
        return res.status(403).json("You are not the author of the comment");
      } else return res.status(200).json("Comment edited successfully!");
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  //detail/:postId/comment
  getComments: async (req, res) => {
    try {
      const postId = new mongoose.Types.ObjectId(`${req.params.postId}`);
      const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
      const order = req.query.order || "descending";
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const skip = (page - 1) * limit;
      // Định nghĩa thứ tự sắp xếp
      const sortOrder = order === "ascending" ? 1 : -1;
      // Điều kiện để lấy comment tiếp theo
      let matchCondition = { postId };
      // Query với phân trang dựa trên cursor
      const Data = await Comments.aggregate([
        { $match: matchCondition },
        { $sort: { editedAt: sortOrder } },
        {
          $facet: {
            comments: [
              { $skip: skip },
              { $limit: limit },
              {
                $addFields: {
                  isAuthor: { $eq: ["$author", userId] },
                },
              },
            ],
            countingComments: [{ $count: "totalComments" }],
          },
        },
      ]);
  
      if (!Data[0].countingComments[0].totalComments) {
        return res.status(200).json({
          comments: [],
          hasMore: false,
        });
      }
      const totalComments = Data[0].countingComments[0].totalComments;
      const totalPages = Math.ceil(totalComments / limit);
      const comments = Data[0].comments;
      const hasMore = totalPages - page > 0 ? true : false;
      return res.status(200).json({
        comments,
        hasMore,
      });
    } catch (error) {
      return res.status(500).json(error);
    }
  },
};

export default commentsController;
