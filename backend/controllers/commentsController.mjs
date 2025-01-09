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
      return res.status(200).json("comment created successfully!");
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
      await Post.findByIdAndUpdate(postId, { $inc: { totalComments: -1 } });
      if (comment.deletedCount === 0) {
        return res.status(403).json("You are not the author of the comment");
      } else return res.status(200).json("Comment delete successfully!");
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
        { $set: { text: text, code: code } }
      );
      if (comment.matchedCount === 0) {
        return res.status(403).json("You are not the author of the comment");
      } else return res.status(200).json("Comment edited successfully!");
    } catch (error) {
      return res.status(500).json(error);
    }
  },
};

export default commentsController;
