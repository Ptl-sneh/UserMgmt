const Role = require("../models/Role");
const Module = require("../models/Modules");
const mongoose = require("mongoose");

// Get all modules with their permissions
const getPermissionSummary = async (req, res) => {
  try {
    // Get all unique modules and count roles
    const permissionSummary = await Role.aggregate([
      // Step 1: Only get active, non-deleted roles
      {
        $match: {
          isDeleted: false,
          status: "active"
        }
      },
      // Step 2: Lookup to populate permissions
      {
        $lookup: {
          from: "modules", // Collection name (lowercase, pluralized)
          localField: "permissions",
          foreignField: "_id",
          as: "permissionDetails"
        }
      },
      // Step 3: Flatten the permissions array
      {
        $unwind: "$permissionDetails"
      },
      // Step 4: Group by module name
      {
        $group: {
          _id: "$permissionDetails.moduleName",
          totalRoles: { $sum: 1 },
          roles: { $push: "$roleName" }
        }
      },
      // Step 5: Clean up the output format
      {
        $project: {
          moduleName: "$_id",
          totalRoles: 1,
          roles: 1,
          _id: 0
        }
      },
      // Step 6: Sort alphabetically
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
    console.error("Permission summary error:", error);
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
      // Step 1: Find roles that have permissions
      {
        $match: {
          isDeleted: false
        }
      },
      // Step 2: Lookup permissions
      {
        $lookup: {
          from: "modules",
          localField: "permissions",
          foreignField: "_id",
          as: "permissionDetails"
        }
      },
      // Step 3: Filter for specific module
      {
        $addFields: {
          modulePermission: {
            $filter: {
              input: "$permissionDetails",
              as: "perm",
              cond: { $eq: ["$$perm.moduleName", moduleName] }
            }
          }
        }
      },
      // Step 4: Only keep roles that have this module
      {
        $match: {
          "modulePermission.0": { $exists: true }
        }
      },
      // Step 5: Flatten
      {
        $unwind: "$modulePermission"
      },
      // Step 6: Format the response
      {
        $project: {
          roleName: "$roleName",
          action: "$modulePermission.action",
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

// Check which users have a specific permission
const getUsersWithPermission = async (req, res) => {
  try {
    const { moduleName, action } = req.query;
    
    // 1. Find modules that match
    const modules = await Module.find({
      moduleName: moduleName,
      action: action,
    }).select("_id");
    
    if (modules.length === 0) {
      return res.json({
        success: true,
        moduleName,
        action,
        roles: [],
        users: [],
        totalUsers: 0
      });
    }
    
    const moduleIds = modules.map(m => m._id);
    
    // 2. Find roles that have these modules
    const rolesWithPermission = await Role.find({
      isDeleted: false,
      status: "active",
      permissions: { $in: moduleIds }
    }).select("_id roleName");
    
    const roleIds = rolesWithPermission.map(role => role._id);
    
    // 3. Find users who have these roles
    const User = require("../models/User");
    const users = await User.find({
      isDeleted: false,
      status: "active",
      roleId: { $in: roleIds }
    }).select("userName email status");
    
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
  getPermissionSummary,
  getModulePermissions,
  getUsersWithPermission
};