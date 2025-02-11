import { httpError,httpResponse } from "../utils/httpResponse.mjs";
import groupServices from "../services/groupServices.mjs";
import mongoose from "mongoose";
import postServices from "../services/postServices.mjs";

const groupController = {
    createGroup: async (req, res) => {
        try {
          const newGroup = await groupServices.createGroup(req.body, req.user.id);
          return res.status(201).json(newGroup);
        } catch (error) {
          if (error instanceof httpError)
            return res.status(error.statusCode).json(error.message);
          else return res.status(500).json(error);
        }
      },
      findGroups: async (req,res) =>{
        try {
            const userId = new mongoose.Types.ObjectId(`${req.user.id}`)
            const result = await groupServices.findGroups(userId,req.query);
            return res.status(200).json(result);
        } catch (error) {
            if (error instanceof httpError)
                return res.status(error.statusCode).json(error.message);
              else return res.status(500).json(error);
        }
        },
        // getGroupPosts: async (req,res) =>{
        //     try {
        //         const userId = new mongoose.Types.ObjectId(`${req.user.id}`);
        //         const groupId = new mongoose.Types.ObjectId(`${req.params.groupId}`);
        //         const result = await postServices.getPosts(userId,{group:groupId,st})
        //     } catch (error) {
                
        //     }
        // }
}

export default groupController;