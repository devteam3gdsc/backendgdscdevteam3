import User from "../models/Users.mjs";
import findDocument from "../utils/findDocument.mjs";
import Post from "../models/Posts.mjs";
import Comments from "../models/Comments.mjs";
import authServices from "./authServices.mjs";
import { v2 } from "cloudinary";
import { httpError, httpResponse } from "../utils/httpResponse.mjs";
import updateDocument from "../utils/updateDocument.mjs";
import { fileDestroy } from "../utils/filesHelper.mjs";
const userServices = {
  updateUserPassword: async (userId, oldPassword, newPassword) => {
    try {
      const user = await findDocument(User, 1, [{ _id: userId }], []);
      if (await authServices.passwordCheck(oldPassword, user.password)) {
        const hashed = await authServices.createHashedPassword(newPassword);
        await user.updateOne({ $set: { password: hashed } });
        return new httpResponse("updated success", 200);
      } else throw new httpError("Incorrect password", 400);
    } catch (error) {
      if (error instanceof httpError) throw error;
      else throw new httpError(`updatePasswordService error: ${error}`, 500);
    }
  },
  updateUserFullInfo: async (
    userId,
    avatarFile,
    { displayname, ...updatedData }
  ) => {
    try {
      const user = await findDocument(User, 1, [{ _id: userId }], []);
      const avatar = user.avatar;
      const avatarURL = avatarFile ? avatarFile.path : avatar;
      if (
        avatar &&
        avatar !=
          "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
      ) {
        fileDestroy(avatar, "image");
      }
      await user.updateOne({
        $set: { displayname, avatar: avatarURL, ...updatedData },
      });
      await Post.updateMany(
        { author: userId },
        { $set: { authorname: displayname, avatar: avatarURL } }
      );
      await Comments.updateMany(
        { author: userId },
        { $set: { authorname: displayname, avatar: avatarURL } }
      );
      return new httpResponse("updated successfully", 200);
    } catch (error) {
      if (error instanceof httpError) throw error;
      else
        throw new httpError(`updateFullUserInfo service error:${error}`, 500);
    }
  },
  
  signUpUser: async ({ ...data }) => {
    try {
      const { username, password, email } = data;
      const user = await User.findOne({
        $or: [{ username: username }, { email: email }],
      });
      if (user)
        throw new httpError("Username of email has already existed", 400);
      else {
        const hashed = await authServices.createHashedPassword(password);
        await User.create({
          username: username,
          email: email,
          password: hashed,
          displayname: username,
        });
        return new httpResponse("Sign up successfully", 200);
      }
    } catch (error) {
      if (error instanceof httpError) throw error;
      else throw new httpError(`signUp services error:${error}`, 500);
    }
  },
};

export default userServices;
