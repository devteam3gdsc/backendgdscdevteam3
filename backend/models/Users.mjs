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
    posts: [
      {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Post'
      }
    ],
    storedPost: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
      }
    ],

    // avatar: {
    //   type: String, 
    //   default: "",
    // },

    // bio: {
    //   type: String,
    //   default: "",
    // },
    
    admin: {
      type: Boolean,
      default: false,
    },
    refreshTokens: { type: [String], default: [] },
    
  },
  { timestamps: true }
);

const User = mongoose.model("Users", userSchema);
export default User;
