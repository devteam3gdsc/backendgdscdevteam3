import mongoose from "mongoose"

const commentSchema = new mongoose.Schema({
    content: {type: string},
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", require: true}
},
{timestamps: true});

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;