import User from "../models/Users.mjs";
import { v2 } from "cloudinary";
import Comments from "../models/Comments.mjs";
import bcrypt from "bcrypt";
import Post from "../models/Posts.mjs";
const userController = {
  // GET /user/publicInfo
  getUserPublicInfo: async (req, res) => {
    try {
      const userId = req.user.id;
      // nếu muốn chỉnh lại quyền thành chính chủ mới xem được thì ở đây lấy userId để xác thực từ cookies? hay nói cách khác là lấy userId từ cookies
      const user = await User.findById(userId);
      const displayname = user.displayname;
      const avatar = user.avatar;
      return res.status(200).json({
        displayname: displayname,
        avatar: avatar,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  },
  getUserFullInfo: async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);
      return res.status(200).json({
        user,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  },

  // PUT /user/updateFull
  updateFullUserInfo: async (req, res) => {
    try {
      const userId = req.user.id;
      const { username, displayname, email } = req.body;
      const avatarURL = req.file.path;
      const user = await User.findById(userId);
      const avatar = user.avatar;
      if (avatar) {
        const URLparts = avatar.split("/");
        const URLlastPart = URLparts[URLparts.length - 1].split(".");
        const anotherURL = URLlastPart[0];
        const publicId = URLparts[URLparts.length - 2] + "/" + anotherURL;
        await v2.uploader.destroy(publicId, { resource_type: "image" });
      }
      await user.updateOne({
        $set: {
          displayname: displayname,
          avatar: avatarURL,
          username: username,
          email: email,
        },
      });
      await Post.updateMany(
        { author: userId },
        { authorname: displayname, avatar: avatarURL }
      );
      await Comments.updateMany(
        { author: userId },
        { authorname: displayname, avatar: avatarURL }
      );
      return res.status(200).json("Updated success!");
    } catch (error) {
      res.status(500).json(error);
    }
  },
  updateUserPassword: async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);
      const passwordCheck = await bcrypt.compare(
        req.body.oldPassword,
        user.password
      );
      if (passwordCheck) {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(req.body.newPassword, salt);
        await user.updateOne({ $set: { password: hashed } });
        return res.status(200).json("Updated success!");
      } else return res.status(403).json("Incorrect password!");
    } catch (error) {
      res.status(500).json(error);
    }
  },
};
export default userController;
