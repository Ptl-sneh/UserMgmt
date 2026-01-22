const Role = require("../models/Role");

// CREATE ROLE
const createRole = async (req, res) => {
  try {
    const { name, permissions, status } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Role name is required" });
    }

    const existingRole = await Role.findOne({
      name,
      isDeleted: false,
    });

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

// GET ALL ROLES (Pagination + Search + Sorting)
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
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit);

    const total = await Role.countDocuments(query);

    res.json({
      roles,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET ROLE BY ID
const getRoleById = async (req, res) => {
  try {
    const role = await Role.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

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

    const role = await Role.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

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

    if (!role || role.isDeleted) {
      return res.status(404).json({ message: "Role not found" });
    }

    role.isDeleted = true;
    role.deletedAt = new Date();
    role.status = "Inactive";

    await role.save();

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