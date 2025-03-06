import Post from "../models/Posts.mjs";
import User from "../models/Users.mjs";
import findDocument from "../utils/findDocument.mjs";
import { httpError, httpResponse } from "../utils/httpResponse.mjs";
import { fileDestroy, getFiles } from "../utils/filesHelper.mjs";
import { edit } from "@cloudinary/url-gen/actions/animated";
import updateDocument from "../utils/updateDocument.mjs";
import { Group, Project, Section } from "../models/Groups.mjs";
import NotificationServices from "./notificationServices.mjs";
const postServices = {
  getPosts: async (
    userId,
    { ...matchData },
    criterias,
    orders,
    skip,
    limit,
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
              { $limit: Number(limit) },
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

  getPostsInGroup: async (userId, filterConditions, criterias, orders, skip, limit) => {
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

  createPost: async (userId, {...data }, reqfiles) => {
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
      const group = data.group?data.group:null;
      const project = data.project?data.project:null;
      const section = data.section?data.section:null;
    // Mặc định trạng thái bài viết
    let status = "approved";

    if (group) {
      const groupData = await findDocument(Group, { _id: group }, { moderation: 1 });
      if (groupData?.moderation === true) {
        if (data?.role === "creator" || data?.role === "admin"){
          status = "approved"
        }
        else status = "pending"; // Nếu group cần kiểm duyệt, đặt trạng thái pending
      }
    }

      const newPost = await Post.create({
        ...data,
        group,
        project,
        section,
        tags,
        author: userId,
        authorname: userData.displayname,
        avatar: userData.avatar,
        files, // Lưu danh sách file vào post
        editedAt: Date.now(),
        status,
      }).catch((error) => {
        throw new httpError(`creating post failed: ${error}`, 500);
      });
      if(group) {
        await updateDocument(Group, 1, [{ _id: group }], [{ $inc: { totalPosts: 1 }}]);
      } else if (project) {
        await updateDocument(Project, 1, [{ _id: project }], [{ $inc: { totalPosts: 1 }}]);
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
  confirmCreatePost: async (postId, accept) => {
    try {
      const post = await Post.findById(postId);
      // console.log(post.group?post.group:null)
      const group = (post.group)?post.group:null;
      const project = post.project?post.project:null;
      const section = post.section?post.section:null;
      let entityid;
      let entityType;
      if (!post) {
        throw new Error("Post not found");
      }
  
      if (post.status === "approved") {
        throw new Error("Post already approved");
      }
  
      if (post.status === "rejected") {
        throw new Error("Post already rejected");
      }
  
      // Xử lý trạng thái
      if (accept === "approve") {
        post.status = "approved";  // Sửa lỗi push
        if (group) {
          entityid = group;
          entityType = "Group";
          await updateDocument(Group, 1, [{ _id: group }], [{ $inc: { totalPosts: -1 } }]);
        } else if (project) {
          entityid = project;
          entityType = "Project";
          await updateDocument(Project, 1, [{ _id: project }], [{ $inc: { totalPosts: -1 } }]);
        } else if (section) {  // Sửa lỗi lặp
          entityid = section;
          entityType = "Section";
          await updateDocument(Section, 1, [{ _id: section }], [{ $inc: { totalPosts: -1 } }]);
        }
      } else if (accept === "reject") {
        post.status = "rejected";
  
        // Giảm số lượng bài viết nếu bị từ chối
        if (group) {
          entityid = group;
          entityType = "Group";
          await updateDocument(Group, 1, [{ _id: group }], [{ $inc: { totalPosts: -1 } }]);
        } else if (project) {
          entityid = project;
          entityType = "Project";
          await updateDocument(Project, 1, [{ _id: project }], [{ $inc: { totalPosts: -1 } }]);
        } else if (section) {  // Sửa lỗi lặp
          entityid = section;
          entityType = "Section";
          await updateDocument(Section, 1, [{ _id: section }], [{ $inc: { totalPosts: -1 } }]);
        }
      }
      const postAuthor = post.author;
      const message = accept === "approve" ? "approved" : "rejected";
      console.log(1)
        await NotificationServices.sendNotification({
            receiveId: postAuthor,
            senderId: postAuthor,
            entityId: entityid,
            entityType: entityType, 
            notificationType: "confirm_post",
            category: "groups", 
            customMessage: `your post is ${message} in ${entityType.toLowerCase()}`,
        });

      await post.save();
  
      return { message: accept === "approve" ? "approved" : "rejected" };
    } catch (error) {
      throw new Error(`Confirm post approval error: ${error}`);
    }
  },
  
};

export default postServices;
