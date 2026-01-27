const express = require("express");
const router = express.Router();

const {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
} = require("../controllers/roleController");

const protect = require("../middlewares/authMiddleware");
const { checkPermission } = require("../middlewares/permissionMiddleware");

// ROLE MANAGEMENT ROUTES

// Create role - requires create permission on RoleManagement module
router.post("/", protect, checkPermission("RoleManagement", "create"), createRole);

// Get all roles - requires read permission on RoleManagement module
router.get("/", protect, checkPermission("RoleManagement", "read"), getRoles);

// Get role by ID - requires read permission on RoleManagement module
router.get("/:id", protect, checkPermission("RoleManagement", "read"), getRoleById);

// Update role - requires update permission on RoleManagement module
router.put("/:id", protect, checkPermission("RoleManagement", "update"), updateRole);

// Delete role - requires delete permission on RoleManagement module
router.delete("/:id", protect, checkPermission("RoleManagement", "delete"), deleteRole);

module.exports = router;