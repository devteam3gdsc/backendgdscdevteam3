import { Group } from "../models/Groups.mjs";

const roleMiddleware = (roles) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { groupId } = req.params;

      if (!groupId) {
        return res.status(400).json({ message: "Group ID is required." });
      }

      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found." });
      }

      // Find user's role in the group
      const member = group.members.find((m) => m.user.toString() === userId);

      if (!member) {
        return res
          .status(403)
          .json({ message: "You are not a member of this group." });
      }

      // Check if user's role is allowed
      if (!roles.includes(member.role)) {
        return res
          .status(403)
          .json({
            message: "You do not have permission to perform this action.",
          });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: "Server error.", error: error.message });
    }
  };
};
export default roleMiddleware;
