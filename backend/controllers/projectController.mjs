import mongoose from "mongoose";
import projectServices from "../services/projectServices.mjs"

const projectController = {
    findProjects: async (req,res)=>{
        try {
            const userId = new mongoose.Types.ObjectId(`${req.user.id}`)
            const result = await projectServices.findProjects(userId,req.query)
        } catch (error) {
            if (error instanceof httpError)
                return res.status(error.statusCode).json(error.message);
              else return res.status(500).json(error);
        }
    }
}

export default projectController