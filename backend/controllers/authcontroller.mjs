import User from "../models/Users.mjs";
import jwt from "jsonwebtoken";
import userServices from "../services/userServices.mjs";
import authServices from "../services/authServices.mjs";
import tokensAndCookies from "../utils/tokensAndCookies.mjs";
import { httpError } from "../utils/httpResponse.mjs";
const authController = {
  // [POST] /auth/sigup
  signup: async (req, res) => {
    try {
      const result = await userServices.signUpUser(req.body)
      return res.status(result.statusCode).json(result.message);
    } catch (error) {
      if (error instanceof httpError) return res.status(error.statusCode).json(error.message)
      else return res.status(error).json(error);
    }
  },
  // [POST] /auth/login
  login: async (req, res) => {
    try {
      const result = await authServices.login(req.body);
      tokensAndCookies.cookieSet(res,result.newRefreshToken);
      return res.status(200).json({newAccessToken:result.newAccessToken});
    } catch (error) {
      if (error instanceof httpError) return res.status(error.statusCode).json(error.message)
      else return res.status(error).json(error);
    }
  },
  // [POST] /auth/logout
  logout: async (req, res) => {
    try {
      const result =await authServices.logout(req.cookies.refreshToken);
      res.clearCookie("refreshToken"); // Xoa cookie tren client
      return res.status(result.statusCode).json(result.message)
    } catch (error) {
      if (error instanceof httpError) return res.status(error.statusCode).json(error.message)
      else return res.status(500).json(error);
    }
  },
  // [POST] /auth/refresh
  requestRefreshToken: async (req, res) => {
    try {
      const result =await authServices.requestRefreshToken(req.cookies.refreshToken);
      tokensAndCookies.cookieSet(res,result.newRefreshToken);
      return res.status(200).json({newAccessToken:result.newAccessToken})
    } catch (error) {
      if (error instanceof httpError) return res.status(error.statusCode).json(error.message)
      else return res.status(500).json(error);
  }}
}


export default authController;
