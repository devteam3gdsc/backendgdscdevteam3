import bcrypt from "bcrypt";
import User from "../models/Users.mjs";
import jwt, { decode } from "jsonwebtoken";
import { httpError } from "./httpResponse.mjs";

const tokensAndCookies = {
    createNewRefreshToken:  (userId) =>  jwt.sign({id:userId},process.env.JWT_REFRESH_SECRET,{expiresIn:"365d"}),
    createNewAccessToken: (userId) => jwt.sign({id:userId},process.env.JWT_ACCESS_SECRET,{expiresIn:"300s"}),
    cookieSet: (res,refreshToken)=>{
        try {
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true, // Prevents JavaScript access
                secure: process.env.NODE_ENV === "production", // Use HTTPS in production
                secure: true,
                sameSite: "None",
                path: "/", // Global path for cookies
                maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year in milliseconds
            });
        } catch (error) {
            throw new Error(`error in setting cookies: ${error}`)
        }
    },
    refreshTokenDecoding: (token) =>{
        try {
            const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            return decoded;
        } catch (error) {
            throw new Error(`Token verify error: ${error.message}`);
        }
    },
    accessTokenDecoding: (token) =>{
        try {
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            return decoded.id;
        } catch (error) {
            throw new Error(`Token verify error: ${error.message}`);
        }
},
}

export default tokensAndCookies