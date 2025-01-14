import mongoose from "mongoose";

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
