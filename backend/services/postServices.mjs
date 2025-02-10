import Post from "../models/Posts.mjs";
import User from "../models/Users.mjs";
import findDocument from "../utils/findDocument.mjs";
import { httpError, httpResponse } from "../utils/httpResponse.mjs";
import { fileDestroy, getFiles } from "../utils/filesHelper.mjs";
import { edit } from "@cloudinary/url-gen/actions/animated";
import updateDocument from "../utils/updateDocument.mjs";
import { Group, Project, Section } from "../models/Groups.mjs";
const postServices = {
  // getPosts: async (
  //   userId,
  //   { ...matchData },
  //   criterias,
  //   orders,
  //   skip,
  //   limit,
  // ) => {
  //   try {
  //     console.log(matchData);
  //     const order = orders || "descending";
  //     const criteria = criterias || "date";
  //     switch (criteria) {
  //       case "date": {
  //         var sortValue = "updatedAt";
  //         break;
  //       }
  //       case "likes": {
  //         var sortValue = "totalLikes";
  //         break;
  //       }
  //       case "comments": {
  //         var sortValue = "totalComments";
  //         break;
  //       }
  //     }
  //     switch (order) {
  //       case "descending": {
  //         var sortOrder = -1;
  //         break;
  //       }
  //       case "ascending": {
  //         var sortOrder = 1;
  //         break;
  //       }
  //     }
  //     const Data = await Post.aggregate([
  //       { $match: matchData },
  //       { $sort: { [sortValue]: sortOrder } },
  //       {
  //         $facet: {
  //           posts: [
  //             { $skip: skip },
  //             { $limit: limit },
  //             {
  //               $addFields: {
  //                 Stored: { $in: [userId, "$stored"] },
  //                 Liked: { $in: [userId, "$likes"] },
  //                 isAuthor: { $eq: ["$author", userId] },
  //               },
  //             },
  //           ],
  //           countingPosts: [{ $count: "totalPosts" }],
  //         },
  //       },
  //     ]);
  //     if (!Data[0].countingPosts[0]) {
  //       return {
  //         posts: [],
  //       };
  //     }
  //     const totalPosts = Data[0].countingPosts[0].totalPosts;
  //     const posts = Data[0].posts;
  //     return {
  //       posts,
  //       totalPosts,
  //     };
  //   } catch (error) {
  //     throw new httpError(`getPosts service error: ${error}`, 500);
  //   }
  // },
  getPosts: async (userId, filterConditions, criterias, orders, skip, limit) => {
    try {
      console.log("Filter conditions:", JSON.stringify(filterConditions, null, 2));
  
      const order = orders || "descending";
      const criteria = criterias || "date";
  
      let sortValue;
      switch (criteria) {
        case "date":
          sortValue = "updatedAt";
          break;
        case "likes":
          sortValue = "totalLikes";
          break;
        case "comments":
          sortValue = "totalComments";
          break;
      }
  
      let sortOrder = order === "ascending" ? 1 : -1;
  
      let filter = filterConditions?.$and?.length ? { $and: filterConditions.$and } : {};
  
      const Data = await Post.aggregate([
        { $match: filter },
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
        return { posts: [], totalPosts: 0 };
      }
  
      const totalPosts = Data[0].countingPosts[0].totalPosts;
      const posts = Data[0].posts;
  
      return { posts, totalPosts };
    } catch (error) {
      throw new httpError(`getPosts service error: ${error}`, 500);
    }
  },

  createPost: async (userId, {group, project, section, ...data }, reqfiles) => {
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
        { avatar: 1, displayname: 1 },
      );
      const files = getFiles(reqfiles, "code_files");

       // Kiểm tra xem bài viết thuộc cấp nào
      const postScope = group ? { group } : project ? { project } : section ? { section } : {};
    
      const newPost = await Post.create({
        ...data,
        ...postScope,
        tags,
        author: userId,
        authorname: userData.displayname,
        avatar: userData.avatar,
        files, // Lưu danh sách file vào post
        editedAt: Date.now(),
      }).catch((error) => {
        throw new httpError(`creating post failed: ${error}`, 500);
      });
      if(group) {
        await updateDocument(Group, 1, [{ _id: group }], [{ $inc: { totalPosts: 1 }}]);
      } else if (project) {
        await updateDocument(Project, 1, [{ _id: project }], [{ $inc: { totalPosts: 1 }}]);
      } else if (project) {
        await updateDocument(Section, 1, [{ _id: section }], [{ $inc: { totalPosts: 1 }}]);
      }
      return newPost._id;
    } catch (error) {
      throw new httpError(`creating post service error: ${error}`, 500);
    }
  },
  editPost: async (userId, postId, { ...data }, reqfiles) => {
    try {
      let tags = [];
      if (data.tags) {
        if (typeof data.tags === "string") {
          tags = data.tags.split(","); // Split string into array of tags
        } else if (Array.isArray(data.tags)) {
          tags = data.tags; // If tags are already an array, use it directly
        }
      }
      const { files } = await findDocument(
        Post,
        { author: userId, _id: postId },
        { files: 1, _id: 0 },
      );
      const files_urls = files.map((file) => file.fileUrl);
      await fileDestroy(files_urls, "raw");
      const code_files = getFiles(reqfiles, "code_files");
      await updateDocument(
        Post,
        1,
        [{ _id: postId, author: userId }],
        [
          {
            $set: {
              ...data,
              tags,
              author: userId,
              files: code_files, // Lưu danh sách file vào post
              editedAt: Date.now(),
            },
          },
        ],
      ).catch((error) => {
        throw new httpError(`editing post failed: ${error}`, 500);
      });
      return new httpResponse("edit post successfully", 200);
    } catch (error) {
      throw new httpError(`editing post service error: ${error}`, 500);
    }
  },
};

export default postServices;
