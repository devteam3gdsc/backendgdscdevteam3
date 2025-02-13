import Post from "../models/Posts.mjs";
import User from "../models/Users.mjs";
import findDocument from "../utils/findDocument.mjs";
import { httpError, httpResponse } from "../utils/httpResponse.mjs";
import { fileDestroy, getFiles } from "../utils/filesHelper.mjs";
import { edit } from "@cloudinary/url-gen/actions/animated";
import updateDocument from "../utils/updateDocument.mjs";
const postServices = {
  getPosts: async (
    userId,
    { ...matchData },
    criterias,
    orders,
    skip,
    limit
  ) => {
    try {
      const order = orders || "descending";
      const criteria = criterias || "date";
      switch (criteria) {
        case "date": {
          var sortValue = "updatedAt";
          break;
        }
        case "likes": {
          var sortValue = "totalLikes";
          break;
        }
        case "comments": {
          var sortValue = "totalComments";
          break;
        }
      }
      switch (order) {
        case "descending": {
          var sortOrder = -1;
          break;
        }
        case "ascending": {
          var sortOrder = 1;
          break;
        }
      }
      const Data = await Post.aggregate([
        { $match: matchData },
        { $sort: { [sortValue]: sortOrder } },
        {
          $facet: {
            posts: [
              { $skip: skip },
              { $limit: limit },
              {
                $addFields: {
                  Stored: { $in: [userId, "$stored"] },
                  Liked: { $in: [userId, "$likes"] },
                  isAuthor: { $eq: ["$author", userId] },
                },
              },
            ],
            countingPosts: [{ $count: "totalPosts" }],
          },
        },
      ]);
      if (!Data[0].countingPosts[0]) {
        return {
          posts: [],
        };
      }
      const totalPosts = Data[0].countingPosts[0].totalPosts;
      const posts = Data[0].posts;
      return {
        posts,
        totalPosts,
      };
    } catch (error) {
      throw new httpError(`getPosts service error: ${error}`, 500);
    }
  },
  createPost: async (userId, { ...data }, reqfiles) => {
    try {
      let tags = [];
      if (data.tags) {
        if (typeof data.tags === "string") {
          tags = data.tags.split(","); // Split string into array of tags
        } else if (Array.isArray(data.tags)) {
          tags = data.tags; // If tags are already an array, use it directly
        }
      }
      const userData = await findDocument(
        User,
        { _id: userId },
        { avatar: 1, displayname: 1 }
      );
      const files = getFiles(reqfiles, "code_files");
      const newPost = await Post.create({
        ...data,
        tags,
        author: userId,
        authorname: userData.displayname,
        avatar: userData.avatar,
        files, // Lưu danh sách file vào post
        editedAt: Date.now(),
      }).catch((error) => {
        throw new httpError(`creating post failed: ${error}`, 500);
      });
      return newPost._id;
    } catch (error) {
      throw new httpError(`creating post service error: ${error}`, 500);
    }
  },
  editPost: async (userId,postId, { ...data }, reqfiles) => {
    try {
      let tags = [];
      if (data.tags) {
        if (typeof data.tags === "string") {
          tags = data.tags.split(","); // Split string into array of tags
        } else if (Array.isArray(data.tags)) {
          tags = data.tags; // If tags are already an array, use it directly
        }
      }
      const {files} = await findDocument(
        Post,
        { author: userId,_id:postId },
        {files:1,_id:0}
      );
      const files_urls = files.map((file)=>file.fileUrl);
      await fileDestroy(files_urls,"raw");
      const code_files = getFiles(reqfiles, "code_files");
      await updateDocument(Post,1,[{_id:postId,author:userId}],[{$set:{
        ...data,
        tags,
        author: userId,
        files:code_files, // Lưu danh sách file vào post
        editedAt: Date.now(),
      }}]).catch((error) => {
        throw new httpError(`editing post failed: ${error}`, 500);
      });
      return new httpResponse("edit post successfully",200);
    } catch (error) {
      throw new httpError(`editing post service error: ${error}`, 500);
    }
  },
};

export default postServices;
