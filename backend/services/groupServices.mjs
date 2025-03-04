
import findDocument from "../utils/findDocument.mjs";
import {Group, Project, Section} from "../models/Groups.mjs"
import User from "../models/Users.mjs";
import Post from "../models/Posts.mjs";
import mongoose from "mongoose"
import NotificationServices from "./notificationServices.mjs";
import { httpResponse } from "../utils/httpResponse.mjs";
import sectionServices from "./sectionServices.mjs";
import getRandomAvatar from "../utils/avatarHelper.mjs";
const groupServices = {
    //-----------GROUP-----------------
    createGroup: async (data, creatorId, avatarFile) => {
        try {
            const avatarURL = avatarFile 
                ? avatarFile.path 
                : getRandomAvatar("group");
            const userAvatar = (await User.findById(creatorId,{avatar:1})).avatar
            const newGroup = new Group({
                ...data,
                creator: creatorId,
                avatar: avatarURL,
                members: [{
                    user: creatorId,
                    avatar:userAvatar,
                    role: "creator"
                }]
            });
            await newGroup.save();
            return newGroup;
        } catch (error) {
            throw new Error(`Creating group service error: ${error}`);
        }
    },
  findGroups: async (userId, { ...data }) => {
    try {
      const page = data.page || 1;
      const limit = data.limit || 5;
      const skip = (page - 1) * limit;
      const search = data.search || "";
      const order = data.order || "descending";
      const criteria = data.criteria || "dateCreated";
      const user = data.user ? new mongoose.Types.ObjectId(`${data.user}`) : "";
      console.log(1);
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
      const Data = await Group.aggregate([
        { $match: matchData.length === 0 ? {} : { $and: matchData } },
        { $sort: { [sortValue]: sortOrder } },
        {
          $facet: {
            groups: [
              { $skip: skip },
              { $limit: Number(limit) },
              {
                $addFields: {
                  joined: {
                    $in: [userId, "$members.user"],
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
            countingGroups: [{ $count: "totalGroups" }],
          },
        },
      ]);
      if (!Data[0].countingGroups[0]) {
        return {
          group: [],
          totalGroups: 0,
          currentPage: 1,
          hasMore: false,
        };
      }
      const totalGroups = Data[0].countingGroups[0].totalGroups;
      const groups = Data[0].groups;
      const totalPages = Math.ceil(totalGroups / limit);
      const hasMore = totalPages - page > 0 ? true : false;
      return {
        groups,
        currentPage: page,
        totalPages,
        hasMore,
      };
    } catch (error) {
      throw new Error(`finding groups service error: ${error}`, 500);
    }
  },

    updateGroup: async (groupId, updateData) => {
        try {
            const Id = new mongoose.Types.ObjectId(`${groupId}`)
            const updatedGroup = await Group.updateOne({_id:Id},{$set:updateData})
            
            if (updatedGroup.matchedCount === 0) {
                throw new Error("Group not found.");
            }
    
        } catch (error) {
            throw new Error(`Updating group service error: ${error}`);
        }
    },
    updateGroupFull: async (groupId, avatarFile, ...updateData) => {
        try {
            // Tìm nhóm trong database
            const group = await Group.findById(groupId);
            if (!group) {
                throw new Error("Group not found.");
            }
    
            // Lấy avatar cũ
            const avatar = group.avatar;
            const avatarURL = avatarFile ? avatarFile.path : avatar;
    
            // Nếu avatar cũ không phải ảnh mặc định, thì xóa
            try {
                if (avatar && avatar !== "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541") {
                    await fileDestroy(avatar, "image");
                }
            } catch (err) {
                console.error("Error deleting file:", err);
            }
    
            // Cập nhật dữ liệu
            await group.updateOne({
                $set: { avatar: avatarURL, ...(updateData[0] || {}) }
            });
    
            // Kiểm tra lại dữ liệu sau khi cập nhật
            const updatedGroup = await Group.findById(groupId);
            console.log("Updated group:", updatedGroup);
    
            return new httpResponse("Updated successfully", 200);
        } catch (error) {
            console.error("Updating group service error:", error);
            throw new Error(`Updating group service error: ${error.message}`);
        }
    },

    deleteGroup: async (groupId) => {
        try {
            console.log(groupId)
            const group = await Group.findById(groupId);
            
            if (!group) {
                throw new Error("Group not found.");
            }
    
            await Group.findByIdAndDelete(groupId);
            return { message: "Group deleted successfully" };
        } catch (error) {
            throw new Error(`Deleting group service error: ${error}`);
        }
    },

    getFullGroupData: async (Id, userId) => {
        try {
            
            const groupId = new mongoose.Types.ObjectId(`${Id}`);
            const groupData = await Group.findById(groupId,
                { name:1,
                description:1,
                moderation:1,
                totalPosts:1,
                totalMembers:1,
                avatar:1,
                private:1,
                members:1}
            )
            console.log(groupData);
            if (!groupData) {
                return { message: "Group not found" };
            }
            const members = groupData.members || [];
            const userRole = members.find(m => m.user.toString() === userId.toString())?.role || "guest";
            const isJoined = members.some(m => m.user.toString() === userId.toString());
            console.log(groupData.private)
            const canJoin = !groupData.private
            const numberOfProjects = await Project.countDocuments({ group: groupId });
            // const posts = await Post.find({group:groupId})
            // console.log(posts)
            const numberOfPostsApproved = await Post.countDocuments({ group: groupId,status:"approved" });
            return {
                name: groupData.name,
                bio: groupData.description,
                avatar: groupData.avatar,
                members,
                moderation: groupData.moderation,
                totalPosts:groupData.totalPosts,
                numberOfPostsApproved,
                numberOfMembers: groupData.totalMembers,
                numberOfProjects,
                joined: isJoined,
                role:userRole,
                canJoin
            };
        } catch (error) {
            console.error("Error fetching group data:", error);
            return { message: "Internal server error", error: error.message };
        }
    },

    getGroupsByUserId : async (userId) => {
        try {
            const groups = await Group.find({ "members.user": userId}).populate("members.user");
            return groups;
        } catch (error) {
            throw new Error(`GetGroupsByUserId service error: ${error}`, 500);
        }
    },

    inviteMembers : async (groupId, userId, members) => {
        try {
            const group = await Group.findById(groupId);
            if(!group) {
                throw new Error("Group not found");
            }

            const validMembers = members.filter(m => mongoose.Types.ObjectId.isValid(m));
            if(validMembers.length === 0) {
                throw new Error("No valid members to invite");
            }

            let newInvites = [];
            validMembers.forEach(memberId => {
                const isMember = group.members.some(m => m.user.equals(memberId));
                const isAlreadyInvited = group.pendingInvites?.includes(memberId);

                if(!isMember && !isAlreadyInvited) {
                    newInvites.push(memberId);
                }
            });

            if(newInvites.length > 0) {
                group.pendingInvites = [...(group.pendingInvites || []), ...newInvites];
                await group.save();

                newInvites.forEach(async (memberId) => {
                    await NotificationServices.GroupInviteNotification(groupId, userId, memberId);
                });
            }

            return { message: "Invites sent successfully", invited: newInvites };
        } catch (error) {
            throw new Error(`Invite members service error: ${error}`, 500);
        }
    },

    confirmInvite : async (groupId, userId, accept) => {
        try {
            const group = await Group.findById(groupId);
            if(!group) {
                throw new Error("Group not found");
            }

            if (!group.pendingInvites?.includes(userId)) {
                throw new Error("User was not invited");
            }

            if (accept) {
                group.members.push({ user: userId, role: "member"});
            }
            group.totalMembers = group.totalMembers + 1;
            group.pendingInvites = group.pendingInvites.filter(id => !id.equals(userId));
            await group.save();
            return {message: accept ? "User joined the group" : "Invite declined"};
        } catch (error) {
            throw new Error(`Confirm invite service error: ${error}`, 500);
        }
    },

    removeMember: async (groupId, removedUserId) => {
        try {
            const group = await Group.findById(groupId);
            if(!group) {
                throw new Error("Group not found");
            };
            group.members = group.members.filter(m => !m.user.equals(removedUserId));
            group.totalMembers = group.totalMembers - 1;
            await group.save();
            return group;
        } catch (error) {
            throw new Error(`Remove members service error: ${error}`, 500);
        }
    },

    joinGroup : async (groupId, userId) => {
        try {
            const group = await Group.findById(groupId);
            const userAvatar = (await findDocument(User,{_id:userId},{avatar:1,_id:0})).avatar
            if (!userAvatar){
                throw new Error("Invalid userId")
            }
            if(!group) {
                throw new Error("Group not found");
            };

            if(group.private) {
                throw new Error("Group is private");
            }
            if(!group.members.some(m => m.user.equals(userId))) {
                group.members.push({ user: userId, role: "member" ,avatar:userAvatar});
                group.totalMembers = group.totalMembers + 1;
                await group.save();
            }
            return group;
        } catch (error) {
            throw new Error(`Join group service error: ${error}`, 500);
        }
    },

    leaveGroup : async(Id, userId) => {
        try {
            const groupId = new mongoose.Types.ObjectId(`${Id}`)
            const group = await Group.updateOne({_id:groupId},{$pull:{members:{user:userId}},$inc:{totalMembers:-1}})
            if (group.matchedCount === 0) throw new Error("Group not found");
            if (group.creator.equals(userId)) return { success: false, message:"You are creator, please choose another creator before leave"};
            const projectsId = (await Project.find({group:groupId,"members.user":userId},{_id:1}))._id;
            const updateResult = await Project.updateMany({_id:{$in:projectsId}},{$pull:{members:{user:userId}},$inc:{totalMembers:-1}})
            if (updateResult.matchedCount === 0) throw new Error("Projects not found");
            await Section.updateMany({project:projectsId},{$pull:{participants:userId},$inc:{totalMembers:-1}})
        } catch (error) {
            throw new Error(`Leave group service error: ${error}`, 500);
        }
    },

    assignAdmin : async (groupId, assignAdminUserId) => {
        try {
            const group = await Group.findById(groupId);
            if (!group) throw new Error("Group not found");

            const member = group.members.find(m => m.user.equals(assignAdminUserId));
            if (!member) throw new Error("User not found in group");

            member.role = "admin";
            await group.save();
            return group;
        } catch (error) {
            throw new Error(`Assign admin group service error: ${error}`, 500);
        }
    },

    removeAdmin : async (groupId, removeAdminUserId) => {
        try {
            const group = await Group.findById(groupId);
            if (!group) throw new Error("Group not found");
            const member = group.members.find(m => m.user.equals(removeAdminUserId));
            if(!member) throw new Error("User not found in group");
            if( member.role === "member") {
                throw new Error("User is member");
            }
            member.role = "member"
            await group.save();
            return group;
        } catch (error) {
            throw new Error(`Remove admin group service error: ${error}`, 500);
        } 
    },

    assignCreator : async (groupId, assignCreatorUserId) => {
        try {
            const group = await Group.findById(groupId);
            if (!group) throw new Error("Group not found");

            const member = group.members.find(m => m.user.equals(assignCreatorUserId));
            if (!member) throw new Error("User not found in group");

            member.role = "creator";
            await group.save();
            return group;
        } catch (error) {
            throw new Error(`Assign creator group service error: ${error}`, 500);
        }
    },
};

export default groupServices;

