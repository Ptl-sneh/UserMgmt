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

      // Use aggregation to get user permissions
      const userPermissionsResult = await User.aggregate([
        { $match: { _id: userId } },
        
        // Lookup roles
        {
          $lookup: {
            from: "roles",
            localField: "roles",
            foreignField: "_id",
            as: "userRoles"
          }
        },
        
        // Filter active roles
        {
          $unwind: {
            path: "$userRoles",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $match: {
            "userRoles.status": "Active",
            "userRoles.isDeleted": false
          }
        },
        
        // Lookup permissions (modules) for each role
        {
          $lookup: {
            from: "modules",
            localField: "userRoles.permissions",
            foreignField: "_id",
            as: "rolePermissions"
          }
        },
        
        // Unwind permissions
        { $unwind: "$rolePermissions" },
        
        // Group by moduleName and collect unique actions
        {
          $group: {
            _id: "$rolePermissions.moduleName",
            actions: { $addToSet: "$rolePermissions.actions" },
            roleNames: { $addToSet: "$userRoles.name" }
          }
        },
        
        // Project to final format
        {
          $project: {
            _id: 0,
            moduleName: "$_id",
            actions: 1
          }
        }
      ]);

      if (userPermissionsResult.length === 0) {
        return res.status(403).json({ message: "No active roles found for user" });
      }

      // Convert to array format
      const userPermissions = userPermissionsResult.map(item => ({
        moduleName: item.moduleName,
        actions: item.actions
      }));

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

// Export middleware
module.exports = {
  checkPermission,
};