const express = require("express");
const router = express.Router();

const {
  getPermissionSummary,
  getModulePermissions,
  getUsersWithPermission
} = require("../controllers/permissionController");

const protect = require("../middlewares/authMiddleware");
const { checkPermission } = require("../middlewares/permissionMiddleware");

// PERMISSION ROUTES (Simple)

// Get summary of all modules (uses simple aggregation)
router.get("/summary", protect, checkPermission("PermissionManagement", "read"), getPermissionSummary);

// Get details for one module (uses simple aggregation)
router.get("/module/:moduleName", protect, checkPermission("PermissionManagement", "read"), getModulePermissions);

// Check which users have a specific permission (NO aggregation - simple)
router.get("/users", protect, checkPermission("PermissionManagement", "read"), getUsersWithPermission);

module.exports = router;