import { Group, Project, Section } from "../models/Groups.mjs";

const roleMiddleware = (level, roles) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      let item, itemId;

      // Xác định model và tham số dựa trên level
      if (level === "group") {
        itemId = req.params.groupId;
        if (!itemId) return res.status(400).json({ message: "Group ID is required." });
        item = await Group.findById(itemId);
      } else if (level === "project") {
        itemId = req.params.projectId;
        if (!itemId) return res.status(400).json({ message: "Project ID is required." });
        item = await Project.findById(itemId);
      } else if (level === "team") {
        itemId = req.params.teamId;
        if (!itemId) return res.status(400).json({ message: "Team ID is required." });
        item = await Team.findById(itemId);
      } else {
        return res.status(400).json({ message: "Invalid level." });
      }

      if (!item) {
        return res.status(404).json({ message: `${level.charAt(0).toUpperCase() + level.slice(1)} not found.` });
      }

      // Kiểm tra thành viên trong group/project/team
      const member = item.members.find((m) => m.user.toString() === userId);
      if (!member) {
        return res.status(403).json({ message: `You are not a member of this ${level}.` });
      }

      // Kiểm tra quyền của user
      if (!roles.includes(member.role)) {
        return res.status(403).json({ message: `You do not have permission in this ${level}.` });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: "Server error.", error: error.message });
    }
  };
};

const checkAdmin = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if(!post) {
      return res.status(404).json({ message: "Post not found"});
    }

    const { group, project, section } = post;
    let entity, entityType;
    if( group ) {
      entity = await Group.findById( group );
      entityType = "group";
    } else if ( project )  {
      entity = await Project.findById( project );
      entityType = "project";
    } else if ( section ) {
      entity = await Section.findById( section );
      entityType = "section";
    }

    if(!entity) {
      return res.status(404).json({ message: "Associated entity not found" });
    }

    const userRole = entity.members.find(m => m.user.toString() === req.user.Id);
    if (userRole !== "admin") {
      return res.status(403).json({ message: "You are not authorized to moderate this post" });
    }
    req.entity = entity;
    req.entityType = entityType;

    next(); // Cho phép tiếp tục nếu là admin
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.toString() });
  }
};

export default roleMiddleware ;