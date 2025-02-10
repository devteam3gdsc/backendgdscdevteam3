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
    totalPosts: {
      type: Number,
      default: 0,
    },
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
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["leader", "admin", "participant"], 
          default: "participant",
        },
      },
    ],
    pendingInvites: [
      {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      }
    ],
    sections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }],
    totalPosts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const Project = mongoose.model("Project", projectSchema);

const sectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Section", default: null },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }],
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Danh sách người có quyền trong section
    totalPosts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const Section = mongoose.model("Section", sectionSchema);

export { Group, Project, Section };
