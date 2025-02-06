import userServices from "../services/userServices.mjs";
import User from "../models/Users.mjs";
import { describe, it, jest } from "@jest/globals";
import findDocument from "../utils/findDocument.mjs";

jest.mock("../models/Users");

describe("testing findDocument with User", () => {
  it("should return a user password", async () => {
    const mockUser = {
      _id: "123",
      username: "nam",
      password: "000",
    };
    User.findOne.mockr;
    const id = "123";
    const user = findDocument(User, 1, { _id: id }, { password: 1 });
  });
});
