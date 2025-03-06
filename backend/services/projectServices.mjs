import {Group, Project, Section} from "../models/Groups.mjs"
import User from "../models/Users.mjs";
import mongoose from "mongoose"
import NotificationServices from "./notificationServices.mjs";
import { httpError, httpResponse } from "../utils/httpResponse.mjs";
import getRandomAvatar from "../utils/avatarHelper.mjs";


const projectServices = {
//-----------PROJECT-----------------
   findProjects: async (userId, { ...data }) => {
    try {
      const page = data.page || 1;
      const limit = data.limit || 5;
      const skip = (page - 1) * limit;
      const groupId = data.groupId?new mongoose.Types.ObjectId(`${data.groupId}`):""
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
      if (groupId){
        matchData.push({group:groupId})
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
                  localField: "group",
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
                  groupName: { $arrayElemAt: ["$groupData.name", 0] },
                  joined: {
                    $in: [userId, "$members.user"], // 🔹 Kiểm tra xem userId có trong members không
                  },
                },
              },
              {$project:{
                groupData:0
              }}
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
    createProject : async (data,avatarFile, groupId, userId) => {
        try {
            const group = await Group.findById(groupId);
            if(!group) {
                throw new httpError("Group not found",404);
            }
            const avatarURL = avatarFile?avatarFile.path:getRandomAvatar("project");
            const userAvatar = (await User.findById(userId,{avatar:1})).avatar
            const newProject = await Project.create({
                ...data,
                avatar:avatarURL,
                group: groupId,
                creator: userId,
                members:[{ user: userId, role: "leader", avatar: userAvatar}]
            });
            return newProject;
        } catch (error) {
            throw new Error(`Creating project service error: ${error}`, 500);
        }
    },

    updateProject : async (projectId, updateData, userId) => {
        try { 
            const updatedProject = await Project.findByIdAndUpdate(
                projectId, 
                { $set: updateData }, // Use $set to merge updates instead of replacing the document
                { new: true, upsert: false, runValidators: true } // Ensure validation and no unintended document creation
            );
            
            if (!updatedProject) {
                throw new Error("Project not found.");
            }

            await NotificationServices.sendUpdateNotification({
              senderId: userId,
              entityId: projectId,
              entityType: "Project",
              notificationType: "project_update_profile",
              category: "groups",
              customMessage: "updated project "
            });

            return updatedProject;
        } catch (error) {
            throw new Error(`Updating project service error: ${error}`, 500);
        }
    },
    updateProjectFull: async (userId ,projectId, avatarFile, ...updateData) => {
      try {
          const project = await Project.findById(projectId);
          if (!project) {
              throw new Error("Project not found.");
          }
  
          const avatar = project.avatar;
          const avatarURL = avatarFile ? avatarFile.path : avatar;
  
          // Xóa avatar cũ nếu không phải avatar mặc định
          try {
              if (avatar && avatar !== "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541") {
                  await fileDestroy(avatar, "image");
              }
          } catch (err) {
              console.error("Error deleting file:", err);
          }
  
          // Gán dữ liệu mới
          project.avatar = avatarURL;
          Object.keys(updateData[0] || {}).forEach((key) => {
              project[key] = updateData[0][key];
              project.markModified(key);
          });
  
          await project.save();
  
          // Kiểm tra lại sau khi cập nhật
          const checkProject = await Project.findById(projectId);
          console.log("Updated project:", checkProject);

          await NotificationServices.sendUpdateNotification({
            senderId: userId,
            entityId: projectId,
            entityType: "Project",
            notificationType: "project_update_profile",
            category: "groups",
            customMessage: "updated project"
          });
          
          return new httpResponse("updated successfully", 200);
      } catch (error) {
          console.error("Updating group service error:", error);
          throw new Error(`Updating group service error: ${error.message}`);
      }
  },

    deleteProject: async (projectId, userId) => {
        try {
            const project = await Project.findById(projectId);
            
            if (!project) {
                throw new Error("Project not found.");
            }
    
            await NotificationServices.sendUpdateNotification({
              senderId: userId,
              entityId: projectId,
              entityType: "Project",
              notificationType: "project_delete",
              category: "groups",
              customMessage: "deleted project "
            });
            await Section.deleteMany({ project: projectId });
            await Project.findByIdAndDelete(projectId);

            return { message: "Project and its sections deleted successfully" };
        } catch (error) {
            throw new Error(`Deleting project service error: ${error}`);
        }
    },

    getFullProjectData: async (projectId, userId) => {
      try {
          if (!mongoose.Types.ObjectId.isValid(projectId)) {
              console.error("projectId không hợp lệ:", projectId);
              return { message: "Invalid projectId" };
          }
  
         const projectData = await Project.findById(projectId,{
            name:1,
            description:1,
            note:1,
            totalPosts:1,
            totalMembers:1,
            group:1,
            avatar:1,
            members:1,
            private:1
         })
  
          if (!projectData) {
              return { message: "Project not found" };
          }
          const members = projectData.members || [];
          const groupMembers = (await Group.findById(projectData.group,{members:1})).members
          const isJoined = members.some(m => m.user.toString() === userId.toString());

          const idValidation = groupMembers.some((mem)=>mem.user.equals(userId));
          const canJoin = ((!projectData.private)&&(idValidation))?true:false
          const sortedMembers = members.sort((a, b) => {
              return b.following?.includes(userId) - a.following?.includes(userId);
          });
          
          const memberAvatars = sortedMembers.slice(0, 4).map(m => ({ avatar: m.avatar, role: m.role }));
  
          const sections = await Section.find({ project: projectId })
              .select("_id name parent participants")
              .lean();
  
          const sectionTree = buildSectionTree(sections, null,userId);
          const userRole = members.find(m => m.user.toString() === userId.toString())?.role || "guest";
          return {
              name: projectData.name,
              bio: projectData.description,
              note:projectData.note,
              avatar: projectData.avatar,
              members: memberAvatars,
              numberOfMembers: members.length,
              totalPosts:projectData.totalPosts,
              sections: sectionTree,
              joined: isJoined,
              canJoin,
              role: userRole
          };
      } catch (error) {
          console.error("Error fetching project data:", error);
          return { message: "Internal server error", error: error.message };
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
                  //await NotificationServices.GroupInviteNotification(groupId, userId, memberId);
                  await NotificationServices.sendNotification({
                      receiveId: memberId,
                      senderId: userId,
                      entityId: projectId,
                      entityType: "Project",
                      notificationType: "project_invite",
                      category: "groups",
                      customMessage: "invited you to join project"
                  });
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
            const user = await User.findById(userId)
            if(!project) {
                throw new Error("Project not found");
            }

            if (!project.pendingInvites?.includes(userId)) {
                throw new Error("User was not invited");
            }

            if (accept) {
                project.members.push({ user: userId, avatar:user.avatar, role: "participant"});
            }

            project.pendingInvites = project.pendingInvites.filter(id => !id.equals(userId));
            project.totalMembers = project.totalMembers + 1
            await project.save();

            console.log(project)
            return {message: accept ? "User joined the project" : "Invite declined"};
        } catch (error) {
            throw new Error(`Confirm invite service error: ${error}`, 500);
        }
    },

    removeMember: async (projectId, removedUserId, userId) => {
        try {
            const project = await Project.findById(projectId);
            if(!project) {
                throw new Error("Project not found");
            }
            project.totalMembers = project.totalMembers - 1
            project.members = project.members.filter(m => !m.user.equals(removedUserId));
            await project.save();
            await NotificationServices.sendNotification({
              receiveId: removedUserId,
              senderId: userId,
              entityId: projectId,
              entityType: "Project",
              notificationType: "project_remove",
              category: "groups",
              customMessage: "removed you from project "
          });
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
                project.totalMembers = project.totalMembers + 1
                const user = await User.findById(userId)
                project.members.push({ user: userId,avatar:user.avatar, role: "participant" });
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
            const sectionUpdate = await Section.updateMany({project:projectId},{$pull:{participants:userId}})
            if (sectionUpdate.matchedCount === 0){
              throw new httpError("cant find sections",404);
            }
            return project;
        } catch (error) {
            throw new Error(`Leave project service error: ${error}`, 500);
        }
    },

    assignAdmin : async (projectId, assignAdminUserId, userId) => {
        try {
            const project = await Project.findById(projectId);
            if(!project) {
                throw new Error("Project not found");
            }

            const member = project.members.find(m => m.user.equals(assignAdminUserId));
            if (!member) throw new Error("User not found in project");

            member.role = "admin";
            await project.save();
            await NotificationServices.sendNotification({
              receiveId: assignAdminUserId,
              senderId: userId,
              entityId: projectId,
              entityType: "Project",
              notificationType: "project_admin_add",
              category: "groups",
              customMessage: "added you to admin in project "
          });
            return project;
        } catch (error) {
            throw new Error(`Assign admin project service error: ${error}`, 500);
        }
    },

    removeAdmin : async (projectId, removeAdminUserId, userId) => {
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
            await NotificationServices.sendNotification({
              receiveId: removeAdminUserId,
              senderId: userId,
              entityId: projectId,
              entityType: "Project",
              notificationType: "project_admin_remove",
              category: "groups",
              customMessage: "removed you as an admin in project "
          });
            return project;
        } catch (error) {
            throw new Error(`Remove admin project service error: ${error}`, 500);
        } 
    },
};


const buildSectionTree = (sections, parentId,userId) => {
    return sections
        .filter((section) => (parentId ? section.parent?.toString() === parentId.toString() : !section.parent))
        .map((section) => ({
            _id: section._id,
            name: section.name,
            participants: section.participants,
            isJoined: section.participants.some((par)=>par.equals(userId)),
            children: buildSectionTree(sections, section._id),
        }));
};
export default projectServices;

