import User from "../models/Users.mjs";
import findDocument from "../utils/findDocument.mjs";
import userServices from "../services/userServices.mjs";
import {httpError} from "../utils/httpResponse.mjs"
const userController = {
  getUserPublicInfo: async (req, res) => {
    try {
      const result = await findDocument(User,1,[{_id:req.user.id}],[{_id:0,displayname:1,avatar:1,}]);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof httpError) return res.status(error.statusCode).json(error.message);
      else return res.status(500).json(error);
    }
  },
  getUserFullInfo: async (req, res) => {
    try {
      const result = await findDocument(User,1,[{_id:req.user.id}],[{_id:0,displayname:1,email:1,avatar:1,username:1}]);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof httpError) return res.status(error.statusCode).json(error.message)
      else return res.status(500).json(error);
    }
  },
  updateFullUserInfo: async (req, res) => {
    try {
      const userId = req.user.id;
      const result = await userServices.updateUserFullInfo(userId,req.file,req.body)
      return res.status(result.statusCode).json(result.message);
    } catch (error) {
      if (error instanceof httpError) return res.status(error.statusCode).json(error.message)
      else return res.status(500).json(error);
    }
  },
  updateUserPassword: async (req, res) => {
    try {
      const userId = req.user.id;
      const result = await userServices.updateUserPassword(userId,req.body.oldPassword,req.body.newPassword);
      console.log(result)
      return res.status(result.statusCode).json(result.message);
    } catch (error) {
      if (error instanceof httpError) return res.status(error.statusCode).json(error.message)
      else return res.status(500).json(error);
    }
  },
};
export default userController;
