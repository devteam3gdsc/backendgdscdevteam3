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
    authorname:{
        type:String
    },
    avatar:{
        type:String
    },
    // comments: [
    //     {type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Comments'}
    // ],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default:[]
    }],
    totalLikes:{
        type:Number,
        default:0
    },
    files: [{
        type: String,
    }],
    visibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    },
    stored:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default:[]
    }],
    totalComments: {
        type:Number,
        default: 0
    }
},
{ timestamps: true }
);

postSchema.pre("save", function (next) {

    this.updatedAt = Date.now();
    next();
});
const Post = mongoose.model('Post', postSchema);
export default Post;