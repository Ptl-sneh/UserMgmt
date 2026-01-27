const Role = require("../models/Role");
const Module = require("../models/Modules");
const User = require("../models/User");

/**
 * Get summary of permissions across all roles
 */
const getPermissionSummary = async (req, res) => {
  try {
    const permissionSummary = await Role.aggregate([
      // 1. Only active, non-deleted roles
      {
        $match: {
          isDeleted: false,
          status: "Active",
        },
      },

      // 2. Resolve module permissions
      {
        $lookup: {
          from: "modules",
          localField: "permissions",
          foreignField: "_id",
          as: "permissionDetails",
        },
      },

      // 3. Flatten permissions
      { $unwind: "$permissionDetails" },

      // 4. Only active modules
      {
        $match: {
          "permissionDetails.isActive": true,
        },
      },

      // 5. Group by module name
      {
        $group: {
          _id: "$permissionDetails.moduleName",
          totalRoles: { $addToSet: "$_id" },
          roles: { $addToSet: "$name" },
        },
      },

      // 6. Final shape
      {
        $project: {
          _id: 0,
          moduleName: "$_id",
          totalRoles: { $size: "$totalRoles" },
          roles: 1,
        },
      },

      // 7. Sort alphabetically
      { $sort: { moduleName: 1 } },
    ]);

    res.json({
      success: true,
      message: "Permission summary fetched successfully",
      data: permissionSummary,
    });
  } catch (error) {
    console.error("Permission summary error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get permissions for a specific module
 */
const getModulePermissions = async (req, res) => {
  try {
    const { moduleName } = req.params;

    const moduleData = await Role.aggregate([
      // 1. Only active roles
      {
        $match: {
          isDeleted: false,
          status: "Active",
        },
      },

      // 2. Resolve permissions
      {
        $lookup: {
          from: "modules",
          localField: "permissions",
          foreignField: "_id",
          as: "permissionDetails",
        },
      },

      // 3. Keep only requested module
      {
        $addFields: {
          modulePermission: {
            $filter: {
              input: "$permissionDetails",
              as: "perm",
              cond: {
                $and: [
                  { $eq: ["$$perm.moduleName", moduleName] },
                  { $eq: ["$$perm.isActive", true] },
                ],
              },
            },
          },
        },
      },

      // 4. Remove roles without this module
      {
        $match: {
          "modulePermission.0": { $exists: true },
        },
      },

      // 5. Flatten
      { $unwind: "$modulePermission" },

      // 6. Output format
      {
        $project: {
          _id: 0,
          roleName: "$name",
          action: "$modulePermission.actions",
        },
      },
    ]);

    res.json({
      success: true,
      moduleName,
      data: moduleData,
    });
  } catch (error) {
    console.error("Module permissions error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Get users who have a specific module-action permission
 */
const getUsersWithPermission = async (req, res) => {
  try {
    const { moduleName, action } = req.query;

    // 1. Find matching module-action documents
    const modules = await Module.find({
      moduleName,
      actions: action,
      isActive: true,
    }).select("_id");

    if (!modules.length) {
      return res.json({
        success: true,
        moduleName,
        action,
        roles: [],
        users: [],
        totalUsers: 0,
      });
    }

    const moduleIds = modules.map((m) => m._id);

    // 2. Find roles that grant this permission
    const roles = await Role.find({
      isDeleted: false,
      status: "Active",
      permissions: { $in: moduleIds },
    }).select("_id name");

    if (!roles.length) {
      return res.json({
        success: true,
        moduleName,
        action,
        roles: [],
        users: [],
        totalUsers: 0,
      });
    }

    const roleIds = roles.map((r) => r._id);

    // 3. Find users with these roles
    const users = await User.find({
      isDeleted: false,
      status: "Active",
      roles: { $in: roleIds },
    }).select("name email status");

    res.json({
      success: true,
      moduleName,
      action,
      roles,
      users,
      totalUsers: users.length,
    });
  } catch (error) {
    console.error("Users with permission error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getPermissionSummary,
  getModulePermissions,
  getUsersWithPermission,
};
