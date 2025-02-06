import { Router } from "express";
import notificationController from "../controllers/notificationController.mjs";
import authMiddleware from "../middlewares/authMidleware.mjs";

const notificationRouter = Router();

// [POST] /notification/comment/:commentId - Create a notification for a comment
notificationRouter.post(
  "/comment/:commentId",
  authMiddleware.verifyToken,
  notificationController.createCommentNotification,
);

// [POST] /notification/like/:postId - Create a notification for a like
notificationRouter.post(
  "/like/:postId",
  authMiddleware.verifyToken,
  notificationController.createLikeNotification,
);

// [GET] /notification/:notificationId/detail - Get details of a single notification by ID
notificationRouter.get(
  "/:notificationId/detail",
  authMiddleware.verifyToken,
  notificationController.getNotification,
);

// [GET] /notification/ - Get a list of user notifications with optional filters
notificationRouter.get(
  "/",
  authMiddleware.verifyToken,
  notificationController.getUserNotifications,
);

// [DELETE] /notification/:notificationId/delete - Delete a notification by ID
notificationRouter.delete(
  "/:notificationId/delete",
  authMiddleware.verifyToken,
  notificationController.deleteNotification,
);

// [POST] /notification/:notificationId/read - Mark a single notification as read
notificationRouter.post(
  "/:notificationId/read",
  authMiddleware.verifyToken,
  notificationController.markNotificationAsRead,
);

// [POST] /notification/read - Mark all notifications as read
notificationRouter.post(
  "/read",
  authMiddleware.verifyToken,
  notificationController.markAllNotificationsAsRead,
);

export default notificationRouter;
