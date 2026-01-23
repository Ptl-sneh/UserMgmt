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
const { checkPermission, checkNestedPermission } = require("../middlewares/permissionMiddleware");

// USER MANAGEMENT ROUTES

// Create user - requires create permission on UserManagement module
router.post("/", protect, checkPermission("UserManagement", "create"), createUser);

// Get all users - requires read permission on UserManagement module
router.get("/", protect, checkPermission("UserManagement", "read"), getUsers);

// Export users CSV - requires export nested permission on UserManagement module
router.get("/export", protect, checkNestedPermission("UserManagement", "export"), exportUsers);

// Get user by ID - requires read permission on UserManagement module
router.get("/:id", protect, checkPermission("UserManagement", "read"), getUserById);

// Update user - requires update permission on UserManagement module
router.put("/:id", protect, checkPermission("UserManagement", "update"), updateUser);

// Delete user - requires delete permission on UserManagement module
router.delete("/:id", protect, checkPermission("UserManagement", "delete"), deleteUser);

// Additional nested permission routes can be added as needed
// Example: Bulk delete route (would require "bulk_delete" nested permission)
router.post("/bulk-delete", protect, checkNestedPermission("UserManagement", "bulk_delete"), (req, res) => {
  // Controller function for bulk delete would go here
  res.json({ message: "Bulk delete functionality will be implemented here" });
});

module.exports = router;