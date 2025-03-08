import Comments from "../models/Comments.mjs";
import mongoose from "mongoose";
import Post from "../models/Posts.mjs";
import notificationServices from "../services/notificationServices.mjs";

import User from "../models/Users.mjs";
const commentsController = {
  //[POST] /comment/create/:hostId
  createComment: async (req, res) => {
    try {
      const { text, code } = req.body;
      const userId = req.user.id;
      const hostId = req.params.hostId;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(500).json("Invalid user!");
      }
      const newComment = new Comments({
        author: userId,
        authorname: user.displayname,
        avatar: user.avatar,
        code: code,
        editedAt: Date.now(),
        text: text,
        hostId: hostId,
      });
      await newComment.save();
      await notificationServices.createCommentNotification(
        { commentId:newComment._id, senderId:userId },
      );
      const data =
        (await Post.findOneAndUpdate(
          { _id: hostId },
          { $inc: { totalComments: 1 } },
          { new: false },
        )) ||
        (await Comments.findOneAndUpdate(
          { _id: hostId },
          { $inc: { totalComments: 1 } },
          { new: false },
        ));
      await User.findByIdAndUpdate(data.author, { $inc: { totalComments: 1 } });

//       await Post.findByIdAndUpdate(postId, { $inc: { totalComments: 1 } });
//       const author = await Post.findById(postId, { author: 1 });
//       await User.findByIdAndUpdate(author, { $inc: { totalComments: 1 } });

      return res.status(200).json({
        message: "comment created successfully!",
        commentId: newComment._id,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  },
  //[DELETE] /post/:postId/comment/delete/:commentId
  deleteComment: async (req, res) => {
    try {
      const userId = req.user.id;
      const commentId = req.params.commentId;
      const comment = await Comments.findOneAndDelete({
        author: userId,
        _id: commentId,
      });


      if (!comment) {
        return res
          .status(403)
          .json(
            "You are not the author of the comment or comment doesnt existed",
          );
      } else {
        await Comments.deleteMany({ hostId: comment._id });
        const post = await Post.findOneAndUpdate(
          { _id: comment.hostId },
          { $inc: { totalComments: -1 } },
          { new: false },
        );
        if (post) {
          await User.findByIdAndUpdate(post.author, {
            $inc: { totalComments: -1 },
          });
          return res.status(200).json("Comment delete successfully!");
        } else {
          const hostComment = await Comments.findOneAndUpdate(
            { _id: comment.hostId },
            { $inc: { totalComments: -1 } },
            { new: false },
          );
          await User.findByIdAndUpdate(hostComment.author, {
            $inc: { totalComments: -1 },
          });
          return res.status(200).json("Comment delete successfully!");
        }
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  //[PUT] /post/:postId/comment/edit/:commentId
  editComment: async (req, res) => {
    try {
      const userId = req.user.id;
      const commentId = req.params.commentId;
      const { text, code } = req.body;
      const comment = await Comments.updateOne(
        { author: userId, _id: commentId },
        { $set: { text: text, code: code, editedAt: Date.now() } },
      );
      if (comment.matchedCount === 0) {
        return res.status(403).json("You are not the author of the comment");
      } else return res.status(200).json("Comment edited successfully!");
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  //[GET] /post/detail/:postId/comment
  getComments: async (req, res) => {
    try {
      const hostId = new mongoose.Types.ObjectId(`${req.params.hostId}`);
      const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
      const order = req.query.order || "descending";
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const skip = (page - 1) * limit;
      // Định nghĩa thứ tự sắp xếp
      const sortOrder = order === "ascending" ? 1 : -1;
      // Điều kiện để lấy comment tiếp theo
      let matchCondition = { hostId };
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
      if (!Data[0].countingComments[0]) {
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
        hasMore,
      });
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  likeComments: async (req, res) => {
    try {
      const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
      await Comments.updateOne(
        { _id: req.params.commentId },
        { $inc: { totalLikes: 1 } },
      );
      return res.status(200).json("liked!");
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },
  unlikeComments: async (req, res) => {
    try {
      const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
      await Comments.updateOne(
        { _id: req.params.commentId },
        { $inc: { totalLikes: -1 } },
      );
      return res.status(200).json("unliked!");
    } catch (error) {
      if (error instanceof httpError)
        return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },
};

export default commentsController;

//[GET]: /comment/:commentId/reply
