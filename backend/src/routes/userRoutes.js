const express = require("express");
const router = express.Router();

const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  exportUsers,
} = require("../controllers/userController");

const protect = require("../middlewares/authMiddleware");
const { checkPermission } = require("../middlewares/permissionMiddleware");

// Create user - requires create permission on UserManagement module
router.post("/", protect, checkPermission("UserManagement", "create"), createUser);

// Get all users - requires read permission on UserManagement module
router.get("/", protect, checkPermission("UserManagement", "read"), getUsers);

// Export users CSV - requires Export CSV action on UserManagement module
router.get("/export", protect, checkPermission("UserManagement", "Export CSV"), exportUsers);

// Get user by ID - requires read permission on UserManagement module
router.get("/:id", protect, checkPermission("UserManagement", "read"), getUserById);

// Update user - requires update permission on UserManagement module
router.put("/:id", protect, checkPermission("UserManagement", "update"), updateUser);

// Delete user - requires delete permission on UserManagement module
router.delete("/:id", protect, checkPermission("UserManagement", "delete"), deleteUser);

module.exports = router;