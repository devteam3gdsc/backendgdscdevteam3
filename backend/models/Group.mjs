import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
{
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    private: { type: Boolean, default: false },
    moderation: { type: Boolean, default: false },
    avatar: { type: String, default: "" },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [
        {   
            _id:false,
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            avatar:String,
            role: { type: String, enum: ["creator", "admin", "member"], required: true }
        }
    ],
    totalMembers:{
        type: Number,
        default:0
    },
    totalPosts:{
        type:Number,
        default:0
    },
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
}, { timestamps: true });

const Group = mongoose.model("Group", groupSchema);

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: "" },
    group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
    roles: [
        {
            user: { 
                type: mongoose.Schema.Types.ObjectId,  
                ref: "User",
                required: true
            },
            role: {
                type: String,
                enum: ["leader", "admin", "participant"],
            }
        },
    ], 
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

const Project = mongoose.model("Project", projectSchema);

const sectionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: "" },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true }, // Section thuộc Team nào?
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Section", default: null }, // Section cha (nếu có)
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }], // Danh sách section con
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Danh sách người có quyền trong section
}, { timestamps: true });

const Section = mongoose.model("Section", sectionSchema);

export {Group, Project, Section};
