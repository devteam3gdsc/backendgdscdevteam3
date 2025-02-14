import { sofa } from "@cloudinary/url-gen/qualifiers/focusOn";
import {Group, Project, Section} from "../models/Groups.mjs"
import User from "../models/Users.mjs";
import Post from "../models/Posts.mjs";
import mongoose from "mongoose"
import NotificationServices from "./notificationServices.mjs";
import { httpResponse } from "../utils/httpResponse.mjs";
const groupServices = {
    //-----------GROUP-----------------
    createGroup: async (data, creatorId, avatarFile) => {
        try {
            const avatarURL = avatarFile 
                ? avatarFile.path 
                : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541";
    
            const newGroup = new Group({
                ...data,
                creator: creatorId,
                avatar: avatarURL,
                members: [{
                    user: creatorId,
                    role: "admin"
                }]
            });
    
            await newGroup.save();
            return newGroup;
        } catch (error) {
            throw new Error(`Creating group service error: ${error}`);
        }
    },

    updateGroup: async (groupId, updateData) => {
        try {
            const updatedGroup = await Group.findByIdAndUpdate(
                groupId, 
                { $set: updateData }, // Use $set to merge updates instead of replacing the document
                { new: true, upsert: false, runValidators: true } // Ensure validation and no unintended document creation
            );
            
            if (!updatedGroup) {
                throw new Error("Group not found.");
            }
    
            return updatedGroup;
        } catch (error) {
            throw new Error(`Updating group service error: ${error}`);
        }
    },
    updateGroupFull: async (groupId, avatarFile, ...updateData) => {
        try {
          
            const group = await findById(groupId);
           
            if (!group) {
                throw new Error("Group not found.");
            }            const avatar = group.avatar;
            const avatarURL = avatarFile ? avatarFile.path : avatar;
      if (
        avatar &&
        avatar !=
          "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
      ) {
        fileDestroy(avatar, "image");
      }
           await group.updateOne({
            $set: {avatar: avatarURL, ...updateData}
           })
    
           return new httpResponse("updated successfully", 200);
        } catch (error) {
            throw new Error(`Updating group service error: ${error}`);
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

    getFullGroupData : async (groupId, userId) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(groupId)) {
                console.error("groupId không hợp lệ:", groupId);
            } else {
                console.log("groupId hợp lệ:", groupId);
            }

            const group = await Group.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(groupId) } },
                { 
                    $lookup: {
                        from: "users", // Tên collection (viết thường, số nhiều)
                        localField: "members.user",
                        foreignField: "_id",
                        as: "membersData"
                    }
                },
                { 
                    $lookup: {
                        from: "users",
                        localField: "creator",
                        foreignField: "_id",
                        as: "creatorData"
                    }
                }
            ]);
            
            if(!group) {
                return res.status(404).json({message: "Group not found"});
            }
            const numberOfProjects = await Project.countDocuments({group: groupId});
            const numberOfPosts = await Post.countDocuments({group: groupId}); //need to edit Post model
             // Kiểm tra nếu nhóm là private, chỉ cho phép thành viên tham gia
             const groupData = group[0]; // Vì `aggregate()` trả về mảng

             if (!groupData) {
                 return res.status(404).json({ message: "Group not found" });
             }
             
             const members = groupData.membersData || []; // Lấy members từ lookup
             const isJoined = members.some(m => m._id.toString() === userId.toString());


            const canJoin = group.private ? isJoined : true; // Nếu private thì phải là thành viên mới được tham gia
           // Sắp xếp avatar theo thứ tự ưu tiên
let sortedMembers = members.sort((a, b) => {
    return b.following.includes(userId) - a.following.includes(userId);
});
// Lấy tối đa 4 avatar từ danh sách thành viên
const memberAvatars = sortedMembers.slice(0, 4).map(m => m.avatar);
            return ({
    name: groupData.name,
    bio: groupData.description,
    avatar: groupData.avatar,
    members: memberAvatars,
    moderation,
    numberOfPosts,
    numberOfMembers: members.length,
    numberOfProjects,
    joined: isJoined,
    canJoin // Chỉ tham gia nếu nhóm là public hoặc user đã là thành viên
            });
        } catch (error) {
            // throw new Error(`Getting  groupData service error: ${error}`);
            console.error("Error fetching group data:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
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
            await group.save();
            return group;
        } catch (error) {
            throw new Error(`Remove members service error: ${error}`, 500);
        }
    },

    joinGroup : async (groupId, userId) => {
        try {
            const group = await Group.findById(groupId);
            if(!group) {
                throw new Error("Group not found");
            };

            if(group.private) {
                throw new Error("Group is private");
            }

            if(!group.members.some(m => m.user.equals(userId))) {
                group.members.push({ user: userId, role: "member" });
                await group.save();
            }
            return group;
        } catch (error) {
            throw new Error(`Join group service error: ${error}`, 500);
        }
    },

    leaveGroup : async(groupId, userId) => {
        try {
            const group = await Group.findById(groupId);
            if (!group) throw new Error("Group not found");
        
            if (group.creator.equals(userId)) throw new Error("You are creator, please choose another creator before leave");
        
            group.members = group.members.filter(m => !m.user.equals(userId));
            await group.save();
            return group;
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