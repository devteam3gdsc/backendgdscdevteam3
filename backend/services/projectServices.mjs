import {Group, Project, Team, Section} from "../models/Groups.mjs"
import User from "../models/Users.mjs";
import Post from "../models/Posts.mjs";
import mongoose from "mongoose"
import NotificationServices from "./notificationServices.mjs";

const projectServices = {
//-----------PROJECT-----------------
    createProject : async (data, groupId, userId) => {
        try {
            const group = await Group.findById(groupId);
            if(!group) {
                throw new Error("Group not found");
            }

            const newProject = new Project({
                ...data,
                group: groupId,
                creator: userId,
            });
            newProject.members.push({ user: userId, role: "leader"});

            await newProject.save();
            return newProject;
        } catch (error) {
            throw new Error(`Creating project service error: ${error}`, 500);
        }
    },

    updateProject : async (projectId, updateData) => {
        try { 
            const updatedProject = await Project.findByIdAndUpdate(
                projectId, 
                { $set: updateData }, // Use $set to merge updates instead of replacing the document
                { new: true, upsert: false, runValidators: true } // Ensure validation and no unintended document creation
            );
            
            if (!updatedProject) {
                throw new Error("Project not found.");
            }

            return updatedProject;
        } catch (error) {
            throw new Error(`Updating project service error: ${error}`, 500);
        }
    },

    deleteProject: async (projectId) => {
        try {
            const project = await Project.findById(projectId);
            
            if (!project) {
                throw new Error("Project not found.");
            }
    
            await Project.findByIdAndDelete(projectId);
            return { message: "Project deleted successfully" };
        } catch (error) {
            throw new Error(`Deleting project service error: ${error}`);
        }
    },

    getFullData : async (projectId, userId) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(projectId)) {
                console.error("projectId không hợp lệ:", projectId);
            } else {
                console.log("projectId hợp lệ:", projectId);
            }

            const project = await Project.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(projectId) } },
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
            
            if(!project) {
                return res.status(404).json({message: "Project not found"});
            }
            //const numberOfSection = await Project.countDocuments({group: groupId});
            //const numberOfPosts = await Post.countDocuments({group: groupId}); //need to edit Post model
             // Kiểm tra nếu nhóm là private, chỉ cho phép thành viên tham gia
             const projectData = project[0]; // Vì `aggregate()` trả về mảng

             if (!projectData) {
                 return res.status(404).json({ message: "Project not found" });
             }
             
             const members = projectData.membersData || []; // Lấy members từ lookup
             const isJoined = members.some(m => m._id.toString() === userId.toString());


            const canJoin = project.private ? isJoined : true; // Nếu private thì phải là thành viên mới được tham gia
           // Sắp xếp avatar theo thứ tự ưu tiên
            let sortedMembers = members.sort((a, b) => {
             return b.following.includes(userId) - a.following.includes(userId);
           });
            // Lấy tối đa 4 avatar từ danh sách thành viên
            const memberAvatars = sortedMembers.slice(0, 4).map(m => m.avatar);
return ({
name: projectData.name,
bio: groupData.description,
avatar: groupData.avatar,
members: memberAvatars,
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

}
export default projectServices;