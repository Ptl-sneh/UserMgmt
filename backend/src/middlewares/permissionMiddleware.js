const User = require("../models/User");
const Role = require("../models/Role");
const Module = require("../models/Modules");

// Helper function to check if user has permission for a specific action
const hasPermission = (userPermissions, moduleName, action) => {
  // Find the module in user's permissions
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }
  
  const modulePermission = userPermissions.find(
    (perm) => perm.moduleName === moduleName
  );

  if (!modulePermission) {
    return false;
  }

  // Check if user has the required action
  return modulePermission.actions && 
         modulePermission.actions.includes(action);
};

// Get user permissions (reusable function)
const getUserPermissions = async (userId) => {
  try {
    // Find user with roles
    const user = await User.findById(userId);
    
    if (!user || !user.roles || user.roles.length === 0) {
      return [];
    }

    // Get active roles for this user
    const roles = await Role.find({
      _id: { $in: user.roles },
      status: "Active",
      isDeleted: false
    });

    if (roles.length === 0) {
      return [];
    }

    // Collect all permission IDs from all roles
    const permissionIds = [];
    roles.forEach(role => {
      if (role.permissions && Array.isArray(role.permissions)) {
        permissionIds.push(...role.permissions);
      }
    });

    // Remove duplicates
    const uniquePermissionIds = [...new Set(permissionIds.map(id => id.toString()))];

    if (uniquePermissionIds.length === 0) {
      return [];
    }

    // Get all modules for these permission IDs
    const modules = await Module.find({
      _id: { $in: uniquePermissionIds },
      isActive: true
    });

    // Group by moduleName and collect actions
    const moduleMap = new Map();
    
    modules.forEach(module => {
      if (!moduleMap.has(module.moduleName)) {
        moduleMap.set(module.moduleName, new Set());
      }
      if (module.actions) {
        moduleMap.get(module.moduleName).add(module.actions);
      }
    });

    // Convert to array format
    const userPermissions = Array.from(moduleMap.entries()).map(([moduleName, actionsSet]) => ({
      moduleName,
      actions: Array.from(actionsSet)
    }));

    return userPermissions;
  } catch (error) {
    console.error("Error getting user permissions:", error);
    return [];
  }
};

// Middleware factory for checking permissions
const checkPermission = (moduleName, action) => {
  return async (req, res, next) => {
    try {
      // Debug: Log incoming request
      console.log(`Checking permission for ${moduleName} - ${action}`);
      
      // req.user comes from JWT middleware
      if (!req.user || !req.user.userId) {
        console.log("No user in request");
        return res.status(401).json({ message: "User not authenticated" });
      }

      const userId = req.user.userId;
      console.log(`User ID: ${userId}`);

      // Get user permissions
      const userPermissions = await getUserPermissions(userId);
      console.log(`User permissions found: ${userPermissions.length}`);

      // Debug: Log all permissions
      console.log("All user permissions:", JSON.stringify(userPermissions, null, 2));

      // Check if user has the required permission
      const hasAccess = hasPermission(userPermissions, moduleName, action);
      console.log(`Has ${action} permission for ${moduleName}: ${hasAccess}`);

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: `Access denied. You don't have ${action} permission for ${moduleName} module.`,
          requiredPermission: {
            module: moduleName,
            action: action
          },
          yourPermissions: userPermissions // For debugging
        });
      }

      // Attach permissions to request object for any downstream use
      req.userPermissions = userPermissions;
      
      next();
    } catch (error) {
      console.error("Permission middleware error:", error);
      return res.status(500).json({ 
        success: false,
        message: "Server error during permission verification"
      });
    }
  };
};

// Export middleware
module.exports = {
  checkPermission,
  getUserPermissions
};