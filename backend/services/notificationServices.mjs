import Notification from "../models/Notifications.mjs";
import mongoose from "mongoose";
import { httpError } from "../utils/httpResponse.mjs";
import Post from "../models/Posts.mjs";
import Comments from "../models/Comments.mjs";
import User from "../models/Users.mjs";
import { io, onlineUsers } from "../utils/socket.mjs";

const NotificationServices = {
  createNotification: async (userId, data) => {
    try {
      const notification = new Notification({ userId, ...data });
      const savedNotification = await notification.save();

      // Emit the notification to the user if they are online
      const socketId = onlineUsers.get(userId);
      if (socketId) {
        io.to(socketId).emit("newNotification", savedNotification);
      }

      return savedNotification;
    } catch (error) {
      console.error(`Error creating notification: ${error.message}`);
      throw new httpError("Failed to create notification", 500);
    }
  },
  // display name
  // avatar

  createLikeNotification: async ({ postId, senderId }) => {
    try {
      const post = await Post.findById(postId);
      if (!post) throw new httpError("Post not found", 404);

      const postOwnerId = post.author;

      const senderUser = await User.findById(senderId);

      // check over 24h from create post
      const postAgeInHours = (Date.now() - post.createdAt) / (1000 * 60 * 60); 
      if (postAgeInHours > 24) {
        return null;
      }

      // stop, check if more than 20 notif 
      const notificationCount = await Notification.countDocuments({ relatedEntityId: postId });
      if (notificationCount >= 20) {
        return null;
      }

      // check senderUser isFollowing postOwnerId
      const isFollowing = await User.exists({
        _id: senderId,
        following: postOwnerId
      });
      if (!isFollowing) return null;

      // check first like
      const hasLiked = post.likes.includes(senderId);
      if (hasLiked) {
        return null; 
      }

      const notification = new Notification({
        userId: String(postOwnerId),
        senderId,
        senderName: senderUser.displayname,
        senderAvatar: senderUser.avatar,
        type: "like",
        message: `liked your post`,
        relatedEntityId: postId,
        entityType: "Post",
      });

      const savedNotification = await notification.save();

      // Emit the notification to the user if they are online
      const socketId = onlineUsers.get(String(postOwnerId));
      console.log("id owner : " + postOwnerId);
      console.log("Type of postOwnerId is:", typeof postOwnerId);
      console.log(onlineUsers);
      console.log("id socket: " + onlineUsers.get(String(postOwnerId)));
      if (socketId) {
        io.to(socketId).emit("newNotification", savedNotification);
      }

      return savedNotification;
    } catch (error) {
      console.error(`Error creating like notification: ${error.message}`);
      throw new httpError("Failed to create like notification", 500);
    }
  },

  createCommentNotification: async ({ commentId, senderId }) => {
    try {
      const comment = await Comments.findById(commentId);
      if (!comment) throw new httpError("Comment not found", 404);

      const postId = comment.postId;
      const post = await Post.findById(postId);
      if (!post) throw new httpError("Post not found", 404);

      const postOwnerId = post.author;

      const senderUser = await User.findById(senderId);

      const notification = new Notification({
        userId: String(postOwnerId),
        senderId,
        senderName: senderUser.displayname,
        senderAvatar: senderUser.avatar,
        type: "comments",
        message: `commented on your post.`,
        relatedEntityId: commentId,
        entityType: "Comments",
      });

      const savedNotification = await notification.save();

      // Emit the notification to the user if they are online
      const socketId = onlineUsers.get(String(postOwnerId));
      if (socketId) {
        io.to(socketId).emit("newNotification", savedNotification);
      }

      return savedNotification;
    } catch (error) {
      console.error(`Error creating comment notification: ${error.message}`);
      throw new httpError("Failed to create comment notification", 500);
    }
  },

  getNotificationsByUserId: async (userId, skip = 0, limit = 10, filter = "all") => {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid userId");
      }
  
      const matchStage = { userId: new mongoose.Types.ObjectId(userId) };
      if (filter === "read") {
        matchStage.isRead = true; 
      } else if (filter === "unread") {
        matchStage.isRead = false; 
      }
  
      const Data = await Notification.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } }, 
        { $sort: { createdAt: -1 } }, 
        {
          $facet: {
            notifications: [{ $match: matchStage }, { $skip: skip }, { $limit: limit }], 
            totalNotifications: [{ $count: "count" }], 
            totalUnreadNotifications: [{ $match: { isRead: false } }, { $count: "count" }], 
            totalReadNotifications: [{ $match: { isRead: true } }, { $count: "count" }], 
          },
        },
      ]);
  
      return {
        notifications: Data[0].notifications,
        totalNotifications: Data[0].totalNotifications[0]?.count || 0,
        totalUnreadNotifications: Data[0].totalUnreadNotifications[0]?.count || 0,
        totalReadNotifications: Data[0].totalReadNotifications[0]?.count || 0,
      };
    } catch (error) {
      throw new Error(`getNotifications service error: ${error.message}`);
    }
  },

  getNotificationById: async (notificationId) => {
    try {
      // Validate notificationId
      if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        throw new httpError("Invalid notification ID", 400);
      }
      const notificationById = await Notification.findById(notificationId);
      if (!notificationById) {
        throw new httpError(`Notification not found:${error}`, 404);
      }
      return notificationById;
    } catch (error) {
      throw new httpError(`Failed to mark notification as read:${error}`, 500);
    }
  },

  markNotificationAsRead: async (notificationId) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        throw new httpError("Invalid notification ID", 400);
      }

      const updatedNotification = await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
      );

      if (!updatedNotification) {
        throw new httpError("Notification not found", 404);
      }

      // Emit an update event to the user
      const socketId = onlineUsers.get(updatedNotification.userId.toString());
      if (socketId) {
        io.to(socketId).emit("notificationUpdated", updatedNotification);
      }

      return updatedNotification;
    } catch (error) {
      throw new httpError(
        `Failed to mark notification as read: ${error.message}`,
        500
      );
    }
  },

  markAllNotificationsAsRead: async (userId) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new httpError("Invalid userId", 400);
      }

      const result = await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true }
      );

      // Notify the user if they are online
      const socketId = onlineUsers.get(userId);
      if (socketId) {
        io.to(socketId).emit("allNotificationsMarkedAsRead", {
          message: "All notifications have been marked as read.",
        });
      }

      return result;
    } catch (error) {
      console.error(
        `Error marking all notifications as read for user ${userId}: ${error.message}`
      );
      throw new httpError(
        `Failed to mark all notifications as read: ${error.message}`,
        500
      );
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        throw new httpError("Invalid notification ID", 400);
      }

      const deletedNotification =
        await Notification.findByIdAndDelete(notificationId);
      if (!deletedNotification) {
        throw new httpError("Notification not found", 404);
      }

      // Optionally notify the user of the deletion
      const socketId = onlineUsers.get(deletedNotification.userId.toString());
      if (socketId) {
        io.to(socketId).emit("notificationDeleted", deletedNotification);
      }

      return {
        message: "Notification deleted successfully",
        deletedNotification,
      };
    } catch (error) {
      console.error(
        `Error deleting notification ${notificationId}: ${error.message}`
      );
      throw new httpError(
        `Failed to delete notification: ${error.message}`,
        500
      );
    }
  },

  deleteAllNotifications: async (userId) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new httpError("Invalid userId", 400);
      }

      const result = await Notification.deleteMany({ userId });

      // Notify the user about the deletion if they are online
      const socketId = onlineUsers.get(userId);
      if (socketId) {
        io.to(socketId).emit("allNotificationsDeleted", {
          message: "All notifications have been deleted.",
        });
      }

      return result;
    } catch (error) {
      console.error(
        `Error deleting all notifications for user ${userId}: ${error.message}`
      );
      throw new httpError("Failed to delete all notifications", 500);
    }
  },
};

export default NotificationServices;
