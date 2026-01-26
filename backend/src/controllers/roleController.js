const mongoose = require("mongoose");
const Role = require("../models/Role");
const Module = require("../models/Modules");

/* ---------------- CREATE ROLE ---------------- */

const createRole = async (req, res) => {
  try {
    const { roleName, permissions = [], status = "active" } = req.body;

    if (!roleName) {
      return res.status(400).json({ message: "Role name is required" });
    }

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ message: "Permissions must be an array" });
    }

    // Validate ObjectIds
    const invalidIds = permissions.filter(
      id => !mongoose.Types.ObjectId.isValid(id)
    );

    if (invalidIds.length > 0) {
      return res.status(400).json({ message: "Invalid permission id provided" });
    }

    // Validate permissions exist
    const count = await Module.countDocuments({ 
      _id: { $in: permissions }
    });
    
    if (count !== permissions.length) {
      return res.status(400).json({ 
        message: "One or more permissions not found" 
      });
    }

    // Check if role already exists
    const existingRole = await Role.findOne({ roleName, isDeleted: false });
    if (existingRole) {
      return res.status(400).json({ message: "Role already exists" });
    }

    // Create role with Module ObjectId references
    const role = await Role.create({
      roleName,
      permissions, // Array of Module ObjectIds
      status: status.toLowerCase(),
    });

    // Populate and return
    const populatedRole = await Role.findById(role._id)
      .populate("permissions", "moduleName action");

    return res.status(201).json(populatedRole);
  } catch (error) {
    console.error("Create role error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ---------------- GET ROLES ---------------- */

const getRoles = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;

    const query = {
      isDeleted: false,
      roleName: { $regex: search, $options: "i" },
    };

    // Get roles and populate Module references
    const roles = await Role.find(query)
      .populate({
        path: "permissions",
        select: "moduleName action",
      })
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit);

    const total = await Role.countDocuments(query);

    return res.json({
      roles,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get roles error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ---------------- GET ROLE BY ID ---------------- */

const getRoleById = async (req, res) => {
  try {
    const role = await Role.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).populate({
      path: "permissions",
      select: "moduleName action"
    });

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    return res.json(role);
  } catch (error) {
    console.error("Get role by ID error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ---------------- UPDATE ROLE ---------------- */

const updateRole = async (req, res) => {
  try {
    const { roleName, permissions, status } = req.body;

    const role = await Role.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Update permissions if provided
    if (permissions !== undefined) {
      if (!Array.isArray(permissions)) {
        return res.status(400).json({ message: "Permissions must be an array" });
      }

      // Validate ObjectIds
      const invalidIds = permissions.filter(
        id => !mongoose.Types.ObjectId.isValid(id)
      );

      if (invalidIds.length > 0) {
        return res.status(400).json({ message: "Invalid permission id provided" });
      }

      // Validate permissions exist
      const count = await Module.countDocuments({ 
        _id: { $in: permissions }
      });
      
      if (count !== permissions.length) {
        return res.status(400).json({ 
          message: "One or more permissions not found" 
        });
      }

      role.permissions = permissions;
    }

    if (roleName) role.roleName = roleName;
    if (status) role.status = status.toLowerCase();

    await role.save();

    // Populate and return updated role
    const updatedRole = await Role.findById(role._id)
      .populate("permissions", "moduleName action");

    return res.json(updatedRole);
  } catch (error) {
    console.error("Update role error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ---------------- DELETE ROLE ---------------- */

const deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role || role.isDeleted) {
      return res.status(404).json({ message: "Role not found" });
    }

    role.isDeleted = true;
    role.deletedAt = new Date();
    role.status = "inactive";

    await role.save();
    return res.json({ message: "Role deleted successfully" });
  } catch (error) {
    console.error("Delete role error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
};