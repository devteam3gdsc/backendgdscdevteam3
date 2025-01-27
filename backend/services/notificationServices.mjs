import Notification from "../models/Notifications.mjs";
import mongoose from "mongoose";
import { httpError } from "../utils/httpResponse.mjs";
import Post from "../models/Posts.mjs";
import Comments from "../models/Comments.mjs";

const NotificationServices = {
    createNotification : async (userId, data) => {
        try {
            const notification = new Notification ({userId,...data});
            return await notification.save();
        } catch (error) {
            console.error(`Error creating notification: ${error.message}`);
            throw new httpError('Failed to create notification',500);
        }
    },

    createLikeNotification : async ({ postId, senderId }) => {
      try {
        const post = await Post.findById(postId);
        if(!post) throw new httpError(`Post not found:${error}`, 404);
        const postOwnerId = post.author;
        const notification = new Notification ({
          userId: postOwnerId,
          senderId,
          type: "like",
          message: `${senderId} liked your post.`,
          relatedEntityId: postId,
          entityType: "Post",
        });
        await notification.save();
        return notification;
      } catch (error) {
        console.error(`Error creating notification: ${error.message}`);
        throw new httpError('Failed to create like notification',500);
      }
    },
    createCommentNotification : async ({commentId, senderId }) => {
      try {
        const comment = await Comments.findById(commentId);
        
        if(!comment) throw new httpError(`Comment not found:${error}`, 404);
        const  postId = comment. postId;

        const post = await Post.findById(postId);
        if(!post) throw new httpError(`Post not found:${error}`, 404);
        
        const postOwnerId = post.author;
    
        const notification = new Notification ({
          userId: postOwnerId,
          senderId,
          type: "comments",
          message: `${senderId} commented on your post.`,
          relatedEntityId: commentId,
          entityType: "Comments",
        });
        await notification.save();
        return notification;
      } catch (error) {
        console.error(`Error creating notification: ${error.message}`);
        throw new httpError('Failed to create comment notification',500);
      }
    },
    // getNotificationsByUserId : async (userId, skip, limit) => {
    //     try {
    //       const Data = await Notification.aggregate([
    //         { $match: { userId } },
    //         { $sort: { createdAt: -1 } }, // Always sort by latest date
    //         {
    //           $facet: {
    //             notifications: [
    //               { $skip: skip },
    //               { $limit: limit },
    //               {
    //                 $addFields: {
    //                   isRead: { $in: [userId, "$readBy"] }, 
    //                 },
    //               },
    //             ],
    //             countingNotifications: [{ $count: "totalNotifications" }],
    //           },
    //         },
    //       ]);
    
    //       if (!Data[0].countingNotifications[0]) {
    //         return {
    //           notifications: [],
    //           totalNotifications: 0,
    //         };
    //       }
    
    //       const totalNotifications =
    //         Data[0].countingNotifications[0].totalNotifications;
    //       const notifications = Data[0].notifications;
    
    //       return {
    //         notifications,
    //         totalNotifications,
    //       };
    //     } catch (error) {
    //       throw new httpError(`getNotifications service error: ${error}`, 500);
    //     }
    //   },
    getNotificationsByUserId: async (userId, skip = 0, limit = 10, filter = "all") => {
      try {
        // Ensure userId is valid and convert it to an ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          throw new Error("Invalid userId");
        }
    
        const matchStage = { userId: new mongoose.Types.ObjectId(userId) };
    
        // Add filtering based on the `filter` parameter
        if (filter === "read") {
          matchStage.isRead = true; // Filter for read notifications
        } else if (filter === "unread") {
          matchStage.isRead = false; // Filter for unread notifications
        }

        const Data = await Notification.aggregate([
          { $match: matchStage }, // Match notifications for the user with isRead filter
          { $sort: { createdAt: -1 } }, // Sort by newest notifications
          {
            $facet: {
              notifications: [
                { $skip: skip },
                { $limit: limit },
              ],
              countingNotifications: [{ $count: "totalNotifications" }], // Count total notifications
            },
          },
        ]);
    
        if (!Data[0].countingNotifications[0]) {
          return {
            notifications: [],
            totalNotifications: 0,
          };
        }
    
        const totalNotifications = Data[0].countingNotifications[0].totalNotifications;
        const notifications = Data[0].notifications;
    
        return {
          notifications,
          totalNotifications,
        };
      } catch (error) {
        throw new Error(`getNotifications service error: ${error.message}`);
      }
    },
    
    getNotificationById : async (notificationId) => {
        try {
            // Validate notificationId
            if (!mongoose.Types.ObjectId.isValid(notificationId)) {
                throw new httpError('Invalid notification ID', 400);
            }
            const notificationById = await Notification.findById(notificationId);
            if(!notificationById) {
                throw new httpError(`Notification not found:${error}`, 404); 
            }
            return notificationById;
        } catch (error) {
            throw new httpError(`Failed to mark notification as read:${error}`, 500);
        }  
    },


    markNotificationAsRead : async (notificationId) => {
        try {
            // Validate notificationId
            if (!mongoose.Types.ObjectId.isValid(notificationId)) {
                throw new httpError('Invalid notification ID', 400);
            }

            const updatedNotification = await Notification.findByIdAndUpdate(notificationId, { isRead: true}, { new: true });
            
            if(!updatedNotification) {
                throw new httpError(`Notification not found:${error}`, 404); 
            }
            return updatedNotification;
        } catch (error) {
            throw new httpError(`Failed to mark notification as read:${error}`, 500);
        }  
    },

    markAllNotificationsAsRead: async (userId) => {
        try {
            if(!mongoose.Types.ObjectId.isValid(userId)) {
                throw new httpError("Invalid userId", 400);
            }
            const result = await Notification.updateMany({userId, isRead: false}, {isRead: true});
            return result;
        } catch (error) {
            throw new httpError(`Failed to mark all notification as read:${error}`, 500);
        }
    },

    deleteNotification : async (notificationId) => {
        try {
            if(!mongoose.Types.ObjectId.isValid(notificationId)) {
                throw new httpError('Invalid notification ID', 400);
            }
            const deletedNotification = await Notification.findByIdAndDelete(notificationId);
            if (!deletedNotification) {
                throw new httpError('Notification not found', 404);
            }
            return { message: 'Notification deleted successfully', deletedNotification };
        } catch (error) {
            console.error(`Error deleting notification ${notificationId}: ${error.message}`);
            throw new httpError(`Failed to delete notification :${error}`, 500);
        }
    },

    deleteAllNotifications: async (userId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          throw new httpError("Invalid userId", 400);
         }
      
        const result = await Notification.deleteMany({ userId });
        return result;
        } catch (error) {
          console.error(`Error deleting all notifications for user ${userId}: ${error.message}`);
          throw new httpError("Failed to delete all notifications", 500);
        }
    },
};

export default NotificationServices;
