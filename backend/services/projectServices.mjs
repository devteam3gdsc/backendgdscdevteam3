import mongoose from "mongoose";
import { Project } from "../models/Group.mjs";
import { name } from "@cloudinary/url-gen/actions/namedTransformation";

const projectServices = {
  findProjects: async (userId, { ...data }) => {
    try {
      const page = data.page || 1;
      const limit = data.limit || 5;
      const skip = (page - 1) * limit;
      const search = data.search || "";
      const order = data.order || "descending";
      const criteria = data.criteria || "dateCreated";
      const user = data.user ? new mongoose.Types.ObjectId(`${data.user}`) : "";
      switch (criteria) {
        case "dateCreated": {
          var sortValue = "createdAt";
          break;
        }
        case "posts": {
          var sortValue = "totalPosts";
          break;
        }
        case "members": {
          var sortValue = "totalMembers";
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
      const matchData = [];
      if (search) {
        matchData.push({ name: { $regex: search, $options: "i" } });
      }
      if (data.role) {
        matchData.push({
          members: { $elemMatch: { user: userId, role: data.role } },
        });
      }
      if (user) {
        matchData.push({ members: { $elemMatch: { user: user } } });
      }
      const Data = await Project.aggregate([
        { $match: matchData.length === 0 ? {} : { $and: matchData } },
        { $sort: { [sortValue]: sortOrder } },
        {
          $facet: {
            projects: [
              { $skip: skip },
              { $limit: Number(limit) },
              {
                $lookup: {
                  from: "groups",
                  localField: "groupId",
                  foreignField: "_id",
                  as: "groupData",
                },
              },
              {
                $addFields: {
                  joinable: {
                    $and: [
                      {
                        $in: [
                          userId,
                          {
                            $map: {
                              input: "$groupData.members",
                              as: "member",
                              in: "$$member.user",
                            },
                          },
                        ],
                      },
                      {
                        $eq: ["$private", false],
                      },
                    ],
                  },
                  visibleMembers: {
                    $map: {
                      input: { $slice: ["$members", 0, 4] },
                      as: "member",
                      in: "$$member.avatar",
                    },
                  },
                },
              },
            ],
            countingProjects: [{ $count: "totalProjects" }],
          },
        },
      ]);
      console.log(Data);
      if (!Data[0].countingProjects[0]) {
        return {
          projects: [],
          toatalProjects: 0,
          currentPage: 1,
          hasMore: false,
        };
      }
      const totalProjects = Data[0].countingProjects[0].totalProjects;
      const projects = Data[0].projects;
      const totalPages = Math.ceil(totalProjects / limit);
      const hasMore = totalPages - page > 0 ? true : false;
      return {
        projects,
        currentPage: page,
        totalPages,
        hasMore,
      };
    } catch (error) {
      throw new Error(`finding projects service error: ${error}`, 500);
    }
  },
};
export default projectServices;
