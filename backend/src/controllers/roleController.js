const Role = require("../models/Role");

const validatePermissions = (permissions = []) => {
  if (!Array.isArray(permissions)) return false;

  for (const perm of permissions) {
    if (!perm.module || typeof perm.module !== "string") return false;
    if (perm.actions && !Array.isArray(perm.actions)) return false;
    if (perm.extras && !Array.isArray(perm.extras)) return false;
  }

  return true;
};


// CREATE ROLE

const createRole = async (req, res) => {
  try {
    const { name, permissions, status } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Role name is required" });
    }

    if (permissions && !validatePermissions(permissions)) {
      return res.status(400).json({
        message: "Invalid permission structure",
      });
    }

    const existingRole = await Role.findOne({
      name,
      isDeleted: false,
    });

    if (existingRole) {
      return res.status(400).json({ message: "Role already exists" });
    }

    const role = await Role.create({
      name: name.trim(),
      permissions: permissions || [],
      status: status || "Active",
    });

    res.status(201).json(role);
  } catch (error) {
    console.error("Create role error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ROLES (Pagination + Search)

const getRoles = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    const query = {
      isDeleted: false,
      name: { $regex: search, $options: "i" },
    };

    const roles = await Role.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Role.countDocuments(query);

    res.json({
      roles,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get roles error:", error);
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
    console.error("Get role error:", error);
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

    if (permissions && !validatePermissions(permissions)) {
      return res.status(400).json({
        message: "Invalid permission structure",
      });
    }

    if (name) role.name = name.trim();
    if (permissions) role.permissions = permissions;
    if (status) role.status = status;

    await role.save();

    res.json(role);
  } catch (error) {
    console.error("Update role error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// DELETE ROLE (Soft delete)

const deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role || role.isDeleted) {
      return res.status(404).json({ message: "Role not found" });
    }

    role.isDeleted = true;
    role.status = "Inactive";
    role.deletedAt = new Date();

    await role.save();

    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    console.error("Delete role error:", error);
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
