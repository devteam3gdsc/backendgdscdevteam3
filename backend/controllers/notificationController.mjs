import notificationServices from "../services/notificationServices.mjs";
import { httpError } from "../utils/httpResponse.mjs";
import mongoose from "mongoose";
const notificationController = {
    //[POST] /
    createNotification : async (req, res) => {
        try {
            const notification = await notificationServices.createNotification(req.user.id ,req.body);
            res.status(201).json(notification);
        } catch (error) {
            if (error instanceof httpError)
                return res.status(error.statusCode).json(error.message);
            else return res.status(500).json(error); 
        }
    },

    // [POST] /notification/like/:postId 
    createLikeNotification : async (req, res) => {
        try {
            const postId = req.params.postId;
            const senderId = req.user.id;

            const notification = await notificationServices.createLikeNotification({ postId, senderId });
            res.status(201).json(notification);
        } catch (error) {
            if (error instanceof httpError)
                return res.status(error.statusCode).json(error.message);
            else return res.status(500).json(error); 
        }
    },

    // [POST] /notification/comment/:commentId
    createCommentNotification : async (req, res) => {
        try {
            const senderId = req.user.id;
            const commentId = req.params.commentId;
            const notification = await notificationServices.createCommentNotification({commentId, senderId});
            res.status(201).json(notification);
        } catch (error) {
            
            if (error instanceof httpError)
                return res.status(error.statusCode).json(error.message);
            else return res.status(500).json(error); 
        }
    },

    //[GET] /
    // getUserNotifications : async (req, res) => {
    //     try {
    //       const page = parseInt(req.query.page) || 1;
    //       const limit = parseInt(req.query.limit) || 5;
    //       const skip = (page - 1) * limit;
    
    //       const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
    
    //       const result = await notificationServices.getNotificationsByUserId(
    //         userId,
    //         skip,
    //         limit
    //       );
    
    //       const totalPages = Math.ceil(result.totalNotifications / limit);
    //       const hasMore = totalPages - page > 0;
    
    //       res.status(200).json({
    //         notifications: result.notifications,
    //         currentPage: page,
    //         totalPages,
    //         totalNotifications: result.totalNotifications,
    //         hasMore,
    //       });
    //     } catch (error) {
    //       if (error instanceof httpError)
    //         return res.status(error.statusCode).json(error.message);
    //       else return res.status(500).json(error);
    //     }
    //   },

   // [GET] /notifications?filter=unread&page=1&limit=5
   //?filter=read
   //?filter=all
   // [GET] /notification/
   getUserNotifications: async (req, res) => {
    try {
      // Parse pagination query parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const skip = (page - 1) * limit;
  
      // Extract userId and filter from the request
      const userId = req.user && req.user.id;
      if (!userId) {
        return res.status(400).json({
          message: "User ID is required to fetch notifications.",
        });
      }
  
      const filter = req.query.filter || "all"; // Default filter is "all"
  
      // Call the service function
      const result = await notificationServices.getNotificationsByUserId(
        new mongoose.Types.ObjectId(userId), // Ensure userId is passed as an ObjectId
        skip,
        limit,
        filter
      );
  
      // Calculate pagination details
      const totalPages = Math.ceil(result.totalNotifications / limit);
      const hasMore = page < totalPages;
  
      // Return response
      res.status(200).json({
        notifications: result.notifications,
        currentPage: page,
        totalPages,
        totalNotifications: result.totalNotifications,
        hasMore,
      });
    } catch (error) {
      console.error(`Error in getUserNotifications controller: ${error.message}`);
      res.status(500).json({
        message: error.message || "An error occurred while fetching notifications.",
      });
    }
  },
// [GET] /notification/:notificationId/detail
    getNotification : async (req, res) => {
        const notification = await notificationServices.getNotificationById(req.params.notificationId);
        if (!notification) {
            throw new httpError('Notification not found', 404);
        }
        if (notification.userId.toString() !== req.user.id) {
            throw new httpError('Unauthorized access to this notification', 403);
        }
        res.status(200).json(notification);
    },

// [POST] /notification/:notificationId/read
    markNotificationAsRead : async (req, res) => {
        try {
          
            const notification = await notificationServices.getNotificationById(req.params.notificationId);
            
            if (!notification) {
                throw new httpError('Notification not found', 404);
            }
        
            if (notification.userId.toString() !== req.user.id) {
                throw new httpError('Unauthorized access to this notification', 403);
            }
            
            const updatedNotification = await notificationServices.markNotificationAsRead(req.params.notificationId);
            res.status(200).json(updatedNotification);
        } catch (error) {
            if( error instanceof httpError)
                return res.status(error.statusCode).json(error.message);
            else return res.status(500).json(error);
        }
    },

    // [POST] /notification/read
    markAllNotificationsAsRead : async (req, res) => {
        try {
            const result = await notificationServices.markAllNotificationsAsRead(req.user.id);
            res.status(200).json(result);
        } catch (error) {
            if( error instanceof httpError)
                return res.status(error.statusCode).json(error.message);
            else return res.status(500).json(error);
        }
    },

    // [DELETE] /notification/:notificationId/delete
    deleteNotification : async (req, res) => {
        try {
            const notification = await notificationServices.getNotificationById(req.params.notificationId);
            if (notification.userId.toString() !== req.user.id) {
                throw new httpError('Unauthorized access to this notification', 403);
            }

            const deletedNotification = await notificationServices.deleteNotification(req.params.notificationId);
            res.status(200).json(deletedNotification);
        } catch (error) {
            if( error instanceof httpError)
                return res.status(error.statusCode).json(error.message);
            else return res.status(500).json(error);
        }
    }
};

export default notificationController;