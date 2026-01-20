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
const checkPermission = require("../middlewares/permissionMiddleware");

// ROLE MANAGEMENT (ADMIN ONLY)
router.post("/", protect, checkPermission("ROLE_CREATE"), createRole);
router.get("/", protect, checkPermission("ROLE_VIEW"), getRoles);
router.get("/:id", protect, checkPermission("ROLE_VIEW"), getRoleById);
router.put("/:id", protect, checkPermission("ROLE_EDIT"), updateRole);
router.delete("/:id", protect, checkPermission("ROLE_DELETE"), deleteRole);

module.exports = router;
