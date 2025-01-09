import mongoose from "mongoose";
const fileSchema = new mongoose.Schema(
  {
    fileUrl: { type: String },
    fileName: { type: String },
  },
  { _id: false }
);
const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
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
    },
    stored: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    totalComments: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

postSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});
const Post = mongoose.model("Post", postSchema);
export default Post;
