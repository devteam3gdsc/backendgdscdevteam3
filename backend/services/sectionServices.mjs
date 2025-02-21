import mongoose from "mongoose";
import { Section } from "../models/Groups.mjs";
import { httpError } from "../utils/httpResponse.mjs";
import findDocument from "../utils/findDocument.mjs";

const sectionServices = {
  // createSection: async ({ ...data }) => {
  //   try {
  //     const id = data.parentId
  //       ? new mongoose.Types.ObjectId(`${data.parentId}`)
  //       : new mongoose.Types.ObjectId(`${data.projectId}`);
  //     if (data.parentId) {
  //       const parentSection = await Section.findById(id);
  //       const projectId = new mongoose.Types.ObjectId(`${data.projectId}`)
  //       if (!parentSection)
  //         throw new httpError("cant find the parent Section", 404);
  //       const newSection = await Section.create({
  //         ...data,
  //         project: projectId,
  //         participants: parentSection.participants,
  //         children: [],
  //         parent: id,
  //       });
  //       parentSection.children.push(newSection._id);
  //       await parentSection.save();
  //     } else
  //       await Section.create({
  //         ...data,
  //         project: id,
  //         parent: null,
  //         children: [],
  //       });
  //   } catch (error) {
  //     if (error instanceof httpError) throw error;
  //     else throw new httpError("createSection service error", 500);
  //   }
  // },
  createSection: async ({ ...data }) => {
    try {
      const id = data.parentId
        ? new mongoose.Types.ObjectId(`${data.parentId}`)
        : new mongoose.Types.ObjectId(`${data.projectId}`);

      let newSection; // Khai báo biến newSection để dùng chung

      if (data.parentId) {
        const parentSection = await Section.findById(id);
        const projectId = new mongoose.Types.ObjectId(`${data.projectId}`);

        if (!parentSection)
          throw new httpError("cant find the parent Section", 404);

        newSection = await Section.create({
          ...data,
          project: projectId,
          participants: parentSection.participants,
          children: [],
          parent: id,
        });

        parentSection.children.push(newSection._id);
        await parentSection.save();
      } else {
        newSection = await Section.create({
          ...data,
          project: id,
          parent: null,
          children: [],
        });
      }

      return newSection; // Trả về newSection sau khi tạo xong
    } catch (error) {
      if (error instanceof httpError) throw error;
      else throw new httpError("createSection service error", 500);
    }
  },

  removeUser: async (userId,sectionId)=>{
    try {
      const sections = await Section.aggregate([
        {$match:{_id:sectionId}},
        {$graphLookup:
          {
            from:"sections",
            startWith:"$_id",
            connectFromField:"_id",
            connectToField:"parent",
            as:"allSections"
          }
      }
      ])
      const sectionIds = sections[0].allSections.map(s => s._id).concat(sectionId);
      const updateResult = await Section.updateMany(
      { _id: { $in: sectionIds } },
      { $pull: { participants: userId } },
    );
    if (updateResult.matchedCount === 0) {
      throw new httpError("cant find section", 404);}
  } catch (error){
    if (error instanceof httpError) throw error;
    else throw new httpError("removeUser service error", 500);
  }
},
};

export default sectionServices;
