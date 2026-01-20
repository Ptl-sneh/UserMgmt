const Role = require("../models/Role");

// CREATE ROLE
const createRole = async (req, res) => {
  try {
    const { name, permissions, status } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Role name is required" });
    }

    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({ message: "Role already exists" });
    }

    const role = await Role.create({
      name,
      permissions: permissions || [],
      status: status || "Active",
    });

    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL ROLES
const getRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ createdAt: -1 });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET ROLE BY ID
const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE ROLE
const updateRole = async (req, res) => {
  try {
    const { name, permissions, status } = req.body;

    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    role.name = name || role.name;
    role.permissions = permissions || role.permissions;
    role.status = status || role.status;

    await role.save();
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE ROLE
const deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    await role.deleteOne();
    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
};
