import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // Người nhận thông báo
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Người tạo ra hành động, ví dụ: người like, comment
  },
  senderName: {
    type: String,
  },
  senderAvatar: {
    type: String,
  },
  type: {
    type: String,
    required: true, // Loại thông báo: like, comment, follow, message, system, etc.
    enum: [
      "like",
      "comments",
      "invite",
      "reply",
      "follow",
      "friend_request",
      "friend_accept",
      "tag_post",
      "tag_comment",
      "post_create",
      "group_invite",
      "group_post",
      "project_invite",
      "group_remove",
      "group_admin_add",
      "group_admin_remove",
      "group_creator_add",
      "group_update_profile",
      "group_delete",
      "confirm_post",
      "project_invite",
      "project_remove",
      "project_admin_add",
      "project_admin_remove",
      "project_update_profile",
      "project_delete",
      "section_participant_add",
      "section_participant_add",
      "user_update_password",
      "user_update_profile",
      "system",
      "achievement",
    ],
  },
  message: {
    type: String,
    required: true, // Nội dung thông báo
  },
  relatedEntityId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "entityType", // ID của thực thể liên quan (bài viết, bình luận, nhóm, tin nhắn, v.v.)
  },
  entityType: {
    type: String,
    enum: [
      "Post",
      "Comments",
      "User",
      "Group",
      "Project",
      "Section",
      "Message",
      "Achievement",
      "Invoice",
    ], // Loại thực thể liên quan
  },
  category: {
    type: String,
    enum: ["all", "system", "following", "groups"],
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false, // Trạng thái đã đọc/chưa đọc
  },
  createdAt: {
    type: Date,
    default: Date.now, // Thời điểm tạo thông báo
  },
  extraData: {
    type: Object, // Dữ liệu mở rộng (nếu cần thêm thông tin cho một số loại thông báo đặc biệt)
    default: null,
  },
});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
