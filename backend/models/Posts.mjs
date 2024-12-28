import mongoose from "mongoose"

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    tags: [
        String
    ],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],

    likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
    }],
    files: [{
        url: String,
        name: String,
    }],
    visibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    },

},
{ timestamps: true }
);

postSchema.pre("save", function (next) {

    this.updatedAt = Date.now();
    next();
});
const Post = mongoose.model('Post', postSchema);
export default Post;