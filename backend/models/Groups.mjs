import mongoose from "mongoose";
import User from "./Users.mjs";
const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    private: { type: Boolean, default: false },
    moderation: { type: Boolean, default: false },
    avatar: { type: String, default: "" },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: {
          type: String,
          enum: ["creator", "admin", "member"],
          default: "member",
          required: true,
        },
      },
    ],
    pendingInvites: [
      {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      }
    ],
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }], //danh sách bài viết
  },
  { timestamps: true },
);

const Group = mongoose.model("Group", groupSchema);

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    private: { type: Boolean, default: false },
    avatar: { type: String, default: "" },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["leader", "admin", "member"],
          default: "member",
        },
      },
    ],
  },
  { timestamps: true },
);

const Project = mongoose.model("Project", projectSchema);

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    }, // Team thuộc Project nào?
    sections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }], // Chứa các Section (Landing Page, Sign In/Up)
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Thành viên trong team
  },
  { timestamps: true },
);

const Team = mongoose.model("Team", teamSchema);

const sectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true }, // Section thuộc Team nào?
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      default: null,
    }, // Section cha (nếu có)
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }], // Danh sách section con
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Danh sách người có quyền trong section
  },
  { timestamps: true },
);

const Section = mongoose.model("Section", sectionSchema);

export { Group, Project, Team, Section };
