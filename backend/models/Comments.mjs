import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    code: { type: String },
    text: { type: String },
    authorname: String,
    avatar: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
    },
    editedAt: {
      type: Date,
    },
    totalComments: {
      type: Number,
      default: 0,
    },
    totalLikes: {
      type: Number,
      default: 0,
    },
    // authorname: String
  },
  { timestamps: true },
);
commentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});
const Comments = mongoose.model("Comments", commentSchema);
export default Comments;
