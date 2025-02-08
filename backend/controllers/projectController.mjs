import projectServices from "../services/projectServices.mjs";

const projectController = {
    createProject : async (req, res) => {
        try {
            const newProject = await projectServices.createProject(req.body, req.params.groupId, req.user.id);
            res.status(200).json(newProject);
        } catch (error) {
            if (error instanceof httpError)
                return res.status(error.statusCode).json(error.message);
            else return res.status(500).json(error);
        }
    },

    updateProject : async (req, res) => {
        try {
            const updatedProject = await projectServices.updateProject(req.params.projectId, req.body);
            console.log(updatedProject)
            res.status(200).json(updatedProject);
        } catch (error) {
            if (error instanceof httpError)
                return res.status(error.statusCode).json(error.message);
            else return res.status(500).json(error);
        }
    },

    deleteProject : async (req, res) => {
        try {
            const result = await projectServices.deleteProject(req.params.projectId);
            res.status(200).json({message: "Deleting project successfully"});
        } catch (error) {
            if (error instanceof httpError)
                return res.status(error.statusCode).json(error.message);
            else return res.status(500).json(error);
        }
    },

};

export default projectController;