import { position } from "@cloudinary/url-gen/qualifiers/timeline";
import mongoose, { Types } from "mongoose";
const pinSchema = new mongoose.Schema({
  id: mongoose.Types.ObjectId,
  pinType:{
    type:String,
    enum:["group","user","project"]
  },
  name:String,
  position:Number,
  avatar:String
},{_id:false})
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 20,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    avatar: {
      type: String,
      default:
        "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541",
    },
    displayname: {
      type: String,
    },
    refreshTokens: { type: [String], default: [] },
    totalLikes:{
      type:Number,
      default:0
    },
    totalComments:{
      type:Number,
      default:0
    },
    totalFollowers:{
      type:Number,
      default:0
    },
    following:[{
      type:mongoose.Types.ObjectId,
      ref:"User",
      default:[]
    }],
    totalFollowing:{
      type:Number,
      default:0
    },
    story:{
      type:String
    },
    totalPosts:{
      type:Number,
      default:0
    },
    pins:[pinSchema],
    resetPasswordToken: { type: String},
    resetPasswordExpires: { type: Date},
  },
  { timestamps: true }
);


const User = mongoose.model("Users", userSchema);
export default User;
