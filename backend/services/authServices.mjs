import bcrypt from "bcrypt";
import findDocument from "../utils/findDocument.mjs";
import User from "../models/Users.mjs";
import { httpError, httpResponse } from "../utils/httpResponse.mjs";
import tokensAndCookies from "../utils/tokensAndCookies.mjs";
import updateDocument from "../utils/updateDocument.mjs";
const authServices = {
  passwordCheck: async (password, hashedPassword) =>
    await bcrypt.compare(password, hashedPassword),
  createHashedPassword: async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  },
  login: async ({ ...data }) => {
    try {
      const { username, password } = data;
      const user = await User.findOne({
        $or: [{ username: username }, { email: username }],
      });
      if (!user) throw new httpError("Username or email doesnt exist!", 400);
      if (await authServices.passwordCheck(password, user.password)) {
        const newAccessToken = tokensAndCookies.createNewAccessToken(user._id);
        const newRefreshToken = tokensAndCookies.createNewRefreshToken(
          user._id
        );
        await user.updateOne({ $push: { refreshTokens: newRefreshToken } });
        return {
          newAccessToken: newAccessToken,
          newRefreshToken: newRefreshToken,
        };
      } else throw new httpError("Wrong password!", 400);
    } catch (error) {
      if (error instanceof httpError) throw error;
      else {
        throw new httpError(
          `Login services error: ${error.message || error}`,
          500
        );
      }
    }
  },
  logout: async (refreshToken) => {
    try {
      if (!refreshToken) throw new httpError("No refresh Token provided!", 404);
      await updateDocument(
        User,
        1,
        [{ refreshTokens: { $in: [refreshToken] } }],
        [{ $pull: { refreshTokens: refreshToken } }]
      );
      return new httpResponse("Logged Out!", 200);
    } catch (error) {
      if (error instanceof httpError) throw error;
      else {
        throw new httpError(
          `loggout services error: ${error.message || error}`,
          500
        );
      }
    }
  },
  requestRefreshToken: async (refreshToken) => {
    try {
      if (!refreshToken) throw new httpError("refreshToken is required", 404);
      const userId = tokensAndCookies.refreshTokenDecoding(refreshToken).id;
      const newAccessToken = tokensAndCookies.createNewAccessToken(userId);
      const newRefreshToken = tokensAndCookies.createNewRefreshToken(userId);
      let userRefreshTokens = (
        await findDocument(User, 1, [{ _id: userId }], [{ refreshTokens: 1 }])
      ).refreshTokens;
      userRefreshTokens = userRefreshTokens.filter(
        (token) => token !== refreshToken
      );
      userRefreshTokens.push(newRefreshToken);
      await updateDocument(
        User,
        1,
        [{ _id: userId }],
        [{ $set: { refreshTokens: userRefreshTokens } }]
      );
      return {
        newAccessToken: newAccessToken,
        newRefreshToken: newRefreshToken,
      };
    } catch (error) {
      if (error instanceof httpError) throw error;
      else {
        throw new httpError(
          `refreshtoken services error: ${error.message || error}`,
          500
        );
      }
    }
  },
};
export default authServices;
