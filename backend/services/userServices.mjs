import User from "../models/Users.mjs";
import findDocument from "../utils/findDocument.mjs";
import Post from "../models/Posts.mjs";
import Comments from "../models/Comments.mjs";
import authServices from "./authServices.mjs";
import getRandomAvatar from "../utils/avatarHelper.mjs";
import { httpError, httpResponse } from "../utils/httpResponse.mjs";
import updateDocument from "../utils/updateDocument.mjs";
import { fileDestroy } from "../utils/filesHelper.mjs";
import { Group, Project } from "../models/Groups.mjs";
import mongoose from "mongoose";
import NotificationServices from "./notificationServices.mjs";
const userServices = {
  updateUserPassword: async (userId, oldPassword, newPassword) => {
    try {
      const user = await findDocument(User, { _id: userId }, {});
      if (await authServices.passwordCheck(oldPassword, user.password)) {
        const hashed = await authServices.createHashedPassword(newPassword);
        await user.updateOne({ $set: { password: hashed } });

        await NotificationServices.sendNotification({
          receiveId: userId,
          senderId: userId,
          entityId: userId,
          entityType: "User",
          notificationType: "user_update_password",
          category: "system",
          customMessage: "updated password \"{entityName}\""
        });

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
    {
      displayname,
      totalLikes,
      totalComments,
      totalFollowing,
      totalFollowers,
      totalPosts,
      ...updatedData
    },
  ) => {
    try {
      const user = await findDocument(User, { _id: userId }, {});
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
      await User.updateMany({pins:{$elemMatch:{id:userId,pinType:"user"}}},
                            {$set:{"pins.$.name":displayname,"pins.$.avatar":avatarURL}}
      )
      await User.updateMany({recent:{$elemMatch:{id:userId,pinType:"user"}}},
        {$set:{"recent.$.name":displayname,"recent.$.avatar":avatarURL}}
)
      await Post.updateMany(
        { author: userId },
        { $set: { authorname: displayname, avatar: avatarURL } },
      );
      await Comments.updateMany(
        { author: userId },
        { $set: { authorname: displayname, avatar: avatarURL } },
      );
      
      await NotificationServices.sendNotification({
        receiveId: userId,
        senderId: userId,
        entityId: userId,
        entityType: "User",
        notificationType: "user_update_profile",
        category: "system",
        customMessage: "updated profile \"{entityName}\""
      });

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
          avatar:getRandomAvatar()
        });
        return new httpResponse("Sign up successfully", 200);
      }
    } catch (error) {
      if (error instanceof httpError) throw error;
      else throw new httpError(`signUp services error:${error}`, 500);
    }
  },
  getUsers: async (
    userId,
    [...matchData],
    sortValue,
    sortOrder,
    skip,
    limit,
  ) => {
    try {
      const following = (
        await findDocument(User, { _id: userId }, { _id: 0, following: 1 })
      ).following;
      const Data = await User.aggregate([
        { $match: { $and: matchData } },
        { $sort: { [sortValue]: sortOrder } },
        {
          $facet: {
            users: [
              { $skip: skip },
              { $limit: Number(limit) },
              {
                $addFields: {
                  followed: { $in: ["$_id", following] },
                },
              },
              {$project:{
                displayname:1,
                username:1,
                avatar:1,
                totalFollowers:1,
                totalLikes:1,
                followed:1,
                _id:1
              }}
            ],
            countingUsers: [{ $count: "totalUsers" }],
          },
        },
      ]);
      if (!Data[0].countingUsers[0]) {
        
        return {
          users: [],
          totalUsers: 0,
        };
      } else{
        return {
          users: Data[0].users,
          totalUsers: Data[0].countingUsers[0].totalUsers,
        };}
    } catch (error) {
      if (error instanceof httpError) throw error;
      else throw new httpError(`getUsers services error:${error}`, 500);
    }
  },
  addPin: async (userId, { ...data }) => {
    try {
      const id = new mongoose.Types.ObjectId(`${data.id}`);
      let result;
      switch (data.type) {
        case "group": {
          result = await findDocument(
            Group,
            { _id: id },
            { name: 1, avatar: 1, _id: 0 },
          );
          break;
        }
        case "user": {
          result = await findDocument(
            User,
            { _id: id },
            { displayname: 1, avatar: 1, _id: 0 },
          );
          break;
        }
        case "project": {
          result = await findDocument(
            Project,
            { _id: id },
            { name: 1, avatar: 1, _id: 0 },
          );
          break;
        }
      }
      const userPins = (
        await findDocument(User, { _id: userId }, { pins: 1, _id: 0 })
      ).pins;
      const newPins = {
        position: userPins.length + 1,
        id,
        name: result.displayname ? result.displayname : result.name,
        avatar: result.avatar,
        pinType: data.type,
      };
      await User.updateOne({ _id: userId }, { $push: { pins: newPins } });
      return newPins;
    } catch (error) {
      if (error instanceof httpError) throw error;
      else throw new httpError(`addPin services error:${error}`, 500);
    }
  },
};

export default userServices;
