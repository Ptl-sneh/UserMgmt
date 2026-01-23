const Role = require("../models/Role");
const mongoose = require("mongoose");

// Get all modules with their permissions
const getPermissionSummary = async (req, res) => {
  try {
    // get all unique modules and count roles
    const permissionSummary = await Role.aggregate([
      // Step 1: Only get active, non-deleted roles
      {
        $match: {
          isDeleted: false,
          status: "Active"
        }
      },
      // Step 2: Flatten the permissions array (make each permission its own document)
      {
        $unwind: "$permissions"
      },
      // Step 3: Group by module name
      {
        $group: {
          _id: "$permissions.moduleName", // Group by module name
          totalRoles: { $sum: 1 }, // Count how many roles have this module
          roles: { $push: "$name" } // List which roles have this module
        }
      },
      // Step 4: Clean up the output format
      {
        $project: {
          moduleName: "$_id",
          totalRoles: 1,
          roles: 1,
          _id: 0
        }
      },
      // Step 5: Sort alphabetically
      {
        $sort: { moduleName: 1 }
      }
    ]);

    res.json({
      success: true,
      message: "Permission summary fetched successfully",
      data: permissionSummary
    });
  } catch (error) {
    console.error("Simple permission summary error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// Get permissions for one specific module
const getModulePermissions = async (req, res) => {
  try {
    const { moduleName } = req.params;
    
    const moduleData = await Role.aggregate([
      // Step 1: Find roles that have this module
      {
        $match: {
          isDeleted: false,
          "permissions.moduleName": moduleName
        }
      },
      // Step 2: Keep only the permission for this module
      {
        $addFields: {
          modulePermission: {
            $filter: {
              input: "$permissions",
              as: "perm",
              cond: { $eq: ["$$perm.moduleName", moduleName] }
            }
          }
        }
      },
      // Step 3: Flatten to get one document per role
      {
        $unwind: "$modulePermission"
      },
      // Step 4: Format the response
      {
        $project: {
          roleName: "$name",
          actions: "$modulePermission.actions",
          nestedPermissions: "$modulePermission.nestedPermissions"
        }
      }
    ]);

    res.json({
      success: true,
      moduleName,
      data: moduleData
    });
  } catch (error) {
    console.error("Module permissions error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// SIMPLE: Check which users have a specific permission
const getUsersWithPermission = async (req, res) => {
  try {
    const { moduleName, action } = req.query;
    
    // Simple way without complex aggregation
    // Just find roles and then find users with those roles
    
    // 1. Find roles that have this permission
    const rolesWithPermission = await Role.find({
      isDeleted: false,
      status: "Active",
      permissions: {
        $elemMatch: {
          moduleName: moduleName,
          actions: action
        }
      }
    }).select("_id name");
    
    const roleIds = rolesWithPermission.map(role => role._id);
    
    // 2. Find users who have these roles
    const User = require("../models/User");
    const users = await User.find({
      isDeleted: false,
      status: "Active",
      roles: { $in: roleIds }
    }).select("name email roles status");
    
    res.json({
      success: true,
      moduleName,
      action,
      roles: rolesWithPermission,
      users: users,
      totalUsers: users.length
    });
  } catch (error) {
    console.error("Users with permission error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

module.exports = {
  getPermissionSummary,  // Simple aggregation
  getModulePermissions,  // Simple aggregation  
  getUsersWithPermission // No aggregation - simple queries
};