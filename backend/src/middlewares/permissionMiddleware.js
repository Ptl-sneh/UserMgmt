const User = require("../models/User");
const Role = require("../models/Role");

// Helper function to check if user has permission for a specific action
const hasPermission = (userPermissions, moduleName, action) => {
  // Find the module in user's permissions
  const modulePermission = userPermissions.find(
    (perm) => perm.moduleName === moduleName,
  );

  if (!modulePermission) {
    return false;
  }

  // Check if user has the required action
  return modulePermission.actions && 
         modulePermission.actions.includes(action);
};

// Middleware factory for checking permissions
const checkPermission = (moduleName, action) => {
  return async (req, res, next) => {
    try {
      // req.user comes from JWT middleware
      const userId = req.user.userId;

      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Get user's role with populated permissions
      const role = await Role.findOne({
        _id: user.roleId,
        status: "active"
      }).populate("permissions");

      if (!role) {
        return res.status(403).json({ message: "Role not found or inactive" });
      }

      // Aggregate permissions from role
      const aggregatedPermissionsMap = new Map();

      role.permissions.forEach((permission) => {
        const modName = permission.moduleName;
        const actionName = permission.action;
        
        if (aggregatedPermissionsMap.has(modName)) {
          const existing = aggregatedPermissionsMap.get(modName);
          if (!existing.actions.includes(actionName)) {
            existing.actions.push(actionName);
          }
        } else {
          aggregatedPermissionsMap.set(modName, {
            moduleName: modName,
            actions: [actionName],
          });
        }
      });

      // Convert map to array
      const userPermissions = Array.from(aggregatedPermissionsMap.values());

      // Check if user has the required permission
      if (!hasPermission(userPermissions, moduleName, action)) {
        return res.status(403).json({
          message: `Access denied: No ${action} permission for ${moduleName}`,
        });
      }

      // Attach user permissions to request for later use
      req.userPermissions = userPermissions;
      req.userRole = role;

      next();
    } catch (error) {
      console.error("Permission check error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };
};

// Since you don't need nested permissions, remove checkNestedPermission or keep it simple
const checkNestedPermission = (moduleName, nestedAction) => {
  return checkPermission(moduleName, nestedAction); // Just reuse the same logic
};

// Export both middlewares
module.exports = {
  checkPermission,
  checkNestedPermission,
};