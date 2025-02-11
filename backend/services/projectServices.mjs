import {Group, Project, Section} from "../models/Groups.mjs"
import User from "../models/Users.mjs";
import Post from "../models/Posts.mjs";
import mongoose from "mongoose"
import NotificationServices from "./notificationServices.mjs";
import { httpResponse } from "../utils/httpResponse.mjs";

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

            // Tạo section gốc khi tạo project mới
            const rootSection = new Section({
                name: newProject.name,
                project: newProject._id,
                parent: null,
                participants: [userId],
            })
            await rootSection.save();

            return {project: newProject, rootSection};
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
    updateProjectFull: async (projectId, avatarFile, ...updateData) => {
        try {
          
            const project = await findById(projectId);
           
            if (!project) {
                throw new Error("Project not found.");
            }            const avatar = project.avatar;
            const avatarURL = avatarFile ? avatarFile.path : avatar;
      if (
        avatar &&
        avatar !=
          "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
      ) {
        fileDestroy(avatar, "image");
      }
           await project.updateOne({
            $set: {avatar: avatarURL, ...updateData}
           })
    
           return new httpResponse("updated successfully", 200);
        } catch (error) {
            throw new Error(`Updating group service error: ${error}`);
        }
    },

    deleteProject: async (projectId) => {
        try {
            const project = await Project.findById(projectId);
            
            if (!project) {
                throw new Error("Project not found.");
            }
    
            await Section.deleteMany({ project: projectId });
            await Project.findByIdAndDelete(projectId);

            return { message: "Project and its sections deleted successfully" };
        } catch (error) {
            throw new Error(`Deleting project service error: ${error}`);
        }
    },

    getFullProjectData : async (projectId, userId) => {
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
             const isJoined = members.some((m) => m._id.toString() === userId.toString());
            const canJoin = project.private ? isJoined : true; // Nếu private thì phải là thành viên mới được tham gia
           // Sắp xếp avatar theo thứ tự ưu tiên
            let sortedMembers = members.sort((a, b) => {
             return b.following.includes(userId) - a.following.includes(userId);
           });
            // Lấy tối đa 4 avatar từ danh sách thành viên
            const memberAvatars = sortedMembers.slice(0, 4).map(m => m.avatar);

            const sections = await Section.find({ project: projectId })
            .select("_id name parent participants")
            .lean();

            const sectionTree = buildSectionTree(sections, null);
            return ({
                name: projectData.name,
                bio: projectData.description,
                avatar: projectData.avatar,
                members: memberAvatars,
                numberOfMembers: members.length,
                sections: sectionTree,
                joined: isJoined,
                canJoin // Chỉ tham gia nếu nhóm là public hoặc user đã là thành viên
                });
        } catch (error) {
            // throw new Error(`Getting  groupData service error: ${error}`);
            console.error("Error fetching group data:", error);
            res.status(500).json({ message: "Internal server error", error: error.message });
        }
    },

    inviteMembers : async (projectId, userId, members) => {
        try {
            const project = await Project.findById(projectId);
            if(!project) {
                throw new Error("Project not found");
            }

            const validMembers = members.filter(m => mongoose.Types.ObjectId.isValid(m));
            if(validMembers.length === 0) {
                throw new Error("No valid members to invite");
            }

            let newInvites = [];
            validMembers.forEach(memberId => {
                const isMember = project.members.some(m => m.user.equals(memberId));
                const isAlreadyInvited = project.pendingInvites?.includes(memberId);

                if(!isMember && !isAlreadyInvited) {
                    newInvites.push(memberId);
                }
            });

            if(newInvites.length > 0) {
                project.pendingInvites = [...(project.pendingInvites || []), ...newInvites];
                await project.save();

                newInvites.forEach(async (memberId) => {
                    await NotificationServices.ProjectInviteNotification(projectId, userId, memberId);
                });
            }

            return { message: "Invites sent successfully", invited: newInvites };
        } catch (error) {
            throw new Error(`Invite members service error: ${error}`, 500);
        }
    },

    confirmInvite : async (projectId, userId, accept) => {
        try {
           
            const project = await Project.findById(projectId);
            if(!project) {
                throw new Error("Project not found");
            }

            if (!project.pendingInvites?.includes(userId)) {
                throw new Error("User was not invited");
            }

            if (accept) {
                project.members.push({ user: userId, role: "participant"});
            }

            project.pendingInvites = project.pendingInvites.filter(id => !id.equals(userId));
            await project.save();

            console.log(project)
            return {message: accept ? "User joined the project" : "Invite declined"};
        } catch (error) {
            throw new Error(`Confirm invite service error: ${error}`, 500);
        }
    },

    removeMember: async (projectId, removedUserId) => {
        try {
            const project = await Project.findById(projectId);
            if(!project) {
                throw new Error("Project not found");
            }

            project.members = project.members.filter(m => !m.user.equals(removedUserId));
            await project.save();
            return project;
        } catch (error) {
            throw new Error(`Remove members service error: ${error}`, 500);
        }
    },

    joinProject : async (projectId, userId) => {
        try {
            const project = await Project.findById(projectId);
            if(!project) {
                throw new Error("Project not found");
            }

            if(project.private) {
                throw new Error("Project is private");
            }

            if(!project.members.some(m => m.user.equals(userId))) {
                project.members.push({ user: userId, role: "participant" });
                await project.save();
            }
            return project;
        } catch (error) {
            throw new Error(`Join project service error: ${error}`, 500);
        }
    },

    leaveProject : async(projectId, userId) => {
        try {
            const project = await Project.findById(projectId);
            if(!project) {
                throw new Error("Project not found");
            }
        
            const member = project.members.find(m => m.user.toString() === userId);
            if (member && member.role === "leader") {
                throw new Error("You are the leader, leader cannot leave the project.");
            }
        
            project.members = project.members.filter(m => !m.user.equals(userId));
            await project.save();
            return project;
        } catch (error) {
            throw new Error(`Leave project service error: ${error}`, 500);
        }
    },

    assignAdmin : async (projectId, assignAdminUserId) => {
        try {
            const project = await Project.findById(projectId);
            if(!project) {
                throw new Error("Project not found");
            }

            const member = project.members.find(m => m.user.equals(assignAdminUserId));
            if (!member) throw new Error("User not found in project");

            member.role = "admin";
            await project.save();
            return project;
        } catch (error) {
            throw new Error(`Assign admin project service error: ${error}`, 500);
        }
    },

    removeAdmin : async (projectId, removeAdminUserId) => {
        try {
            const project = await Project.findById(projectId);
            if(!project) {
                throw new Error("Project not found");
            }
            const member = project.members.find(m => m.user.equals(removeAdminUserId));
            if(!member) throw new Error("User not found in project");
            if( member.role === "participant") {
                throw new Error("User is participant");
            }
            member.role = "participant"
            await project.save();
            return project;
        } catch (error) {
            throw new Error(`Remove admin project service error: ${error}`, 500);
        } 
    },
};


const buildSectionTree = (sections, parentId) => {
    return sections
        .filter((section) => (parentId ? section.parent?.toString() === parentId.toString() : !section.parent))
        .map((section) => ({
            _id: section._id,
            name: section.name,
            participants: section.participants,
            children: buildSectionTree(sections, section._id),
        }));
};
export default projectServices;