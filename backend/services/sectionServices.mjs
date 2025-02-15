import mongoose from "mongoose";
import { Section } from "../models/Groups.mjs";
import { httpError } from "../utils/httpResponse.mjs";
import findDocument from "../utils/findDocument.mjs";

const sectionServices = {
  createSection: async ({ ...data }) => {
    try {
      const id = data.parentId
        ? new mongoose.Types.ObjectId(`${data.parentId}`)
        : new mongoose.Types.ObjectId(`${data.projectId}`);
      if (data.parentId) {
        const parentSection = await Section.findById(id);
        if (!parentSection)
          throw new httpError("cant find the parent Section", 404);
        const newSection = await Section.create({
          ...data,
          project: projectId,
          participants: parentSection.participants,
          project: projectId,
          children: [],
          parent: id,
        });
        parentSection.children.push(newSection._id);
        await parentSection.save();
      } else
        await Section.create({
          ...data,
          project: id,
          parent: null,
          children: [],
        });
    } catch (error) {
      if (error instanceof httpError) throw error;
      else throw new httpError("createSection service error", 500);
    }
  },
};

export default sectionServices;
