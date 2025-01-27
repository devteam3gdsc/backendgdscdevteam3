import mongoose from "mongoose";
const contactLinksSchema = new mongoose.Schema(
  {
    facebook: { type: String },
    youtube:  { type: String },
    github:   { type: String },
    email:    { type: String }
  },
  { _id: false }
);
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
    contactLinks:contactLinksSchema,
    totalPosts:{
      type:Number,
      default:0
    },
    resetPasswordToken: { type: String},
    resetPasswordExpires: { type: Date},
    // admin: {
    //   type: Boolean,
    //   default: false,
    // },
    // refreshTokens: { type: [String], default: [] },
  },
  { timestamps: true }
);

const User = mongoose.model("Users", userSchema);
export default User;
