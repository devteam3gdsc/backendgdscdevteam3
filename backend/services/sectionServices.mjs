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
  createSection: async ({ ...data }, userId) => {
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
          participants:userId,
          children: [],
        });
      }

      return newSection; // Trả về newSection sau khi tạo xong
    } catch (error) {
      if (error instanceof httpError) throw error;
      else throw new httpError("createSection service error", 500);
    }
  },

  removeUsersInAllSections: async (userId,sectionId)=>{
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
      ]);
      const sectionIds = sections[0].allSections.map(s => s._id).concat(sectionId);
      const ancestorIds = await sectionServices.findAncestor([],sectionId);
      sectionIds = sectionIds.concat(ancestorIds);
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
removeUsersInOneSection: async (usersId,sectionId)=>{
  try {
    const ancestorIds = await sectionServices.findAncestor([],sectionId);
    const updateResult = await Section.updateMany(
      { _id: { $in: ancestorIds } },
      { $pull: { participants: {$in:usersId} } },
    );
    if (updateResult.matchedCount === 0) {
      throw new httpError("cant find section", 404);}
  } catch (error) {
    if (error instanceof httpError) throw error;
    else throw new httpError("removeUser service error", 500);
  }
},
  deleteSections: async (sectionId)=>{
   try {
    const section = await Section.findById(sectionId);
    if (!section){
      throw new httpError(404,"deleteSectionService error: cant find section!");
    }
    else {
      await section.deleteOne();
      if (section.children){
        section.children.map((section)=>{sectionServices.deleteSections(section)})
      }
      else return ;
    }
   } catch (error) {
    if (error instanceof httpError) throw error;
    else throw new httpError("deleteSection service error", 500);
   }
  },
  addParticipant: async (usersId,sectionId)=>{
    try {
      const sections = await Section.aggregate([
        {$match:{_id:sectionId}},
        {$graphLookup:{
          from:"sections",
          startWith:"$_id",
          connectFromField:"_id",
          connectToField:"parent",
          as:"allSections"
        }}
      ])
      const sectionIds = sections[0].allSections.map(s => s._id).concat(sectionId);
      const updateResult = await Section.updateMany(
        { _id: { $in: sectionIds } },
        { $push: { participants:{$each:usersId} } },
      );
      if (updateResult.matchedCount === 0) {
        throw new httpError("cant find section", 404);}
    } catch (error) {
      if (error instanceof httpError) throw error;
      else throw new httpError("deleteSection service error", 500);
    }
  },
  findAncestor: async (ancestor,sectionId)=>{
    try {
      const id = new mongoose.Types.ObjectId(`${sectionId}`);
      const section = await Section.findById(id);
      if (!section.parent){
        return ancestor;
      }
      else {
        ancestor.push(section.parent);
        await sectionServices.findAncestor(ancestor,section.parent);
      }
      return ancestor;
    } catch (error) {
      if (error instanceof httpError) throw error;
      else throw new httpError("findAncestor service error", 500);
    }
  },
  getSectionDescription: async (sectionId)=>{
    try {
      const section = await Section.findById(sectionId,{description:1})
      if (!section){
        throw new httpError(400,"cant find section")
      }
      return section.description;
    } catch (error) {
      if (error instanceof httpError) throw error;
      else throw new httpError("getDescription service error", 500);
    }
  }
};

export default sectionServices;
