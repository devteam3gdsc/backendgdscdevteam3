import Notification from "../models/Notifications.mjs";
import mongoose from "mongoose";
import { httpError } from "../utils/httpResponse.mjs";
import Post from "../models/Posts.mjs";
import { Group, Project, Section } from "../models/Groups.mjs"
import Comments from "../models/Comments.mjs";
import User from "../models/Users.mjs";
import { io, onlineUsers } from "../utils/socket.mjs";
import { custom } from "@cloudinary/url-gen/qualifiers/region";

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

  createLikeNotification: async ({ postId, senderId }) => { // phải gừi thông báo đến người chủ post following 
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
      const notificationCount = await Notification.countDocuments({
        relatedEntityId: postId,
      });
      if (notificationCount >= 20) {
        return null;
      }

      // check senderUser isFollowing postOwnerId
      const isPostOwnerFollowingSenderUser = await User.exists({
        _id: postOwnerId,
        following: senderId,
      });
      if (!isPostOwnerFollowingSenderUser) return null;

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
        category: "following",
        extraData: post.title,
      });

      const savedNotification = await notification.save();

      // Emit the notification to the user if they are online
      const socketId = onlineUsers.get(String(postOwnerId));
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

      // check over 24h from create post
      const postAgeInHours = (Date.now() - post.createdAt) / (1000 * 60 * 60);
      if (postAgeInHours > 24) {
        return null;
      }

      // stop, check if more than 20 notif
      const notificationCount = await Notification.countDocuments({
        relatedEntityId: postId,
      });
      if (notificationCount >= 20) {
        return null;
      }

      // check senderUser isFollowing postOwnerId
      // check senderUser isFollowing postOwnerId
      const isPostOwnerFollowingSenderUser = await User.exists({
        _id: postOwnerId,
        following: senderId,
      });
      if (!isPostOwnerFollowingSenderUser) return null;

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
        type: "comments",
        message: `commented on your post.`,
        relatedEntityId: commentId,
        entityType: "Comments",
        extraData: comment.code,
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
  createUpdateUserFollowingNotification: async ({ senderId }) => { 
    try {    
      const senderUser = await User.findById(senderId);
      if (!senderUser) throw new Error("Sender user not found");
  
      // Tìm danh sách những người đang theo dõi `senderId`
      const users = await User.find({ following: senderId });
  
      // Tạo danh sách thông báo
      const notifications = users.map(user => ({
        userId: user._id,  // Người nhận thông báo
        senderId,
        senderName: senderUser.displayname,
        senderAvatar: senderUser.avatar,
        type: "update_profile",
        message: `updated profile.`,
        relatedEntityId: senderId,
        entityType: "User",
        category: "following",
        extraData: user.displayname,
      }));
  
      // Lưu tất cả thông báo vào database
      const savedNotifications = await Notification.insertMany(notifications);
  
      // Gửi thông báo qua socket nếu user online
      users.forEach(user => {
        const socketId = onlineUsers.get(String(user._id)); // Đúng userId
        if (socketId) {
          io.to(socketId).emit("newNotification", savedNotifications.find(n => n.userId.toString() === user._id.toString()));
        } 
      });
      return savedNotifications;
    } catch (error) {
      console.error(`Error creating profile update notification: ${error.message}`);
      throw new httpError("Failed to create profile update notification", 500);
    }
  },

  sendUpdateNotification: async ({senderId, entityId, entityType, notificationType, category, customMessage}) => {
    try {
      const senderUser = await User.findById(senderId);
      if (!senderUser) throw new Error("Sender user not found");
      let entity;
      if(entityType === "Group") {
        entity = await Group.findById(entityId);
      } else if(entityType === "Project") {
        entity = await Project.findById(entityId);
      }
      if(!entity) {
        throw new Error("entity not found");
      }

      //const message = customMessage.replace("{entityName}", entity.name || "[Unknown]");
      const users = entity.members.map((member)=> member.user);
      console.log(users)
      // Tạo danh sách thông báo
      const notifications = users.map(user => ({
        userId: user._id,  // Người nhận thông báo
        senderId,
        senderName: senderUser.displayname,
        senderAvatar: senderUser.avatar,
        type: notificationType,
        message: customMessage,
        relatedEntityId: entityId,
        entityType: entityType,
        category: category,
        extraData: entity.name,
      }));
  
      // Lưu tất cả thông báo vào database
      const savedNotifications = await Notification.insertMany(notifications);
  
      // Gửi thông báo qua socket nếu user online
      users.forEach(user => {
        const socketId = onlineUsers.get(String(user._id)); // Đúng userId
        if (socketId) {
          io.to(socketId).emit("newNotification", savedNotifications.find(n => n.userId.toString() === user._id.toString()));
        } 
      });
      return savedNotifications;
    } catch (error) {
      console.error(`Error creating profile update notification: ${error.message}`);
      throw new httpError("Failed to create profile update notification", 500);
    }
  },
  

  // GroupInviteNotification : async (groupId, senderId, receiveId) => {
  //   try {
  //     const senderUser = await User.findById(senderId);
  //     if(!senderUser) {
  //       throw new Error("SenderUser not found");
  //     }

  //     const notification = new Notification({
  //       userId: receiveId,
  //       senderId,
  //       senderName: senderUser.displayname,
  //       senderAvatar: senderUser.avatar,
  //       type: "invite",
  //       message: `invited you join group`,
  //       relatedEntityId: groupId,
  //       entityType: "Group",
  //       category : "groups",
  //     });

  //     const savedNotification = await notification.save();

  //     // Emit the notification to the user if they are online
  //     const socketId = onlineUsers.get(receiveId);
  //     if (socketId) {
  //       io.to(socketId).emit("newNotification", savedNotification);
  //     }

  //     return savedNotification;
  //   } catch (error) {
  //     console.error(`Error creating invite notification: ${error.message}`);
  //     throw new httpError("Failed to create invite notification", 500);
  //   }
  // },

  // ProjectInviteNotification : async (projectId, senderId, receiveId) => {
  //   try {
  //     const senderUser = await User.findById(senderId);
  //     if(!senderUser) {
  //       throw new Error("SenderUser not found");
  //     }

  //     const notification = new Notification({
  //       userId: receiveId,
  //       senderId,
  //       senderName: senderUser.displayname,
  //       senderAvatar: senderUser.avatar,
  //       type: "invite",
  //       message: `invited you join project`,
  //       relatedEntityId: projectId,
  //       entityType: "Project",
  //       category : "groups",
  //     });

  //     const savedNotification = await notification.save();

  //     // Emit the notification to the user if they are online
  //     const socketId = onlineUsers.get(receiveId);
  //     if (socketId) {
  //       io.to(socketId).emit("newNotification", savedNotification);
  //     }

  //     return savedNotification;
  //   } catch (error) {
  //     console.error(`Error creating invite notification: ${error.message}`);
  //     throw new httpError("Failed to create invite notification", 500);
  //   }
  // },

  // addAdminGroupNotif : async (groupId, senderId, receiveId) => {
  //   try {
  //     const senderUser = await User.findById(senderId);
  //     if(!senderUser) {
  //       throw new Error("SenderUser not found");
  //     }
  //     const group= await Group.findById(groupId);
  //     if(!group) throw new httpError("Group not found", 404);
      
  //     const notification = new Notification({
  //       userId: receiveId,
  //       senderId,
  //       senderName: senderUser.displayname,
  //       senderAvatar: senderUser.avatar,
  //       type: "group_admin_add",
  //       message: `added you to admin in group "${group.name}"`,
  //       relatedEntityId: projectId,
  //       entityType: "Group",
  //       category : "groups",
  //     });
  //     const savedNotification = await notification.save();

  //     // Emit the notification to the user if they are online
  //     const socketId = onlineUsers.get(receiveId);
  //     if (socketId) {
  //       io.to(socketId).emit("newNotification", savedNotification);
  //     }

  //     return savedNotification;
  //   } catch (error) {
  //     console.error(`Error creating invite notification: ${error.message}`);
  //     throw new httpError("Failed to create invite notification", 500);
  //   }
  // },

  // addAdminProjectNotif : async (projectId, senderId, receiveId) => {
  //   try {
  //     const senderUser = await User.findById(senderId);
  //     if(!senderUser) {
  //       throw new Error("SenderUser not found");
  //     }
  //     const project= await Project.findById(projectId);
  //     if(!project) throw new httpError("Project not found", 404);
      
  //     const notification = new Notification({
  //       userId: receiveId,
  //       senderId,
  //       senderName: senderUser.displayname,
  //       senderAvatar: senderUser.avatar,
  //       type: "project_admin_add",
  //       message: `added you to admin in project "${project.name}"`,
  //       relatedEntityId: projectId,
  //       entityType: "Project",
  //       category : "groups",
  //     });
  //     const savedNotification = await notification.save();

  //     // Emit the notification to the user if they are online
  //     const socketId = onlineUsers.get(receiveId);
  //     if (socketId) {
  //       io.to(socketId).emit("newNotification", savedNotification);
  //     }

  //     return savedNotification;
  //   } catch (error) {
  //     console.error(`Error creating invite notification: ${error.message}`);
  //     throw new httpError("Failed to create invite notification", 500);
  //   }
  // },
  
  // removeAdminGroupNotif : async (groupId, senderId, receiveId) => {
  //   try {
  //     const senderUser = await User.findById(senderId);
  //     if(!senderUser) {
  //       throw new Error("SenderUser not found");
  //     }
  //     const group= await Group.findById(groupId);
  //     if(!group) throw new httpError("Group not found", 404);
      
  //     const notification = new Notification({
  //       userId: receiveId,
  //       senderId,
  //       senderName: senderUser.displayname,
  //       senderAvatar: senderUser.avatar,
  //       type: "group_admin_remove",
  //       message: `removed you as an admin in group "${group.name}"`,
  //       relatedEntityId: projectId,
  //       entityType: "Group",
  //       category : "groups",
  //     });
  //     const savedNotification = await notification.save();

  //     // Emit the notification to the user if they are online
  //     const socketId = onlineUsers.get(receiveId);
  //     if (socketId) {
  //       io.to(socketId).emit("newNotification", savedNotification);
  //     }

  //     return savedNotification;
  //   } catch (error) {
  //     console.error(`Error creating invite notification: ${error.message}`);
  //     throw new httpError("Failed to create invite notification", 500);
  //   }
  // },

  // removeAdminProjectNotif : async (projectId, senderId, receiveId) => {
  //   try {
  //     const senderUser = await User.findById(senderId);
  //     if(!senderUser) {
  //       throw new Error("SenderUser not found");
  //     }
  //     const project= await Project.findById(projectId);
  //     if(!project) throw new httpError("Project not found", 404);
      
  //     const notification = new Notification({
  //       userId: receiveId,
  //       senderId,
  //       senderName: senderUser.displayname,
  //       senderAvatar: senderUser.avatar,
  //       type: "project_admin_remove",
  //       message: `removed you as an admin in project "${project.name}"`,
  //       relatedEntityId: projectId,
  //       entityType: "Project",
  //       category : "groups",
  //     });
  //     const savedNotification = await notification.save();

  //     // Emit the notification to the user if they are online
  //     const socketId = onlineUsers.get(receiveId);
  //     if (socketId) {
  //       io.to(socketId).emit("newNotification", savedNotification);
  //     }

  //     return savedNotification;
  //   } catch (error) {
  //     console.error(`Error creating invite notification: ${error.message}`);
  //     throw new httpError("Failed to create invite notification", 500);
  //   }
  // },

  // addParticipantSectionNotif : async (sectionId, senderId, receiveId) => {
  //   try {
  //     const senderUser = await User.findById(senderId);
  //     if(!senderUser) {
  //       throw new Error("SenderUser not found");
  //     }
  //     const section= await Section.findById(sectionId);
  //     if(!section) throw new httpError("Section not found", 404);
      
  //     const notification = new Notification({
  //       userId: receiveId,
  //       senderId,
  //       senderName: senderUser.displayname,
  //       senderAvatar: senderUser.avatar,
  //       type: "section_participant_add",
  //       message: `added you to participant in section "${section.name}"`,
  //       relatedEntityId: projectId,
  //       entityType: "Section",
  //       category : "groups",
  //     });
  //     const savedNotification = await notification.save();

  //     // Emit the notification to the user if they are online
  //     const socketId = onlineUsers.get(receiveId);
  //     if (socketId) {
  //       io.to(socketId).emit("newNotification", savedNotification);
  //     }

  //     return savedNotification;
  //   } catch (error) {
  //     console.error(`Error creating invite notification: ${error.message}`);
  //     throw new httpError("Failed to create invite notification", 500);
  //   }
  // },
  // removeParticipantSectionNotif : async (sectionId, senderId, receiveId) => {
  //   try {
  //     const senderUser = await User.findById(senderId);
  //     if(!senderUser) {
  //       throw new Error("SenderUser not found");
  //     }
  //     const section= await Section.findById(sectionId);
  //     if(!section) throw new httpError("Section not found", 404);
      
  //     const notification = new Notification({
  //       userId: receiveId,
  //       senderId,
  //       senderName: senderUser.displayname,
  //       senderAvatar: senderUser.avatar,
  //       type: "section_participant_add",
  //       message: `removed you as a participant in section "${section.name}"`,
  //       relatedEntityId: projectId,
  //       entityType: "Section",
  //       category : "groups",
  //     });
  //     const savedNotification = await notification.save();

  //     // Emit the notification to the user if they are online
  //     const socketId = onlineUsers.get(receiveId);
  //     if (socketId) {
  //       io.to(socketId).emit("newNotification", savedNotification);
  //     }

  //     return savedNotification;
  //   } catch (error) {
  //     console.error(`Error creating invite notification: ${error.message}`);
  //     throw new httpError("Failed to create invite notification", 500);
  //   }
  // },

  sendNotification : async ({receiveId, senderId, entityId, entityType, notificationType, category, customMessage}) => {
    try {
        const senderUser = await User.findById(senderId);
        if (!senderUser) throw new Error("SenderUser not found");

        // Xác định model của entity
        let entityModel;
        switch (entityType) {
            case "Group": entityModel = Group; break;
            case "Project": entityModel = Project; break;
            case "Section": entityModel = Section; break;
            case "User": entityModel = User; break;
            default: 
                throw new Error(`Invalid entityType: ${entityType}`);
        }


        const entity = await entityModel.findById(entityId);
        if (!entity) throw new Error(`${entityType} not found`);

        //const message = customMessage.replace("{entityName}", entity.name || "[Unknown]");
        
        const notification = new Notification({
            userId: receiveId,
            senderId,
            senderName: senderUser.displayname,
            senderAvatar: senderUser.avatar,
            type: notificationType,
            message: customMessage,
            relatedEntityId: entityId,
            entityType,
            category,
            extraData: entity.name,
        });



        const savedNotification = await notification.save();
        console.log("Saved Notification:", savedNotification);

        // Gửi thông báo qua socket nếu người dùng online
        const socketId = onlineUsers.get(receiveId);
        if (socketId) io.to(socketId).emit("newNotification", savedNotification);

        return savedNotification;

    } catch (error) {
        console.error(`Error creating invite notification: ${error.message}`);
        throw new httpError("Failed to create custom notification", 500);
    }
},


  getNotificationsByUserId: async (
    userId,
    skip = 0,
    limit = 10,
    filter = "all",
  ) => {
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
            notifications: [
              { $match: matchStage },
              { $skip: skip },
              { $limit: limit },
            ],
            totalNotifications: [{ $count: "count" }],
            totalUnreadNotifications: [
              { $match: { isRead: false } },
              { $count: "count" },
            ],
            totalReadNotifications: [
              { $match: { isRead: true } },
              { $count: "count" },
            ],
          },
        },
      ]);

      return {
        notifications: Data[0].notifications,
        totalNotifications: Data[0].totalNotifications[0]?.count || 0,
        totalUnreadNotifications:
          Data[0].totalUnreadNotifications[0]?.count || 0,
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
        { new: true },
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
        500,
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
        { isRead: true },
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
        `Error marking all notifications as read for user ${userId}: ${error.message}`,
      );
      throw new httpError(
        `Failed to mark all notifications as read: ${error.message}`,
        500,
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
        `Error deleting notification ${notificationId}: ${error.message}`,
      );
      throw new httpError(
        `Failed to delete notification: ${error.message}`,
        500,
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
        `Error deleting all notifications for user ${userId}: ${error.message}`,
      );
      throw new httpError("Failed to delete all notifications", 500);
    }
  },
};

export default NotificationServices;
