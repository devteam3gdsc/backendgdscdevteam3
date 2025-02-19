import { Group, Project, Section } from "../models/Groups.mjs";
import Post from "../models/Posts.mjs";
import mongoose from "mongoose";
const checkAdmin = async (req, res, next) => {
  try {
    const postId = new mongoose.Types.ObjectId(`${req.params.postId}`)
    const post = await Post.findById(postId);
    if(!post) {
      return res.status(404).json({ message: "Post not found"});
    }

    const { group, project, section } = post;
    let entity, entityType;
    if( group ) {
      entity = await Group.findById( group );
      entityType = "Group";
    } else if ( project )  {
      entity = await Project.findById( project );
      entityType = "Project";
    } else if ( section ) {
      entity = await Section.findById( section );
      entityType = "Section";
    }
   
    
    if(!entity) {
      return res.status(404).json({ message: "Associated entity not found" });
    }

    const userRole = entity.members.find(m => m.user.toString() === req.user.id);
    console.log(userRole)
    if (userRole.role !== "admin") {
      return res.status(403).json({ message: "You are not authorized to moderate this post" });
    }
    req.entity = entity;
    req.entityType = entityType;

    next(); // Cho phép tiếp tục nếu là admin
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.toString() });
  }
};

export default checkAdmin ;