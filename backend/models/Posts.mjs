import mongoose from "mongoose";
import User from "./Users.mjs";
const fileSchema = new mongoose.Schema(
  {
    fileUrl: { type: String },
    fileName: { type: String },
  },
  { _id: false },
);
const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
      // required: true,
    },
    content: {
      type: String,
      default: "",
      // required: true,
    },
    tags: [String],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    authorname: {
      type: String,
    },
    avatar: {
      type: String,
    },
    // Nếu bài viết thuộc về một group, project, section
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      default: null,
    },
    // Trạng thái bài viết (chờ duyệt hay đã duyệt) 
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: function () {
        return this.group || this.project || this.section ? "pending" : "approved"; // Nếu bài viết thuộc group thì "pending", ngược lại là "approved"
      },
    },
    // comments: [
    //     {type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Comments'}
    // ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    totalLikes: {
      type: Number,
      default: 0,
    },
    files: [fileSchema],
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
      // default: function () {
      //   return this.group || this.project || this.section ? "private" : "public";
      // },
    },
    stored: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    totalComments: {
      type: Number,
      default: 0,
    },
    editedAt: {
      type: Date,
      default: Date.now(),
    },
    refId:{type:mongoose.Types.ObjectId}
  },
  { timestamps: true },
);

postSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});
const Post = mongoose.model("Post", postSchema);
export default Post;