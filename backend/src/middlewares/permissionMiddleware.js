const User = require("../models/User");

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      // req.user comes from JWT middleware
      const userId = req.user.userId;

      const user = await User.findById(userId).populate("roles");

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Collect permissions from all roles
      let permissions = [];

      user.roles.forEach((role) => {
        if (role.status === "Active") {
          permissions.push(...role.permissions);
        }
      });

      // Check required permission
      if (!permissions.includes(requiredPermission)) {
        return res.status(403).json({ message: "Access denied" });
      }

      next();
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  };
};

module.exports = checkPermission;
