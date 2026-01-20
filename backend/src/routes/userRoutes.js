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
const checkPermission = require("../middlewares/permissionMiddleware");

// USER MANAGEMENT ROUTES
router.post("/", protect, checkPermission("USER_CREATE"), createUser);
router.get("/", protect, checkPermission("USER_VIEW"), getUsers);
router.get("/export", protect, checkPermission("USER_EXPORT"), exportUsers);
router.get("/:id", protect, checkPermission("USER_VIEW"), getUserById);
router.put("/:id", protect, checkPermission("USER_EDIT"), updateUser);
router.delete("/:id", protect, checkPermission("USER_DELETE"), deleteUser);

module.exports = router;
