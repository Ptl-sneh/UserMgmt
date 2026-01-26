const mongoose = require("mongoose");
const Role = require("../models/Role");
const Module = require("../models/Modules");

/* ---------------- CREATE ROLE ---------------- */

const createRole = async (req, res) => {
  try {
    const { name, permissions = [], status = "Active" } = req.body;

    if (!name) {
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
    const count = await Module.countDocuments({ _id: { $in: permissions } });
    if (count !== permissions.length) {
      return res.status(400).json({ message: "One or more permissions not found" });
    }

    const existingRole = await Role.findOne({ name, isDeleted: false });
    if (existingRole) {
      return res.status(400).json({ message: "Role already exists" });
    }

    const role = await Role.create({
      name,
      permissions,
      status,
    });

    return res.status(201).json(role);
  } catch (error) {
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
      name: { $regex: search, $options: "i" },
    };

    const roles = await Role.find(query)
      .populate("permissions", "moduleName actions")
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
    return res.status(500).json({ message: "Server error" });
  }
};

/* ---------------- GET ROLE BY ID ---------------- */

const getRoleById = async (req, res) => {
  try {
    const role = await Role.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).populate("permissions", "moduleName actions");

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    return res.json(role);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

/* ---------------- UPDATE ROLE ---------------- */

const updateRole = async (req, res) => {
  try {
    const { name, permissions, status } = req.body;

    const role = await Role.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    if (permissions !== undefined) {
      if (!Array.isArray(permissions)) {
        return res.status(400).json({ message: "Permissions must be an array" });
      }

      const invalidIds = permissions.filter(
        id => !mongoose.Types.ObjectId.isValid(id)
      );

      if (invalidIds.length > 0) {
        return res.status(400).json({ message: "Invalid permission id provided" });
      }

      const count = await Module.countDocuments({ _id: { $in: permissions } });
      if (count !== permissions.length) {
        return res.status(400).json({ message: "One or more permissions not found" });
      }

      role.permissions = permissions;
    }

    if (name) role.name = name;
    if (status) role.status = status;

    await role.save();
    return res.json(role);
  } catch (error) {
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
    role.status = "Inactive";

    await role.save();
    return res.json({ message: "Role deleted successfully" });
  } catch (error) {
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
