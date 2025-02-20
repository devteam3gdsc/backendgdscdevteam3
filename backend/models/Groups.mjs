import mongoose from "mongoose";
import User from "./Users.mjs";
const memberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: {
      type: String,
      enum: ["creator", "admin", "member"],
      default: "member",
      required: true,
    },
    avatar: String,
  },
  { _id: false }
)
const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    private: { type: Boolean, default: false },
    moderation: { type: Boolean, default: false },
    avatar: {
      type: String,
      default:
        "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541",
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      memberSchema
    ],
    pendingInvites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
    totalMembers: {
      type: Number,
      default: 1,
    },
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
    avatar: {
      type: String,
      default:
        "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541",
    },
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
        avatar: String,
        role: {
          type: String,
          enum: ["leader", "admin", "participant"],
          default: "participant",
        },
      },
      { _id: false },
    ],
    pendingInvites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    sections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }],
    totalMembers: {
      type: Number,
      default: 1,
    },
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
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      default: null,
    },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }],
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Danh sách người có quyền trong section
    totalMembers: {
      type: Number,
      default: 1,
    },
    totalPosts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const Section = mongoose.model("Section", sectionSchema);

export { Group, Project, Section };
