const User = require("../models/User");

// Helper function to check if user has permission for a specific action
const hasPermission = (
  userPermissions,
  moduleName,
  action,
  isNested = false,
) => {
  // Find the module in user's permissions
  const modulePermission = userPermissions.find(
    (perm) => perm.moduleName === moduleName,
  );

  if (!modulePermission) {
    return false;
  }

  // Check if it's a nested permission request
  if (isNested) {
    return modulePermission.nestedPermissions.includes(action);
  }

  // Check if it's a basic action
  return modulePermission.actions.includes(action);
};

// Middleware factory for basic actions
const checkPermission = (moduleName, action) => {
  return async (req, res, next) => {
    try {
      // req.user comes from JWT middleware
      const userId = req.user.userId;

      const user = await User.findById(userId).populate("roles");

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Aggregate all permissions from active roles
      let userPermissions = [];

      user.roles.forEach((role) => {
        if (role.status === "Active" && !role.isDeleted) {
          // Merge permissions from all roles
          role.permissions.forEach((perm) => {
            const existingModule = userPermissions.find(
              (p) => p.moduleName === perm.moduleName,
            );

            if (existingModule) {
              // Merge actions
              perm.actions.forEach((action) => {
                if (!existingModule.actions.includes(action)) {
                  existingModule.actions.push(action);
                }
              });

              // Merge nested permissions
              perm.nestedPermissions.forEach((nestedPerm) => {
                if (!existingModule.nestedPermissions.includes(nestedPerm)) {
                  existingModule.nestedPermissions.push(nestedPerm);
                }
              });
            } else {
              // Add new module permission
              userPermissions.push({
                moduleName: perm.moduleName,
                actions: [...perm.actions],
                nestedPermissions: [...perm.nestedPermissions],
              });
            }
          });
        }
      });

      // Check if user has the required permission
      if (!hasPermission(userPermissions, moduleName, action)) {
        return res.status(403).json({
          message: `Access denied: No ${action} permission for ${moduleName}`,
        });
      }

      // Attach user permissions to request for later use
      req.userPermissions = userPermissions;

      next();
    } catch (error) {
      console.error("Permission check error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };
};

// Middleware factory for nested permissions
const checkNestedPermission = (moduleName, nestedAction) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const user = await User.findById(userId).populate("roles");

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Aggregate all permissions from active roles
      let userPermissions = [];

      user.roles.forEach((role) => {
        if (role.status === "Active" && !role.isDeleted) {
          role.permissions.forEach((perm) => {
            const existingModule = userPermissions.find(
              (p) => p.moduleName === perm.moduleName,
            );

            if (existingModule) {
              // Merge nested permissions
              perm.nestedPermissions.forEach((nestedPerm) => {
                if (!existingModule.nestedPermissions.includes(nestedPerm)) {
                  existingModule.nestedPermissions.push(nestedPerm);
                }
              });
            } else {
              userPermissions.push({
                moduleName: perm.moduleName,
                actions: [...perm.actions],
                nestedPermissions: [...perm.nestedPermissions],
              });
            }
          });
        }
      });

      // Check if user has the required nested permission
      if (!hasPermission(userPermissions, moduleName, nestedAction, true)) {
        return res.status(403).json({
          message: `Access denied: No ${nestedAction} permission for ${moduleName}`,
        });
      }

      req.userPermissions = userPermissions;
      next();
    } catch (error) {
      console.error("Nested permission check error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };
};

// Export both middlewares
module.exports = {
  checkPermission,
  checkNestedPermission,
};
