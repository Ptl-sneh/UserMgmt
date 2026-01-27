const User = require("../models/User");
const Role = require("../models/Role");
const Module = require("../models/Modules");

/**
 * Get user permissions based on roles and modules
 */
const getUserPermissions = async (userId) => {
  try {
    const user = await User.findById(userId).select("roles");
    if (!user || !user.roles?.length) return [];

    const roles = await Role.find({
      _id: { $in: user.roles },
      status: "Active",
      isDeleted: false,
    }).select("permissions");

    if (!roles.length) return [];

    const permissionIds = [
      ...new Set(
        roles.flatMap((role) => role.permissions || []).map((id) => id.toString())
      ),
    ];

    if (!permissionIds.length) return [];

    const modules = await Module.find({
      _id: { $in: permissionIds },
      isActive: true,
    }).select("moduleName actions");

    const permissionMap = new Map();

    for (const mod of modules) {
      if (!permissionMap.has(mod.moduleName)) {
        permissionMap.set(mod.moduleName, new Set());
      }
      permissionMap.get(mod.moduleName).add(mod.actions);
    }

    return Array.from(permissionMap.entries()).map(
      ([moduleName, actions]) => ({
        moduleName,
        actions: Array.from(actions),
      })
    );
  } catch (error) {
    console.error("Error getting user permissions:", error);
    return [];
  }
};

/**
 * Middleware to check module-action permission
 * checks the user has the module 
 * module include the action or not
 */
const checkPermission = (moduleName, action) => {
  return async (req, res, next) => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const userPermissions = await getUserPermissions(req.user.userId);

      const allowed = userPermissions.some(
        (perm) =>
          perm.moduleName === moduleName &&
          perm.actions?.includes(action)
      );

      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: `Access denied. You don't have ${action} permission for ${moduleName} module.`,
          requiredPermission: { module: moduleName, action },
        });
      }

      req.userPermissions = userPermissions;
      next();
    } catch (error) {
      console.error("Permission middleware error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error during permission verification",
      });
    }
  };
};

module.exports = {
  checkPermission,
  getUserPermissions,
};
